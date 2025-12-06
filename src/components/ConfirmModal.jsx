import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{message}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/10 hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              Continuer
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}