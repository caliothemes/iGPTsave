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
  ArrowLeft
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
  const fileInputRef = useRef(null);
  const previewIntervalRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const [visuals, anims, userCreds, convs, stories] = await Promise.all([
          base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 100),
          base44.entities.StoryAnimation.filter({ is_active: true }, 'order'),
          base44.entities.UserCredits.filter({ user_email: currentUser.email }),
          base44.entities.Conversation.filter({ user_email: currentUser.email }, '-updated_date', 20),
          base44.entities.Story.filter({ user_email: currentUser.email }, '-created_date', 50)
        ]);

        // Filter for story format (9:16 or vertical)
        const storyVisuals = visuals.filter(v => {
          if (!v.dimensions) return false;
          const [w, h] = v.dimensions.split('x').map(n => parseInt(n));
          const ratio = w / h;
          return ratio < 1; // Vertical formats only
        });

        setMyVisuals(storyVisuals);
        setUserVisuals(visuals);
        setAnimations(anims);
        setConversations(convs);
        setMyStories(stories);
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
        uploaded.push({
          id: Date.now() + Math.random(),
          image_url: file_url,
          title: file.name,
          isUploaded: true
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
    setSelectedImages(prev => [...prev, visual]);
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
        thumbnail_url: selectedImages[0].image_url,
        duration: totalDuration
      });

      setMyStories(prev => [story, ...prev]);
      toast.success(language === 'fr' ? '✅ Story sauvegardée !' : '✅ Story saved!');
    } catch (e) {
      console.error(e);
      toast.error(language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Save error');
    }
    setSaving(false);
  };

  const handleLoadStory = (story) => {
    setSelectedImages(story.images || []);
    setTextLayers(story.text_layers || []);
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = createPageUrl('Home')}
                className="text-white/60 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  iGPT Story Studio
                </h1>
                <p className="text-white/60 text-sm">
                  {language === 'fr' ? 'Créez des stories vidéo 9:16 professionnelles' : 'Create professional 9:16 video stories'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAutoCut}
                disabled={selectedImages.length === 0}
                className="bg-gradient-to-r from-violet-600 to-blue-600"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Auto Cut
              </Button>
              <Button
                onClick={handleSaveStory}
                disabled={selectedImages.length === 0 || saving}
                className="bg-gradient-to-r from-amber-600 to-orange-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? (language === 'fr' ? 'Sauvegarde...' : 'Saving...') : (language === 'fr' ? 'Sauvegarder' : 'Save')}
              </Button>
              <Button
                onClick={handleExport}
                disabled={selectedImages.length === 0 || exporting}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Export...' : 'Exporter'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "relative z-10 max-w-7xl mx-auto px-6 py-8 pb-32 transition-all duration-300",
        sidebarOpen && "md:ml-64"
      )}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Image Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-violet-400" />
                Images ({selectedImages.length})
              </h2>

              {/* Add Images Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Uploader des images
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
                  Mes Stories ({myStories.length})
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
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
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                          <img
                            src={img.image_url}
                            alt={img.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            Image {idx + 1}
                          </p>
                          {img.transition && (
                            <p className="text-violet-400 text-xs">
                              {img.transition.name}
                            </p>
                          )}
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
                    <ImageIcon className="h-12 w-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">
                      Aucune image sélectionnée
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Panel - Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-pink-400" />
                Prévisualisation Story (9:16)
              </h2>

              {/* Story Preview */}
              <div className="relative bg-black rounded-2xl overflow-hidden mx-auto" style={{ aspectRatio: '9/16', maxHeight: '600px' }}>
                {selectedImages.length > 0 ? (
                  <div className="relative w-full h-full">
                    <img
                      src={selectedImages[previewIndex]?.image_url || selectedImages[0].image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Text Overlays */}
                    {textLayers.map(text => (
                      <button
                        key={text.id}
                        onClick={() => setEditingTextId(text.id)}
                        className={cn(
                          "absolute cursor-move hover:ring-2 hover:ring-violet-500 transition-all",
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
                      </button>
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
                    
                    {/* Transition Effect Overlay */}
                    {previewPlaying && selectedImages[previewIndex]?.transition && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{ 
                          animation: `${selectedImages[previewIndex].transition.css_animation || 'fadeIn'} ${selectedImages[previewIndex].transition.duration || 1}s ease-in-out`
                        }}
                      />
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
                        Ajoutez des images pour voir la prévisualisation
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tools */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button
                  onClick={() => setShowTextModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  <Type className="h-4 w-4 mr-2" />
                  {language === 'fr' ? 'Ajouter du texte' : 'Add text'}
                </Button>
                <Button
                  onClick={() => setShowTransitionsModal(true)}
                  disabled={selectedImages.length < 2}
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {language === 'fr' ? 'Effets & Transitions' : 'Effects & Transitions'}
                </Button>
              </div>
              
              {/* Text Editor Panel */}
              {editingTextId && (
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
            </div>
          </div>
        </div>
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {myVisuals.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">
                    {language === 'fr' ? 'Aucun visuel vertical (9:16)' : 'No vertical visuals (9:16)'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    {myVisuals.slice(0, visualsDisplayCount).map(visual => {
                      const dims = visual.dimensions || '1080x1080';
                      const [w, h] = dims.split('x').map(n => parseInt(n));
                      const aspectRatio = w && h ? `${w} / ${h}` : '1 / 1';
                      
                      return (
                        <button
                          key={visual.id}
                          onClick={() => handleSelectFromVisuals(visual)}
                          className="relative group rounded-xl overflow-hidden border-2 border-white/10 hover:border-violet-500/50 transition-all"
                        >
                          <div style={{ aspectRatio }}>
                            <img
                              src={visual.image_url}
                              alt={visual.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                            <Plus className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Voir plus button */}
                  {visualsDisplayCount < myVisuals.length && (
                    <div className="flex justify-center pb-4">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVisualsDisplayCount(prev => prev + 21);
                        }}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-violet-500/50"
                      >
                        <ChevronRight className="h-4 w-4 mr-2" />
                        {language === 'fr' ? `Voir plus (${myVisuals.length - visualsDisplayCount} restants)` : `Load more (${myVisuals.length - visualsDisplayCount} remaining)`}
                      </Button>
                    </div>
                  )}
                </>
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
                {language === 'fr' ? 'Mes Stories' : 'My Stories'}
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
                    {language === 'fr' ? 'Aucune story sauvegardée' : 'No saved stories'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {myStories.map(story => (
                    <button
                      key={story.id}
                      onClick={() => handleLoadStory(story)}
                      className="relative group rounded-xl overflow-hidden border-2 border-white/10 hover:border-violet-500/50 transition-all"
                    >
                      <div style={{ aspectRatio: '9/16' }}>
                        <img
                          src={story.thumbnail_url}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                        <p className="text-white text-sm font-medium">{story.title}</p>
                        <p className="text-white/60 text-xs">
                          {story.images?.length || 0} {language === 'fr' ? 'images' : 'images'} • {story.duration}s
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideInDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes rotateIn {
          from { transform: rotate(-180deg) scale(0); opacity: 0; }
          to { transform: rotate(0) scale(1); opacity: 1; }
        }
      `}</style>
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

// Text Editor Modal Component
function TextEditorModal({ onClose, onAdd, language }) {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [color, setColor] = useState('#ffffff');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [bgColor, setBgColor] = useState('transparent');
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
      bgColor: bgColor === 'transparent' ? null : bgColor,
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
                value={bgColor === 'transparent' ? '#000000' : bgColor}
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