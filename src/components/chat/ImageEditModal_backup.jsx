import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, X, Sparkles, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';

export default function ImageEditModal({ visual, isOpen, onClose, onEditComplete }) {
  const { language } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      setProgress(10);
      
      const response = await base44.functions.invoke('editImageWithReplicate', {
        image_url: visual.image_url,
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio
      });

      console.log('Image edit response:', response);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setProgress(100);
      
      // Callback avec la nouvelle URL
      setTimeout(() => {
        onEditComplete(response.data.output_url, prompt);
        onClose();
      }, 500);

    } catch (error) {
      console.error('Image edit error:', error);
      alert(language === 'fr' 
        ? `Erreur lors de l'édition: ${error.message}` 
        : `Edit error: ${error.message}`);
    } finally {
      setIsGenerating(false);
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
              <Wand2 className="h-5 w-5 text-orange-400" />
              {language === 'fr' ? 'Modifier l\'image avec IA' : 'Edit image with AI'}
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

          {/* Info Banner */}
          <div className="mb-4 p-3 rounded-xl border bg-orange-500/10 border-orange-500/20">
            <div className="flex items-start gap-2">
              <svg className="h-4 w-4 flex-shrink-0 mt-0.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-xs mb-0.5 text-orange-200">
                  PrunaAI Image Edit - Turbo Mode
                </p>
                <p className="text-xs leading-relaxed text-orange-200/80">
                  {language === 'fr' 
                    ? 'Modifiez votre image avec des instructions précises. Le modèle conserve la structure de base et applique vos modifications.' 
                    : 'Modify your image with precise instructions. The model keeps the base structure and applies your changes.'}
                </p>
              </div>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="mb-4">
            <label className="text-white/80 text-sm mb-2 block">
              {language === 'fr' ? 'Format de sortie' : 'Output format'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['1:1', '16:9', '9:16'].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  disabled={isGenerating}
                  className={`px-3 py-2 rounded-lg border transition-all text-sm disabled:opacity-50 ${
                    aspectRatio === ratio
                      ? 'bg-orange-600 border-orange-500 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="text-white/80 text-sm mb-1 block">
              {language === 'fr' 
                ? 'Que voulez-vous modifier ?' 
                : 'What do you want to modify?'}
            </label>
            <p className="text-white/40 text-xs mb-2">
              {language === 'fr'
                ? '✨ Soyez précis : ajoutez des éléments, changez des couleurs, modifiez l\'ambiance...'
                : '✨ Be specific: add elements, change colors, modify atmosphere...'}
            </p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder={language === 'fr' 
                ? 'Ex: Ajouter un ciel étoilé, changer la couleur en bleu, ajouter des reflets...' 
                : 'Ex: Add starry sky, change color to blue, add reflections...'}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-orange-500/50 transition-all resize-none disabled:opacity-50"
              rows={4}
            />

            {/* Example Prompts */}
            <div className="mt-2 space-y-1.5">
              <p className="text-white/40 text-[10px] mb-1">
                {language === 'fr' ? 'Exemples :' : 'Examples:'}
              </p>
              {[
                { fr: '🎨 Changer les couleurs en tons chauds', en: '🎨 Change colors to warm tones' },
                { fr: '✨ Ajouter des effets lumineux', en: '✨ Add light effects' },
                { fr: '🌆 Transformer en version nocturne', en: '🌆 Transform to night version' },
              ].map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(language === 'fr' ? example.fr : example.en)}
                  disabled={isGenerating}
                  className="w-full text-left px-3 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-200 text-xs transition-all disabled:opacity-50"
                >
                  {language === 'fr' ? example.fr : example.en}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span>{language === 'fr' ? 'Modification en cours...' : 'Editing...'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
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
              className="flex-1 bg-white/5 hover:bg-white/10 border-white/10 text-white"
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'fr' ? 'Modification...' : 'Editing...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {language === 'fr' ? 'Modifier' : 'Edit'}
                </>
              )}
            </Button>
          </div>

          {/* Generation time estimate */}
          <p className="text-center text-white/40 text-[10px] mt-2">
            {language === 'fr' ? 'Temps de génération : 30-60 sec' : 'Generation time: 30-60 sec'}
          </p>

          {/* Provider Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white/90 text-xs font-medium">
                    {language === 'fr' ? 'Modifié par PrunaAI' : 'Edited by PrunaAI'}
                  </p>
                  <p className="text-white/50 text-[10px]">
                    {language === 'fr' ? 'Edition IA ultra-rapide • Turbo Mode' : 'Ultra-fast AI editing • Turbo Mode'}
                  </p>
                </div>
              </div>
              <a 
                href="https://replicate.com/prunaai/p-image-edit"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 text-xs transition-colors"
              >
                replicate.com →
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}