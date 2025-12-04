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
  FolderOpen, Plus, Save, Palette, Eraser, Brush,
  MessageSquare, FileText, Bookmark, Check, Copy,
  PaintBucket, RotateCw, Upload, Scissors, ChevronDown as ChevronDownIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom gradient icon component
const GradientIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="gradientIconFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="50%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" fill="url(#gradientIconFill)" />
  </svg>
);

// Custom texture icon (square with pattern)
const TextureIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9l6-6M9 3l6 6M15 3l6 6M21 9l-6 6M21 15l-6 6M15 21l-6-6M9 21l-6-6M3 15l6-6" strokeWidth="1" opacity="0.5" />
  </svg>
);

// Custom illustration icon (blob shape)
const IllustrationIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3c4 0 7 2 8 5s0 6-2 8-5 3-8 3-6-1-7-4 0-5 2-7 4-5 7-5z" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
import { useLanguage } from '../LanguageContext';
import ServiceUnavailableModal from './ServiceUnavailableModal';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const FONTS = [
  // Sans-serif modernes
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif' },
  { id: 'raleway', name: 'Raleway', family: 'Raleway, sans-serif' },
  { id: 'lato', name: 'Lato', family: 'Lato, sans-serif' },
  { id: 'oswald', name: 'Oswald', family: 'Oswald, sans-serif' },
  { id: 'open-sans', name: 'Open Sans', family: 'Open Sans, sans-serif' },
  { id: 'nunito', name: 'Nunito', family: 'Nunito, sans-serif' },
  { id: 'quicksand', name: 'Quicksand', family: 'Quicksand, sans-serif' },
  { id: 'comfortaa', name: 'Comfortaa', family: 'Comfortaa, cursive' },
  { id: 'work-sans', name: 'Work Sans', family: 'Work Sans, sans-serif' },
  { id: 'source-sans', name: 'Source Sans Pro', family: 'Source Sans Pro, sans-serif' },
  { id: 'dm-sans', name: 'DM Sans', family: 'DM Sans, sans-serif' },
  { id: 'rubik', name: 'Rubik', family: 'Rubik, sans-serif' },
  // Display / Impact
  { id: 'bebas', name: 'Bebas Neue', family: 'Bebas Neue, cursive' },
  { id: 'anton', name: 'Anton', family: 'Anton, sans-serif' },
  { id: 'archivo', name: 'Archivo Black', family: 'Archivo Black, sans-serif' },
  { id: 'righteous', name: 'Righteous', family: 'Righteous, cursive' },
  { id: 'russo', name: 'Russo One', family: 'Russo One, sans-serif' },
  { id: 'staatliches', name: 'Staatliches', family: 'Staatliches, cursive' },
  { id: 'bungee', name: 'Bungee', family: 'Bungee, cursive' },
  { id: 'bangers', name: 'Bangers', family: 'Bangers, cursive' },
  { id: 'fredoka', name: 'Fredoka One', family: 'Fredoka One, cursive' },
  // Serif élégants
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display, serif' },
  { id: 'cinzel', name: 'Cinzel', family: 'Cinzel, serif' },
  { id: 'abril', name: 'Abril Fatface', family: 'Abril Fatface, cursive' },
  { id: 'lora', name: 'Lora', family: 'Lora, serif' },
  { id: 'merriweather', name: 'Merriweather', family: 'Merriweather, serif' },
  { id: 'cormorant', name: 'Cormorant Garamond', family: 'Cormorant Garamond, serif' },
  { id: 'libre-baskerville', name: 'Libre Baskerville', family: 'Libre Baskerville, serif' },
  { id: 'dm-serif', name: 'DM Serif Display', family: 'DM Serif Display, serif' },
  // Script / Handwriting
  { id: 'dancing', name: 'Dancing Script', family: 'Dancing Script, cursive' },
  { id: 'pacifico', name: 'Pacifico', family: 'Pacifico, cursive' },
  { id: 'lobster', name: 'Lobster', family: 'Lobster, cursive' },
  { id: 'sacramento', name: 'Sacramento', family: 'Sacramento, cursive' },
  { id: 'permanent', name: 'Permanent Marker', family: 'Permanent Marker, cursive' },
  { id: 'caveat', name: 'Caveat', family: 'Caveat, cursive' },
  { id: 'great-vibes', name: 'Great Vibes', family: 'Great Vibes, cursive' },
  { id: 'satisfy', name: 'Satisfy', family: 'Satisfy, cursive' },
  { id: 'alex-brush', name: 'Alex Brush', family: 'Alex Brush, cursive' },
  { id: 'kaushan', name: 'Kaushan Script', family: 'Kaushan Script, cursive' },
  // Monospace
  { id: 'roboto-mono', name: 'Roboto Mono', family: 'Roboto Mono, monospace' },
  { id: 'space-mono', name: 'Space Mono', family: 'Space Mono, monospace' },
  { id: 'courier-prime', name: 'Courier Prime', family: 'Courier Prime, monospace' },
];

const FONT_WEIGHTS = [
  { value: 100, label: 'Thin' },
  { value: 200, label: 'Extra Light' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi Bold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
  { value: 900, label: 'Black' },
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
  const imageUploadRef = useRef(null);
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [activeTab, setActiveTab] = useState('background');
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
  const [adminGradients, setAdminGradients] = useState([]);
  const [sharedLibrary, setSharedLibrary] = useState([]);
  const [saving, setSaving] = useState(false);
  const [bgType, setBgType] = useState('none'); // none, solid, gradient
  const [bgColor, setBgColor] = useState('#000000');
  const [bgGradient, setBgGradient] = useState({ color1: '#667eea', color2: '#764ba2', angle: 135 });
  const [bgShapeColor, setBgShapeColor] = useState('#FFFFFF');
  
  // Store original image URL separately (never changes)
  const [originalImageUrl, setOriginalImageUrl] = useState(visual.original_image_url || visual.image_url);
  
  // Custom texture generator
  const [showTextureGenerator, setShowTextureGenerator] = useState(false);
  const [texturePrompt, setTexturePrompt] = useState('');
  const [generatingCustomTexture, setGeneratingCustomTexture] = useState(false);
  const [generatedTexture, setGeneratedTexture] = useState(null);
  
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
  
  // Image upload
  const [uploadingUserImage, setUploadingUserImage] = useState(false);
  const [removingBgFromLayer, setRemovingBgFromLayer] = useState(false);
  const [showServiceUnavailable, setShowServiceUnavailable] = useState(false);
  const [serviceErrorType, setServiceErrorType] = useState(null);

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
        // Load admin assets (sorted by most recent first)
        const assets = await base44.entities.EditorAsset.filter({ is_active: true }, '-created_date');
        setAdminTextures(assets.filter(a => a.type === 'texture'));
        setAdminIllustrations(assets.filter(a => a.type === 'illustration'));
        setAdminGradients(assets.filter(a => a.type === 'gradient'));
        
        // Load shared library from admin users
        const adminUsers = await base44.entities.User.filter({ role: 'admin' });
        const allSharedItems = [];
        adminUsers.forEach(adminUser => {
          if (adminUser.editor_library && Array.isArray(adminUser.editor_library)) {
            adminUser.editor_library.forEach(item => {
              allSharedItems.push({ ...item, sharedBy: adminUser.full_name || 'Admin' });
            });
          }
        });
        setSharedLibrary(allSharedItems);
        
        // Load saved layers from visual
        if (visual.editor_layers && Array.isArray(visual.editor_layers) && visual.editor_layers.length > 0) {
          setLayers(visual.editor_layers);
          // Restore background state if there's a background layer
          const bgLayer = visual.editor_layers.find(l => l.type === 'background');
          if (bgLayer) {
            setBgType(bgLayer.bgType);
            if (bgLayer.bgType === 'solid') {
              setBgColor(bgLayer.bgValue);
            } else if (bgLayer.bgType === 'gradient') {
              setBgGradient(bgLayer.bgValue);
            }
          }
        } else {
          // No saved layers - create the base image as a movable layer
          // This will be done after the image loads in the other useEffect
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, [visual.id]);

  // Load base image - always use original
      useEffect(() => {
        // Set the original URL on first load
        const baseUrl = visual.original_image_url || visual.image_url;
        setOriginalImageUrl(baseUrl);
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // ALWAYS use the actual image dimensions to preserve aspect ratio
          // The image generated by AI already has the correct ratio
          const targetWidth = img.width;
          const targetHeight = img.height;

          // Scale down for display while maintaining aspect ratio
          const maxSize = 450;
          const ratio = Math.min(maxSize / targetWidth, maxSize / targetHeight);
          const displayWidth = targetWidth * ratio;
          const displayHeight = targetHeight * ratio;
          
          console.log('Visual dimensions (metadata):', visual.dimensions);
          console.log('Image natural size:', img.width, 'x', img.height);
          console.log('Display size:', displayWidth, 'x', displayHeight);
          
          setCanvasSize({
            width: displayWidth,
            height: displayHeight
          });
          
          // Create the base image as a movable layer if no layers exist
          if (!visual.editor_layers || visual.editor_layers.length === 0) {
            const baseImageLayer = {
              type: 'image',
              imageUrl: baseUrl,
              x: 0,
              y: 0,
              width: displayWidth,
              height: displayHeight,
              opacity: 100,
              isBaseImage: true // Mark as the original generated image
            };
            setLayers([baseImageLayer]);
            setSelectedLayer(0);
          }
          
          setImageLoaded(true);
        };
        img.src = baseUrl;
      }, [visual.original_image_url, visual.image_url]);

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
      // Also preload background images
      if (layer.type === 'background' && layer.bgType === 'image' && layer.bgValue && !loadedImages[layer.bgValue]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setLoadedImages(prev => ({ ...prev, [layer.bgValue]: img }));
        };
        img.src = layer.bgValue;
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

        // Load all image layers first
        const imageLayersToLoad = layers.filter(l => l.type === 'image' && l.imageUrl && !loadedImages[l.imageUrl]);
        if (imageLayersToLoad.length > 0) {
          imageLayersToLoad.forEach(layer => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              setLoadedImages(prev => ({ ...prev, [layer.imageUrl]: img }));
            };
            img.src = layer.imageUrl;
          });
        }

        // Also preload background images
        layers.forEach(layer => {
          if (layer.type === 'background' && layer.bgType === 'image' && layer.bgValue && !loadedImages[layer.bgValue]) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              setLoadedImages(prev => ({ ...prev, [layer.bgValue]: img }));
            };
            img.src = layer.bgValue;
          }
        });

        // Draw canvas
        const drawCanvas = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw all layers in order (first = bottom, last = top)
          layers.forEach((layer, idx) => {
            ctx.save();
            ctx.globalAlpha = layer.opacity / 100;
            
            if (layer.type === 'background') {
              if (layer.bgType === 'solid') {
                ctx.fillStyle = layer.bgValue;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              } else if (layer.bgType === 'gradient') {
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, layer.bgValue.color1);
                gradient.addColorStop(1, layer.bgValue.color2);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              } else if (layer.bgType === 'image' && loadedImages[layer.bgValue]) {
                ctx.drawImage(loadedImages[layer.bgValue], 0, 0, canvas.width, canvas.height);
              }
            } else if (layer.type === 'shape') {
              // Apply rotation
              const centerX = layer.x + layer.width / 2;
              const centerY = layer.y + layer.height / 2;
              ctx.translate(centerX, centerY);
              ctx.rotate((layer.rotation || 0) * Math.PI / 180);
              ctx.translate(-centerX, -centerY);
              
              if (layer.shadow) {
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;
              }
              if (layer.glow) {
                ctx.shadowColor = layer.glowColor || '#ffffff';
                ctx.shadowBlur = layer.glowSize || 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
              }
              ctx.fillStyle = layer.color;
              drawShape(ctx, layer.shape, layer.x, layer.y, layer.width, layer.height);
              ctx.fill();
              if (layer.stroke) {
                ctx.strokeStyle = layer.strokeColor || '#000000';
                ctx.lineWidth = layer.strokeWidth || 2;
                ctx.stroke();
              }
            } else if (layer.type === 'image' && loadedImages[layer.imageUrl]) {
            // Apply effects for images
              if (layer.halo) {
                ctx.shadowColor = layer.haloColor || '#FFD700';
                ctx.shadowBlur = layer.haloSize || 15;
              } else if (layer.glow) {
                ctx.shadowColor = layer.glowColor || '#ffffff';
                ctx.shadowBlur = layer.glowSize || 10;
              } else if (layer.shadow) {
                ctx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = layer.shadowBlur || 10;
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;
              }
              
              // Apply border radius clipping if needed
              if (layer.borderRadius && layer.borderRadius > 0) {
                ctx.beginPath();
                ctx.roundRect(layer.x, layer.y, layer.width, layer.height, layer.borderRadius);
                ctx.clip();
              }
              
              // Apply color tint using a temporary canvas
              if (layer.tintColor && layer.tintOpacity) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = layer.width;
                tempCanvas.height = layer.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(loadedImages[layer.imageUrl], 0, 0, layer.width, layer.height);
                tempCtx.globalCompositeOperation = 'overlay';
                tempCtx.globalAlpha = layer.tintOpacity / 100;
                tempCtx.fillStyle = layer.tintColor;
                tempCtx.fillRect(0, 0, layer.width, layer.height);
                ctx.drawImage(tempCanvas, layer.x, layer.y);
              } else {
                ctx.drawImage(loadedImages[layer.imageUrl], layer.x, layer.y, layer.width, layer.height);
              }
              
              // Draw border on top
              if (layer.stroke) {
                ctx.restore();
                ctx.save();
                ctx.globalAlpha = layer.opacity / 100;
                ctx.strokeStyle = layer.strokeColor || '#000000';
                ctx.lineWidth = layer.strokeWidth || 2;
                if (layer.borderRadius && layer.borderRadius > 0) {
                  ctx.beginPath();
                  ctx.roundRect(layer.x, layer.y, layer.width, layer.height, layer.borderRadius);
                  ctx.stroke();
                } else {
                  ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
                }
              }
            } else if (layer.type === 'text') {
          const fontWeight = layer.fontWeight || (layer.bold ? 700 : 400);
          const fontStyle = `${layer.italic ? 'italic ' : ''}${fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
          ctx.font = fontStyle;
          ctx.fillStyle = layer.color;
          ctx.textAlign = layer.align || 'left';
          ctx.letterSpacing = `${layer.letterSpacing || 0}px`;
          
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
            }
            
            ctx.restore();
            
            // Draw selection indicator
            if (selectedLayer === idx) {
              ctx.strokeStyle = '#8B5CF6';
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 5]);
              if (layer.type === 'text') {
                ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
                const metrics = ctx.measureText(layer.text);
                const textX = layer.x - (layer.align === 'center' ? metrics.width/2 : layer.align === 'right' ? metrics.width : 0);
                ctx.strokeRect(textX - 5, layer.y - layer.fontSize, metrics.width + 10, layer.fontSize + 10);
              } else if (layer.type !== 'background') {
                ctx.strokeRect(layer.x - 5, layer.y - 5, layer.width + 10, layer.height + 10);
              }
              ctx.setLineDash([]);
            }
          });
        };

        drawCanvas();
      }, [imageLoaded, layers, selectedLayer, loadedImages, bgType, bgColor, bgGradient]);

  const [helpMessage, setHelpMessage] = useState(null);

  const showHelp = (msg) => {
    setHelpMessage(msg);
    setTimeout(() => setHelpMessage(null), 4000);
  };

  const addTextLayer = (text = null) => {
    const newLayer = {
      type: 'text',
      text: text || (language === 'fr' ? 'Votre texte' : 'Your text'),
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      fontSize: 32,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
      letterSpacing: 0,
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
    showHelp(language === 'fr' ? '💡 Glissez le texte sur l\'image. Options de style en bas.' : '💡 Drag text on image. Style options below.');
  };

  const addShapeLayer = (shape) => {
    const newLayer = { type: 'shape', shape, x: canvasSize.width / 2 - 50, y: canvasSize.height / 2 - 50, width: 100, height: 100, color: '#FFFFFF', opacity: 80, stroke: false, strokeColor: '#000000', strokeWidth: 2, rotation: 0, shadow: false, glow: false, glowColor: '#ffffff', glowSize: 10 };
    setLayers([...layers, newLayer]);
    setSelectedLayer(layers.length);
    setActiveTab('layers');
    showHelp(language === 'fr' ? '💡 Glissez la forme. Taille et couleur en bas.' : '💡 Drag shape. Size and color below.');
  };

  const addImageLayer = (imageUrl, width = 100, height = 100, isTexture = false) => {
        let finalWidth = width;
        let finalHeight = height;
        let x = canvasSize.width / 2 - width/2;
        let y = canvasSize.height / 2 - height/2;

        // For textures, cover the canvas without stretching (like object-fit: cover)
        if (isTexture) {
          // Assuming texture is square, scale to cover the entire canvas
          const maxDimension = Math.max(canvasSize.width, canvasSize.height);
          finalWidth = maxDimension;
          finalHeight = maxDimension;
          // Center the texture
          x = (canvasSize.width - maxDimension) / 2;
          y = (canvasSize.height - maxDimension) / 2;
        }

        const newLayer = {
          type: 'image',
          imageUrl,
          x,
          y,
          width: finalWidth,
          height: finalHeight,
          opacity: isTexture ? 50 : 100
        };
        // Always add at the end (on top)
        setLayers([...layers, newLayer]);
        setSelectedLayer(layers.length);
        setActiveTab('layers');
      };

  const addBackgroundLayer = (type, value) => {
    const newLayer = {
      type: 'background',
      bgType: type,
      bgValue: value,
      x: 0,
      y: 0,
      width: canvasSize.width,
      height: canvasSize.height,
      opacity: 100
    };
    // Add at the beginning (below all other layers)
    setLayers([newLayer, ...layers]);
    setSelectedLayer(0);
    setActiveTab('layers');
    showHelp(language === 'fr' ? '💡 Fond ajouté sous l\'image. Ajustez l\'opacité en bas.' : '💡 Background added below image. Adjust opacity below.');
  };

  const addBackgroundImageLayer = (imageUrl) => {
    const newLayer = {
      type: 'background',
      bgType: 'image',
      bgValue: imageUrl,
      x: 0,
      y: 0,
      width: canvasSize.width,
      height: canvasSize.height,
      opacity: 100
    };
    // Add at the beginning (below all other layers)
    setLayers([newLayer, ...layers]);
    setSelectedLayer(0);
    setActiveTab('layers');
    showHelp(language === 'fr' ? '💡 Fond ajouté sous l\'image. Ajustez l\'opacité en bas.' : '💡 Background added below image. Adjust opacity below.');
  };

  const addBackgroundShapeLayer = (shape) => {
    const newLayer = {
      type: 'shape',
      shape,
      x: canvasSize.width / 2 - canvasSize.width * 0.4,
      y: canvasSize.height / 2 - canvasSize.height * 0.4,
      width: canvasSize.width * 0.8,
      height: canvasSize.height * 0.8,
      color: bgShapeColor,
      opacity: 100,
      stroke: false,
      strokeColor: '#000000',
      strokeWidth: 2,
      rotation: 0,
      shadow: false,
      glow: false,
      glowColor: '#ffffff',
      glowSize: 10,
      isBackgroundShape: true // Mark as background shape
    };
    // Add at the beginning (below all other layers)
    setLayers([newLayer, ...layers]);
    setSelectedLayer(0);
    setActiveTab('layers');
    showHelp(language === 'fr' ? '💡 Forme ajoutée sous l\'image. Ajustez la taille et couleur.' : '💡 Shape added below image. Adjust size and color.');
  };
  
  // Accordion state for background tab
  const [bgAccordion, setBgAccordion] = useState({
    colors: false,
    gradients: false,
    proGradients: false,
    textures: false,
    shapes: false,
    texturesTab: false,
    sharedTextures: false,
    myTextures: false,
    adminIllustrations: false,
    sharedIllustrations: false,
    myIllustrations: false,
    generateIllustrations: false
  });
  
  const toggleBgAccordion = (key) => {
    setBgAccordion(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateCustomTexture = async () => {
        if (!texturePrompt.trim()) return;
        setGeneratingCustomTexture(true);
        try {
          const prompt = texturePrompt + ', seamless texture, high quality, tileable pattern, 1024x1024';
          const result = await base44.integrations.Core.GenerateImage({ prompt });
          setGeneratedTexture(result.url);
        } catch (e) { console.error(e); }
        setGeneratingCustomTexture(false);
      };

      const addTextureToCanvas = (saveToLibrary = false) => {
                if (!generatedTexture) return;
                addImageLayer(generatedTexture, canvasSize.width, canvasSize.height, true);
                if (saveToLibrary && user) {
          const newItem = { type: 'texture', url: generatedTexture, name: texturePrompt.slice(0, 30) };
          const updatedLibrary = [...userLibrary, newItem];
          setUserLibrary(updatedLibrary);
          base44.auth.updateMe({ editor_library: updatedLibrary });
        }
        setShowTextureGenerator(false);
        setGeneratedTexture(null);
        setTexturePrompt('');
        showHelp(language === 'fr' ? '💡 Texture ajoutée. Réglez l\'opacité en bas.' : '💡 Texture added. Adjust opacity below.');
      };

  const generateIllustration = async (illustPrompt) => {
    setGeneratingIllustration(illustPrompt.id || illustPrompt.name_fr);
    try {
      const prompt = illustPrompt.prompt + ', high quality illustration';
      const result = await base44.integrations.Core.GenerateImage({ prompt });
      addImageLayer(result.url, 150, 150);
                showHelp(language === 'fr' ? '💡 Illustration ajoutée. Redimensionnez en bas.' : '💡 Illustration added. Resize below.');
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

  const handleSave = async () => {
        setSaving(true);

        // Wait a frame to ensure canvas is fully rendered with all effects
        await new Promise(resolve => setTimeout(resolve, 200));

        // Create a high-resolution canvas for export
        const scale = 2; // Export at 2x resolution
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvasSize.width * scale;
        exportCanvas.height = canvasSize.height * scale;
        const exportCtx = exportCanvas.getContext('2d');
        exportCtx.scale(scale, scale);

        // Draw all layers in order (same as rendering)
        for (const layer of layers) {
          exportCtx.save();
          exportCtx.globalAlpha = layer.opacity / 100;
          
          if (layer.type === 'background') {
            if (layer.bgType === 'solid') {
              exportCtx.fillStyle = layer.bgValue;
              exportCtx.fillRect(0, 0, canvasSize.width, canvasSize.height);
            } else if (layer.bgType === 'gradient') {
              const gradient = exportCtx.createLinearGradient(0, 0, canvasSize.width, canvasSize.height);
              gradient.addColorStop(0, layer.bgValue.color1);
              gradient.addColorStop(1, layer.bgValue.color2);
              exportCtx.fillStyle = gradient;
              exportCtx.fillRect(0, 0, canvasSize.width, canvasSize.height);
            } else if (layer.bgType === 'image') {
              const bgImg = loadedImages[layer.bgValue] || await new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.src = layer.bgValue;
              });
              exportCtx.drawImage(bgImg, 0, 0, canvasSize.width, canvasSize.height);
            }
          } else if (layer.type === 'shape') {
            const centerX = layer.x + layer.width / 2;
            const centerY = layer.y + layer.height / 2;
            exportCtx.translate(centerX, centerY);
            exportCtx.rotate((layer.rotation || 0) * Math.PI / 180);
            exportCtx.translate(-centerX, -centerY);
            
            if (layer.shadow) {
              exportCtx.shadowColor = 'rgba(0,0,0,0.5)';
              exportCtx.shadowBlur = 10;
              exportCtx.shadowOffsetX = 5;
              exportCtx.shadowOffsetY = 5;
            }
            if (layer.glow) {
              exportCtx.shadowColor = layer.glowColor || '#ffffff';
              exportCtx.shadowBlur = layer.glowSize || 10;
            }
            exportCtx.fillStyle = layer.color;
            drawShape(exportCtx, layer.shape, layer.x, layer.y, layer.width, layer.height);
            exportCtx.fill();
            if (layer.stroke) {
              exportCtx.strokeStyle = layer.strokeColor || '#000000';
              exportCtx.lineWidth = layer.strokeWidth || 2;
              exportCtx.stroke();
            }
          } else if (layer.type === 'image' && layer.imageUrl) {
            const layerImg = loadedImages[layer.imageUrl] || await new Promise((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve(img);
              img.src = layer.imageUrl;
            });
            
            if (layer.halo) {
              exportCtx.shadowColor = layer.haloColor || '#FFD700';
              exportCtx.shadowBlur = layer.haloSize || 15;
            } else if (layer.glow) {
              exportCtx.shadowColor = layer.glowColor || '#ffffff';
              exportCtx.shadowBlur = layer.glowSize || 10;
            } else if (layer.shadow) {
              exportCtx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.5)';
              exportCtx.shadowBlur = layer.shadowBlur || 10;
              exportCtx.shadowOffsetX = 5;
              exportCtx.shadowOffsetY = 5;
            }
            
            if (layer.borderRadius && layer.borderRadius > 0) {
              exportCtx.beginPath();
              exportCtx.roundRect(layer.x, layer.y, layer.width, layer.height, layer.borderRadius);
              exportCtx.clip();
            }
            
            if (layer.tintColor && layer.tintOpacity) {
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = layer.width;
              tempCanvas.height = layer.height;
              const tempCtx = tempCanvas.getContext('2d');
              tempCtx.drawImage(layerImg, 0, 0, layer.width, layer.height);
              tempCtx.globalCompositeOperation = 'overlay';
              tempCtx.globalAlpha = layer.tintOpacity / 100;
              tempCtx.fillStyle = layer.tintColor;
              tempCtx.fillRect(0, 0, layer.width, layer.height);
              exportCtx.drawImage(tempCanvas, layer.x, layer.y);
            } else {
              exportCtx.drawImage(layerImg, layer.x, layer.y, layer.width, layer.height);
            }
            
            if (layer.stroke) {
              exportCtx.restore();
              exportCtx.save();
              exportCtx.globalAlpha = layer.opacity / 100;
              exportCtx.strokeStyle = layer.strokeColor || '#000000';
              exportCtx.lineWidth = layer.strokeWidth || 2;
              if (layer.borderRadius && layer.borderRadius > 0) {
                exportCtx.beginPath();
                exportCtx.roundRect(layer.x, layer.y, layer.width, layer.height, layer.borderRadius);
                exportCtx.stroke();
              } else {
                exportCtx.strokeRect(layer.x, layer.y, layer.width, layer.height);
              }
            }
          } else if (layer.type === 'text') {
            const fontWeight = layer.fontWeight || (layer.bold ? 700 : 400);
            const fontStyle = `${layer.italic ? 'italic ' : ''}${fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
            exportCtx.font = fontStyle;
            exportCtx.fillStyle = layer.color;
            exportCtx.textAlign = layer.align || 'left';
            
            if (layer.effect3d) {
              const depth = 6;
              for (let i = depth; i > 0; i--) {
                exportCtx.fillStyle = `rgba(0,0,0,${0.3 - i * 0.04})`;
                exportCtx.fillText(layer.text, layer.x + i, layer.y + i);
              }
              exportCtx.fillStyle = layer.color;
            }
            
            if (layer.halo) {
              exportCtx.save();
              exportCtx.shadowColor = layer.haloColor || '#FFD700';
              exportCtx.shadowBlur = layer.haloSize || 15;
              exportCtx.fillStyle = layer.haloColor || '#FFD700';
              exportCtx.fillText(layer.text, layer.x, layer.y);
              exportCtx.fillText(layer.text, layer.x, layer.y);
              exportCtx.restore();
              exportCtx.fillStyle = layer.color;
            }
            
            if (layer.neon) {
              exportCtx.save();
              const neonColor = layer.neonColor || '#ff00ff';
              const intensity = layer.neonIntensity || 15;
              exportCtx.shadowColor = neonColor;
              exportCtx.shadowBlur = intensity;
              exportCtx.fillStyle = neonColor;
              exportCtx.fillText(layer.text, layer.x, layer.y);
              exportCtx.shadowBlur = intensity * 2;
              exportCtx.fillText(layer.text, layer.x, layer.y);
              exportCtx.restore();
              exportCtx.fillStyle = '#ffffff';
            }
            
            if (layer.glow) {
              exportCtx.shadowColor = layer.glowColor || '#ffffff';
              exportCtx.shadowBlur = layer.glowSize || 10;
            }
            
            if (layer.shadow && !layer.glow && !layer.neon) {
              exportCtx.shadowColor = 'rgba(0,0,0,0.6)';
              exportCtx.shadowBlur = 6;
              exportCtx.shadowOffsetX = 3;
              exportCtx.shadowOffsetY = 3;
            }
            
            if (layer.stroke) {
              exportCtx.strokeStyle = layer.strokeColor || '#000000';
              exportCtx.lineWidth = layer.strokeWidth || 2;
              exportCtx.strokeText(layer.text, layer.x, layer.y);
            }
            
            exportCtx.fillText(layer.text, layer.x, layer.y);
          }
          exportCtx.restore();
        }

        const dataUrl = exportCanvas.toDataURL('image/png');
    
    // Convert dataUrl to blob and upload
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `${visual.title || 'visual'}-edited.png`, { type: 'image/png' });
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Update the visual with new image AND keep layers for future editing
      // Also store original image URL so we can always go back
      if (visual.id) {
        await base44.entities.Visual.update(visual.id, {
          image_url: file_url,
          original_image_url: originalImageUrl, // Keep original for re-editing
          editor_layers: layers // Keep layers for re-editing
        });
      }
      
      setSaving(false);
      // Pass the new URL, layers, and original back so the parent can update immediately
      onSave?.(file_url, layers, originalImageUrl);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  // Textures admin avec image uploadée (pas de génération)
  const adminTexturesWithImage = adminTextures.filter(a => a.preview_url).map(a => ({ 
    id: a.id, 
    name: { fr: a.name_fr, en: a.name_en || a.name_fr }, 
    preview_url: a.preview_url,
    isStatic: true 
  }));
  // Textures par défaut qui nécessitent génération IA
  const generativeTextures = [...DEFAULT_TEXTURES, ...adminTextures.filter(a => !a.preview_url && a.prompt).map(a => ({ id: a.id, name: { fr: a.name_fr, en: a.name_en || a.name_fr }, prompt: a.prompt }))];
  const allIllustrations = [...DEFAULT_ILLUSTRATIONS, ...adminIllustrations.map(a => ({ id: a.id, name: { fr: a.name_fr, en: a.name_en || a.name_fr }, prompt: a.prompt, preview_url: a.preview_url }))];

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
                          <Button variant="ghost" size="sm" onClick={() => setShowSavedTexts(true)} className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 text-xs px-2">
                            <Bookmark className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">{language === 'fr' ? 'Mes textes' : 'My texts'}</span> ({savedTexts.length})
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={onCancel} className="text-white/60 hover:text-white hover:bg-white/10 text-xs px-2">
                          <X className="h-4 w-4" />
                        </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs px-3">
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            {language === 'fr' ? 'Sauvegarder' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Tools Tabs - Horizontal on top */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-3">
        <TabsList className="flex w-full bg-white/10 rounded-lg p-1 h-10 gap-1">
          <TabsTrigger value="background" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors"><PaintBucket className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="layers" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors relative">
            <Layers className="h-4 w-4" />
            {layers.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-emerald-500 rounded-full text-[10px] text-white font-medium flex items-center justify-center">
                {layers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="text" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors"><Type className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="shapes" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors"><Square className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="textures" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors"><TextureIcon className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="gradients" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors"><GradientIcon className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="images" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors"><Upload className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="illustrations" className="flex-1 h-full rounded-md data-[state=active]:bg-violet-500/40 data-[state=active]:text-white text-white/60 hover:text-white transition-colors"><IllustrationIcon className="h-4 w-4" /></TabsTrigger>
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
            <p className="text-white/40 text-xs px-1 mt-3">
              {language === 'fr' ? '💡 Ajoutez un texte puis sélectionnez la police dans les options en bas.' : '💡 Add text then select font in options below.'}
            </p>
          </TabsContent>

          <TabsContent value="background" className="mt-0 space-y-2">
            {/* Remove Background Button */}
            <Button
              onClick={async () => {
                setRemovingBg(true);
                try {
                  const response = await base44.functions.invoke('removeBg', { image_url: originalImageUrl });
                  if (response.data?.success && response.data?.image_url) {
                    // Find and update the base image layer
                    const baseLayerIdx = layers.findIndex(l => l.isBaseImage);
                    if (baseLayerIdx !== -1) {
                      updateLayer(baseLayerIdx, { imageUrl: response.data.image_url });
                    }
                    setOriginalImageUrl(response.data.image_url);
                    showHelp(language === 'fr' ? '✅ Fond supprimé ! (1 crédit utilisé)' : '✅ Background removed! (1 credit used)');
                  } else if (response.data?.error === 'service_unavailable' || response.data?.error === 'no_credits') {
                    setServiceErrorType(response.data?.error);
                    setShowServiceUnavailable(true);
                  } else {
                    showHelp(language === 'fr' ? `❌ ${response.data?.error || 'Erreur'}` : `❌ ${response.data?.error || 'Error'}`);
                  }
                } catch (err) {
                  console.error(err);
                  showHelp(language === 'fr' ? '❌ Erreur lors de la suppression du fond' : '❌ Error removing background');
                }
                setRemovingBg(false);
              }}
              disabled={removingBg}
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 py-4 px-4 flex flex-col items-center gap-1.5 h-auto"
            >
              <div className="flex items-center">
                {removingBg ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Scissors className="h-4 w-4 mr-2" />}
                {language === 'fr' ? 'Supprimer le fond (1 crédit)' : 'Remove background (1 credit)'}
              </div>
              <span className="text-[10px] text-white/70 font-normal leading-relaxed text-center">
                {language === 'fr' 
                  ? 'Recommandé pour personnaliser librement le fond' 
                  : 'Recommended to freely customize the background'}
              </span>
            </Button>

            {/* Accordion: Couleurs */}
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => toggleBgAccordion('colors')} className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-white/70 text-xs flex items-center gap-2">
                  <Palette className="h-3 w-3" />
                  {language === 'fr' ? 'Couleurs unies' : 'Solid colors'}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform", bgAccordion.colors && "rotate-180")} />
              </button>
              {bgAccordion.colors && (
                <div className="p-2">
                  <div className="flex gap-1 flex-wrap">
                    {PRESET_COLORS.map(color => (
                      <button key={color} onClick={() => addBackgroundLayer('solid', color)} className="w-6 h-6 rounded-lg border-2 border-transparent hover:border-violet-400 transition-all hover:scale-110" style={{ backgroundColor: color }} />
                    ))}
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
                    <button onClick={() => addBackgroundLayer('solid', bgColor)} className="px-2 h-6 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-xs">+</button>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Dégradés */}
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => toggleBgAccordion('gradients')} className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-white/70 text-xs flex items-center gap-2">
                  <GradientIcon className="h-3 w-3" />
                  {language === 'fr' ? 'Dégradés' : 'Gradients'}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform", bgAccordion.gradients && "rotate-180")} />
              </button>
              {bgAccordion.gradients && (
                <div className="p-2 space-y-2">
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { color1: '#667eea', color2: '#764ba2' },
                      { color1: '#f093fb', color2: '#f5576c' },
                      { color1: '#4facfe', color2: '#00f2fe' },
                      { color1: '#43e97b', color2: '#38f9d7' },
                      { color1: '#fa709a', color2: '#fee140' },
                      { color1: '#a18cd1', color2: '#fbc2eb' },
                      { color1: '#ff0844', color2: '#ffb199' },
                      { color1: '#30cfd0', color2: '#330867' },
                      { color1: '#000000', color2: '#434343' },
                      { color1: '#200122', color2: '#6f0000' },
                      { color1: '#0f0c29', color2: '#302b63' },
                      { color1: '#ffe259', color2: '#ffa751' },
                    ].map((preset, idx) => (
                      <button key={idx} onClick={() => addBackgroundLayer('gradient', preset)} 
                        className="h-8 rounded-lg border border-white/10 hover:border-violet-400 transition-colors hover:scale-105"
                        style={{ background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})` }} />
                    ))}
                  </div>
                  <div className="flex gap-2 items-center pt-1 border-t border-white/5">
                    <input type="color" value={bgGradient.color1} onChange={(e) => setBgGradient({...bgGradient, color1: e.target.value})} className="w-6 h-6 rounded cursor-pointer" />
                    <input type="color" value={bgGradient.color2} onChange={(e) => setBgGradient({...bgGradient, color2: e.target.value})} className="w-6 h-6 rounded cursor-pointer" />
                    <div className="flex-1 h-6 rounded-lg" style={{ background: `linear-gradient(135deg, ${bgGradient.color1}, ${bgGradient.color2})` }} />
                    <button onClick={() => addBackgroundLayer('gradient', bgGradient)} className="px-2 h-6 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-xs">+</button>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Dégradés PRO */}
            {adminGradients.filter(g => g.preview_url).length > 0 && (
              <div className="border border-amber-500/30 rounded-lg overflow-hidden">
                <button onClick={() => toggleBgAccordion('proGradients')} className="w-full px-3 py-2 flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/20 transition-colors">
                  <span className="text-amber-300 text-xs flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    {language === 'fr' ? 'Dégradés PRO' : 'PRO Gradients'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-amber-400/60 transition-transform", bgAccordion.proGradients && "rotate-180")} />
                </button>
                {bgAccordion.proGradients && (
                  <div className="p-2">
                    <div className="grid grid-cols-5 gap-1">
                      {adminGradients.filter(g => g.preview_url).map(gradient => (
                        <button key={gradient.id} onClick={() => addBackgroundImageLayer(gradient.preview_url)}
                          className="relative group rounded-lg overflow-hidden border border-amber-500/30 hover:border-amber-500/60 transition-colors aspect-square">
                          <img src={gradient.preview_url} alt={gradient.name_fr} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accordion: Textures PRO */}
            {adminTexturesWithImage.length > 0 && (
              <div className="border border-amber-500/30 rounded-lg overflow-hidden">
                <button onClick={() => toggleBgAccordion('textures')} className="w-full px-3 py-2 flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/20 transition-colors">
                  <span className="text-amber-300 text-xs flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    {language === 'fr' ? 'Textures PRO' : 'PRO Textures'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-amber-400/60 transition-transform", bgAccordion.textures && "rotate-180")} />
                </button>
                {bgAccordion.textures && (
                  <div className="p-2">
                    <div className="grid grid-cols-5 gap-1">
                      {adminTexturesWithImage.map(texture => (
                        <button key={texture.id} onClick={() => addBackgroundImageLayer(texture.preview_url)}
                          className="relative group rounded-lg overflow-hidden border border-amber-500/30 hover:border-amber-500/60 transition-colors aspect-square">
                          <img src={texture.preview_url} alt={texture.name[language]} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accordion: Formes */}
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => toggleBgAccordion('shapes')} className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-white/70 text-xs flex items-center gap-2">
                  <Square className="h-3 w-3 text-blue-400" />
                  {language === 'fr' ? 'Formes' : 'Shapes'}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform", bgAccordion.shapes && "rotate-180")} />
              </button>
              {bgAccordion.shapes && (
                <div className="p-2 space-y-2">
                  <div className="grid grid-cols-6 gap-1">
                    {SHAPES.map(shape => {
                      const ShapeIcon = shape.icon;
                      return (
                        <button key={shape.id} onClick={() => addBackgroundShapeLayer(shape.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex flex-col items-center gap-0.5">
                          <ShapeIcon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <span className="text-white/30 text-xs">{language === 'fr' ? 'Couleur:' : 'Color:'}</span>
                    {PRESET_COLORS.slice(0, 8).map(color => (
                      <button key={color} onClick={() => setBgShapeColor(color)} className={cn("w-5 h-5 rounded-full border-2 transition-transform hover:scale-110", bgShapeColor === color ? "border-violet-400" : "border-transparent")} style={{ backgroundColor: color }} />
                    ))}
                    <input type="color" value={bgShapeColor} onChange={(e) => setBgShapeColor(e.target.value)} className="w-5 h-5 rounded cursor-pointer" />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="shapes" className="mt-0 space-y-2">
            <div className="grid grid-cols-6 gap-1.5">
              {SHAPES.map(shape => {
                const ShapeIcon = shape.icon;
                return (
                  <button key={shape.id} onClick={() => addShapeLayer(shape.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex flex-col items-center gap-0.5">
                    <ShapeIcon className="h-4 w-4" /><span className="text-[9px]">{shape.name}</span>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="textures" className="mt-0 space-y-2">
            {/* Générateur de texture IA - en premier */}
            <Button onClick={() => setShowTextureGenerator(true)} size="default" className="w-full py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg shadow-violet-500/30 border border-violet-400/30">
              <Wand2 className="h-5 w-5 mr-2 animate-pulse" />{language === 'fr' ? '✨ Générer texture IA' : '✨ Generate AI texture'}
            </Button>

            {/* Accordion: Textures PRO (admin) */}
            {adminTexturesWithImage.length > 0 && (
              <div className="border border-amber-500/30 rounded-lg overflow-hidden">
                <button onClick={() => toggleBgAccordion('texturesTab')} className="w-full px-3 py-2 flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/20 transition-colors">
                  <span className="text-amber-300 text-xs flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    {language === 'fr' ? 'Textures PRO disponibles' : 'Available PRO Textures'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-amber-400/60 transition-transform", bgAccordion.texturesTab && "rotate-180")} />
                </button>
                {bgAccordion.texturesTab && (
                  <div className="p-2">
                    <div className="grid grid-cols-5 gap-1.5">
                      {adminTexturesWithImage.map(texture => (
                        <button key={texture.id} onClick={() => addImageLayer(texture.preview_url, canvasSize.width, canvasSize.height, true)}
                          className="relative group rounded-lg overflow-hidden border border-amber-500/30 hover:border-amber-500/60 transition-colors aspect-square">
                          <img src={texture.preview_url} alt={texture.name[language]} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs text-center px-1">{texture.name[language]}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accordion: Textures partagées */}
            {sharedLibrary.filter(item => item.type === 'texture').length > 0 && (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button onClick={() => toggleBgAccordion('sharedTextures')} className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-white/70 text-xs flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    {language === 'fr' ? 'Textures partagées' : 'Shared textures'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform", bgAccordion.sharedTextures && "rotate-180")} />
                </button>
                {bgAccordion.sharedTextures && (
                  <div className="p-2">
                    <div className="grid grid-cols-5 gap-1.5">
                      {sharedLibrary.filter(item => item.type === 'texture').map((item, idx) => (
                        <div key={`shared-${idx}`} className="relative group">
                          <button onClick={() => addImageLayer(item.url, canvasSize.width, canvasSize.height, true)}
                            className="w-full aspect-square rounded-lg overflow-hidden border border-amber-500/30 hover:border-amber-500/60 transition-colors">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                          </button>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg pointer-events-none">
                            <span className="text-white text-[8px] text-center px-0.5">{item.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accordion: Mes textures */}
            {userLibrary.filter(item => item.type === 'texture').length > 0 && (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button onClick={() => toggleBgAccordion('myTextures')} className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-white/70 text-xs flex items-center gap-2">
                    <FolderOpen className="h-3 w-3" />
                    {language === 'fr' ? 'Mes textures' : 'My textures'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform", bgAccordion.myTextures && "rotate-180")} />
                </button>
                {bgAccordion.myTextures && (
                  <div className="p-2">
                    <div className="grid grid-cols-5 gap-1.5">
                      {userLibrary.filter(item => item.type === 'texture').map((item, idx) => (
                        <div key={idx} className="relative group">
                          <button onClick={() => addImageLayer(item.url, canvasSize.width, canvasSize.height, true)}
                            className="w-full aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-violet-500/50 transition-colors">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                          </button>
                          <button onClick={() => removeFromLibrary(userLibrary.indexOf(item))} className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-2 w-2 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="gradients" className="mt-0 space-y-3">
            {adminGradients.length > 0 ? (
              <>
                <p className="text-white/40 text-xs px-1">{language === 'fr' ? 'Dégradés PRO disponibles:' : 'Available PRO gradients:'}</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {adminGradients.filter(g => g.preview_url).map(gradient => (
                    <button key={gradient.id} onClick={() => addImageLayer(gradient.preview_url, canvasSize.width, canvasSize.height, true)}
                      className="relative group rounded-lg overflow-hidden border border-white/10 hover:border-amber-500/50 transition-colors aspect-square">
                      <img src={gradient.preview_url} alt={gradient.name_fr} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs text-center px-1">{language === 'fr' ? gradient.name_fr : (gradient.name_en || gradient.name_fr)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <GradientIcon className="h-8 w-8 opacity-20 mx-auto mb-2" />
                <p className="text-white/40 text-xs">{language === 'fr' ? 'Aucun dégradé PRO disponible' : 'No PRO gradients available'}</p>
                <p className="text-white/30 text-xs mt-1">{language === 'fr' ? 'Les admins peuvent en ajouter via Assets' : 'Admins can add them via Assets'}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="mt-0 space-y-3">
            <input
              type="file"
              ref={imageUploadRef}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingUserImage(true);
                try {
                  const { file_url } = await base44.integrations.Core.UploadFile({ file });
                  addImageLayer(file_url, 150, 150);
                  showHelp(language === 'fr' ? '💡 Image ajoutée ! Redimensionnez et déplacez-la.' : '💡 Image added! Resize and move it.');
                } catch (err) {
                  console.error(err);
                }
                setUploadingUserImage(false);
                e.target.value = '';
              }}
              accept="image/*"
              className="hidden"
            />
            <Button
              onClick={() => imageUploadRef.current?.click()}
              disabled={uploadingUserImage}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {uploadingUserImage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {language === 'fr' ? 'Importer une image' : 'Upload an image'}
            </Button>
            <p className="text-white/40 text-xs text-center">
              {language === 'fr' ? 'Importez vos propres images (logos, photos, etc.)' : 'Import your own images (logos, photos, etc.)'}
            </p>
            
            {/* User library images */}
            {userLibrary.filter(item => item.type === 'image').length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-white/40 text-xs px-1 mb-2">{language === 'fr' ? 'Mes images:' : 'My images:'}</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {userLibrary.filter(item => item.type === 'image').map((item, idx) => (
                    <div key={idx} className="relative group">
                      <button onClick={() => addImageLayer(item.url, 150, 150)}
                        className="w-full aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-violet-500/50 transition-colors">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      </button>
                      <button onClick={() => removeFromLibrary(userLibrary.indexOf(item))} className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-2 w-2 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="illustrations" className="mt-0 space-y-2">
            {/* Bouton créer illustration IA - en premier */}
            <Button onClick={() => setShowIllustGenerator(true)} size="default" className="w-full py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 hover:from-pink-700 hover:via-purple-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-pink-500/30 border border-pink-400/30">
              <Wand2 className="h-5 w-5 mr-2 animate-pulse" />{language === 'fr' ? '✨ Créer illustration IA' : '✨ Create AI illustration'}
            </Button>
            
            {/* Accordion: Illustrations disponibles (admin) */}
            {adminIllustrations.filter(a => a.preview_url).length > 0 && (
              <div className="border border-amber-500/30 rounded-lg overflow-hidden">
                <button onClick={() => toggleBgAccordion('adminIllustrations')} className="w-full px-3 py-2 flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/20 transition-colors">
                  <span className="text-amber-300 text-xs flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    {language === 'fr' ? 'Illustrations PRO disponibles' : 'Available PRO Illustrations'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-amber-400/60 transition-transform", bgAccordion.adminIllustrations && "rotate-180")} />
                </button>
                {bgAccordion.adminIllustrations && (
                  <div className="p-2">
                    <div className="grid grid-cols-6 gap-1.5">
                      {adminIllustrations.filter(a => a.preview_url).map(illust => (
                        <button key={illust.id} onClick={() => addImageLayer(illust.preview_url, 150, 150)}
                          className="relative group rounded-lg overflow-hidden border border-amber-500/30 hover:border-amber-500/60 transition-colors aspect-square">
                          <img src={illust.preview_url} alt={illust.name_fr} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[8px] text-center px-0.5">{language === 'fr' ? illust.name_fr : (illust.name_en || illust.name_fr)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accordion: Illustrations partagées */}
            {sharedLibrary.filter(item => item.type === 'illustration').length > 0 && (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button onClick={() => toggleBgAccordion('sharedIllustrations')} className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-white/70 text-xs flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    {language === 'fr' ? 'Illustrations partagées' : 'Shared illustrations'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform", bgAccordion.sharedIllustrations && "rotate-180")} />
                </button>
                {bgAccordion.sharedIllustrations && (
                  <div className="p-2">
                    <div className="grid grid-cols-6 gap-1.5">
                      {sharedLibrary.filter(item => item.type === 'illustration').map((item, idx) => (
                        <button 
                          key={`shared-illust-${idx}`} 
                          onClick={() => addImageLayer(item.url, 150, 150)}
                          className="relative group rounded-lg overflow-hidden border border-amber-500/30 hover:border-amber-500/60 transition-colors aspect-square"
                        >
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="text-white text-[8px] text-center px-0.5">{item.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accordion: Mes illustrations */}
            {userLibrary.filter(item => item.type === 'illustration').length > 0 && (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button onClick={() => toggleBgAccordion('myIllustrations')} className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-white/70 text-xs flex items-center gap-2">
                    <FolderOpen className="h-3 w-3" />
                    {language === 'fr' ? 'Mes illustrations' : 'My illustrations'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform", bgAccordion.myIllustrations && "rotate-180")} />
                </button>
                {bgAccordion.myIllustrations && (
                  <div className="p-2">
                    <div className="grid grid-cols-6 gap-1.5">
                      {userLibrary.filter(item => item.type === 'illustration').map((item, idx) => (
                        <div key={idx} className="relative group">
                          <button onClick={() => addImageLayer(item.url, 150, 150)}
                            className="w-full aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-violet-500/50 transition-colors">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                          </button>
                          <button onClick={() => removeFromLibrary(userLibrary.indexOf(item))} className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-2 w-2 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accordion: Générer avec IA */}
            {allIllustrations.filter(i => !i.preview_url).length > 0 && (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button onClick={() => toggleBgAccordion('generateIllustrations')} className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-white/70 text-xs flex items-center gap-2">
                    <Wand2 className="h-3 w-3 text-violet-400" />
                    {language === 'fr' ? 'Générer avec IA' : 'Generate with AI'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform", bgAccordion.generateIllustrations && "rotate-180")} />
                </button>
                {bgAccordion.generateIllustrations && (
                  <div className="p-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      {allIllustrations.filter(i => !i.preview_url).map(illust => (
                        <button key={illust.id} onClick={() => generateIllustration(illust)} disabled={generatingIllustration !== null}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-[10px] flex items-center gap-1">
                          {generatingIllustration === (illust.id || illust.name_fr) ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
                          {illust.name[language] || illust.name.fr}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="layers" className="mt-0 space-y-2">
            {layers.length > 0 && (
              <p className="text-amber-400/80 text-xs px-2 py-1 bg-amber-500/10 rounded-lg flex items-center gap-1">
                💡 {language === 'fr' ? 'Utilisez les flèches pour réordonner. Haut = devant.' : 'Use arrows to reorder. Top = front.'}
              </p>
            )}
            <div className="space-y-1">
              {layers.length === 0 ? (
              <p className="text-white/40 text-xs text-center py-4">{language === 'fr' ? 'Aucun calque' : 'No layers'}</p>
              ) : [...layers].reverse().map((layer, reversedIdx) => {
              const idx = layers.length - 1 - reversedIdx;
              const LayerIcon = layer.type === 'text' ? Type : layer.type === 'image' ? ImagePlus : layer.type === 'background' ? PaintBucket : Square;
              return (
                <div key={idx} onClick={() => setSelectedLayer(idx)}
                  className={cn("w-full px-2 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-all cursor-pointer", selectedLayer === idx ? "bg-violet-500/30 text-violet-300 border border-violet-500/50" : "bg-white/5 text-white/50 hover:bg-white/10")}>
                  <LayerIcon className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate flex-1 text-left">{layer.type === 'text' ? layer.text.slice(0, 15) : layer.type === 'image' ? 'Image' : layer.type === 'background' ? (language === 'fr' ? 'Fond' : 'Background') : layer.shape}</span>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(idx, 'up'); }} disabled={idx === layers.length - 1} className="p-1 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"><ChevronUp className="h-3 w-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(idx, 'down'); }} disabled={idx === 0} className="p-1 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"><ChevronDown className="h-3 w-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteLayer(idx); }} className="p-1 text-red-400/60 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              );
              })}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Help Message */}
              {helpMessage && (
                <div className={cn(
                  "mb-3 px-3 py-2 rounded-lg text-xs text-center animate-in fade-in slide-in-from-top-2 duration-300 flex items-center justify-center gap-2",
                  helpMessage.includes('✅') 
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300" 
                    : "bg-violet-500/20 border border-violet-500/30 text-violet-300"
                )}>
                  {helpMessage}
                </div>
              )}

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
              {currentLayer.type === 'text' && <Type className="h-3 w-3" />}
              {currentLayer.type === 'image' && <ImagePlus className="h-3 w-3" />}
              {currentLayer.type === 'shape' && <Square className="h-3 w-3" />}
              {currentLayer.type === 'background' && <PaintBucket className="h-3 w-3" />}
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
              <div className="flex gap-2 items-center">
                <Input value={currentLayer.text} onChange={(e) => updateLayer(selectedLayer, { text: e.target.value })} className="bg-white/5 border-white/10 text-white text-sm h-8 flex-1" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 px-2 h-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white/70 text-xs transition-colors min-w-[100px]">
                      <Type className="h-3 w-3" />
                      <span className="truncate flex-1 text-left" style={{ fontFamily: currentLayer.fontFamily }}>{FONTS.find(f => f.family === currentLayer.fontFamily)?.name || 'Police'}</span>
                      <ChevronDownIcon className="h-3 w-3 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-white/10 max-h-64 overflow-y-auto w-48">
                    {FONTS.map(font => (
                      <DropdownMenuItem 
                        key={font.id} 
                        onClick={() => updateLayer(selectedLayer, { fontFamily: font.family })}
                        className={cn(
                          "text-white/70 hover:text-white hover:bg-white/10 cursor-pointer",
                          currentLayer.fontFamily === font.family && "bg-violet-500/20 text-violet-300"
                        )}
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-white/40 text-xs w-10">{language === 'fr' ? 'Taille' : 'Size'}</span>
                <div className="flex-1">
                  <Slider value={[currentLayer.fontSize]} onValueChange={([v]) => updateLayer(selectedLayer, { fontSize: v })} min={12} max={120} step={1} />
                </div>
                <span className="text-white/50 text-xs w-12">{currentLayer.fontSize}px</span>
              </div>
              {/* Font Weight */}
              <div className="flex gap-2 items-center">
                <span className="text-white/40 text-xs w-10">{language === 'fr' ? 'Poids' : 'Weight'}</span>
                <div className="flex-1">
                  <Slider value={[currentLayer.fontWeight || 400]} onValueChange={([v]) => updateLayer(selectedLayer, { fontWeight: v, bold: v >= 600 })} min={100} max={900} step={100} />
                </div>
                <span className="text-white/50 text-xs w-12">{currentLayer.fontWeight || 400}</span>
              </div>
              {/* Letter Spacing */}
              <div className="flex gap-2 items-center">
                <span className="text-white/40 text-xs w-10">{language === 'fr' ? 'Espac.' : 'Space'}</span>
                <div className="flex-1">
                  <Slider value={[currentLayer.letterSpacing || 0]} onValueChange={([v]) => updateLayer(selectedLayer, { letterSpacing: v })} min={-5} max={20} step={0.5} />
                </div>
                <span className="text-white/50 text-xs w-12">{currentLayer.letterSpacing || 0}px</span>
              </div>
              <div className="flex gap-1 flex-wrap">
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

          {currentLayer.type === 'image' && (
              <div className="space-y-2">
                <div className="flex gap-3 items-center flex-wrap">
                  <div className="flex-1 min-w-[100px]">
                    <label className="text-white/50 text-[10px]">{language === 'fr' ? 'Largeur' : 'W'}</label>
                    <Slider value={[currentLayer.width]} onValueChange={([v]) => updateLayer(selectedLayer, { width: v })} min={20} max={canvasSize.width} step={1} />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="text-white/50 text-[10px]">{language === 'fr' ? 'Hauteur' : 'H'}</label>
                    <Slider value={[currentLayer.height]} onValueChange={([v]) => updateLayer(selectedLayer, { height: v })} min={20} max={canvasSize.height} step={1} />
                  </div>
                </div>
                
                {/* Effects */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <p className="text-white/40 text-xs">{language === 'fr' ? 'Effets:' : 'Effects:'}</p>
                  <div className="grid grid-cols-4 gap-1">
                    <button onClick={() => updateLayer(selectedLayer, { stroke: !currentLayer.stroke })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.stroke ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>
                      {language === 'fr' ? 'Bordure' : 'Border'}
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
                  </div>
                  
                  {/* Border options */}
                  {currentLayer.stroke && (
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Bordure:' : 'Border:'}</span>
                        <input type="color" value={currentLayer.strokeColor || '#000000'} onChange={(e) => updateLayer(selectedLayer, { strokeColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                        <Slider value={[currentLayer.strokeWidth || 2]} onValueChange={([v]) => updateLayer(selectedLayer, { strokeWidth: v })} min={1} max={20} step={1} className="flex-1" />
                        <span className="text-white/40 text-xs w-6">{currentLayer.strokeWidth || 2}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Radius:' : 'Radius:'}</span>
                        <Slider value={[currentLayer.borderRadius || 0]} onValueChange={([v]) => updateLayer(selectedLayer, { borderRadius: v })} min={0} max={100} step={1} className="flex-1" />
                        <span className="text-white/40 text-xs w-6">{currentLayer.borderRadius || 0}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Shadow options */}
                  {currentLayer.shadow && (
                    <div className="flex gap-2 items-center">
                      <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Ombre:' : 'Shadow:'}</span>
                      <input type="color" value={currentLayer.shadowColor || '#000000'} onChange={(e) => updateLayer(selectedLayer, { shadowColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                      <Slider value={[currentLayer.shadowBlur || 10]} onValueChange={([v]) => updateLayer(selectedLayer, { shadowBlur: v })} min={5} max={50} step={1} className="flex-1" />
                      <span className="text-white/40 text-xs w-6">{currentLayer.shadowBlur || 10}</span>
                    </div>
                  )}
                  
                  {/* Glow options */}
                  {currentLayer.glow && (
                    <div className="flex gap-2 items-center">
                      <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Lueur:' : 'Glow:'}</span>
                      <input type="color" value={currentLayer.glowColor || '#ffffff'} onChange={(e) => updateLayer(selectedLayer, { glowColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                      <Slider value={[currentLayer.glowSize || 10]} onValueChange={([v]) => updateLayer(selectedLayer, { glowSize: v })} min={5} max={40} step={1} className="flex-1" />
                      <span className="text-white/40 text-xs w-6">{currentLayer.glowSize || 10}</span>
                    </div>
                  )}
                  
                  {/* Halo options */}
                  {currentLayer.halo && (
                    <div className="flex gap-2 items-center">
                      <span className="text-white/40 text-xs w-16">Halo:</span>
                      <input type="color" value={currentLayer.haloColor || '#FFD700'} onChange={(e) => updateLayer(selectedLayer, { haloColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                      <Slider value={[currentLayer.haloSize || 15]} onValueChange={([v]) => updateLayer(selectedLayer, { haloSize: v })} min={5} max={50} step={1} className="flex-1" />
                      <span className="text-white/40 text-xs w-6">{currentLayer.haloSize || 15}</span>
                    </div>
                  )}
                </div>
                
              </div>
            )}

            {currentLayer.type === 'shape' && (
            <div className="space-y-2">
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
                                <div className="flex gap-1 flex-wrap">
                                  {PRESET_COLORS.map(color => (
                                    <button key={color} onClick={() => updateLayer(selectedLayer, { color })} className={cn("w-5 h-5 rounded-full border-2 transition-transform hover:scale-110", currentLayer.color === color ? "border-violet-400" : "border-transparent")} style={{ backgroundColor: color }} />
                                  ))}
                                  <input type="color" value={currentLayer.color} onChange={(e) => updateLayer(selectedLayer, { color: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                                </div>
                              )}
              </div>
              {currentLayer.type === 'shape' && (
                <>
                  <div className="flex gap-2 items-center">
                    <RotateCw className="h-3 w-3 text-white/50" />
                    <label className="text-white/50 text-xs">{language === 'fr' ? 'Rotation' : 'Rotation'}</label>
                    <div className="flex-1">
                      <Slider value={[currentLayer.rotation || 0]} onValueChange={([v]) => updateLayer(selectedLayer, { rotation: v })} min={0} max={360} step={1} />
                    </div>
                    <span className="text-white/50 text-xs w-10">{currentLayer.rotation || 0}°</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <p className="text-white/40 text-xs">{language === 'fr' ? 'Effets:' : 'Effects:'}</p>
                    <div className="grid grid-cols-3 gap-1">
                      <button onClick={() => updateLayer(selectedLayer, { stroke: !currentLayer.stroke })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.stroke ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>
                        {language === 'fr' ? 'Bordure' : 'Border'}
                      </button>
                      <button onClick={() => updateLayer(selectedLayer, { shadow: !currentLayer.shadow })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.shadow ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>
                        {language === 'fr' ? 'Ombre' : 'Shadow'}
                      </button>
                      <button onClick={() => updateLayer(selectedLayer, { glow: !currentLayer.glow })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.glow ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>
                        {language === 'fr' ? 'Lueur' : 'Glow'}
                      </button>
                    </div>
                    {currentLayer.stroke && (
                      <div className="flex gap-2 items-center">
                        <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Bordure:' : 'Border:'}</span>
                        <input type="color" value={currentLayer.strokeColor || '#000000'} onChange={(e) => updateLayer(selectedLayer, { strokeColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                        <Slider value={[currentLayer.strokeWidth || 2]} onValueChange={([v]) => updateLayer(selectedLayer, { strokeWidth: v })} min={1} max={20} step={1} className="flex-1" />
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
                  </div>
                </>
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
          <p className="text-white/40 text-xs px-1 flex items-center gap-1 mb-2"><FolderOpen className="h-3 w-3" />{language === 'fr' ? 'Ma bibliothèque' : 'My library'}</p>
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

      {/* Custom Texture Generator Modal */}
              <Dialog open={showTextureGenerator} onOpenChange={setShowTextureGenerator}>
                <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Brush className="h-5 w-5 text-violet-400" />{language === 'fr' ? 'Générer une texture IA' : 'Generate AI texture'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea value={texturePrompt} onChange={(e) => setTexturePrompt(e.target.value)} placeholder={language === 'fr' ? 'Décrivez la texture souhaitée (ex: marbre blanc veiné, bois de chêne, métal brossé...)' : 'Describe the texture you want (ex: veined white marble, oak wood, brushed metal...)'}
                      className="bg-white/5 border-white/10 text-white min-h-[100px]" />
                    <Button onClick={generateCustomTexture} disabled={generatingCustomTexture || !texturePrompt.trim()} className="w-full bg-gradient-to-r from-violet-600 to-purple-600">
                      {generatingCustomTexture ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      {language === 'fr' ? 'Générer' : 'Generate'}
                    </Button>
                    {generatedTexture && (
                      <div className="space-y-3">
                        <img src={generatedTexture} alt="Generated texture" className="w-full rounded-lg" />
                        <div className="flex gap-2">
                          <Button onClick={() => addTextureToCanvas(false)} className="flex-1 bg-violet-600 hover:bg-violet-700">
                            <Plus className="h-4 w-4 mr-1" />{language === 'fr' ? 'Utiliser' : 'Use'}
                          </Button>
                          {user && (
                            <Button onClick={() => addTextureToCanvas(true)} className="flex-1 bg-amber-600 hover:bg-amber-700">
                              <Bookmark className="h-4 w-4 mr-1" />{language === 'fr' ? 'Sauvegarder' : 'Save'}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

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

      {/* Service Unavailable Modal */}
      <ServiceUnavailableModal 
        isOpen={showServiceUnavailable} 
        onClose={() => setShowServiceUnavailable(false)} 
        user={user}
        errorType={serviceErrorType}
      />

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