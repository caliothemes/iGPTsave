import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Send, Loader2, Plus, Mic, Palette, SlidersHorizontal, Upload, X, Heart, ChevronDown, ChevronRight, Wand2, Sparkles, Scissors, Video, Pencil, Users } from 'lucide-react';
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
import VideoGenerationModal from '@/components/chat/VideoGenerationModal';
import VideoExamplesModal from '@/components/chat/VideoExamplesModal';
import ImageEditExamplesModal from '@/components/chat/ImageEditExamplesModal';
import CropModal from '@/components/chat/CropModal';
import ImageEditModal from '@/components/chat/ImageEditModal';
import ArtDirectorModal from '@/components/ArtDirectorModal';
import FeaturesCarousel from '@/components/FeaturesCarousel';
import CanvaTextModal from '@/components/chat/CanvaTextModal';
import LoadingProgress from '@/components/LoadingProgress';

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
  const [isRecording, setIsRecording] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoVisual, setVideoVisual] = useState(null);
  const [showVideoExamplesModal, setShowVideoExamplesModal] = useState(false);
  const [showImageEditExamplesModal, setShowImageEditExamplesModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropVisual, setCropVisual] = useState(null);
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [imageEditVisual, setImageEditVisual] = useState(null);
  const [showVideoInfoModal, setShowVideoInfoModal] = useState(false);
  const [showRecentVisualsModal, setShowRecentVisualsModal] = useState(false);
  const [recentVisuals, setRecentVisuals] = useState([]);
  const [attachedImages, setAttachedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(0);
  const [artDirectors, setArtDirectors] = useState([]);
  const [selectedDA, setSelectedDA] = useState(null);
  const [showDAModal, setShowDAModal] = useState(false);
  const [editingDA, setEditingDA] = useState(null);
  const [canvaMode, setCanvaMode] = useState(false);
  const [showCanvaTextModal, setShowCanvaTextModal] = useState(false);
  const [canvaTexts, setCanvaTexts] = useState([]);
  const [canvaDecompose, setCanvaDecompose] = useState(false);


  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const allSettings = await base44.entities.AppSettings.list();
        const settingsMap = {};
        allSettings.forEach(s => {
          settingsMap[s.key] = s.value;
        });
        setSettings(settingsMap);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }

      // Load Art Directors
      try {
        const das = await base44.entities.ArtDirector.filter({ is_active: true }, '-created_date');
        setArtDirectors(das);
      } catch (e) {
        console.error('Failed to load art directors:', e);
      }
      
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
              free_downloads: 15,
              paid_credits: 0,
              subscription_type: 'free',
              last_free_reset: new Date().toISOString()
            });
            setCredits(newCredits);
          }
          
          const convs = await base44.entities.Conversation.filter({ user_email: currentUser.email }, '-updated_date', 20);
          setConversations(convs);
          
          const visuals = await base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 10);
          setSessionVisuals(visuals);

          const allVisuals = await base44.entities.Visual.filter({ user_email: currentUser.email });
          setTotalVisualsCount(allVisuals.length);

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
        console.error('Auth error:', e);
      }

      try {
        const [templates, examples] = await Promise.all([
          base44.entities.PromptTemplate.filter({ is_active: true }),
          base44.entities.PromptExample.filter({ is_active: true }, 'order')
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
    // Si c'est la catégorie vidéo, ouvrir le modal explicatif
    if (category.id === 'video') {
      setShowVideoInfoModal(true);
      return;
    }

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert(language === 'fr' ? 'Veuillez sélectionner une image' : 'Please select an image');
      return;
    }

    setIsGenerating(true);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: language === 'fr' ? '📤 Upload de votre image...' : '📤 Uploading your image...', 
      isStreaming: true 
    }]);

    try {
      // Upload image
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Get image dimensions
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = file_url;
      });
      const dimensions = `${img.width}x${img.height}`;

      // Create visual
      const visualData = {
        user_email: user?.email || 'anonymous',
        image_url: file_url,
        original_image_url: file_url,
        title: file.name.replace(/\.[^/.]+$/, ''),
        original_prompt: language === 'fr' ? 'Image uploadée' : 'Uploaded image',
        dimensions: dimensions,
        visual_type: 'image'
      };

      let savedVisual = visualData;
      if (user) {
        savedVisual = await base44.entities.Visual.create(visualData);
        setSessionVisuals(prev => [savedVisual, ...prev]);
      }

      setCurrentVisual(savedVisual);
      setVisualsHistory(prev => [...prev, savedVisual]);

      // Add success message + visual card
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: language === 'fr' 
          ? '✨ Image uploadée ! Vous pouvez maintenant la modifier ou la transformer.' 
          : '✨ Image uploaded! You can now edit or transform it.' 
        },
        { role: 'assistant', content: '', visual: savedVisual }
      ]);

      // Set category to enable editing
      setSelectedCategory({ id: 'image' });
    } catch (error) {
      console.error('Upload failed:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: language === 'fr' 
          ? '❌ Erreur lors de l\'upload. Veuillez réessayer.' 
          : '❌ Upload error. Please try again.' 
        }
      ]);
    } finally {
      setIsGenerating(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleAttachImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to 6 images
    if (attachedImages.length + files.length > 6) {
      alert(language === 'fr' ? 'Maximum 6 images' : 'Maximum 6 images');
      return;
    }

    setUploadingImages(files.length);

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;

      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setAttachedImages(prev => [...prev, file_url]);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploadingImages(prev => prev - 1);
      }
    }

    e.target.value = '';
  };

  const removeAttachedImage = (index) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(language === 'fr' 
        ? 'La reconnaissance vocale n\'est pas supportée par votre navigateur' 
        : 'Voice recognition is not supported by your browser');
      return;
    }

    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Start recording
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }

      if (finalTranscript) {
        setInputValue(prev => prev + (prev ? ' ' : '') + finalTranscript.trim());
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
            inputRef.current.focus();
          }
        }, 0);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      // Ne s'arrête que si on a cliqué pour arrêter
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage = inputValue.trim();
    
    // ÉTAPE 1: Détecter l'intention (conversation vs génération)
    setIsGenerating(true);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = '24px';
    }

    try {
      const intentDetection = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this user message and determine if it's:
    1. A GENERATION REQUEST (user wants to create/generate/modify a visual/image/logo/design/flyer/etc.)
    2. A CONVERSATION/QUESTION (user wants to chat, ask questions, greet, or get information)

    User message: "${userMessage}"

    Examples of GENERATION: "crée un logo", "génère une carte de visite", "fais moi un flyer", "je veux une affiche", "modify the colors", "change this"
    Examples of CONVERSATION: "bonjour", "salut", "tu peux faire des vidéos ?", "comment ça marche ?", "c'est quoi iGPT ?", "aide moi"

    Return ONLY: {"intent": "generate"} or {"intent": "conversation"}`,
        response_json_schema: {
          type: "object",
          properties: {
            intent: { type: "string", enum: ["generate", "conversation"] }
          }
        }
      });

      const intent = intentDetection.intent;
      console.log('🎯 Intent détecté:', intent);

      // ÉTAPE 2: Si c'est une conversation, répondre directement (0 crédit)
      if (intent === 'conversation') {
        // Ajouter le message utilisateur simple (sans metadata)
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setMessages(prev => [...prev, { role: 'assistant', content: t('thinking'), isStreaming: true }]);

        const conversationResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Tu es iGPT, un assistant IA dans l'application iGPT qui aide les utilisateurs à créer des visuels professionnels.

      Question de l'utilisateur: "${userMessage}"

      INSTRUCTIONS CRITIQUES:
      - Réponds en ${language === 'fr' ? 'français' : 'anglais'}
      - Sois PRÉCIS et explique COMMENT faire dans iGPT (pas de réponse générique)
      - Donne des étapes concrètes d'utilisation de l'interface
      - 2-4 phrases maximum, concis et direct

      COMMENT FONCTIONNE iGPT (à utiliser pour répondre précisément):

      1. CRÉATION D'IMAGES:
      - L'utilisateur décrit son visuel dans le prompt en bas
      - Il peut choisir une catégorie (Logo, Print, Social, etc.) via le menu "Catégories"
      - Il clique sur le bouton Envoyer (flèche bleue/violette)
      - iGPT génère l'image automatiquement

      2. GÉNÉRATION DE VIDÉOS (OUI c'est possible !):
      - ÉTAPE 1: Générer ou uploader une image d'abord
      - ÉTAPE 2: Cliquer sur l'icône vidéo rose/rouge sous l'image
      - ÉTAPE 3: Choisir le service (Kling, Wan, Sora ou RunwayML), la durée (5s ou 10s) et le format
      - ÉTAPE 4: Cliquer sur Générer
      - Les vidéos sont créées à partir d'images existantes, pas directement du texte

      3. ÉDITEUR MAGIQUE (ajouter du texte):
      - Cliquer sur l'icône violette Baguette magique sous une image générée
      - Ajouter/modifier du texte directement sur l'image
      - Personnaliser la police, couleur, position

      4. MODIFIER UNE IMAGE AVEC IA:
      - Cliquer sur l'icône orange Crayon sous une image
      - Décrire les modifications souhaitées
      - iGPT applique les changements intelligemment

      5. MODE CANVA (textes prédéfinis):
      - Cliquer sur le tag "Canva" sous le prompt
      - Entrer les textes à ajouter
      - iGPT génère l'image ET place les textes automatiquement

      6. CRÉDITS ET TARIFICATION:
         - Compte FREE: 150 crédits gratuits par mois (renouvelés automatiquement chaque mois)
         - Génération d'image: 1 crédit
         - Génération de vidéo: 200 crédits (5s) ou 300 crédits (10s) selon la durée et le service
         - Packs de crédits disponibles: 25€ pour 50 crédits, 50€ pour 120 crédits, etc.
         - Abonnements mensuels disponibles (voir "Tarifs" dans le menu +)
         - Les invités (non connectés) ont 3 prompts gratuits pour tester

      EXEMPLES DE BONNES RÉPONSES:

      Q: "Tu peux faire des vidéos ?"
      R: "Oui ! Génère ou uploade d'abord une image, puis clique sur l'icône vidéo rose sous l'image pour choisir tes options (Kling, Wan, Sora ou RunwayML) et créer ta vidéo."

      Q: "Comment créer une vidéo à partir d'une image ?"
      R: "Génère ton image ou uploade-la, puis clique sur l'icône vidéo rose sous l'image. Tu pourras choisir le service (Kling, Wan, Sora, RunwayML), la durée et le format avant de lancer la génération."

      Q: "Comment ajouter du texte sur une image ?"
      R: "Clique sur l'icône Baguette magique violette sous ton image pour ouvrir l'éditeur magique. Tu pourras ajouter et personnaliser des textes directement sur ton visuel."

      Q: "C'est quoi iGPT ?"
      R: "iGPT est ton assistant IA pour créer des visuels pro (logos, flyers, posts, etc.). Décris simplement ce que tu veux dans le prompt et je le crée pour toi. Tu peux aussi transformer tes images en vidéos, ajouter du texte avec l'éditeur magique, et bien plus !"

      Maintenant, réponds à la question de l'utilisateur de manière précise et utile:`
        });

        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: conversationResponse }
        ]);
        setIsGenerating(false);
        return;
      }

      // ÉTAPE 3: C'est une génération - vérifier les crédits
      if (!user) {
        // Guest : max 3 prompts
        if (guestPrompts >= 3) {
          setShowGuestCreditsModal(true);
          setIsGenerating(false);
          return;
        }
      } else {
        // User connecté : vérifier les crédits
        const totalCredits = (credits?.free_downloads || 0) + (credits?.paid_credits || 0);
        const isUnlimited = credits?.subscription_type === 'unlimited';
        const isAdmin = user?.role === 'admin';

        if (!isAdmin && !isUnlimited && totalCredits <= 0) {
          setShowNoCreditsModal(true);
          setIsGenerating(false);
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
      
      // Sauvegarder les images attachées AVANT de les clear
      const currentAttachedImages = [...attachedImages];
      
      // Clear attached images immediately
      setAttachedImages([]);
      
      // Reset currentVisual seulement si c'est un nouveau prompt
      if (promptMode === 'new') {
        setCurrentVisual(null);
      }

      // Ajouter le message utilisateur avec metadata
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: displayMessage,
        attachedImages: currentAttachedImages.length > 0 ? currentAttachedImages : undefined,
        artDirector: selectedDA ? selectedDA.name : null,
        canvaMode: canvaMode,
        canvaTextsCount: canvaTexts.length,
        selectedFormat: selectedFormat ? selectedFormat.name : null,
        selectedCategory: selectedCategory ? (selectedCategory?.name?.[language] || selectedCategory?.name?.fr) : null
      }]);

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


      // CAS NORMAL: Génération d'image
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

      // Détecter URL et analyser branding avec LLaMA 3.1
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const urls = userMessage.match(urlRegex);
      let brandingInfo = null;

      if (urls && urls.length > 0) {
        try {
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: language === 'fr' ? '🔍 Lecture du site web...' : '🔍 Reading website...', isStreaming: true }
          ]);
          
          const result = await base44.functions.invoke('analyzeBrandingFromURL', { 
            url: urls[0],
            userPrompt: userMessage.replace(urls[0], '').trim()
          });
          
          if (result.data?.branding) {
            brandingInfo = result.data.branding;
            console.log('✅ Branding extrait:', brandingInfo);
          }
        } catch (e) {
          console.error('❌ Échec analyse:', e);
        }
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
          } else if (activeCategory?.id === 'pub_ads') {
            // Publicité - Utiliser le prompt admin si disponible, sinon prompt par défaut
            const pubAdsTemplate = promptTemplates.find(t => t.category === 'pub_ads');
            const adminPrompt = settings.ads_base_prompt;

            if (adminPrompt) {
              enhancedPrompt = adminPrompt.replace('{userMessage}', userMessage).replace('{message}', userMessage);
            } else if (pubAdsTemplate) {
              const templateText = language === 'fr' ? pubAdsTemplate.prompt_fr : (pubAdsTemplate.prompt_en || pubAdsTemplate.prompt_fr);
              enhancedPrompt = templateText.replace('{userMessage}', userMessage).replace('{message}', userMessage);
            } else {
              enhancedPrompt = `advertising background image for ${userMessage}, professional ad backdrop, commercial photography style, clean and uncluttered background perfect for adding text overlays, marketing visual design, attention-grabbing composition, space for headlines and call-to-action, brand-oriented imagery --no text --no letters --no typography --no words --no writing`;
            }
          } else {
            enhancedPrompt = `${userMessage}, photorealistic, detailed, high quality`;
          }
          console.log('🤖 MODE ASSISTÉ - Prompt par défaut appliqué');
        }

        // Enrichir avec branding détaillé
        if (brandingInfo) {
          let brandPrompt = '';
          
          if (brandingInfo.brand_name) {
            brandPrompt += ` for ${brandingInfo.brand_name}`;
          }
          
          if (brandingInfo.colors?.length > 0) {
            brandPrompt += `, using brand colors ${brandingInfo.colors.join(', ')}`;
          }
          
          if (brandingInfo.logo_description) {
            brandPrompt += `, logo style: ${brandingInfo.logo_description}`;
          }
          
          if (brandingInfo.visual_style) {
            brandPrompt += `, ${brandingInfo.visual_style} aesthetic`;
          }
          
          if (brandingInfo.mood) {
            brandPrompt += `, ${brandingInfo.mood} tone`;
          }
          
          if (brandingInfo.typography) {
            brandPrompt += `, ${brandingInfo.typography} typography`;
          }
          
          if (brandingInfo.prompt_suggestions) {
            brandPrompt += `, ${brandingInfo.prompt_suggestions}`;
          }
          
          enhancedPrompt += brandPrompt;
          console.log('🎨 Branding complet appliqué');
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

      // Enrichir avec le DA si sélectionné
      let daApplied = false;
      if (selectedDA) {
        daApplied = true;
        let daPrompt = `Brand identity for ${selectedDA.name} (${selectedDA.activity}). ${selectedDA.description || ''}. Style: ${selectedDA.style_keywords || 'professional'}. Brand colors: ${selectedDA.color_palette.join(', ')}.`;

        // Analyser le site web si présent
        if (selectedDA.website) {
            try {
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: language === 'fr' ? '🔍 Analyse du site web du DA...' : '🔍 Analyzing DA website...', isStreaming: true }
              ]);

              const brandingResult = await base44.functions.invoke('analyzeBrandingFromURL', { 
                url: selectedDA.website,
                userPrompt: userMessage
              });

              if (brandingResult.data?.branding) {
                const webBranding = brandingResult.data.branding;
                if (webBranding.visual_style) daPrompt += ` Visual style: ${webBranding.visual_style}.`;
                if (webBranding.mood) daPrompt += ` Mood: ${webBranding.mood}.`;
                if (webBranding.typography) daPrompt += ` Typography: ${webBranding.typography}.`;
                if (webBranding.prompt_suggestions) daPrompt += ` ${webBranding.prompt_suggestions}`;
                console.log('🌐 Branding du site DA analysé');
              }
            } catch (e) {
              console.error('❌ Échec analyse site DA:', e);
            }
          }

        enhancedPrompt = `${daPrompt} ${enhancedPrompt}`;
        console.log('🎨 DA appliqué:', selectedDA.name);
      }

      // Si c'est une modification, utiliser le prompt enrichi directement
      let promptToUse = isModification ? finalPrompt : enhancedPrompt;
      
      // En mode Canva, ajouter --no text pour générer l'image sans texte intégré
      if (canvaMode && !isModification) {
        promptToUse += ' --no text --no letters --no typography --no words --no writing';
        console.log('🎨 Mode Canva: génération sans texte intégré');
      }
      
      console.log(isModification ? '🔄 Modification détectée - Prompt enrichi:' : '🎨 Nouveau prompt:', promptToUse);

      // Générer l'image
      let result;
      
      // CAS AVEC IMAGES ATTACHÉES: Composition avec InvokeLLM
      if (currentAttachedImages.length > 0) {
        try {
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: language === 'fr' ? '🎨 Création avec vos images...' : '🎨 Creating with your images...', isStreaming: true }
            ]);

            const compositionPrompt = `Create this design: ${userMessage}. Use the provided reference images in the composition. Integrate them naturally and make sure they are visible in the final result. ${promptToUse}`;

            result = await base44.integrations.Core.GenerateImage({
              prompt: compositionPrompt,
              existing_image_urls: currentAttachedImages
            });

            if (!result.url) {
              throw new Error(language === 'fr' ? 'Erreur lors de la génération' : 'Generation error');
            }

          console.log('✅ Image créée avec images attachées:', result.url);

        } catch (compError) {
          console.error('❌ Composition error:', compError);
          throw compError;
        }
      } else {
        // CAS NORMAL: Génération simple
        result = await base44.integrations.Core.GenerateImage({
          prompt: promptToUse
        });
      }

      // Traitement commun pour les deux cas (avec ou sans images attachées)
      if (result.url) {
        let finalImageUrl = result.url;
        
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

        // Si DA appliqué, extraire les textes de l'image pour les rendre éditables
        if (daApplied && !canvaMode) {
          try {
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: language === 'fr' ? '📝 Extraction des textes...' : '📝 Extracting texts...', isStreaming: true }
            ]);

            const textExtraction = await base44.integrations.Core.InvokeLLM({
              prompt: `Analyze this image and detect ALL text elements visible in the image.

              For each text found:
              - Extract the exact text content
              - Estimate its position (x, y coordinates on ${width}x${height} canvas)
              - Estimate font size (in pixels)
              - Detect text color (as hex)
              - Detect if there's a background color (hex or "transparent")
              - Determine alignment (left, center, right)
              - Estimate font weight (400-900)

              Return ONLY texts that are clearly visible and readable.
              Return empty array if no text detected.`,
              response_json_schema: {
                type: "object",
                properties: {
                  layers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        x: { type: "number" },
                        y: { type: "number" },
                        fontSize: { type: "number" },
                        color: { type: "string" },
                        backgroundColor: { type: "string" },
                        align: { type: "string" },
                        fontWeight: { type: "number" }
                      }
                    }
                  }
                }
              },
              file_urls: [result.url]
            });

            if (textExtraction.layers && textExtraction.layers.length > 0) {
              editorLayers = textExtraction.layers.map((layer, idx) => ({
                id: `layer-${Date.now()}-${idx}`,
                type: 'text',
                text: layer.text,
                x: Math.max(50, Math.min(layer.x, width - 50)),
                y: Math.max(50, Math.min(layer.y, height - 50)),
                fontSize: Math.max(layer.fontSize || 48, 20),
                fontFamily: 'Arial',
                fontWeight: layer.fontWeight || 700,
                color: layer.color || '#ffffff',
                backgroundColor: layer.backgroundColor || 'transparent',
                padding: 20,
                borderRadius: 12,
                opacity: 100,
                visible: true,
                align: layer.align || 'center',
                bold: true,
                italic: false,
                shadow: false,
                stroke: false
              }));
              console.log('✅ Textes DA extraits:', editorLayers.length);
            }
          } catch (e) {
            console.error('❌ Extraction textes DA échouée:', e);
          }
        }

        // Generate editor layers
        let editorLayers = [];

        console.log('🔍 AVANT TOUT - canvaMode:', canvaMode, 'canvaTexts:', canvaTexts);

        const [width, height] = dimensions.split('x').map(Number);

        // MODE CANVA: Créer les calques avec IA pour couleurs
        if (canvaMode && canvaTexts && canvaTexts.length > 0) {
          console.log('🎨 Mode Canva - IA styling pour', canvaTexts.length, 'textes');

          try {
            const aiResult = await base44.integrations.Core.InvokeLLM({
              prompt: `You must create EXACTLY ${canvaTexts.length} separate text layers for this image.

              The ${canvaTexts.length} texts to place are:
              ${canvaTexts.map((text, i) => `${i + 1}. "${text}"`).join('\n')}

              IMPORTANT RULES:
              - Create ONE layer per text (total: ${canvaTexts.length} layers)
              - Each layer must contain ONLY its corresponding text, nothing else
              - Do NOT add any additional words like "CRITICAL", "IMPORTANT", etc.
              - Analyze the image to find free space areas
              - Avoid placing text over important visual elements
              - Choose colors with excellent contrast for readability
              - Use transparent backgrounds
              - Font size: first text 60-80px, others 40-60px
              - Position intelligently based on composition
              - Center aligned

              Canvas size: ${width}x${height}px
              Return a JSON object with a "layers" array containing exactly ${canvaTexts.length} layers.`,
              response_json_schema: {
                type: "object",
                properties: {
                  layers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        x: { type: "number" },
                        y: { type: "number" },
                        fontSize: { type: "number" },
                        color: { type: "string" },
                        backgroundColor: { type: "string" },
                        fontWeight: { type: "number" }
                      }
                    }
                  }
                }
              },
              file_urls: [result.url]
            });

            if (aiResult.layers && aiResult.layers.length > 0) {
              editorLayers = aiResult.layers.map((layer, idx) => ({
                id: `layer-${Date.now()}-${idx}`,
                type: 'text',
                text: layer.text,
                x: width / 2,
                y: Math.max(80, Math.min(layer.y || (height / (canvaTexts.length + 1)) * (idx + 1), height - 80)),
                fontSize: Math.max(layer.fontSize || (idx === 0 ? 72 : 48), 30),
                fontFamily: 'Arial',
                fontWeight: layer.fontWeight || 700,
                color: layer.color || '#ffffff',
                backgroundColor: layer.backgroundColor || 'transparent',
                padding: 20,
                borderRadius: 12,
                opacity: 100,
                align: 'center',
                bold: true,
                italic: false,
                shadow: false,
                stroke: false,
                letterSpacing: 0
              }));
              console.log('✅ IA styling OK:', editorLayers);
            } else {
              throw new Error('No layers from AI');
            }
          } catch (aiError) {
            console.error('❌ IA error:', aiError);
            // Fallback manuel
            editorLayers = canvaTexts.map((text, idx) => ({
              id: `layer-${Date.now()}-${idx}`,
              type: 'text',
              text: text,
              x: width / 2,
              y: (height / (canvaTexts.length + 1)) * (idx + 1),
              fontSize: idx === 0 ? 72 : 48,
              fontFamily: 'Arial',
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: 'transparent',
              padding: 20,
              borderRadius: 12,
              opacity: 100,
              align: 'center',
              bold: true,
              italic: false,
              shadow: false,
              stroke: false,
              letterSpacing: 0
            }));
            console.log('✅ Fallback layers:', editorLayers);
          }
        }

        console.log('📊 LAYERS FINAL:', editorLayers);

        // Composer l'image avec les textes SAUF en mode Canva (évite doublons éditeur)
        // En mode Canva: image_url = original (sans textes), layers seuls
        // L'éditeur affichera correctement: image originale + layers
        if (editorLayers.length > 0 && !canvaMode) {
          console.log('🎨 Composition:', editorLayers.length, 'layers');
          try {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            const bgImage = new Image();
            bgImage.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
              bgImage.onload = resolve;
              bgImage.onerror = reject;
              bgImage.src = result.url;
            });

            ctx.drawImage(bgImage, 0, 0, width, height);

            editorLayers.forEach((layer) => {
              if (layer.type === 'text' && layer.text) {
                ctx.save();
                const fontWeight = layer.fontWeight || 700;
                const fontStyle = `${fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
                ctx.font = fontStyle;
                ctx.fillStyle = layer.color;
                ctx.textAlign = layer.align || 'center';

                const metrics = ctx.measureText(layer.text);
                const textWidth = metrics.width;

                if (layer.backgroundColor && layer.backgroundColor !== 'transparent') {
                  const padding = layer.padding || 20;
                  const borderRadius = layer.borderRadius || 12;
                  let boxX = layer.x - textWidth / 2 - padding;
                  if (layer.align === 'left') boxX = layer.x - padding;
                  const boxY = layer.y - layer.fontSize * 0.85 - padding;
                  const boxWidth = textWidth + padding * 2;
                  const boxHeight = layer.fontSize * 1.15 + padding * 2;

                  ctx.fillStyle = layer.backgroundColor;
                  const radius = Math.min(borderRadius, boxWidth / 2, boxHeight / 2);
                  ctx.beginPath();
                  ctx.moveTo(boxX + radius, boxY);
                  ctx.lineTo(boxX + boxWidth - radius, boxY);
                  ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius);
                  ctx.lineTo(boxX + boxWidth, boxY + boxHeight - radius);
                  ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight);
                  ctx.lineTo(boxX + radius, boxY + boxHeight);
                  ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius);
                  ctx.lineTo(boxX, boxY + radius);
                  ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
                  ctx.closePath();
                  ctx.fill();
                  ctx.fillStyle = layer.color;
                }

                ctx.fillText(layer.text, layer.x, layer.y);
                ctx.restore();
              }
            });

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.95));
            if (blob) {
              const file = new File([blob], 'composite.png', { type: 'image/png' });
              const uploadResult = await base44.integrations.Core.UploadFile({ file });
              if (uploadResult?.file_url) {
                finalImageUrl = uploadResult.file_url;
                console.log('✅ Composite créée:', finalImageUrl);
              }
            }
          } catch (e) {
            console.error('❌ Composition error:', e);
          }
        }

        if (activeCategory?.id === 'pub_ads') {
          console.log('🎨 Génération automatique de calques publicitaires...');
          try {

              const layersResult = await base44.integrations.Core.InvokeLLM({
                prompt: `Analyze this advertising image and create 2-3 short, punchy text elements: "${userMessage}". 

                CRITICAL TEXT GUIDELINES:
                - Keep texts SHORT (2-6 words max per text)
                - Headline: 2-4 words, bold and catchy
                - Subtext: 3-6 words, descriptive
                - CTA: 1-3 words (ex: "BUY NOW", "DISCOVER", "ORDER TODAY")

                DESIGN & COLOR:
                - Extract 1-2 dominant vibrant colors from the image
                - Use BOLD, eye-catching semi-transparent backgrounds (rgba with 0.88-0.95 opacity)
                - Colors: hot pink, electric blue, deep purple, neon orange, vivid red
                - Large padding: 28-35px for impact
                - Border radius: 16-22px for modern look

                POSITIONING (Canvas ${width}x${height}px):
                - Spread texts across different areas (top, middle, bottom)
                - Leave 80px+ margin from edges
                - Don't cluster texts together

                FONTS & SIZES:
                - Headline: 56-72px, bold (700-900 weight), Arial or Montserrat
                - Subtext: 38-48px, medium-bold (600-700), Arial
                - CTA: 42-52px, extra-bold (800-900), Arial
                - ALWAYS use textAlign: 'left' (never center or right)`,
                response_json_schema: {
                  type: "object",
                  properties: {
                    layers: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string" },
                          text: { type: "string" },
                          x: { type: "number" },
                          y: { type: "number" },
                          fontSize: { type: "number" },
                          fontFamily: { type: "string" },
                          fontWeight: { type: "number" },
                          color: { type: "string" },
                          backgroundColor: { type: "string" },
                          padding: { type: "number" },
                          borderRadius: { type: "number" }
                        }
                      }
                    }
                  }
                },
                file_urls: [result.url]
              });

            if (layersResult.layers && layersResult.layers.length > 0) {
              editorLayers = layersResult.layers.map((layer, idx) => ({
                id: `layer-${Date.now()}-${idx}`,
                type: 'text',
                text: layer.text || '',
                x: Math.max(80, Math.min(layer.x || 100, width - 250)),
                y: Math.max(80, Math.min(layer.y || 100, height - 150)),
                fontSize: layer.fontSize || 48,
                fontFamily: layer.fontFamily || 'Arial',
                fontWeight: layer.fontWeight || 700,
                color: layer.color || '#ffffff',
                backgroundColor: layer.backgroundColor || 'rgba(255,20,147,0.9)',
                padding: Math.max(layer.padding || 28, 25),
                borderRadius: Math.max(layer.borderRadius || 18, 12),
                opacity: 100,
                visible: true,
                align: layer.textAlign || 'left',
                bold: true,
                italic: false,
                shadow: false,
                stroke: false
              }));
              console.log('✅ Calques PUB créés:', editorLayers);
            }
          } catch (e) {
            console.error('❌ Échec calques pub:', e);
          }

        }

        const visualData = {
          user_email: user?.email || 'anonymous',
          conversation_id: activeConversation?.id,
          image_url: finalImageUrl,
          original_image_url: result.url,
          title: userMessage.slice(0, 50),
          original_prompt: isModification 
            ? `${currentVisual.original_prompt} • MODIFICATION: ${userMessage}`
            : userMessage,
          image_prompt: isModification ? finalPrompt : enhancedPrompt,
          dimensions: dimensions,
          visual_type: activeCategory?.id,
          format_name: selectedFormat?.name || null,
          category_name: activeCategory?.name?.[language] || activeCategory?.name?.fr || null,
          style: selectedStyle?.name?.[language] || selectedStyle?.name?.fr || null,
          color_palette: extractedColors,
          editor_layers: editorLayers.length > 0 ? editorLayers : undefined,
          art_director_name: selectedDA ? selectedDA.name : null,
          attached_images: currentAttachedImages.length > 0 ? currentAttachedImages : undefined
        };

        console.log('📦 SAVE - Layers:', editorLayers.length, 'Canva:', canvaMode, 'Layers:', editorLayers);

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

      // Récupérer le DA si présent
      let daPrompt = '';
      if (visual.art_director_name) {
        const visualDA = artDirectors.find(da => da.name === visual.art_director_name);
        if (visualDA) {
          daPrompt = `Brand identity for ${visualDA.name} (${visualDA.activity}). ${visualDA.description || ''}. Style: ${visualDA.style_keywords || 'professional'}. Brand colors: ${visualDA.color_palette.join(', ')}. `;
        }
      }

      // Récupérer les textes Canva si présents
      const hasCanvaTexts = visual.editor_layers && visual.editor_layers.some(layer => layer.type === 'text');
      let canvaPromptSuffix = '';
      if (hasCanvaTexts) {
        canvaPromptSuffix = ' --no text --no letters --no typography --no words --no writing';
      }

      const finalPrompt = daPrompt + (visual.image_prompt || visual.original_prompt + ', high quality, professional design') + canvaPromptSuffix;

      // Détecter si c'est un effet magique (présence de "• EFFET:" dans original_prompt)
      const isEffect = visual.original_prompt && visual.original_prompt.includes('• EFFET:');

      let result;

      if (isEffect && visual.parent_visual_id) {
        // Récupérer l'image originale (avant l'effet)
        try {
          const parentVisuals = await base44.entities.Visual.filter({ id: visual.parent_visual_id });
          if (parentVisuals.length > 0) {
            const parentVisual = parentVisuals[0];
            // Régénérer avec l'image originale comme référence
            result = await base44.integrations.Core.GenerateImage({
              prompt: visual.image_prompt,
              existing_image_urls: [parentVisual.original_image_url || parentVisual.image_url]
            });
          } else {
            // Fallback si pas de parent trouvé
            result = await base44.integrations.Core.GenerateImage({
              prompt: finalPrompt
            });
          }
        } catch (e) {
          console.error('Failed to load parent visual:', e);
          result = await base44.integrations.Core.GenerateImage({
            prompt: finalPrompt
          });
        }
      } else if (visual.attached_images && visual.attached_images.length > 0) {
        // Si des images étaient attachées à l'original, les réutiliser
        const compositionPrompt = `Create this design: ${visual.original_prompt}. Use the provided reference images in the composition. Integrate them naturally and make sure they are visible in the final result. ${finalPrompt}`;

        result = await base44.integrations.Core.GenerateImage({
          prompt: compositionPrompt,
          existing_image_urls: visual.attached_images
        });
      } else {
        result = await base44.integrations.Core.GenerateImage({
          prompt: finalPrompt
        });
      }

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

        // Régénérer les calques Canva si présents
        let newEditorLayers = [];
        if (hasCanvaTexts) {
          const canvaTextsToRegenerate = visual.editor_layers.filter(l => l.type === 'text').map(l => l.text);
          const [width, height] = visual.dimensions.split('x').map(Number);
          
          try {
            const aiResult = await base44.integrations.Core.InvokeLLM({
              prompt: `You must create EXACTLY ${canvaTextsToRegenerate.length} separate text layers for this image.
              
              The ${canvaTextsToRegenerate.length} texts to place are:
              ${canvaTextsToRegenerate.map((text, i) => `${i + 1}. "${text}"`).join('\n')}
              
              IMPORTANT RULES:
              - Create ONE layer per text (total: ${canvaTextsToRegenerate.length} layers)
              - Each layer must contain ONLY its corresponding text, nothing else
              - Analyze the image to find free space areas
              - Choose colors with excellent contrast for readability
              - Use transparent backgrounds
              - Font size: first text 60-80px, others 40-60px
              - Position intelligently based on composition
              - Center aligned
              
              Canvas size: ${width}x${height}px`,
              response_json_schema: {
                type: "object",
                properties: {
                  layers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        x: { type: "number" },
                        y: { type: "number" },
                        fontSize: { type: "number" },
                        color: { type: "string" },
                        backgroundColor: { type: "string" },
                        fontWeight: { type: "number" }
                      }
                    }
                  }
                }
              },
              file_urls: [result.url]
            });

            if (aiResult.layers && aiResult.layers.length > 0) {
              newEditorLayers = aiResult.layers.map((layer, idx) => ({
                id: `layer-${Date.now()}-${idx}`,
                type: 'text',
                text: layer.text,
                x: width / 2,
                y: Math.max(80, Math.min(layer.y || (height / (canvaTextsToRegenerate.length + 1)) * (idx + 1), height - 80)),
                fontSize: Math.max(layer.fontSize || (idx === 0 ? 72 : 48), 30),
                fontFamily: 'Arial',
                fontWeight: layer.fontWeight || 700,
                color: layer.color || '#ffffff',
                backgroundColor: layer.backgroundColor || 'transparent',
                padding: 20,
                borderRadius: 12,
                opacity: 100,
                align: 'center',
                bold: true,
                italic: false,
                shadow: false,
                stroke: false,
                letterSpacing: 0
              }));
            }
          } catch (e) {
            console.error('Failed to regenerate Canva layers:', e);
          }
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
          format_name: visual.format_name || null,
          category_name: visual.category_name || null,
          style: visual.style,
          color_palette: extractedColors,
          version: (visual.version || 1) + 1,
          parent_visual_id: visual.id,
          art_director_name: visual.art_director_name || null,
          editor_layers: newEditorLayers.length > 0 ? newEditorLayers : undefined,
          attached_images: visual.attached_images || undefined
        };

        let newVisual = visualData;
        if (user) {
          newVisual = await base44.entities.Visual.create(visualData);
          setSessionVisuals(prev => [newVisual, ...prev]);
        }

        setCurrentVisual(newVisual);
        setVisualsHistory(prev => [...prev, newVisual]); // Add regenerated to history

        // Update messages - replace the generating message and add visual card
        setMessages(prev => [
          ...prev.slice(0, -1), // Remove "generating" message
          { role: 'assistant', content: t('newVersion') },
          { role: 'assistant', content: '', visual: newVisual }
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
    setAttachedImages([]);
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
    // Use the values directly from the editor to avoid DB timing issues
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

  const handleCropComplete = async (newImageUrl) => {
    // Update current visual with cropped image
    if (currentVisual) {
      const updatedVisual = {
        ...currentVisual,
        image_url: newImageUrl,
        original_image_url: newImageUrl // Use cropped image as new base
      };

      // Save to database if user is logged in
      if (user && updatedVisual.id) {
        try {
          await base44.entities.Visual.update(updatedVisual.id, {
            image_url: newImageUrl,
            original_image_url: newImageUrl
          });
        } catch (e) {
          console.error('Failed to save cropped visual:', e);
        }
      }

      // Update in messages history
      setMessages(prev => prev.map(m => 
        m.visual?.id === updatedVisual.id ? { ...m, visual: updatedVisual } : m
      ));

      setCurrentVisual(updatedVisual);
      setSessionVisuals(prev => prev.map(v => v.id === updatedVisual.id ? updatedVisual : v));
    }
  };

  const handleVideoGenerated = async (videoUrl, animationPrompt, aspectRatio) => {
    // Create new visual with video
    const videoVisualData = {
      user_email: user?.email || 'anonymous',
      conversation_id: currentConversation?.id,
      image_url: videoUrl,
      video_url: videoUrl,
      title: currentVisual.title + ' (Vidéo)',
      original_prompt: animationPrompt,
      dimensions: aspectRatio || currentVisual.dimensions || '16:9',
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

  const handleImageEditComplete = async (newImageUrl, editPrompt) => {
    // Valider que newImageUrl existe
    if (!newImageUrl || typeof newImageUrl !== 'string') {
      console.error('❌ Invalid URL in handleImageEditComplete:', newImageUrl);
      alert(language === 'fr' ? 'Erreur: URL invalide' : 'Error: Invalid URL');
      return;
    }

    console.log('✅ Valid URL received:', newImageUrl);

    const editedVisualData = {
      user_email: user?.email || 'anonymous',
      conversation_id: currentConversation?.id,
      image_url: newImageUrl,
      original_image_url: newImageUrl,
      title: currentVisual.title + ' (Modifié)',
      original_prompt: `${currentVisual.original_prompt} • EDIT: ${editPrompt}`,
      dimensions: currentVisual.dimensions,
      visual_type: currentVisual.visual_type,
      parent_visual_id: currentVisual.id,
      version: (currentVisual.version || 1) + 1
    };

    console.log('📝 Creating visual:', editedVisualData);

    let newVisual = editedVisualData;
    if (user) {
      try {
        newVisual = await base44.entities.Visual.create(editedVisualData);
        console.log('✅ Visual created:', newVisual.id);
        setSessionVisuals(prev => [newVisual, ...prev]);
        setTotalVisualsCount(prev => prev + 1);
      } catch (error) {
        console.error('❌ Create failed:', error);
        alert(language === 'fr' ? `Erreur: ${error.message}` : `Error: ${error.message}`);
        return;
      }
    }

    setCurrentVisual(newVisual);
    setVisualsHistory(prev => [...prev, newVisual]);
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: `✨ ${language === 'fr' ? 'Image modifiée avec succès !' : 'Image edited successfully!'}` },
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
        <LoadingProgress />
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
        totalVisualsCount={totalVisualsCount}
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
        onSelectVisual={async (v) => {
          // If modal requested, show modal instead
          if (v?.openModal) {
            const allVisuals = await base44.entities.Visual.filter({ user_email: user.email }, '-created_date', 25);
            setRecentVisuals(allVisuals);
            setShowRecentVisualsModal(true);
            return;
          }
          
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
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleAttachImages}
        accept="image/*"
        multiple
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
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/30 via-fuschia-500/30 to-pink-500/30 border border-pink-500/50 backdrop-blur-sm shadow-lg shadow-pink-500/20">
                  <span className="text-xs md:text-sm text-pink-100 font-medium">
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
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692a3549022b223ef419900f/7b5e0f746_icon.png" 
                      alt="iGPT" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-md border border-violet-500/10 rounded-2xl px-5 py-4 max-w-lg shadow-lg shadow-violet-500/5">
                  <div className="text-white/80 text-sm leading-relaxed welcome-message-content">
                    {(() => {
                      const msg = getWelcomeMessage();
                      // If message contains HTML tags, render as HTML
                      if (msg && (msg.includes('<p>') || msg.includes('<strong>') || msg.includes('<em>') || msg.includes('<br'))) {
                        return <div dangerouslySetInnerHTML={{ __html: msg }} />;
                      }
                      // Otherwise render as plain text
                      return msg;
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons: Image to Video + Image Edit */}
            {/* <div className="w-full max-w-xl mb-10 relative">
              <div className="flex flex-col gap-3 items-center justify-center bg-white/5 border border-white/10 rounded-xl p-4">
                <button
                  onClick={() => setShowVideoExamplesModal(true)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {language === 'fr' ? 'Générez ou uploadez une image et transformez-la en vidéo' : 'Generate or upload an image and turn it into a video'}
                  </span>
                  <span className="sm:hidden">
                    {language === 'fr' ? 'Image vers vidéo' : 'Image to video'}
                  </span>
                </button>

                <button
                  onClick={() => setShowImageEditExamplesModal(true)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {language === 'fr' ? 'Apportez des modifications à une image avec l\'IA' : 'Make AI-powered modifications to an image'}
                  </span>
                  <span className="sm:hidden">
                    {language === 'fr' ? 'Modifier une image' : 'Edit image'}
                  </span>
                </button>
              </div>
              
              <span className="absolute -top-3 -right-2 px-1.5 py-[1px] bg-emerald-700 text-white text-[9px] font-bold rounded shadow-md">
                {language === 'fr' ? 'NOUVEAU' : 'NEW'}
              </span>
            </div> */}

            {/* Features Carousel */}
            <div className="w-full mb-10">
              <FeaturesCarousel
                onOpenImageEditExamples={() => setShowImageEditExamplesModal(true)}
                onOpenVideoExamples={() => setShowVideoExamplesModal(true)}
              />
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
                            onEdit={() => handleOpenEditor(msg.visual)}
                            onImageEditOpen={(v) => {
                              setImageEditVisual(v);
                              setShowImageEditModal(true);
                            }}
                            onVideoOpen={(v) => {
                              setVideoVisual(v);
                              setShowVideoModal(true);
                            }}
                            onCropOpen={(v) => {
                              setCropVisual(v);
                              setShowCropModal(true);
                            }}
                            onEffectApply={async (visual, effect) => {
                              // Générer directement avec l'effet et l'image actuelle
                              if (!user) {
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
                              setCurrentVisual(visual);

                              const effectName = language === 'fr' ? effect.name_fr : (effect.name_en || effect.name_fr);
                              setMessages(prev => [...prev, { 
                                role: 'assistant', 
                                content: `✨ ${language === 'fr' ? 'Application de l\'effet' : 'Applying effect'} "${effectName}"...`, 
                                isStreaming: true 
                              }]);

                              try {
                                // Déduire crédit
                                if (!user) {
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

                                // Générer avec l'image comme référence
                                const result = await base44.integrations.Core.GenerateImage({
                                  prompt: effect.prompt,
                                  existing_image_urls: [visual.original_image_url || visual.image_url]
                                });

                                if (result.url) {
                                  const visualData = {
                                    user_email: user?.email || 'anonymous',
                                    conversation_id: currentConversation?.id,
                                    image_url: result.url,
                                    original_image_url: result.url,
                                    title: `${visual.title} - ${effectName}`,
                                    original_prompt: `${visual.original_prompt} • EFFET: ${effectName}`,
                                    image_prompt: effect.prompt,
                                    dimensions: visual.dimensions,
                                    visual_type: visual.visual_type,
                                    parent_visual_id: visual.id,
                                    version: (visual.version || 1) + 1
                                  };

                                  let newVisual = visualData;
                                  if (user) {
                                    newVisual = await base44.entities.Visual.create(visualData);
                                    setSessionVisuals(prev => [newVisual, ...prev]);
                                    setTotalVisualsCount(prev => prev + 1);
                                  }

                                  setCurrentVisual(newVisual);
                                  setVisualsHistory(prev => [...prev, newVisual]);

                                  setMessages(prev => [
                                    ...prev.slice(0, -1),
                                    { role: 'assistant', content: `✨ ${language === 'fr' ? 'Effet appliqué !' : 'Effect applied!'}` },
                                    { role: 'assistant', content: '', visual: newVisual }
                                  ]);
                                }
                              } catch (error) {
                                console.error(error);
                                setMessages(prev => [
                                  ...prev.slice(0, -1),
                                  { role: 'assistant', content: t('error') }
                                ]);
                              }

                              setIsGenerating(false);
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
                          ? 'Vous n\'avez pas sélectionné de catégorie dans le menu "Catégories" du prompt. Votre prompt sera envoyé brut à l\'IA, sans assistance ni optimisation automatique d\'iGPT. Pour de meilleurs résultats, choisissez une catégorie adaptée à votre besoin (Logo, Print, Posts/Story, etc.). Vous pouvez également uploader votre image pour la modifier ou la transformer en vidéo avec l\'IA.'
                          : 'You haven\'t selected a category in the "Categories" menu in the prompt. Your prompt will be sent raw to the AI, without assistance or automatic optimization from iGPT. For better results, choose a suitable category (Logo, Print, Social, etc.). You can also upload your image to edit it or turn it into a video with AI.'
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

{/* Example prompts cliquables - Condensé sur mobile */}
{currentPromptExamples.length > 0 && (
  <div className="mt-3 pt-3 border-t border-violet-500/20">
    <p className="text-violet-300 text-[11px] font-medium mb-1.5">
      {language === 'fr' ? '💡 Exemples :' : '💡 Examples:'}
    </p>
    {/* Desktop: Afficher 1 exemple complet */}
    <div className="hidden md:block space-y-2">
      {currentPromptExamples.slice(0, 1).map((example, idx) => (
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
          className="text-left w-full px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-400/20 hover:border-violet-400/40 rounded-lg text-violet-100 text-xs transition-all flex flex-col md:flex-row md:items-center gap-3"
        >
          <div className="flex-1">
            "{language === 'fr' 
              ? example.example_text_fr 
              : (example.example_text_en || example.example_text_fr)}"
          </div>
          {example.image_url && (
            <img 
              src={example.image_url} 
              alt="" 
              className="w-full md:w-32 h-32 object-cover rounded-md border border-violet-400/30 md:flex-shrink-0"
            />
          )}
        </button>
      ))}
    </div>
    {/* Mobile: Bouton condensé pour ouvrir la modal */}
    <button
      onClick={() => setShowExamplesModal(true)}
      className="md:hidden w-full px-3 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 hover:border-violet-500/50 rounded-lg text-violet-200 text-xs font-medium transition-all flex items-center justify-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      {language === 'fr' ? 'Voir les exemples de prompt' : 'See prompt examples'}
    </button>
    {/* Desktop: Bouton voir plus si > 1 exemple */}
    {currentPromptExamples.length > 1 && (
      <button
        onClick={() => setShowExamplesModal(true)}
        className="hidden md:flex w-full mt-2 px-3 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 hover:border-violet-500/50 rounded-lg text-violet-200 text-xs font-medium transition-all items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {language === 'fr' ? 'Voir d\'autres exemples de prompt' : 'See more prompt examples'}
      </button>
    )}
    <p className="text-violet-300/60 text-[10px] mt-1.5 hidden md:block">
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
            <div className="relative bg-gray-900 border border-white/10 rounded-2xl overflow-hidden prompt-glow">
              {/* Attached Images Thumbnails */}
              {(attachedImages.length > 0 || uploadingImages > 0) && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-white/5">
                  {attachedImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-white/20" />
                      <button
                        onClick={() => removeAttachedImage(idx)}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {uploadingImages > 0 && (
                    <div className="w-16 h-16 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
                    </div>
                  )}
                  <span className="text-white/40 text-xs ml-2">
                    {attachedImages.length}/6
                  </span>
                </div>
              )}

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
                  placeholder={language === 'fr' ? 'Décrivez votre visuel...' : 'Describe your visual...'}
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-sm resize-none overflow-hidden min-h-[24px] max-h-[200px]"
                  rows={1}
                  disabled={isGenerating}
                  style={{ height: '24px' }}
                />

                <button 
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 text-white/40 hover:text-white/60 transition-colors"
                  disabled={attachedImages.length >= 6}
                >
                  <div className="relative">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                      <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <svg className="h-3.5 w-3.5 absolute -bottom-1 -right-1 bg-green-500 rounded-full text-black p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>

                <button 
                  onClick={handleVoiceInput}
                  className="relative p-2 transition-all"
                >
                  {isRecording && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-500/30 animate-pulse flex items-center justify-center">
                      </div>
                    </motion.div>
                  )}
                  <Mic className={cn(
                    "transition-all relative z-10",
                    isRecording 
                      ? "h-6 w-6 text-red-500" 
                      : "h-5 w-5 text-white/40 hover:text-white/60"
                  )} />
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
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5",
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
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5",
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
                    {CATEGORIES.filter(c => ['logo_picto', 'logo_complet', 'image', 'print', 'social', 'mockup', 'product', 'design_3d', 'video', 'free_prompt'].includes(c.id)).map(cat => (
                      <DropdownMenuItem 
                        key={cat.id}
                        onClick={() => handleCategorySelect({ ...cat, expertMode: expertMode[cat.id] || false })}
                        className={cn(
                          "text-white",
                          cat.id === 'free_prompt' && "bg-orange-500/10 hover:bg-orange-500/20 text-orange-200"
                        )}
                      >
                        {cat?.name?.[language] || cat?.name?.fr || 'N/A'}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Tag Canva */}
                <button
                  onClick={() => setShowCanvaTextModal(true)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5",
                    canvaMode
                      ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/30"
                      : "bg-pink-600/10 border-pink-500/20 text-pink-300 hover:bg-pink-600/20"
                  )}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Canva {canvaTexts.length > 0 && `(${canvaTexts.length})`}
                </button>

                {/* Tag DA (Directeur Artistique) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5",
                      selectedDA
                        ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-blue-600/10 border-blue-500/20 text-blue-300 hover:bg-blue-600/20"
                    )}>
                      <Users className="w-3 h-3" />
                      {selectedDA ? selectedDA.name : 'DA'}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10 max-h-96 overflow-y-auto">
                    {user ? (
                      <>
                        {artDirectors.filter(da => da.user_email === user.email).map(da => (
                          <DropdownMenuItem 
                            key={da.id}
                            onSelect={(e) => e.preventDefault()}
                            className="text-white flex items-center gap-2 justify-between group"
                          >
                            <button
                              onClick={() => setSelectedDA(da)}
                              className="flex items-center gap-2 flex-1"
                            >
                              {da.logo_url && (
                                <img src={da.logo_url} alt="" className="w-5 h-5 rounded object-cover" />
                              )}
                              <span>{da.name}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDA(da);
                                setShowDAModal(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </DropdownMenuItem>
                        ))}
                        {artDirectors.filter(da => da.user_email === user.email).length > 0 && (
                          <div className="h-px bg-white/10 my-1" />
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingDA(null);
                            setShowDAModal(true);
                          }}
                          className="text-blue-300 bg-blue-600/10 hover:bg-blue-600/20"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          {language === 'fr' ? 'Créer un DA' : 'Create AD'}
                        </DropdownMenuItem>
                        {selectedDA && (
                          <>
                            <div className="h-px bg-white/10 my-1" />
                            <DropdownMenuItem
                              onClick={() => setSelectedDA(null)}
                              className="text-white/60"
                            >
                              {language === 'fr' ? 'Désélectionner' : 'Deselect'}
                            </DropdownMenuItem>
                          </>
                        )}
                      </>
                    ) : (
                      <DropdownMenuItem
                        onClick={handleLogin}
                        className="text-blue-300 bg-blue-600/10 hover:bg-blue-600/20"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        {language === 'fr' ? 'Se connecter pour créer un DA' : 'Login to create an AD'}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Tag Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 hover:border-orange-500/50 text-orange-300 shadow-md flex items-center gap-1.5"
                >
                  <Upload className="w-3 h-3" />
                  {language === 'fr' ? 'Upload' : 'Upload'}
                </button>


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
        .prompt-glow {
          position: relative;
        }
        .prompt-glow::before {
          content: '';
          position: absolute;
          inset: -35px;
          border-radius: 2rem;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.4), rgba(168, 85, 247, 0.25) 40%, transparent 70%);
          animation: pulse-glow 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
        .prompt-glow > * {
          position: relative;
          z-index: 1;
        }
        @keyframes gradient-rotate {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { 
            transform: scale(0.92);
            opacity: 0.5;
          }
          50% { 
            transform: scale(1.08);
            opacity: 0.85;
          }
        }
        .welcome-message-content p {
          margin: 0;
        }
        .welcome-message-content strong {
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
        }
        .welcome-message-content em {
          font-style: italic;
        }
        .welcome-message-content span[style*="background-color"],
        .welcome-message-content span[style*="background"] {
          border-radius: 6px;
          padding: 2px 6px;
          display: inline-block;
        }
      `}</style>

      {/* Art Director Modal */}
      <ArtDirectorModal
        isOpen={showDAModal}
        onClose={() => {
          setShowDAModal(false);
          setEditingDA(null);
        }}
        editingDA={editingDA}
        onSave={async (daData) => {
          if (editingDA) {
            await base44.entities.ArtDirector.update(editingDA.id, daData);
            setArtDirectors(prev => prev.map(da => da.id === editingDA.id ? { ...da, ...daData } : da));
          } else {
            const newDA = await base44.entities.ArtDirector.create({
              ...daData,
              user_email: user.email
            });
            setArtDirectors(prev => [newDA, ...prev]);
          }
        }}
      />

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

      {/* Video Generation Modal */}
      <VideoGenerationModal
        isOpen={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setVideoVisual(null);
        }}
        visual={videoVisual}
        onVideoGenerated={handleVideoGenerated}
        user={user}
        credits={credits}
        guestPrompts={guestPrompts}
      />

      {/* Video Examples Modal */}
      <VideoExamplesModal
        isOpen={showVideoExamplesModal}
        onClose={() => setShowVideoExamplesModal(false)}
      />

      {/* Image Edit Examples Modal */}
      <ImageEditExamplesModal
        isOpen={showImageEditExamplesModal}
        onClose={() => setShowImageEditExamplesModal(false)}
      />

      {/* Crop Modal */}
      <CropModal
        isOpen={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setCropVisual(null);
        }}
        visual={cropVisual}
        onCropComplete={handleCropComplete}
      />

      {/* Image Edit Modal */}
      <ImageEditModal
        isOpen={showImageEditModal}
        onClose={() => {
          setShowImageEditModal(false);
          setImageEditVisual(null);
        }}
        visual={imageEditVisual}
        onEditComplete={handleImageEditComplete}
      />



      {/* Mode Selector Modal */}
      <AnimatePresence>
        {showModeSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setShowModeSelector(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900/95 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6 max-w-md mx-4"
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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPromptMode('modify');
                    setShowModeSelector(false);
                    setTimeout(() => inputRef.current?.focus(), 100);
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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPromptMode('new');
                    setShowModeSelector(false);
                    setTimeout(() => inputRef.current?.focus(), 100);
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

      {/* Video Info Modal */}
      <AnimatePresence>
        {showVideoInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowVideoInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900/95 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {language === 'fr' ? 'Génération de vidéo' : 'Video generation'}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                  <p className="text-white/90 text-sm leading-relaxed mb-3">
                    {language === 'fr' 
                      ? 'Pour générer une vidéo, suivez ces étapes :' 
                      : 'To generate a video, follow these steps:'}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                      <p className="text-white/80 text-sm">
                        {language === 'fr' 
                          ? 'Générez une image avec iGPT ou uploadez une image depuis votre appareil.' 
                          : 'Generate an image with iGPT or upload an image from your device.'}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                      <div className="flex-1">
                        <p className="text-white/80 text-sm inline">
                          {language === 'fr' 
                            ? 'Cliquez sur l\'icône vidéo ' 
                            : 'Click on the video icon '}
                        </p>
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gradient-to-br from-pink-600 to-rose-600 mx-1">
                          <Video className="h-3 w-3 text-white" />
                        </span>
                        <p className="text-white/80 text-sm inline">
                          {language === 'fr' 
                            ? ' qui apparaît sous l\'image.' 
                            : ' that appears below the image.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                      <p className="text-white/80 text-sm">
                        {language === 'fr' 
                          ? 'Configurez vos options et transformez votre image ou produit en vidéo incroyable !' 
                          : 'Configure your options and transform your image or product into an incredible video!'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowVideoInfoModal(false)}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                {language === 'fr' ? 'Compris !' : 'Got it!'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Visuals Modal */}
      <Dialog open={showRecentVisualsModal} onOpenChange={setShowRecentVisualsModal}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-violet-500/30 text-white max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              {language === 'fr' ? 'Mes derniers visuels' : 'My recent visuals'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <a
              href={createPageUrl('MyVisuals')}
              className="inline-block px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs transition-all"
            >
              {language === 'fr' ? 'Voir tous mes visuels' : 'View all my visuals'}
            </a>
          </div>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {recentVisuals.map((visual) => {
                const isVideo = visual.video_url || (visual.image_url && (visual.image_url.includes('.mp4') || visual.image_url.includes('/video')));
                return (
                  <button
                    key={visual.id}
                    onClick={() => {
                      setCurrentVisual(visual);
                      setVisualsHistory([visual]);
                      setMessages([{ 
                        role: 'assistant', 
                        content: '✨ ' + (language === 'fr' ? 'Voici votre visuel. Vous pouvez me demander de le modifier ou de créer des variations.' : 'Here is your visual. You can ask me to modify it or create variations.'),
                        visual: visual
                      }]);
                      if (visual.visual_type) {
                        setSelectedCategory({ id: visual.visual_type });
                      }
                      setShowRecentVisualsModal(false);
                    }}
                    className="aspect-square rounded overflow-hidden cursor-pointer border border-white/10 hover:border-violet-500/50 transition-all hover:scale-105"
                  >
                    {isVideo ? (
                      <video src={visual.video_url || visual.image_url} muted loop autoPlay className="w-full h-full object-cover" />
                    ) : (
                      <img src={visual.image_url} alt={visual.title} className="w-full h-full object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                className="text-left w-full px-4 py-3 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-400/20 hover:border-violet-400/40 rounded-lg text-violet-100 text-sm transition-all flex flex-col md:flex-row md:items-center gap-3"
              >
                <div className="flex-1">
                  <span className="text-violet-300 text-xs font-medium">#{idx + 1}</span>
                  <p className="mt-1">"{language === 'fr' 
                    ? example.example_text_fr 
                    : (example.example_text_en || example.example_text_fr)}"</p>
                </div>
                {example.image_url && (
                  <img 
                    src={example.image_url} 
                    alt="" 
                    className="w-full md:w-40 h-40 object-cover rounded-md border border-violet-400/30 md:flex-shrink-0"
                  />
                )}
              </button>
            ))}
          </div>
          <p className="text-violet-300/60 text-xs text-center mt-4">
            {language === 'fr' ? '👆 Cliquez sur un exemple pour l\'utiliser' : '👆 Click on an example to use it'}
          </p>
        </DialogContent>
      </Dialog>

      {/* Canva Text Modal */}
      <CanvaTextModal
        isOpen={showCanvaTextModal}
        onClose={() => setShowCanvaTextModal(false)}
        onConfirm={(texts, decompose) => {
          setCanvaTexts(texts);
          setCanvaMode(true);
          setCanvaDecompose(decompose);
        }}
        onCancel={() => {
          setCanvaMode(false);
          setCanvaTexts([]);
          setCanvaDecompose(false);
        }}
        currentTexts={canvaTexts}
        isActive={canvaMode}
      />
      </div>
      );
      }