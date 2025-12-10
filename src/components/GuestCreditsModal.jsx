import React from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { useLanguage } from './LanguageContext';


export default function GuestCreditsModal({ isOpen, onClose, onCreateAccount }) {
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
          className="bg-gradient-to-br from-gray-900/98 via-blue-900/95 to-gray-900/98 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-blue-500/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="large" showText={false} />
          </div>
          
          {/* Title */}
          <h3 className="text-white font-bold text-2xl mb-4 text-center">
            {language === 'fr' ? 'Crédits gratuits épuisés' : 'Free credits used'}
          </h3>
          
          {/* Message */}
          <p className="text-white/80 text-base leading-relaxed mb-8 text-center">
            {language === 'fr' 
              ? 'Vous avez utilisé tous vos 3 crédits gratuits sans compte, veuillez créer votre compte gratuitement pour bénéficier de 25 messages gratuits / mois.'
              : 'You\'ve used all your 3 free credits without an account, please create your free account to get 25 free messages/month.'
            }
          </p>
          
          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                onCreateAccount();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 hover:from-blue-700 hover:via-violet-700 hover:to-blue-700 text-white font-semibold py-6 text-base shadow-lg shadow-blue-500/30"
            >
              {language === 'fr' ? 'Créer mon compte gratuit' : 'Create my free account'}
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