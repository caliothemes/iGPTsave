import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Send, Loader2, Plus, Mic, Palette, SlidersHorizontal, Upload, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import AnimatedBackground from '@/components/AnimatedBackground';
import GlobalHeader from '@/components/GlobalHeader';
import Sidebar from '@/components/Sidebar';
import Logo from '@/components/Logo';
import { useLanguage } from '@/components/LanguageContext';
import MessageBubble from '@/components/chat/MessageBubble';
import VisualCard from '@/components/chat/VisualCard';
import CategorySelector from '@/components/chat/CategorySelector';
import FormatSelector from '@/components/chat/FormatSelector';
import StyleSelector from '@/components/chat/StyleSelector';
import PresentationModal from '@/components/PresentationModal';
import VisualEditor from '@/components/chat/VisualEditor';

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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPresentationModal, setShowPresentationModal] = useState(false);
  
  // Format & Style selectors
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedPalette, setSelectedPalette] = useState(null);
  
  // Editor
  const [showEditor, setShowEditor] = useState(false);
  const [editingVisual, setEditingVisual] = useState(null);
  
  // Dynamic settings from admin
  const [settings, setSettings] = useState({});
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const allSettings = await base44.entities.AppSettings.list();
        const settingsMap = {};
        allSettings.forEach(s => {
          settingsMap[s.key] = s.value;
        });
        setSettings(settingsMap);
        
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

  const getUserName = () => {
    if (!user) return '';
    return user.full_name?.split(' ')[0] || user.email?.split('@')[0] || '';
  };

  const getHomeTitle = () => {
    return language === 'fr' 
      ? (settings.home_title_fr || 'Imaginez et décrivez votre visuel, iGPT le crée')
      : (settings.home_title_en || 'Imagine and describe your visual, iGPT creates it');
  };

  const getHomeSubtitle = () => {
    return language === 'fr'
      ? (settings.home_subtitle_fr || 'TEXT-TO-DESIGN - Laissez iGPT créer pour vous.')
      : (settings.home_subtitle_en || 'TEXT-TO-DESIGN - Let iGPT create for you.');
  };

  const getWelcomeMessage = () => {
    if (user) {
      const msg = language === 'fr' 
        ? (settings.welcome_message_fr || 'Bonjour {name}, décrivez-moi le visuel que vous avez imaginé, nous allons le créer ensemble... Commencez par choisir un format.')
        : (settings.welcome_message_en || "Hello {name}, describe the visual you've envisioned, we'll create it together... Start by choosing a format.");
      return msg.replace('{name}', getUserName());
    } else {
      return language === 'fr'
        ? (settings.guest_message_fr || 'Bienvenue sur iGPT, décrivez-moi le visuel que vous avez imaginé, nous allons le créer ensemble... Commencez par choisir un format.')
        : (settings.guest_message_en || "Welcome to iGPT, describe the visual you've envisioned, we'll create it together... Start by choosing a format.");
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const prompt = category.selectedSubmenu 
      ? category.selectedSubmenu.prompt[language]
      : category.prompt[language];
    setInputValue(prompt + ' ');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;
    if (!selectedCategory) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsGenerating(true);
    setCurrentVisual(null);
    
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
    
    try {
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
          visual_type: selectedCategory?.id,
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

  const handleDownload = async () => {
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
    setSelectedCategory(null);
    setSelectedFormat(null);
    setSelectedStyle(null);
    setSelectedPalette(null);
    setMessages([]);
  };

  const handleOpenEditor = (visual) => {
    setEditingVisual(visual);
    setShowEditor(true);
  };

  const handleEditorSave = async (newImageUrl, layers, originalImageUrl) => {
    // Editor returns: newImageUrl (string), layers (array), originalImageUrl (string)
    const updatedVisual = {
      ...editingVisual,
      image_url: newImageUrl,
      editor_layers: layers,
      original_image_url: originalImageUrl
    };
    
    setCurrentVisual(updatedVisual);
    setSessionVisuals(prev => prev.map(v => v.id === updatedVisual.id ? updatedVisual : v));
    setShowEditor(false);
    setEditingVisual(null);
  };

  const handleLogin = () => base44.auth.redirectToLogin(createPageUrl('Home'));
  const handleLogout = () => base44.auth.logout(createPageUrl('Home'));

  const canDownload = user && credits && ((credits.free_downloads || 0) + (credits.paid_credits || 0) > 0 || credits.subscription_type === 'unlimited');
  const hasWatermark = !user || !canDownload;
  const showInitialView = messages.length === 0 && !currentVisual;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <AnimatedBackground />
        <Logo size="large" animate showText={false} />
      </div>
    );
  }

  // Editor view
  if (showEditor && editingVisual) {
    return (
      <VisualEditor
        visual={editingVisual}
        onClose={() => {
          setShowEditor(false);
          setEditingVisual(null);
        }}
        onSave={handleEditorSave}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
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

      <PresentationModal 
        isOpen={showPresentationModal} 
        onClose={() => setShowPresentationModal(false)} 
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300 relative z-10",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        {showInitialView ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32 pt-16">
            {/* Logo - Clickable to open modal - NO TEXT */}
            <div 
              className="cursor-pointer mb-10 mt-12"
              onClick={() => setShowPresentationModal(true)}
            >
              <Logo size="large" showText={false} animate />
            </div>

            {/* Dynamic Slogans - smaller title, bigger subtitle */}
            <h1 className="text-xl md:text-2xl font-light text-center mb-2">
              <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                {getHomeTitle()}
              </span>
            </h1>
            <p className="text-base md:text-lg mb-12">
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-medium">
                {getHomeSubtitle()}
              </span>
            </p>

            {/* Welcome Message Bubble */}
            <div className="w-full max-w-2xl mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full p-[2px] bg-gradient-conic-animated shadow-lg shadow-violet-500/20">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f] p-1">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692a3549022b223ef419900f/1df0e0151_iGPT-icon.png" 
                      alt="iGPT" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-md border border-violet-500/10 rounded-2xl px-5 py-4 max-w-lg shadow-lg shadow-violet-500/5">
                  <p className="text-white/80 text-sm leading-relaxed">
                    {getWelcomeMessage()}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Selection Label */}
            <p className="text-white/50 text-sm mb-4">
              {language === 'fr' ? 'Choisissez le type de création pour commencer' : 'Choose the type of creation to start'}
            </p>

            {/* Category Selector */}
            <CategorySelector 
              onSelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6 pb-48">
            <div className="max-w-3xl mx-auto space-y-4">
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
                          handleOpenEditor(currentVisual);
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={cn(
          "fixed bottom-0 right-0 z-20 transition-all duration-300",
          sidebarOpen ? "left-64" : "left-0"
        )}>
          {/* Black transparent overlay for footer */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
          
          <div className="relative max-w-2xl mx-auto px-4 pb-4">
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

            {/* Selected Tags */}
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

            {/* Input Bar */}
            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3">
                {/* Plus Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 text-white/40 hover:text-white/60 transition-colors">
                      <Plus className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10">
                    <DropdownMenuLabel className="text-white/50 text-xs">
                      {language === 'fr' ? 'Options' : 'Options'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {language === 'fr' ? 'Importer une image' : 'Upload image'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => { setShowFormatSelector(!showFormatSelector); setShowStyleSelector(false); }}
                      className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      {language === 'fr' ? 'Format & Dimensions' : 'Format & Dimensions'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => { setShowStyleSelector(!showStyleSelector); setShowFormatSelector(false); }}
                      className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      {language === 'fr' ? 'Style & Couleurs' : 'Style & Colors'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={selectedCategory 
                    ? (language === 'fr' ? 'Décrivez votre visuel...' : 'Describe your visual...')
                    : (language === 'fr' ? 'Sélectionnez d\'abord un type ci-dessus...' : 'Select a type above first...')
                  }
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-sm"
                  disabled={isGenerating || !selectedCategory}
                />

                <button className="p-2 text-white/40 hover:text-white/60 transition-colors">
                  <Mic className="h-5 w-5" />
                </button>

                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isGenerating || !selectedCategory}
                  size="icon"
                  className="h-9 w-9 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Footer Links */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/40">
              <Link to={createPageUrl('Pricing')} className="hover:text-white/60 transition-colors">
                {language === 'fr' ? 'Tarifs' : 'Pricing'}
              </Link>
              <span>•</span>
              <Link to={createPageUrl('Portfolio')} className="hover:text-white/60 transition-colors">
                Portfolio
              </Link>
              <span>•</span>
              <Link to={createPageUrl('Legal')} className="hover:text-white/60 transition-colors">
                {language === 'fr' ? 'Mentions légales' : 'Legal'}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* CSS for animated gradient border */}
      <style>{`
        .bg-gradient-conic-animated {
          background: linear-gradient(90deg, #8b5cf6, #3b82f6, #a855f7, #8b5cf6);
          background-size: 300% 100%;
          animation: gradient-rotate 3s linear infinite;
        }
        @keyframes gradient-rotate {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>
    </div>
  );
}