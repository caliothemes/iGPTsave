import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';

function getThumbnailSize(dimensions) {
  if (!dimensions) return { width: 128, height: 128 };
  const [w, h] = dimensions.split('x').map(Number);
  if (!w || !h) return { width: 128, height: 128 };
  const base = 128;
  if (w >= h) return { width: base, height: Math.round(base * h / w) };
  return { width: Math.round(base * w / h), height: base };
}

export default function EffectVariantsRow({ variants, onSelectVariant, selectedVariant }) {
  const { language } = useLanguage();

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-min items-end">
        {variants.map((variant, idx) => {
          const { width, height } = getThumbnailSize(variant.dimensions);
          return (
          <motion.button
            key={variant.id || idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelectVariant(variant)}
            style={{ width, height }}
            className={cn(
              "relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
              selectedVariant?.id === variant.id
                ? "border-emerald-500 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/50"
                : "border-white/20 hover:border-emerald-500/50"
            )}
          >
            <img 
              src={variant.image_url} 
              alt={`Variante ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Numéro de variante */}
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-bold">
              {idx + 1}
            </div>

            {/* Check mark si sélectionné */}
            {selectedVariant?.id === variant.id && (
              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </motion.button>
        ))}
      </div>
      <p className="text-white/40 text-xs mt-2 text-center">
        {language === 'fr' 
          ? '👆 Cliquez sur une variante pour la sélectionner' 
          : '👆 Click on a variant to select it'}
      </p>
    </div>
  );
}