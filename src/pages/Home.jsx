import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, SlidersHorizontal, Palette, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

import AnimatedBackground from '@/components/AnimatedBackground';
import GlobalHeader from '@/components/GlobalHeader';
import Sidebar from '@/components/Sidebar';
import Logo from '@/components/Logo';
import { useLanguage } from '@/components/LanguageContext';
import MessageBubble from '@/components/chat/MessageBubble';
import VisualCard from '@/components/chat/VisualCard';
import FormatSelector from '@/components/chat/FormatSelector';
import StyleSelector, { STYLES, COLOR_PALETTES } from '@/components/chat/StyleSelector';

export default function Home() {
  const { t, language } = useLanguage();
  
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [sessionVisuals, setSessionVisuals] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVisual, setCurrentVisual] = useState(null);
  
  // Format & Style selectors
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedPalette, setSelectedPalette] = useState(null);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          
          const userCredits = await base44.entities.UserCredits.filter({ user_email: currentUser.email });
          if (userCredits.length > 0) {
            setCredits(userCredits[0]);
          } else {
            const newCredits = await base44.entities.UserCredits.create({
              user_email: currentUser.email,
              free_downloads: 25
            });
            setCredits(newCredits);
          }
          
          const convs = await base44.entities.Conversation.filter({ user_email: currentUser.email }, '-created_date', 20);
          setConversations(convs);
          
          const visuals = await base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 10);
          setSessionVisuals(visuals);
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentVisual]);

  useEffect(() => {
    if (!isLoading && messages.length === 0) {
      const welcomeMsg = user 
        ? t('welcomeUser', { name: user.full_name?.split(' ')[0] || 'User' }) + '\n\n' + t('assistantIntro')
        : t('welcome') + '\n\n' + t('guestIntro');
      setMessages([{ role: 'assistant', content: welcomeMsg }]);
    }
  }, [isLoading, user, t, messages.length]);

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsGenerating(true);
    setCurrentVisual(null);
    
    // Close selectors
    setShowFormatSelector(false);
    setShowStyleSelector(false);
    
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
    
    try {
      // Build enhanced prompt
      let enhancedPrompt = userMessage;
      
      if (selectedStyle) {
        enhancedPrompt += `, ${selectedStyle.prompt}`;
      }
      
      if (selectedPalette) {
        enhancedPrompt += `, color palette: ${selectedPalette.colors.join(', ')}`;
      }
      
      if (selectedFormat) {
        enhancedPrompt += `, dimensions ${selectedFormat.dimensions}`;
      }
      
      enhancedPrompt += ', high quality, professional design';
      
      const result = await base44.integrations.Core.GenerateImage({
        prompt: enhancedPrompt
      });

      if (result.url) {
        const visualData = {
          user_email: user?.email || 'anonymous',
          image_url: result.url,
          title: userMessage.slice(0, 50),
          original_prompt: userMessage,
          image_prompt: enhancedPrompt,
          dimensions: selectedFormat?.dimensions || '1080x1080',
          format_name: selectedFormat?.name,
          style: selectedStyle?.name?.[language],
          color_palette: selectedPalette?.colors
        };

        let savedVisual = visualData;
        if (user) {
          savedVisual = await base44.entities.Visual.create(visualData);
          setSessionVisuals(prev => [savedVisual, ...prev]);
        }

        setCurrentVisual(savedVisual);
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { 
            role: 'assistant', 
            content: `✨ ${language === 'fr' ? 'Votre visuel est prêt !' : 'Your visual is ready!'}`
          };
          return newMsgs;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'assistant', content: t('error') };
        return newMsgs;
      });
    }
    
    setIsGenerating(false);
  };

  const handleRegenerate = async (visual) => {
    setIsGenerating(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
    
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: visual.image_prompt || visual.original_prompt + ', high quality, professional design'
      });

      if (result.url) {
        const newVisual = {
          ...visual,
          image_url: result.url,
          version: (visual.version || 1) + 1
        };
        
        if (user && visual.id) {
          await base44.entities.Visual.update(visual.id, { image_url: result.url, version: newVisual.version });
        }
        
        setCurrentVisual(newVisual);
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'assistant', content: t('newVersion') };
          return newMsgs;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'assistant', content: t('error') };
        return newMsgs;
      });
    }
    
    setIsGenerating(false);
  };

  const handleDownload = async (format) => {
    // Deduct credit if user has credits
    if (credits && user) {
      if (credits.free_downloads > 0) {
        await base44.entities.UserCredits.update(credits.id, { free_downloads: credits.free_downloads - 1 });
        setCredits(prev => ({ ...prev, free_downloads: prev.free_downloads - 1 }));
      } else if (credits.paid_credits > 0) {
        await base44.entities.UserCredits.update(credits.id, { paid_credits: credits.paid_credits - 1 });
        setCredits(prev => ({ ...prev, paid_credits: prev.paid_credits - 1 }));
      }
    }
  };

  const handleNewChat = () => {
    setCurrentVisual(null);
    setCurrentConversation(null);
    setSelectedFormat(null);
    setSelectedStyle(null);
    setSelectedPalette(null);
    setMessages([]);
    const welcomeMsg = user 
      ? t('welcomeUser', { name: user.full_name?.split(' ')[0] || 'User' }) + '\n\n' + t('newConversation')
      : t('welcome') + '\n\n' + t('guestIntro');
    setMessages([{ role: 'assistant', content: welcomeMsg }]);
  };

  const handleLogin = () => base44.auth.redirectToLogin(createPageUrl('Home'));
  const handleLogout = () => base44.auth.logout(createPageUrl('Home'));

  const canDownload = user && credits && ((credits.free_downloads || 0) + (credits.paid_credits || 0) > 0 || credits.subscription_type === 'unlimited');
  const hasWatermark = !user || !canDownload;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <AnimatedBackground />
        <Logo size="large" animate />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <AnimatedBackground />
      <GlobalHeader page="Home" />
      
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        credits={credits}
        conversations={conversations}
        visuals={sessionVisuals}
        currentConversationId={currentConversation?.id}
        onNewChat={handleNewChat}
        onSelectConversation={(conv) => setCurrentConversation(conv)}
        onDeleteConversation={async (id) => {
          await base44.entities.Conversation.delete(id);
          setConversations(prev => prev.filter(c => c.id !== id));
        }}
        onSelectVisual={(v) => setCurrentVisual(v)}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300 relative z-10",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-48">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Hero when no messages */}
            {messages.length <= 1 && !currentVisual && (
              <div className="text-center py-8">
                <Logo size="large" showText animate />
                <p className="text-white/60 mt-4 max-w-md mx-auto">
                  {t('heroSubtitle')}
                </p>
              </div>
            )}

            {/* Messages */}
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <MessageBubble message={msg} isStreaming={msg.isStreaming} user={user} />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Visual Card */}
            {currentVisual && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center"
              >
                <div className="w-full max-w-md">
                  <VisualCard
                    visual={currentVisual}
                    onRegenerate={handleRegenerate}
                    onDownload={handleDownload}
                    onToggleFavorite={async (v) => {
                      if (user && v.id) {
                        await base44.entities.Visual.update(v.id, { is_favorite: !v.is_favorite });
                        setCurrentVisual({ ...v, is_favorite: !v.is_favorite });
                      }
                    }}
                    isRegenerating={isGenerating}
                    canDownload={canDownload}
                    hasWatermark={hasWatermark}
                    showValidation={true}
                    onValidate={(action) => {
                      if (action === 'edit') {
                        window.location.href = createPageUrl('MyVisuals') + `?edit=${currentVisual.id}`;
                      }
                    }}
                  />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent p-4 z-20">
          <div className={cn(
            "max-w-3xl mx-auto transition-all duration-300",
            sidebarOpen && "ml-32"
          )}>
            {/* Format Selector */}
            <AnimatePresence>
              {showFormatSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mb-3"
                >
                  <FormatSelector 
                    selectedFormat={selectedFormat}
                    onSelect={(format) => {
                      setSelectedFormat(format);
                      setShowFormatSelector(false);
                    }}
                    onClose={() => setShowFormatSelector(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Style Selector */}
            <AnimatePresence>
              {showStyleSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mb-3"
                >
                  <StyleSelector
                    selectedStyle={selectedStyle}
                    selectedPalette={selectedPalette}
                    onStyleChange={setSelectedStyle}
                    onPaletteChange={setSelectedPalette}
                    onClose={() => setShowStyleSelector(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Options Display */}
            {(selectedFormat || selectedStyle || selectedPalette) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedFormat && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
                    <SlidersHorizontal className="h-3 w-3" />
                    {selectedFormat.name}
                    <button onClick={() => setSelectedFormat(null)} className="ml-1 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedStyle && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-300 text-xs border border-violet-500/30">
                    <Sparkles className="h-3 w-3" />
                    {selectedStyle.name[language]}
                    <button onClick={() => setSelectedStyle(null)} className="ml-1 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedPalette && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/20 text-pink-300 text-xs border border-pink-500/30">
                    <div className="flex gap-0.5">
                      {selectedPalette.colors.slice(0, 3).map((c, i) => (
                        <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    {selectedPalette.name[language]}
                    <button onClick={() => setSelectedPalette(null)} className="ml-1 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Main Input */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              {/* Option Buttons */}
              <div className="flex items-center gap-1 px-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowFormatSelector(!showFormatSelector); setShowStyleSelector(false); }}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs",
                    showFormatSelector || selectedFormat
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                  {language === 'fr' ? 'Format' : 'Format'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowStyleSelector(!showStyleSelector); setShowFormatSelector(false); }}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs",
                    showStyleSelector || selectedStyle || selectedPalette
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Palette className="h-3.5 w-3.5 mr-1.5" />
                  {language === 'fr' ? 'Style & Couleurs' : 'Style & Colors'}
                </Button>
              </div>

              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t('inputPlaceholder')}
                className="w-full bg-transparent border-0 text-white placeholder:text-white/40 resize-none min-h-[56px] max-h-32 pr-20 focus-visible:ring-0"
                disabled={isGenerating}
              />
              
              <div className="absolute right-2 bottom-2">
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isGenerating}
                  className="h-10 px-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 rounded-xl"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}