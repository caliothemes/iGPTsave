import React from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';
import { Sparkles, Clock, Gem, Palette, Building2, Brush, Cpu, Leaf, X } from 'lucide-react';

const STYLES = [
  { id: 'modern', name: { fr: 'Moderne', en: 'Modern' }, icon: Sparkles, prompt: 'modern, clean, minimalist, contemporary design', color: 'from-violet-500 to-purple-500' },
  { id: 'vintage', name: { fr: 'Vintage', en: 'Vintage' }, icon: Clock, prompt: 'vintage, retro, classic, nostalgic style', color: 'from-amber-600 to-orange-600' },
  { id: 'luxe', name: { fr: 'Luxe', en: 'Luxury' }, icon: Gem, prompt: 'luxury, premium, elegant, sophisticated, gold accents', color: 'from-yellow-500 to-amber-500' },
  { id: 'playful', name: { fr: 'Ludique', en: 'Playful' }, icon: Palette, prompt: 'playful, fun, colorful, creative, dynamic', color: 'from-pink-500 to-rose-500' },
  { id: 'corporate', name: { fr: 'Corporate', en: 'Corporate' }, icon: Building2, prompt: 'professional, corporate, business, formal, trustworthy', color: 'from-blue-600 to-indigo-600' },
  { id: 'artistic', name: { fr: 'Artistique', en: 'Artistic' }, icon: Brush, prompt: 'artistic, creative, unique, hand-crafted feel', color: 'from-fuchsia-500 to-pink-500' },
  { id: 'tech', name: { fr: 'Tech', en: 'Tech' }, icon: Cpu, prompt: 'tech, futuristic, digital, innovative, sleek', color: 'from-cyan-500 to-blue-500' },
  { id: 'nature', name: { fr: 'Nature', en: 'Nature' }, icon: Leaf, prompt: 'natural, organic, eco-friendly, earthy tones', color: 'from-green-500 to-emerald-500' },
];

const COLOR_PALETTES = [
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
];

export default function StyleSelector({ selectedStyle, selectedPalette, onStyleChange, onPaletteChange, onClose }) {
  const { language } = useLanguage();

  return (
    <div className="relative space-y-4 p-4 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-2xl">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="h-3.5 w-3.5 text-white" />
        </button>
      )}
      {/* Styles */}
      <div>
        <p className="text-white/50 text-xs mb-3 font-medium">
          {language === 'fr' ? 'Style visuel' : 'Visual style'}
        </p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {STYLES.map((style) => {
            const IconComponent = style.icon;
            return (
              <button
                key={style.id}
                onClick={() => onStyleChange(selectedStyle?.id === style.id ? null : style)}
                className={cn(
                  "p-2 rounded-xl transition-all flex flex-col items-center gap-1.5 border",
                  selectedStyle?.id === style.id
                    ? "bg-gradient-to-br " + style.color + " border-white/30 shadow-lg"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center",
                  selectedStyle?.id === style.id ? "bg-white/20" : "bg-white/10"
                )}>
                  <IconComponent className={cn("h-4 w-4", selectedStyle?.id === style.id ? "text-white" : "text-white/60")} />
                </div>
                <span className={cn("text-[10px] font-medium", selectedStyle?.id === style.id ? "text-white" : "text-white/60")}>
                  {style.name[language]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Palettes */}
      <div>
        <p className="text-white/50 text-xs mb-3 font-medium">
          {language === 'fr' ? 'Palette de couleurs' : 'Color palette'}
        </p>
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
                {palette.name[language]}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { STYLES, COLOR_PALETTES };