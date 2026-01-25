import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from '@/lib/utils';

function EffectThumbnail({ effect, onClick }) {
  const [currentImage, setCurrentImage] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    if (!effect.thumbnail_url_2) return;

    const interval = setInterval(() => {
      setCurrentImage(prev => prev === 0 ? 1 : 0);
    }, 2000);

    return () => clearInterval(interval);
  }, [effect.thumbnail_url_2]);

  const imageUrl = currentImage === 0 ? effect.thumbnail_url : effect.thumbnail_url_2;

  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 transition-all"
    >
      <div className="aspect-square relative">
        {imageUrl ? (
          <motion.img
            key={currentImage}
            src={imageUrl}
            alt={language === 'fr' ? effect.name_fr : (effect.name_en || effect.name_fr)}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/20 transition-all" />
      </div>
      <div className="p-2">
        <p className="text-white text-xs font-medium line-clamp-2">
          {language === 'fr' ? effect.name_fr : (effect.name_en || effect.name_fr)}
        </p>
      </div>
    </button>
  );
}

export default function EffectsModal({ isOpen, onClose, onApplyEffect }) {
  const { language } = useLanguage();
  const [effects, setEffects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadEffects();
      loadCategories();
    }
  }, [isOpen]);

  const loadEffects = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.EffectPreset.filter({ is_active: true }, 'order');
      setEffects(data);
    } catch (e) {
      console.error('Failed to load effects:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await base44.entities.EffectCategory.filter({ is_active: true }, 'order');
      setCategories(data);
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  const filteredEffects = selectedCategory === 'all' 
    ? effects 
    : effects.filter(e => e.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {language === 'fr' ? 'Effets magiques' : 'Magic effects'}
                </h3>
                <p className="text-white/60 text-sm">
                  {language === 'fr' ? 'Appliquez un effet en un clic' : 'Apply an effect with one click'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Categories */}
          <div className="px-6 py-4 border-b border-white/10 overflow-x-auto">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  selectedCategory === 'all'
                    ? "bg-emerald-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                {language === 'fr' ? 'Tous' : 'All'}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id_slug)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    selectedCategory === cat.id_slug
                      ? "bg-emerald-600 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  )}
                >
                  {language === 'fr' ? cat.name_fr : (cat.name_en || cat.name_fr)}
                </button>
              ))}
            </div>
          </div>

          {/* Effects Grid */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              </div>
            ) : filteredEffects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60">
                  {language === 'fr' ? 'Aucun effet disponible' : 'No effects available'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredEffects.map((effect) => (
                  <EffectThumbnail
                    key={effect.id}
                    effect={effect}
                    onClick={() => {
                      onApplyEffect(effect);
                      onClose();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}