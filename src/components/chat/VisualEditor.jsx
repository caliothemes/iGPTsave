import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Type, Square, Circle, Download, X, Plus, Trash2, 
  Move, ChevronUp, ChevronDown, Palette, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, RotateCcw, Check,
  Layers, Sparkles, Wand2
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { cn } from "@/lib/utils";

const FONTS = [
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif' },
  { id: 'playfair', name: 'Playfair', family: 'Playfair Display, serif' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { id: 'oswald', name: 'Oswald', family: 'Oswald, sans-serif' },
  { id: 'dancing', name: 'Dancing Script', family: 'Dancing Script, cursive' },
];

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', 
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8C00', '#9B59B6'
];

export default function VisualEditor({ visual, onSave, onCancel }) {
  const { language } = useLanguage();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Load base image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxSize = 400;
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      setCanvasSize({
        width: img.width * ratio,
        height: img.height * ratio
      });
      setImageLoaded(true);
    };
    img.src = visual.image_url;
  }, [visual.image_url]);

  // Render canvas
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw layers
      layers.forEach((layer, idx) => {
        ctx.save();
        
        if (layer.type === 'text') {
          const fontStyle = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.fontSize}px ${layer.fontFamily}`;
          ctx.font = fontStyle;
          ctx.fillStyle = layer.color;
          ctx.textAlign = layer.align || 'left';
          ctx.globalAlpha = layer.opacity / 100;
          
          // Text shadow for better visibility
          if (layer.shadow) {
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
          }
          
          ctx.fillText(layer.text, layer.x, layer.y);
        } else if (layer.type === 'shape') {
          ctx.fillStyle = layer.color;
          ctx.globalAlpha = layer.opacity / 100;
          
          if (layer.shape === 'rectangle') {
            ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
          } else if (layer.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(layer.x + layer.width/2, layer.y + layer.height/2, layer.width/2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        ctx.restore();

        // Draw selection border
        if (selectedLayer === idx) {
          ctx.strokeStyle = '#8B5CF6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          
          if (layer.type === 'text') {
            const metrics = ctx.measureText(layer.text);
            ctx.strokeRect(
              layer.x - 5 - (layer.align === 'center' ? metrics.width/2 : layer.align === 'right' ? metrics.width : 0),
              layer.y - layer.fontSize,
              metrics.width + 10,
              layer.fontSize + 10
            );
          } else {
            ctx.strokeRect(layer.x - 5, layer.y - 5, layer.width + 10, layer.height + 10);
          }
          ctx.setLineDash([]);
        }
      });
    };
    img.src = visual.image_url;
  }, [imageLoaded, layers, selectedLayer, visual.image_url]);

  const addTextLayer = () => {
    const newLayer = {
      type: 'text',
      text: language === 'fr' ? 'Votre texte' : 'Your text',
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      fontSize: 32,
      fontFamily: 'Inter, sans-serif',
      color: '#FFFFFF',
      bold: false,
      italic: false,
      align: 'center',
      opacity: 100,
      shadow: true
    };
    setLayers([...layers, newLayer]);
    setSelectedLayer(layers.length);
    setActiveTab('text');
  };

  const addShapeLayer = (shape) => {
    const newLayer = {
      type: 'shape',
      shape,
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 50,
      width: 100,
      height: 100,
      color: '#FFFFFF',
      opacity: 80
    };
    setLayers([...layers, newLayer]);
    setSelectedLayer(layers.length);
    setActiveTab('shape');
  };

  const updateLayer = (index, updates) => {
    const newLayers = [...layers];
    newLayers[index] = { ...newLayers[index], ...updates };
    setLayers(newLayers);
  };

  const deleteLayer = (index) => {
    setLayers(layers.filter((_, i) => i !== index));
    setSelectedLayer(null);
  };

  const moveLayer = (index, direction) => {
    const newLayers = [...layers];
    const newIndex = direction === 'up' ? index + 1 : index - 1;
    if (newIndex < 0 || newIndex >= layers.length) return;
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    setLayers(newLayers);
    setSelectedLayer(newIndex);
  };

  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked layer (reverse order for top layer priority)
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      let hit = false;

      if (layer.type === 'text') {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
        const metrics = ctx.measureText(layer.text);
        const textX = layer.x - (layer.align === 'center' ? metrics.width/2 : layer.align === 'right' ? metrics.width : 0);
        hit = x >= textX && x <= textX + metrics.width && y >= layer.y - layer.fontSize && y <= layer.y;
      } else {
        hit = x >= layer.x && x <= layer.x + layer.width && y >= layer.y && y <= layer.y + layer.height;
      }

      if (hit) {
        setSelectedLayer(i);
        setDragging(i);
        setDragOffset({ x: x - layer.x, y: y - layer.y });
        return;
      }
    }
    setSelectedLayer(null);
  };

  const handleCanvasMouseMove = (e) => {
    if (dragging === null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    updateLayer(dragging, { x, y });
  };

  const handleCanvasMouseUp = () => {
    setDragging(null);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${visual.title || 'visual'}-edited.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onSave?.();
  };

  const currentLayer = selectedLayer !== null ? layers[selectedLayer] : null;

  return (
    <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/10 rounded-2xl p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-violet-400" />
          <h3 className="text-white font-semibold">
            {language === 'fr' ? 'Éditeur Magique' : 'Magic Editor'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white/60 hover:text-white"
          >
            <X className="h-4 w-4 mr-1" />
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
          >
            <Download className="h-4 w-4 mr-1" />
            {language === 'fr' ? 'Télécharger' : 'Download'}
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Tools Sidebar */}
        <div className="w-12 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={addTextLayer}
            className={cn(
              "text-white/60 hover:text-white hover:bg-white/10",
              activeTab === 'text' && "bg-violet-500/20 text-violet-300"
            )}
            title={language === 'fr' ? 'Ajouter texte' : 'Add text'}
          >
            <Type className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addShapeLayer('rectangle')}
            className="text-white/60 hover:text-white hover:bg-white/10"
            title={language === 'fr' ? 'Rectangle' : 'Rectangle'}
          >
            <Square className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addShapeLayer('circle')}
            className="text-white/60 hover:text-white hover:bg-white/10"
            title={language === 'fr' ? 'Cercle' : 'Circle'}
          >
            <Circle className="h-5 w-5" />
          </Button>
          
          <div className="border-t border-white/10 my-2" />
          
          {/* Layers list */}
          <div className="flex flex-col gap-1">
            {layers.map((layer, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedLayer(idx)}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-xs transition-all",
                  selectedLayer === idx 
                    ? "bg-violet-500/30 text-violet-300 border border-violet-500/50" 
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                )}
              >
                {layer.type === 'text' ? 'T' : layer.shape === 'circle' ? '○' : '□'}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 flex items-center justify-center bg-black/30 rounded-xl p-4"
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="rounded-lg cursor-move shadow-2xl"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
        </div>

        {/* Properties Panel */}
        <div className="w-48 space-y-3">
          {currentLayer ? (
            <>
              {/* Layer actions */}
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">
                  {currentLayer.type === 'text' ? 'Texte' : 'Forme'} #{selectedLayer + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveLayer(selectedLayer, 'up')}
                    className="p-1 text-white/40 hover:text-white"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => moveLayer(selectedLayer, 'down')}
                    className="p-1 text-white/40 hover:text-white"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => deleteLayer(selectedLayer)}
                    className="p-1 text-red-400/60 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {currentLayer.type === 'text' && (
                <>
                  {/* Text input */}
                  <Input
                    value={currentLayer.text}
                    onChange={(e) => updateLayer(selectedLayer, { text: e.target.value })}
                    className="bg-white/5 border-white/10 text-white text-sm"
                    placeholder="Texte..."
                  />

                  {/* Font */}
                  <select
                    value={currentLayer.fontFamily}
                    onChange={(e) => updateLayer(selectedLayer, { fontFamily: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-md text-white text-sm"
                  >
                    {FONTS.map(font => (
                      <option key={font.id} value={font.family} style={{ fontFamily: font.family }}>
                        {font.name}
                      </option>
                    ))}
                  </select>

                  {/* Font size */}
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">
                      {language === 'fr' ? 'Taille' : 'Size'}: {currentLayer.fontSize}px
                    </label>
                    <Slider
                      value={[currentLayer.fontSize]}
                      onValueChange={([v]) => updateLayer(selectedLayer, { fontSize: v })}
                      min={12}
                      max={120}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Style buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateLayer(selectedLayer, { bold: !currentLayer.bold })}
                      className={cn(
                        "flex-1 py-1.5 rounded text-sm transition-colors",
                        currentLayer.bold ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60 hover:bg-white/10"
                      )}
                    >
                      <Bold className="h-4 w-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => updateLayer(selectedLayer, { italic: !currentLayer.italic })}
                      className={cn(
                        "flex-1 py-1.5 rounded text-sm transition-colors",
                        currentLayer.italic ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60 hover:bg-white/10"
                      )}
                    >
                      <Italic className="h-4 w-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => updateLayer(selectedLayer, { shadow: !currentLayer.shadow })}
                      className={cn(
                        "flex-1 py-1.5 rounded text-sm transition-colors",
                        currentLayer.shadow ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60 hover:bg-white/10"
                      )}
                    >
                      S
                    </button>
                  </div>

                  {/* Alignment */}
                  <div className="flex gap-1">
                    {['left', 'center', 'right'].map(align => (
                      <button
                        key={align}
                        onClick={() => updateLayer(selectedLayer, { align })}
                        className={cn(
                          "flex-1 py-1.5 rounded text-sm transition-colors",
                          currentLayer.align === align ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                      >
                        {align === 'left' && <AlignLeft className="h-4 w-4 mx-auto" />}
                        {align === 'center' && <AlignCenter className="h-4 w-4 mx-auto" />}
                        {align === 'right' && <AlignRight className="h-4 w-4 mx-auto" />}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {currentLayer.type === 'shape' && (
                <>
                  {/* Size */}
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">
                      {language === 'fr' ? 'Largeur' : 'Width'}: {currentLayer.width}px
                    </label>
                    <Slider
                      value={[currentLayer.width]}
                      onValueChange={([v]) => updateLayer(selectedLayer, { width: v })}
                      min={20}
                      max={300}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">
                      {language === 'fr' ? 'Hauteur' : 'Height'}: {currentLayer.height}px
                    </label>
                    <Slider
                      value={[currentLayer.height]}
                      onValueChange={([v]) => updateLayer(selectedLayer, { height: v })}
                      min={20}
                      max={300}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {/* Color picker */}
              <div>
                <label className="text-white/50 text-xs mb-1 block">
                  {language === 'fr' ? 'Couleur' : 'Color'}
                </label>
                <div className="flex flex-wrap gap-1">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => updateLayer(selectedLayer, { color })}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                        currentLayer.color === color ? "border-violet-400" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={currentLayer.color}
                  onChange={(e) => updateLayer(selectedLayer, { color: e.target.value })}
                  className="w-full h-8 mt-2 cursor-pointer"
                />
              </div>

              {/* Opacity */}
              <div>
                <label className="text-white/50 text-xs mb-1 block">
                  {language === 'fr' ? 'Opacité' : 'Opacity'}: {currentLayer.opacity}%
                </label>
                <Slider
                  value={[currentLayer.opacity]}
                  onValueChange={([v]) => updateLayer(selectedLayer, { opacity: v })}
                  min={10}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Layers className="h-8 w-8 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-xs">
                {language === 'fr' 
                  ? 'Ajoutez du texte ou des formes' 
                  : 'Add text or shapes'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}