import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Pencil, Video, Upload, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { createPageUrl } from '@/utils';

export default function FeaturesCarousel({ onOpenImageEditExamples, onOpenVideoExamples }) {
  const { language } = useLanguage();
  const scrollRef = useRef(null);

  const features = [
    {
      id: 'text-to-image',
      icon: Sparkles,
      title: language === 'fr' ? 'Text To Image' : 'Text To Image',
      description: language === 'fr' 
        ? 'Générez des images incroyables par catégories.'
        : 'Generate incredible images by categories.',
      gradient: 'from-violet-600 to-purple-600',
      onClick: null
    },
    {
      id: 'image-edit',
      icon: Pencil,
      title: language === 'fr' ? 'Editez une image avec l\'IA' : 'Edit an image with AI',
      description: language === 'fr'
        ? 'Apportez des modifications à une image avec l\'IA en 1 prompt.'
        : 'Make AI-powered modifications to an image in 1 prompt.',
      gradient: 'from-orange-600 to-amber-600',
      onClick: onOpenImageEditExamples
    },
    {
      id: 'image-to-video',
      icon: Video,
      title: language === 'fr' ? 'Image To Vidéo' : 'Image To Video',
      description: language === 'fr'
        ? 'Créez des vidéos uniques pour vos produits, réseaux etc à partir d\'une image et d\'un prompt.'
        : 'Create unique videos for your products, social networks, etc. from an image and a prompt.',
      gradient: 'from-pink-600 to-rose-600',
      onClick: onOpenVideoExamples
    },
    {
      id: 'upload',
      icon: Upload,
      title: 'Upload',
      description: language === 'fr'
        ? 'Uploadez votre propre image pour lui apporter des modifications ou la transformer en vidéo.'
        : 'Upload your own image to modify it or transform it into a video.',
      gradient: 'from-blue-600 to-cyan-600',
      onClick: null
    },
    {
      id: 'store',
      icon: ShoppingBag,
      title: 'iGPT Store',
      description: language === 'fr'
        ? 'Découvrez des visuels prêts à l\'emploi, imaginés et promptés par notre équipe...'
        : 'Discover ready-to-use visuals, designed and prompted by our team...',
      gradient: 'from-emerald-600 to-teal-600',
      onClick: () => window.location.href = createPageUrl('Store')
    }
  ];

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
    <div className="relative w-full max-w-5xl mx-auto">
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

      {/* Fade Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0f] to-transparent z-[5] pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0f] to-transparent z-[5] pointer-events-none" />

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-12 py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          const CardComponent = feature.onClick ? 'button' : 'div';
          
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex-shrink-0"
            >
              <CardComponent
                onClick={feature.onClick}
                className={`w-64 h-48 rounded-2xl border border-white/10 bg-gradient-to-br ${feature.gradient} p-6 flex flex-col justify-between transition-all hover:scale-105 hover:shadow-2xl ${feature.onClick ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {feature.description}
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