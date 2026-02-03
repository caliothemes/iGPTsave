import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from '@/lib/utils';

export default function EffectVariantsModal({ isOpen, onClose, effect, onGenerate }) {
  const { language } = useLanguage();
  const [selectedCount, setSelectedCount] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedCount) return;
    setIsGenerating(true);
    await onGenerate(selectedCount);
    setIsGenerating(false);
    onClose();
    setSelectedCount(null);
  };

  if (!isOpen || !effect) return null;

  const effectName = language === 'fr' ? effect.name_fr : (effect.name_en || effect.name_fr);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-emerald-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            {language === 'fr' ? 'Combien de variantes ?' : 'How many variants?'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-white/70 text-sm mb-2">
              {language === 'fr' ? 'Effet sélectionné :' : 'Selected effect:'}
            </p>
            <p className="text-white font-medium">{effectName}</p>
          </div>

          <div className="space-y-3">
            <p className="text-white/60 text-sm">
              {language === 'fr' 
                ? 'Choisissez le nombre de variantes à générer :' 
                : 'Choose the number of variants to generate:'}
            </p>
            
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(count => (
                <button
                  key={count}
                  onClick={() => setSelectedCount(count)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    selectedCount === count
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-emerald-500/30"
                  )}
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-[10px] mt-1 opacity-60">
                    {count} {language === 'fr' ? 'crédit' : 'credit'}{count > 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-blue-300 text-xs">
                ℹ️ {language === 'fr' 
                  ? 'Chaque variante coûte 1 crédit. Sélectionnez le nombre de propositions que vous souhaitez voir.' 
                  : 'Each variant costs 1 credit. Select the number of proposals you wish to see.'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              disabled={isGenerating}
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!selectedCount || isGenerating}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {language === 'fr' ? 'Générer' : 'Generate'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}