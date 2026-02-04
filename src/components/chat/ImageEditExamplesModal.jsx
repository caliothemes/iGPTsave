import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';

export default function ImageEditExamplesModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const [examples, setExamples] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadExamples();
    }
  }, [isOpen]);

  const loadExamples = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.ImageEditExample.filter({ is_active: true }, 'order');
      setExamples(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to load examples:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentExample = examples[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? examples.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === examples.length - 1 ? 0 : prev + 1));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-600 to-amber-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {language === 'fr' ? 'Exemples de modifications IA' : 'AI Edit Examples'}
                </h3>
                <p className="text-white/60 text-xs">
                  {language === 'fr' 
                    ? '✨ Générez ou uploadez une image dans iGPT, cliquez sur l\'icône orange pencil, choisissez vos options (prompt de modification) et cliquez sur générer pour modifier votre image.' 
                    : '✨ Generate or upload an image in iGPT, click on the orange pencil icon, choose your options (modification prompt) and click generate to edit your image.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : examples.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white/60 text-sm">
                  {language === 'fr' ? 'Aucun exemple disponible' : 'No examples available'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Navigation */}
                {examples.length > 1 && (
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={handlePrevious}
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {language === 'fr' ? 'Précédent' : 'Previous'}
                    </Button>
                    <span className="text-sm text-white/60">
                      {currentIndex + 1} / {examples.length}
                    </span>
                    <Button
                      onClick={handleNext}
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      {language === 'fr' ? 'Suivant' : 'Next'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}

                {/* Current Example */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden"
                  >
                    {/* Title */}
                    <div className="px-5 py-3 border-b border-white/10 bg-white/5">
                      <h4 className="text-white font-semibold text-center">
                        {language === 'fr' ? currentExample.title_fr : (currentExample.title_en || currentExample.title_fr)}
                      </h4>
                    </div>

                    {/* Images Comparison */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center max-w-4xl mx-auto">
                        {/* Before Images */}
                        <div className="space-y-3">
                          <div className="text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white text-sm font-bold mb-2">
                              1
                            </span>
                            <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                              {language === 'fr' ? 'Avant' : 'Before'}
                            </p>
                          </div>
                          <div className={`grid ${currentExample.before_image_url_2 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                            <div className="relative rounded-lg overflow-hidden bg-black/20 max-w-[200px] mx-auto">
                              <img
                                src={currentExample.before_image_url}
                                alt="Before 1"
                                className="w-full h-auto object-contain"
                              />
                            </div>
                            {currentExample.before_image_url_2 && (
                              <div className="relative rounded-lg overflow-hidden bg-black/20 max-w-[200px] mx-auto">
                                <img
                                  src={currentExample.before_image_url_2}
                                  alt="Before 2"
                                  className="w-full h-auto object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex justify-center">
                          <ArrowRight className="h-8 w-8 text-orange-400" />
                        </div>

                        {/* After Image */}
                        <div className="space-y-3">
                          <div className="text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold mb-2">
                              2
                            </span>
                            <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                              {language === 'fr' ? 'Après' : 'After'}
                            </p>
                          </div>
                          <div className="relative rounded-lg overflow-hidden bg-black/20 max-w-[200px] mx-auto">
                            <img
                              src={currentExample.after_image_url}
                              alt="After"
                              className="w-full h-auto object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Prompt */}
                      <div className="mt-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 max-w-2xl mx-auto">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-orange-300/80 mb-1 font-medium">
                              {language === 'fr' ? 'Prompt utilisé :' : 'Prompt used:'}
                            </p>
                            <p className="text-sm text-orange-200/90 leading-relaxed">
                              {currentExample.prompt}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-white/5">
            <p className="text-xs text-white/50 text-center">
              {language === 'fr' 
                ? '✨ Utilisez l\'édition IA pour transformer vos images en quelques clics' 
                : '✨ Use AI editing to transform your images in a few clicks'}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}