import React from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { useLanguage } from './LanguageContext';
import { Sparkles, Zap, Crown } from 'lucide-react';

export default function NoCreditsModal({ isOpen, onClose, onRecharge }) {
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
          className="bg-gradient-to-br from-gray-900/98 via-amber-900/95 to-gray-900/98 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-amber-500/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="default" showText={false} />
          </div>
          
          {/* Title */}
          <h3 className="text-white font-bold text-2xl mb-3 text-center bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            {language === 'fr' ? '💳 Plus de crédits disponibles' : '💳 No credits available'}
          </h3>
          
          {/* Message */}
          <p className="text-white/80 text-sm leading-relaxed mb-6 text-center">
            {language === 'fr' 
              ? 'Vous avez utilisé tous vos crédits ce mois-ci. Rechargez pour continuer à créer des visuels incroyables avec iGPT !'
              : 'You\'ve used all your credits this month. Recharge to continue creating amazing visuals with iGPT!'
            }
          </p>

          {/* Options */}
          <div className="space-y-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-white font-semibold">
                  {language === 'fr' ? 'Packs de crédits' : 'Credit packs'}
                </span>
              </div>
              <p className="text-white/60 text-xs ml-11">
                {language === 'fr' ? 'À partir de 19,90€ pour 250 crédits' : 'From €19.90 for 250 credits'}
              </p>
            </div>

            <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <Zap className="h-5 w-5 text-violet-400" />
                </div>
                <span className="text-white font-semibold">
                  {language === 'fr' ? 'Abonnement PRO' : 'PRO Subscription'}
                </span>
              </div>
              <p className="text-white/60 text-xs ml-11">
                {language === 'fr' ? '14,90€/mois - 250 crédits mensuels' : '€14.90/mo - 250 monthly credits'}
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Crown className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-white font-semibold">
                  {language === 'fr' ? 'Abonnement ELITE' : 'ELITE Subscription'}
                </span>
              </div>
              <p className="text-white/60 text-xs ml-11">
                {language === 'fr' ? '24,90€/mois - 500 crédits mensuels' : '€24.90/mo - 500 monthly credits'}
              </p>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                onRecharge();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-700 hover:via-orange-700 hover:to-amber-700 text-white font-semibold py-6 text-base shadow-lg shadow-amber-500/30"
            >
              {language === 'fr' ? '🚀 Recharger mes crédits' : '🚀 Recharge my credits'}
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