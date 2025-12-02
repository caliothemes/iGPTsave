import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Send, Loader2, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '../LanguageContext';

export default function ServiceUnavailableModal({ isOpen, onClose, user, errorType }) {
  const { language } = useLanguage();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReport = async () => {
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: 'caliothemes@gmail.com',
        subject: '[iGPT] Problème Remove BG signalé',
        body: `Un utilisateur a signalé un problème avec la fonction Remove BG.\n\nUtilisateur: ${user?.email || 'Non connecté'}\nDate: ${new Date().toLocaleString()}\nErreur: ${errorType}`
      });
      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false);
      }, 2000);
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            {language === 'fr' ? 'Fonction indisponible' : 'Feature unavailable'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <p className="text-white/80 text-sm">
            {language === 'fr' 
              ? 'Cette fonction est temporairement indisponible. Vous pouvez signaler ce problème à un administrateur pour qu\'il soit résolu rapidement.'
              : 'This feature is temporarily unavailable. You can report this issue to an administrator so it can be resolved quickly.'}
          </p>
          
          {sent ? (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span>{language === 'fr' ? 'Problème signalé ! Merci.' : 'Issue reported! Thank you.'}</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              >
                {language === 'fr' ? 'Fermer' : 'Close'}
              </Button>
              <Button
                onClick={handleReport}
                disabled={sending}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {language === 'fr' ? 'Signaler' : 'Report'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}