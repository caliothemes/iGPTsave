import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function CanvaTextModal({ isOpen, onClose, onConfirm }) {
  const { language } = useLanguage();
  const [texts, setTexts] = useState(['']);

  const addTextLine = () => {
    setTexts([...texts, '']);
  };

  const removeTextLine = (index) => {
    setTexts(texts.filter((_, i) => i !== index));
  };

  const updateText = (index, value) => {
    const newTexts = [...texts];
    newTexts[index] = value;
    setTexts(newTexts);
  };

  const handleConfirm = () => {
    const validTexts = texts.filter(t => t.trim());
    if (validTexts.length === 0) {
      alert(language === 'fr' ? 'Veuillez entrer au moins un texte' : 'Please enter at least one text');
      return;
    }
    onConfirm(validTexts);
    setTexts(['']);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-pink-500/30 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            {language === 'fr' ? '✨ Mode Canva - Textes éditables' : '✨ Canva Mode - Editable texts'}
          </DialogTitle>
          <p className="text-white/60 text-sm mt-2">
            {language === 'fr' 
              ? 'Entrez les textes que vous souhaitez voir apparaître sur votre visuel. Ils seront modifiables après génération.'
              : 'Enter the texts you want to see on your visual. They will be editable after generation.'}
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {texts.map((text, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={text}
                onChange={(e) => updateText(index, e.target.value)}
                placeholder={language === 'fr' ? `Texte ${index + 1}` : `Text ${index + 1}`}
                className="bg-white/10 border-white/20 text-white flex-1"
              />
              {texts.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTextLine(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addTextLine}
            className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'fr' ? 'Ajouter un texte' : 'Add text'}
          </Button>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
          >
            {language === 'fr' ? 'Valider' : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}