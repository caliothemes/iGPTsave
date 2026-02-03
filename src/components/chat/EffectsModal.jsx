import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from '@/lib/utils';

function EffectThumbnail({ effect, onApply, categories, isGenerating }) {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = [
    effect.thumbnail_url,
    effect.thumbnail_url_2,
    effect.thumbnail_url_3,
    effect.thumbnail_url_4,
    effect.thumbnail_url_5
  ].filter(Boolean);

  useEffect(() => {
    if (!isHovered || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 800);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  useEffect(() => {
    if (!isHovered) {
      setCurrentIndex(0);
    }
  }, [isHovered]);

  const handleClick = (e, count) => {
    e.stopPropagation();
    onApply(effect, count);
  };

  return (
    <div className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all">
      <button
        onClick={(e) => handleClick(e, 1)}
        disabled={isGenerating}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full aspect-square relative overflow-hidden disabled:opacity-50"
        type="button"
      >
        {images.length > 0 ? (
          <>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={language === 'fr' ? effect.name_fr : (effect.name_en || effect.name_fr)}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: currentIndex === idx ? 1 : 0, transition: 'opacity 0.4s' }}
              />
            ))}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/20 transition-all" />

        {/* Category Badges */}
        {effect.categories && effect.categories.length > 0 && (
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1 flex-wrap">
            {effect.categories.slice(0, 2).map((catSlug, idx) => {
              const cat = categories.find(c => c.id_slug === catSlug);
              if (!cat) return null;
              return (
                <span key={idx} className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[9px] font-medium border border-white/20">
                  {language === 'fr' ? cat.name_fr : (cat.name_en || cat.name_fr)}
                </span>
              );
            })}
            {effect.categories.length > 2 && (
              <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white/70 text-[9px] border border-white/20">
                +{effect.categories.length - 2}
              </span>
            )}
          </div>
        )}
      </button>
      
      {/* Name and Variants Buttons */}
      <div className="p-2">
        <p className="text-white text-xs font-medium line-clamp-2 mb-2">
          {language === 'fr' ? effect.name_fr : (effect.name_en || effect.name_fr)}
        </p>
        <div className="flex gap-1">
          {[2, 3, 4, 5].map(count => (
            <button
              key={count}
              onClick={() => handleClick(count)}
              disabled={isGenerating}
              className="flex-1 px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-xs font-medium transition-all disabled:opacity-50"
            >
              x{count}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EffectsModal({ isOpen, onClose, onApplyEffect, onGenerateVariants }) {
  const { language } = useLanguage();
  const [effects, setEffects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [generatingEffect, setGeneratingEffect] = useState(null);

  useEffect(() => {
    loadEffects();
    loadCategories();
  }, []);

  const loadEffects = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.EffectPreset.filter({ is_active: true }, '-created_date');
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

  const filteredEffects = effects.filter(e => {
    const categoryMatch = selectedCategory === 'all' || (e.categories || []).includes(selectedCategory);
    const searchMatch = searchQuery === '' || 
      (e.name_fr?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       e.name_en?.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && searchMatch;
  });

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
                  {language === 'fr' ? 'Effets One-clic' : 'One-click effects'}
                </h3>
                <p className="text-white/60 text-sm">
                  {language === 'fr' ? 'Appliquez un effet en cliquant dessus. Ces effets ont été testés et promptés par notre équipe. Pour appliquer un effet à votre image, cliquez simplement dessus. 1 effet = 1 crédit' : 'Apply an effect by clicking on it. These effects have been tested and prompted by our team. To apply an effect to your image, simply click on it. 1 effect = 1 credit'}
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
                {language === 'fr' ? 'Tous' : 'All'} ({effects.length})
              </button>
              {categories.map(cat => {
                const count = effects.filter(e => (e.categories || []).includes(cat.id_slug)).length;
                return (
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
                    {language === 'fr' ? cat.name_fr : (cat.name_en || cat.name_fr)} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-white/10">
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher un effet...' : 'Search an effect...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Effects Grid */}
          <div className="p-6 pb-24 overflow-y-auto max-h-[calc(85vh-200px)]">
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredEffects.map((effect) => (
                  <EffectThumbnail
                    key={effect.id}
                    effect={effect}
                    categories={categories}
                    isGenerating={generatingEffect === effect.id}
                    onApply={async (eff, count) => {
                      setGeneratingEffect(eff.id);
                      await onApplyEffect(eff, count);
                      setGeneratingEffect(null);
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