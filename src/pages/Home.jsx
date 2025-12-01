import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Loader2, Sparkles, Image, Palette, X, Info, Heart, Plus, Mic, MicOff, Upload, CreditCard } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FavoritesModal from '@/components/FavoritesModal';
import LogoModal from '@/components/LogoModal';
import GDPRBanner from '@/components/GDPRBanner';
import VisualEditor from '@/components/chat/VisualEditor';
import VideoGenerator from '@/components/VideoGenerator';
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
  const [showWatermarkNotice, setShowWatermarkNotice] = useState(false);
  const [showVisualsTooltip, setShowVisualsTooltip] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

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
                              free_downloads: 25,
                              paid_credits: 0,
                              subscription_type: 'free'
                            });
            setCredits(newCredits);
          } else {
            setCredits(userCredits[0]);
          }

          setVisuals(userVisuals);
          setConversations(userConversations);

          const welcomeFr = settingsMap.welcome_message_fr || `${t('welcomeUser', { name: currentUser.full_name || '' })}\n\n${t('assistantIntro')}`;
                  const welcomeEn = settingsMap.welcome_message_en || `${t('welcomeUser', { name: currentUser.full_name || '' })}\n\n${t('assistantIntro')}`;
                  setMessages([{
                    role: 'assistant',
                    content: (language === 'fr' ? welcomeFr : welcomeEn).replace('{name}', currentUser.full_name || '')
                  }]);

                  // Check if there's a visual to edit from URL params
                  const urlParams = new URLSearchParams(window.location.search);
                  const editVisualId = urlParams.get('editVisual');
                  if (editVisualId) {
                    const visualToEdit = userVisuals.find(v => v.id === editVisualId);
                    if (visualToEdit) {
                      setSelectedVisual(visualToEdit);
                      setShowValidation(true);
                      setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: language === 'fr' 
                          ? `✨ Voici votre visuel **${visualToEdit.title || 'sans titre'}**. Que souhaitez-vous faire ?`
                          : `✨ Here's your visual **${visualToEdit.title || 'untitled'}**. What would you like to do?`
                      }]);
                      // Clean URL
                      window.history.replaceState({}, '', createPageUrl('Home'));
                    }
                  }
        } else {
          const guestFr = settings.guest_message_fr || `${t('welcome')}\n\n${t('guestIntro')}`;
          const guestEn = settings.guest_message_en || `${t('welcome')}\n\n${t('guestIntro')}`;
          setMessages([{
            role: 'assistant',
            content: language === 'fr' ? guestFr : guestEn
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
    // Scroll to the latest message when messages change
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, [messages]);

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'fr' ? 'fr-FR' : 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: `[Image uploadée]`,
        image_url: file_url 
      }]);
      // Trigger analysis of the image
      setInput(language === 'fr' ? 'Analyse cette image et propose des améliorations visuelles' : 'Analyze this image and suggest visual improvements');
    } catch (err) {
      console.error(err);
    }
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getTotalCredits = () => {
    if (!credits) return 0;
    if (user?.role === 'admin') return Infinity;
    if (credits.subscription_type === 'unlimited') return Infinity;
    return (credits.free_downloads || 0) + (credits.paid_credits || 0);
  };

  const handleNewChat = () => {
        setCurrentConversation(null);
        const newConvMsg = language === 'fr' 
          ? (settings.new_conversation_fr || t('newConversation'))
          : (settings.new_conversation_en || t('newConversation'));
        setMessages([{
          role: 'assistant',
          content: newConvMsg
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
      // Parse dimensions to get aspect ratio
      const [w, h] = format.dimensions.split('x').map(Number);
      const aspectRatio = w && h ? `${w}:${h}` : format.ratio;
      prompt += `. CRITICAL: Generate image with EXACT aspect ratio ${aspectRatio}, format ${format.name} (${format.dimensions}). The image MUST match this aspect ratio precisely.`;
    }

    // Add quality enhancers
    prompt += `. High quality, professional design, sharp details, balanced composition, visually striking, award-winning design`;

    return prompt;
  };

  // Deduct 1 message/credit
  const deductCredit = async () => {
    if (!credits) return;
    if (user?.role === 'admin') return; // Admins have unlimited credits
    if (credits.subscription_type === 'unlimited') return;
    
    if (credits.free_downloads > 0) {
      await base44.entities.UserCredits.update(credits.id, { free_downloads: credits.free_downloads - 1 });
      setCredits(prev => ({ ...prev, free_downloads: prev.free_downloads - 1 }));
    } else if (credits.paid_credits > 0) {
      await base44.entities.UserCredits.update(credits.id, { paid_credits: credits.paid_credits - 1 });
      setCredits(prev => ({ ...prev, paid_credits: prev.paid_credits - 1 }));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages([...newMessages, { role: 'assistant', content: '' }]); // Add typing indicator
    setIsLoading(true);
    setShowFormatSelector(false);
    setShowStyleSelector(false);

    // Deduct 1 credit for sending a message
    if (isAuthenticated) {
      await deductCredit();
    }

    try {
      // Build context for analysis
      let contextInfo = '';
      if (selectedFormat) contextInfo += `Format: ${selectedFormat.name} (${selectedFormat.dimensions}). `;
      if (selectedStyle) contextInfo += `Style: ${selectedStyle.name.fr}. `;
      if (selectedPalette) contextInfo += `Palette: ${selectedPalette.name.fr} (${selectedPalette.colors.join(', ')}). `;

      // Check if user is referring to an existing visual
      const hasExistingVisual = selectedVisual !== null;
      const existingVisualContext = hasExistingVisual ? `
CONTEXTE IMPORTANT - VISUEL EXISTANT:
L'utilisateur a actuellement un visuel affiché avec ces caractéristiques:
- Titre: ${selectedVisual.title || 'Sans titre'}
- Type: ${selectedVisual.visual_type || 'autre'}
- Style: ${selectedVisual.style || 'non défini'}
- Prompt original utilisé: ${selectedVisual.image_prompt || selectedVisual.original_prompt || 'non disponible'}
- Couleurs: ${selectedVisual.color_palette?.join(', ') || 'non définies'}

Si l'utilisateur demande une MODIFICATION (ajouter du texte, mettre dans un rond, changer un élément, ajouter une texture, etc.), 
tu DOIS reprendre le prompt original et l'enrichir avec les modifications demandées.
NE CRÉE PAS un nouveau visuel différent, MODIFIE le visuel existant en gardant ses éléments principaux.
` : '';

      const analysis = await base44.integrations.Core.InvokeLLM({
                prompt: `Tu es iGPT, un assistant expert PREMIUM en création de visuels professionnels de niveau agence de design.

          L'utilisateur demande: "${userMessage}"
          ${contextInfo ? `Contexte choisi par l'utilisateur: ${contextInfo}` : ''}
          ${existingVisualContext}

          RÈGLES CRITIQUES PAR TYPE DE VISUEL:

                          ⚠️ RÈGLE UNIVERSELLE ABSOLUE - ZÉRO TEXTE:
                              - INTERDICTION TOTALE de texte, lettres, mots, chiffres, typographie sur TOUS les visuels
                              - Dans CHAQUE prompt image, COMMENCE par: "absolutely no text, no letters, no words, no numbers, no typography, no writing, text-free design"
                              - TERMINE chaque prompt par: "completely text-free, no visible text or letters anywhere"
                              - EXCEPTION UNIQUE: si l'utilisateur écrit explicitement "avec le texte [xxx]"

                          🖨️ RÈGLE CRITIQUE POUR TOUS LES VISUELS IMPRESSION (carte visite, flyer, sticker, affiche, poster, brochure, dépliant, menu, invitation, faire-part):
                              - Design ABSTRAIT et GRAPHIQUE UNIQUEMENT - jamais de représentation réaliste
                              - JAMAIS: bâtiments, maisons, photos, personnes, objets réalistes, scènes figuratives
                              - TOUJOURS: formes géométriques abstraites, dégradés élégants, motifs sophistiqués, textures artistiques
                              - Le design doit REMPLIR ENTIÈREMENT le cadre, bord à bord, sans marges internes
                              - AJOUTER OBLIGATOIREMENT: "abstract graphic design only, no realistic imagery, no photographs, no figurative elements, FULL BLEED edge-to-edge design filling entire frame, no margins, no borders, design extends to all edges"
                              - Le visuel doit être PRÊT À IMPRIMER sans recadrage nécessaire
                              - Prompt type: "absolutely no text, abstract minimalist design, FULL BLEED edge-to-edge, elegant geometric shapes, subtle luxury gradient, clean lines, premium feel, sophisticated abstract pattern, completely text-free, print-ready 300dpi"
                              - Pour un thème spécifique (ex: restaurant italien): utiliser des COULEURS et FORMES évocatrices, PAS des images réalistes (ex: dégradé rouge/vert avec formes organiques, PAS de pizza ou pâtes)

                                  🎴 CARTE DE VISITE / BUSINESS CARD:
                                  - Suit les règles impression ci-dessus
                                  - Pour agence immobilière: "abstract geometric shapes suggesting elegance and trust, gold and navy gradient" - PAS de maisons!

                  🎨 LOGO:
                  - Symbole/icône abstrait UNIQUEMENT - jamais de lettres
                  - "absolutely no text, abstract symbol logo, icon only, vector clean style, centered, minimal, completely text-free"

                  📱 POSTS RÉSEAUX SOCIAUX:
                  - Design graphique moderne, couleurs tendance, FULL BLEED
                  - "absolutely no text, modern graphic design filling entire frame, edge-to-edge, vibrant colors, completely text-free"

                  📄 FLYERS/AFFICHES/STICKERS:
                  - Design FULL BLEED, bord à bord
                  - "absolutely no text, FULL BLEED background design filling entire frame edge-to-edge, no margins, completely text-free"

          RÈGLES GÉNÉRALES:
          - Sois TRÈS créatif et original - évite les clichés
          - Prompt de 100+ mots minimum en anglais
          - Décris: style artistique, composition, couleurs, mood, textures, éclairage
          - Qualité: "professional design, award-winning, high-end, premium quality"

          RÈGLE POUR LES MODIFICATIONS:
          - Si un visuel existe, reprends son prompt et AJOUTE les modifications demandées
          - Ne change pas le design principal, enrichis-le

          Réponds en JSON:
          - needs_image: boolean (true si création visuelle demandée)
          - response: string (réponse courte, professionnelle, en français)
          - image_prompt: string (prompt TRÈS détaillé en anglais, 100+ mots, RESPECTE les règles du type de visuel)
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
      setIsLoading(false);

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

        // Force using selected format dimensions if user chose a format
        const finalDimensions = selectedFormat?.dimensions || analysis.dimensions || '1080x1080';
        
        let newVisual = {
                        title: analysis.title || 'Visuel',
                        image_url: imageResult.url,
                        visual_type: analysis.visual_type || 'autre',
                        dimensions: finalDimensions,
                        format: selectedFormat?.id?.includes('post') || selectedFormat?.id?.includes('story') || selectedFormat?.id?.includes('banner') ? 'digital' : 'print',
                        format_name: selectedFormat?.name || null,
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
        setShowValidation(true);

        // Show watermark notice if not dismissed (for 4 seconds)
        if (isAuthenticated && credits?.subscription_type === 'free' && !localStorage.getItem('hideWatermarkNotice')) {
          setShowWatermarkNotice(true);
          setTimeout(() => setShowWatermarkNotice(false), 4000);
        }

        // Show visuals tooltip after a short delay (if not dismissed)
        if (!localStorage.getItem('hideVisualsTooltip')) {
          setTimeout(() => {
            setShowVisualsTooltip(true);
          }, 1500);
        }

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
      setMessages([...newMessages, { role: 'assistant', content: t('error') }]);
      setIsLoading(false);
    }
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

    // Deduct 1 credit for download
    await deductCredit();

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

      {/* Watermark Notice Toast */}
      {showWatermarkNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-2 px-4 py-3 bg-blue-900/95 border border-blue-400/30 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-blue-300 flex-shrink-0" />
              <p className="text-blue-100 text-sm">
                {language === 'fr' 
                  ? "Le filigrane ne sera pas présent sur la version téléchargée" 
                  : "The watermark will not appear on the downloaded version"}
              </p>
            </div>
            <button 
              onClick={() => {
                setShowWatermarkNotice(false);
                localStorage.setItem('hideWatermarkNotice', 'true');
              }}
              className="text-blue-300/60 hover:text-blue-200 text-xs transition-colors self-end"
            >
              {language === 'fr' ? "Ne plus afficher ce message" : "Don't show this again"}
            </button>
          </div>
        </div>
      )}

      {/* Visuals Tooltip */}
      {showVisualsTooltip && sidebarOpen && (
        <div className="fixed left-64 top-48 z-50 animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="relative bg-gradient-to-r from-violet-900/95 to-blue-900/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4 max-w-xs">
            {/* Arrow pointing left */}
            <div className="absolute -left-2 top-6 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-violet-900/95" />

            <div className="flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-white text-sm font-medium mb-1">
                  {language === 'fr' ? "Visuels en cours" : "Visuals in progress"}
                </p>
                <p className="text-white/70 text-xs leading-relaxed">
                  {language === 'fr' 
                    ? "Retrouvez toutes vos créations ici ! Vous pouvez les régénérer, créer des variations ou les télécharger à tout moment." 
                    : "Find all your creations here! You can regenerate them, create variations, or download them anytime."}
                </p>
                <button 
                  onClick={() => {
                    setShowVisualsTooltip(false);
                    localStorage.setItem('hideVisualsTooltip', 'true');
                  }}
                  className="text-white/40 hover:text-white/70 text-xs mt-2 transition-colors"
                >
                  {language === 'fr' ? "Ne plus afficher" : "Don't show again"}
                </button>
              </div>
              <button 
                onClick={() => setShowVisualsTooltip(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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
        sidebarTitle={settings.sidebar_title}
      />
      
      <div className={cn(
        "relative z-10 min-h-screen flex flex-col transition-all duration-300",
        sidebarOpen && "md:ml-64"
      )}>
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen pt-16">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 pb-44">
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Hero - only show if few messages */}
              {messages.length <= 1 && (
                <div className="flex flex-col items-center justify-center py-4 md:py-6 text-center">
                  <Logo size="large" showText={false} animate={true} onClick={() => setShowLogoModal(true)} />
                  <h1 className="text-xl md:text-2xl text-white/80 font-light mt-10 max-w-xl leading-relaxed animate-fade-in-up">
                                            {(language === 'fr' ? settings.home_title_fr : settings.home_title_en) || t('heroTitle')}
                                          </h1>
                                          <p className="text-white/60 mt-2 max-w-lg text-base md:text-lg font-light tracking-wide leading-relaxed animate-fade-in-up-delay">
                                            <span className="bg-gradient-to-r from-violet-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                                              {(language === 'fr' ? settings.home_subtitle_fr : settings.home_subtitle_en) || t('heroSubtitle')}
                                            </span>
                                          </p>
                                          <style>{`
                                            @keyframes fadeInUp {
                                              from { opacity: 0; transform: translateY(10px); }
                                              to { opacity: 1; transform: translateY(0); }
                                            }
                                            .animate-fade-in-up {
                                              animation: fadeInUp 0.6s ease-out forwards;
                                            }
                                            .animate-fade-in-up-delay {
                                              opacity: 0;
                                              animation: fadeInUp 0.6s ease-out 0.2s forwards;
                                            }
                                          `}</style>
                </div>
              )}
              
              {/* Chat Messages */}
              {messages.map((message, idx) => (
                <MessageBubble key={idx} message={message} isStreaming={isLoading && idx === messages.length - 1} thinkingText={t('thinking')} user={user} />
              ))}

              {/* Selected Visual Preview */}
              {selectedVisual && !showEditor && (
                <div className="flex items-start justify-center gap-3">
                  <div className="max-w-sm">
                    <VisualCard
                      visual={selectedVisual}
                      onRegenerate={handleRegenerate}
                      onDownload={() => handleDownload(selectedVisual)}
                      onVariation={handleVariation}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={() => setShowEditor(true)}
                      onAnimate={() => setShowVideoGenerator(true)}
                      isRegenerating={isGenerating}
                      canDownload={isAuthenticated && getTotalCredits() > 0}
                      hasWatermark={!isAuthenticated || credits?.subscription_type === 'free'}
                      showValidation={true}
                      onValidate={(action) => {
                        setShowValidation(false);
                        if (action === 'download') {
                          handleDownload(selectedVisual);
                        } else if (action === 'edit') {
                          setShowEditor(true);
                        }
                      }}
                    />
                  </div>
                  {isAuthenticated && visuals.filter(v => v.is_favorite).length > 0 && (
                    <button
                      onClick={() => setShowFavoritesModal(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-300 text-sm transition-colors whitespace-nowrap"
                    >
                      <Heart className="h-4 w-4 fill-amber-400" />
                      {language === 'fr' ? 'Mes favoris' : 'My favorites'}
                    </button>
                  )}
                </div>
              )}

              {/* Visual Editor */}
              {showEditor && selectedVisual && (
                <VisualEditor
                  visual={selectedVisual}
                  onSave={async (newImageUrl, newLayers) => {
                    // Deduct 1 credit for saving edited visual
                    await deductCredit();
                    // Update the visual in state immediately with new image
                    if (newImageUrl) {
                      const updatedVisual = { ...selectedVisual, image_url: newImageUrl, editor_layers: newLayers };
                      setSelectedVisual(updatedVisual);
                      setVisuals(prev => prev.map(v => v.id === selectedVisual.id ? updatedVisual : v));
                    }
                    setShowEditor(false);
                    setMessages(prev => [...prev, { 
                      role: 'assistant', 
                      content: language === 'fr' 
                        ? '✨ Visuel personnalisé sauvegardé avec succès !' 
                        : '✨ Customized visual saved successfully!' 
                    }]);
                  }}
                  onCancel={() => setShowEditor(false)}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

        </main>
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300",
        sidebarOpen && "md:left-64"
      )}>
        <div className="bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/98 to-transparent pt-8 pb-4 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Format Selector */}
                            {showFormatSelector && (
                              <div className="mb-3">
                                <FormatSelector 
                                  onSelect={(format) => { setSelectedFormat(format); setShowFormatSelector(false); }}
                                  selectedFormat={selectedFormat}
                                  onClose={() => setShowFormatSelector(false)}
                                />
                              </div>
                            )}

                            {/* Style & Palette Selector */}
                            {showStyleSelector && (
                              <div className="mb-3">
                                <StyleSelector
                                  selectedStyle={selectedStyle}
                                  selectedPalette={selectedPalette}
                                  onStyleChange={setSelectedStyle}
                                  onPaletteChange={setSelectedPalette}
                                  onClose={() => setShowStyleSelector(false)}
                                  onAutoSend={async (prompt) => {
                                    setShowStyleSelector(false);
                                    // Envoyer directement le message
                                    const userMessage = prompt;
                                    const newMessages = [...messages, { role: 'user', content: userMessage }];
                                    setMessages([...newMessages, { role: 'assistant', content: '' }]);
                                    setIsLoading(true);
                                    
                                    if (isAuthenticated) {
                                      await deductCredit();
                                    }
                                    
                                    try {
                                      const analysis = await base44.integrations.Core.InvokeLLM({
                                        prompt: `Tu es iGPT. L'utilisateur demande: "${userMessage}". Génère un visuel créatif basé sur ce style. Réponds en JSON avec needs_image: true, response (courte), image_prompt (détaillé en anglais 100+ mots), visual_type, dimensions, title, suggested_colors.`,
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
                                      setIsLoading(false);
                                      
                                      if (analysis.needs_image && analysis.image_prompt) {
                                        setIsGenerating(true);
                                        updatedMessages = [...updatedMessages, { role: 'assistant', content: t('generating') }];
                                        setMessages(updatedMessages);
                                        
                                        const finalPrompt = buildDetailedPrompt(analysis.image_prompt, selectedStyle, selectedPalette, selectedFormat);
                                        const imageResult = await base44.integrations.Core.GenerateImage({ prompt: finalPrompt });
                                        
                                        let newVisual = {
                                          title: analysis.title || 'Visuel',
                                          image_url: imageResult.url,
                                          visual_type: analysis.visual_type || 'autre',
                                          dimensions: selectedFormat?.dimensions || analysis.dimensions || '1080x1080',
                                          format: 'digital',
                                          original_prompt: userMessage,
                                          image_prompt: finalPrompt,
                                          style: selectedStyle?.name?.fr || '',
                                          color_palette: analysis.suggested_colors || [],
                                          version: 1
                                        };
                                        
                                        if (user) {
                                          newVisual = await base44.entities.Visual.create({ user_email: user.email, ...newVisual });
                                        }
                                        
                                        setVisuals(prev => [newVisual, ...prev]);
                                        setSelectedVisual(newVisual);
                                        setShowValidation(true);
                                        
                                        updatedMessages = updatedMessages.slice(0, -1);
                                        updatedMessages.push({ role: 'assistant', content: `✨ **${analysis.title}** ${t('ready')}` });
                                        setMessages(updatedMessages);
                                        setIsGenerating(false);
                                      }
                                      
                                      await saveConversation(updatedMessages);
                                    } catch (error) {
                                      setMessages([...newMessages, { role: 'assistant', content: t('error') }]);
                                      setIsLoading(false);
                                    }
                                    setSelectedFormat(null);
                                    setSelectedStyle(null);
                                    setSelectedPalette(null);
                                  }}
                                />
                              </div>
                            )}
              {/* Apply format to existing visual */}
              {selectedFormat && selectedVisual && (
                <div className="mb-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      setIsGenerating(true);
                      try {
                        const prompt = selectedVisual.image_prompt || `Professional ${selectedVisual.visual_type}, high quality`;
                        const finalPrompt = `${prompt}. Format: ${selectedFormat.name} (${selectedFormat.dimensions}), aspect ratio ${selectedFormat.ratio || selectedFormat.dimensions}`;
                        
                        const result = await base44.integrations.Core.GenerateImage({ prompt: finalPrompt });
                        
                        let newVisual = {
                          ...selectedVisual,
                          image_url: result.url,
                          dimensions: selectedFormat.dimensions,
                          format: selectedFormat.id,
                          version: (selectedVisual.version || 1) + 1
                        };
                        delete newVisual.id;
                        delete newVisual.created_date;
                        delete newVisual.updated_date;
                        
                        if (user) {
                          newVisual = await base44.entities.Visual.create({ user_email: user.email, ...newVisual });
                        }
                        
                        setVisuals(prev => [newVisual, ...prev]);
                        setSelectedVisual(newVisual);
                        setSelectedFormat(null);
                        setMessages(prev => [...prev, { 
                          role: 'assistant', 
                          content: language === 'fr' ? `✨ Visuel converti au format ${selectedFormat.name} !` : `✨ Visual converted to ${selectedFormat.name} format!`
                        }]);
                        await deductCredit();
                      } catch (e) {
                        console.error(e);
                      }
                      setIsGenerating(false);
                    }}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-xs"
                  >
                    {isGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                    {language === 'fr' ? `Convertir en ${selectedFormat.name}` : `Convert to ${selectedFormat.name}`}
                  </Button>
                </div>
              )}

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
                      {selectedStyle.name[language]}
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
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-3 py-2 h-12">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className={cn(
                                            "text-white/50 hover:text-white hover:bg-white/10 flex-shrink-0 h-8 w-8",
                                            (showFormatSelector || showStyleSelector) && "bg-violet-500/20 text-violet-300"
                                          )}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="start" className="bg-gray-900 border-white/10">
                                        <DropdownMenuItem 
                                          onClick={() => { setShowFormatSelector(!showFormatSelector); setShowStyleSelector(false); }}
                                          className="text-white hover:bg-white/10 cursor-pointer"
                                        >
                                          <Image className="h-4 w-4 mr-2" />
                                          {language === 'fr' ? 'Format' : 'Format'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => { setShowStyleSelector(!showStyleSelector); setShowFormatSelector(false); }}
                                          className="text-white hover:bg-white/10 cursor-pointer"
                                        >
                                          <Palette className="h-4 w-4 mr-2" />
                                          {language === 'fr' ? 'Style & Couleurs' : 'Style & Colors'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => fileInputRef.current?.click()}
                                          className="text-white hover:bg-white/10 cursor-pointer"
                                          disabled={uploadingImage}
                                        >
                                          <Upload className="h-4 w-4 mr-2" />
                                          {language === 'fr' ? 'Importer une image' : 'Upload image'}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                    {isAuthenticated && getTotalCredits() <= 0 ? (
                                                            <a 
                                                              href={createPageUrl('Pricing')}
                                                              className="flex-1 flex items-center justify-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
                                                            >
                                                              <CreditCard className="h-4 w-4" />
                                                              {language === 'fr' ? 'Recharger mes crédits' : 'Recharge my credits'}
                                                            </a>
                                                          ) : (
                                                            <input
                                                                                                                                type="text"
                                                                                                                                value={input}
                                                                                                                                onChange={(e) => setInput(e.target.value)}
                                                                                                                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                                                                                                                                placeholder={t('inputPlaceholder')}
                                                                                                                                className="flex-1 bg-transparent border-0 text-white placeholder:text-white/40 focus:outline-none focus:placeholder:text-transparent text-sm"
                                                                                                                                disabled={isLoading}
                                                                                                                              />
                                                          )}
                                                          <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={toggleVoice}
                                                            className={cn(
                                                              "flex-shrink-0 h-8 w-8 transition-colors",
                                                              isListening 
                                                                ? "text-red-400 bg-red-500/20 hover:bg-red-500/30 animate-pulse" 
                                                                : "text-white/50 hover:text-white hover:bg-white/10"
                                                            )}
                                                            title={language === 'fr' ? 'Commande vocale' : 'Voice command'}
                                                          >
                                                            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                                          </Button>
                                                          <Button
                                                            onClick={handleSend}
                                                            disabled={!input.trim() || isLoading}
                                                            size="icon"
                                                            className="bg-gradient-to-r from-violet-800 to-blue-800 hover:from-violet-900 hover:to-blue-900 flex-shrink-0 h-8 w-8 relative overflow-hidden"
                                                          >
                                                            {isLoading ? (
                                                              <div className="relative">
                                                                <div className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white animate-spin" style={{ width: '16px', height: '16px' }} />
                                                                <Sparkles className="h-3 w-3 text-white/80 animate-pulse" />
                                                              </div>
                                                            ) : (
                                                              <Send className="h-4 w-4" />
                                                            )}
                                                          </Button>
                                                        </div>
              
            {/* Footer */}
            <div className="mt-3 flex items-center justify-center">
              <p className="text-white/25 text-xs">
                <a href={createPageUrl('Pricing')} className="hover:text-violet-400 transition-colors">{t('pricing')}</a>
                {' • '}
                <a href={createPageUrl('Legal')} className="hover:text-violet-400 transition-colors">{t('legal')}</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Modal */}
              <FavoritesModal
                isOpen={showFavoritesModal}
                onClose={() => setShowFavoritesModal(false)}
                favorites={visuals.filter(v => v.is_favorite)}
                onSelectVisual={setSelectedVisual}
              />

              {/* Logo Modal */}
              <LogoModal
                isOpen={showLogoModal}
                onClose={() => setShowLogoModal(false)}
                content={language === 'fr' ? settings.logo_modal_fr : settings.logo_modal_en}
              />

              {/* GDPR Banner */}
              <GDPRBanner />

              {/* Video Generator */}
              <VideoGenerator
                isOpen={showVideoGenerator}
                onClose={() => setShowVideoGenerator(false)}
                visual={selectedVisual}
                onDeductCredits={deductCredit}
              />
              </div>
              );
      }