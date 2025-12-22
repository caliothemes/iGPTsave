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
import LoginRequiredModal from '@/components/LoginRequiredModal';
import NoCreditsModal from '@/components/NoCreditsModal';
import GuestCreditsModal from '@/components/GuestCreditsModal';
import Footer from '@/components/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Home() {
  const { t, language } = useLanguage();
  
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [sessionVisuals, setSessionVisuals] = useState([]);
  const [totalVisualsCount, setTotalVisualsCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVisual, setCurrentVisual] = useState(null);
  const [visualsHistory, setVisualsHistory] = useState([]); // All visuals generated in this conversation
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [promptTemplates, setPromptTemplates] = useState([]);
  const [promptExamples, setPromptExamples] = useState([]);
  const [currentPromptExamples, setCurrentPromptExamples] = useState([]);
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
  
  // Guest prompts tracking (3 max sans connexion)
  const [guestPrompts, setGuestPrompts] = useState(() => {
    const saved = localStorage.getItem('igpt_guest_prompts');
    return saved ? parseInt(saved) : 0;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showGuestCreditsModal, setShowGuestCreditsModal] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [showExamplesModal, setShowExamplesModal] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [promptMode, setPromptMode] = useState(null); // 'modify' or 'new'
  const [showModeSelector, setShowModeSelector] = useState(false);
  
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

          // Get total count of all visuals
          const allVisuals = await base44.entities.Visual.filter({ user_email: currentUser.email });
          setTotalVisualsCount(allVisuals.length);

          // Check if there's an editVisual parameter
          const urlParams = new URLSearchParams(window.location.search);
          const editVisualId = urlParams.get('editVisual');
          if (editVisualId) {
          try {
            const visualToEditArray = await base44.entities.Visual.filter({ id: editVisualId });
            if (visualToEditArray.length > 0) {
              const visualToEdit = visualToEditArray[0];
              setCurrentVisual(visualToEdit);
              setVisualsHistory([visualToEdit]);
              setMessages([{ 
                role: 'assistant', 
                content: '✨ ' + (language === 'fr' ? 'Voici votre visuel. Vous pouvez me demander de le modifier ou de créer des variations.' : 'Here is your visual. You can ask me to modify it or create variations.'),
                visual: visualToEdit
              }]);
              // Set category based on visual type to enable prompt
              if (visualToEdit.visual_type) {
                setSelectedCategory({ id: visualToEdit.visual_type });
              }
            }
          } catch (e) {
            console.error('Failed to load visual:', e);
          }
          }
          }
          } catch (e) {
          console.error(e);
          }

          // Load prompt templates and examples (for all users, including guests)
          try {
          const [templates, examples] = await Promise.all([
          base44.entities.PromptTemplate.filter({ is_active: true }),
          base44.entities.PromptExample.filter({ is_active: true })
          ]);
          setPromptTemplates(templates);
          setPromptExamples(examples);
          } catch (e) {
          console.error('Failed to load prompt templates/examples:', e);
          }

          setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentVisual]);

  // Auto-open assistant when conditions are met
  useEffect(() => {
    if (selectedCategory && selectedCategory.id !== 'free_prompt' && inputValue.trim().length > 10 && !isGenerating) {
      setAssistantOpen(true);
    }
  }, [selectedCategory, inputValue, isGenerating]);

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

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    const prompt = category.selectedSubmenu 
      ? (category.selectedSubmenu.prompt?.[language] || '')
      : (category.prompt?.[language] || '');
    setInputValue(prompt + ' ');
    setCategoryDropdownOpen(false);
    setOpenSubmenu(null);
    setOpenNestedSubmenu(null);
    
    // Load all prompt examples for this category
    const categoryId = category.id;
    const examples = promptExamples.filter(e => e.category === categoryId);
    setCurrentPromptExamples(examples);
    
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

    // Vérification des crédits AVANT la génération
    if (!user) {
      // Guest : max 3 prompts
      if (guestPrompts >= 3) {
        setShowGuestCreditsModal(true);
        return;
      }
    } else {
      // User connecté : vérifier les crédits
      const totalCredits = (credits?.free_downloads || 0) + (credits?.paid_credits || 0);
      const isUnlimited = credits?.subscription_type === 'unlimited';
      const isAdmin = user?.role === 'admin';
      
      if (!isAdmin && !isUnlimited && totalCredits <= 0) {
        setShowNoCreditsModal(true);
        return;
      }
    }

    // Auto-select free_prompt if no category selected
    let activeCategory = selectedCategory;
    if (!activeCategory) {
      const freePromptCategory = CATEGORIES.find(c => c.id === 'free_prompt');
      activeCategory = freePromptCategory;
      setSelectedCategory(freePromptCategory);
    }
    
    const userMessage = inputValue.trim();
    
    // Utiliser le mode choisi par l'utilisateur
    const isModification = promptMode === 'modify' && currentVisual;
    let finalPrompt = userMessage;
    let displayMessage = userMessage;
    
    if (isModification) {
      // Enrichir le prompt avec l'instruction de modification
      finalPrompt = `${currentVisual.image_prompt || currentVisual.original_prompt} MODIFICATION DEMANDÉE: ${userMessage}`;
      displayMessage = `✏️ ${userMessage}`;
    }
    
    // Reset mode après envoi
    setPromptMode(null);
    
    setInputValue('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = '24px';
    }
    setMessages(prev => [...prev, { role: 'user', content: displayMessage }]);
    setIsGenerating(true);
    
    // Reset currentVisual seulement si c'est un nouveau prompt
    if (promptMode === 'new') {
      setCurrentVisual(null);
    }

    const generatingMessage = isModification 
      ? (language === 'fr' ? '✨ Modification en cours...' : '✨ Modifying...')
      : t('generating');
    setMessages(prev => [...prev, { role: 'assistant', content: generatingMessage, isStreaming: true }]);

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
      // Déduire 1 crédit AVANT la génération
      if (user && credits) {
        if (credits.free_downloads > 0) {
          await base44.entities.UserCredits.update(credits.id, { free_downloads: credits.free_downloads - 1 });
          setCredits(prev => ({ ...prev, free_downloads: prev.free_downloads - 1 }));
        } else if (credits.paid_credits > 0) {
          await base44.entities.UserCredits.update(credits.id, { paid_credits: credits.paid_credits - 1 });
          setCredits(prev => ({ ...prev, paid_credits: prev.paid_credits - 1 }));
        }
      } else if (!user) {
        // Guest : incrémenter le compteur
        const newCount = guestPrompts + 1;
        setGuestPrompts(newCount);
        localStorage.setItem('igpt_guest_prompts', newCount.toString());
      }

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
            } else if (activeCategory?.id === 'print') {
              // Design PRINT plein écran - AUCUN cadre, étalement total du design
              enhancedPrompt = `${userMessage}, complete full bleed design filling entire canvas edge to edge, total surface coverage with design elements spreading to all corners and borders, wallpaper style layout covering 100% of area, seamless infinity pattern extending beyond frame, continuous design with no empty margins or white space, professional print-ready full bleed artwork --no border --no white space --no frame --no margin --no padding --no mockup --no card --no centered element --no floating object --no canvas --no mat --no mount --no white background --no empty area --no negative space around design --no perspective --no 3d --no shadow --no text --no letters --no typography`;
            } else if (activeCategory?.id === 'social') {
              // Design à plat pour social (NE PAS MODIFIER - fonctionne bien)
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

        // Si c'est une modification, utiliser le prompt enrichi directement
        const promptToUse = isModification ? finalPrompt : enhancedPrompt;
        console.log(isModification ? '🔄 Modification détectée - Prompt enrichi:' : '🎨 Nouveau prompt:', promptToUse);

        const result = await base44.integrations.Core.GenerateImage({
        prompt: promptToUse
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
          original_prompt: isModification 
            ? `${currentVisual.original_prompt} • MODIFICATION: ${userMessage}`
            : userMessage,
          image_prompt: isModification ? finalPrompt : enhancedPrompt,
          dimensions: dimensions,
          visual_type: activeCategory?.id,
          style: selectedStyle?.name?.[language] || selectedStyle?.name?.fr || null,
          color_palette: extractedColors
        };

        let savedVisual = visualData;
        if (user) {
          savedVisual = await base44.entities.Visual.create(visualData);
          setSessionVisuals(prev => [savedVisual, ...prev]);
        }

        setCurrentVisual(savedVisual);
        setVisualsHistory(prev => [...prev, savedVisual]); // Add to history

        const successMessage = isModification
          ? (language === 'fr' 
              ? '✨ Modification appliquée ! Cependant, je suis obligé de créer une nouvelle image car je ne peux pas modifier directement l\'image précédente. J\'ai enrichi votre prompt original avec votre demande de modification pour générer cette nouvelle version.' 
              : '✨ Modification applied! However, I had to create a new image as I cannot directly modify the previous one. I enriched your original prompt with your modification request to generate this new version.')
          : `✨ ${language === 'fr' ? 'Votre visuel est prêt !' : 'Your visual is ready!'}`;

        // Add both text message AND visual card
        setMessages(prev => [
          ...prev.slice(0, -1), // Remove "generating" message
          { role: 'assistant', content: successMessage },
          { role: 'assistant', content: '', visual: savedVisual } // Separate visual card
        ]);

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
    // Vérification des crédits AVANT régénération
    if (!user) {
      // Guest : max 3 prompts
      if (guestPrompts >= 3) {
        setShowGuestCreditsModal(true);
        return;
      }
    } else if (credits) {
      const totalCredits = (credits?.free_downloads || 0) + (credits?.paid_credits || 0);
      const isUnlimited = credits?.subscription_type === 'unlimited';
      const isAdmin = user?.role === 'admin';

      if (!isAdmin && !isUnlimited && totalCredits <= 0) {
        setShowNoCreditsModal(true);
        return;
      }
    }

    setIsGenerating(true);
    // Add typing indicator message
    setMessages(prev => [...prev, { role: 'assistant', content: t('generating'), isStreaming: true }]);

    try {
      // Deduct credit before generation
      if (!user) {
        // Guest: increment counter
        const newCount = guestPrompts + 1;
        setGuestPrompts(newCount);
        localStorage.setItem('igpt_guest_prompts', newCount.toString());
      } else if (credits) {
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
        setVisualsHistory(prev => [...prev, newVisual]); // Add regenerated to history

        // Add new version message + visual card
        setMessages(prev => [
          ...prev.slice(0, -1), // Remove "generating" message
          { role: 'assistant', content: t('newVersion') },
          { role: 'assistant', content: '', visual: newVisual } // Separate visual message
        ]);
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
    // Download is now free - no credit deduction
  };

  const handleNewChat = () => {
    setCurrentVisual(null);
    setVisualsHistory([]);
    setCurrentConversation(null);
    setSelectedCategory(null);
    setSelectedFormat(null);
    setSelectedStyle(null);
    setSelectedPalette(null);
    setMessages([]);
  };
  
  const handleSelectConversation = async (conv) => {
    setCurrentConversation(conv);
    setCurrentVisual(null);
    setVisualsHistory([]);

    // Load ALL visuals associated with this conversation for history
    try {
      const visuals = await base44.entities.Visual.filter({ conversation_id: conv.id }, 'created_date'); // Oldest first
      if (visuals.length > 0) {
        setVisualsHistory(visuals);
        setCurrentVisual(visuals[visuals.length - 1]); // Most recent as current

        // Reconstruct messages with visuals attached
        const baseMessages = conv.messages || [];
        const reconstructedMessages = [];
        let visualIdx = 0;

        // For each message, attach visuals after assistant success messages
        for (let i = 0; i < baseMessages.length; i++) {
          reconstructedMessages.push(baseMessages[i]);

          // If this is an assistant message indicating success, add the next visual
          if (baseMessages[i].role === 'assistant' && 
              (baseMessages[i].content.includes('prêt') || 
               baseMessages[i].content.includes('ready') ||
               baseMessages[i].content.includes('version') ||
               baseMessages[i].content.includes('✨'))) {
            // Add visual in chronological order
            const visualToAdd = visuals[visualIdx];
            if (visualToAdd) {
              reconstructedMessages.push({
                role: 'assistant',
                content: '',
                visual: visualToAdd
              });
              visualIdx++;
            }
          }
        }

        setMessages(reconstructedMessages);

        // Set category based on visual type
        if (visuals[0]?.visual_type) {
          setSelectedCategory({ id: visuals[0].visual_type });
        }
      } else {
        // No visuals, just show messages
        setMessages(conv.messages || []);
      }
    } catch (e) {
      console.error('Failed to load visuals for conversation:', e);
      setMessages(conv.messages || []);
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

    // Update in messages history
    setMessages(prev => prev.map(m => 
      m.visual?.id === updatedVisual.id ? { ...m, visual: updatedVisual } : m
    ));

    setCurrentVisual(updatedVisual);
    setSessionVisuals(prev => prev.map(v => v.id === updatedVisual.id ? updatedVisual : v));
    setShowEditor(false);
    setEditingVisual(null);
  };

  const handleCropComplete = (newImageUrl) => {
    // Update current visual with cropped image
    if (currentVisual) {
      const updatedVisual = {
        ...currentVisual,
        image_url: newImageUrl,
        original_image_url: currentVisual.original_image_url || currentVisual.image_url
      };

      // Update in messages history
      setMessages(prev => prev.map(m => 
        m.visual?.id === updatedVisual.id ? { ...m, visual: updatedVisual } : m
      ));

      setCurrentVisual(updatedVisual);
      setSessionVisuals(prev => prev.map(v => v.id === updatedVisual.id ? updatedVisual : v));
    }
  };

  const handleVideoGenerated = async (videoUrl, animationPrompt) => {
    // Create new visual with video
    const videoVisualData = {
      user_email: user?.email || 'anonymous',
      conversation_id: currentConversation?.id,
      image_url: videoUrl,
      video_url: videoUrl,
      title: currentVisual.title + ' (Vidéo)',
      original_prompt: animationPrompt,
      dimensions: currentVisual.dimensions,
      visual_type: currentVisual.visual_type,
      parent_visual_id: currentVisual.id
    };

    let newVisual = videoVisualData;
    if (user) {
      newVisual = await base44.entities.Visual.create(videoVisualData);
      setSessionVisuals(prev => [newVisual, ...prev]);
    }

    setCurrentVisual(newVisual);
    setVisualsHistory(prev => [...prev, newVisual]);
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: `✨ ${language === 'fr' ? 'Votre vidéo est prête !' : 'Your video is ready!'}` },
      { role: 'assistant', content: '', visual: newVisual }
    ]);
  };

  const handleBackToImage = async () => {
    if (currentVisual?.parent_visual_id) {
      try {
        const parentVisuals = await base44.entities.Visual.filter({ id: currentVisual.parent_visual_id });
        if (parentVisuals.length > 0) {
          setCurrentVisual(parentVisuals[0]);
        }
      } catch (e) {
        console.error('Failed to load parent visual:', e);
      }
    }
  };

  const handleLogin = () => base44.auth.redirectToLogin(createPageUrl('Home'));
  const handleLogout = () => base44.auth.logout(createPageUrl('Home'));

  const canDownload = user && credits && ((credits.free_downloads || 0) + (credits.paid_credits || 0) > 0 || credits.subscription_type === 'unlimited' || user.role === 'admin');
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
        onUpdateConversation={async (id, updates) => {
          await base44.entities.Conversation.update(id, updates);
          setConversations(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
          if (currentConversation?.id === id) {
            setCurrentConversation(prev => ({ ...prev, ...updates }));
          }
        }}
        onSelectVisual={(v) => {
          setCurrentVisual(v);
          setVisualsHistory([v]);
          // Add visual to chat messages
          setMessages([{ 
            role: 'assistant', 
            content: '✨ ' + (language === 'fr' ? 'Voici votre visuel. Vous pouvez me demander de le modifier ou de créer des variations.' : 'Here is your visual. You can ask me to modify it or create variations.'),
            visual: v
          }]);
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
          <div className="flex-1 flex flex-col items-center justify-start px-4 pb-[500px] pt-16 overflow-y-auto">
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
            <p className="text-base md:text-lg mb-3 text-center">
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-medium">
                {getHomeSubtitle()}
              </span>
            </p>
            {(settings.home_text3_fr || settings.home_text3_en) && (
              <div className="flex justify-center mb-2">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/30 via-amber-500/30 to-yellow-500/30 border border-yellow-500/50 backdrop-blur-sm shadow-lg shadow-yellow-500/20">
                  <span className="text-xs md:text-sm text-yellow-100 font-medium">
                    {language === 'fr' ? (settings.home_text3_fr || '') : (settings.home_text3_en || settings.home_text3_fr || '')}
                  </span>
                </div>
              </div>
            )}
            {(settings.home_text4_fr || settings.home_text4_en) && (
              <p className="text-[10px] md:text-xs mb-12 text-center">
                <span className="text-white/50">
                  {language === 'fr' ? (settings.home_text4_fr || '') : (settings.home_text4_en || settings.home_text4_fr || '')}
                </span>
              </p>
            )}
            {!settings.home_text3_fr && !settings.home_text3_en && !settings.home_text4_fr && !settings.home_text4_en && (
              <div className="mb-12" />
            )}

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


          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6 pb-96">
            <div className="max-w-3xl mx-auto space-y-4">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <React.Fragment key={idx}>
                    {/* Message bubble */}
                    {msg.content && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <MessageBubble message={msg} isStreaming={msg.isStreaming} user={user} />
                      </motion.div>
                    )}

                    {/* Visual card - right after the message if it has one */}
                    {msg.visual && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-center"
                      >
                        <div className="w-full max-w-md relative">
                          {/* Favorites Button - Only on last visual */}
                          {idx === messages.length - 1 && (
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
                          )}

                          <VisualCard
                            visual={msg.visual}
                            onRegenerate={handleRegenerate}
                            onDownload={handleDownload}
                            onToggleFavorite={async (v) => {
                              if (user && v.id) {
                                await base44.entities.Visual.update(v.id, { is_favorite: !v.is_favorite });
                                setMessages(prev => prev.map((m, i) => 
                                  i === idx && m.visual ? { ...m, visual: { ...m.visual, is_favorite: !v.is_favorite } } : m
                                ));
                                if (currentVisual?.id === v.id) {
                                  setCurrentVisual({ ...v, is_favorite: !v.is_favorite });
                                }
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
                            onVideoGenerated={handleVideoGenerated}
                            onBackToImage={handleBackToImage}
                            onCropComplete={(newUrl) => {
                              setMessages(prev => prev.map((m, i) => 
                                i === idx && m.visual ? { ...m, visual: { ...m.visual, image_url: newUrl } } : m
                              ));
                              if (currentVisual?.id === msg.visual.id) {
                                setCurrentVisual({ ...msg.visual, image_url: newUrl });
                              }
                            }}
                            isRegenerating={isGenerating && msg.visual?.id === currentVisual?.id}
                            canDownload={canDownload}
                            hasWatermark={hasWatermark}
                            showValidation={true}
                            showActions={true}
                            onValidate={(action) => {
                              if (action === 'edit') {
                                handleOpenEditor(msg.visual);
                              }
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
              </AnimatePresence>

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
                  <div className="flex items-start gap-3 px-4 py-3 bg-gradient-to-r from-orange-800/80 to-red-900/80 border border-orange-700/50 rounded-xl">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-orange-700 to-red-800 flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-orange-200 text-sm font-medium mb-1">
                        {language === 'fr' ? 'Mode Prompt 100% libre activé' : '100% Free Prompt mode activated'}
                      </p>
                      <p className="text-orange-300/90 text-xs leading-relaxed">
                        {language === 'fr' 
                          ? 'Vous n\'avez pas sélectionné de catégorie dans le menu "Catégories" du prompt. Votre prompt sera envoyé brut à l\'IA, sans assistance ni optimisation automatique d\'iGPT. Pour de meilleurs résultats, choisissez une catégorie adaptée à votre besoin (Logo, Print, Posts/Story, etc.).'
                          : 'You haven\'t selected a category in the "Categories" menu in the prompt. Your prompt will be sent raw to the AI, without assistance or automatic optimization from iGPT. For better results, choose a suitable category (Logo, Print, Social, etc.).'
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Assistant Suggestions */}
            <AnimatePresence>
              {selectedCategory && selectedCategory.id !== 'free_prompt' && inputValue.trim().length > 10 && !isGenerating && (
                assistantOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mb-3"
                  >
                    <div className="relative bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-md border border-violet-500/20 rounded-xl overflow-hidden">
                      {/* Animated gradient border effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-blue-500/20 animate-pulse" style={{ opacity: 0.3 }} />

                      <div className="relative flex items-start gap-3 px-4 py-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-500/20 flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-violet-300 text-sm font-semibold">
                              {language === 'fr' ? '✨ Assistant iGPT' : '✨ iGPT Assistant'}
                            </span>
                            <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 text-[10px] font-medium rounded-full">
                              {language === 'fr' ? 'CONSEIL' : 'TIP'}
                            </span>
                          </div>
                          <p className="text-violet-200 text-xs leading-relaxed">
                            {(() => {
                              const categoryId = selectedCategory?.id;
                              const categoryTemplates = promptTemplates.filter(t => t.category === categoryId && !t.subcategory);
                              const template = categoryTemplates.length > 0 ? categoryTemplates[0] : null;
                              
                              if (template && (language === 'fr' ? template.assistant_text_fr : template.assistant_text_en)) {
                                return language === 'fr' ? template.assistant_text_fr : (template.assistant_text_en || template.assistant_text_fr);
                              }
                              
                              return language === 'fr' 
                                ? 'Pour des résultats optimaux, ajoutez un style (moderne, vintage...), des couleurs précises, une ambiance (élégante, dynamique...) et des détails spécifiques à votre création.'
                                : 'For optimal results, add a style (modern, vintage...), precise colors, a mood (elegant, dynamic...) and specific details to your creation.';
                            })()}
                          </p>

{/* Example prompts cliquables - Max 2 */}
{currentPromptExamples.length > 0 && (
  <div className="mt-3 pt-3 border-t border-violet-500/20">
    <p className="text-violet-300 text-[11px] font-medium mb-1.5">
      {language === 'fr' ? '💡 Exemples :' : '💡 Examples:'}
    </p>
    <div className="space-y-2">
      {currentPromptExamples.slice(0, 2).map((example, idx) => (
        <button
          key={idx}
          onClick={() => {
            const exampleText = language === 'fr' 
              ? example.example_text_fr 
              : (example.example_text_en || example.example_text_fr);
            setInputValue(exampleText);
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.style.height = 'auto';
                inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
                inputRef.current.focus();
              }
            }, 0);
          }}
          className="text-left w-full px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-400/20 hover:border-violet-400/40 rounded-lg text-violet-100 text-xs transition-all"
        >
          "{language === 'fr' 
            ? example.example_text_fr 
            : (example.example_text_en || example.example_text_fr)}"
        </button>
      ))}
    </div>
    {currentPromptExamples.length > 2 && (
      <button
        onClick={() => setShowExamplesModal(true)}
        className="w-full mt-2 px-3 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 hover:border-violet-500/50 rounded-lg text-violet-200 text-xs font-medium transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {language === 'fr' ? 'Voir d\'autres exemples de prompt' : 'See more prompt examples'}
      </button>
    )}
    <p className="text-violet-300/60 text-[10px] mt-1.5">
      {language === 'fr' ? '👆 Cliquez pour ajouter un exemple' : '👆 Click to add an example'}
    </p>
  </div>
)}
                        </div>
                        <button
                          onClick={() => setAssistantOpen(false)}
                          className="p-1 rounded-lg hover:bg-violet-500/20 text-violet-300 hover:text-white transition-colors"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mb-3"
                  >
                    <button
                      onClick={() => setAssistantOpen(true)}
                      className="w-full px-4 py-2 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-md border border-violet-500/20 rounded-xl hover:border-violet-500/40 transition-all flex items-center gap-2"
                    >
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-500/20">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <span className="text-violet-300 text-xs font-medium">
                        {language === 'fr' ? '✨ Assistant iGPT' : '✨ iGPT Assistant'}
                      </span>
                      <ChevronRight className="h-4 w-4 text-violet-300 ml-auto" />
                    </button>
                  </motion.div>
                )
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



            {/* Input Bar */}
            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              {/* Ligne principale - Textarea + boutons */}
              <div className="flex items-center gap-2 px-4 py-3">
                {/* Plus Menu */}
                <DropdownMenu open={categoryDropdownOpen} onOpenChange={setCategoryDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 text-white/40 hover:text-white/60 transition-colors">
                      <Plus className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72 bg-gray-900/95 backdrop-blur-xl border border-white/10 p-2">
                    <Link 
                      to={createPageUrl('Account')}
                      className="mb-2 px-4 py-3 flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-lg transition-all"
                    >
                      <div className="p-2 rounded-lg bg-white/5">
                        <svg className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-bold">
                          {language === 'fr' ? 'Mon compte' : 'My account'}
                        </div>
                        <div className="text-white/80 text-xs">
                          {language === 'fr' ? 'Paramètres et profil' : 'Settings and profile'}
                        </div>
                      </div>
                      <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link 
                      to={createPageUrl('Pricing')}
                      className="mb-2 px-4 py-3 flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-lg transition-all"
                    >
                      <div className="p-2 rounded-lg bg-white/5">
                        <svg className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-bold">
                          {language === 'fr' ? 'Tarifs' : 'Pricing'}
                        </div>
                        <div className="text-white/80 text-xs">
                          {language === 'fr' ? 'Nos offres et abonnements' : 'Our plans and subscriptions'}
                        </div>
                      </div>
                      <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link 
                      to={createPageUrl('Support')}
                      className="mb-2 px-4 py-3 flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-lg transition-all"
                    >
                      <div className="p-2 rounded-lg bg-white/5">
                        <svg className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-bold">
                          {language === 'fr' ? 'Support & FAQ' : 'Support & FAQ'}
                        </div>
                        <div className="text-white/80 text-xs">
                          {language === 'fr' ? 'Aide et questions fréquentes' : 'Help and frequently asked questions'}
                        </div>
                      </div>
                      <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link 
                      to={createPageUrl('MyVisuals')}
                      className="mb-2 px-4 py-3 flex items-center gap-3 bg-gradient-to-r from-blue-900/40 to-white/[0.03] hover:from-blue-900/50 hover:to-white/[0.08] border border-white/10 hover:border-blue-500/20 rounded-lg transition-all"
                    >
                      <div className="p-2 rounded-lg bg-white/5">
                        <svg className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-bold">
                            {language === 'fr' ? 'Mes visuels' : 'My visuals'}
                          </span>
                          {totalVisualsCount > 0 && (
                            <span className="px-2 py-0.5 bg-white/20 border border-white/30 rounded-full text-white text-xs font-semibold">
                              {totalVisualsCount}
                            </span>
                          )}
                        </div>
                        <div className="text-white/80 text-xs">
                          {language === 'fr' ? 'Tous vos visuels créés' : 'All your created visuals'}
                        </div>
                      </div>
                      <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link 
                      to={createPageUrl('Store')}
                      className="px-4 py-3 flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
                    >
                      <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-bold">iGPT Store</div>
                        <div className="text-white/80 text-xs">
                          {language === 'fr' ? 'Visuels prêts à l\'emploi' : 'Ready-to-use visuals'}
                        </div>
                      </div>
                      <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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
                  onFocus={() => {
                    // Si une image est présente et qu'aucun mode n'est sélectionné, demander
                    if (currentVisual && !promptMode && !isGenerating) {
                      setShowModeSelector(true);
                    }
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

              {/* Tags sous le prompt - Collapsible en mobile uniquement */}
              <div className="px-4 pb-2 border-t border-white/5 pt-2">
                <div className={cn(
                  "flex items-center gap-1.5 flex-wrap transition-all",
                  !tagsExpanded && "max-md:max-h-8 max-md:overflow-hidden"
                )}>
                {/* Tag Format - Couleur spéciale */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "px-2 py-1 rounded-full text-[11px] font-medium transition-all border flex items-center gap-1",
                      selectedFormat
                        ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-amber-600/10 border-amber-500/20 text-amber-300 hover:bg-amber-600/20"
                    )}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      {selectedFormat ? selectedFormat.name : (language === 'fr' ? 'Format' : 'Format')}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10">
                    <DropdownMenuItem onClick={() => setSelectedFormat({ name: language === 'fr' ? 'Carré 1:1' : 'Square 1:1', dimensions: '1080x1080' })} className="text-white">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="6" y="6" width="12" height="12" />
                      </svg>
                      {language === 'fr' ? 'Carré 1:1' : 'Square 1:1'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFormat({ name: language === 'fr' ? 'Story 9:16' : 'Story 9:16', dimensions: '1080x1920' })} className="text-white">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="8" y="3" width="8" height="18" />
                      </svg>
                      {language === 'fr' ? 'Story 9:16' : 'Story 9:16'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFormat({ name: language === 'fr' ? 'Portrait 3:4' : 'Portrait 3:4', dimensions: '1080x1440' })} className="text-white">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="7" y="4" width="10" height="16" />
                      </svg>
                      {language === 'fr' ? 'Portrait 3:4' : 'Portrait 3:4'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFormat({ name: language === 'fr' ? 'Paysage 16:9' : 'Landscape 16:9', dimensions: '1920x1080' })} className="text-white">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="8" width="18" height="8" />
                      </svg>
                      {language === 'fr' ? 'Paysage 16:9' : 'Landscape 16:9'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Tag Catégories - Menu déroulant */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "px-2 py-1 rounded-full text-[11px] font-medium transition-all border flex items-center gap-1",
                      selectedCategory
                        ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-violet-600/10 border-violet-500/20 text-violet-300 hover:bg-violet-600/20"
                    )}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      {selectedCategory ? (selectedCategory?.name?.[language] || selectedCategory?.name?.fr) : (language === 'fr' ? 'Catégories' : 'Categories')}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10 max-h-96 overflow-y-auto">
                    {CATEGORIES.filter(c => ['logo_picto', 'logo_complet', 'image', 'print', 'social', 'mockup', 'product', 'design_3d', 'free_prompt'].includes(c.id)).map(cat => (
                      <DropdownMenuItem 
                        key={cat.id}
                        onClick={() => handleCategorySelect({ ...cat, expertMode: expertMode[cat.id] || false })}
                        className="text-white"
                      >
                        {cat?.name?.[language] || cat?.name?.fr || 'N/A'}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Tag iGPT Store */}
                <Link
                  to={createPageUrl('Store')}
                  className="px-2 py-1 rounded-full text-[11px] font-medium transition-all bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md"
                >
                  {language === 'fr' ? 'iGPT Store' : 'iGPT Store'}
                </Link>

                {/* Tag Mes visuels */}
                <Link
                  to={createPageUrl('MyVisuals')}
                  className="px-2 py-1 rounded-full text-[11px] font-medium transition-all bg-blue-900/90 hover:bg-blue-900 border border-white/10 hover:border-white/20 text-white shadow-md flex items-center gap-1"
                >
                  {language === 'fr' ? 'Mes visuels' : 'My visuals'}
                  {totalVisualsCount > 0 && (
                    <span className="px-1 py-0.5 bg-white/20 rounded-full text-[9px]">
                      {totalVisualsCount}
                    </span>
                  )}
                </Link>
                </div>

                {/* Toggle button - visible en mobile uniquement */}
                <button
                  onClick={() => setTagsExpanded(!tagsExpanded)}
                  className="md:hidden w-full mt-2 flex items-center justify-center gap-2 text-white/50 hover:text-white/70 text-xs transition-colors"
                >
                  {tagsExpanded ? (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      {language === 'fr' ? 'Réduire' : 'Collapse'}
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-3 w-3" />
                      {language === 'fr' ? 'Voir plus' : 'See more'}
                    </>
                  )}
                </button>
                </div>
            </div>

            {/* Footer Links */}
            <div className="-mx-4 mt-6 md:mt-3">
              <Footer />
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

      {/* Login Modal for Guests */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        guestPromptsUsed={guestPrompts}
      />

      {/* No Credits Modal for Users */}
      <NoCreditsModal
        isOpen={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
        onRecharge={() => window.location.href = createPageUrl('Pricing')}
      />

      {/* Guest Credits Modal */}
      <GuestCreditsModal
        isOpen={showGuestCreditsModal}
        onClose={() => setShowGuestCreditsModal(false)}
        onCreateAccount={handleLogin}
      />

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
          } else if (confirmModal.action === 'recharge') {
            window.location.href = createPageUrl('Pricing');
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

      {/* Mode Selector Modal */}
      <AnimatePresence>
        {showModeSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModeSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900/95 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-3">
                {language === 'fr' ? '🎨 Que souhaitez-vous faire ?' : '🎨 What would you like to do?'}
              </h3>
              <p className="text-white/60 text-sm mb-6">
                {language === 'fr' 
                  ? 'Voulez-vous modifier l\'image actuelle ou créer un nouveau visuel ?'
                  : 'Do you want to modify the current image or create a new visual?'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setPromptMode('modify');
                    setShowModeSelector(false);
                    inputRef.current?.focus();
                  }}
                  className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>
                    {language === 'fr' ? 'Modifier l\'image actuelle' : 'Modify current image'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setPromptMode('new');
                    setShowModeSelector(false);
                    inputRef.current?.focus();
                  }}
                  className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>
                    {language === 'fr' ? 'Créer un nouveau visuel' : 'Create new visual'}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Examples Modal */}
      <Dialog open={showExamplesModal} onOpenChange={setShowExamplesModal}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-violet-500/30 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              {language === 'fr' ? '💡 Exemples de prompts' : '💡 Prompt Examples'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {currentPromptExamples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const exampleText = language === 'fr' 
                    ? example.example_text_fr 
                    : (example.example_text_en || example.example_text_fr);
                  setInputValue(exampleText);
                  setShowExamplesModal(false);
                  setTimeout(() => {
                    if (inputRef.current) {
                      inputRef.current.style.height = 'auto';
                      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
                      inputRef.current.focus();
                    }
                  }, 100);
                }}
                className="text-left w-full px-4 py-3 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-400/20 hover:border-violet-400/40 rounded-lg text-violet-100 text-sm transition-all"
              >
                <span className="text-violet-300 text-xs font-medium">#{idx + 1}</span>
                <p className="mt-1">"{language === 'fr' 
                  ? example.example_text_fr 
                  : (example.example_text_en || example.example_text_fr)}"</p>
              </button>
            ))}
          </div>
          <p className="text-violet-300/60 text-xs text-center mt-4">
            {language === 'fr' ? '👆 Cliquez sur un exemple pour l\'utiliser' : '👆 Click on an example to use it'}
          </p>
        </DialogContent>
      </Dialog>
      </div>
      );
      }