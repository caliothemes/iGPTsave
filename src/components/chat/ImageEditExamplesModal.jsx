import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';

export default function ImageEditExamplesModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const [examples, setExamples] = useState([]);
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
    } catch (error) {
      console.error('Failed to load examples:', error);
    } finally {
      setLoading(false);
    }
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
                    ? 'Découvrez ce que vous pouvez faire avec l\'édition IA' 
                    : 'See what you can do with AI editing'}
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
              <div className="grid grid-cols-1 gap-6">
                {examples.map((example, idx) => (
                  <motion.div
                    key={example.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-orange-500/30 transition-all"
                  >
                    {/* Title */}
                    <div className="px-5 py-3 border-b border-white/10 bg-white/5">
                      <h4 className="text-white font-semibold text-sm">
                        {language === 'fr' ? example.title_fr : (example.title_en || example.title_fr)}
                      </h4>
                    </div>

                    {/* Images Comparison */}
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        {/* Before Image */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-white/60 uppercase tracking-wide">
                            {language === 'fr' ? 'Avant' : 'Before'}
                          </div>
                          <div className="relative rounded-lg overflow-hidden bg-black/20 aspect-square">
                            <img
                              src={example.before_image_url}
                              alt="Before"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-center">
                          <div className="p-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-600">
                            <ArrowRight className="h-5 w-5 text-white" />
                          </div>
                        </div>

                        {/* After Image */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-white/60 uppercase tracking-wide">
                            {language === 'fr' ? 'Après' : 'After'}
                          </div>
                          <div className="relative rounded-lg overflow-hidden bg-black/20 aspect-square">
                            <img
                              src={example.after_image_url}
                              alt="After"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Prompt */}
                      <div className="mt-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-orange-300/80 mb-1 font-medium">
                              {language === 'fr' ? 'Prompt utilisé :' : 'Prompt used:'}
                            </p>
                            <p className="text-sm text-orange-200/90 leading-relaxed">
                              {example.prompt}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
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