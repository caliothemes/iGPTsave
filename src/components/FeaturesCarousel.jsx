import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Pencil, Video, Upload, ShoppingBag, ChevronLeft, ChevronRight, Image, Wand2, Palette, Zap } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

const ICON_MAP = {
  Sparkles, Pencil, Video, Upload, ShoppingBag, Image, Wand2, Palette, Zap
};

export default function FeaturesCarousel({ onOpenImageEditExamples, onOpenVideoExamples }) {
  const { language } = useLanguage();
  const scrollRef = useRef(null);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const data = await base44.entities.FeatureCard.filter({ is_active: true }, 'order');
        setFeatures(data);
      } catch (e) {
        console.error('Failed to load features:', e);
      }
    };
    loadFeatures();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Scroll Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all hover:scale-110 shadow-lg"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all hover:scale-110 shadow-lg"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-10 py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {features.map((feature, idx) => {
          const Icon = ICON_MAP[feature.icon] || Sparkles;
          const title = language === 'fr' ? feature.title_fr : (feature.title_en || feature.title_fr);
          const description = language === 'fr' ? feature.description_fr : (feature.description_en || feature.description_fr);
          
          const handleClick = () => {
            if (feature.action_type === 'open_image_edit') {
              onOpenImageEditExamples?.();
            } else if (feature.action_type === 'open_video_examples') {
              onOpenVideoExamples?.();
            } else if (feature.action_type === 'link_to_store') {
              window.location.href = createPageUrl('Store');
            }
          };

          const CardComponent = feature.action_type !== 'none' ? 'button' : 'div';
          
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex-shrink-0"
            >
              <CardComponent
                onClick={handleClick}
                className={`w-52 h-48 rounded-2xl border border-white/10 bg-gradient-to-br ${feature.gradient} p-4 flex flex-col items-center justify-center text-center transition-all hover:scale-105 hover:shadow-2xl ${feature.action_type !== 'none' ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm mb-3">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">
                  {title}
                </h3>
                <p className="text-white/80 text-xs leading-relaxed line-clamp-4">
                  {description}
                </p>
              </CardComponent>
            </motion.div>
          );
        })}
      </div>

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}