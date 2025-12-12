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
  const [autoPrompt, setAutoPrompt] = useState(true);

  const handleGenerate = async () => {
    // Define final prompt first
    const finalPrompt = autoPrompt 
      ? 'Dynamic cinematic camera movement with slow zoom in, elegant smooth panning motion, professional color grading with rich contrast, dramatic lighting transitions, subtle depth of field effects, film-like motion blur, atmospheric glow and bokeh, sophisticated parallax effect, seamless fluid animation, premium production quality'
      : prompt.trim();
    
    if (!finalPrompt) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      // Start video generation
      const response = await base44.functions.invoke('generateVideo', {
        image_url: visual.image_url,
        prompt: finalPrompt,
        duration: duration,
        dimensions: visual.dimensions
      });

      console.log('Generate video response:', response);

      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || 'Erreur serveur');
      }

      if (!response.data.task_id) {
        throw new Error('Pas de task_id retourné');
      }

      const { task_id } = response.data;
      console.log('Task ID:', task_id);

      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await base44.functions.invoke('checkVideoStatus', { task_id });
          console.log('Status response:', statusResponse);

          if (!statusResponse.data) {
            clearInterval(pollInterval);
            setIsGenerating(false);
            alert(language === 'fr' ? 'Erreur: pas de données reçues' : 'Error: no data received');
            return;
          }

          const { status, progress: currentProgress, video_url, failure } = statusResponse.data;

          // Progress is a decimal (0.0 to 1.0), convert to percentage
          if (currentProgress !== undefined && currentProgress !== null) {
            setProgress(currentProgress * 100);
          }

          if (status === 'SUCCEEDED' && video_url) {
            clearInterval(pollInterval);
            setIsGenerating(false);
            onVideoGenerated(video_url, finalPrompt);
            onClose();
          } else if (status === 'FAILED') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            alert(language === 'fr' 
              ? `Erreur: ${failure || 'Échec de génération'}` 
              : `Error: ${failure || 'Generation failed'}`);
          }
        } catch (pollError) {
          console.error('Poll error:', pollError);
          clearInterval(pollInterval);
          setIsGenerating(false);
          alert(language === 'fr' ? `Erreur de vérification: ${pollError.message}` : `Status check error: ${pollError.message}`);
        }
      }, 3000);

    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      const errorMsg = error.message || error.toString();
      alert(language === 'fr' 
        ? `Erreur lors de la génération: ${errorMsg}` 
        : `Generation error: ${errorMsg}`);
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
          className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
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

          {/* Format Notice */}
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <svg className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-amber-200 text-xs leading-relaxed">
                {language === 'fr'
                  ? 'Les vidéos sont générées au format 16:9 (paysage) pour une compatibilité optimale.'
                  : 'Videos are generated in 16:9 format (landscape) for optimal compatibility.'}
              </p>
            </div>
          </div>

          {/* Auto Prompt Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setAutoPrompt(!autoPrompt)}
              disabled={isGenerating}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/30 transition-all disabled:opacity-50"
            >
              <div className={`flex-shrink-0 w-11 h-6 rounded-full transition-all ${autoPrompt ? 'bg-violet-600' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 mt-0.5 rounded-full bg-white transition-transform duration-200 ${autoPrompt ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-medium">
                  {language === 'fr' ? 'Laissez iGPT gérer l\'animation' : 'Let iGPT handle the animation'}
                </p>
                <p className="text-white/50 text-xs">
                  {language === 'fr' 
                    ? 'iGPT choisira le meilleur mouvement cinématique' 
                    : 'iGPT will choose the best cinematic motion'}
                </p>
              </div>
              <svg className="h-5 w-5 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>

          {/* Prompt Input - Only show if auto prompt is disabled */}
          {!autoPrompt && (
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-1 block">
                {language === 'fr' 
                  ? 'Comment voulez-vous animer ce visuel ?' 
                  : 'How do you want to animate this visual?'}
              </label>
              <p className="text-white/40 text-xs mb-2">
                {language === 'fr'
                  ? '✨ Soyez détaillé et précis : décrivez le mouvement, la caméra, l\'ambiance, les effets pour des résultats époustouflants.'
                  : '✨ Be detailed and precise: describe movement, camera, atmosphere, effects for stunning results.'}
              </p>
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

              {/* Example Prompts */}
              <div className="mt-2 space-y-1.5">
                <p className="text-white/40 text-[10px] mb-1">
                  {language === 'fr' ? 'Exemples de prompts :' : 'Prompt examples:'}
                </p>
                <button
                  type="button"
                  onClick={() => setPrompt(language === 'fr' 
                    ? 'Zoom cinématographique lent vers le centre, mouvement de caméra fluide, éclairage dramatique, effet bokeh subtil, transitions douces'
                    : 'Slow cinematic zoom to center, smooth camera movement, dramatic lighting, subtle bokeh effect, soft transitions')}
                  disabled={isGenerating}
                  className="w-full text-left px-3 py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-200 text-xs transition-all disabled:opacity-50"
                >
                  {language === 'fr' 
                    ? '📸 Zoom cinématographique lent vers le centre, mouvement de caméra fluide...'
                    : '📸 Slow cinematic zoom to center, smooth camera movement...'}
                </button>
                <button
                  type="button"
                  onClick={() => setPrompt(language === 'fr'
                    ? 'Rotation douce dans le sens horaire, parallaxe sur les éléments, profondeur de champ progressive, lumières scintillantes, ambiance mystérieuse'
                    : 'Gentle clockwise rotation, parallax on elements, progressive depth of field, twinkling lights, mysterious atmosphere')}
                  disabled={isGenerating}
                  className="w-full text-left px-3 py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-200 text-xs transition-all disabled:opacity-50"
                >
                  {language === 'fr'
                    ? '🔄 Rotation douce dans le sens horaire, parallaxe sur les éléments...'
                    : '🔄 Gentle clockwise rotation, parallax on elements...'}
                </button>
                <button
                  type="button"
                  onClick={() => setPrompt(language === 'fr'
                    ? 'Panoramique horizontal fluide de gauche à droite, flou de mouvement élégant, étalonnage des couleurs cinématique, effets de lumière dynamiques'
                    : 'Smooth horizontal pan from left to right, elegant motion blur, cinematic color grading, dynamic light effects')}
                  disabled={isGenerating}
                  className="w-full text-left px-3 py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-200 text-xs transition-all disabled:opacity-50"
                >
                  {language === 'fr'
                    ? '↔️ Panoramique horizontal fluide de gauche à droite, flou de mouvement...'
                    : '↔️ Smooth horizontal pan from left to right, elegant motion blur...'}
                </button>
              </div>
            </div>
          )}

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
            <div className="flex justify-center mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-medium">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {duration === 5 
                  ? (language === 'fr' ? '20 crédits' : '20 credits') 
                  : (language === 'fr' ? '35 crédits' : '35 credits')}
              </span>
            </div>
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
              disabled={(!autoPrompt && !prompt.trim()) || isGenerating}
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

          {/* RunwayML Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692a3549022b223ef419900f/fafb0401f_runwayLM.png"
                  alt="RunwayML"
                  className="h-8 w-8 rounded-lg"
                />
                <div>
                  <p className="text-white/90 text-xs font-medium">
                    {language === 'fr' ? 'Vidéo générée par RunwayML' : 'Video generated by RunwayML'}
                  </p>
                  <p className="text-white/50 text-[10px]">
                    {language === 'fr' ? 'Vidéo HD • Gen-3 Alpha Turbo' : 'HD Video • Gen-3 Alpha Turbo'}
                  </p>
                </div>
              </div>
              <a 
                href="https://runwayml.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 text-xs transition-colors"
              >
                runwayml.com →
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}