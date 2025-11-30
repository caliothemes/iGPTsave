import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Loader2, Check, Lock, Heart, Wand2, Pencil, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';
import DownloadModal from '@/components/DownloadModal';

const getAspectRatio = (dimensions) => {
  if (!dimensions) return '1/1';
  const [w, h] = dimensions.split('x').map(Number);
  if (!w || !h) return '1/1';
  return `${w}/${h}`;
};

export default function VisualCard({ 
  visual, 
  onRegenerate, 
  onDownload,
  onToggleFavorite,
  onVariation,
  onEdit,
  isRegenerating,
  canDownload,
  hasWatermark,
  showActions = true,
  showValidation = false,
  onValidate,
  compact = false
}) {
  const { t, language } = useLanguage();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadClick = () => {
    if (!canDownload) return;
    setShowDownloadModal(true);
  };

  const handleDownloadComplete = async (format) => {
    await onDownload?.(format);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 group">
      {/* Image Container */}
              <div className="relative overflow-hidden" style={{ aspectRatio: getAspectRatio(visual.dimensions) }}
        <img 
          src={visual.image_url} 
          alt={visual.title || 'Visuel généré'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(visual)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all"
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-all",
                visual.is_favorite ? "fill-red-500 text-red-500" : "text-white/80"
              )} 
            />
          </button>
        )}

        {/* Version Badge */}
        {visual.version > 1 && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-violet-600/80 backdrop-blur-sm text-white text-xs">
            v{visual.version}
          </div>
        )}
        
        {/* Watermark Overlay */}
        {hasWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white/20 text-3xl font-bold rotate-[-30deg] select-none">
              iGPT
            </div>
          </div>
        )}

        {/* Regenerating Overlay */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-violet-400 animate-spin mx-auto mb-2" />
              <span className="text-white/80 text-sm">
                {language === 'fr' ? 'Création en cours...' : 'Creating...'}
              </span>
            </div>
          </div>
        )}

        {/* Color Palette Display */}
        {visual.color_palette && visual.color_palette.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-1">
            {visual.color_palette.map((color, idx) => (
              <div
                key={idx}
                className="h-2 flex-1 first:rounded-l-full last:rounded-r-full shadow-lg"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info & Actions */}
      {showActions && (
        <div className="p-4 space-y-3">
          {visual.title && (
            <h3 className="text-white font-medium truncate">{visual.title}</h3>
          )}
          
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {visual.visual_type && (
              <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                {visual.visual_type.replace('_', ' ')}
              </span>
            )}
            {visual.dimensions && (
              <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                {visual.dimensions}
              </span>
            )}
            {visual.style && (
              <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-300">
                {visual.style}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Variation Button */}
            {onVariation && (
              <Button
                size="sm"
                onClick={() => onVariation(visual)}
                disabled={isRegenerating}
                className="flex-1 bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-600 hover:to-orange-600 text-white border-0"
              >
                <Wand2 className="h-4 w-4 mr-1.5" />
                <span className="text-xs">{language === 'fr' ? 'Variation' : 'Variation'}</span>
              </Button>
            )}

            {/* Regenerate Button */}
            <Button
              size="sm"
              onClick={() => onRegenerate(visual)}
              disabled={isRegenerating}
              className="flex-1 bg-gradient-to-r from-violet-800/80 to-purple-800/80 hover:from-violet-900 hover:to-purple-900 text-white border-0"
            >
              <RefreshCw className={cn("h-4 w-4 mr-1.5", isRegenerating && "animate-spin")} />
              <span className="text-xs">{t('regenerate')}</span>
            </Button>
          </div>

          {/* Validation Buttons */}
          {showValidation && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleDownloadClick}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <Download className="h-4 w-4 mr-1.5" />
                <span className="text-xs">{language === 'fr' ? 'Télécharger' : 'Download'}</span>
              </Button>
              <Button
                size="sm"
                onClick={() => onValidate?.('edit')}
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                <Pencil className="h-4 w-4 mr-1.5" />
                <span className="text-xs">{language === 'fr' ? 'Personnaliser' : 'Customize'}</span>
              </Button>
            </div>
          )}

          {/* Download Button (when not in validation mode) */}
          {!showValidation && (
            <>
              {/* Edit Button - compact mode shows icon only in a row */}
              {onEdit && compact ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onEdit(visual)}
                    className="flex-1 bg-gradient-to-r from-violet-600/80 to-purple-600/80 hover:from-violet-600 hover:to-purple-600"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    <span className="text-xs">{language === 'fr' ? 'Éditer' : 'Edit'}</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownloadClick}
                    disabled={!canDownload}
                    className={cn(
                      "flex-1 transition-all",
                      canDownload 
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" 
                        : "bg-white/10 cursor-not-allowed"
                    )}
                  >
                    {downloaded ? (
                      <Check className="h-4 w-4" />
                    ) : !canDownload ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  {onEdit && (
                    <Button
                      size="sm"
                      onClick={() => onEdit(visual)}
                      className="w-full bg-gradient-to-r from-violet-600/80 to-purple-600/80 hover:from-violet-600 hover:to-purple-600 mb-2"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      {language === 'fr' ? 'Personnaliser' : 'Customize'}
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={handleDownloadClick}
                    disabled={!canDownload}
                    className={cn(
                      "w-full transition-all",
                      canDownload 
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" 
                        : "bg-white/10 cursor-not-allowed"
                    )}
                  >
                    {downloaded ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : !canDownload ? (
                      <Lock className="h-4 w-4 mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {downloaded ? t('downloaded') : t('download')}
                  </Button>
                </>
              )}

              {!canDownload && (
                <p className="text-xs text-amber-400/80 text-center">
                  {t('noCredits')}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        visual={visual}
        onDownload={handleDownloadComplete}
      />
    </div>
  );
}