import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Send, Loader2, Plus, Mic, Palette, SlidersHorizontal, Upload, X, Heart, ChevronDown, ChevronRight } from 'lucide-react';
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
import CategorySelector, { CATEGORIES } from '@/components/chat/CategorySelector';
import FormatSelector from '@/components/chat/FormatSelector';
import StyleSelector from '@/components/chat/StyleSelector';
import PresentationModal from '@/components/PresentationModal';
import VisualEditor from '@/components/chat/VisualEditor';
import ConfirmModal from '@/components/ConfirmModal';
import FavoritesModal from '@/components/FavoritesModal';

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
  const [promptTemplates, setPromptTemplates] = useState([]);
  const [showPresentationModal, setShowPresentationModal] = useState(false);
  
  // Format & Style selectors
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [openNestedSubmenu, setOpenNestedSubmenu] = useState(null);
  const [expertMode, setExpertMode] = useState(() => {
    const defaults = {};
    CATEGORIES.forEach(cat => {
      if (cat.defaultExpertMode !== undefined) {
        defaults[cat.id] = cat.defaultExpertMode;
      }
    });
    return defaults;
  });
  
  // Editor
  const [showEditor, setShowEditor] = useState(false);
  const [editingVisual, setEditingVisual] = useState(null);
  
  // Confirm modal
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null });
  
  // Favorites modal
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const favoriteVisuals = sessionVisuals.filter(v => v.is_favorite);
  
  // Dynamic settings from admin
  const [settings, setSettings] = useState({});
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

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
          
          const convs = await base44.entities.Conversation.filter({ user_email: currentUser.email }, '-updated_date', 20);
          setConversations(convs);
          
          const visuals = await base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 10);
          setSessionVisuals(visuals);

          // Load prompt templates
          const templates = await base44.entities.PromptTemplate.filter({ is_active: true });
          setPromptTemplates(templates);

          // Check if there's an editVisual parameter
          const urlParams = new URLSearchParams(window.location.search);
          const editVisualId = urlParams.get('editVisual');
          if (editVisualId) {
            const visualToEdit = visuals.find(v => v.id === editVisualId);
            if (visualToEdit) {
              setCurrentVisual(visualToEdit);
              setMessages([{ role: 'assistant', content: '✨ ' + (language === 'fr' ? 'Voici votre visuel. Vous pouvez me demander de le modifier ou de créer des variations.' : 'Here is your visual. You can ask me to modify it or create variations.') }]);
              // Set category based on visual type to enable prompt
              if (visualToEdit.visual_type) {
                setSelectedCategory({ id: visualToEdit.visual_type });
              }
            }
          }
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
    setCategoryDropdownOpen(false);
    setOpenSubmenu(null);
    setOpenNestedSubmenu(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const toggleExpertMode = (categoryId, e) => {
    e.stopPropagation();
    setExpertMode(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;

    // Auto-select free_prompt if no category selected
    let activeCategory = selectedCategory;
    if (!activeCategory) {
      const freePromptCategory = CATEGORIES.find(c => c.id === 'free_prompt');
      activeCategory = freePromptCategory;
      setSelectedCategory(freePromptCategory);
    }
    
    const userMessage = inputValue.trim();
    setInputValue('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = '24px';
    }
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsGenerating(true);
    setCurrentVisual(null);

    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

    // Create conversation if it doesn't exist
    let activeConversation = currentConversation;
    if (!activeConversation && user) {
      try {
        const newConv = await base44.entities.Conversation.create({
          user_email: user.email,
          title: userMessage.slice(0, 50),
          messages: [{ role: 'user', content: userMessage }]
        });
        setCurrentConversation(newConv);
        setConversations(prev => [newConv, ...prev]);
        activeConversation = newConv;
      } catch (e) {
        console.error('Failed to create conversation:', e);
      }
    }

    try {
      let enhancedPrompt = '';
      const dimensions = activeCategory?.selectedSubmenu?.dimensions || selectedFormat?.dimensions || '1080x1080';
      const isExpertMode = activeCategory?.expertMode || activeCategory?.id === 'free_prompt';

      // MODE EXPERT : Prompt brut, aucun template, aucun enrichissement
      if (isExpertMode) {
        enhancedPrompt = userMessage;
        console.log('🎯 MODE EXPERT - Prompt brut envoyé:', enhancedPrompt);
      } 
      // MODE ASSISTÉ : Enrichissement via templates ou prompts par défaut
      else {
        const templateKey = activeCategory?.selectedSubmenu?.id || activeCategory?.id;
        const template = promptTemplates.find(t => 
          t.category === activeCategory?.id && 
          (!t.subcategory || t.subcategory === templateKey)
        );

        if (template) {
          // Template admin personnalisé
          const templateText = language === 'fr' ? template.prompt_fr : (template.prompt_en || template.prompt_fr);
          enhancedPrompt = templateText.replace('{userMessage}', userMessage).replace('{message}', userMessage);
          console.log('✨ MODE ASSISTÉ - Template admin appliqué:', template.description);
        } else {
          // Prompts par défaut
          if (['logo', 'logo_picto', 'logo_complet'].includes(activeCategory?.id)) {
            if (activeCategory?.id === 'logo' || activeCategory?.id === 'logo_picto') {
              enhancedPrompt = `minimalist icon symbol ${userMessage}, abstract geometric emblem, simple pictogram, flat design mark, clean vector icon`;
            } else {
              enhancedPrompt = `visual background design for ${userMessage}, thematic elements related to the business, relevant imagery, professional backdrop, contextual graphics`;
            }
            enhancedPrompt += ' --no text --no letters --no words --no typography --no writing';
            } else if (['print', 'social'].includes(activeCategory?.id)) {
            // Design à plat pour print et social
            enhancedPrompt = `flat graphic design for ${userMessage}, complete frontal view on entire surface, flat horizontal composition, ZERO perspective, ZERO angle, flat lay photography style, thematic elements, professional backdrop --no text --no letters --no typography --no perspective --no angle --no 3d --no tilt --no shadow --no mockup --no cutout --no cropped --no cut --no edge --no corner --no fold --no rotation --no depth --no isometric`;
          } else {
            enhancedPrompt = `${userMessage}, photorealistic, detailed, high quality`;
          }
          console.log('🤖 MODE ASSISTÉ - Prompt par défaut appliqué');
        }

        if (selectedStyle) {
          enhancedPrompt += `, ${selectedStyle.prompt}`;
        }
        if (selectedPalette) {
          enhancedPrompt += `, colors: ${selectedPalette.colors.join(', ')}`;
        }

        enhancedPrompt += ', professional quality, 4K resolution';
        console.log('📝 Prompt final enrichi:', enhancedPrompt);
      }

      const result = await base44.integrations.Core.GenerateImage({
        prompt: enhancedPrompt
      });

      if (result.url) {
        // Extract color palette from generated image
        let extractedColors = selectedPalette?.colors;
        if (!extractedColors) {
          try {
            const colorResult = await base44.integrations.Core.InvokeLLM({
              prompt: 'Extract the 5 most dominant colors from this image as HEX codes. Return only an array of hex codes.',
              response_json_schema: {
                type: "object",
                properties: {
                  colors: { type: "array", items: { type: "string" } }
                }
              },
              file_urls: [result.url]
            });
            extractedColors = colorResult.colors;
          } catch (e) {
            console.error('Color extraction failed:', e);
          }
        }

        const visualData = {
          user_email: user?.email || 'anonymous',
          conversation_id: activeConversation?.id,
          image_url: result.url,
          original_image_url: result.url,
          title: userMessage.slice(0, 50),
          original_prompt: userMessage,
          image_prompt: enhancedPrompt,
          dimensions: dimensions,
          visual_type: activeCategory?.id,
          style: selectedStyle?.name?.[language],
          color_palette: extractedColors
        };

        let savedVisual = visualData;
        if (user) {
          savedVisual = await base44.entities.Visual.create(visualData);
          setSessionVisuals(prev => [savedVisual, ...prev]);
        }

        setCurrentVisual(savedVisual);

        const successMessage = `✨ ${language === 'fr' ? 'Votre visuel est prêt !' : 'Your visual is ready!'}`;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { 
            role: 'assistant', 
            content: successMessage
          };
          return newMsgs;
        });

        // Update conversation with new messages and visual_id
        if (activeConversation && user) {
          try {
            const updatedMessages = [
              ...(activeConversation.messages || []),
              { role: 'user', content: userMessage },
              { role: 'assistant', content: successMessage }
            ];
            await base44.entities.Conversation.update(activeConversation.id, {
              messages: updatedMessages,
              title: activeConversation.title || userMessage.slice(0, 50),
              visual_id: savedVisual.id
            });
            setCurrentConversation(prev => ({ ...prev, messages: updatedMessages, visual_id: savedVisual.id }));
          } catch (e) {
            console.error('Failed to update conversation:', e);
          }
        }
        }
        } catch (error) {
        console.error(error);
        const errorMsg = t('error');
        setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'assistant', content: errorMsg };
        return newMsgs;
        });

        // Update conversation with error
        if (activeConversation && user) {
        try {
          await base44.entities.Conversation.update(activeConversation.id, {
            messages: [
              ...(activeConversation.messages || []),
              { role: 'user', content: userMessage },
              { role: 'assistant', content: errorMsg }
            ]
          });
        } catch (e) {
          console.error('Failed to update conversation:', e);
        }
        }
        }

        setIsGenerating(false);
        };

  const handleRegenerate = async (visual) => {
    setIsGenerating(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

    try {
      // Deduct credit before generation
      if (credits && user) {
        if (credits.free_downloads > 0) {
          await base44.entities.UserCredits.update(credits.id, { free_downloads: credits.free_downloads - 1 });
          setCredits(prev => ({ ...prev, free_downloads: prev.free_downloads - 1 }));
        } else if (credits.paid_credits > 0) {
          await base44.entities.UserCredits.update(credits.id, { paid_credits: credits.paid_credits - 1 });
          setCredits(prev => ({ ...prev, paid_credits: prev.paid_credits - 1 }));
        }
      }

      const result = await base44.integrations.Core.GenerateImage({
        prompt: visual.image_prompt || visual.original_prompt + ', high quality, professional design'
      });

      if (result.url) {
        // Extract new color palette from regenerated image
        let extractedColors = null;
        try {
          const colorResult = await base44.integrations.Core.InvokeLLM({
            prompt: 'Extract the 5 most dominant colors from this image as HEX codes. Return only an array of hex codes.',
            response_json_schema: {
              type: "object",
              properties: {
                colors: { type: "array", items: { type: "string" } }
              }
            },
            file_urls: [result.url]
          });
          extractedColors = colorResult.colors;
        } catch (e) {
          console.error('Color extraction failed:', e);
          extractedColors = visual.color_palette; // Fallback to old colors
        }

        // Create new visual instead of updating
        const visualData = {
          user_email: user?.email || 'anonymous',
          image_url: result.url,
          original_image_url: result.url,
          title: visual.title,
          original_prompt: visual.original_prompt,
          image_prompt: visual.image_prompt,
          dimensions: visual.dimensions,
          visual_type: visual.visual_type,
          style: visual.style,
          color_palette: extractedColors,
          version: (visual.version || 1) + 1,
          parent_visual_id: visual.id
        };

        let newVisual = visualData;
        if (user) {
          newVisual = await base44.entities.Visual.create(visualData);
          setSessionVisuals(prev => [newVisual, ...prev]);
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
  
  const handleSelectConversation = async (conv) => {
    setCurrentConversation(conv);
    setMessages(conv.messages || []);
    setCurrentVisual(null); // Reset visual first
    
    // Load the visual associated with this conversation
    let loadedVisual = null;
    
    if (conv.visual_id) {
      try {
        const visuals = await base44.entities.Visual.filter({ id: conv.visual_id });
        if (visuals.length > 0) {
          loadedVisual = visuals[0];
          setCurrentVisual(loadedVisual);
        }
      } catch (e) {
        console.error('Failed to load visual by visual_id:', e);
      }
    }
    
    // Fallback: try to find visual by conversation_id if visual_id not found
    if (!loadedVisual) {
      try {
        const visuals = await base44.entities.Visual.filter({ conversation_id: conv.id }, '-created_date', 1);
        if (visuals.length > 0) {
          loadedVisual = visuals[0];
          setCurrentVisual(loadedVisual);
        } else {
          setCurrentVisual(null);
        }
      } catch (e) {
        console.error('Failed to load visual by conversation_id:', e);
        setCurrentVisual(null);
      }
    }
    
    // Set category based on visual type to allow continuing the conversation
    if (loadedVisual?.visual_type) {
      setSelectedCategory({ id: loadedVisual.visual_type });
    } else {
      setSelectedCategory(null);
    }
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
    <div className="min-h-screen flex flex-col relative">
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
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={async (id) => {
          await base44.entities.Conversation.delete(id);
          setConversations(prev => prev.filter(c => c.id !== id));
          if (currentConversation?.id === id) {
            handleNewChat();
          }
        }}
        onSelectVisual={(v) => {
          setCurrentVisual(v);
          // Set category based on visual type to enable editing prompt
          if (v.visual_type) {
            setSelectedCategory({ id: v.visual_type });
          }
        }}
        onLogin={handleLogin}
        onLogout={handleLogout}
        sidebarTitle={settings.sidebar_title}
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

            {/* Category Selector */}
            <CategorySelector 
              onSelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6 pb-32 md:pb-48">
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
                  <div className="w-full max-w-md relative">
                    {/* Favorites Button - Outside card, top right of image */}
                    <button
                      onClick={() => setShowFavoritesModal(true)}
                      className="absolute -right-3 top-3 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 translate-x-full"
                    >
                      <Heart className={cn("h-3.5 w-3.5", favoriteVisuals.length > 0 && "fill-white")} />
                      <span className="text-xs font-medium whitespace-nowrap">
                        {language === 'fr' ? 'Mes favoris' : 'My favorites'}
                      </span>
                      {favoriteVisuals.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                          {favoriteVisuals.length}
                        </span>
                      )}
                    </button>

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
                      onPromptClick={(prompt) => {
                        setInputValue(prompt);
                        setTimeout(() => {
                          if (inputRef.current) {
                            inputRef.current.style.height = 'auto';
                            inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
                            inputRef.current.focus();
                          }
                        }, 0);
                      }}
                      isRegenerating={isGenerating}
                      canDownload={canDownload}
                      hasWatermark={hasWatermark}
                      showValidation={true}
                      showActions={true}
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
          
          <div className="relative max-w-2xl mx-auto px-4 pb-6 md:pb-4">
            {/* Free Prompt Warning */}
            <AnimatePresence>
              {!selectedCategory && inputValue.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mb-3"
                >
                  <div className="flex items-start gap-3 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 border border-orange-500 rounded-xl">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-orange-300 text-sm font-medium mb-1">
                        {language === 'fr' ? 'Mode Prompt 100% libre activé' : '100% Free Prompt mode activated'}
                      </p>
                      <p className="text-orange-200 text-xs leading-relaxed">
                        {language === 'fr' 
                          ? 'Vous n\'avez pas sélectionné de format ci-dessus ou dans l\'icône + de ce prompt. Votre prompt sera envoyé brut à l\'IA, sans assistance ni optimisation automatique d\'iGPT. Pour de meilleurs résultats, choisissez un format adapté et optimisé à votre besoin.'
                          : 'You haven\'t selected a format above or in the + icon of this prompt. Your prompt will be sent raw to the AI, without assistance or automatic optimization from iGPT. For better results, choose a suitable format.'
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                {/* Plus Category Menu */}
                <DropdownMenu open={categoryDropdownOpen} onOpenChange={setCategoryDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 text-white/40 hover:text-white/60 transition-colors">
                      <Plus className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72 bg-gray-900/95 backdrop-blur-xl border border-white/10 p-0">
                    <DropdownMenuLabel className="text-white/50 text-xs px-3 py-2">
                      {language === 'fr' ? 'Choisir un type de visuel' : 'Choose a visual type'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <div className="max-h-96 overflow-y-auto">
                      {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const isOpen = openSubmenu === category.id;
                        const isFreePrompt = category.isFreePrompt;

                        return (
                          <div key={category.id}>
                            <div
                              onClick={() => {
                                if (category.hasSubmenu) {
                                  setOpenSubmenu(isOpen ? null : category.id);
                                  setOpenNestedSubmenu(null);
                                } else {
                                  handleCategorySelect({ ...category, expertMode: expertMode[category.id] || false });
                                }
                              }}
                              className={cn(
                                "px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors",
                                "hover:bg-white/10",
                                isFreePrompt && "bg-blue-600/10 hover:bg-blue-600/20"
                              )}
                            >
                              <div className="p-1.5 rounded-lg bg-white/5">
                                <Icon className="h-4 w-4 text-white/70" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-white text-xs font-medium">{category.name[language]}</span>
                                  {category.hasSubmenu && (
                                    <ChevronDown className={cn(
                                      "h-3 w-3 text-white/40 transition-transform",
                                      isOpen && "rotate-180"
                                    )} />
                                  )}
                                </div>
                              </div>
                              {/* Switch + Badge */}
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {category.id === 'free_prompt' ? (
                                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-bold rounded-full">
                                    EXPERT
                                  </span>
                                ) : category.id === 'logo_picto' ? (
                                  <>
                                    <div className="relative inline-flex h-3 w-5 items-center rounded-full opacity-40 cursor-not-allowed bg-white/20">
                                      <span className="inline-block h-2 w-2 transform rounded-full bg-white translate-x-0.5" />
                                    </div>
                                    <span className="px-1.5 py-0.5 bg-blue-500/60 text-white text-[9px] font-medium rounded-full">
                                      ASSISTÉ
                                    </span>
                                  </>
                                ) : category.id === 'logo_complet' ? (
                                  <>
                                    <div className="relative inline-flex h-3 w-5 items-center rounded-full opacity-40 cursor-not-allowed bg-violet-600">
                                      <span className="inline-block h-2 w-2 transform rounded-full bg-white translate-x-2.5" />
                                    </div>
                                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-bold rounded-full">
                                      EXPERT
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={(e) => toggleExpertMode(category.id, e)}
                                      className={cn(
                                        "relative inline-flex h-3 w-5 items-center rounded-full transition-colors",
                                        expertMode[category.id] ? "bg-violet-600" : "bg-white/20"
                                      )}
                                    >
                                      <span className={cn(
                                        "inline-block h-2 w-2 transform rounded-full bg-white transition-transform",
                                        expertMode[category.id] ? "translate-x-2.5" : "translate-x-0.5"
                                      )} />
                                    </button>
                                    {expertMode[category.id] ? (
                                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-bold rounded-full">
                                        EXPERT
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 bg-blue-500/60 text-white text-[9px] font-medium rounded-full">
                                        ASSISTÉ
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Submenu content */}
                            {category.hasSubmenu && isOpen && (
                              <div className="bg-gray-800/50 border-t border-white/5">
                                {category.submenu.map((item) => (
                                  <div key={item.id}>
                                    <button
                                      onClick={() => {
                                        if (item.orientations) {
                                          setOpenNestedSubmenu(openNestedSubmenu === item.id ? null : item.id);
                                        } else {
                                          handleCategorySelect({ ...category, selectedSubmenu: item, expertMode: expertMode[category.id] || false });
                                        }
                                      }}
                                      className="w-full px-6 py-2 text-left text-white/70 text-xs hover:bg-white/10 transition-colors flex items-center justify-between"
                                    >
                                      {item.name[language]}
                                      {item.orientations && (
                                        <ChevronRight className={cn(
                                          "h-3 w-3 text-white/40 transition-transform",
                                          openNestedSubmenu === item.id && "rotate-90"
                                        )} />
                                      )}
                                    </button>

                                    {/* Nested orientations */}
                                    {item.orientations && openNestedSubmenu === item.id && (
                                      <div className="bg-gray-700/50">
                                        {item.orientations.map((orientation) => (
                                          <button
                                            key={orientation.id}
                                            onClick={() => handleCategorySelect({ ...category, selectedSubmenu: { ...item, ...orientation }, expertMode: expertMode[category.id] || false })}
                                            className="w-full px-8 py-1.5 text-left text-white/60 text-xs hover:bg-white/10 transition-colors"
                                          >
                                            {orientation.name[language]}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <Link 
                      to={createPageUrl('Store')}
                      className="px-3 py-2.5 flex items-center gap-3 hover:bg-violet-500/20 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="text-violet-300 text-xs font-medium">iGPT Store</span>
                      </div>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={language === 'fr' ? 'Décrivez votre visuel...' : 'Describe your visual...'}
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-sm resize-none overflow-hidden min-h-[24px] max-h-[200px]"
                  rows={1}
                  disabled={isGenerating}
                  style={{ height: '24px' }}
                />

                <button className="p-2 text-white/40 hover:text-white/60 transition-colors">
                  <Mic className="h-5 w-5" />
                </button>

                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isGenerating}
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
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/40 bg-[#0a0a0f]/90 backdrop-blur-sm -mx-4 px-4 py-3 rounded-lg border-t border-white/5">
              <Link to={createPageUrl('Store')} className="hover:text-white/60 transition-colors">
                iGPT Store
              </Link>
              <span>•</span>
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null })}
        onConfirm={() => {
          if (confirmModal.action === 'format') {
            setShowFormatSelector(true);
            setShowStyleSelector(false);
          } else if (confirmModal.action === 'style') {
            setShowStyleSelector(true);
            setShowFormatSelector(false);
          }
        }}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        favorites={favoriteVisuals}
        onSelectVisual={(visual) => setCurrentVisual(visual)}
      />
      </div>
      );
      }