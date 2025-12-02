import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';
import { Sparkles, Clock, Gem, Palette, Building2, Brush, Cpu, Leaf, X, Zap, Heart, Mountain, Camera, Music, Flame, Snowflake, Sun, Moon, Star, Crown, Feather, Coffee, Wine, Gamepad2, Rocket, Ghost, Wand2, ChevronDown } from 'lucide-react';

const STYLES = [
  // Classiques
  { id: 'modern', name: { fr: 'Moderne', en: 'Modern' }, icon: Sparkles, prompt: 'modern, clean, minimalist, contemporary design', color: 'from-violet-500 to-purple-500' },
  { id: 'vintage', name: { fr: 'Vintage', en: 'Vintage' }, icon: Clock, prompt: 'vintage, retro, classic, nostalgic style', color: 'from-amber-600 to-orange-600' },
  { id: 'luxe', name: { fr: 'Luxe', en: 'Luxury' }, icon: Gem, prompt: 'luxury, premium, elegant, sophisticated, gold accents', color: 'from-yellow-500 to-amber-500' },
  { id: 'playful', name: { fr: 'Ludique', en: 'Playful' }, icon: Palette, prompt: 'playful, fun, colorful, creative, dynamic', color: 'from-pink-500 to-rose-500' },
  { id: 'corporate', name: { fr: 'Corporate', en: 'Corporate' }, icon: Building2, prompt: 'professional, corporate, business, formal, trustworthy', color: 'from-blue-600 to-indigo-600' },
  { id: 'artistic', name: { fr: 'Artistique', en: 'Artistic' }, icon: Brush, prompt: 'artistic, creative, unique, hand-crafted feel', color: 'from-fuchsia-500 to-pink-500' },
  { id: 'tech', name: { fr: 'Tech', en: 'Tech' }, icon: Cpu, prompt: 'tech, futuristic, digital, innovative, sleek', color: 'from-cyan-500 to-blue-500' },
  { id: 'nature', name: { fr: 'Nature', en: 'Nature' }, icon: Leaf, prompt: 'natural, organic, eco-friendly, earthy tones', color: 'from-green-500 to-emerald-500' },
  // Nouveaux styles
  { id: 'neon', name: { fr: 'Néon', en: 'Neon' }, icon: Zap, prompt: 'neon lights, cyberpunk, glowing, electric colors, dark background with bright accents', color: 'from-pink-500 to-cyan-500' },
  { id: 'romantic', name: { fr: 'Romantique', en: 'Romantic' }, icon: Heart, prompt: 'romantic, soft, dreamy, pastel colors, elegant curves, love theme', color: 'from-rose-400 to-pink-400' },
  { id: 'mountain', name: { fr: 'Aventure', en: 'Adventure' }, icon: Mountain, prompt: 'adventure, outdoor, mountain, wilderness, exploration, rugged', color: 'from-slate-600 to-stone-600' },
  { id: 'photo', name: { fr: 'Photo réaliste', en: 'Photorealistic' }, icon: Camera, prompt: 'photorealistic, hyper realistic, detailed photography, professional photo', color: 'from-gray-600 to-zinc-600' },
  { id: 'music', name: { fr: 'Musical', en: 'Musical' }, icon: Music, prompt: 'music inspired, rhythm, dynamic, sound waves, concert vibes', color: 'from-purple-600 to-indigo-600' },
  { id: 'fire', name: { fr: 'Intense', en: 'Intense' }, icon: Flame, prompt: 'intense, fiery, passionate, bold colors, dramatic, powerful', color: 'from-red-600 to-orange-600' },
  { id: 'winter', name: { fr: 'Hivernal', en: 'Winter' }, icon: Snowflake, prompt: 'winter theme, cold, icy, snow, frost, cool blue tones, crisp', color: 'from-sky-400 to-blue-400' },
  { id: 'summer', name: { fr: 'Estival', en: 'Summer' }, icon: Sun, prompt: 'summer vibes, sunny, warm, tropical, beach, bright cheerful colors', color: 'from-yellow-400 to-orange-400' },
  { id: 'night', name: { fr: 'Nocturne', en: 'Nocturnal' }, icon: Moon, prompt: 'night theme, dark, mysterious, moonlight, stars, deep blues and purples', color: 'from-indigo-800 to-purple-900' },
  { id: 'cosmic', name: { fr: 'Cosmique', en: 'Cosmic' }, icon: Star, prompt: 'cosmic, space, galaxy, nebula, stars, universe, ethereal', color: 'from-violet-700 to-blue-900' },
  { id: 'royal', name: { fr: 'Royal', en: 'Royal' }, icon: Crown, prompt: 'royal, majestic, regal, gold and purple, crown, imperial', color: 'from-amber-500 to-purple-700' },
  { id: 'boho', name: { fr: 'Bohème', en: 'Bohemian' }, icon: Feather, prompt: 'bohemian, boho chic, free spirit, earthy, feathers, macrame, natural textures', color: 'from-orange-400 to-amber-500' },
  { id: 'cafe', name: { fr: 'Café', en: 'Coffee' }, icon: Coffee, prompt: 'coffee shop aesthetic, warm browns, cozy, rustic, artisanal', color: 'from-amber-700 to-yellow-900' },
  { id: 'wine', name: { fr: 'Élégant', en: 'Elegant' }, icon: Wine, prompt: 'elegant wine aesthetic, burgundy, sophisticated, refined, classy', color: 'from-rose-800 to-red-900' },
  { id: 'gaming', name: { fr: 'Gaming', en: 'Gaming' }, icon: Gamepad2, prompt: 'gaming style, esports, dynamic, RGB colors, futuristic tech', color: 'from-green-500 to-cyan-500' },
  { id: 'scifi', name: { fr: 'Sci-Fi', en: 'Sci-Fi' }, icon: Rocket, prompt: 'science fiction, futuristic, space age, chrome, holographic', color: 'from-blue-500 to-teal-500' },
  { id: 'horror', name: { fr: 'Sombre', en: 'Dark' }, icon: Ghost, prompt: 'dark aesthetic, gothic, mysterious, shadows, moody atmosphere', color: 'from-gray-800 to-black' },
  { id: 'magic', name: { fr: 'Magique', en: 'Magical' }, icon: Wand2, prompt: 'magical, fantasy, enchanted, sparkles, mystical, fairy tale', color: 'from-purple-500 to-pink-500' },
];

const COLOR_PALETTES = [
  // Classiques populaires
  { id: 'vibrant', name: { fr: 'Vibrant', en: 'Vibrant' }, colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'] },
  { id: 'pastel', name: { fr: 'Pastel', en: 'Pastel' }, colors: ['#FFB5BA', '#B5D8FF', '#C5FFB5', '#FFE5B5', '#E5B5FF'] },
  { id: 'dark', name: { fr: 'Sombre', en: 'Dark' }, colors: ['#1A1A2E', '#16213E', '#0F3460', '#533483', '#E94560'] },
  { id: 'monochrome', name: { fr: 'Monochrome', en: 'Monochrome' }, colors: ['#000000', '#333333', '#666666', '#999999', '#FFFFFF'] },
  { id: 'sunset', name: { fr: 'Coucher de soleil', en: 'Sunset' }, colors: ['#FF512F', '#F09819', '#FF6B6B', '#C850C0', '#4158D0'] },
  { id: 'ocean', name: { fr: 'Océan', en: 'Ocean' }, colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#03045E'] },
  { id: 'forest', name: { fr: 'Forêt', en: 'Forest' }, colors: ['#2D5A27', '#538D4E', '#95C11F', '#D4E157', '#1B4332'] },
  { id: 'royal', name: { fr: 'Royal', en: 'Royal' }, colors: ['#4A0E4E', '#81267F', '#C879FF', '#FFD700', '#1A1A2E'] },
  { id: 'candy', name: { fr: 'Candy', en: 'Candy' }, colors: ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#FF85A2'] },
  { id: 'earth', name: { fr: 'Terre', en: 'Earth' }, colors: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#D2691E'] },
  { id: 'neon', name: { fr: 'Néon', en: 'Neon' }, colors: ['#FF00FF', '#00FFFF', '#FF006E', '#8338EC', '#3A86FF'] },
  { id: 'gold', name: { fr: 'Or & Noir', en: 'Gold & Black' }, colors: ['#FFD700', '#DAA520', '#B8860B', '#1A1A1A', '#000000'] },
  { id: 'rose', name: { fr: 'Rose Gold', en: 'Rose Gold' }, colors: ['#B76E79', '#E8B4B8', '#EDD1D1', '#F5E6E8', '#FAF0F0'] },
  { id: 'mint', name: { fr: 'Menthe', en: 'Mint' }, colors: ['#98FF98', '#3EB489', '#2E8B57', '#98D8C8', '#F7FFF7'] },
  { id: 'aurora', name: { fr: 'Aurore', en: 'Aurora' }, colors: ['#00C9FF', '#92FE9D', '#F9D423', '#FF4E50', '#7B68EE'] },
  { id: 'coffee', name: { fr: 'Café', en: 'Coffee' }, colors: ['#4A3728', '#6F4E37', '#A67B5B', '#C4A484', '#ECE0D1'] },
  { id: 'ice', name: { fr: 'Glacé', en: 'Ice' }, colors: ['#A5F3FC', '#67E8F9', '#22D3EE', '#06B6D4', '#E0F2FE'] },
  { id: 'wine', name: { fr: 'Vin', en: 'Wine' }, colors: ['#722F37', '#8B0000', '#A52A2A', '#CD5C5C', '#F5DEB3'] },
  { id: 'lavender', name: { fr: 'Lavande', en: 'Lavender' }, colors: ['#E6E6FA', '#D8BFD8', '#DDA0DD', '#BA55D3', '#9932CC'] },
  { id: 'tropical', name: { fr: 'Tropical', en: 'Tropical' }, colors: ['#FF6F61', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'] },
  // Nouvelles palettes
  { id: 'cherry', name: { fr: 'Cerise', en: 'Cherry' }, colors: ['#7B2D3C', '#DE3163', '#FF6B8A', '#FFB6C1', '#FFF0F5'] },
  { id: 'midnight', name: { fr: 'Minuit', en: 'Midnight' }, colors: ['#0D1B2A', '#1B263B', '#415A77', '#778DA9', '#E0E1DD'] },
  { id: 'sahara', name: { fr: 'Sahara', en: 'Sahara' }, colors: ['#C19A6B', '#EDC9AF', '#F5DEB3', '#FAEBD7', '#8B7355'] },
  { id: 'peacock', name: { fr: 'Paon', en: 'Peacock' }, colors: ['#005F73', '#0A9396', '#94D2BD', '#E9D8A6', '#EE9B00'] },
  { id: 'berry', name: { fr: 'Baies', en: 'Berry' }, colors: ['#3D1A4A', '#6B2D5C', '#9B4F96', '#C8A2C8', '#E8D5E8'] },
  { id: 'peach', name: { fr: 'Pêche', en: 'Peach' }, colors: ['#FFCBA4', '#FFE5B4', '#FFDAB9', '#FFF8DC', '#FF9966'] },
  { id: 'emerald', name: { fr: 'Émeraude', en: 'Emerald' }, colors: ['#064E3B', '#047857', '#10B981', '#6EE7B7', '#D1FAE5'] },
  { id: 'coral', name: { fr: 'Corail', en: 'Coral' }, colors: ['#FF7F50', '#FF6347', '#FF4500', '#FFD700', '#FFA07A'] },
  { id: 'steel', name: { fr: 'Acier', en: 'Steel' }, colors: ['#2F4F4F', '#708090', '#A9A9A9', '#C0C0C0', '#DCDCDC'] },
  { id: 'cherry_blossom', name: { fr: 'Sakura', en: 'Sakura' }, colors: ['#FFB7C5', '#FADADD', '#FFC0CB', '#F8E8EE', '#8B4513'] },
  { id: 'electric', name: { fr: 'Électrique', en: 'Electric' }, colors: ['#00FFFF', '#00FF00', '#FFFF00', '#FF00FF', '#FF0000'] },
  { id: 'vintage', name: { fr: 'Rétro', en: 'Retro' }, colors: ['#D4A373', '#CCD5AE', '#E9EDC9', '#FEFAE0', '#FAEDCD'] },
  { id: 'nordic', name: { fr: 'Nordique', en: 'Nordic' }, colors: ['#2E3440', '#3B4252', '#434C5E', '#4C566A', '#ECEFF4'] },
  { id: 'autumn', name: { fr: 'Automne', en: 'Autumn' }, colors: ['#8B4513', '#CD853F', '#DAA520', '#B8860B', '#D2691E'] },
  { id: 'spring', name: { fr: 'Printemps', en: 'Spring' }, colors: ['#98FB98', '#90EE90', '#7CFC00', '#32CD32', '#FFD700'] },
  { id: 'galaxy', name: { fr: 'Galaxie', en: 'Galaxy' }, colors: ['#0D0221', '#190132', '#380474', '#6B0F8C', '#8B2FC9'] },
  { id: 'terracotta', name: { fr: 'Terracotta', en: 'Terracotta' }, colors: ['#E2725B', '#CD5C5C', '#BC8F8F', '#D2B48C', '#FFF8DC'] },
  { id: 'cyberpunk', name: { fr: 'Cyberpunk', en: 'Cyberpunk' }, colors: ['#FF00FF', '#00BFFF', '#FF1493', '#7B68EE', '#0D0D0D'] },
  { id: 'zen', name: { fr: 'Zen', en: 'Zen' }, colors: ['#F5F5DC', '#E8E4C9', '#C4B7A6', '#8B8378', '#5C5346'] },
  { id: 'pop_art', name: { fr: 'Pop Art', en: 'Pop Art' }, colors: ['#FFFF00', '#FF0000', '#0000FF', '#FF69B4', '#00FF00'] },
];

export default function StyleSelector({ selectedStyle, selectedPalette, onStyleChange, onPaletteChange, onClose, onAutoSend }) {
  const { language } = useLanguage();
  const lang = language || 'fr';
  const [openSection, setOpenSection] = useState('palettes'); // 'palettes' or 'styles'

  const handleStyleClick = (style) => {
    if (selectedStyle?.id === style.id) {
      onStyleChange(null);
    } else {
      onStyleChange(style);
      // Auto-send a prompt with this style
      if (onAutoSend) {
        const prompt = lang === 'fr' 
          ? `Crée un visuel avec un style ${style.name.fr.toLowerCase()}`
          : `Create a visual with a ${style.name.en.toLowerCase()} style`;
        onAutoSend(prompt);
      }
    }
  };

  return (
    <div className="relative space-y-2 p-4 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-2xl max-h-[70vh] overflow-y-auto">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="h-3.5 w-3.5 text-white" />
        </button>
      )}

      {/* Color Palettes Accordion - EN PREMIER */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === 'palettes' ? null : 'palettes')}
          className={cn(
            "w-full flex items-center justify-between p-3 transition-colors",
            openSection === 'palettes' ? "bg-violet-500/20" : "bg-white/5 hover:bg-white/10"
          )}
        >
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-pink-400" />
            <span className="text-white/80 text-sm font-medium">
              {lang === 'fr' ? 'Palettes de couleurs' : 'Color palettes'}
            </span>
            {selectedPalette && (
              <span className="text-xs bg-pink-500/30 text-pink-300 px-2 py-0.5 rounded-full">
                {selectedPalette.name[lang]}
              </span>
            )}
          </div>
          <ChevronDown className={cn("h-4 w-4 text-white/50 transition-transform", openSection === 'palettes' && "rotate-180")} />
        </button>
        {openSection === 'palettes' && (
          <div className="p-3 bg-black/20 max-h-[200px] overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {COLOR_PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  onClick={() => onPaletteChange(selectedPalette?.id === palette.id ? null : palette)}
                  className={cn(
                    "p-2 rounded-xl transition-all border group",
                    selectedPalette?.id === palette.id
                      ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  <div className="flex gap-0.5 mb-1.5 h-5 rounded-lg overflow-hidden">
                    {palette.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex-1 transition-transform group-hover:scale-y-110"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className={cn(
                    "text-[10px] text-center font-medium",
                    selectedPalette?.id === palette.id ? "text-violet-300" : "text-white/50"
                  )}>
                    {palette.name[lang]}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Styles Accordion - EN SECOND */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === 'styles' ? null : 'styles')}
          className={cn(
            "w-full flex items-center justify-between p-3 transition-colors",
            openSection === 'styles' ? "bg-violet-500/20" : "bg-white/5 hover:bg-white/10"
          )}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-white/80 text-sm font-medium">
              {lang === 'fr' ? 'Styles visuels' : 'Visual styles'}
            </span>
            {selectedStyle && (
              <span className="text-xs bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full">
                {selectedStyle.name[lang]}
              </span>
            )}
          </div>
          <ChevronDown className={cn("h-4 w-4 text-white/50 transition-transform", openSection === 'styles' && "rotate-180")} />
        </button>
        {openSection === 'styles' && (
          <div className="p-3 bg-black/20 max-h-[200px] overflow-y-auto">
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {STYLES.map((style) => {
                const IconComponent = style.icon;
                return (
                  <button
                    key={style.id}
                    onClick={() => handleStyleClick(style)}
                    className={cn(
                      "p-2 rounded-xl transition-all flex flex-col items-center gap-1.5 border",
                      selectedStyle?.id === style.id
                        ? "bg-gradient-to-br " + style.color + " border-white/30 shadow-lg"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center",
                      selectedStyle?.id === style.id ? "bg-white/20" : "bg-white/10"
                    )}>
                      <IconComponent className={cn("h-3.5 w-3.5", selectedStyle?.id === style.id ? "text-white" : "text-white/60")} />
                    </div>
                    <span className={cn("text-[9px] font-medium text-center leading-tight", selectedStyle?.id === style.id ? "text-white" : "text-white/60")}>
                      {style.name[lang]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { STYLES, COLOR_PALETTES };