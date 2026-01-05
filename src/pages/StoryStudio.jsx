import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  X, 
  Play, 
  Download, 
  Image as ImageIcon, 
  Wand2, 
  Type, 
  Plus,
  Trash2,
  Save,
  Sparkles,
  Video,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Loader2,
  Crown,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlobalHeader from '@/components/GlobalHeader';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/components/LanguageContext';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoryStudio() {
  const { language } = useLanguage();
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [myVisuals, setMyVisuals] = useState([]);
  const [showVisualsModal, setShowVisualsModal] = useState(false);
  const [animations, setAnimations] = useState([]);
  const [textLayers, setTextLayers] = useState([]);
  const [stickerLayers, setStickerLayers] = useState([]);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showTransitionsModal, setShowTransitionsModal] = useState(false);
  const [selectedTransitionIndex, setSelectedTransitionIndex] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);
  const [currentStep, setCurrentStep] = useState('select');
  const [exporting, setExporting] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [userVisuals, setUserVisuals] = useState([]);
  const [visualsDisplayCount, setVisualsDisplayCount] = useState(21);
  const [myStories, setMyStories] = useState([]);
  const [showStoriesModal, setShowStoriesModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [videoFormat, setVideoFormat] = useState('1:1');
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [myStickers, setMyStickers] = useState([]);
  const [sharedStickers, setSharedStickers] = useState([]);
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingSticker, setResizingSticker] = useState(null);
  const [resizeStart, setResizeStart] = useState({ size: 0, mouseX: 0, mouseY: 0 });
  const fileInputRef = useRef(null);
  const previewIntervalRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const [visuals, anims, userCreds, convs, stories, userStickers, iGPTStickers] = await Promise.all([
          base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 100),
          base44.entities.StoryAnimation.filter({ is_active: true }, 'order'),
          base44.entities.UserCredits.filter({ user_email: currentUser.email }),
          base44.entities.Conversation.filter({ user_email: currentUser.email }, '-updated_date', 20),
          base44.entities.Story.filter({ user_email: currentUser.email }, '-created_date', 50),
          base44.entities.Sticker.filter({ user_email: currentUser.email, is_shared: false }, '-created_date'),
          base44.entities.Sticker.filter({ is_shared: true }, '-created_date')
        ]);

        // No filter - show all visuals (images and videos)
        const storyVisuals = visuals;

        setMyVisuals(storyVisuals);
        setUserVisuals(visuals);
        setAnimations(anims);
        setConversations(convs);
        setMyStories(stories);
        setMyStickers(userStickers);
        setSharedStickers(iGPTStickers);
        if (userCreds.length > 0) setCredits(userCreds[0]);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploaded = [];

    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const isVideo = file.type.startsWith('video/');
        uploaded.push({
          id: Date.now() + Math.random(),
          image_url: file_url,
          video_url: isVideo ? file_url : null,
          title: file.name,
          isUploaded: true,
          isVideo
        });
      } catch (err) {
        toast.error('Erreur lors de l\'upload');
      }
    }

    setSelectedImages(prev => [...prev, ...uploaded]);
  };

  const handleSelectFromVisuals = (visual) => {
    if (selectedImages.find(img => img.id === visual.id)) {
      toast.error('Image déjà ajoutée');
      return;
    }
    
    // Detect if it's a video - safe check
    const imageUrl = visual.image_url || '';
    const isVideo = !!(visual.video_url || (imageUrl && (imageUrl.includes('.mp4') || imageUrl.includes('.webm') || imageUrl.includes('.mov') || imageUrl.includes('/video'))));
    
    const mediaToAdd = {
      ...visual,
      isVideo: isVideo,
      video_url: visual.video_url || (isVideo ? visual.image_url : null),
      duration: 3,
      transition: null
    };
    
    setSelectedImages(prev => [...prev, mediaToAdd]);
    setShowVisualsModal(false);
  };

  const handleRemoveImage = (id) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleAutoCut = () => {
    if (selectedImages.length === 0) {
      toast.error('Ajoutez au moins une image');
      return;
    }
    
    if (animations.length === 0) {
      toast.error('Aucune animation disponible - configurez-les en admin');
      return;
    }

    // Apply random transitions between images
    const newImages = selectedImages.map((img, idx) => ({
      ...img,
      transition: idx < selectedImages.length - 1 
        ? animations[Math.floor(Math.random() * animations.length)]
        : null,
      duration: 3
    }));

    setSelectedImages(newImages);
    toast.success('✨ Animations appliquées automatiquement !');
  };

  const handleAddText = (textData) => {
    setTextLayers(prev => [...prev, { ...textData, id: Date.now() }]);
    setShowTextModal(false);
  };

  const handleAddSticker = (sticker) => {
    setStickerLayers(prev => [...prev, {
      id: Date.now(),
      image_url: sticker.image_url,
      title: sticker.title,
      position: { x: 50, y: 50 },
      size: 100
    }]);
    setShowStickersModal(false);
    toast.success(language === 'fr' ? 'Sticker ajouté !' : 'Sticker added!');
  };

  const handleDragStart = (e, item, type) => {
    e.stopPropagation();
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const offsetX = e.clientX - (rect.left + (item.position.x / 100) * rect.width);
    const offsetY = e.clientY - (rect.top + (item.position.y / 100) * rect.height);
    
    setDraggingItem({ ...item, type });
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragMove = (e) => {
    if (!draggingItem || !previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
    
    if (draggingItem.type === 'text') {
      setTextLayers(prev => prev.map(t => 
        t.id === draggingItem.id ? { ...t, position: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } } : t
      ));
    } else if (draggingItem.type === 'sticker') {
      setStickerLayers(prev => prev.map(s => 
        s.id === draggingItem.id ? { ...s, position: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } } : s
      ));
    }
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleResizeStart = (e, sticker) => {
    e.stopPropagation();
    setResizingSticker(sticker);
    setResizeStart({
      size: sticker.size || 100,
      mouseX: e.clientX,
      mouseY: e.clientY
    });
  };

  const handleResizeMove = (e) => {
    if (!resizingSticker) return;
    
    const deltaX = e.clientX - resizeStart.mouseX;
    const deltaY = e.clientY - resizeStart.mouseY;
    const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * (deltaX + deltaY > 0 ? 1 : -1);
    
    const newSize = Math.max(30, Math.min(300, resizeStart.size + delta));
    
    setStickerLayers(prev => prev.map(s => 
      s.id === resizingSticker.id ? { ...s, size: newSize } : s
    ));
  };

  const handleResizeEnd = () => {
    setResizingSticker(null);
    setResizeStart({ size: 0, mouseX: 0, mouseY: 0 });
  };

  useEffect(() => {
    if (draggingItem) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [draggingItem, dragOffset]);

  useEffect(() => {
    if (resizingSticker) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingSticker, resizeStart]);

  const handleSaveStory = async () => {
    if (selectedImages.length === 0) {
      toast.error(language === 'fr' ? 'Ajoutez au moins une image' : 'Add at least one image');
      return;
    }

    setSaving(true);
    try {
      const totalDuration = selectedImages.reduce((acc, img) => acc + (img.duration || 3), 0);
      
      const story = await base44.entities.Story.create({
        user_email: user.email,
        title: `Story ${new Date().toLocaleDateString('fr-FR')}`,
        images: selectedImages,
        text_layers: textLayers,
        sticker_layers: stickerLayers,
        thumbnail_url: selectedImages[0].image_url,
        duration: totalDuration
      });

      setMyStories(prev => [story, ...prev]);
      toast.success(<span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> {language === 'fr' ? 'Vidéo sauvegardée' : 'Video saved'}</span>);
    } catch (e) {
      console.error(e);
      toast.error(language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Save error');
    }
    setSaving(false);
  };

  const handleLoadStory = (story) => {
    setSelectedImages(story.images || []);
    setTextLayers(story.text_layers || []);
    setStickerLayers(story.sticker_layers || []);
    setShowStoriesModal(false);
    toast.success(language === 'fr' ? 'Story chargée !' : 'Story loaded!');
  };

  const handleExport = async () => {
    if (selectedImages.length === 0) {
      toast.error('Ajoutez au moins une image');
      return;
    }

    setExporting(true);
    try {
      // TODO: Call backend function to generate video
      toast.success('Export en cours... (fonctionnalité à venir)');
    } catch (e) {
      toast.error('Erreur lors de l\'export');
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  const handleLogin = () => base44.auth.redirectToLogin(createPageUrl('StoryStudio'));
  const handleLogout = () => base44.auth.logout(createPageUrl('StoryStudio'));

  // Get transition animation config - TRANSITIONS PRO
  const getTransitionAnimation = (animationType) => {
    const transitions = {
      // Fades
      'fadeIn': {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      'fade-in': {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      
      // Slides horizontaux
      'slideInRight': {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 0 }
      },
      'slide-right': {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 0 }
      },
      'slideInLeft': {
        initial: { x: '-100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '100%', opacity: 0 }
      },
      'slide-left': {
        initial: { x: '-100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '100%', opacity: 0 }
      },
      
      // Slides verticaux
      'slideInUp': {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-100%', opacity: 0 }
      },
      'slide-up': {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-100%', opacity: 0 }
      },
      'slideInDown': {
        initial: { y: '-100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 }
      },
      'slide-down': {
        initial: { y: '-100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 }
      },
      
      // Zooms
      'zoomIn': {
        initial: { scale: 0.5, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 1.5, opacity: 0 }
      },
      'zoom-in': {
        initial: { scale: 0.5, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 1.5, opacity: 0 }
      },
      'zoom-out': {
        initial: { scale: 1.5, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.5, opacity: 0 }
      },
      
      // Rotations
      'rotateIn': {
        initial: { rotate: -180, scale: 0.5, opacity: 0 },
        animate: { rotate: 0, scale: 1, opacity: 1 },
        exit: { rotate: 180, scale: 0.5, opacity: 0 }
      },
      'rotate-in': {
        initial: { rotate: -180, scale: 0.5, opacity: 0 },
        animate: { rotate: 0, scale: 1, opacity: 1 },
        exit: { rotate: 180, scale: 0.5, opacity: 0 }
      },
      
      // Flips
      'flipX': {
        initial: { rotateY: 90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: -90, opacity: 0 }
      },
      'flip-x': {
        initial: { rotateY: 90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: -90, opacity: 0 }
      },
      'flipY': {
        initial: { rotateX: 90, opacity: 0 },
        animate: { rotateX: 0, opacity: 1 },
        exit: { rotateX: -90, opacity: 0 }
      },
      'flip-y': {
        initial: { rotateX: 90, opacity: 0 },
        animate: { rotateX: 0, opacity: 1 },
        exit: { rotateX: -90, opacity: 0 }
      },
      
      // Scale
      'scaleUp': {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0, opacity: 0 }
      },
      'scale-up': {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0, opacity: 0 }
      },
      
      // Blur
      'blur': {
        initial: { filter: 'blur(20px)', opacity: 0 },
        animate: { filter: 'blur(0px)', opacity: 1 },
        exit: { filter: 'blur(20px)', opacity: 0 }
      },
      
      // Diagonal slides
      'slide-diagonal': {
        initial: { x: '100%', y: '100%', opacity: 0 },
        animate: { x: 0, y: 0, opacity: 1 },
        exit: { x: '-100%', y: '-100%', opacity: 0 }
      }
    };
    
    return transitions[animationType] || transitions['fadeIn'];
  };

  return (
    <div className="min-h-screen relative">
      <Toaster position="top-center" />
      <AnimatedBackground />
      <GlobalHeader page="StoryStudio" />
      
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        credits={credits}
        conversations={conversations}
        visuals={userVisuals}
        onNewChat={() => window.location.href = createPageUrl('Home')}
        onSelectConversation={() => {}}
        onDeleteConversation={() => {}}
        onSelectVisual={() => {}}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      {/* Header */}
      <div className={cn(
        "relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 mt-16",
        sidebarOpen && "md:ml-64"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = createPageUrl('Home')}
                className="text-white/60 hover:text-white flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-400 via-pink-400 to-blue-400 bg-clip-text text-transparent truncate">
                  Studio Vidéo, Stories, Réels
                </h1>
                <p className="text-white/60 text-xs md:text-sm hidden md:block">
                  {language === 'fr' ? 'Créez des vidéos, stories et réels professionnels' : 'Create professional videos, stories and reels'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3 w-full md:w-auto">
              <Button
                onClick={handleAutoCut}
                disabled={selectedImages.length === 0}
                className="bg-gradient-to-r from-violet-600 to-blue-600 flex-1 md:flex-none"
                size="sm"
              >
                <Wand2 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Auto Cut</span>
              </Button>
              <Button
                onClick={handleSaveStory}
                disabled={selectedImages.length === 0 || saving}
                className="bg-gradient-to-r from-amber-600 to-orange-600 flex-1 md:flex-none"
                size="sm"
              >
                <Save className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{saving ? (language === 'fr' ? 'Sauvegarde...' : 'Saving...') : (language === 'fr' ? 'Sauvegarder' : 'Save')}</span>
              </Button>
              <Button
                onClick={handleExport}
                disabled={selectedImages.length === 0 || exporting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 flex-1 md:flex-none"
                size="sm"
              >
                <Download className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{exporting ? (language === 'fr' ? 'Téléchargement...' : 'Downloading...') : (language === 'fr' ? 'Télécharger' : 'Download')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-32 transition-all duration-300",
        sidebarOpen && "md:ml-64"
      )}>

        {currentStep === 'select' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Panel - Image Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <Video className="h-5 w-5 text-violet-400" />
                  Médias ({selectedImages.length})
                </h2>
              </div>

              {/* Add Images Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Uploader (images/vidéos)
                </Button>
                <Button
                  onClick={() => setShowVisualsModal(true)}
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Mes visuels
                </Button>
                <Button
                  onClick={() => setShowStoriesModal(true)}
                  variant="outline"
                  className="w-full bg-gradient-to-r from-violet-600/20 to-pink-600/20 border-violet-500/30 text-white"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Mes Vidéos ({myStories.length})
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Selected Images */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {selectedImages.map((img, idx) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="relative bg-white/5 rounded-xl border border-white/10 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
                          {img.isVideo || img.video_url ? (
                            <>
                              <video
                                src={(img.video_url || img.image_url) + '#t=0.1'}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                                <div className="bg-white/90 rounded-full p-1">
                                  <Video className="h-3 w-3 text-gray-900" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <img
                              src={img.image_url}
                              alt={img.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate flex items-center gap-1">
                            {img.isVideo || img.video_url ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                            {img.isVideo || img.video_url ? 'Vidéo' : 'Image'} {idx + 1}
                          </p>
                          {img.transition && (
                            <p className="text-violet-400 text-xs">
                              {img.transition.name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newImages = [...selectedImages];
                                newImages[idx] = { ...newImages[idx], duration: Math.max(1, (newImages[idx].duration || 3) - 1) };
                                setSelectedImages(newImages);
                              }}
                              className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-white/60 text-xs"
                            >
                              -
                            </button>
                            <span className="text-white/60 text-xs">{img.duration || 3}s</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newImages = [...selectedImages];
                                newImages[idx] = { ...newImages[idx], duration: Math.min(10, (newImages[idx].duration || 3) + 1) };
                                setSelectedImages(newImages);
                              }}
                              className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-white/60 text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveImage(img.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4 text-red-400" />
                        </button>
                      </div>

                      {/* Transition Arrow */}
                      {idx < selectedImages.length - 1 && (
                        <div className="flex items-center justify-center py-2">
                          <ChevronRight className="h-4 w-4 text-white/30" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {selectedImages.length === 0 && (
                  <div className="text-center py-12">
                    <Video className="h-12 w-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">
                      Aucun média sélectionné
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Panel - Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-pink-400" />
                Prévisualisation ({videoFormat})
              </h2>

              {/* Story Preview */}
              <div 
                ref={previewRef}
                className="relative bg-black rounded-2xl overflow-hidden mx-auto" 
                style={{ aspectRatio: videoFormat ? videoFormat.replace(':', '/') : '1 / 1', maxHeight: '600px' }}
              >
                {selectedImages.length > 0 ? (
                  <div className="relative w-full h-full overflow-hidden">
                    <AnimatePresence mode="wait">
                      {selectedImages[previewIndex]?.isVideo || selectedImages[previewIndex]?.video_url ? (
                        <motion.video
                          key={previewIndex}
                          src={selectedImages[previewIndex]?.video_url || selectedImages[previewIndex]?.image_url}
                          className="w-full h-full object-cover absolute inset-0"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                          initial={getTransitionAnimation(selectedImages[previewIndex]?.transition?.css_animation || 'fadeIn').initial}
                          animate={getTransitionAnimation(selectedImages[previewIndex]?.transition?.css_animation || 'fadeIn').animate}
                          exit={getTransitionAnimation(selectedImages[previewIndex]?.transition?.css_animation || 'fadeIn').exit}
                          transition={{ duration: selectedImages[previewIndex]?.transition?.duration || 0.8, ease: "easeInOut" }}
                        />
                      ) : (
                        <motion.img
                          key={previewIndex}
                          src={selectedImages[previewIndex]?.image_url || selectedImages[0].image_url}
                          alt="Preview"
                          className="w-full h-full object-cover absolute inset-0"
                          initial={getTransitionAnimation(selectedImages[previewIndex]?.transition?.css_animation || 'fadeIn').initial}
                          animate={getTransitionAnimation(selectedImages[previewIndex]?.transition?.css_animation || 'fadeIn').animate}
                          exit={getTransitionAnimation(selectedImages[previewIndex]?.transition?.css_animation || 'fadeIn').exit}
                          transition={{ duration: selectedImages[previewIndex]?.transition?.duration || 0.8, ease: "easeInOut" }}
                        />
                      )}
                    </AnimatePresence>
                    
                    {/* Text Overlays */}
                    {textLayers.map(text => (
                      <div
                        key={text.id}
                        onMouseDown={(e) => handleDragStart(e, text, 'text')}
                        onClick={() => setEditingTextId(text.id)}
                        className={cn(
                          "absolute cursor-move hover:ring-2 hover:ring-violet-500 transition-all select-none z-10",
                          editingTextId === text.id && "ring-2 ring-violet-500"
                        )}
                        style={{
                          top: `${text.position?.y || 50}%`,
                          left: `${text.position?.x || 50}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: `${text.fontSize || 24}px`,
                          color: text.color || '#ffffff',
                          fontWeight: text.bold ? 'bold' : 'normal',
                          fontStyle: text.italic ? 'italic' : 'normal',
                          textAlign: text.align || 'center',
                          fontFamily: text.fontFamily || 'inherit',
                          backgroundColor: text.bgColor || 'transparent',
                          padding: text.bgColor ? '8px 16px' : '0',
                          borderRadius: `${text.borderRadius || 0}px`,
                          border: text.borderWidth ? `${text.borderWidth}px solid ${text.borderColor || '#ffffff'}` : 'none'
                        }}
                      >
                        {text.content}
                      </div>
                    ))}

                    {/* Sticker Overlays */}
                    {stickerLayers.map(sticker => (
                      <div
                        key={sticker.id}
                        onMouseDown={(e) => handleDragStart(e, sticker, 'sticker')}
                        className="absolute cursor-move hover:ring-2 hover:ring-pink-500 transition-all select-none group z-10"
                        style={{
                          top: `${sticker.position?.y || 50}%`,
                          left: `${sticker.position?.x || 50}%`,
                          transform: 'translate(-50%, -50%)',
                          width: `${sticker.size || 100}px`,
                          height: `${sticker.size || 100}px`
                        }}
                      >
                        <img
                          src={sticker.image_url}
                          alt={sticker.title}
                          className="w-full h-full object-contain pointer-events-none"
                          draggable="false"
                        />
                        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                toast.loading(language === 'fr' ? 'Suppression du fond...' : 'Removing background...', { id: 'remove-bg' });

                                const result = await base44.functions.invoke('removeBg', {
                                  image_url: sticker.image_url
                                });

                                toast.dismiss('remove-bg');

                                if (result.data?.no_bg_url) {
                                  setStickerLayers(prev => prev.map(s => 
                                    s.id === sticker.id ? { ...s, image_url: result.data.no_bg_url } : s
                                  ));
                                  toast.success(language === 'fr' ? 'Fond supprimé !' : 'Background removed!');
                                } else {
                                  throw new Error('No result URL');
                                }
                              } catch (error) {
                                toast.dismiss('remove-bg');
                                toast.error(language === 'fr' ? 'Erreur lors de la suppression du fond' : 'Error removing background');
                              }
                            }}
                            className="w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center"
                            title={language === 'fr' ? 'Supprimer le fond' : 'Remove background'}
                          >
                            <Sparkles className="h-3 w-3 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setStickerLayers(prev => prev.filter(s => s.id !== sticker.id));
                            }}
                            className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                        {/* Resize Handle */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, sticker)}
                          className="absolute -bottom-2 -right-2 w-4 h-4 bg-white rounded-full border-2 border-pink-500 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          title={language === 'fr' ? 'Redimensionner' : 'Resize'}
                        />
                      </div>
                    ))}

                    {/* Play Button Overlay */}
                    {!previewPlaying && (
                      <button
                        onClick={() => {
                          if (previewIntervalRef.current) {
                            clearInterval(previewIntervalRef.current);
                          }
                          
                          setPreviewPlaying(true);
                          setPreviewIndex(0);
                          
                          let currentIdx = 0;
                          
                          const playNext = () => {
                            currentIdx++;
                            if (currentIdx >= selectedImages.length) {
                              setPreviewPlaying(false);
                              setPreviewIndex(0);
                              if (previewIntervalRef.current) {
                                clearInterval(previewIntervalRef.current);
                                previewIntervalRef.current = null;
                              }
                            } else {
                              setPreviewIndex(currentIdx);
                              if (previewIntervalRef.current) {
                                clearInterval(previewIntervalRef.current);
                              }
                              previewIntervalRef.current = setTimeout(playNext, (selectedImages[currentIdx]?.duration || 3) * 1000);
                            }
                          };
                          
                          previewIntervalRef.current = setTimeout(playNext, (selectedImages[0]?.duration || 3) * 1000);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                      </button>
                    )}
                    
                    {/* Progress indicator */}
                    {previewPlaying && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                        {selectedImages.map((_, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "h-1 rounded-full transition-all",
                              idx === previewIndex ? "bg-white w-8" : "bg-white/40 w-4"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Video className="h-16 w-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/40">
                        Ajoutez des médias pour voir la prévisualisation
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tools */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
                <Button
                  onClick={() => setShowTextModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 h-12 md:h-10"
                  title={language === 'fr' ? 'Texte' : 'Text'}
                >
                  <Type className="h-5 w-5 md:h-4 md:w-4" />
                </Button>
                <Button
                  onClick={() => setShowStickersModal(true)}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 h-12 md:h-10"
                  title={language === 'fr' ? 'Stickers' : 'Stickers'}
                >
                  <svg className="h-5 w-5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </Button>
                <Button
                  onClick={() => setShowTransitionsModal(true)}
                  disabled={selectedImages.length < 2}
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white h-12 md:h-10"
                  title={language === 'fr' ? 'Transitions' : 'Transitions'}
                >
                  <Sparkles className="h-5 w-5 md:h-4 md:w-4" />
                </Button>
              </div>
              
              {/* Text Editor Panel */}
              {editingTextId && textLayers.find(t => t.id === editingTextId) && (
                <TextStyleEditor
                  text={textLayers.find(t => t.id === editingTextId)}
                  onUpdate={(updates) => {
                    setTextLayers(prev => prev.map(t => 
                      t.id === editingTextId ? { ...t, ...updates } : t
                    ));
                  }}
                  onClose={() => setEditingTextId(null)}
                  language={language}
                />
              )}

              {/* Text Layers List */}
              {textLayers.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-white/60 text-xs font-semibold">Textes ajoutés:</p>
                  {textLayers.map((text, idx) => (
                    <div
                      key={text.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <span className="text-white text-sm">{text.content}</span>
                      <button
                        onClick={() => setTextLayers(prev => prev.filter(t => t.id !== text.id))}
                        className="p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Sticker Layers List */}
              {stickerLayers.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-white/60 text-xs font-semibold">Stickers ajoutés:</p>
                  {stickerLayers.map((sticker, idx) => (
                    <div
                      key={sticker.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <img src={sticker.image_url} alt={sticker.title} className="w-8 h-8 object-contain" />
                        <span className="text-white text-sm">{sticker.title}</span>
                      </div>
                      <button
                        onClick={() => setStickerLayers(prev => prev.filter(s => s.id !== sticker.id))}
                        className="p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Footer */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40 transition-all duration-300",
        sidebarOpen && "md:ml-64"
      )}>
        <Footer />
      </div>

      {/* Visuals Modal */}
      {showVisualsModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowVisualsModal(false)}
        >
          <div
            className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Mes visuels</h2>
              <button
                onClick={() => setShowVisualsModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {myVisuals.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">
                    {language === 'fr' ? 'Aucun visuel disponible' : 'No visuals available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    {myVisuals.slice(0, visualsDisplayCount).map(visual => {
                      const dims = (visual.dimensions && typeof visual.dimensions === 'string') ? visual.dimensions : '1080x1080';
                      const [w, h] = dims.split('x').map(n => parseInt(n));
                      const aspectRatio = (w && h && !isNaN(w) && !isNaN(h)) ? `${w} / ${h}` : '1 / 1';
                      const imageUrl = visual.image_url || '';
                      const isVideo = visual.video_url || (imageUrl && (imageUrl.includes('.mp4') || imageUrl.includes('/video')));
                      
                      return (
                        <button
                          key={visual.id}
                          onClick={() => handleSelectFromVisuals(visual)}
                          className="relative group rounded-xl overflow-hidden border-2 border-white/10 hover:border-violet-500/50 transition-all"
                          style={{ aspectRatio }}
                          onMouseEnter={(e) => {
                            const video = e.currentTarget.querySelector('video');
                            if (video) video.play();
                          }}
                          onMouseLeave={(e) => {
                            const video = e.currentTarget.querySelector('video');
                            if (video) {
                              video.pause();
                              video.currentTime = 0;
                            }
                          }}
                        >
                          {isVideo ? (
                            <video
                              src={visual.video_url || visual.image_url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                            />
                          ) : (
                            <img
                              src={visual.image_url}
                              alt={visual.title}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                            <Plus className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                          {isVideo && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-pink-600/80 backdrop-blur-sm rounded-md flex items-center gap-1">
                              <Video className="h-3 w-3 text-white" />
                              <span className="text-white text-[10px] font-medium">VIDÉO</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Voir plus button - ALWAYS visible if more visuals */}
                  {myVisuals.length > visualsDisplayCount && (
                   <div className="flex justify-center pt-4 pb-2 border-t border-white/10 mt-4">
                     <Button
                       onClick={(e) => {
                         e.stopPropagation();
                         console.log('Before:', visualsDisplayCount, 'Total:', myVisuals.length);
                         setVisualsDisplayCount(prev => prev + 21);
                       }}
                       size="lg"
                       className="bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-violet-500/50 hover:scale-105 transition-all font-bold"
                     >
                       <Plus className="h-5 w-5 mr-2" />
                       {language === 'fr' ? `Voir plus (${myVisuals.length - visualsDisplayCount} restants)` : `Load more (${myVisuals.length - visualsDisplayCount} remaining)`}
                     </Button>
                   </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Text Modal */}
      {showTextModal && (
        <TextEditorModal
          onClose={() => setShowTextModal(false)}
          onAdd={handleAddText}
          language={language}
        />
      )}

      {/* Stickers Modal */}
      {showStickersModal && (
        <StickersModal
          onClose={() => setShowStickersModal(false)}
          myStickers={myStickers}
          sharedStickers={sharedStickers}
          onStickerGenerated={(sticker) => {
            if (sticker.is_shared) {
              setSharedStickers(prev => [sticker, ...prev]);
            } else {
              setMyStickers(prev => [sticker, ...prev]);
            }
          }}
          onStickerClick={handleAddSticker}
          user={user}
          language={language}
        />
      )}

      {/* Transitions Modal */}
      {showTransitionsModal && (
        <TransitionsModal
          animations={animations}
          selectedImages={selectedImages}
          onApply={(imgIndex, transition) => {
            const newImages = [...selectedImages];
            newImages[imgIndex] = { ...newImages[imgIndex], transition };
            setSelectedImages(newImages);
            toast.success('Transition appliquée !');
          }}
          onClose={() => setShowTransitionsModal(false)}
          language={language}
        />
      )}

      {/* Stories Modal */}
      {showStoriesModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowStoriesModal(false)}
        >
          <div
            className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {language === 'fr' ? 'Mes Vidéos' : 'My Videos'}
              </h2>
              <button
                onClick={() => setShowStoriesModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {myStories.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">
                    {language === 'fr' ? 'Aucune vidéo sauvegardée' : 'No saved videos'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {myStories.map(story => {
                    const firstMedia = story.images?.[0];
                    const mediaUrl = firstMedia?.video_url || firstMedia?.image_url || story.thumbnail_url;
                    const isVideo = firstMedia?.isVideo || firstMedia?.video_url;
                    
                    // Calculate format ratio
                    let formatRatio = '9:16';
                    if (firstMedia?.dimensions && typeof firstMedia.dimensions === 'string') {
                      const dims = firstMedia.dimensions.split('x');
                      if (dims.length === 2) {
                        const w = parseInt(dims[0]);
                        const h = parseInt(dims[1]);
                        if (w && h && !isNaN(w) && !isNaN(h)) {
                          const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
                          const divisor = gcd(w, h);
                          formatRatio = `${w/divisor}:${h/divisor}`;
                        }
                      }
                    }
                    
                    return (
                      <button
                        key={story.id}
                        onClick={() => handleLoadStory(story)}
                        className="relative group rounded-xl overflow-hidden border-2 border-white/10 hover:border-violet-500/50 transition-all"
                      >
                        <div style={{ aspectRatio: formatRatio.replace(':', '/') }}>
                          {isVideo ? (
                            <video
                              src={mediaUrl + '#t=0.1'}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={mediaUrl}
                              alt={story.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md">
                          <span className="text-white text-[10px] font-medium">
                            {formatRatio}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                          <p className="text-white text-sm font-medium">{story.title}</p>
                          <p className="text-white/60 text-xs">
                            {story.images?.length || 0} {language === 'fr' ? 'médias' : 'media'} • {story.duration}s
                          </p>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                          <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

// Text Style Editor Component
function TextStyleEditor({ text, onUpdate, onClose, language }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">{language === 'fr' ? 'Éditer le texte' : 'Edit text'}</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-white/60 text-xs mb-1 block">{language === 'fr' ? 'Taille' : 'Size'}: {text.fontSize}px</label>
          <input
            type="range"
            min="16"
            max="72"
            value={text.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-white/60 text-xs mb-1 block">{language === 'fr' ? 'Couleur texte' : 'Text color'}</label>
            <input
              type="color"
              value={text.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-white/60 text-xs mb-1 block">{language === 'fr' ? 'Fond' : 'Background'}</label>
            <input
              type="color"
              value={text.bgColor || '#000000'}
              onChange={(e) => onUpdate({ bgColor: e.target.value })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">{language === 'fr' ? 'Police' : 'Font'}</label>
          <select
            value={text.fontFamily || 'inherit'}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
          >
            <option value="inherit">Défaut</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Impact">Impact</option>
            <option value="Courier New">Courier</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-white/60 text-xs mb-1 block">{language === 'fr' ? 'Bordure' : 'Border'}</label>
            <input
              type="number"
              min="0"
              max="10"
              value={text.borderWidth || 0}
              onChange={(e) => onUpdate({ borderWidth: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="text-white/60 text-xs mb-1 block">{language === 'fr' ? 'Couleur bordure' : 'Border color'}</label>
            <input
              type="color"
              value={text.borderColor || '#ffffff'}
              onChange={(e) => onUpdate({ borderColor: e.target.value })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">{language === 'fr' ? 'Arrondi' : 'Radius'}: {text.borderRadius || 0}px</label>
          <input
            type="range"
            min="0"
            max="50"
            value={text.borderRadius || 0}
            onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onUpdate({ bold: !text.bold })}
            className={cn(
              "flex-1 px-3 py-2 rounded border transition-all text-sm",
              text.bold ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-white/60"
            )}
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => onUpdate({ italic: !text.italic })}
            className={cn(
              "flex-1 px-3 py-2 rounded border transition-all text-sm",
              text.italic ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-white/60"
            )}
          >
            <em>I</em>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Transitions Modal Component
function TransitionsModal({ animations, selectedImages, onApply, onClose, language }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">
          {language === 'fr' ? 'Choisir une transition' : 'Choose transition'}
        </h2>

        <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto mb-4">
          {animations.map(anim => (
            <button
              key={anim.id}
              onClick={() => {
                // Apply to all transitions
                selectedImages.forEach((_, idx) => {
                  if (idx < selectedImages.length - 1) {
                    onApply(idx, anim);
                  }
                });
                onClose();
              }}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 rounded-xl transition-all group"
            >
              {anim.preview_url && (
                <div className="w-full h-24 bg-black/20 rounded-lg mb-2 overflow-hidden">
                  <img 
                    src={anim.preview_url} 
                    alt={anim.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                  />
                </div>
              )}
              <p className="text-white text-sm font-medium">{anim.name}</p>
              <p className="text-white/40 text-xs">{anim.duration}s</p>
            </button>
          ))}
        </div>

        {animations.length === 0 && (
          <p className="text-white/40 text-center py-8">
            {language === 'fr' ? 'Aucune animation disponible' : 'No animations available'}
          </p>
        )}

        <Button onClick={onClose} variant="outline" className="w-full bg-white/5 border-white/20 text-white">
          {language === 'fr' ? 'Fermer' : 'Close'}
        </Button>
      </motion.div>
    </div>
  );
}

// Stickers Modal Component
function StickersModal({ onClose, myStickers, sharedStickers, onStickerGenerated, onStickerClick, user, language }) {
  const [activeTab, setActiveTab] = useState('generate');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [category, setCategory] = useState('illustration');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(language === 'fr' ? 'Entrez une description' : 'Enter a description');
      return;
    }

    setGenerating(true);
    try {
      const enhancedPrompt = `${prompt}, sticker style, transparent background, isolated on white, clean edges, vibrant colors, professional quality`;
      
      const result = await base44.integrations.Core.GenerateImage({
        prompt: enhancedPrompt
      });

      if (result.url) {
        const isAdmin = user?.role === 'admin';
        const stickerData = {
          title: prompt.slice(0, 50),
          image_url: result.url,
          prompt: prompt,
          user_email: isAdmin ? null : user.email,
          is_shared: isAdmin,
          category: category
        };

        const savedSticker = await base44.entities.Sticker.create(stickerData);
        onStickerGenerated(savedSticker);

        toast.success(<span className="flex items-center gap-1.5">
          <span className="text-green-500">✓</span> 
          {isAdmin 
            ? (language === 'fr' ? 'Sticker ajouté à la bibliothèque iGPT' : 'Sticker added to iGPT library')
            : (language === 'fr' ? 'Sticker sauvegardé' : 'Sticker saved')}
        </span>);

        setPrompt('');
        setActiveTab('my');
      }
    } catch (error) {
      console.error(error);
      toast.error(language === 'fr' ? 'Erreur lors de la génération' : 'Generation error');
    }
    setGenerating(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {language === 'fr' ? 'Stickers & Illustrations' : 'Stickers & Illustrations'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors border-b-2",
              activeTab === 'generate'
                ? "text-white border-violet-500"
                : "text-white/60 border-transparent hover:text-white"
            )}
          >
            <Sparkles className="h-4 w-4 inline mr-2" />
            {language === 'fr' ? 'Générer' : 'Generate'}
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors border-b-2",
              activeTab === 'my'
                ? "text-white border-violet-500"
                : "text-white/60 border-transparent hover:text-white"
            )}
          >
            <User className="h-4 w-4 inline mr-2" />
            {language === 'fr' ? `Mes stickers (${myStickers.length})` : `My stickers (${myStickers.length})`}
          </button>
          <button
            onClick={() => setActiveTab('igpt')}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors border-b-2",
              activeTab === 'igpt'
                ? "text-white border-violet-500"
                : "text-white/60 border-transparent hover:text-white"
            )}
          >
            <ImageIcon className="h-4 w-4 inline mr-2" />
            {language === 'fr' ? 'Bibliothèque iGPT' : 'iGPT Library'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'generate' && (
            <div className="space-y-6">
              <div>
                <label className="text-white text-sm font-medium mb-3 block">
                  {language === 'fr' ? 'Décrivez votre sticker' : 'Describe your sticker'}
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={language === 'fr' ? 'Ex: un chat mignon avec des lunettes de soleil' : 'Ex: a cute cat with sunglasses'}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 outline-none focus:border-violet-500/50"
                    disabled={generating}
                  />
                  
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-violet-500/50"
                  >
                    <option value="emoji">Emoji</option>
                    <option value="illustration">Illustration</option>
                    <option value="icon">Icône</option>
                    <option value="decoratif">Décoratif</option>
                    <option value="autre">Autre</option>
                  </select>

                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || generating}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-lg py-6"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {language === 'fr' ? 'Génération...' : 'Generating...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        {language === 'fr' ? 'Générer le sticker' : 'Generate sticker'}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {user?.role === 'admin' && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <p className="text-amber-300 text-sm flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    {language === 'fr' 
                      ? 'Mode Admin : Les stickers générés seront ajoutés à la bibliothèque iGPT partagée'
                      : 'Admin Mode: Generated stickers will be added to the shared iGPT library'}
                  </p>
                </div>
              )}

              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  {language === 'fr' ? 'Exemples de prompts' : 'Prompt examples'}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    language === 'fr' ? 'un cœur rouge brillant' : 'a shiny red heart',
                    language === 'fr' ? 'une étoile dorée scintillante' : 'a golden sparkling star',
                    language === 'fr' ? 'un smiley heureux coloré' : 'a colorful happy smiley',
                    language === 'fr' ? 'une flèche dynamique' : 'a dynamic arrow',
                    language === 'fr' ? 'un badge "NEW" moderne' : 'a modern "NEW" badge',
                    language === 'fr' ? 'des confettis festifs' : 'festive confetti'
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(example)}
                      className="text-left px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 text-sm transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my' && (
            <div>
              {myStickers.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">
                    {language === 'fr' ? 'Aucun sticker personnel' : 'No personal stickers'}
                  </p>
                  <Button
                    onClick={() => setActiveTab('generate')}
                    className="mt-4 bg-gradient-to-r from-pink-600 to-rose-600"
                  >
                    {language === 'fr' ? 'Générer un sticker' : 'Generate a sticker'}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {myStickers.map(sticker => (
                    <button
                      key={sticker.id}
                      onClick={() => onStickerClick(sticker)}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-white/10 hover:border-pink-500/50 bg-white/5 transition-all cursor-pointer"
                    >
                      <img
                        src={sticker.image_url}
                        alt={sticker.title}
                        className="w-full h-full object-contain p-2"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-center p-2">
                          <Plus className="h-8 w-8 text-white mb-1" />
                          <p className="text-white text-xs font-medium">{sticker.title}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'igpt' && (
            <div>
              {sharedStickers.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">
                    {language === 'fr' ? 'Bibliothèque iGPT vide' : 'iGPT library empty'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {sharedStickers.map(sticker => (
                    <button
                      key={sticker.id}
                      onClick={() => onStickerClick(sticker)}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-white/10 hover:border-pink-500/50 bg-white/5 transition-all cursor-pointer"
                    >
                      <img
                        src={sticker.image_url}
                        alt={sticker.title}
                        className="w-full h-full object-contain p-2"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-center p-2">
                          <Plus className="h-8 w-8 text-white mb-1" />
                          <p className="text-white text-xs font-medium">{sticker.title}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Text Editor Modal Component
function TextEditorModal({ onClose, onAdd, language }) {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [color, setColor] = useState('#ffffff');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [bgColor, setBgColor] = useState(null);
  const [fontFamily, setFontFamily] = useState('inherit');
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState('#ffffff');
  const [borderRadius, setBorderRadius] = useState(0);

  const handleAdd = () => {
    if (!text.trim()) {
      toast.error(language === 'fr' ? 'Entrez du texte' : 'Enter text');
      return;
    }

    onAdd({
      content: text,
      fontSize,
      color,
      bold,
      italic,
      bgColor: bgColor,
      fontFamily,
      borderWidth,
      borderColor,
      borderRadius,
      position: { x: 50, y: 50 }
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">
          {language === 'fr' ? 'Ajouter du texte' : 'Add text'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              {language === 'fr' ? 'Texte' : 'Text'}
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={language === 'fr' ? 'Entrez votre texte...' : 'Enter your text...'}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 outline-none focus:border-violet-500/50"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">
              {language === 'fr' ? 'Taille' : 'Size'}: {fontSize}px
            </label>
            <input
              type="range"
              min="16"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                {language === 'fr' ? 'Couleur texte' : 'Text color'}
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                {language === 'fr' ? 'Fond' : 'Background'}
              </label>
              <input
                type="color"
                value={bgColor || '#000000'}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">
              {language === 'fr' ? 'Police' : 'Font'}
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="inherit">Défaut</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Impact">Impact</option>
              <option value="Courier New">Courier</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                {language === 'fr' ? 'Bordure' : 'Border'} (px)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={borderWidth}
                onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                {language === 'fr' ? 'Couleur bordure' : 'Border color'}
              </label>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">
              {language === 'fr' ? 'Arrondi' : 'Radius'}: {borderRadius}px
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={borderRadius}
              onChange={(e) => setBorderRadius(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setBold(!bold)}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg border transition-all",
                bold
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-white/5 border-white/10 text-white/60"
              )}
            >
              <strong>{language === 'fr' ? 'Gras' : 'Bold'}</strong>
            </button>
            <button
              onClick={() => setItalic(!italic)}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg border transition-all",
                italic
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-white/5 border-white/10 text-white/60"
              )}
            >
              <em>{language === 'fr' ? 'Italique' : 'Italic'}</em>
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-white/5 border-white/20 text-white">
              Annuler
            </Button>
            <Button onClick={handleAdd} className="flex-1 bg-gradient-to-r from-violet-600 to-blue-600">
              Ajouter
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}