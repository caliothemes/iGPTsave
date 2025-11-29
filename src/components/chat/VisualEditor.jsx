import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Type, Square, Circle, Download, X, Trash2, 
  ChevronUp, ChevronDown, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Wand2,
  Layers, Sparkles, Triangle, Star, Heart, Hexagon,
  Pentagon, Octagon, Diamond, Loader2, ImagePlus,
  Brush, Library, Plus, Save, Palette
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const FONTS = [
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif' },
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display, serif' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { id: 'oswald', name: 'Oswald', family: 'Oswald, sans-serif' },
  { id: 'dancing', name: 'Dancing Script', family: 'Dancing Script, cursive' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif' },
  { id: 'raleway', name: 'Raleway', family: 'Raleway, sans-serif' },
  { id: 'lato', name: 'Lato', family: 'Lato, sans-serif' },
  { id: 'bebas', name: 'Bebas Neue', family: 'Bebas Neue, cursive' },
  { id: 'pacifico', name: 'Pacifico', family: 'Pacifico, cursive' },
  { id: 'lobster', name: 'Lobster', family: 'Lobster, cursive' },
  { id: 'cinzel', name: 'Cinzel', family: 'Cinzel, serif' },
  { id: 'abril', name: 'Abril Fatface', family: 'Abril Fatface, cursive' },
  { id: 'righteous', name: 'Righteous', family: 'Righteous, cursive' },
  { id: 'permanent', name: 'Permanent Marker', family: 'Permanent Marker, cursive' },
  { id: 'sacramento', name: 'Sacramento', family: 'Sacramento, cursive' },
  { id: 'anton', name: 'Anton', family: 'Anton, sans-serif' },
  { id: 'archivo', name: 'Archivo Black', family: 'Archivo Black, sans-serif' },
  { id: 'comfortaa', name: 'Comfortaa', family: 'Comfortaa, cursive' },
];

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', 
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8C00', '#9B59B6',
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#1ABC9C',
  '#E91E63', '#9C27B0', '#673AB7', '#00BCD4', '#8BC34A'
];

const SHAPES = [
  { id: 'rectangle', icon: Square, name: 'Rectangle' },
  { id: 'circle', icon: Circle, name: 'Cercle' },
  { id: 'triangle', icon: Triangle, name: 'Triangle' },
  { id: 'star', icon: Star, name: 'Étoile' },
  { id: 'heart', icon: Heart, name: 'Cœur' },
  { id: 'hexagon', icon: Hexagon, name: 'Hexagone' },
  { id: 'diamond', icon: Diamond, name: 'Losange' },
  { id: 'pentagon', icon: Pentagon, name: 'Pentagone' },
  { id: 'octagon', icon: Octagon, name: 'Octogone' },
];

const TEXTURE_PROMPTS = [
  { id: 'marble', name: { fr: 'Marbre', en: 'Marble' }, prompt: 'seamless marble texture, elegant white and gray veins, luxury stone surface' },
  { id: 'wood', name: { fr: 'Bois', en: 'Wood' }, prompt: 'seamless wood grain texture, natural oak wood, warm brown tones' },
  { id: 'gold', name: { fr: 'Or', en: 'Gold' }, prompt: 'seamless gold foil texture, shiny metallic gold surface, luxury golden pattern' },
  { id: 'watercolor', name: { fr: 'Aquarelle', en: 'Watercolor' }, prompt: 'seamless watercolor wash texture, soft pastel colors blending, artistic paint' },
  { id: 'gradient', name: { fr: 'Dégradé', en: 'Gradient' }, prompt: 'smooth gradient background, vibrant purple to blue transition, modern design' },
  { id: 'neon', name: { fr: 'Néon', en: 'Neon' }, prompt: 'neon glow texture, cyberpunk style, pink and blue neon lights on dark background' },
  { id: 'glitter', name: { fr: 'Paillettes', en: 'Glitter' }, prompt: 'seamless glitter texture, sparkling golden glitter, festive shimmer' },
  { id: 'fabric', name: { fr: 'Tissu', en: 'Fabric' }, prompt: 'seamless fabric texture, soft velvet material, rich deep color' },
  { id: 'concrete', name: { fr: 'Béton', en: 'Concrete' }, prompt: 'seamless concrete texture, industrial gray cement, modern minimalist' },
  { id: 'floral', name: { fr: 'Floral', en: 'Floral' }, prompt: 'seamless floral pattern, elegant botanical flowers, romantic design' },
];

const ILLUSTRATION_PROMPTS = [
  { id: 'abstract', name: { fr: 'Abstrait', en: 'Abstract' }, prompt: 'abstract geometric shapes, modern art style, colorful minimalist design, transparent background PNG' },
  { id: 'leaves', name: { fr: 'Feuilles', en: 'Leaves' }, prompt: 'elegant tropical leaves illustration, botanical art, green foliage, transparent background PNG' },
  { id: 'stars', name: { fr: 'Étoiles', en: 'Stars' }, prompt: 'scattered stars and sparkles, magical fairy dust, golden glitter stars, transparent background PNG' },
  { id: 'ribbon', name: { fr: 'Ruban', en: 'Ribbon' }, prompt: 'elegant flowing ribbon, silk ribbon banner, decorative swirl, transparent background PNG' },
  { id: 'frame', name: { fr: 'Cadre', en: 'Frame' }, prompt: 'ornate decorative frame border, vintage elegant golden frame, transparent background PNG' },
  { id: 'splash', name: { fr: 'Splash', en: 'Splash' }, prompt: 'colorful paint splash, dynamic ink splatter, artistic watercolor burst, transparent background PNG' },
  { id: 'arrows', name: { fr: 'Flèches', en: 'Arrows' }, prompt: 'modern arrow icons set, minimalist directional arrows, clean design, transparent background PNG' },
  { id: 'crown', name: { fr: 'Couronne', en: 'Crown' }, prompt: 'royal golden crown illustration, luxury king crown, jeweled tiara, transparent background PNG' },
  { id: 'wings', name: { fr: 'Ailes', en: 'Wings' }, prompt: 'angel wings illustration, feathered white wings, ethereal divine wings, transparent background PNG' },
  { id: 'laurel', name: { fr: 'Laurier', en: 'Laurel' }, prompt: 'laurel wreath illustration, victory olive branches, classical greek laurel, transparent background PNG' },
  { id: 'mandala', name: { fr: 'Mandala', en: 'Mandala' }, prompt: 'intricate mandala pattern, geometric sacred geometry, zen meditation art, transparent background PNG' },
  { id: 'smoke', name: { fr: 'Fumée', en: 'Smoke' }, prompt: 'ethereal smoke wisps, mystical fog effect, flowing vapor trails, transparent background PNG' },
];

export default function VisualEditor({ visual, onSave, onCancel }) {
  const { language } = useLanguage();
  const canvasRef = useRef(null);
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [generatingTexture, setGeneratingTexture] = useState(null);
  const [generatingIllustration, setGeneratingIllustration] = useState(null);
  const [userLibrary, setUserLibrary] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});
  const [user, setUser] = useState(null);

  // Load user and library
  useEffect(() => {
    const init = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (auth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          // Load user's saved textures/illustrations from user data
          if (currentUser.editor_library) {
            setUserLibrary(currentUser.editor_library);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

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

  // Preload layer images
  useEffect(() => {
    layers.forEach((layer, idx) => {
      if (layer.type === 'image' && layer.imageUrl && !loadedImages[layer.imageUrl]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setLoadedImages(prev => ({ ...prev, [layer.imageUrl]: img }));
        };
        img.src = layer.imageUrl;
      }
    });
  }, [layers]);

  // Draw shape helper
  const drawShape = (ctx, shape, x, y, width, height) => {
    ctx.beginPath();
    switch (shape) {
      case 'rectangle':
        ctx.rect(x, y, width, height);
        break;
      case 'circle':
        ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, Math.PI * 2);
        break;
      case 'triangle':
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        break;
      case 'star':
        const spikes = 5;
        const outerRadius = Math.min(width, height) / 2;
        const innerRadius = outerRadius / 2;
        const cx = x + width/2;
        const cy = y + height/2;
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI / spikes) - Math.PI/2;
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;
      case 'heart':
        const hx = x + width/2;
        const hy = y + height * 0.3;
        ctx.moveTo(hx, y + height);
        ctx.bezierCurveTo(x, y + height * 0.6, x, y, hx, hy);
        ctx.bezierCurveTo(x + width, y, x + width, y + height * 0.6, hx, y + height);
        break;
      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI / 3) - Math.PI/2;
          const px = x + width/2 + Math.cos(angle) * width/2;
          const py = y + height/2 + Math.sin(angle) * height/2;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;
      case 'diamond':
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x + width, y + height/2);
        ctx.lineTo(x + width/2, y + height);
        ctx.lineTo(x, y + height/2);
        ctx.closePath();
        break;
      case 'pentagon':
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI / 5) - Math.PI/2;
          const px = x + width/2 + Math.cos(angle) * width/2;
          const py = y + height/2 + Math.sin(angle) * height/2;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;
      case 'octagon':
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI / 4) - Math.PI/8;
          const px = x + width/2 + Math.cos(angle) * width/2;
          const py = y + height/2 + Math.sin(angle) * height/2;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;
      default:
        ctx.rect(x, y, width, height);
    }
  };

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

      layers.forEach((layer, idx) => {
        ctx.save();
        ctx.globalAlpha = layer.opacity / 100;

        if (layer.type === 'text') {
          const fontStyle = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.fontSize}px ${layer.fontFamily}`;
          ctx.font = fontStyle;
          ctx.fillStyle = layer.color;
          ctx.textAlign = layer.align || 'left';
          
          if (layer.shadow) {
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
          }
          
          if (layer.stroke) {
            ctx.strokeStyle = layer.strokeColor || '#000000';
            ctx.lineWidth = layer.strokeWidth || 2;
            ctx.strokeText(layer.text, layer.x, layer.y);
          }
          
          ctx.fillText(layer.text, layer.x, layer.y);
        } else if (layer.type === 'shape') {
          ctx.fillStyle = layer.color;
          drawShape(ctx, layer.shape, layer.x, layer.y, layer.width, layer.height);
          ctx.fill();
          
          if (layer.stroke) {
            ctx.strokeStyle = layer.strokeColor || '#000000';
            ctx.lineWidth = layer.strokeWidth || 2;
            ctx.stroke();
          }
        } else if (layer.type === 'image' && loadedImages[layer.imageUrl]) {
          ctx.drawImage(loadedImages[layer.imageUrl], layer.x, layer.y, layer.width, layer.height);
        }
        
        ctx.restore();

        // Draw selection
        if (selectedLayer === idx) {
          ctx.strokeStyle = '#8B5CF6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          
          if (layer.type === 'text') {
            ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
            const metrics = ctx.measureText(layer.text);
            const textX = layer.x - (layer.align === 'center' ? metrics.width/2 : layer.align === 'right' ? metrics.width : 0);
            ctx.strokeRect(textX - 5, layer.y - layer.fontSize, metrics.width + 10, layer.fontSize + 10);
          } else {
            ctx.strokeRect(layer.x - 5, layer.y - 5, layer.width + 10, layer.height + 10);
          }
          ctx.setLineDash([]);
        }
      });
    };
    img.src = visual.image_url;
  }, [imageLoaded, layers, selectedLayer, visual.image_url, loadedImages]);

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
      shadow: true,
      stroke: false,
      strokeColor: '#000000',
      strokeWidth: 2
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
      opacity: 80,
      stroke: false,
      strokeColor: '#000000',
      strokeWidth: 2
    };
    setLayers([...layers, newLayer]);
    setSelectedLayer(layers.length);
    setActiveTab('shapes');
  };

  const addImageLayer = (imageUrl, width = 100, height = 100) => {
    const newLayer = {
      type: 'image',
      imageUrl,
      x: canvasSize.width / 2 - width/2,
      y: canvasSize.height / 2 - height/2,
      width,
      height,
      opacity: 100
    };
    setLayers([...layers, newLayer]);
    setSelectedLayer(layers.length);
  };

  const generateTexture = async (texturePrompt) => {
    setGeneratingTexture(texturePrompt.id);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: texturePrompt.prompt + ', high quality, 512x512'
      });
      addImageLayer(result.url, 150, 150);
      
      // Save to library if logged in
      if (user) {
        const newItem = { type: 'texture', url: result.url, name: texturePrompt.name[language], promptId: texturePrompt.id };
        const updatedLibrary = [...userLibrary, newItem];
        setUserLibrary(updatedLibrary);
        await base44.auth.updateMe({ editor_library: updatedLibrary });
      }
    } catch (e) {
      console.error(e);
    }
    setGeneratingTexture(null);
  };

  const generateIllustration = async (illustrationPrompt) => {
    setGeneratingIllustration(illustrationPrompt.id);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: illustrationPrompt.prompt + ', high quality illustration'
      });
      addImageLayer(result.url, 120, 120);
      
      // Save to library if logged in
      if (user) {
        const newItem = { type: 'illustration', url: result.url, name: illustrationPrompt.name[language], promptId: illustrationPrompt.id };
        const updatedLibrary = [...userLibrary, newItem];
        setUserLibrary(updatedLibrary);
        await base44.auth.updateMe({ editor_library: updatedLibrary });
      }
    } catch (e) {
      console.error(e);
    }
    setGeneratingIllustration(null);
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
    <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/10 rounded-2xl p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-violet-400" />
          <h3 className="text-white font-semibold">
            {language === 'fr' ? 'Éditeur Magique' : 'Magic Editor'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-white/60 hover:text-white">
            <X className="h-4 w-4 mr-1" />
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          <Button size="sm" onClick={handleDownload} className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700">
            <Download className="h-4 w-4 mr-1" />
            {language === 'fr' ? 'Télécharger' : 'Download'}
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Left Panel - Tools */}
        <div className="w-64 space-y-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 bg-white/5">
              <TabsTrigger value="text" className="text-xs data-[state=active]:bg-violet-500/30"><Type className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="shapes" className="text-xs data-[state=active]:bg-violet-500/30"><Square className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="textures" className="text-xs data-[state=active]:bg-violet-500/30"><Brush className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="illustrations" className="text-xs data-[state=active]:bg-violet-500/30"><ImagePlus className="h-4 w-4" /></TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[320px] mt-3">
              <TabsContent value="text" className="mt-0 space-y-2">
                <Button onClick={addTextLayer} size="sm" className="w-full bg-violet-500/20 hover:bg-violet-500/30 text-violet-300">
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'fr' ? 'Ajouter texte' : 'Add text'}
                </Button>
                <p className="text-white/40 text-xs px-1">{language === 'fr' ? 'Polices disponibles:' : 'Available fonts:'}</p>
                <div className="grid grid-cols-2 gap-1">
                  {FONTS.map(font => (
                    <button
                      key={font.id}
                      onClick={() => currentLayer?.type === 'text' && updateLayer(selectedLayer, { fontFamily: font.family })}
                      className={cn(
                        "p-2 rounded text-xs text-left truncate transition-colors",
                        currentLayer?.fontFamily === font.family ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60 hover:bg-white/10"
                      )}
                      style={{ fontFamily: font.family }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="shapes" className="mt-0 space-y-2">
                <p className="text-white/40 text-xs px-1">{language === 'fr' ? 'Formes:' : 'Shapes:'}</p>
                <div className="grid grid-cols-3 gap-2">
                  {SHAPES.map(shape => (
                    <button
                      key={shape.id}
                      onClick={() => addShapeLayer(shape.id)}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex flex-col items-center gap-1"
                    >
                      <shape.icon className="h-5 w-5" />
                      <span className="text-[10px]">{shape.name}</span>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="textures" className="mt-0 space-y-2">
                <p className="text-white/40 text-xs px-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {language === 'fr' ? 'Textures IA:' : 'AI Textures:'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {TEXTURE_PROMPTS.map(texture => (
                    <button
                      key={texture.id}
                      onClick={() => generateTexture(texture)}
                      disabled={generatingTexture !== null}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-xs flex items-center gap-2"
                    >
                      {generatingTexture === texture.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Palette className="h-3 w-3" />
                      )}
                      {texture.name[language]}
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="illustrations" className="mt-0 space-y-2">
                <p className="text-white/40 text-xs px-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {language === 'fr' ? 'Illustrations IA:' : 'AI Illustrations:'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ILLUSTRATION_PROMPTS.map(illust => (
                    <button
                      key={illust.id}
                      onClick={() => generateIllustration(illust)}
                      disabled={generatingIllustration !== null}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-xs flex items-center gap-2"
                    >
                      {generatingIllustration === illust.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ImagePlus className="h-3 w-3" />
                      )}
                      {illust.name[language]}
                    </button>
                  ))}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* User Library */}
          {user && userLibrary.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <p className="text-white/40 text-xs px-1 flex items-center gap-1 mb-2">
                <Library className="h-3 w-3" />
                {language === 'fr' ? 'Ma bibliothèque' : 'My library'}
              </p>
              <div className="grid grid-cols-4 gap-1">
                {userLibrary.slice(-8).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => addImageLayer(item.url, 100, 100)}
                    className="aspect-square rounded overflow-hidden border border-white/10 hover:border-violet-500/50 transition-colors"
                  >
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-black/30 rounded-xl p-4">
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

        {/* Right Panel - Properties */}
        <div className="w-48 space-y-3">
          {/* Layers */}
          <div>
            <p className="text-white/40 text-xs mb-2 flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {language === 'fr' ? 'Calques' : 'Layers'}
            </p>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {layers.map((layer, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedLayer(idx)}
                  className={cn(
                    "w-full px-2 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-all",
                    selectedLayer === idx 
                      ? "bg-violet-500/30 text-violet-300 border border-violet-500/50" 
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  )}
                >
                  {layer.type === 'text' ? <Type className="h-3 w-3" /> : layer.type === 'image' ? <ImagePlus className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                  <span className="truncate flex-1 text-left">
                    {layer.type === 'text' ? layer.text.slice(0, 10) : layer.type === 'image' ? 'Image' : layer.shape}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {currentLayer ? (
            <>
              {/* Layer actions */}
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">#{selectedLayer + 1}</span>
                <div className="flex gap-1">
                  <button onClick={() => moveLayer(selectedLayer, 'up')} className="p-1 text-white/40 hover:text-white"><ChevronUp className="h-3 w-3" /></button>
                  <button onClick={() => moveLayer(selectedLayer, 'down')} className="p-1 text-white/40 hover:text-white"><ChevronDown className="h-3 w-3" /></button>
                  <button onClick={() => deleteLayer(selectedLayer)} className="p-1 text-red-400/60 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>

              {currentLayer.type === 'text' && (
                <>
                  <Input
                    value={currentLayer.text}
                    onChange={(e) => updateLayer(selectedLayer, { text: e.target.value })}
                    className="bg-white/5 border-white/10 text-white text-sm"
                  />
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">{language === 'fr' ? 'Taille' : 'Size'}: {currentLayer.fontSize}px</label>
                    <Slider value={[currentLayer.fontSize]} onValueChange={([v]) => updateLayer(selectedLayer, { fontSize: v })} min={12} max={120} step={1} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => updateLayer(selectedLayer, { bold: !currentLayer.bold })} className={cn("flex-1 py-1.5 rounded text-sm", currentLayer.bold ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}><Bold className="h-4 w-4 mx-auto" /></button>
                    <button onClick={() => updateLayer(selectedLayer, { italic: !currentLayer.italic })} className={cn("flex-1 py-1.5 rounded text-sm", currentLayer.italic ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}><Italic className="h-4 w-4 mx-auto" /></button>
                    <button onClick={() => updateLayer(selectedLayer, { shadow: !currentLayer.shadow })} className={cn("flex-1 py-1.5 rounded text-sm", currentLayer.shadow ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>S</button>
                    <button onClick={() => updateLayer(selectedLayer, { stroke: !currentLayer.stroke })} className={cn("flex-1 py-1.5 rounded text-sm", currentLayer.stroke ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>O</button>
                  </div>
                  <div className="flex gap-1">
                    {['left', 'center', 'right'].map(align => (
                      <button key={align} onClick={() => updateLayer(selectedLayer, { align })} className={cn("flex-1 py-1.5 rounded", currentLayer.align === align ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>
                        {align === 'left' && <AlignLeft className="h-4 w-4 mx-auto" />}
                        {align === 'center' && <AlignCenter className="h-4 w-4 mx-auto" />}
                        {align === 'right' && <AlignRight className="h-4 w-4 mx-auto" />}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {(currentLayer.type === 'shape' || currentLayer.type === 'image') && (
                <>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">{language === 'fr' ? 'Largeur' : 'Width'}: {currentLayer.width}px</label>
                    <Slider value={[currentLayer.width]} onValueChange={([v]) => updateLayer(selectedLayer, { width: v })} min={20} max={300} step={1} />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">{language === 'fr' ? 'Hauteur' : 'Height'}: {currentLayer.height}px</label>
                    <Slider value={[currentLayer.height]} onValueChange={([v]) => updateLayer(selectedLayer, { height: v })} min={20} max={300} step={1} />
                  </div>
                </>
              )}

              {currentLayer.type !== 'image' && (
                <div>
                  <label className="text-white/50 text-xs mb-1 block">{language === 'fr' ? 'Couleur' : 'Color'}</label>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_COLORS.slice(0, 10).map(color => (
                      <button key={color} onClick={() => updateLayer(selectedLayer, { color })} className={cn("w-5 h-5 rounded-full border-2 transition-transform hover:scale-110", currentLayer.color === color ? "border-violet-400" : "border-transparent")} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <Input type="color" value={currentLayer.color} onChange={(e) => updateLayer(selectedLayer, { color: e.target.value })} className="w-full h-7 mt-2 cursor-pointer" />
                </div>
              )}

              <div>
                <label className="text-white/50 text-xs mb-1 block">{language === 'fr' ? 'Opacité' : 'Opacity'}: {currentLayer.opacity}%</label>
                <Slider value={[currentLayer.opacity]} onValueChange={([v]) => updateLayer(selectedLayer, { opacity: v })} min={10} max={100} step={1} />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Layers className="h-8 w-8 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-xs">{language === 'fr' ? 'Sélectionnez un élément' : 'Select an element'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}