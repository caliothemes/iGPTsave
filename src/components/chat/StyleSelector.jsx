import React from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';

const STYLES = [
  { id: 'modern', name: { fr: 'Moderne', en: 'Modern' }, icon: '✨', prompt: 'modern, clean, minimalist, contemporary design' },
  { id: 'vintage', name: { fr: 'Vintage', en: 'Vintage' }, icon: '🎞️', prompt: 'vintage, retro, classic, nostalgic style' },
  { id: 'luxe', name: { fr: 'Luxe', en: 'Luxury' }, icon: '💎', prompt: 'luxury, premium, elegant, sophisticated, gold accents' },
  { id: 'playful', name: { fr: 'Ludique', en: 'Playful' }, icon: '🎨', prompt: 'playful, fun, colorful, creative, dynamic' },
  { id: 'corporate', name: { fr: 'Corporate', en: 'Corporate' }, icon: '🏢', prompt: 'professional, corporate, business, formal, trustworthy' },
  { id: 'artistic', name: { fr: 'Artistique', en: 'Artistic' }, icon: '🖼️', prompt: 'artistic, creative, unique, hand-crafted feel' },
  { id: 'tech', name: { fr: 'Tech', en: 'Tech' }, icon: '💻', prompt: 'tech, futuristic, digital, innovative, sleek' },
  { id: 'nature', name: { fr: 'Nature', en: 'Nature' }, icon: '🌿', prompt: 'natural, organic, eco-friendly, earthy tones' },
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
];

export default function StyleSelector({ selectedStyle, selectedPalette, onStyleChange, onPaletteChange }) {
  const { language } = useLanguage();

  return (
    <div className="space-y-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
      {/* Styles */}
      <div>
        <p className="text-white/60 text-xs mb-2 uppercase tracking-wider">
          {language === 'fr' ? 'Style' : 'Style'}
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onStyleChange(style)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5",
                selectedStyle?.id === style.id
                  ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              )}
            >
              <span>{style.icon}</span>
              <span>{style.name[language]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Palettes */}
      <div>
        <p className="text-white/60 text-xs mb-2 uppercase tracking-wider">
          {language === 'fr' ? 'Palette de couleurs' : 'Color palette'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {COLOR_PALETTES.map((palette) => (
            <button
              key={palette.id}
              onClick={() => onPaletteChange(palette)}
              className={cn(
                "p-2 rounded-xl transition-all border-2",
                selectedPalette?.id === palette.id
                  ? "border-violet-500 bg-white/10"
                  : "border-transparent bg-white/5 hover:bg-white/10"
              )}
            >
              <div className="flex gap-0.5 mb-1.5">
                {palette.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="h-4 flex-1 first:rounded-l-full last:rounded-r-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-white/70 text-xs text-center">{palette.name[language]}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { STYLES, COLOR_PALETTES };