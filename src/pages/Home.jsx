import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Loader2, Sparkles, Image, Palette } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import Sidebar from '@/components/Sidebar';
import MessageBubble from '@/components/chat/MessageBubble';
import VisualCard from '@/components/chat/VisualCard';
import FormatSelector from '@/components/chat/FormatSelector';
import StyleSelector, { STYLES, COLOR_PALETTES } from '@/components/chat/StyleSelector';
import GlobalHeader from '@/components/GlobalHeader';
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
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedPalette, setSelectedPalette] = useState(null);
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

  const buildDetailedPrompt = (basePrompt, style, palette, format) => {
    let prompt = basePrompt;

    if (style) {
      prompt += `. Style: ${style.prompt}`;
    }

    if (palette) {
      const colorNames = palette.colors.join(', ');
      prompt += `. Color palette: use these exact colors: ${colorNames}`;
    }

    if (format) {
      prompt += `. Format optimized for ${format.name} (${format.dimensions})`;
    }

    // Add quality enhancers
    prompt += `. High quality, professional design, sharp details, balanced composition, visually striking, award-winning design`;

    return prompt;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    setShowFormatSelector(false);
    setShowStyleSelector(false);

    try {
      // Build context for analysis
      let contextInfo = '';
      if (selectedFormat) contextInfo += `Format: ${selectedFormat.name} (${selectedFormat.dimensions}). `;
      if (selectedStyle) contextInfo += `Style: ${selectedStyle.name.fr}. `;
      if (selectedPalette) contextInfo += `Palette: ${selectedPalette.name.fr} (${selectedPalette.colors.join(', ')}). `;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es iGPT, un assistant expert PREMIUM en création de visuels professionnels.

  L'utilisateur demande: "${userMessage}"
  ${contextInfo ? `Contexte choisi par l'utilisateur: ${contextInfo}` : ''}

  RÈGLES IMPORTANTES:
  - Tu dois créer des visuels de qualité PROFESSIONNELLE
  - Sois très descriptif dans le prompt image (min 100 mots)
  - Inclus des détails sur: composition, éclairage, textures, profondeur, style artistique
  - Pour les logos: précise le type (wordmark, emblem, abstract, mascot, etc.)
  - Mentionne toujours "vector style, scalable, clean edges" pour les logos

  Réponds en JSON:
  - needs_image: boolean (true si création visuelle demandée)
  - response: string (réponse courte, professionnelle, en français)
  - image_prompt: string (prompt TRÈS détaillé en anglais, 100+ mots, incluant style, couleurs, composition, éclairage, textures)
  - visual_type: string (logo, carte_visite, flyer, post_instagram, story_instagram, post_facebook, post_linkedin, affiche, banner, autre)
  - dimensions: string (ex: 1080x1080)
  - title: string (titre court et accrocheur)
  - suggested_colors: array de 5 codes hex couleurs recommandées`,
        response_json_schema: {
          type: 'object',
          properties: {
            needs_image: { type: 'boolean' },
            response: { type: 'string' },
            image_prompt: { type: 'string' },
            visual_type: { type: 'string' },
            dimensions: { type: 'string' },
            title: { type: 'string' },
            suggested_colors: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      let updatedMessages = [...newMessages, { role: 'assistant', content: analysis.response }];
      setMessages(updatedMessages);

      if (analysis.needs_image && analysis.image_prompt) {
        setIsGenerating(true);
        updatedMessages = [...updatedMessages, { role: 'assistant', content: t('generating') }];
        setMessages(updatedMessages);

        // Build the final detailed prompt
        const finalPrompt = buildDetailedPrompt(
          analysis.image_prompt,
          selectedStyle,
          selectedPalette,
          selectedFormat
        );

        const imageResult = await base44.integrations.Core.GenerateImage({
          prompt: finalPrompt
        });

        // Use selected palette or AI suggested colors
        const finalPalette = selectedPalette?.colors || analysis.suggested_colors || [];

        let newVisual = {
          title: analysis.title || 'Visuel',
          image_url: imageResult.url,
          visual_type: analysis.visual_type || 'autre',
          dimensions: analysis.dimensions || selectedFormat?.dimensions || '1080x1080',
          format: selectedFormat?.id?.includes('post') || selectedFormat?.id?.includes('story') || selectedFormat?.id?.includes('banner') ? 'digital' : 'print',
          original_prompt: userMessage,
          image_prompt: finalPrompt,
          style: selectedStyle?.name?.fr || '',
          color_palette: finalPalette,
          version: 1
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
    setSelectedStyle(null);
    setSelectedPalette(null);
  };

  const handleRegenerate = async (visual) => {
    setIsGenerating(true);
    try {
      // Use the original prompt if available, otherwise create a detailed one
      let regeneratePrompt = visual.image_prompt;

      if (!regeneratePrompt) {
        regeneratePrompt = `Professional ${visual.visual_type}, high quality, ${visual.style || 'modern clean design'}`;
        if (visual.color_palette?.length) {
          regeneratePrompt += `, using colors: ${visual.color_palette.join(', ')}`;
        }
        regeneratePrompt += `, sharp details, balanced composition, award-winning design`;
      }

      const result = await base44.integrations.Core.GenerateImage({
        prompt: regeneratePrompt
      });

      const newVersion = (visual.version || 1) + 1;
      let newVisual = {
        title: visual.title?.replace(/ \(v\d+\)$/, '') + ` (v${newVersion})`,
        image_url: result.url,
        visual_type: visual.visual_type,
        dimensions: visual.dimensions,
        format: visual.format,
        original_prompt: visual.original_prompt,
        image_prompt: regeneratePrompt,
        style: visual.style,
        color_palette: visual.color_palette,
        version: newVersion,
        parent_visual_id: visual.id
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

  const handleVariation = async (visual) => {
    setIsGenerating(true);
    try {
      // Create a variation by slightly modifying the prompt
      let variationPrompt = visual.image_prompt || `Professional ${visual.visual_type}`;
      variationPrompt += `. Create a VARIATION with different composition, slightly different style interpretation, maintain the same quality and color scheme. Fresh perspective, alternative design approach.`;

      const result = await base44.integrations.Core.GenerateImage({
        prompt: variationPrompt
      });

      const newVersion = (visual.version || 1) + 1;
      let newVisual = {
        title: visual.title?.replace(/ \(v\d+\)$/, '') + ` (var${newVersion})`,
        image_url: result.url,
        visual_type: visual.visual_type,
        dimensions: visual.dimensions,
        format: visual.format,
        original_prompt: visual.original_prompt,
        image_prompt: variationPrompt,
        style: visual.style,
        color_palette: visual.color_palette,
        version: newVersion,
        parent_visual_id: visual.id
      };

      if (user) {
        newVisual = await base44.entities.Visual.create({ user_email: user.email, ...newVisual });
      }

      setVisuals(prev => [newVisual, ...prev]);
      setSelectedVisual(newVisual);
      setMessages(prev => [...prev, { role: 'assistant', content: language === 'fr' ? '🎨 Nouvelle variation créée !' : '🎨 New variation created!' }]);
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const handleToggleFavorite = async (visual) => {
    if (!user || !visual.id) return;

    const newFavoriteState = !visual.is_favorite;
    await base44.entities.Visual.update(visual.id, { is_favorite: newFavoriteState });

    setVisuals(prev => prev.map(v => v.id === visual.id ? { ...v, is_favorite: newFavoriteState } : v));
    if (selectedVisual?.id === visual.id) {
      setSelectedVisual(prev => ({ ...prev, is_favorite: newFavoriteState }));
    }
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
      <GlobalHeader />

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
                  <Logo size="large" showText={false} animate={true} />
                  <h1 className="text-xl md:text-2xl text-white/80 font-light mt-6 max-w-xl leading-relaxed">
                    {(language === 'fr' ? settings.home_title_fr : settings.home_title_en) || t('heroTitle')}
                  </h1>
                  <p className="text-white/50 mt-3 max-w-md text-sm">
                    {(language === 'fr' ? settings.home_subtitle_fr : settings.home_subtitle_en) || t('heroSubtitle')}
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
                    onRegenerate={handleRegenerate}
                    onDownload={() => handleDownload(selectedVisual)}
                    onVariation={handleVariation}
                    onToggleFavorite={handleToggleFavorite}
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

          {/* Style & Palette Selector */}
          {showStyleSelector && (
            <div className="px-4 pb-2 max-w-3xl mx-auto w-full">
              <StyleSelector
                selectedStyle={selectedStyle}
                selectedPalette={selectedPalette}
                onStyleChange={setSelectedStyle}
                onPaletteChange={setSelectedPalette}
              />
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-transparent">
            <div className="max-w-3xl mx-auto">
              {/* Selected Options Display */}
              {(selectedFormat || selectedStyle || selectedPalette) && (
                <div className="mb-2 flex items-center gap-2 text-xs flex-wrap">
                  {selectedFormat && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                      {selectedFormat.name}
                      <button onClick={() => setSelectedFormat(null)} className="hover:text-white">✕</button>
                    </span>
                  )}
                  {selectedStyle && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                      {selectedStyle.icon} {selectedStyle.name[language]}
                      <button onClick={() => setSelectedStyle(null)} className="hover:text-white">✕</button>
                    </span>
                  )}
                  {selectedPalette && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-300">
                      <span className="flex gap-0.5">
                        {selectedPalette.colors.slice(0, 3).map((c, i) => (
                          <span key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </span>
                      {selectedPalette.name[language]}
                      <button onClick={() => setSelectedPalette(null)} className="hover:text-white">✕</button>
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-3 py-2 h-12">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setShowFormatSelector(!showFormatSelector); setShowStyleSelector(false); }}
                  className={cn(
                    "text-white/50 hover:text-white hover:bg-white/10 flex-shrink-0 h-8 w-8",
                    showFormatSelector && "bg-blue-500/20 text-blue-300"
                  )}
                  title={language === 'fr' ? 'Format' : 'Format'}
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setShowStyleSelector(!showStyleSelector); setShowFormatSelector(false); }}
                  className={cn(
                    "text-white/50 hover:text-white hover:bg-white/10 flex-shrink-0 h-8 w-8",
                    showStyleSelector && "bg-violet-500/20 text-violet-300"
                  )}
                  title={language === 'fr' ? 'Style & Couleurs' : 'Style & Colors'}
                >
                  <Palette className="h-4 w-4" />
                </Button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                  placeholder={t('inputPlaceholder')}
                  className="flex-1 bg-transparent border-0 text-white placeholder:text-white/40 focus:outline-none text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 flex-shrink-0 h-8 w-8"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Footer */}
              <div className="mt-3 flex items-center justify-center">
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
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}