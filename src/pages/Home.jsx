import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Send, Loader2, Plus, Mic } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

import AnimatedBackground from '@/components/AnimatedBackground';
import GlobalHeader from '@/components/GlobalHeader';
import Sidebar from '@/components/Sidebar';
import Logo from '@/components/Logo';
import { useLanguage } from '@/components/LanguageContext';
import MessageBubble from '@/components/chat/MessageBubble';
import VisualCard from '@/components/chat/VisualCard';
import CategorySelector, { CATEGORIES } from '@/components/chat/CategorySelector';
import PresentationModal from '@/components/PresentationModal';

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
  
  const messagesEndRef = useRef(null);

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

  const getUserName = () => {
    if (!user) return '';
    return user.full_name?.split(' ')[0] || user.email?.split('@')[0] || '';
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Set the prompt based on selection
    const prompt = category.selectedSubmenu 
      ? category.selectedSubmenu.prompt[language]
      : category.prompt[language];
    setInputValue(prompt + ' ');
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;
    if (!selectedCategory) return; // Must select category first
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsGenerating(true);
    setCurrentVisual(null);
    
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
    
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: userMessage + ', high quality, professional design'
      });

      if (result.url) {
        const visualData = {
          user_email: user?.email || 'anonymous',
          image_url: result.url,
          title: userMessage.slice(0, 50),
          original_prompt: userMessage,
          dimensions: '1080x1080',
          visual_type: selectedCategory?.id
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
        prompt: visual.original_prompt + ', high quality, professional design'
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
    setMessages([]);
  };

  const handleLogin = () => base44.auth.redirectToLogin(createPageUrl('Home'));
  const handleLogout = () => base44.auth.logout(createPageUrl('Home'));

  const canDownload = user && credits && ((credits.free_downloads || 0) + (credits.paid_credits || 0) > 0 || credits.subscription_type === 'unlimited');
  const hasWatermark = !user || !canDownload;

  // Show initial view (no messages yet)
  const showInitialView = messages.length === 0 && !currentVisual;

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

      <PresentationModal 
        isOpen={showPresentationModal} 
        onClose={() => setShowPresentationModal(false)} 
      />

      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300 relative z-10",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        {showInitialView ? (
          /* Initial View - Like in screenshots */
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
            {/* Logo - Clickable to open modal */}
            <div 
              className="cursor-pointer mb-6"
              onClick={() => setShowPresentationModal(true)}
            >
              <Logo size="large" showText animate />
            </div>

            {/* Slogan */}
            <h1 className="text-2xl md:text-3xl text-white/90 font-light text-center mb-2">
              {language === 'fr' 
                ? 'Imaginez et décrivez votre visuel, iGPT le crée'
                : 'Imagine and describe your visual, iGPT creates it'}
            </h1>
            <p className="text-white/50 text-sm mb-10">
              TEXT-TO-DESIGN - {language === 'fr' ? 'Laissez iGPT créer pour vous.' : 'Let iGPT create for you.'}
            </p>

            {/* Welcome Message Bubble */}
            <div className="w-full max-w-2xl mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full p-[2px] bg-gradient-to-r from-violet-500 to-blue-500">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f] p-1">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692a3549022b223ef419900f/1df0e0151_iGPT-icon.png" 
                      alt="iGPT" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 max-w-lg">
                  <p className="text-white/80 text-sm">
                    {language === 'fr' 
                      ? `Bonjour ${getUserName() || ''}, décrivez-moi le visuel que vous avez imaginé, nous allons le créer ensemble... Commencez par choisir un format.`
                      : `Hello ${getUserName() || ''}, describe the visual you've imagined, we'll create it together... Start by choosing a format.`}
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
          /* Chat View */
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
        )}

        {/* Input Area - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className={cn(
            "max-w-2xl mx-auto px-4 pb-4 transition-all duration-300",
            sidebarOpen && "ml-32"
          )}>
            {/* Input Bar */}
            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3">
                <button className="p-2 text-white/40 hover:text-white/60 transition-colors">
                  <Plus className="h-5 w-5" />
                </button>
                
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
    </div>
  );
}