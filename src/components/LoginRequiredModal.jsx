import React from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { useLanguage } from './LanguageContext';

export default function LoginRequiredModal({ isOpen, onClose, onLogin, guestPromptsUsed = 0 }) {
  const { language } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gradient-to-br from-gray-900/98 via-violet-900/95 to-gray-900/98 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-violet-500/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="default" showText={false} />
          </div>
          
          {/* Title */}
          <h3 className="text-white font-bold text-2xl mb-3 text-center bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            {language === 'fr' ? '🎨 Continuez à créer !' : '🎨 Keep creating!'}
          </h3>
          
          {/* Message */}
          <p className="text-white/80 text-sm leading-relaxed mb-6 text-center">
            {language === 'fr' 
              ? `Vous avez utilisé vos ${guestPromptsUsed} générations gratuites sans compte. Créez un compte pour obtenir 25 crédits gratuits par mois et débloquer toutes les fonctionnalités d'iGPT !`
              : `You've used your ${guestPromptsUsed} free generations without an account. Create an account to get 25 free credits per month and unlock all iGPT features!`
            }
          </p>

          {/* Benefits */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 text-lg">✓</span>
              </div>
              <span className="text-white/70 text-sm">
                {language === 'fr' ? '25 crédits/mois gratuits' : '25 credits/month free'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 text-lg">✓</span>
              </div>
              <span className="text-white/70 text-sm">
                {language === 'fr' ? 'Historique & favoris sauvegardés' : 'History & favorites saved'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 text-lg">✓</span>
              </div>
              <span className="text-white/70 text-sm">
                {language === 'fr' ? 'Téléchargements HD sans filigrane' : 'HD downloads without watermark'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 text-lg">✓</span>
              </div>
              <span className="text-white/70 text-sm">
                {language === 'fr' ? 'Éditeur magique complet' : 'Full magic editor'}
              </span>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                onLogin();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-base shadow-lg shadow-violet-500/30"
            >
              {language === 'fr' ? '🚀 Créer mon compte gratuitement' : '🚀 Create my free account'}
            </Button>
            
            <button
              onClick={onClose}
              className="w-full text-white/50 hover:text-white/70 text-sm transition-colors"
            >
              {language === 'fr' ? 'Plus tard' : 'Later'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}