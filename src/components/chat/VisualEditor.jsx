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
  PaintBucket, RotateCw, Upload, ChevronDown as ChevronDownIcon, Scissors
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

export default function VisualEditor({ visual, onSave, onClose, onCancel }) {
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
  const [guides, setGuides] = useState({ showVertical: false, showHorizontal: false }); // Center guides
  const [textAccordion, setTextAccordion] = useState('properties'); // 'properties' or 'effects'
  const [textToolExpanded, setTextToolExpanded] = useState(false); // Expansion de l'outil texte
  
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
  const [stylizingText, setStylizingText] = useState(false);
  
  // Image upload
  const [uploadingUserImage, setUploadingUserImage] = useState(false);
  const [removingBgFromLayer, setRemovingBgFromLayer] = useState(false);
  const [showServiceUnavailable, setShowServiceUnavailable] = useState(false);
  const [serviceErrorType, setServiceErrorType] = useState(null);
  
  // Eraser tool
  const [isErasing, setIsErasing] = useState(false);
  const [eraserSize, setEraserSize] = useState(30);
  const [erasedStrokes, setErasedStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Brush tool
  const [isBrushing, setIsBrushing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [brushColor, setBrushColor] = useState('#FFFFFF');
  const [brushHardness, setBrushHardness] = useState(80);
  const [brushStrokes, setBrushStrokes] = useState([]);
  const [currentBrushStroke, setCurrentBrushStroke] = useState([]);

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
        }
        // Note: Image preloading is now handled in the other useEffect that sets imageLoaded
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
        
        // If we have saved layers, preload their images first
        if (visual.editor_layers && Array.isArray(visual.editor_layers) && visual.editor_layers.length > 0) {
          // Preload all image URLs from layers
          const imageUrls = [];
          visual.editor_layers.forEach(layer => {
            if (layer.type === 'image' && layer.imageUrl) {
              imageUrls.push(layer.imageUrl);
            }
            if (layer.type === 'background' && layer.bgType === 'image' && layer.bgValue) {
              imageUrls.push(layer.bgValue);
            }
          });
          
          // Load all images
          let loadedCount = 0;
          const totalToLoad = imageUrls.length;
          
          if (totalToLoad === 0) {
            // No images to load, just set canvas size from dimensions
            if (visual.dimensions) {
              const [metaW, metaH] = visual.dimensions.split('x').map(Number);
              if (metaW && metaH) {
                const isPortrait = metaH > metaW;
                const maxWidth = isPortrait ? 280 : 450;
                const maxHeight = isPortrait ? 450 : 350;
                const ratio = Math.min(maxWidth / metaW, maxHeight / metaH);
                setCanvasSize({
                  width: Math.round(metaW * ratio),
                  height: Math.round(metaH * ratio)
                });
              }
            }
            setImageLoaded(true);
            return;
          }
          
          imageUrls.forEach(url => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              setLoadedImages(prev => ({ ...prev, [url]: img }));
              loadedCount++;
              
              // When all images are loaded, set canvas size and mark as loaded
              if (loadedCount === totalToLoad) {
                // Use dimensions from metadata
                if (visual.dimensions) {
                  const [metaW, metaH] = visual.dimensions.split('x').map(Number);
                  if (metaW && metaH) {
                    const isPortrait = metaH > metaW;
                    const maxWidth = isPortrait ? 280 : 450;
                    const maxHeight = isPortrait ? 450 : 350;
                    const ratio = Math.min(maxWidth / metaW, maxHeight / metaH);
                    setCanvasSize({
                      width: Math.round(metaW * ratio),
                      height: Math.round(metaH * ratio)
                    });
                  }
                } else {
                  // Fallback: use first image dimensions
                  const firstImg = loadedImages[imageUrls[0]] || img;
                  const isPortrait = firstImg.height > firstImg.width;
                  const maxWidth = isPortrait ? 280 : 450;
                  const maxHeight = isPortrait ? 450 : 350;
                  const ratio = Math.min(maxWidth / firstImg.width, maxHeight / firstImg.height);
                  setCanvasSize({
                    width: Math.round(firstImg.width * ratio),
                    height: Math.round(firstImg.height * ratio)
                  });
                }
                setImageLoaded(true);
              }
            };
            img.onerror = () => {
              console.error('Failed to load image:', url);
              loadedCount++;
              if (loadedCount === totalToLoad) {
                setImageLoaded(true);
              }
            };
            img.src = url;
          });
          return;
        }
        
        // No saved layers - load base image and create initial layer
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Use metadata dimensions if available (user-selected format like story)
          // Otherwise fall back to image natural dimensions
          let targetWidth = img.width;
          let targetHeight = img.height;
          
          if (visual.dimensions) {
            const [metaW, metaH] = visual.dimensions.split('x').map(Number);
            if (metaW && metaH) {
              targetWidth = metaW;
              targetHeight = metaH;
            }
          }

          // Scale down for display while maintaining the target aspect ratio
          const isPortrait = targetHeight > targetWidth;
          const maxWidth = isPortrait ? 280 : 450;
          const maxHeight = isPortrait ? 450 : 350;
          
          const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
          const displayWidth = Math.round(targetWidth * ratio);
          const displayHeight = Math.round(targetHeight * ratio);
          
          // Calculate how to crop/position the image to fill the canvas (like object-fit: cover)
          const imgRatio = img.width / img.height;
          const canvasRatio = displayWidth / displayHeight;
          
          let drawWidth, drawHeight, drawX, drawY;
          if (imgRatio > canvasRatio) {
            // Image is wider - crop horizontally
            drawHeight = displayHeight;
            drawWidth = displayHeight * imgRatio;
            drawX = (displayWidth - drawWidth) / 2;
            drawY = 0;
          } else {
            // Image is taller - crop vertically
            drawWidth = displayWidth;
            drawHeight = displayWidth / imgRatio;
            drawX = 0;
            drawY = (displayHeight - drawHeight) / 2;
          }
          
          console.log('Visual dimensions (metadata):', visual.dimensions);
          console.log('Image natural size:', img.width, 'x', img.height);
          console.log('Canvas size:', displayWidth, 'x', displayHeight);
          
          setCanvasSize({
            width: displayWidth,
            height: displayHeight
          });
          
          // Store the loaded image
          setLoadedImages(prev => ({ ...prev, [baseUrl]: img }));
          
          // Create the base image as a movable layer
          const baseImageLayer = {
            type: 'image',
            imageUrl: baseUrl,
            x: Math.round(drawX),
            y: Math.round(drawY),
            width: Math.round(drawWidth),
            height: Math.round(drawHeight),
            opacity: 100,
            isBaseImage: true // Mark as the original generated image
          };
          setLayers([baseImageLayer]);
          setSelectedLayer(0);
          
          setImageLoaded(true);
        };
        img.src = baseUrl;
      }, [visual.original_image_url, visual.image_url, visual.dimensions, visual.editor_layers]);

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
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

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
          
          // Apply eraser strokes (using destination-out composite)
          if (erasedStrokes.length > 0 || currentStroke.length > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = eraserSize;
            
            // Draw all finished strokes
            erasedStrokes.forEach(stroke => {
              if (stroke.length > 1) {
                ctx.beginPath();
                ctx.moveTo(stroke[0].x, stroke[0].y);
                for (let i = 1; i < stroke.length; i++) {
                  ctx.lineTo(stroke[i].x, stroke[i].y);
                }
                ctx.stroke();
              }
            });
            
            // Draw current stroke
            if (currentStroke.length > 1) {
              ctx.beginPath();
              ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
              for (let i = 1; i < currentStroke.length; i++) {
                ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
              }
              ctx.stroke();
            }
            
            ctx.restore();
          }

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
              // Use roundRect for rectangle with border radius
              if (layer.shape === 'rectangle' && layer.borderRadius > 0) {
                ctx.beginPath();
                ctx.roundRect(layer.x, layer.y, layer.width, layer.height, layer.borderRadius);
                ctx.fill();
                if (layer.stroke) {
                  ctx.strokeStyle = layer.strokeColor || '#000000';
                  ctx.lineWidth = layer.strokeWidth || 2;
                  ctx.stroke();
                }
              } else {
                drawShape(ctx, layer.shape, layer.x, layer.y, layer.width, layer.height);
                ctx.fill();
                if (layer.stroke) {
                  ctx.strokeStyle = layer.strokeColor || '#000000';
                  ctx.lineWidth = layer.strokeWidth || 2;
                  ctx.stroke();
                }
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
          
          // Apply rotation if set
          if (layer.rotation) {
            ctx.translate(layer.x, layer.y);
            ctx.rotate((layer.rotation || 0) * Math.PI / 180);
            ctx.translate(-layer.x, -layer.y);
          }
          
          // Helper function to wrap text
          const wrapText = (text, maxWidth) => {
            if (!maxWidth || maxWidth <= 0) return [text];
            const words = text.split(' ');
            const lines = [];
            let currentLine = '';
            
            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            }
            if (currentLine) lines.push(currentLine);
            return lines;
          };
          
          // Draw curved text if enabled
          if (layer.curvedText) {
            const radius = layer.curveRadius || 100;
            const text = layer.text;
            const centerX = layer.x;
            const centerY = layer.y + radius; // Position center below text position
            const curveDirection = layer.curveDirection || 'top'; // 'top' or 'bottom'
            
            // Reset text align for curved text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Calculate the total arc length needed for the text
            let totalWidth = 0;
            const charWidths = [];
            for (let i = 0; i < text.length; i++) {
              const w = ctx.measureText(text[i]).width;
              charWidths.push(w);
              totalWidth += w;
            }
            
            // Calculate angle per character based on arc
            const totalAngle = totalWidth / radius;
            const startAngle = curveDirection === 'top' 
              ? -Math.PI / 2 - totalAngle / 2
              : Math.PI / 2 - totalAngle / 2;
            
            let currentAngle = startAngle;
            
            for (let i = 0; i < text.length; i++) {
              const char = text[i];
              const charWidth = charWidths[i];
              const halfCharAngle = (charWidth / 2) / radius;
              
              currentAngle += halfCharAngle;
              
              const charX = centerX + Math.cos(currentAngle) * radius;
              const charY = centerY + Math.sin(currentAngle) * radius;
              
              ctx.save();
              ctx.translate(charX, charY);
              
              // Rotate character to follow the curve
              if (curveDirection === 'top') {
                ctx.rotate(currentAngle + Math.PI / 2);
              } else {
                ctx.rotate(currentAngle - Math.PI / 2);
              }
              
              // Apply effects to curved text
              if (layer.shadow && !layer.glow && !layer.neon) {
                ctx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.6)';
                ctx.shadowBlur = layer.shadowBlur || 6;
                ctx.shadowOffsetX = layer.shadowOffsetX || 3;
                ctx.shadowOffsetY = layer.shadowOffsetY || 3;
              }
              
              if (layer.glow) {
                ctx.shadowColor = layer.glowColor || '#ffffff';
                ctx.shadowBlur = layer.glowSize || 10;
              }
              
              if (layer.stroke) {
                ctx.strokeStyle = layer.strokeColor || '#000000';
                ctx.lineWidth = layer.strokeWidth || 2;
                ctx.strokeText(char, 0, 0);
              }
              
              ctx.fillStyle = layer.color;
              ctx.fillText(char, 0, 0);
              ctx.restore();
              
              currentAngle += halfCharAngle;
            }
          } else {
            // Normal text rendering (with multi-line support)
            const lines = wrapText(layer.text, layer.maxWidth || 0);
            const lineHeight = layer.fontSize * 1.2;
            const totalHeight = lines.length * lineHeight;
            const startY = layer.y - (lines.length - 1) * lineHeight / 2;
            
            // 3D Effect (draw multiple offset layers)
            if (layer.effect3d) {
              const depth = 6;
              for (let i = depth; i > 0; i--) {
                ctx.fillStyle = `rgba(0,0,0,${0.3 - i * 0.04})`;
                lines.forEach((line, lineIdx) => {
                  ctx.fillText(line, layer.x + i, startY + lineIdx * lineHeight + i);
                });
              }
              ctx.fillStyle = layer.color;
            }
            
            // Text Gradient Effect
            if (layer.textGradient) {
              const metrics = ctx.measureText(lines[0] || layer.text);
              const textWidth = layer.maxWidth || metrics.width;
              const textHeight = totalHeight;
              const textX = layer.x - (layer.align === 'center' ? textWidth/2 : layer.align === 'right' ? textWidth : 0);
              
              let gradient;
              if (layer.gradientDirection === 'vertical') {
                gradient = ctx.createLinearGradient(textX, startY - layer.fontSize, textX, startY + totalHeight);
              } else {
                gradient = ctx.createLinearGradient(textX, startY, textX + textWidth, startY);
              }
              gradient.addColorStop(0, layer.gradientColor1 || '#ff00ff');
              gradient.addColorStop(1, layer.gradientColor2 || '#00ffff');
              ctx.fillStyle = gradient;
            }
            
            // Halo effect (golden glow behind)
            if (layer.halo) {
              ctx.save();
              ctx.shadowColor = layer.haloColor || '#FFD700';
              ctx.shadowBlur = layer.haloSize || 15;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              ctx.fillStyle = layer.haloColor || '#FFD700';
              lines.forEach((line, lineIdx) => {
                ctx.fillText(line, layer.x, startY + lineIdx * lineHeight);
                ctx.fillText(line, layer.x, startY + lineIdx * lineHeight);
              });
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
              lines.forEach((line, lineIdx) => {
                ctx.fillText(line, layer.x, startY + lineIdx * lineHeight);
              });
              ctx.shadowBlur = intensity * 2;
              lines.forEach((line, lineIdx) => {
                ctx.fillText(line, layer.x, startY + lineIdx * lineHeight);
              });
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
              ctx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.6)';
              ctx.shadowBlur = layer.shadowBlur || 6;
              ctx.shadowOffsetX = layer.shadowOffsetX || 3;
              ctx.shadowOffsetY = layer.shadowOffsetY || 3;
            }
            
            // Stroke
            if (layer.stroke) {
              ctx.strokeStyle = layer.strokeColor || '#000000';
              ctx.lineWidth = layer.strokeWidth || 2;
              lines.forEach((line, lineIdx) => {
                ctx.strokeText(line, layer.x, startY + lineIdx * lineHeight);
              });
            }

            lines.forEach((line, lineIdx) => {
              ctx.fillText(line, layer.x, startY + lineIdx * lineHeight);
            });

            // Sparkle effect (stars and dots around text)
            if (layer.sparkle) {
              const intensity = layer.sparkleIntensity || 50;
              const numSparkles = Math.floor(intensity / 5);
              const metrics = ctx.measureText(layer.text);
              const textWidth = metrics.width;
              const textHeight = layer.fontSize;
              const textX = layer.x - (layer.align === 'center' ? textWidth/2 : layer.align === 'right' ? textWidth : 0);
              
              // Use consistent random seed based on text for stable sparkle positions
              const seed = layer.text.length + layer.fontSize;
              const seededRandom = (i) => {
                const x = Math.sin(seed * 9999 + i * 12345) * 10000;
                return x - Math.floor(x);
              };
              
              for (let i = 0; i < numSparkles; i++) {
                const angle = seededRandom(i) * Math.PI * 2;
                const distance = 10 + seededRandom(i + 100) * (30 + intensity * 0.3);
                const sparkleX = textX + textWidth/2 + Math.cos(angle) * distance + (seededRandom(i + 200) - 0.5) * textWidth;
                const sparkleY = layer.y - textHeight/2 + Math.sin(angle) * distance + (seededRandom(i + 300) - 0.5) * textHeight;
                const size = 1 + seededRandom(i + 400) * 3;
                const opacity = 0.4 + seededRandom(i + 500) * 0.6;
                
                ctx.save();
                ctx.globalAlpha = opacity * (layer.opacity / 100);
                ctx.fillStyle = '#FFFFFF';
                
                // Draw star or dot
                if (seededRandom(i + 600) > 0.5) {
                  // 4-pointed star
                  ctx.beginPath();
                  const starSize = size * 1.5;
                  ctx.moveTo(sparkleX, sparkleY - starSize);
                  ctx.lineTo(sparkleX + starSize * 0.3, sparkleY - starSize * 0.3);
                  ctx.lineTo(sparkleX + starSize, sparkleY);
                  ctx.lineTo(sparkleX + starSize * 0.3, sparkleY + starSize * 0.3);
                  ctx.lineTo(sparkleX, sparkleY + starSize);
                  ctx.lineTo(sparkleX - starSize * 0.3, sparkleY + starSize * 0.3);
                  ctx.lineTo(sparkleX - starSize, sparkleY);
                  ctx.lineTo(sparkleX - starSize * 0.3, sparkleY - starSize * 0.3);
                  ctx.closePath();
                  ctx.fill();
                } else {
                  // Simple dot with glow
                  ctx.shadowColor = '#FFFFFF';
                  ctx.shadowBlur = size * 2;
                  ctx.beginPath();
                  ctx.arc(sparkleX, sparkleY, size, 0, Math.PI * 2);
                  ctx.fill();
                }
                ctx.restore();
              }
            }

            // Reflection effect (water reflection below text with fade)
            if (layer.reflection) {
              ctx.save();

              const textHeight = layer.fontSize;
              const reflectionGap = 4;
              const reflectY = layer.y + reflectionGap;
              const reflectionHeight = textHeight * 1.2;

              // Create a temporary canvas for the reflection with gradient fade
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = canvasSize.width;
              tempCanvas.height = reflectionHeight + 20;
              const tempCtx = tempCanvas.getContext('2d');

              // Draw flipped text on temp canvas
              tempCtx.save();
              tempCtx.font = ctx.font;
              tempCtx.textAlign = layer.align || 'left';
              tempCtx.fillStyle = layer.color;

              // Flip vertically
              tempCtx.translate(0, reflectionHeight);
              tempCtx.scale(1, -1);

              if (layer.stroke) {
                tempCtx.strokeStyle = layer.strokeColor || '#000000';
                tempCtx.lineWidth = layer.strokeWidth || 2;
                tempCtx.strokeText(layer.text, layer.x, textHeight - 5);
              }
              tempCtx.fillText(layer.text, layer.x, textHeight - 5);
              tempCtx.restore();

              // Apply fade gradient mask
              tempCtx.globalCompositeOperation = 'destination-out';
              const fadeGradient = tempCtx.createLinearGradient(0, 0, 0, reflectionHeight);
              fadeGradient.addColorStop(0, 'rgba(0,0,0,0)');
              fadeGradient.addColorStop(0.3, 'rgba(0,0,0,0.3)');
              fadeGradient.addColorStop(1, 'rgba(0,0,0,1)');
              tempCtx.fillStyle = fadeGradient;
              tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

              // Draw the reflection on main canvas
              ctx.globalAlpha = (layer.opacity / 100) * (layer.reflectionOpacity || 40) / 100;
              ctx.drawImage(tempCanvas, 0, reflectY);

              ctx.restore();
            }
            }
            }
            
            ctx.restore();
          });
          
          // Apply brush strokes
          if (brushStrokes.length > 0 || currentBrushStroke.length > 0) {
            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            brushStrokes.forEach(stroke => {
              if (stroke.points.length > 1) {
                ctx.lineWidth = stroke.size;
                ctx.strokeStyle = stroke.color;
                
                // Apply hardness by using shadow blur (soft edges)
                if (stroke.hardness < 100) {
                  ctx.shadowColor = stroke.color;
                  ctx.shadowBlur = (100 - stroke.hardness) / 10;
                }
                
                ctx.beginPath();
                ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                for (let i = 1; i < stroke.points.length; i++) {
                  ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
                }
                ctx.stroke();
              }
            });
            
            if (currentBrushStroke.length > 1) {
              ctx.lineWidth = brushSize;
              ctx.strokeStyle = brushColor;
              
              if (brushHardness < 100) {
                ctx.shadowColor = brushColor;
                ctx.shadowBlur = (100 - brushHardness) / 10;
              }
              
              ctx.beginPath();
              ctx.moveTo(currentBrushStroke[0].x, currentBrushStroke[0].y);
              for (let i = 1; i < currentBrushStroke.length; i++) {
                ctx.lineTo(currentBrushStroke[i].x, currentBrushStroke[i].y);
              }
              ctx.stroke();
            }
            
            ctx.restore();
          }
          
          // Apply eraser effect (destination-out to erase pixels)
          if (erasedStrokes.length > 0 || currentStroke.length > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = eraserSize;
            
            erasedStrokes.forEach(stroke => {
              if (stroke.length > 1) {
                ctx.beginPath();
                ctx.moveTo(stroke[0].x, stroke[0].y);
                for (let i = 1; i < stroke.length; i++) {
                  ctx.lineTo(stroke[i].x, stroke[i].y);
                }
                ctx.stroke();
              }
            });
            
            if (currentStroke.length > 1) {
              ctx.beginPath();
              ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
              for (let i = 1; i < currentStroke.length; i++) {
                ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
              }
              ctx.stroke();
            }
            
            ctx.restore();
          }
          
          // Draw selection indicators
          layers.forEach((layer, idx) => {
            ctx.save();
            
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
      }, [imageLoaded, layers, selectedLayer, loadedImages, bgType, bgColor, bgGradient, erasedStrokes, currentStroke, eraserSize, brushStrokes, currentBrushStroke, brushSize, brushColor, brushHardness]);

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
      strokeWidth: 2,
      maxWidth: 0 // 0 = auto (no wrap), >0 = wrap text at this width
    };
    setLayers([...layers, newLayer]);
    setSelectedLayer(layers.length);
    setActiveTab('layers');
    showHelp(language === 'fr' ? '💡 Glissez le texte sur l\'image. Options de style en bas.' : '💡 Drag text on image. Style options below.');
  };

  const addShapeLayer = (shape) => {
    const newLayer = { type: 'shape', shape, x: canvasSize.width / 2 - 50, y: canvasSize.height / 2 - 50, width: 100, height: 100, color: '#FFFFFF', opacity: 80, stroke: false, strokeColor: '#000000', strokeWidth: 2, rotation: 0, shadow: false, glow: false, glowColor: '#ffffff', glowSize: 10, borderRadius: 0 };
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

  const stylizeTextWithAI = async () => {
    if (selectedLayer === null || !currentLayer || currentLayer.type !== 'text') return;
    setStylizingText(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un expert en design graphique. Choisis UN style professionnel et moderne pour ce texte: "${currentLayer.text}"
        
Le texte sera affiché sur un visuel de type: ${visual.visual_type || 'design'}

Choisis UN style parmi ces options et donne les valeurs exactes:
- Style "Néon Cyberpunk": neon activé, couleur néon vive (#ff00ff ou #00ffff), fond sombre
- Style "Or Luxe": halo doré (#FFD700), contour fin doré, texte blanc ou noir
- Style "3D Pop": effet 3D activé, couleurs vives, contour contrasté
- Style "Ombre Élégante": ombre portée douce, couleurs neutres ou pastels
- Style "Lueur Moderne": glow blanc ou coloré, texte épuré
- Style "Reflet Premium": reflet activé, couleurs métalliques ou élégantes

Réponds en JSON avec:
- style_name: nom du style choisi
- color: couleur du texte (hex)
- fontSize: taille recommandée (32-80)
- fontWeight: poids (400-900)
- neon: boolean
- neonColor: hex si neon
- neonIntensity: 10-25 si neon
- glow: boolean
- glowColor: hex si glow
- glowSize: 10-30 si glow
- halo: boolean
- haloColor: hex si halo
- haloSize: 10-40 si halo
- effect3d: boolean
- shadow: boolean
- shadowColor: hex si shadow
- shadowBlur: 5-15 si shadow
- stroke: boolean
- strokeColor: hex si stroke
- strokeWidth: 1-4 si stroke
- reflection: boolean
- reflectionOpacity: 30-60 si reflection`,
        response_json_schema: {
          type: 'object',
          properties: {
            style_name: { type: 'string' },
            color: { type: 'string' },
            fontSize: { type: 'number' },
            fontWeight: { type: 'number' },
            neon: { type: 'boolean' },
            neonColor: { type: 'string' },
            neonIntensity: { type: 'number' },
            glow: { type: 'boolean' },
            glowColor: { type: 'string' },
            glowSize: { type: 'number' },
            halo: { type: 'boolean' },
            haloColor: { type: 'string' },
            haloSize: { type: 'number' },
            effect3d: { type: 'boolean' },
            shadow: { type: 'boolean' },
            shadowColor: { type: 'string' },
            shadowBlur: { type: 'number' },
            stroke: { type: 'boolean' },
            strokeColor: { type: 'string' },
            strokeWidth: { type: 'number' },
            reflection: { type: 'boolean' },
            reflectionOpacity: { type: 'number' }
          }
        }
      });

      // Apply the AI-generated style
      const updates = {
        color: result.color || currentLayer.color,
        fontSize: result.fontSize || currentLayer.fontSize,
        fontWeight: result.fontWeight || currentLayer.fontWeight,
        neon: result.neon || false,
        neonColor: result.neonColor,
        neonIntensity: result.neonIntensity,
        glow: result.glow || false,
        glowColor: result.glowColor,
        glowSize: result.glowSize,
        halo: result.halo || false,
        haloColor: result.haloColor,
        haloSize: result.haloSize,
        effect3d: result.effect3d || false,
        shadow: result.shadow || false,
        shadowColor: result.shadowColor,
        shadowBlur: result.shadowBlur,
        stroke: result.stroke || false,
        strokeColor: result.strokeColor,
        strokeWidth: result.strokeWidth,
        reflection: result.reflection || false,
        reflectionOpacity: result.reflectionOpacity
      };

      updateLayer(selectedLayer, updates);
      showHelp(language === 'fr' ? `✨ Style "${result.style_name}" appliqué !` : `✨ "${result.style_name}" style applied!`);
    } catch (e) {
      console.error(e);
      showHelp(language === 'fr' ? '❌ Erreur lors de la stylisation' : '❌ Error during styling');
    }
    setStylizingText(false);
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
    
    // Eraser mode
    if (isErasing) {
      setCurrentStroke([{ x, y }]);
      return;
    }
    
    // Brush mode
    if (isBrushing) {
      setCurrentBrushStroke([{ x, y }]);
      return;
    }
    
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
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Track mouse position for eraser/brush cursor
    if (isErasing || isBrushing) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
    
    // Eraser mode - draw stroke
    if (isErasing && currentStroke.length > 0) {
      setCurrentStroke(prev => [...prev, { x, y }]);
      return;
    }
    
    // Brush mode - draw stroke
    if (isBrushing && currentBrushStroke.length > 0) {
      setCurrentBrushStroke(prev => [...prev, { x, y }]);
      return;
    }
    
    if (dragging === null) return;
    
    let newX = x - dragOffset.x;
    let newY = y - dragOffset.y;
    
    const layer = layers[dragging];
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const snapThreshold = 8;
    
    // Calculate layer center
    let layerCenterX, layerCenterY;
    if (layer.type === 'text') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
      const metrics = ctx.measureText(layer.text);
      const textWidth = metrics.width;
      layerCenterX = layer.align === 'center' ? newX : layer.align === 'right' ? newX - textWidth / 2 : newX + textWidth / 2;
      layerCenterY = newY - layer.fontSize / 2;
    } else {
      layerCenterX = newX + (layer.width || 0) / 2;
      layerCenterY = newY + (layer.height || 0) / 2;
    }
    
    // Check for center alignment and snap
    const isNearVerticalCenter = Math.abs(layerCenterX - centerX) < snapThreshold;
    const isNearHorizontalCenter = Math.abs(layerCenterY - centerY) < snapThreshold;
    
    // Snap to center
    if (isNearVerticalCenter) {
      if (layer.type === 'text') {
        newX = layer.align === 'center' ? centerX : layer.align === 'right' ? centerX + (canvasRef.current.getContext('2d').measureText(layer.text).width / 2) : centerX - (canvasRef.current.getContext('2d').measureText(layer.text).width / 2);
      } else {
        newX = centerX - (layer.width || 0) / 2;
      }
    }
    if (isNearHorizontalCenter) {
      if (layer.type === 'text') {
        newY = centerY + layer.fontSize / 2;
      } else {
        newY = centerY - (layer.height || 0) / 2;
      }
    }
    
    setGuides({ showVertical: isNearVerticalCenter, showHorizontal: isNearHorizontalCenter });
    updateLayer(dragging, { x: newX, y: newY });
  };

  const handleCanvasMouseUp = () => {
    // Eraser mode - finish stroke
    if (isErasing && currentStroke.length > 0) {
      setErasedStrokes(prev => [...prev, currentStroke]);
      setCurrentStroke([]);
      return;
    }
    
    // Brush mode - finish stroke
    if (isBrushing && currentBrushStroke.length > 0) {
      setBrushStrokes(prev => [...prev, { points: currentBrushStroke, color: brushColor, size: brushSize, hardness: brushHardness }]);
      setCurrentBrushStroke([]);
      return;
    }
    
    setDragging(null);
    setGuides({ showVertical: false, showHorizontal: false });
  };
  
  const undoEraser = () => {
    if (erasedStrokes.length > 0) {
      setErasedStrokes(prev => prev.slice(0, -1));
    }
  };
  
  const undoBrush = () => {
    if (brushStrokes.length > 0) {
      setBrushStrokes(prev => prev.slice(0, -1));
    }
  };

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
            // Use roundRect for rectangle with border radius
            if (layer.shape === 'rectangle' && layer.borderRadius > 0) {
              exportCtx.beginPath();
              exportCtx.roundRect(layer.x, layer.y, layer.width, layer.height, layer.borderRadius);
              exportCtx.fill();
              if (layer.stroke) {
                exportCtx.strokeStyle = layer.strokeColor || '#000000';
                exportCtx.lineWidth = layer.strokeWidth || 2;
                exportCtx.stroke();
              }
            } else {
              drawShape(exportCtx, layer.shape, layer.x, layer.y, layer.width, layer.height);
              exportCtx.fill();
              if (layer.stroke) {
                exportCtx.strokeStyle = layer.strokeColor || '#000000';
                exportCtx.lineWidth = layer.strokeWidth || 2;
                exportCtx.stroke();
              }
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
            
            // Helper function to wrap text for export
            const wrapTextExport = (text, maxWidth) => {
              if (!maxWidth || maxWidth <= 0) return [text];
              const words = text.split(' ');
              const lines = [];
              let currentLine = '';
              
              for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const metrics = exportCtx.measureText(testLine);
                if (metrics.width > maxWidth && currentLine) {
                  lines.push(currentLine);
                  currentLine = word;
                } else {
                  currentLine = testLine;
                }
              }
              if (currentLine) lines.push(currentLine);
              return lines;
            };
            
            // Apply rotation if set
            if (layer.rotation && !layer.curvedText) {
              exportCtx.translate(layer.x, layer.y);
              exportCtx.rotate((layer.rotation || 0) * Math.PI / 180);
              exportCtx.translate(-layer.x, -layer.y);
            }
            
            // Draw curved text if enabled
            if (layer.curvedText) {
              const radius = layer.curveRadius || 100;
              const text = layer.text;
              const centerX = layer.x;
              const centerY = layer.y + radius;
              const curveDirection = layer.curveDirection || 'top';
              
              exportCtx.textAlign = 'center';
              exportCtx.textBaseline = 'middle';
              
              let totalWidth = 0;
              const charWidths = [];
              for (let i = 0; i < text.length; i++) {
                const w = exportCtx.measureText(text[i]).width;
                charWidths.push(w);
                totalWidth += w;
              }
              
              const totalAngle = totalWidth / radius;
              const startAngle = curveDirection === 'top' 
                ? -Math.PI / 2 - totalAngle / 2
                : Math.PI / 2 - totalAngle / 2;
              
              let currentAngle = startAngle;
              
              for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const charWidth = charWidths[i];
                const halfCharAngle = (charWidth / 2) / radius;
                
                currentAngle += halfCharAngle;
                
                const charX = centerX + Math.cos(currentAngle) * radius;
                const charY = centerY + Math.sin(currentAngle) * radius;
                
                exportCtx.save();
                exportCtx.translate(charX, charY);
                
                if (curveDirection === 'top') {
                  exportCtx.rotate(currentAngle + Math.PI / 2);
                } else {
                  exportCtx.rotate(currentAngle - Math.PI / 2);
                }
                
                if (layer.shadow && !layer.glow && !layer.neon) {
                  exportCtx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.6)';
                  exportCtx.shadowBlur = layer.shadowBlur || 6;
                  exportCtx.shadowOffsetX = layer.shadowOffsetX || 3;
                  exportCtx.shadowOffsetY = layer.shadowOffsetY || 3;
                }
                
                if (layer.glow) {
                  exportCtx.shadowColor = layer.glowColor || '#ffffff';
                  exportCtx.shadowBlur = layer.glowSize || 10;
                }
                
                if (layer.stroke) {
                  exportCtx.strokeStyle = layer.strokeColor || '#000000';
                  exportCtx.lineWidth = layer.strokeWidth || 2;
                  exportCtx.strokeText(char, 0, 0);
                }
                
                exportCtx.fillStyle = layer.color;
                exportCtx.fillText(char, 0, 0);
                exportCtx.restore();
                
                currentAngle += halfCharAngle;
              }
            } else {
              // Normal text rendering (with multi-line support for export)
              const linesExport = wrapTextExport(layer.text, layer.maxWidth || 0);
              const lineHeightExport = layer.fontSize * 1.2;
              const totalHeightExport = linesExport.length * lineHeightExport;
              const startYExport = layer.y - (linesExport.length - 1) * lineHeightExport / 2;
              
              if (layer.effect3d) {
                const depth = 6;
                for (let i = depth; i > 0; i--) {
                  exportCtx.fillStyle = `rgba(0,0,0,${0.3 - i * 0.04})`;
                  linesExport.forEach((line, lineIdx) => {
                    exportCtx.fillText(line, layer.x + i, startYExport + lineIdx * lineHeightExport + i);
                  });
                }
                exportCtx.fillStyle = layer.color;
              }
              
              // Text Gradient Effect (export)
              if (layer.textGradient) {
                const metrics = exportCtx.measureText(linesExport[0] || layer.text);
                const textWidth = layer.maxWidth || metrics.width;
                const textX = layer.x - (layer.align === 'center' ? textWidth/2 : layer.align === 'right' ? textWidth : 0);
                
                let gradient;
                if (layer.gradientDirection === 'vertical') {
                  gradient = exportCtx.createLinearGradient(textX, startYExport - layer.fontSize, textX, startYExport + totalHeightExport);
                } else {
                  gradient = exportCtx.createLinearGradient(textX, startYExport, textX + textWidth, startYExport);
                }
                gradient.addColorStop(0, layer.gradientColor1 || '#ff00ff');
                gradient.addColorStop(1, layer.gradientColor2 || '#00ffff');
                exportCtx.fillStyle = gradient;
              }
              
              if (layer.halo) {
                exportCtx.save();
                exportCtx.shadowColor = layer.haloColor || '#FFD700';
                exportCtx.shadowBlur = layer.haloSize || 15;
                exportCtx.fillStyle = layer.haloColor || '#FFD700';
                linesExport.forEach((line, lineIdx) => {
                  exportCtx.fillText(line, layer.x, startYExport + lineIdx * lineHeightExport);
                  exportCtx.fillText(line, layer.x, startYExport + lineIdx * lineHeightExport);
                });
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
                linesExport.forEach((line, lineIdx) => {
                  exportCtx.fillText(line, layer.x, startYExport + lineIdx * lineHeightExport);
                });
                exportCtx.shadowBlur = intensity * 2;
                linesExport.forEach((line, lineIdx) => {
                  exportCtx.fillText(line, layer.x, startYExport + lineIdx * lineHeightExport);
                });
                exportCtx.restore();
                exportCtx.fillStyle = '#ffffff';
              }
              
              if (layer.glow) {
                exportCtx.shadowColor = layer.glowColor || '#ffffff';
                exportCtx.shadowBlur = layer.glowSize || 10;
              }
              
              if (layer.shadow && !layer.glow && !layer.neon) {
                exportCtx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.6)';
                exportCtx.shadowBlur = layer.shadowBlur || 6;
                exportCtx.shadowOffsetX = layer.shadowOffsetX || 3;
                exportCtx.shadowOffsetY = layer.shadowOffsetY || 3;
              }
              
              if (layer.stroke) {
                exportCtx.strokeStyle = layer.strokeColor || '#000000';
                exportCtx.lineWidth = layer.strokeWidth || 2;
                linesExport.forEach((line, lineIdx) => {
                  exportCtx.strokeText(line, layer.x, startYExport + lineIdx * lineHeightExport);
                });
              }

              linesExport.forEach((line, lineIdx) => {
                exportCtx.fillText(line, layer.x, startYExport + lineIdx * lineHeightExport);
              });

              // Sparkle effect for export
              if (layer.sparkle) {
                const intensity = layer.sparkleIntensity || 50;
                const numSparkles = Math.floor(intensity / 5);
                const metrics = exportCtx.measureText(layer.text);
                const textWidth = metrics.width;
                const textHeight = layer.fontSize;
                const textX = layer.x - (layer.align === 'center' ? textWidth/2 : layer.align === 'right' ? textWidth : 0);
                
                const seed = layer.text.length + layer.fontSize;
                const seededRandom = (i) => {
                  const x = Math.sin(seed * 9999 + i * 12345) * 10000;
                  return x - Math.floor(x);
                };
                
                for (let i = 0; i < numSparkles; i++) {
                  const angle = seededRandom(i) * Math.PI * 2;
                  const distance = 10 + seededRandom(i + 100) * (30 + intensity * 0.3);
                  const sparkleX = textX + textWidth/2 + Math.cos(angle) * distance + (seededRandom(i + 200) - 0.5) * textWidth;
                  const sparkleY = layer.y - textHeight/2 + Math.sin(angle) * distance + (seededRandom(i + 300) - 0.5) * textHeight;
                  const size = 1 + seededRandom(i + 400) * 3;
                  const opacity = 0.4 + seededRandom(i + 500) * 0.6;
                  
                  exportCtx.save();
                  exportCtx.globalAlpha = opacity * (layer.opacity / 100);
                  exportCtx.fillStyle = '#FFFFFF';
                  
                  if (seededRandom(i + 600) > 0.5) {
                    exportCtx.beginPath();
                    const starSize = size * 1.5;
                    exportCtx.moveTo(sparkleX, sparkleY - starSize);
                    exportCtx.lineTo(sparkleX + starSize * 0.3, sparkleY - starSize * 0.3);
                    exportCtx.lineTo(sparkleX + starSize, sparkleY);
                    exportCtx.lineTo(sparkleX + starSize * 0.3, sparkleY + starSize * 0.3);
                    exportCtx.lineTo(sparkleX, sparkleY + starSize);
                    exportCtx.lineTo(sparkleX - starSize * 0.3, sparkleY + starSize * 0.3);
                    exportCtx.lineTo(sparkleX - starSize, sparkleY);
                    exportCtx.lineTo(sparkleX - starSize * 0.3, sparkleY - starSize * 0.3);
                    exportCtx.closePath();
                    exportCtx.fill();
                  } else {
                    exportCtx.shadowColor = '#FFFFFF';
                    exportCtx.shadowBlur = size * 2;
                    exportCtx.beginPath();
                    exportCtx.arc(sparkleX, sparkleY, size, 0, Math.PI * 2);
                    exportCtx.fill();
                  }
                  exportCtx.restore();
                }
              }

              // Reflection effect (water reflection below text with fade) for export
              if (layer.reflection) {
                exportCtx.save();

                const textHeight = layer.fontSize;
                const reflectionGap = 4;
                const reflectY = layer.y + reflectionGap;
                const reflectionHeight = textHeight * 1.2;

                // Create a temporary canvas for the reflection with gradient fade
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvasSize.width;
                tempCanvas.height = reflectionHeight + 20;
                const tempCtx = tempCanvas.getContext('2d');

                // Draw flipped text on temp canvas
                tempCtx.save();
                tempCtx.font = exportCtx.font;
                tempCtx.textAlign = layer.align || 'left';
                tempCtx.fillStyle = layer.color;

                // Flip vertically
                tempCtx.translate(0, reflectionHeight);
                tempCtx.scale(1, -1);

                if (layer.stroke) {
                  tempCtx.strokeStyle = layer.strokeColor || '#000000';
                  tempCtx.lineWidth = layer.strokeWidth || 2;
                  tempCtx.strokeText(layer.text, layer.x, textHeight - 5);
                }
                tempCtx.fillText(layer.text, layer.x, textHeight - 5);
                tempCtx.restore();

                // Apply fade gradient mask
                tempCtx.globalCompositeOperation = 'destination-out';
                const fadeGradient = tempCtx.createLinearGradient(0, 0, 0, reflectionHeight);
                fadeGradient.addColorStop(0, 'rgba(0,0,0,0)');
                fadeGradient.addColorStop(0.3, 'rgba(0,0,0,0.3)');
                fadeGradient.addColorStop(1, 'rgba(0,0,0,1)');
                tempCtx.fillStyle = fadeGradient;
                tempCtx.fillRect(0, 0, canvasSize.width, reflectionHeight + 20);

                // Draw the reflection on main canvas
                exportCtx.globalAlpha = (layer.opacity / 100) * (layer.reflectionOpacity || 40) / 100;
                exportCtx.drawImage(tempCanvas, 0, reflectY);

                exportCtx.restore();
              }
              }
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
                        <Button variant="ghost" size="sm" onClick={() => (onClose || onCancel)?.()} className="text-white/60 hover:text-white hover:bg-white/10 text-xs px-2">
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
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 flex items-center justify-center"
              size="sm"
            >
              {removingBg ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Scissors className="h-4 w-4 mr-2" />}
              {language === 'fr' ? 'Supprimer le fond (1 crédit)' : 'Remove background (1 credit)'}
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
                    <div className="grid grid-cols-8 gap-1">
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
                    <div className="grid grid-cols-8 gap-1">
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
                    <div className="grid grid-cols-8 gap-1.5">
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
                    <div className="grid grid-cols-8 gap-1.5">
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
                <div className="grid grid-cols-8 gap-1.5">
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
                    <div className="grid grid-cols-8 gap-1.5">
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
                    <div className="grid grid-cols-8 gap-1.5">
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
                    <div className="grid grid-cols-8 gap-1.5">
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

              {/* Canvas - Responsive with Vertical Toolbars */}
              <div className="flex items-start gap-3 bg-black/30 rounded-xl p-2 md:p-4 mb-3 overflow-hidden">
        {/* Left Toolbar - Main Tools */}
        <div className="flex flex-col gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
          <button
            onClick={() => setActiveTab('background')}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              activeTab === 'background' ? "bg-violet-500/40 text-white" : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            )}
            title={language === 'fr' ? 'Fond' : 'Background'}
          >
            <PaintBucket className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={cn(
              "p-2.5 rounded-lg transition-all relative",
              activeTab === 'layers' ? "bg-violet-500/40 text-white" : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            )}
            title={language === 'fr' ? 'Calques' : 'Layers'}
          >
            <Layers className="h-5 w-5" />
            {layers.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-emerald-500 rounded-full text-[10px] text-white font-medium flex items-center justify-center">
                {layers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTextToolExpanded(!textToolExpanded)}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              textToolExpanded ? "bg-violet-500/40 text-white" : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            )}
            title={language === 'fr' ? 'Texte' : 'Text'}
          >
            <Type className="h-5 w-5" />
          </button>
          
          {/* Sous-options texte */}
          {textToolExpanded && (
            <>
              <button
                onClick={() => addTextLayer()}
                className="p-2.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 transition-all"
                title={language === 'fr' ? 'Ajouter un texte' : 'Add text'}
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowTextGenerator(true)}
                className="p-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-all"
                title={language === 'fr' ? 'Générer texte IA' : 'Generate AI text'}
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('shapes')}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              activeTab === 'shapes' ? "bg-violet-500/40 text-white" : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            )}
            title={language === 'fr' ? 'Formes' : 'Shapes'}
          >
            <Square className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTab('textures')}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              activeTab === 'textures' ? "bg-violet-500/40 text-white" : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            )}
            title={language === 'fr' ? 'Textures' : 'Textures'}
          >
            <TextureIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTab('gradients')}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              activeTab === 'gradients' ? "bg-violet-500/40 text-white" : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            )}
            title={language === 'fr' ? 'Dégradés' : 'Gradients'}
          >
            <GradientIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              activeTab === 'images' ? "bg-violet-500/40 text-white" : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            )}
            title={language === 'fr' ? 'Importer' : 'Upload'}
          >
            <Upload className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTab('illustrations')}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              activeTab === 'illustrations' ? "bg-violet-500/40 text-white" : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            )}
            title={language === 'fr' ? 'Illustrations' : 'Illustrations'}
          >
            <IllustrationIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Canvas Container */}
        <div className="relative flex-1 flex items-center justify-center">
          <canvas 
            ref={canvasRef} 
            width={canvasSize.width} 
            height={canvasSize.height} 
            className={cn(
              "rounded-lg shadow-2xl max-w-full max-h-[40vh] md:max-h-[50vh] object-contain",
              (isErasing || isBrushing) ? "cursor-none" : "cursor-move"
            )}
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
          {/* Center guides overlay */}
          {guides.showVertical && (
            <div 
              className="absolute top-0 bottom-0 w-px bg-cyan-400/70 pointer-events-none z-10"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
            />
          )}
          {guides.showHorizontal && (
            <div 
              className="absolute left-0 right-0 h-px bg-cyan-400/70 pointer-events-none z-10"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
          )}
          
          {/* Eraser cursor preview */}
          {isErasing && mousePos.x > 0 && (
            <div 
              className="fixed rounded-full border-2 border-yellow-400 bg-yellow-400/20 pointer-events-none z-50"
              style={{ 
                left: `${mousePos.x}px`, 
                top: `${mousePos.y}px`,
                width: `${eraserSize}px`,
                height: `${eraserSize}px`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
          
          {/* Brush cursor preview */}
          {isBrushing && mousePos.x > 0 && (
            <div 
              className="fixed rounded-full border-2 pointer-events-none z-50"
              style={{ 
                left: `${mousePos.x}px`, 
                top: `${mousePos.y}px`,
                width: `${brushSize}px`,
                height: `${brushSize}px`,
                borderColor: brushColor,
                backgroundColor: `${brushColor}40`,
                transform: 'translate(-50%, -50%)',
                boxShadow: brushHardness < 100 ? `0 0 ${(100 - brushHardness) / 5}px ${brushColor}` : 'none'
              }}
            />
          )}
          
          {/* Eraser Size Control - appears when erasing */}
          {isErasing && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm border border-yellow-400/30 rounded-lg p-3 shadow-lg animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <Eraser className="h-4 w-4 text-yellow-400" />
                <div className="flex flex-col gap-1 min-w-[120px]">
                  <span className="text-white/60 text-xs">{language === 'fr' ? 'Taille gomme' : 'Eraser size'}</span>
                  <Slider 
                    value={[eraserSize]} 
                    onValueChange={([v]) => setEraserSize(v)} 
                    min={10} 
                    max={100} 
                    step={5} 
                  />
                </div>
                <span className="text-yellow-400 text-xs font-medium w-8">{eraserSize}</span>
              </div>
            </div>
          )}
          
          {/* Brush Controls - appears when brushing */}
          {isBrushing && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm border border-blue-400/30 rounded-lg p-3 shadow-lg animate-in fade-in slide-in-from-bottom-2 min-w-[280px]">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Brush className="h-4 w-4 text-blue-400" />
                  <span className="text-white/80 text-sm font-medium">{language === 'fr' ? 'Pinceau' : 'Brush'}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-xs w-16">{language === 'fr' ? 'Couleur:' : 'Color:'}</span>
                  <input 
                    type="color" 
                    value={brushColor} 
                    onChange={(e) => setBrushColor(e.target.value)} 
                    className="w-8 h-8 rounded cursor-pointer border border-white/20"
                  />
                  <div className="flex gap-1">
                    {['#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', '#FFD700', '#9B59B6'].map(color => (
                      <button
                        key={color}
                        onClick={() => setBrushColor(color)}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                          brushColor === color ? "border-blue-400 ring-2 ring-blue-400/50" : "border-white/20"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-xs w-16">{language === 'fr' ? 'Taille:' : 'Size:'}</span>
                  <Slider 
                    value={[brushSize]} 
                    onValueChange={([v]) => setBrushSize(v)} 
                    min={5} 
                    max={80} 
                    step={1} 
                    className="flex-1"
                  />
                  <span className="text-blue-400 text-xs font-medium w-8">{brushSize}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-xs w-16">{language === 'fr' ? 'Dureté:' : 'Hardness:'}</span>
                  <Slider 
                    value={[brushHardness]} 
                    onValueChange={([v]) => setBrushHardness(v)} 
                    min={0} 
                    max={100} 
                    step={5} 
                    className="flex-1"
                  />
                  <span className="text-blue-400 text-xs font-medium w-8">{brushHardness}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Toolbar - Drawing Tools */}
        <div className="flex flex-col gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
          <button
            onClick={async () => {
              setRemovingBg(true);
              try {
                const response = await base44.functions.invoke('removeBg', { image_url: originalImageUrl });
                if (response.data?.success && response.data?.image_url) {
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
            className={cn(
              "p-2.5 rounded-lg transition-all relative",
              removingBg ? "bg-pink-500/40 text-pink-300" : "bg-white/10 text-white/60 hover:text-pink-400 hover:bg-pink-500/20"
            )}
            title={language === 'fr' ? 'Supprimer le fond' : 'Remove background'}
          >
            {removingBg ? <Loader2 className="h-5 w-5 animate-spin" /> : <Scissors className="h-5 w-5" />}
          </button>
          
          <button
            onClick={() => {
              setIsErasing(!isErasing);
              if (isBrushing) setIsBrushing(false);
            }}
            className={cn(
              "p-2.5 rounded-lg transition-all relative",
              isErasing ? "bg-yellow-500/40 text-yellow-300 ring-2 ring-yellow-400/50" : "bg-white/10 text-white/60 hover:text-yellow-400 hover:bg-yellow-500/20"
            )}
            title={language === 'fr' ? 'Gomme' : 'Eraser'}
          >
            <Eraser className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => {
              setIsBrushing(!isBrushing);
              if (isErasing) setIsErasing(false);
            }}
            className={cn(
              "p-2.5 rounded-lg transition-all relative",
              isBrushing ? "bg-blue-500/40 text-blue-300 ring-2 ring-blue-400/50" : "bg-white/10 text-white/60 hover:text-blue-400 hover:bg-blue-500/20"
            )}
            title={language === 'fr' ? 'Pinceau' : 'Brush'}
          >
            <Brush className="h-5 w-5" />
          </button>
          
          {/* Separator */}
          <div className="h-px bg-white/10 my-1" />
          
          {/* Undo buttons */}
          {erasedStrokes.length > 0 && isErasing && (
            <button
              onClick={undoEraser}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all animate-in fade-in"
              title={language === 'fr' ? 'Annuler gomme' : 'Undo erase'}
            >
              <RotateCw className="h-4 w-4 scale-x-[-1]" />
            </button>
          )}
          
          {brushStrokes.length > 0 && isBrushing && (
            <button
              onClick={undoBrush}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all animate-in fade-in"
              title={language === 'fr' ? 'Annuler pinceau' : 'Undo brush'}
            >
              <RotateCw className="h-4 w-4 scale-x-[-1]" />
            </button>
          )}
        </div>
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
              {/* ACCORDION: Propriétés */}
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setTextAccordion(textAccordion === 'properties' ? '' : 'properties')} 
                  className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white/70 text-xs flex items-center gap-2">
                    <Type className="h-3 w-3" />
                    {language === 'fr' ? 'Édition de texte' : 'Text editing'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform", textAccordion === 'properties' && "rotate-180")} />
                </button>
                {textAccordion === 'properties' && (
                  <div className="p-2 space-y-2">
                    {/* AI Stylize Button */}
                    <Button
                      onClick={stylizeTextWithAI}
                      disabled={stylizingText}
                      className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 hover:from-pink-700 hover:via-purple-700 hover:to-violet-700 text-white font-medium shadow-lg shadow-purple-500/20"
                    >
                      {stylizingText ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      {language === 'fr' ? '✨ Styliser avec l\'IA' : '✨ Stylize with AI'}
                    </Button>

                    {/* Text Input */}
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
                    <div className="flex gap-2 items-center">
                      <span className="text-white/40 text-xs w-10">{language === 'fr' ? 'Poids' : 'Weight'}</span>
                      <div className="flex-1">
                        <Slider value={[currentLayer.fontWeight || 400]} onValueChange={([v]) => updateLayer(selectedLayer, { fontWeight: v, bold: v >= 600 })} min={100} max={900} step={100} />
                      </div>
                      <span className="text-white/50 text-xs w-12">{currentLayer.fontWeight || 400}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-white/40 text-xs w-10">{language === 'fr' ? 'Espac.' : 'Space'}</span>
                      <div className="flex-1">
                        <Slider value={[currentLayer.letterSpacing || 0]} onValueChange={([v]) => updateLayer(selectedLayer, { letterSpacing: v })} min={-5} max={20} step={0.5} />
                      </div>
                      <span className="text-white/50 text-xs w-12">{currentLayer.letterSpacing || 0}px</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <RotateCw className="h-3 w-3 text-white/50" />
                      <span className="text-white/40 text-xs w-10">{language === 'fr' ? 'Rotation' : 'Rotate'}</span>
                      <div className="flex-1">
                        <Slider value={[currentLayer.rotation || 0]} onValueChange={([v]) => updateLayer(selectedLayer, { rotation: v })} min={0} max={360} step={1} />
                      </div>
                      <span className="text-white/50 text-xs w-12">{currentLayer.rotation || 0}°</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-white/40 text-xs w-10">{language === 'fr' ? 'Largeur' : 'Width'}</span>
                      <div className="flex-1">
                        <Slider value={[currentLayer.maxWidth || 0]} onValueChange={([v]) => updateLayer(selectedLayer, { maxWidth: v })} min={0} max={canvasSize.width} step={5} />
                      </div>
                      <span className="text-white/50 text-xs w-12">{currentLayer.maxWidth || (language === 'fr' ? 'Auto' : 'Auto')}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-white/40 text-xs w-10">{language === 'fr' ? 'Opacité' : 'Opacity'}</span>
                      <div className="flex-1">
                        <Slider value={[currentLayer.opacity]} onValueChange={([v]) => updateLayer(selectedLayer, { opacity: v })} min={10} max={100} step={1} />
                      </div>
                      <span className="text-white/50 text-xs w-12">{currentLayer.opacity}%</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => updateLayer(selectedLayer, { italic: !currentLayer.italic })} className={cn("p-1.5 rounded text-sm", currentLayer.italic ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}><Italic className="h-3 w-3" /></button>
                      <button onClick={() => updateLayer(selectedLayer, { align: 'left' })} className={cn("p-1.5 rounded", currentLayer.align === 'left' ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}><AlignLeft className="h-3 w-3" /></button>
                      <button onClick={() => updateLayer(selectedLayer, { align: 'center' })} className={cn("p-1.5 rounded", currentLayer.align === 'center' ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}><AlignCenter className="h-3 w-3" /></button>
                      <button onClick={() => updateLayer(selectedLayer, { align: 'right' })} className={cn("p-1.5 rounded", currentLayer.align === 'right' ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}><AlignRight className="h-3 w-3" /></button>
                      <button onClick={() => updateLayer(selectedLayer, { curvedText: !currentLayer.curvedText })} className={cn("p-1.5 rounded", currentLayer.curvedText ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")} title={language === 'fr' ? 'Texte en cercle' : 'Curved text'}><Circle className="h-3 w-3" /></button>
                      <div className="flex gap-1 ml-auto">
                        {PRESET_COLORS.slice(0, 6).map(color => (
                          <button key={color} onClick={() => updateLayer(selectedLayer, { color })} className={cn("w-5 h-5 rounded-full border-2 transition-transform hover:scale-110", currentLayer.color === color ? "border-violet-400" : "border-transparent")} style={{ backgroundColor: color }} />
                        ))}
                        <input type="color" value={currentLayer.color} onChange={(e) => updateLayer(selectedLayer, { color: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                      </div>
                    </div>
                    {/* Curved Text Options */}
                    {currentLayer.curvedText && (
                      <div className="space-y-2 p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                        <div className="flex gap-2 items-center">
                          <Circle className="h-3 w-3 text-violet-400" />
                          <span className="text-white/60 text-xs font-medium">{language === 'fr' ? 'Texte en cercle' : 'Curved text'}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-white/40 text-xs w-14">{language === 'fr' ? 'Rayon' : 'Radius'}</span>
                          <div className="flex-1">
                            <Slider value={[currentLayer.curveRadius || 100]} onValueChange={([v]) => updateLayer(selectedLayer, { curveRadius: v })} min={40} max={400} step={5} />
                          </div>
                          <span className="text-white/50 text-xs w-10">{currentLayer.curveRadius || 100}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-white/40 text-xs w-14">{language === 'fr' ? 'Direction' : 'Direction'}</span>
                          <div className="flex gap-1 flex-1">
                            <button 
                              onClick={() => updateLayer(selectedLayer, { curveDirection: 'top' })} 
                              className={cn("flex-1 p-1.5 rounded text-xs", (currentLayer.curveDirection || 'top') === 'top' ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}
                            >
                              ⌒ {language === 'fr' ? 'Haut' : 'Top'}
                            </button>
                            <button 
                              onClick={() => updateLayer(selectedLayer, { curveDirection: 'bottom' })} 
                              className={cn("flex-1 p-1.5 rounded text-xs", currentLayer.curveDirection === 'bottom' ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}
                            >
                              ⌣ {language === 'fr' ? 'Bas' : 'Bottom'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ACCORDION: Effets */}
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setTextAccordion(textAccordion === 'effects' ? '' : 'effects')} 
                  className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white/70 text-xs flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    {language === 'fr' ? 'Effets de texte' : 'Text effects'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform", textAccordion === 'effects' && "rotate-180")} />
                </button>
                {textAccordion === 'effects' && (
                  <div className="p-2 space-y-2">
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
                      <button onClick={() => updateLayer(selectedLayer, { reflection: !currentLayer.reflection })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.reflection ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60")}>
                        {language === 'fr' ? 'Reflet' : 'Reflect'}
                      </button>
                      <button onClick={() => updateLayer(selectedLayer, { sparkle: !currentLayer.sparkle })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.sparkle ? "bg-amber-500/30 text-amber-300" : "bg-white/5 text-white/60")}>
                        ✨ {language === 'fr' ? 'Scintillement' : 'Sparkle'}
                      </button>
                      <button onClick={() => updateLayer(selectedLayer, { textGradient: !currentLayer.textGradient })} className={cn("p-1.5 rounded text-xs flex items-center justify-center gap-1", currentLayer.textGradient ? "bg-pink-500/30 text-pink-300" : "bg-white/5 text-white/60")}>
                        🌈 {language === 'fr' ? 'Dégradé' : 'Gradient'}
                      </button>
                    </div>
                    {/* Text Gradient Options */}
                    {currentLayer.textGradient && (
                      <div className="space-y-2 p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
                        <div className="flex gap-2 items-center">
                          <span className="text-white/60 text-xs font-medium">🌈 {language === 'fr' ? 'Dégradé texte' : 'Text gradient'}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Direction:' : 'Direction:'}</span>
                          <button 
                            onClick={() => updateLayer(selectedLayer, { gradientDirection: 'horizontal' })} 
                            className={cn("flex-1 p-1.5 rounded text-xs", (currentLayer.gradientDirection || 'horizontal') === 'horizontal' ? "bg-pink-500/30 text-pink-300" : "bg-white/5 text-white/60")}
                          >
                            ← → {language === 'fr' ? 'Horizontal' : 'Horizontal'}
                          </button>
                          <button 
                            onClick={() => updateLayer(selectedLayer, { gradientDirection: 'vertical' })} 
                            className={cn("flex-1 p-1.5 rounded text-xs", currentLayer.gradientDirection === 'vertical' ? "bg-pink-500/30 text-pink-300" : "bg-white/5 text-white/60")}
                          >
                            ↑ ↓ {language === 'fr' ? 'Vertical' : 'Vertical'}
                          </button>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Couleurs:' : 'Colors:'}</span>
                          <input type="color" value={currentLayer.gradientColor1 || '#ff00ff'} onChange={(e) => updateLayer(selectedLayer, { gradientColor1: e.target.value })} className="w-6 h-6 rounded cursor-pointer" />
                          <div className="flex-1 h-4 rounded" style={{ background: `linear-gradient(${currentLayer.gradientDirection === 'vertical' ? '180deg' : '90deg'}, ${currentLayer.gradientColor1 || '#ff00ff'}, ${currentLayer.gradientColor2 || '#00ffff'})` }} />
                          <input type="color" value={currentLayer.gradientColor2 || '#00ffff'} onChange={(e) => updateLayer(selectedLayer, { gradientColor2: e.target.value })} className="w-6 h-6 rounded cursor-pointer" />
                        </div>
                        <div className="grid grid-cols-4 gap-1 mt-2">
                          {[
                            { c1: '#ff00ff', c2: '#00ffff' },
                            { c1: '#ff6b6b', c2: '#feca57' },
                            { c1: '#667eea', c2: '#764ba2' },
                            { c1: '#f093fb', c2: '#f5576c' },
                            { c1: '#4facfe', c2: '#00f2fe' },
                            { c1: '#43e97b', c2: '#38f9d7' },
                            { c1: '#fa709a', c2: '#fee140' },
                            { c1: '#a18cd1', c2: '#fbc2eb' },
                          ].map((preset, idx) => (
                            <button 
                              key={idx} 
                              onClick={() => updateLayer(selectedLayer, { gradientColor1: preset.c1, gradientColor2: preset.c2 })}
                              className="h-5 rounded border border-white/10 hover:border-pink-400 transition-colors"
                              style={{ background: `linear-gradient(90deg, ${preset.c1}, ${preset.c2})` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {currentLayer.stroke && (
                      <div className="flex gap-2 items-center">
                        <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Contour:' : 'Stroke:'}</span>
                        <input type="color" value={currentLayer.strokeColor || '#000000'} onChange={(e) => updateLayer(selectedLayer, { strokeColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                        <Slider value={[currentLayer.strokeWidth || 2]} onValueChange={([v]) => updateLayer(selectedLayer, { strokeWidth: v })} min={1} max={10} step={1} className="flex-1" />
                        <span className="text-white/40 text-xs w-6">{currentLayer.strokeWidth || 2}</span>
                      </div>
                    )}
                    {currentLayer.shadow && (
                      <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Couleur:' : 'Color:'}</span>
                          <input type="color" value={currentLayer.shadowColor || '#000000'} onChange={(e) => updateLayer(selectedLayer, { shadowColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer" />
                          <span className="text-white/40 text-xs w-10">{language === 'fr' ? 'Flou:' : 'Blur:'}</span>
                          <Slider value={[currentLayer.shadowBlur || 6]} onValueChange={([v]) => updateLayer(selectedLayer, { shadowBlur: v })} min={1} max={30} step={1} className="flex-1" />
                          <span className="text-white/40 text-xs w-6">{currentLayer.shadowBlur || 6}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-white/40 text-xs w-16">X:</span>
                          <Slider value={[currentLayer.shadowOffsetX || 3]} onValueChange={([v]) => updateLayer(selectedLayer, { shadowOffsetX: v })} min={-20} max={20} step={1} className="flex-1" />
                          <span className="text-white/40 text-xs w-6">{currentLayer.shadowOffsetX || 3}</span>
                          <span className="text-white/40 text-xs w-6">Y:</span>
                          <Slider value={[currentLayer.shadowOffsetY || 3]} onValueChange={([v]) => updateLayer(selectedLayer, { shadowOffsetY: v })} min={-20} max={20} step={1} className="flex-1" />
                          <span className="text-white/40 text-xs w-6">{currentLayer.shadowOffsetY || 3}</span>
                        </div>
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
                    {currentLayer.reflection && (
                      <div className="flex gap-2 items-center">
                        <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Reflet:' : 'Reflect:'}</span>
                        <Slider value={[currentLayer.reflectionOpacity || 40]} onValueChange={([v]) => updateLayer(selectedLayer, { reflectionOpacity: v })} min={10} max={80} step={5} className="flex-1" />
                        <span className="text-white/40 text-xs w-6">{currentLayer.reflectionOpacity || 40}%</span>
                      </div>
                    )}
                    {currentLayer.sparkle && (
                      <div className="flex gap-2 items-center">
                        <span className="text-white/40 text-xs w-16">✨ {language === 'fr' ? 'Intensité:' : 'Intensity:'}</span>
                        <Slider value={[currentLayer.sparkleIntensity || 50]} onValueChange={([v]) => updateLayer(selectedLayer, { sparkleIntensity: v })} min={10} max={100} step={5} className="flex-1" />
                        <span className="text-white/40 text-xs w-6">{currentLayer.sparkleIntensity || 50}%</span>
                      </div>
                    )}
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
                    {currentLayer.shape === 'rectangle' && (
                      <div className="flex gap-2 items-center">
                        <span className="text-white/40 text-xs w-16">{language === 'fr' ? 'Radius:' : 'Radius:'}</span>
                        <Slider value={[currentLayer.borderRadius || 0]} onValueChange={([v]) => updateLayer(selectedLayer, { borderRadius: v })} min={0} max={100} step={1} className="flex-1" />
                        <span className="text-white/40 text-xs w-6">{currentLayer.borderRadius || 0}</span>
                      </div>
                    )}
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

          {/* Opacity for non-text layers only (text has its own above effects) */}
          {currentLayer.type !== 'text' && (
            <div className="flex gap-2 items-center">
              <label className="text-white/50 text-xs">{language === 'fr' ? 'Opacité' : 'Opacity'}</label>
              <div className="flex-1">
                <Slider value={[currentLayer.opacity]} onValueChange={([v]) => updateLayer(selectedLayer, { opacity: v })} min={10} max={100} step={1} />
              </div>
              <span className="text-white/50 text-xs w-8">{currentLayer.opacity}%</span>
            </div>
          )}
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