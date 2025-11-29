import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, Image } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import Sidebar from '@/components/Sidebar';
import MessageBubble from '@/components/chat/MessageBubble';
import VisualCard from '@/components/chat/VisualCard';
import FormatSelector from '@/components/chat/FormatSelector';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";

export default function Home() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(null);
  const [settings, setSettings] = useState({});
  const [messages, setMessages] = useState([]);
  const [visuals, setVisuals] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedVisual, setSelectedVisual] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Load app settings
        const appSettings = await base44.entities.AppSettings.list();
        const settingsMap = {};
        appSettings.forEach(s => { settingsMap[s.key] = s.value; });
        setSettings(settingsMap);

        const auth = await base44.auth.isAuthenticated();
        setIsAuthenticated(auth);
        
        if (auth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          
          const [userCredits, userVisuals, userConversations] = await Promise.all([
            base44.entities.UserCredits.filter({ user_email: currentUser.email }),
            base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 50),
            base44.entities.Conversation.filter({ user_email: currentUser.email }, '-updated_date', 20)
          ]);

          if (userCredits.length === 0) {
            const newCredits = await base44.entities.UserCredits.create({
              user_email: currentUser.email,
              free_downloads: 5,
              paid_credits: 0,
              subscription_type: 'free'
            });
            setCredits(newCredits);
          } else {
            setCredits(userCredits[0]);
          }

          setVisuals(userVisuals);
          setConversations(userConversations);

          setMessages([{
            role: 'assistant',
            content: `${t('welcomeUser', { name: currentUser.full_name || '' })}\n\n${t('assistantIntro')}`
          }]);
        } else {
          setMessages([{
            role: 'assistant',
            content: `${t('welcome')}\n\n${t('guestIntro')}`
          }]);
        }
      } catch (e) {
        setMessages([{
          role: 'assistant',
          content: `${t('welcome')}\n\n${t('guestIntro')}`
        }]);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getTotalCredits = () => {
    if (!credits) return 0;
    if (credits.subscription_type === 'unlimited') return Infinity;
    return (credits.free_downloads || 0) + (credits.paid_credits || 0);
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    setMessages([{
      role: 'assistant',
      content: t('newConversation')
    }]);
    setSelectedVisual(null);
  };

  const handleSelectConversation = (conv) => {
    setCurrentConversation(conv);
    setMessages(conv.messages || []);
    setSelectedVisual(null);
  };

  const handleDeleteConversation = async (convId) => {
    await base44.entities.Conversation.delete(convId);
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (currentConversation?.id === convId) {
      handleNewChat();
    }
  };

  const saveConversation = async (newMessages) => {
    if (!user) return;
    
    const title = newMessages.find(m => m.role === 'user')?.content?.slice(0, 40) || 'Conversation';
    
    if (currentConversation) {
      await base44.entities.Conversation.update(currentConversation.id, { messages: newMessages });
      setConversations(prev => prev.map(c => c.id === currentConversation.id ? { ...c, messages: newMessages } : c));
    } else {
      const newConv = await base44.entities.Conversation.create({
        user_email: user.email,
        title,
        messages: newMessages
      });
      setCurrentConversation(newConv);
      setConversations(prev => [newConv, ...prev]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    let fullPrompt = userMessage;
    
    if (selectedFormat) {
      fullPrompt += `\n\nFormat demandé: ${selectedFormat.name} (${selectedFormat.dimensions})`;
    }

    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    setShowFormatSelector(false);

    try {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es VisualGPT, un assistant expert en création de visuels.
        
L'utilisateur demande: "${fullPrompt}"

Analyse cette demande et réponds en JSON avec:
- needs_image: boolean (true si l'utilisateur veut qu'on génère une image)
- response: string (ta réponse à l'utilisateur, en français, amicale et professionnelle, courte)
- image_prompt: string (si needs_image=true, le prompt détaillé en anglais pour générer l'image, très descriptif avec style, couleurs, composition)
- visual_type: string (logo, carte_visite, flyer, post_instagram, story_instagram, post_facebook, post_linkedin, affiche, banner, autre)
- dimensions: string (dimensions suggérées)
- title: string (titre court pour le visuel)

Si l'utilisateur pose une question ou demande des précisions, réponds sans générer d'image.`,
        response_json_schema: {
          type: 'object',
          properties: {
            needs_image: { type: 'boolean' },
            response: { type: 'string' },
            image_prompt: { type: 'string' },
            visual_type: { type: 'string' },
            dimensions: { type: 'string' },
            title: { type: 'string' }
          }
        }
      });

      let updatedMessages = [...newMessages, { role: 'assistant', content: analysis.response }];
      setMessages(updatedMessages);

      if (analysis.needs_image && analysis.image_prompt) {
        setIsGenerating(true);
        updatedMessages = [...updatedMessages, { role: 'assistant', content: t('generating') }];
        setMessages(updatedMessages);

        const imageResult = await base44.integrations.Core.GenerateImage({
          prompt: analysis.image_prompt
        });

        let newVisual = {
          title: analysis.title || 'Visuel',
          image_url: imageResult.url,
          visual_type: analysis.visual_type || 'autre',
          dimensions: analysis.dimensions || selectedFormat?.dimensions || '1080x1080',
          format: selectedFormat?.id?.includes('post') || selectedFormat?.id?.includes('story') || selectedFormat?.id?.includes('banner') ? 'digital' : 'print'
        };

        if (user) {
          newVisual = await base44.entities.Visual.create({
            user_email: user.email,
            ...newVisual
          });
        }

        setVisuals(prev => [newVisual, ...prev]);
        setSelectedVisual(newVisual);
        
        updatedMessages = updatedMessages.slice(0, -1);
        updatedMessages.push({
          role: 'assistant',
          content: `✨ **${analysis.title}** ${t('ready')}${!isAuthenticated ? `\n\n*${t('connectToDownload')}*` : ''}`
        });
        setMessages(updatedMessages);
        setIsGenerating(false);
      }

      await saveConversation(updatedMessages);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: t('error') }]);
    }

    setIsLoading(false);
    setSelectedFormat(null);
  };

  const handleRegenerate = async (visual) => {
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Regenerate a ${visual.visual_type} with similar style but variations. High quality, professional.`
      });

      let newVisual = {
        title: visual.title + ' (v2)',
        image_url: result.url,
        visual_type: visual.visual_type,
        dimensions: visual.dimensions,
        format: visual.format
      };

      if (user) {
        newVisual = await base44.entities.Visual.create({ user_email: user.email, ...newVisual });
      }

      setVisuals(prev => [newVisual, ...prev]);
      setSelectedVisual(newVisual);
      setMessages(prev => [...prev, { role: 'assistant', content: t('newVersion') }]);
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const handleDownload = async (visual) => {
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(createPageUrl('Home'));
      return;
    }

    const totalCredits = getTotalCredits();
    if (totalCredits <= 0) {
      window.location.href = createPageUrl('Pricing');
      return;
    }

    if (credits.subscription_type !== 'unlimited') {
      if (credits.free_downloads > 0) {
        await base44.entities.UserCredits.update(credits.id, { free_downloads: credits.free_downloads - 1 });
        setCredits(prev => ({ ...prev, free_downloads: prev.free_downloads - 1 }));
      } else if (credits.paid_credits > 0) {
        await base44.entities.UserCredits.update(credits.id, { paid_credits: credits.paid_credits - 1 });
        setCredits(prev => ({ ...prev, paid_credits: prev.paid_credits - 1 }));
      }
    }

    if (visual.id) {
      await base44.entities.Visual.update(visual.id, { downloaded: true });
    }

    const link = document.createElement('a');
    link.href = visual.image_url;
    link.download = `${visual.title || 'visual'}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader2 className="h-8 w-8 text-violet-400 animate-spin relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        credits={credits}
        conversations={conversations}
        visuals={visuals}
        currentConversationId={currentConversation?.id}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onSelectVisual={setSelectedVisual}
        onLogin={() => base44.auth.redirectToLogin(createPageUrl('Home'))}
        onLogout={() => base44.auth.logout()}
      />
      
      <div className={cn(
        "relative z-10 min-h-screen flex flex-col transition-all duration-300",
        sidebarOpen && "md:ml-64"
      )}>
        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen pt-16">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Hero - only show if few messages */}
              {messages.length <= 1 && (
                <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                  <Logo size="large" />
                  <h1 className="text-xl md:text-2xl text-white/80 font-light mt-6 max-w-xl leading-relaxed">
                    {settings.home_title || t('heroTitle')}
                  </h1>
                  <p className="text-white/50 mt-3 max-w-md text-sm">
                    {settings.home_subtitle || t('heroSubtitle')}
                  </p>
                </div>
              )}
              
              {/* Chat Messages */}
              {messages.map((message, idx) => (
                <MessageBubble key={idx} message={message} isStreaming={isLoading && idx === messages.length - 1} thinkingText={t('thinking')} />
              ))}

              {/* Selected Visual Preview */}
              {selectedVisual && (
                <div className="max-w-sm mx-auto">
                  <VisualCard
                    visual={selectedVisual}
                    onRegenerate={() => handleRegenerate(selectedVisual)}
                    onDownload={() => handleDownload(selectedVisual)}
                    isRegenerating={isGenerating}
                    canDownload={isAuthenticated && getTotalCredits() > 0}
                    hasWatermark={!isAuthenticated || credits?.subscription_type === 'free'}
                  />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Format Selector */}
          {showFormatSelector && (
            <div className="px-4 pb-2 max-w-3xl mx-auto w-full">
              <FormatSelector 
                onSelect={(format) => { setSelectedFormat(format); setShowFormatSelector(false); }}
                selectedFormat={selectedFormat}
              />
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-transparent">
            <div className="max-w-3xl mx-auto">
              {selectedFormat && (
                <div className="mb-2 flex items-center gap-2 text-sm text-violet-300">
                  <span>{selectedFormat.name} ({selectedFormat.dimensions})</span>
                  <button onClick={() => setSelectedFormat(null)} className="text-white/50 hover:text-white">✕</button>
                </div>
              )}
              <div className="flex items-end gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFormatSelector(!showFormatSelector)}
                  className={cn(
                    "text-white/50 hover:text-white hover:bg-white/10 flex-shrink-0",
                    showFormatSelector && "bg-violet-500/20 text-violet-300"
                  )}
                >
                  <Image className="h-5 w-5" />
                </Button>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                  placeholder={t('inputPlaceholder')}
                  className="flex-1 bg-transparent border-0 text-white placeholder:text-white/40 resize-none min-h-[44px] max-h-32 focus-visible:ring-0"
                  disabled={isLoading}
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
              
              {/* Footer */}
              <div className="mt-3 flex items-center justify-center gap-4">
                <p className="text-white/25 text-xs">
                  <a href={createPageUrl('Pricing')} className="hover:text-violet-400 transition-colors">{t('pricing')}</a>
                  {' • '}
                  <a href={createPageUrl('Legal')} className="hover:text-violet-400 transition-colors">{t('legal')}</a>
                  {user?.role === 'admin' && (
                    <>
                      {' • '}
                      <a href={createPageUrl('Admin')} className="hover:text-violet-400 transition-colors">Admin</a>
                    </>
                  )}
                </p>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}