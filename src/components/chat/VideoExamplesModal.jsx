import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';

export default function VideoExamplesModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const [examples, setExamples] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const t = {
    fr: {
      title: "Exemples concrets de génération vidéo",
      imageStart: "Image de départ",
      prompt: "Prompt utilisé",
      result: "Résultat vidéo",
      provider: "Générateur",
      duration: "Durée",
      noExamples: "Aucun exemple disponible"
    },
    en: {
      title: "Real video generation examples",
      imageStart: "Starting image",
      prompt: "Prompt used",
      result: "Video result",
      provider: "Generator",
      duration: "Duration",
      noExamples: "No examples available"
    }
  }[language];

  useEffect(() => {
    if (isOpen) {
      loadExamples();
    }
  }, [isOpen]);

  const loadExamples = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.VideoExample.filter(
        { is_active: true },
        'order',
        50
      );
      setExamples(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading examples:', error);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-gray-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-400" />
            {t.title}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : examples.length === 0 ? (
          <div className="text-center py-20 text-white/60">{t.noExamples}</div>
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
                  Précédent
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
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Timeline Example */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6"
              >
                {/* Title */}
                <h3 className="text-xl font-semibold text-center">
                  {currentExample[`title_${language}`] || currentExample.title_fr || 'Exemple'}
                </h3>

                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_2fr_auto_1fr] gap-6 items-center">
                  {/* Step 1: Image */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 text-white text-sm font-bold mb-2">
                        1
                      </span>
                      <p className="text-sm font-medium text-white/80">{t.imageStart}</p>
                      {/* Badge - Above image */}
                      <div className="inline-flex px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600/95 to-purple-600/95 backdrop-blur-sm border border-violet-400/30 shadow-lg mt-2 mb-2">
                        <p className="text-white text-xs font-medium flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3" />
                          {language === 'fr' ? 'Générez une image dans iGPT et cliquez sur l\'icône' : 'Generate an image in iGPT and click on the icon'}
                          {' '}
                          <svg className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </p>
                      </div>
                    </div>
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-white/10 shadow-lg">
                      <img
                        src={currentExample.image_url}
                        alt="Starting image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Arrow 1 */}
                  <div className="hidden md:flex justify-center">
                    <ArrowRight className="h-8 w-8 text-violet-400" />
                  </div>

                  {/* Step 2: Prompt */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold mb-2">
                        2
                      </span>
                      <p className="text-sm font-medium text-white/80">{t.prompt}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-sm text-white/90 leading-relaxed">
                        {currentExample.prompt}
                      </p>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-xs text-white/60">
                        <span>
                          {t.provider}: <span className="text-violet-400 font-medium">
                            {currentExample.provider === 'replicate' ? 'Kling v2.5 Pro' : 'RunwayML Gen-3'}
                          </span>
                        </span>
                        {currentExample.duration && (
                          <span>
                            {t.duration}: <span className="text-emerald-400 font-medium">
                              {currentExample.duration}s
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow 2 */}
                  <div className="hidden md:flex justify-center">
                    <ArrowRight className="h-8 w-8 text-violet-400" />
                  </div>

                  {/* Step 3: Video Result */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold mb-2">
                        3
                      </span>
                      <p className="text-sm font-medium text-white/80">{t.result}</p>
                    </div>
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-emerald-500/30 shadow-lg">
                      <video
                        src={currentExample.video_url}
                        controls
                        autoPlay
                        loop
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}