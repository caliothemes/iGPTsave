import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Loader2, Check, Lock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';

export default function VisualCard({ 
  visual, 
  onRegenerate, 
  onDownload, 
  isRegenerating,
  canDownload,
  hasWatermark
}) {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    if (!canDownload) return;
    setDownloading(true);
    await onDownload();
    setDownloading(false);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 group">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={visual.image_url} 
          alt={visual.title || 'Visuel généré'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Watermark Overlay */}
        {hasWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white/30 text-2xl font-bold rotate-[-30deg] select-none">
              iGPT
            </div>
          </div>
        )}

        {/* Regenerating Overlay */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-violet-400 animate-spin mx-auto mb-2" />
              <span className="text-white/80 text-sm">Régénération...</span>
            </div>
          </div>
        )}
      </div>

      {/* Info & Actions */}
      <div className="p-4 space-y-3">
        {visual.title && (
          <h3 className="text-white font-medium truncate">{visual.title}</h3>
        )}
        
        <div className="flex items-center gap-2 text-xs text-white/50">
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
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex-1 bg-gradient-to-r from-violet-600/80 to-purple-600/80 hover:from-violet-600 hover:to-purple-600 text-white border-0"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRegenerating && "animate-spin")} />
            {t('regenerate')}
          </Button>
          
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={!canDownload || downloading}
            className={cn(
              "flex-1 transition-all",
              canDownload 
                ? "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700" 
                : "bg-white/10 cursor-not-allowed"
            )}
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : downloaded ? (
              <Check className="h-4 w-4 mr-2" />
            ) : !canDownload ? (
              <Lock className="h-4 w-4 mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {downloaded ? t('downloaded') : t('download')}
          </Button>
        </div>

        {!canDownload && (
          <p className="text-xs text-amber-400/80 text-center">
            {t('noCredits')}
          </p>
        )}
      </div>
    </div>
  );
}