import React from 'react';
import { X, Heart, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from './LanguageContext';

export default function FavoritesModal({ isOpen, onClose, favorites, onSelectVisual }) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-amber-400 fill-amber-400" />
            <h2 className="text-white font-semibold">
              {language === 'fr' ? 'Mes favoris' : 'My favorites'}
            </h2>
            <span className="text-white/50 text-sm">({favorites.length})</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {favorites.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">
                {language === 'fr' 
                  ? 'Aucun favori pour le moment' 
                  : 'No favorites yet'}
              </p>
              <p className="text-white/30 text-xs mt-1">
                {language === 'fr' 
                  ? 'Cliquez sur ♡ pour ajouter un visuel' 
                  : 'Click ♡ to add a visual'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favorites.map((visual) => (
                <div
                  key={visual.id}
                  onClick={() => {
                    onSelectVisual(visual);
                    onClose();
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-amber-500/50 transition-all hover:scale-[1.02]"
                >
                  <img 
                    src={visual.image_url} 
                    alt={visual.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-medium truncate">
                        {visual.title || 'Visuel'}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Heart className="h-4 w-4 text-amber-400 fill-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}