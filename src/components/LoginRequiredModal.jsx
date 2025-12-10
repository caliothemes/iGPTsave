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
          <div className="flex justify-center mb-8">
            <Logo size="large" showText={false} />
          </div>
          
          {/* Title */}
          <h3 className="text-white font-bold text-2xl mb-4 text-center">
            {language === 'fr' ? 'Plus de crédits' : 'No more credits'}
          </h3>
          
          {/* Message */}
          <p className="text-white/80 text-base leading-relaxed mb-8 text-center">
            {language === 'fr' 
              ? 'Vous avez utilisé vos 3 crédits / messages gratuits sans compte. Pour continuer d\'utiliser iGPT créez votre compte gratuitement et obtenez 25 crédits / messages mensuels.'
              : 'You\'ve used your 3 free credits / messages without an account. To continue using iGPT, create your free account and get 25 credits / messages monthly.'
            }
          </p>
          
          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                onLogin();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-base shadow-lg shadow-violet-500/30"
            >
              {language === 'fr' ? 'Créer mon compte gratuitement' : 'Create my free account'}
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