import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';

export default function VideoGenerationModal({ visual, isOpen, onClose, onVideoGenerated }) {
  const { language } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      // Start video generation
      const response = await base44.functions.invoke('generateVideo', {
        image_url: visual.image_url,
        prompt: prompt.trim(),
        duration: duration
      });

      const { task_id } = response.data;

      // Poll for status
      const pollInterval = setInterval(async () => {
        const statusResponse = await base44.functions.invoke('checkVideoStatus', { task_id });
        const { status, progress: currentProgress, video_url } = statusResponse.data;

        setProgress(currentProgress || 0);

        if (status === 'SUCCEEDED' && video_url) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          onVideoGenerated(video_url, prompt);
          onClose();
        } else if (status === 'FAILED') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          alert(language === 'fr' ? 'Erreur lors de la génération' : 'Generation failed');
        }
      }, 3000);

    } catch (error) {
      console.error(error);
      setIsGenerating(false);
      alert(language === 'fr' ? 'Erreur lors de la génération' : 'Generation failed');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              {language === 'fr' ? 'Animer ce visuel' : 'Animate this visual'}
            </h3>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Preview Image */}
          <div className="mb-4 rounded-xl overflow-hidden bg-black/20">
            <img 
              src={visual.image_url} 
              alt="Preview"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Prompt Input */}
          <div className="mb-4">
            <label className="text-white/80 text-sm mb-2 block">
              {language === 'fr' 
                ? 'Comment voulez-vous animer ce visuel ?' 
                : 'How do you want to animate this visual?'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder={language === 'fr' 
                ? 'Ex: Zoom lent vers le logo, rotation douce, mouvement de caméra...' 
                : 'Ex: Slow zoom on logo, gentle rotation, camera movement...'}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-violet-500/50 transition-all resize-none disabled:opacity-50"
              rows={4}
            />
          </div>

          {/* Duration Selector */}
          <div className="mb-6">
            <label className="text-white/80 text-sm mb-2 block">
              {language === 'fr' ? 'Durée' : 'Duration'}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDuration(5)}
                disabled={isGenerating}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  duration === 5 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                } disabled:opacity-50`}
              >
                5s
              </button>
              <button
                onClick={() => setDuration(10)}
                disabled={isGenerating}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  duration === 10 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                } disabled:opacity-50`}
              >
                10s
              </button>
            </div>
            <p className="text-white/40 text-xs mt-2 text-center">
              {duration === 5 
                ? (language === 'fr' ? '15 crédits' : '15 credits') 
                : (language === 'fr' ? '25 crédits' : '25 credits')}
            </p>
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span>{language === 'fr' ? 'Génération en cours...' : 'Generating...'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              disabled={isGenerating}
              variant="outline"
              className="flex-1 bg-white/5 hover:bg-white/10 border-white/10"
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'fr' ? 'Génération...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {language === 'fr' ? 'Générer' : 'Generate'}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}