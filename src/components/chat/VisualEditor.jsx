import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Type, Square, Circle, Download, X, Trash2, 
  ChevronUp, ChevronDown, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Wand2,
  Layers, Sparkles, Triangle, Star, Heart, Hexagon,
  Pentagon, Octagon, Diamond, Loader2, ImagePlus,
  Brush, Library, Plus, Save, Palette, Eraser,
  MessageSquare, FileText, Bookmark, Check, Copy
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

const DEFAULT_TEXTURES = [
  { id: 'marble', name: { fr: 'Marbre', en: 'Marble' }, prompt: 'seamless marble texture, elegant white and gray veins, luxury stone surface' },
  { id: 'wood', name: { fr: 'Bois', en: 'Wood' }, prompt: 'seamless wood grain texture, natural oak wood, warm brown tones' },
  { id: 'gold', name: { fr: 'Or', en: 'Gold' }, prompt: 'seamless gold foil texture, shiny metallic gold surface, luxury golden pattern' },
  { id: 'watercolor', name: { fr: 'Aquarelle', en: 'Watercolor' }, prompt: 'seamless watercolor wash texture, soft pastel colors blending, artistic paint' },
  { id: 'gradient', name: { fr: 'Dégradé', en: 'Gradient' }, prompt: 'smooth gradient background, vibrant purple to blue transition, modern design' },
  { id: 'neon', name: { fr: 'Néon', en: 'Neon' }, prompt: 'neon glow texture, cyberpunk style, pink and blue neon lights on dark background' },
];

const DEFAULT_ILLUSTRATIONS = [
  { id: 'abstract', name: { fr: 'Abstrait', en: 'Abstract' }, prompt: 'abstract geometric shapes, modern art style, colorful minimalist design, transparent background PNG' },
  { id: 'leaves', name: { fr: 'Feuilles', en: 'Leaves' }, prompt: 'elegant tropical leaves illustration, botanical art, green foliage, transparent background PNG' },
  { id: 'stars', name: { fr: 'Étoiles', en: 'Stars' }, prompt: 'scattered stars and sparkles, magical fairy dust, golden glitter stars, transparent background PNG' },
  { id: 'crown', name: { fr: 'Couronne', en: 'Crown' }, prompt: 'royal golden crown illustration, luxury king crown, jeweled tiara, transparent background PNG' },
  { id: 'wings', name: { fr: 'Ailes', en: 'Wings' }, prompt: 'angel wings illustration, feathered white wings, ethereal divine wings, transparent background PNG' },
  { id: 'laurel', name: { fr: 'Laurier', en: 'Laurel' }, prompt: 'laurel wreath illustration, victory olive branches, classical greek laurel, transparent background PNG' },
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
  const [removingBg, setRemovingBg] = useState(false);
  const [userLibrary, setUserLibrary] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});
  const [user, setUser] = useState(null);
  const [adminTextures, setAdminTextures] = useState([]);
  const [adminIllustrations, setAdminIllustrations] = useState([]);
  const [saving, setSaving] = useState(false);
  
  // Custom illustration generator
  const [showIllustGenerator, setShowIllustGenerator] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatingCustom, setGeneratingCustom] = useState(false);
  const [generatedCustomImage, setGeneratedCustomImage] = useState(null);
  
  // AI Text generator
  const [showTextGenerator, setShowTextGenerator] = useState(false);
  const [textPrompt, setTextPrompt] = useState('');
  const [generatingText, setGeneratingText] = useState(false);
  const [generatedTexts, setGeneratedTexts] = useState([]);
  const [savedTexts, setSavedTexts] = useState([]);
  const [showSavedTexts, setShowSavedTexts] = useState(false);

  // Load user, library and admin assets
  useEffect(() => {
    const init = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (auth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          if (currentUser.editor_library) {
            setUserLibrary(currentUser.editor_library);
          }
          // Load saved texts for this visual
          if (visual.id) {
            const texts = await base44.entities.GeneratedText.filter({ 
              user_email: currentUser.email, 
              visual_id: visual.id 
            });
            setSavedTexts(texts);
          }
        }
        // Load admin assets
        const assets = await base44.entities.EditorAsset.filter({ is_active: true });
        setAdminTextures(assets.filter(a => a.type === 'texture'));
        setAdminIllustrations(assets.filter(a => a.type === 'illustration'));
        
        // Load saved layers from visual
        if (visual.editor_layers && Array.isArray(visual.editor_layers)) {
          setLayers(visual.editor_layers);
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, [visual.id]);

  // Load base image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxSize = 450;
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
    layers.forEach((layer) => {
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

  const drawShape = (ctx, shape, x, y, width, height) => {
    ctx.beginPath();
    switch (shape) {
      case 'rectangle': ctx.rect(x, y, width, height); break;
      case 'circle': ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, Math.PI * 2); break;
      case 'triangle':
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        break;
      case 'star':
        const spikes = 5, outerRadius = Math.min(width, height) / 2, innerRadius = outerRadius / 2;
        const cx = x + width/2, cy = y + height/2;
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI / spikes) - Math.PI/2;
          if (i === 0) ctx.moveTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
          else ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        }
        ctx.closePath();
        break;
      case 'heart':
        const hx = x + width/2;
        ctx.moveTo(hx, y + height);
        ctx.bezierCurveTo(x, y + height * 0.6, x, y, hx, y + height * 0.3);
        ctx.bezierCurveTo(x + width, y, x + width, y + height * 0.6, hx, y + height);
        break;
      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI / 3) - Math.PI/2;
          if (i === 0) ctx.moveTo(x + width/2 + Math.cos(angle) * width/2, y + height/2 + Math.sin(angle) * height/2);
          else ctx.lineTo(x + width/2 + Math.cos(angle) * width/2, y + height/2 + Math.sin(angle) * height/2);
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
          if (i === 0) ctx.moveTo(x + width/2 + Math.cos(angle) * width/2, y + height/2 + Math.sin(angle) * height/2);
          else ctx.lineTo(x + width/2 + Math.cos(angle) * width/2, y + height/2 + Math.sin(angle) * height/2);
        }
        ctx.closePath();
        break;
      case 'octagon':
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI / 4) - Math.PI/8;
          if (i === 0) ctx.moveTo(x + width/2 + Math.cos(angle) * width/2, y + height/2 + Math.sin(angle) * height/2);
          else ctx.lineTo(x + width/2 + Math.cos(angle) * width/2, y + height/2 + Math.sin(angle) * height/2);
        }
        ctx.closePath();
        break;
      default: ctx.rect(x, y, width, height);
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
          
          // Reset shadows first
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          // 3D Effect (draw multiple offset layers)
          if (layer.effect3d) {
            const depth = 6;
            for (let i = depth; i > 0; i--) {
              ctx.fillStyle = `rgba(0,0,0,${0.3 - i * 0.04})`;
              ctx.fillText(layer.text, layer.x + i, layer.y + i);
            }
            ctx.fillStyle = layer.color;
          }
          
          // Halo effect (golden glow behind)
          if (layer.halo) {
            ctx.save();
            ctx.shadowColor = layer.haloColor || '#FFD700';
            ctx.shadowBlur = layer.haloSize || 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillStyle = layer.haloColor || '#FFD700';
            ctx.fillText(layer.text, layer.x, layer.y);
            ctx.fillText(layer.text, layer.x, layer.y);
            ctx.restore();
            ctx.fillStyle = layer.color;
          }
          
          // Neon effect
          if (layer.neon) {
            ctx.save();
            const neonColor = layer.neonColor || '#ff00ff';
            const intensity = layer.neonIntensity || 15;
            ctx.shadowColor = neonColor;
            ctx.shadowBlur = intensity;
            ctx.fillStyle = neonColor;
            ctx.fillText(layer.text, layer.x, layer.y);
            ctx.shadowBlur = intensity * 2;
            ctx.fillText(layer.text, layer.x, layer.y);
            ctx.restore();
            ctx.fillStyle = '#ffffff';
          }
          
          // Glow effect
          if (layer.glow) {
            ctx.shadowColor = layer.glowColor || '#ffffff';
            ctx.shadowBlur = layer.glowSize || 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
          
          // Shadow effect
          if (layer.shadow && !layer.glow && !layer.neon) {
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
          }
          
          // Stroke
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
          if (layer.stroke) { ctx.strokeStyle = layer.strokeColor || '#000000'; ctx.lineWidth = layer.strokeWidth || 2; ctx.stroke(); }
        } else if (layer.type === 'image' && loadedImages[layer.imageUrl]) {
          ctx.drawImage(loadedImages[layer.imageUrl], layer.x, layer.y, layer.width, layer.height);
        }
        ctx.restore();
        if (selectedLayer === idx) {
          ctx.strokeStyle = '#8B5CF6'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
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

  const addTextLayer = (text = null) => {
    const newLayer = {
      type: 'text',
      text: text || (language === 'fr' ? 'Votre texte' : 'Your text'),
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
    setActiveTab('layers');
  };

  const addShapeLayer = (shape) => {
    const newLayer = { type: 'shape', shape, x: canvasSize.width / 2 - 50, y: canvasSize.height / 2 - 50, width: 100, height: 100, color: '#FFFFFF', opacity: 80, stroke: false, strokeColor: '#000000', strokeWidth: 2 };
    setLayers([...layers, newLayer]);
    setSelectedLayer(layers.length);
    setActiveTab('layers');
  };

  const addImageLayer = (imageUrl, width = 100, height = 100) => {
    // For textures, make them cover the canvas
    const isTexture = width === canvasSize.width;
    const newLayer = {
      type: 'image',
      imageUrl,
      x: isTexture ? 0 : canvasSize.width / 2 - width/2,
      y: isTexture ? 0 : canvasSize.height / 2 - height/2,
      width,
      height,
      opacity: isTexture ? 50 : 100
    };
    // Insert textures at the beginning (behind other layers)
    if (isTexture) {
      setLayers([newLayer, ...layers]);
      setSelectedLayer(0);
    } else {
      setLayers([...layers, newLayer]);
      setSelectedLayer(layers.length);
    }
    setActiveTab('layers');
  };

  const generateTexture = async (texturePrompt) => {
    setGeneratingTexture(texturePrompt.id || texturePrompt.name_fr);
    try {
      const prompt = texturePrompt.prompt + ', high quality, seamless, 1024x1024';
      const result = await base44.integrations.Core.GenerateImage({ prompt });
      // Add as full-size texture layer
      addImageLayer(result.url, canvasSize.width, canvasSize.height);
      if (user) {
        const newItem = { type: 'texture', url: result.url, name: texturePrompt.name?.[language] || texturePrompt.name_fr };
        const updatedLibrary = [...userLibrary, newItem];
        setUserLibrary(updatedLibrary);
        await base44.auth.updateMe({ editor_library: updatedLibrary });
      }
    } catch (e) { console.error(e); }
    setGeneratingTexture(null);
  };

  const generateIllustration = async (illustPrompt) => {
    setGeneratingIllustration(illustPrompt.id || illustPrompt.name_fr);
    try {
      const prompt = illustPrompt.prompt + ', high quality illustration';
      const result = await base44.integrations.Core.GenerateImage({ prompt });
      addImageLayer(result.url, 150, 150);
      if (user) {
        const newItem = { type: 'illustration', url: result.url, name: illustPrompt.name?.[language] || illustPrompt.name_fr };
        const updatedLibrary = [...userLibrary, newItem];
        setUserLibrary(updatedLibrary);
        await base44.auth.updateMe({ editor_library: updatedLibrary });
      }
    } catch (e) { console.error(e); }
    setGeneratingIllustration(null);
  };

  const generateCustomIllustration = async () => {
    if (!customPrompt.trim()) return;
    setGeneratingCustom(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: customPrompt + ', high quality illustration, transparent background PNG'
      });
      setGeneratedCustomImage(result.url);
    } catch (e) { console.error(e); }
    setGeneratingCustom(false);
  };

  const addCustomToCanvas = (saveToLibrary = false) => {
    if (!generatedCustomImage) return;
    addImageLayer(generatedCustomImage, 150, 150);
    if (saveToLibrary && user) {
      const newItem = { type: 'illustration', url: generatedCustomImage, name: customPrompt.slice(0, 30) };
      const updatedLibrary = [...userLibrary, newItem];
      setUserLibrary(updatedLibrary);
      base44.auth.updateMe({ editor_library: updatedLibrary });
    }
    setShowIllustGenerator(false);
    setGeneratedCustomImage(null);
    setCustomPrompt('');
  };

  const generateAITexts = async () => {
    if (!textPrompt.trim()) return;
    setGeneratingText(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un expert en copywriting et marketing. L'utilisateur travaille sur un visuel de type "${visual.visual_type || 'logo'}" avec le titre "${visual.title || 'visuel'}".
        
L'utilisateur demande: "${textPrompt}"

Génère 6 propositions de textes créatifs et accrocheurs. Propose différents styles: titres courts, slogans, phrases d'accroche, call-to-action.

Réponds en JSON avec un array "texts" contenant des objets avec:
- text: le texte proposé
- type: "title" | "slogan" | "description" | "cta" | "tagline"
- style: description courte du style`,
        response_json_schema: {
          type: 'object',
          properties: {
            texts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  type: { type: 'string' },
                  style: { type: 'string' }
                }
              }
            }
          }
        }
      });
      setGeneratedTexts(result.texts || []);
    } catch (e) { console.error(e); }
    setGeneratingText(false);
  };

  const saveGeneratedText = async (textItem) => {
    if (!user || !visual.id) return;
    const saved = await base44.entities.GeneratedText.create({
      user_email: user.email,
      visual_id: visual.id,
      text: textItem.text,
      text_type: textItem.type
    });
    setSavedTexts(prev => [...prev, saved]);
  };

  const useTextOnCanvas = (text) => {
    addTextLayer(text);
    setShowTextGenerator(false);
    setShowSavedTexts(false);
  };

  const removeFromLibrary = async (idx) => {
    const updatedLibrary = userLibrary.filter((_, i) => i !== idx);
    setUserLibrary(updatedLibrary);
    if (user) await base44.auth.updateMe({ editor_library: updatedLibrary });
  };

  const updateLayer = (index, updates) => {
    const newLayers = [...layers];
    newLayers[index] = { ...newLayers[index], ...updates };
    setLayers(newLayers);
  };

  const deleteLayer = (index) => { setLayers(layers.filter((_, i) => i !== index)); setSelectedLayer(null); };
  
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
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      let hit = false;
      if (layer.type === 'text') {
        const ctx = canvasRef.current.getContext('2d');
        ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
        const metrics = ctx.measureText(layer.text);
        const textX = layer.x - (layer.align === 'center' ? metrics.width/2 : layer.align === 'right' ? metrics.width : 0);
        hit = x >= textX && x <= textX + metrics.width && y >= layer.y - layer.fontSize && y <= layer.y;
      } else {
        hit = x >= layer.x && x <= layer.x + layer.width && y >= layer.y && y <= layer.y + layer.height;
      }
      if (hit) { setSelectedLayer(i); setDragging(i); setDragOffset({ x: x - layer.x, y: y - layer.y }); return; }
    }
    setSelectedLayer(null);
  };

  const handleCanvasMouseMove = (e) => {
    if (dragging === null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    updateLayer(dragging, { x: x - dragOffset.x, y: y - dragOffset.y });
  };

  const handleCanvasMouseUp = () => setDragging(null);

  const handleDownload = async () => {
    setSaving(true);
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    
    // Convert dataUrl to blob and upload
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `${visual.title || 'visual'}-edited.png`, { type: 'image/png' });
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Update the visual with new image and layers
      if (visual.id) {
        await base44.entities.Visual.update(visual.id, {
          image_url: file_url,
          editor_layers: layers
        });
      }
      
      // Download the file
      const link = document.createElement('a');
      link.download = `${visual.title || 'visual'}-edited.png`;
      link.href = file_url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSaving(false);
      onSave?.(file_url);
    } catch (e) {
      console.error(e);
      setSaving(false);
      // Fallback to direct download
      const link = document.createElement('a');
      link.download = `${visual.title || 'visual'}-edited.png`;
      link.href = dataUrl;
      link.click();
      onSave?.();
    }
  };

  const allTextures = [...DEFAULT_TEXTURES, ...adminTextures.map(a => ({ id: a.id, name: { fr: a.name_fr, en: a.name_en || a.name_fr }, prompt: a.prompt }))];
  const allIllustrations = [...DEFAULT_ILLUSTRATIONS, ...adminIllustrations.map(a => ({ id: a.id, name: { fr: a.name_fr, en: a.name_en || a.name_fr }, prompt: a.prompt }))];

  const currentLayer = selectedLayer !== null ? layers[selectedLayer] : null;

  return (
    <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/10 rounded-2xl p-3 md:p-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-violet-400" />
          <h3 className="text-white font-semibold text-sm md:text-base">{language === 'fr' ? 'Éditeur Magique' : 'Magic Editor'}</h3>
        </div>
        <div className="flex items-center gap-2">
          {savedTexts.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setShowSavedTexts(true)} className="text-amber-400 hover:text-amber-300 text-xs px-2">
              <Bookmark className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Mes textes' : 'My texts'}</span> ({savedTexts.length})
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-white/60 hover:text-white text-xs px-2">
            <X className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs px-3">
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            {language === 'fr' ? 'Sauvegarder' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Tools Tabs - Horizontal on top */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-3">
        <TabsList className="flex w-full bg-white/10 rounded-lg p-1 h-10 gap-1">
          <TabsTrigger value="text" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors"><Type className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="shapes" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors"><Square className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="textures" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors"><Brush className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="illustrations" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors"><ImagePlus className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="layers" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors relative">
            <Layers className="h-4 w-4" />
            {layers.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-emerald-500 rounded-full text-[10px] text-white font-medium flex items-center justify-center">
                {layers.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tool Content Panel */}
        <div className="h-32 md:h-40 overflow-y-auto mt-3">
          <TabsContent value="text" className="mt-0 space-y-2">
            <Button onClick={() => addTextLayer()} size="sm" className="w-full bg-violet-500/20 hover:bg-violet-500/30 text-violet-300">
              <Plus className="h-4 w-4 mr-2" />{language === 'fr' ? 'Ajouter texte' : 'Add text'}
            </Button>
            <Button onClick={() => setShowTextGenerator(true)} size="sm" className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300">
              <MessageSquare className="h-4 w-4 mr-2" />{language === 'fr' ? 'Générer texte IA' : 'Generate AI text'}
            </Button>
            <p className="text-white/40 text-xs px-1 mt-3">{language === 'fr' ? 'Polices:' : 'Fonts:'}</p>
            <div className="grid grid-cols-2 gap-1">
              {FONTS.map(font => (
                <button key={font.id} onClick={() => currentLayer?.type === 'text' && updateLayer(selectedLayer, { fontFamily: font.family })}
                  className={cn("p-2 rounded text-xs text-left truncate transition-colors", currentLayer?.fontFamily === font.family ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60 hover:bg-white/10")}
                  style={{ fontFamily: font.family }}>{font.name}</button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shapes" className="mt-0 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {SHAPES.map(shape => (
                <button key={shape.id} onClick={() => addShapeLayer(shape.id)} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex flex-col items-center gap-1">
                  <shape.icon className="h-5 w-5" /><span className="text-[10px]">{shape.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="textures" className="mt-0 space-y-2">
            <p className="text-white/40 text-xs px-1 flex items-center gap-1"><Sparkles className="h-3 w-3" />{language === 'fr' ? 'Textures IA (plein écran):' : 'AI Textures (full screen):'}</p>
            <div className="grid grid-cols-2 gap-2">
              {allTextures.map(texture => (
                <button key={texture.id} onClick={() => generateTexture(texture)} disabled={generatingTexture !== null}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-xs flex items-center gap-2">
                  {generatingTexture === (texture.id || texture.name_fr) ? <Loader2 className="h-3 w-3 animate-spin" /> : <Palette className="h-3 w-3" />}
                  {texture.name[language] || texture.name.fr}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="illustrations" className="mt-0 space-y-2">
            <Button onClick={() => setShowIllustGenerator(true)} size="sm" className="w-full bg-gradient-to-r from-pink-500/20 to-violet-500/20 hover:from-pink-500/30 hover:to-violet-500/30 text-pink-300">
              <Wand2 className="h-4 w-4 mr-2" />{language === 'fr' ? 'Créer illustration IA' : 'Create AI illustration'}
            </Button>
            <p className="text-white/40 text-xs px-1 flex items-center gap-1 mt-2"><Sparkles className="h-3 w-3" />{language === 'fr' ? 'Illustrations prédéfinies:' : 'Preset illustrations:'}</p>
            <div className="grid grid-cols-2 gap-2">
              {allIllustrations.map(illust => (
                <button key={illust.id} onClick={() => generateIllustration(illust)} disabled={generatingIllustration !== null}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-xs flex items-center gap-2">
                  {generatingIllustration === (illust.id || illust.name_fr) ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
                  {illust.name[language] || illust.name.fr}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="layers" className="mt-0 space-y-2">
            {layers.length > 0 && (
              <p className="text-amber-400/80 text-xs px-2 py-1 bg-amber-500/10 rounded-lg flex items-center gap-1">
                💡 {language === 'fr' ? 'Glissez les éléments sur l\'image. Supprimez-les ici.' : 'Drag elements on image. Delete them here.'}
              </p>
            )}
            <div className="space-y-1">
              {layers.length === 0 ? (
                <p className="text-white/40 text-xs text-center py-4">{language === 'fr' ? 'Aucun calque' : 'No layers'}</p>
              ) : layers.map((layer, idx) => (
                <button key={idx} onClick={() => setSelectedLayer(idx)}
                  className={cn("w-full px-2 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-all", selectedLayer === idx ? "bg-violet-500/30 text-violet-300 border border-violet-500/50" : "bg-white/5 text-white/50 hover:bg-white/10")}>
                  {layer.type === 'text' ? <Type className="h-3 w-3" /> : layer.type === 'image' ? <ImagePlus className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                  <span className="truncate flex-1 text-left">{layer.type === 'text' ? layer.text.slice(0, 15) : layer.type === 'image' ? 'Image' : layer.shape}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteLayer(idx); }} className="p-1 text-red-400/60 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                </button>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Canvas - Responsive */}
      <div className="flex items-center justify-center bg-black/30 rounded-xl p-2 md:p-4 mb-3 overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={canvasSize.width} 
          height={canvasSize.height} 
          className="rounded-lg cursor-move shadow-2xl max-w-full max-h-[40vh] md:max-h-[50vh] object-contain"
          style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '50vh' }}
          onMouseDown={handleCanvasMouseDown} 
          onMouseMove={handleCanvasMouseMove} 
          onMouseUp={handleCanvasMouseUp} 
          onMouseLeave={handleCanvasMouseUp} 
          onTouchStart={(e) => {
            const touch = e.touches[0];
            handleCanvasMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            handleCanvasMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
          }}
          onTouchEnd={handleCanvasMouseUp}
        />
      </div>

      {/* Bottom Panel - Layer Properties */}
      {currentLayer && (
        <div className="bg-white/5 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs flex items-center gap-2">
              {currentLayer.type === 'text' ? <Type className="h-3 w-3" /> : currentLayer.type === 'image' ? <ImagePlus className="h-3 w-3" /> : <Square className="h-3 w-3" />}
              {language === 'fr' ? 'Propriétés' : 'Properties'}
            </span>
            <div className="flex gap-1">
              <button onClick={() => moveLayer(selectedLayer, 'up')} className="p-1.5 text-white/40 hover:text-white bg-white/5 rounded"><ChevronUp className="h-3 w-3" /></button>
              <button onClick={() => moveLayer(selectedLayer, 'down')} className="p-1.5 text-white/40 hover:text-white bg-white/5 rounded"><ChevronDown className="h-3 w-3" /></button>
              <button onClick={() => deleteLayer(selectedLayer)} className="p-1.5 text-red-400/60 hover:text-red-400 bg-white/5 rounded"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>

          {currentLayer.type === 'text' && (
            <div className="space-y-2">
              <Input value={currentLayer.text} onChange={(e) => updateLayer(selectedLayer, { text: e.target.value })} className="bg-white/5 border-white/10 text-white text-sm h-8" />
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <Slider value={[currentLayer.fontSize]} onValueChange={([v]) => updateLayer(selectedLayer, { fontSize: v })} min={12} max={120} step={1} />
                </div>
                <span className="text-white/50 text-xs w-12">{currentLayer.fontSize}px</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                <button onClick={() => updateLayer(selectedLayer, { bold: !currentLayer.bold })} className={cn("p-1.5 rounded text-sm", currentLayer.bold ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}><Bold className="h-3 w-3" /></button>
                <button onClick={() => updateLayer(selectedLayer, { italic: !currentLayer.italic })} className={cn("p-1.5 rounded text-sm", currentLayer.italic ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}><Italic className="h-3 w-3" /></button>
                <button onClick={() => updateLayer(selectedLayer, { align: 'left' })} className={cn("p-1.5 rounded", currentLayer.align === 'left' ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}><AlignLeft className="h-3 w-3" /></button>
                <button onClick={() => updateLayer(selectedLayer, { align: 'center' })} className={cn("p-1.5 rounded", currentLayer.align === 'center' ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}><AlignCenter className="h-3 w-3" /></button>
                <button onClick={() => updateLayer(selectedLayer, { align: 'right' })} className={cn("p-1.5 rounded", currentLayer.align === 'right' ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}><AlignRight className="h-3 w-3" /></button>
                <div className="flex gap-1 ml-auto">
                  {PRESET_COLORS.slice(0, 6).map(color => (
                    <button key={color} onClick={() => updateLayer(selectedLayer, { color })} className={cn("w-5 h-5 rounded-full border-2 transition-transform hover:scale-110", currentLayer.color === color ? "border-violet-400" : "border-transparent")} style={{ backgroundColor: color }} />
                  ))}
                  <input type="color" value={currentLayer.color} onChange={(e) => updateLayer(selectedLayer, { color: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                </div>
              </div>
              {/* Text Effects */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <p className="text-white/40 text-xs">{language === 'fr' ? 'Effets:' : 'Effects:'}</p>
                <div className="grid grid-cols-3 gap-1">
                  <button onClick={() => updateLayer(selectedLayer, { stroke: !currentLayer.stroke })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.stroke ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>
                    {language === 'fr' ? 'Contour' : 'Stroke'}
                  </button>
                  <button onClick={() => updateLayer(selectedLayer, { shadow: !currentLayer.shadow })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.shadow ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>
                    {language === 'fr' ? 'Ombre' : 'Shadow'}
                  </button>
                  <button onClick={() => updateLayer(selectedLayer, { glow: !currentLayer.glow })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.glow ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>
                    {language === 'fr' ? 'Lueur' : 'Glow'}
                  </button>
                  <button onClick={() => updateLayer(selectedLayer, { halo: !currentLayer.halo })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.halo ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>
                    Halo
                  </button>
                  <button onClick={() => updateLayer(selectedLayer, { effect3d: !currentLayer.effect3d })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.effect3d ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>
                    3D
                  </button>
                  <button onClick={() => updateLayer(selectedLayer, { neon: !currentLayer.neon })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.neon ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>
                    Néon
                  </button>
                </div>
                {currentLayer.stroke && (
                  <div className="flex gap-2 items-center">
                    <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Contour:' : 'Stroke:'}</span>
                    <input type="color" value={currentLayer.strokeColor || '#000000'} onChange={(e) => updateLayer(selectedLayer, { strokeColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                    <Slider value={[currentLayer.strokeWidth || 2]} onValueChange={([v]) => updateLayer(selectedLayer, { strokeWidth: v })} min={1} max={10} step={1} className="flex-1" />
                    <span className="text-white/40 text-xs w-6">{currentLayer.strokeWidth || 2}</span>
                  </div>
                )}
                {currentLayer.glow && (
                  <div className="flex gap-2 items-center">
                    <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Lueur:' : 'Glow:'}</span>
                    <input type="color" value={currentLayer.glowColor || '#ffffff'} onChange={(e) => updateLayer(selectedLayer, { glowColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                    <Slider value={[currentLayer.glowSize || 10]} onValueChange={([v]) => updateLayer(selectedLayer, { glowSize: v })} min={5} max={40} step={1} className="flex-1" />
                    <span className="text-white/40 text-xs w-6">{currentLayer.glowSize || 10}</span>
                  </div>
                )}
                {currentLayer.halo && (
                  <div className="flex gap-2 items-center">
                    <span className="text-white/40 text-xs w-16">Halo:</span>
                    <input type="color" value={currentLayer.haloColor || '#FFD700'} onChange={(e) => updateLayer(selectedLayer, { haloColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                    <Slider value={[currentLayer.haloSize || 15]} onValueChange={([v]) => updateLayer(selectedLayer, { haloSize: v })} min={5} max={50} step={1} className="flex-1" />
                    <span className="text-white/40 text-xs w-6">{currentLayer.haloSize || 15}</span>
                  </div>
                )}
                {currentLayer.neon && (
                  <div className="flex gap-2 items-center">
                    <span className="text-white/40 text-xs w-16">Néon:</span>
                    <input type="color" value={currentLayer.neonColor || '#ff00ff'} onChange={(e) => updateLayer(selectedLayer, { neonColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                    <Slider value={[currentLayer.neonIntensity || 15]} onValueChange={([v]) => updateLayer(selectedLayer, { neonIntensity: v })} min={5} max={30} step={1} className="flex-1" />
                    <span className="text-white/40 text-xs w-6">{currentLayer.neonIntensity || 15}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {(currentLayer.type === 'shape' || currentLayer.type === 'image') && (
            <div className="flex gap-3 items-center flex-wrap">
              <div className="flex-1 min-w-[100px]">
                <label className="text-white/50 text-[10px]">{language === 'fr' ? 'Largeur' : 'W'}</label>
                <Slider value={[currentLayer.width]} onValueChange={([v]) => updateLayer(selectedLayer, { width: v })} min={20} max={canvasSize.width} step={1} />
              </div>
              <div className="flex-1 min-w-[100px]">
                <label className="text-white/50 text-[10px]">{language === 'fr' ? 'Hauteur' : 'H'}</label>
                <Slider value={[currentLayer.height]} onValueChange={([v]) => updateLayer(selectedLayer, { height: v })} min={20} max={canvasSize.height} step={1} />
              </div>
              {currentLayer.type === 'shape' && (
                <div className="flex gap-1">
                  {PRESET_COLORS.slice(0, 6).map(color => (
                    <button key={color} onClick={() => updateLayer(selectedLayer, { color })} className={cn("w-5 h-5 rounded-full border-2 transition-transform hover:scale-110", currentLayer.color === color ? "border-violet-400" : "border-transparent")} style={{ backgroundColor: color }} />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 items-center">
            <label className="text-white/50 text-xs">{language === 'fr' ? 'Opacité' : 'Opacity'}</label>
            <div className="flex-1">
              <Slider value={[currentLayer.opacity]} onValueChange={([v]) => updateLayer(selectedLayer, { opacity: v })} min={10} max={100} step={1} />
            </div>
            <span className="text-white/50 text-xs w-8">{currentLayer.opacity}%</span>
          </div>
        </div>
      )}

      {/* Library */}
      {user && userLibrary.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-white/40 text-xs px-1 flex items-center gap-1 mb-2"><Library className="h-3 w-3" />{language === 'fr' ? 'Ma bibliothèque' : 'My library'}</p>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {userLibrary.slice(-8).map((item, idx) => (
              <div key={idx} className="relative group flex-shrink-0">
                <button onClick={() => addImageLayer(item.url, 120, 120)} className="w-12 h-12 rounded overflow-hidden border border-white/10 hover:border-violet-500/50 transition-colors">
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                </button>
                <button onClick={() => removeFromLibrary(userLibrary.length - 8 + idx)} className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-2 w-2 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Illustration Generator Modal */}
      <Dialog open={showIllustGenerator} onOpenChange={setShowIllustGenerator}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-pink-400" />{language === 'fr' ? 'Créer une illustration' : 'Create an illustration'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder={language === 'fr' ? 'Décrivez l\'illustration souhaitée...' : 'Describe the illustration you want...'}
              className="bg-white/5 border-white/10 text-white min-h-[100px]" />
            <Button onClick={generateCustomIllustration} disabled={generatingCustom || !customPrompt.trim()} className="w-full bg-gradient-to-r from-pink-600 to-violet-600">
              {generatingCustom ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {language === 'fr' ? 'Générer' : 'Generate'}
            </Button>
            {generatedCustomImage && (
              <div className="space-y-3">
                <img src={generatedCustomImage} alt="Generated" className="w-full rounded-lg" />
                <div className="flex gap-2">
                  <Button onClick={() => addCustomToCanvas(false)} className="flex-1 bg-violet-600 hover:bg-violet-700">
                    <Plus className="h-4 w-4 mr-1" />{language === 'fr' ? 'Utiliser' : 'Use'}
                  </Button>
                  {user && (
                    <Button onClick={() => addCustomToCanvas(true)} className="flex-1 bg-amber-600 hover:bg-amber-700">
                      <Bookmark className="h-4 w-4 mr-1" />{language === 'fr' ? 'Sauvegarder' : 'Save'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Text Generator Modal */}
      <Dialog open={showTextGenerator} onOpenChange={setShowTextGenerator}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-violet-400" />{language === 'fr' ? 'Générateur de textes IA' : 'AI Text Generator'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-white/60 text-sm mb-2">{language === 'fr' ? 'Que voulez-vous exprimer ?' : 'What do you want to express?'}</p>
              <Textarea value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)}
                placeholder={language === 'fr' ? 'Ex: Un slogan pour mon restaurant italien, des titres accrocheurs pour ma promotion...' : 'Ex: A slogan for my Italian restaurant, catchy titles for my promotion...'}
                className="bg-white/5 border-white/10 text-white min-h-[80px]" />
            </div>
            <Button onClick={generateAITexts} disabled={generatingText || !textPrompt.trim()} className="w-full bg-gradient-to-r from-violet-600 to-blue-600">
              {generatingText ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {language === 'fr' ? 'Générer des propositions' : 'Generate suggestions'}
            </Button>
            {generatedTexts.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-white/40 text-xs">{language === 'fr' ? 'Cliquez pour utiliser:' : 'Click to use:'}</p>
                {generatedTexts.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.text}</p>
                        <p className="text-white/40 text-xs mt-1">{item.type} • {item.style}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => useTextOnCanvas(item.text)} className="p-1.5 bg-violet-500/20 hover:bg-violet-500/30 rounded text-violet-300" title={language === 'fr' ? 'Utiliser' : 'Use'}>
                          <Plus className="h-4 w-4" />
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(item.text)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white/60" title={language === 'fr' ? 'Copier' : 'Copy'}>
                          <Copy className="h-4 w-4" />
                        </button>
                        {user && visual.id && (
                          <button onClick={() => saveGeneratedText(item)} className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 rounded text-amber-300" title={language === 'fr' ? 'Sauvegarder' : 'Save'}>
                            <Bookmark className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Saved Texts Modal */}
      <Dialog open={showSavedTexts} onOpenChange={setShowSavedTexts}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bookmark className="h-5 w-5 text-amber-400" />{language === 'fr' ? 'Mes textes sauvegardés' : 'My saved texts'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {savedTexts.map((item, idx) => (
              <div key={idx} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-between gap-2">
                <div>
                  <p className="text-white">{item.text}</p>
                  <p className="text-white/40 text-xs">{item.text_type}</p>
                </div>
                <button onClick={() => useTextOnCanvas(item.text)} className="p-2 bg-violet-500/20 hover:bg-violet-500/30 rounded text-violet-300">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}