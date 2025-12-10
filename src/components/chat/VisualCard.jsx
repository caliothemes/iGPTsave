import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Loader2, Check, Lock, Heart, Wand2, Pencil, Sparkles, Video, X, Info } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';
import DownloadModal from '@/components/DownloadModal';
import { toast } from 'sonner';

const getAspectRatio = (dimensions) => {
  if (!dimensions) return '1/1';
  // Handle formats like "85x55" (business card) or "1080x1080"
  const [w, h] = dimensions.split('x').map(Number);
  if (!w || !h) return '1/1';
  // Simplify the ratio for cleaner CSS
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(w, h);
  return `${w / divisor}/${h / divisor}`;
};

export default function VisualCard({ 
  visual, 
  onRegenerate, 
  onDownload,
  onToggleFavorite,
  onVariation,
  onEdit,
  onPromptClick,
  // onAnimate, // Temporarily hidden
  isRegenerating,
  canDownload,
  hasWatermark,
  showActions = true,
  showValidation = false,
  onValidate,
  compact = false,
  hideInfoMessage = false
}) {
  const { t, language } = useLanguage();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showWatermarkBanner, setShowWatermarkBanner] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [copiedColor, setCopiedColor] = useState(null);

  // Show watermark banner on mount if hasWatermark
  React.useEffect(() => {
    if (hasWatermark && !localStorage.getItem('hideWatermarkBanner')) {
      const timer = setTimeout(() => {
        setShowWatermarkBanner(true);
        setTimeout(() => setShowWatermarkBanner(false), 4000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasWatermark]);

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleDownloadClick = () => {
    if (!canDownload) {
      toast.error(
        language === 'fr' 
          ? '💳 Rechargez vos crédits pour télécharger' 
          : '💳 Recharge your credits to download',
        { duration: 3000 }
      );
      return;
    }
    setShowDownloadModal(true);
  };

  const handleDownloadComplete = async (format) => {
    await onDownload?.(format);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <>
      <div className="rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 group">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-black/20" style={{ aspectRatio: getAspectRatio(visual.dimensions) }}>
          <img 
          src={visual.image_url} 
          alt={visual.title || 'Visuel généré'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Top Right Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-center">
          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(visual)}
              className="hover:scale-110 transition-all"
            >
              <Heart 
                className={cn(
                  "h-6 w-6 transition-all drop-shadow-lg",
                  visual.is_favorite ? "fill-red-500 text-red-500" : "text-white/90"
                )} 
              />
            </button>
          )}

          {/* Magic Editor Button (top) */}
          {showValidation && onValidate && (
            <button
              onClick={() => onValidate?.('edit')}
              className="group relative p-2.5 rounded-xl bg-gradient-to-br from-violet-600/90 to-purple-600/90 backdrop-blur-sm hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/30 border border-violet-400/30"
            >
              <Pencil className="h-5 w-5 text-white" />
              {/* Tooltip on hover */}
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900/95 backdrop-blur-sm border border-violet-500/30 rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                  <p className="text-white text-xs font-medium">{language === 'fr' ? 'Éditeur Magique' : 'Magic Editor'}</p>
                  <p className="text-white/60 text-[10px] mt-0.5">{language === 'fr' ? 'Fond, texture, texte...' : 'Background, texture, text...'}</p>
                </div>
              </div>
            </button>
          )}
        </div>

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

        {/* Watermark Info Banner - appears inside image */}
        {showWatermarkBanner && (
          <div 
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-2 duration-300 cursor-pointer"
            onClick={() => {
              setShowWatermarkBanner(false);
              localStorage.setItem('hideWatermarkBanner', 'true');
            }}
          >
            <div className="px-3 py-2 bg-blue-900/90 backdrop-blur-sm border border-blue-400/30 rounded-lg shadow-lg">
              <p className="text-blue-100 text-xs text-center whitespace-nowrap">
                {language === 'fr' 
                  ? "Le filigrane disparaît au téléchargement" 
                  : "Watermark disappears on download"}
              </p>
            </div>
          </div>
        )}

        {/* Regenerating Overlay */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-violet-950/60 to-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              {/* Spinner avec cercles concentriques */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-violet-300 animate-pulse" />
              </div>
              
              {/* Texte */}
              <div className="space-y-1">
                <span className="text-white font-medium text-sm block">
                  {language === 'fr' ? 'Création en cours...' : 'Creating...'}
                </span>
                <span className="text-white/60 text-xs block">
                  {language === 'fr' ? 'Génération de votre visuel' : 'Generating your visual'}
                </span>
              </div>
              
              {/* Progress bar animée */}
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 rounded-full animate-pulse" style={{ 
                  width: '60%',
                  animation: 'shimmer 2s ease-in-out infinite'
                }}></div>
              </div>
            </div>
            
            <style>{`
              @keyframes shimmer {
                0%, 100% { transform: translateX(-100%); opacity: 0.5; }
                50% { transform: translateX(150%); opacity: 1; }
              }
            `}</style>
          </div>
        )}

      </div>

      {/* Color Palette Bar - Just under image */}
      {visual.color_palette && visual.color_palette.length > 0 && (
        <button
          onClick={() => setShowColorModal(true)}
          className="w-full flex gap-1 p-3 hover:bg-white/5 transition-all cursor-pointer"
        >
          {visual.color_palette.map((color, idx) => (
            <div
              key={idx}
              className="flex-1 h-8 rounded-md shadow-lg hover:scale-105 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
        </button>
      )}

      {/* Info & Actions */}
      {showActions && (
        <div className="p-4 pt-2 space-y-3">
          {/* Info Message for certain visual types */}
          {!hideInfoMessage && ['print', 'social', 'image'].includes(visual.visual_type) && (
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200 leading-relaxed">
                {language === 'fr' 
                  ? 'Visuel créé sans texte (l\'IA n\'est pas performante sur les textes). Utilisez l\'Éditeur Magique pour ajouter vos textes et finaliser votre création.'
                  : 'Visual created without text (AI is not efficient with text). Use the Magic Editor to add your texts and finalize your creation.'}
              </p>
            </div>
          )}
          
          {/* Original Prompt - Clickable */}
          {visual.original_prompt && (
            <button
              onClick={() => onPromptClick?.(visual.original_prompt)}
              className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
              title={language === 'fr' ? 'Cliquer pour réutiliser ce prompt' : 'Click to reuse this prompt'}
            >
              <p className="text-white/60 text-xs line-clamp-4 group-hover:text-white/80 transition-colors">
                {visual.original_prompt}
              </p>
            </button>
          )}
          
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {visual.format_name && (
              <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                {visual.format_name}
              </span>
            )}
            {!visual.format_name && visual.dimensions && (
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

          {/* Action Buttons - Variation, Regenerate, Download on same line */}
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
            {onRegenerate && (
              <Button
                size="sm"
                onClick={() => onRegenerate(visual)}
                disabled={isRegenerating}
                className="flex-1 bg-gradient-to-r from-blue-600/80 to-cyan-600/80 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
              >
                <RefreshCw className={cn("h-4 w-4 mr-1.5", isRegenerating && "animate-spin")} />
                <span className="text-xs">{t('regenerate')}</span>
              </Button>
            )}

            {/* Download Button (icon only) */}
            {showValidation && (
              <Button
                size="sm"
                onClick={handleDownloadClick}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-3"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Magic Editor Button - Full width */}
          {showValidation && (
            <div className="space-y-2">
              <button
                onClick={() => onValidate?.('edit')}
                className="w-full bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 rounded-xl p-4 transition-all shadow-lg shadow-violet-500/20 border border-violet-400/20 group"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                    <Pencil className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">{language === 'fr' ? 'Éditeur Magique' : 'Magic Editor'}</p>
                    <p className="text-white/70 text-[11px] leading-tight">{language === 'fr' ? 'Personnalisez votre visuel en ajoutant un fond, une texture, un texte etc...' : 'Customize your visual by adding a background, texture, text etc...'}</p>
                  </div>
                </div>
              </button>
              {/* Animation button temporarily hidden
              {onAnimate && (
                <Button
                  size="sm"
                  onClick={() => onAnimate(visual)}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                >
                  <Video className="h-4 w-4 mr-1.5" />
                  <span className="text-xs">{language === 'fr' ? '✨ Animer ce visuel' : '✨ Animate this visual'}</span>
                </Button>
              )}
              */}
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
      </div>

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        visual={visual}
        onDownload={handleDownloadComplete}
      />

      {/* Color Palette Modal - Outside the card */}
      {showColorModal && visual.color_palette && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowColorModal(false)}
        >
          <div 
            className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">
                {language === 'fr' ? 'Palette de couleurs' : 'Color palette'}
              </h3>
              <button
                onClick={() => setShowColorModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {visual.color_palette.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => copyToClipboard(color)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-lg shadow-lg flex-shrink-0 border border-white/10"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1 text-left">
                    <p className="text-white font-mono text-sm">{color}</p>
                    <p className="text-white/50 text-xs">
                      {copiedColor === color 
                        ? (language === 'fr' ? '✓ Copié !' : '✓ Copied!') 
                        : (language === 'fr' ? 'Cliquer pour copier' : 'Click to copy')}
                    </p>
                  </div>
                  {copiedColor === color ? (
                    <Check className="h-5 w-5 text-green-400" />
                  ) : (
                    <div className="text-white/40 group-hover:text-white/60">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}