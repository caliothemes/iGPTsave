import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Download, Type, Palette, Move, Trash2, Eye, EyeOff, Plus, Zap } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function ADSModal({ isOpen, onClose, visual }) {
  const { language } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [socialPost, setSocialPost] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Reset on open and load suggestions
  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setLayers([]);
      setSelectedLayer(null);
      setSocialPost('');
      setShowPreview(false);
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image and suggest 6 SHORT advertising prompt ideas in ${language === 'fr' ? 'French' : 'English'}.
        
Return ONLY a JSON array of strings, each being a complete prompt suggestion.
Examples:
- "Ajoute 'SOLDES -50%' en gros, un CTA 'J'en profite' et un slogan"
- "Crée une pub Instagram avec titre accrocheur et prix"
- "Ajoute 'NOUVEAU' en badge, description produit et CTA"

Return format: ["prompt1", "prompt2", "prompt3", "prompt4", "prompt5", "prompt6"]`,
        response_json_schema: {
          type: "object",
          properties: {
            prompts: { type: "array", items: { type: "string" } }
          }
        },
        file_urls: [visual.image_url]
      });
      
      if (response?.prompts && response.prompts.length > 0) {
        setSuggestedPrompts(response.prompts);
      }
    } catch (e) {
      console.error('Failed to load suggestions:', e);
    }
    setLoadingSuggestions(false);
  };

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !visual?.image_url || layers.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Draw all layers
      layers.forEach(layer => {
        if (!layer.visible) return;
        
        ctx.save();
        
        // Letter spacing
        if (layer.letterSpacing) {
          ctx.letterSpacing = layer.letterSpacing;
        }
        
        // Background/frame with rounded corners
        if (layer.background) {
          const padding = layer.backgroundPadding || 30;
          const metrics = ctx.measureText(layer.text);
          const textHeight = parseInt(layer.fontSize);
          const bgX = layer.x - padding;
          const bgY = layer.y - textHeight - padding / 2;
          const bgWidth = metrics.width + padding * 2;
          const bgHeight = textHeight + padding;
          const radius = 15;
          
          // Rounded rectangle
          ctx.beginPath();
          ctx.moveTo(bgX + radius, bgY);
          ctx.lineTo(bgX + bgWidth - radius, bgY);
          ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + radius);
          ctx.lineTo(bgX + bgWidth, bgY + bgHeight - radius);
          ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - radius, bgY + bgHeight);
          ctx.lineTo(bgX + radius, bgY + bgHeight);
          ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - radius);
          ctx.lineTo(bgX, bgY + radius);
          ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
          ctx.closePath();
          
          // Gradient or solid
          if (layer.background.includes('gradient')) {
            // Parse gradient (simplified)
            ctx.fillStyle = layer.background.replace('linear-gradient', '').replace(/[()]/g, '');
            // For now use first color
            const colors = layer.background.match(/rgba?\([^)]+\)/g);
            if (colors && colors.length > 0) {
              ctx.fillStyle = colors[0];
            }
          } else {
            ctx.fillStyle = layer.background;
          }
          ctx.fill();
        }
        
        // Shadow
        if (layer.shadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 4;
          ctx.shadowOffsetY = 4;
        }
        
        // Font setup
        ctx.font = `${layer.fontWeight || '900'} ${layer.fontSize} ${layer.fontFamily || 'Impact, Arial Black, sans-serif'}`;
        ctx.textAlign = layer.align || 'left';
        
        // Stroke first (for better visibility)
        if (layer.stroke) {
          ctx.strokeStyle = layer.strokeColor || '#000000';
          ctx.lineWidth = layer.strokeWidth || 4;
          ctx.lineJoin = 'round';
          ctx.strokeText(layer.text, layer.x, layer.y);
        }
        
        // Text
        ctx.fillStyle = layer.color;
        ctx.fillText(layer.text, layer.x, layer.y);
        
        ctx.restore();
        
        // Selection box
        if (selectedLayer === layer.id) {
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 2;
          const metrics = ctx.measureText(layer.text);
          const textHeight = parseInt(layer.fontSize);
          ctx.strokeRect(layer.x - 5, layer.y - textHeight - 5, metrics.width + 10, textHeight + 10);
        }
      });
    };
    img.src = visual.image_url;
  }, [layers, visual, selectedLayer]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(language === 'fr' ? 'Décrivez votre publicité' : 'Describe your ad');
      return;
    }

    setGenerating(true);
    try {
      // Call AI to analyze image and generate ad suggestions
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this visual and create STUNNING professional advertising design based on: "${prompt}".

Generate 2-4 text elements strategically placed with PREMIUM styling.

CRITICAL STYLING RULES:
1. FONT SIZES: Titles 60-120px, subtitles 40-70px, text 30-50px, small 20-30px
2. FONTS: Use "Impact", "Arial Black", "Helvetica" for impact
3. COLORS: High contrast (white on dark bg, or dark on light bg)
4. BACKGROUNDS: Use semi-transparent boxes (rgba) with blur effect OR gradient backgrounds
5. EFFECTS: Combine shadow + stroke for maximum visibility
6. SPACING: Leave margins, don't overlap text
7. PLACEMENT: Avoid center unless justified, use rule of thirds

Example PREMIUM text element:
{
  "text": "BLACK FRIDAY",
  "x": 100,
  "y": 200,
  "fontSize": "90px",
  "color": "#FFFFFF",
  "fontWeight": "900",
  "fontFamily": "Impact",
  "background": "linear-gradient(135deg, rgba(255,0,100,0.9), rgba(255,100,0,0.9))",
  "shadow": true,
  "stroke": true,
  "strokeColor": "#000000",
  "strokeWidth": 4,
  "align": "left",
  "type": "title",
  "letterSpacing": "2px"
}

Return JSON:
{
  "texts": [...],
  "socialPost": "..."
}`,
        response_json_schema: {
          type: "object",
          properties: {
            texts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  x: { type: "number" },
                  y: { type: "number" },
                  fontSize: { type: "string" },
                  color: { type: "string" },
                  fontWeight: { type: "string" },
                  fontFamily: { type: "string" },
                  background: { type: "string" },
                  shadow: { type: "boolean" },
                  stroke: { type: "boolean" },
                  strokeColor: { type: "string" },
                  strokeWidth: { type: "number" },
                  align: { type: "string" },
                  type: { type: "string" }
                }
              }
            },
            socialPost: { type: "string" },
            tips: { type: "array", items: { type: "string" } }
          }
        },
        file_urls: [visual.image_url]
      });

      if (response?.texts && response.texts.length > 0) {
        // Add IDs and visible flag
        const layersWithIds = response.texts.map((text, idx) => ({
          ...text,
          id: Date.now() + idx,
          visible: true
        }));
        setLayers(layersWithIds);
        setSocialPost(response.socialPost || '');
        setShowPreview(true);
        toast.success(language === 'fr' ? '✨ Publicité générée !' : '✨ Ad generated!');
      }
    } catch (e) {
      console.error(e);
      toast.error(language === 'fr' ? 'Erreur de génération' : 'Generation error');
    }
    setGenerating(false);
  };

  const handleCanvasMouseDown = (e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Find clicked layer
    const ctx = canvasRef.current.getContext('2d');
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (!layer.visible) continue;
      
      ctx.font = `${layer.fontWeight || 'bold'} ${layer.fontSize} ${layer.fontFamily || 'Arial'}`;
      const metrics = ctx.measureText(layer.text);
      const textHeight = parseInt(layer.fontSize);
      
      if (x >= layer.x - 5 && x <= layer.x + metrics.width + 5 &&
          y >= layer.y - textHeight - 5 && y <= layer.y + 5) {
        setSelectedLayer(layer.id);
        setIsDragging(true);
        setDragOffset({ x: x - layer.x, y: y - layer.y });
        return;
      }
    }
    
    setSelectedLayer(null);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !selectedLayer || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setLayers(prev => prev.map(layer => 
      layer.id === selectedLayer 
        ? { ...layer, x: x - dragOffset.x, y: y - dragOffset.y }
        : layer
    ));
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const updateSelectedLayer = (updates) => {
    if (!selectedLayer) return;
    setLayers(prev => prev.map(layer => 
      layer.id === selectedLayer ? { ...layer, ...updates } : layer
    ));
  };

  const deleteSelectedLayer = () => {
    if (!selectedLayer) return;
    setLayers(prev => prev.filter(layer => layer.id !== selectedLayer));
    setSelectedLayer(null);
  };

  const toggleLayerVisibility = (layerId) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    
    try {
      const blob = await new Promise((resolve) => {
        canvasRef.current.toBlob(resolve, 'image/png');
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${visual.title || 'ad'}-publicite.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(language === 'fr' ? '📥 Publicité téléchargée !' : '📥 Ad downloaded!');
    } catch (e) {
      console.error(e);
      toast.error(language === 'fr' ? 'Erreur d\'export' : 'Export error');
    }
  };

  const selectedLayerData = layers.find(l => l.id === selectedLayer);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-gray-900 border-white/10 text-white p-0">
        <div className="flex h-full overflow-hidden">
          {/* Left Panel - Preview */}
          <div className="flex-1 bg-black/20 p-6 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {language === 'fr' ? 'Créateur de Pub IA' : 'AI Ad Creator'}
                  </h2>
                  <p className="text-xs text-white/40">
                    {language === 'fr' ? 'Transformez en publicité pro' : 'Transform into pro ad'}
                  </p>
                </div>
              </div>
            </div>

            {!showPreview ? (
              // Input Phase
              <div className="space-y-4">
                <div className="aspect-video bg-white/5 rounded-lg overflow-hidden border border-white/10">
                  <img 
                    src={visual?.image_url} 
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80">
                    {language === 'fr' 
                      ? '✨ Décrivez votre publicité'
                      : '✨ Describe your ad'}
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={language === 'fr' 
                      ? 'Ex: Ajoute un titre "BLACK FRIDAY -50%", un CTA "ACHETER MAINTENANT" et un slogan accrocheur'
                      : 'Ex: Add title "BLACK FRIDAY -50%", CTA "BUY NOW" and catchy slogan'}
                    className="min-h-32 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    disabled={generating}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleGenerate}
                      disabled={generating || !prompt.trim()}
                      className="flex-1 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {language === 'fr' ? 'Génération...' : 'Generating...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          {language === 'fr' ? 'Générer la pub' : 'Generate ad'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Smart Suggestions */}
                {loadingSuggestions ? (
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
                      <p className="text-violet-200 text-sm">
                        {language === 'fr' ? 'Analyse de votre visuel...' : 'Analyzing your visual...'}
                      </p>
                    </div>
                  </div>
                ) : suggestedPrompts.length > 0 && (
                  <div className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20 rounded-lg p-4">
                    <p className="text-violet-200 text-sm font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {language === 'fr' ? 'Suggestions pour votre visuel' : 'Suggestions for your visual'}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {suggestedPrompts.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPrompt(suggestion)}
                          className="text-left px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/30 rounded-lg transition-all text-xs text-white/80 hover:text-white"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Preview Phase
              <div className="space-y-4">
                <div className="relative bg-white/5 rounded-lg overflow-hidden border border-white/10">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    className="w-full h-auto cursor-move"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleExport}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {language === 'fr' ? 'Télécharger' : 'Download'}
                  </Button>
                  <Button
                    onClick={() => setShowPreview(false)}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    {language === 'fr' ? 'Nouvelle pub' : 'New ad'}
                  </Button>
                </div>

                {/* Social Post */}
                {socialPost && (
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4">
                    <p className="text-violet-200 text-sm font-medium mb-2">
                      📱 {language === 'fr' ? 'Texte pour le post' : 'Post caption'}
                    </p>
                    <p className="text-violet-200/80 text-sm">{socialPost}</p>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(socialPost);
                        toast.success(language === 'fr' ? 'Copié !' : 'Copied!');
                      }}
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-violet-300 hover:text-violet-200"
                    >
                      {language === 'fr' ? 'Copier le texte' : 'Copy text'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Layer Controls */}
          {showPreview && (
            <div className="w-80 bg-gray-900/50 border-l border-white/10 p-4 overflow-auto">
              <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                <Type className="h-4 w-4" />
                {language === 'fr' ? 'Calques de texte' : 'Text layers'}
              </h3>

              {/* Layer List */}
              <div className="space-y-2 mb-4">
                {layers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer.id)}
                    className={cn(
                      "w-full p-2 rounded-lg flex items-center gap-2 transition-colors text-left",
                      selectedLayer === layer.id
                        ? "bg-violet-600/30 border border-violet-500/50"
                        : "bg-white/5 border border-transparent hover:bg-white/10"
                    )}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisibility(layer.id);
                      }}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      {layer.visible ? (
                        <Eye className="h-4 w-4 text-white/60" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-white/30" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{layer.text}</p>
                      <p className="text-xs text-white/40">{layer.type || 'text'}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Layer Editor */}
              {selectedLayerData && (
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <h4 className="text-xs font-bold text-white/60 uppercase">
                    {language === 'fr' ? 'Éditer' : 'Edit'}
                  </h4>

                  {/* Text */}
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">
                      {language === 'fr' ? 'Texte' : 'Text'}
                    </label>
                    <input
                      type="text"
                      value={selectedLayerData.text}
                      onChange={(e) => updateSelectedLayer({ text: e.target.value })}
                      className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white"
                    />
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">
                      {language === 'fr' ? 'Taille' : 'Size'}
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="120"
                      value={parseInt(selectedLayerData.fontSize)}
                      onChange={(e) => updateSelectedLayer({ fontSize: `${e.target.value}px` })}
                      className="w-full"
                    />
                    <p className="text-xs text-white/40">{selectedLayerData.fontSize}</p>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">
                      {language === 'fr' ? 'Couleur' : 'Color'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedLayerData.color}
                        onChange={(e) => updateSelectedLayer({ color: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedLayerData.color}
                        onChange={(e) => updateSelectedLayer({ color: e.target.value })}
                        className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Background */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/60">
                      {language === 'fr' ? 'Fond' : 'Background'}
                    </label>
                    <input
                      type="checkbox"
                      checked={!!selectedLayerData.background}
                      onChange={(e) => updateSelectedLayer({ 
                        background: e.target.checked ? 'rgba(0,0,0,0.8)' : null 
                      })}
                      className="rounded"
                    />
                  </div>

                  {/* Shadow */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/60">
                      {language === 'fr' ? 'Ombre' : 'Shadow'}
                    </label>
                    <input
                      type="checkbox"
                      checked={!!selectedLayerData.shadow}
                      onChange={(e) => updateSelectedLayer({ shadow: e.target.checked })}
                      className="rounded"
                    />
                  </div>

                  {/* Delete */}
                  <Button
                    onClick={deleteSelectedLayer}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {language === 'fr' ? 'Supprimer' : 'Delete'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}