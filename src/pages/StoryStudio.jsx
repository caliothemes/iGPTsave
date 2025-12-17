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
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedBackground from '@/components/AnimatedBackground';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoryStudio() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [myVisuals, setMyVisuals] = useState([]);
  const [showVisualsModal, setShowVisualsModal] = useState(false);
  const [animations, setAnimations] = useState([]);
  const [textLayers, setTextLayers] = useState([]);
  const [showTextModal, setShowTextModal] = useState(false);
  const [currentStep, setCurrentStep] = useState('select'); // select, edit, preview, export
  const [exporting, setExporting] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const [visuals, anims] = await Promise.all([
          base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 100),
          base44.entities.StoryAnimation.filter({ is_active: true }, 'order')
        ]);

        setMyVisuals(visuals);
        setAnimations(anims);
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
    if (animations.length === 0) {
      toast.error('Aucune animation disponible');
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
    toast.success('Animations appliquées automatiquement !');
  };

  const handleAddText = (textData) => {
    setTextLayers(prev => [...prev, { ...textData, id: Date.now() }]);
    setShowTextModal(false);
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

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                iGPT Story Studio
              </h1>
              <p className="text-white/60 text-sm">Créez des stories vidéo 9:16 professionnelles</p>
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
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
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
                      src={selectedImages[0].image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Text Overlays */}
                    {textLayers.map(text => (
                      <div
                        key={text.id}
                        className="absolute"
                        style={{
                          top: `${text.position?.y || 50}%`,
                          left: `${text.position?.x || 50}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: `${text.fontSize || 24}px`,
                          color: text.color || '#ffffff',
                          fontWeight: text.bold ? 'bold' : 'normal',
                          fontStyle: text.italic ? 'italic' : 'normal',
                          textAlign: text.align || 'center'
                        }}
                      >
                        {text.content}
                      </div>
                    ))}

                    {/* Play Button Overlay */}
                    <button
                      onClick={() => setPreviewPlaying(!previewPlaying)}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </button>
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
                  Ajouter du texte
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Effets & Transitions
                </Button>
              </div>

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
              <div className="grid grid-cols-3 gap-4">
                {myVisuals.map(visual => (
                  <button
                    key={visual.id}
                    onClick={() => handleSelectFromVisuals(visual)}
                    className="relative group rounded-xl overflow-hidden border-2 border-white/10 hover:border-violet-500/50 transition-all"
                  >
                    <img
                      src={visual.image_url}
                      alt={visual.title}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <Plus className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Text Modal */}
      {showTextModal && (
        <TextEditorModal
          onClose={() => setShowTextModal(false)}
          onAdd={handleAddText}
        />
      )}
    </div>
  );
}

// Text Editor Modal Component
function TextEditorModal({ onClose, onAdd }) {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [color, setColor] = useState('#ffffff');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  const handleAdd = () => {
    if (!text.trim()) {
      toast.error('Entrez du texte');
      return;
    }

    onAdd({
      content: text,
      fontSize,
      color,
      bold,
      italic,
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
        className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">Ajouter du texte</h2>

        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Texte</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Entrez votre texte..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 outline-none focus:border-violet-500/50"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Taille: {fontSize}px</label>
            <input
              type="range"
              min="16"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Couleur</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
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
              <strong>Gras</strong>
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
              <em>Italique</em>
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