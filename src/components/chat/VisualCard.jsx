import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Loader2, Check, Lock, Heart, Wand2, Feather, Sparkles, Film, X, Info, Expand, Scissors, Video, Pencil, Folder, Copy } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';
import DownloadModal from '@/components/DownloadModal';
import VideoGenerationModal from '@/components/chat/VideoGenerationModal';
import ADSModal from '@/components/chat/ADSModal';
import CropModal from '@/components/chat/CropModal';
import ImageEditModal from '@/components/chat/ImageEditModal';
import EffectsModal from '@/components/chat/EffectsModal';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function VisualCard({ 
  visual, 
  onRegenerate, 
  onDownload,
  onToggleFavorite,
  onVariation,
  onEdit,
  onPromptClick,
  onVideoGenerated,
  onCropComplete,
  onCropOpen,
  onVideoOpen,
  onImageEditOpen,
  onEffectApply,
  onFolderClick,
  onDuplicate,
  isRegenerating,
  canDownload,
  hasWatermark,
  showActions = true,
  showValidation = false,
  onValidate,
  compact = false,
  hideInfoMessage = false,
  onBackToImage,
  hideEditButton = false
}) {
  const { t, language } = useLanguage();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showADSModal, setShowADSModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [showEffectsModal, setShowEffectsModal] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showWatermarkBanner, setShowWatermarkBanner] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copiedColor, setCopiedColor] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [composedImageUrl, setComposedImageUrl] = useState(null);
  
  // Detect if this is a video
  const isVideo = visual.video_url || (visual.image_url && (visual.image_url.includes('.mp4') || visual.image_url.includes('/video')));
  
  // Parse video metadata from prompt
  const parseVideoMetadata = (prompt) => {
    if (!prompt) return { cleanPrompt: prompt, model: null, duration: null };
    
    // Match pattern: [Model Name] [5s] actual prompt
    const fullMatch = prompt.match(/^\[([^\]]+)\]\s*\[(\d+)s\]\s*(.*)$/);
    if (fullMatch) {
      return { 
        cleanPrompt: fullMatch[3], 
        model: fullMatch[1], 
        duration: fullMatch[2] 
      };
    }
    
    return { cleanPrompt: prompt, model: null, duration: null };
  };
  
  const { cleanPrompt, model: videoModel, duration: videoDuration } = isVideo ? parseVideoMetadata(visual.original_prompt) : { cleanPrompt: visual.original_prompt };

  // Compose image with text layers on mount if needed
  React.useEffect(() => {
    const composeImage = async () => {
      if (!visual.editor_layers || visual.editor_layers.length === 0) {
        setComposedImageUrl(null);
        return;
      }
      if (isVideo) return;
      
      try {
        const bgImage = new Image();
        bgImage.crossOrigin = 'anonymous';
        
        // Wait for image to fully load with timeout
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Image load timeout')), 10000);
          bgImage.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          bgImage.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Image load error'));
          };
          bgImage.src = visual.original_image_url || visual.image_url;
        });
        
        // Get original metadata dimensions (what we saved in the editor)
        let metadataWidth = bgImage.naturalWidth;
        let metadataHeight = bgImage.naturalHeight;

        if (visual.dimensions) {
          const [w, h] = visual.dimensions.split('x').map(Number);
          if (w && h) {
            metadataWidth = w;
            metadataHeight = h;
          }
        }

        // For composition, use metadata dimensions (same as editor saved at)
        const width = metadataWidth;
        const height = metadataHeight;

        // No scaling needed - layers are already at metadata scale
        const scaleX = 1;
        const scaleY = 1;
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(bgImage, 0, 0, width, height);
        
        visual.editor_layers.forEach((layer) => {
          if (layer.type === 'text' && layer.text && layer.visible !== false) {
            ctx.save();
            
            // Scale layer coordinates to match actual image size
            const scaledX = layer.x * scaleX;
            const scaledY = layer.y * scaleY;
            const scaledFontSize = layer.fontSize * scaleX;
            const scaledPadding = (layer.padding || 20) * scaleX;
            const scaledBorderRadius = (layer.borderRadius || 12) * scaleX;
            const scaledLetterSpacing = (layer.letterSpacing || 0) * scaleX;
            
            const fontWeight = layer.fontWeight || 700;
            const fontStyle = `${fontWeight} ${scaledFontSize}px ${layer.fontFamily}`;
            ctx.font = fontStyle;
            ctx.fillStyle = layer.color;
            ctx.textAlign = layer.align || 'center';
            ctx.letterSpacing = `${scaledLetterSpacing}px`;
            
            const metrics = ctx.measureText(layer.text);
            const textWidth = metrics.width;
            
            if (layer.backgroundColor && layer.backgroundColor !== 'transparent') {
              // Calculate box position based on text alignment
              let boxX;
              if (layer.align === 'center') {
                boxX = scaledX - textWidth / 2 - scaledPadding;
              } else if (layer.align === 'right') {
                boxX = scaledX - textWidth - scaledPadding;
              } else {
                // left or default
                boxX = scaledX - scaledPadding;
              }
              
              const boxY = scaledY - scaledFontSize * 0.85 - scaledPadding;
              const boxWidth = textWidth + scaledPadding * 2;
              const boxHeight = scaledFontSize * 1.15 + scaledPadding * 2;
              
              ctx.fillStyle = layer.backgroundColor;
              const radius = Math.min(scaledBorderRadius, boxWidth / 2, boxHeight / 2);
              ctx.beginPath();
              ctx.moveTo(boxX + radius, boxY);
              ctx.lineTo(boxX + boxWidth - radius, boxY);
              ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius);
              ctx.lineTo(boxX + boxWidth, boxY + boxHeight - radius);
              ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight);
              ctx.lineTo(boxX + radius, boxY + boxHeight);
              ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius);
              ctx.lineTo(boxX, boxY + radius);
              ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
              ctx.closePath();
              ctx.fill();
              ctx.fillStyle = layer.color;
            }
            
            // Only draw main text if NO reflection (to avoid doubling)
            if (!layer.reflection) {
              lines.forEach((line, i) => {
                ctx.fillText(line, scaledX, startY + i * lineHeight);
              });
            }

            // Reflection effect
            if (layer.reflection) {
              const textHeight = scaledFontSize;
              const reflectionGap = (layer.reflectionGap || 0) * scaleX;
              const reflectY = scaledY + reflectionGap;
              const reflectionHeight = textHeight * 1.2;
              
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = width;
              tempCanvas.height = reflectionHeight + 20;
              const tempCtx = tempCanvas.getContext('2d');
              
              tempCtx.save();
              tempCtx.font = fontStyle;
              tempCtx.textAlign = layer.align || 'center';
              tempCtx.fillStyle = layer.color;
              tempCtx.letterSpacing = `${scaledLetterSpacing}px`;
              
              tempCtx.translate(0, reflectionHeight);
              tempCtx.scale(1, -1);
              
              tempCtx.fillText(layer.text, scaledX, textHeight - 5);
              tempCtx.restore();
              
              tempCtx.globalCompositeOperation = 'destination-out';
              const fadeGradient = tempCtx.createLinearGradient(0, 0, 0, reflectionHeight);
              fadeGradient.addColorStop(0, 'rgba(0,0,0,0)');
              fadeGradient.addColorStop(0.3, 'rgba(0,0,0,0.3)');
              fadeGradient.addColorStop(1, 'rgba(0,0,0,1)');
              tempCtx.fillStyle = fadeGradient;
              tempCtx.fillRect(0, 0, width, reflectionHeight);
              
              ctx.globalAlpha = (layer.reflectionOpacity || 40) / 100;
              ctx.drawImage(tempCanvas, 0, reflectY);
              
              // Also draw main text (after reflection so it's on top)
              ctx.globalAlpha = 1;
              ctx.fillStyle = layer.color;
              lines.forEach((line, i) => {
                ctx.fillText(line, scaledX, startY + i * lineHeight);
              });
              }
            
            ctx.restore();
          }
        });
        
        const dataUrl = canvas.toDataURL('image/png', 0.95);
        setComposedImageUrl(dataUrl);
      } catch (error) {
        console.error('❌ Composition failed:', error);
        setComposedImageUrl(null);
      }
    };
    
    // Small delay to ensure visual is fully mounted
    const timer = setTimeout(() => {
      composeImage();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [visual.id, JSON.stringify(visual.editor_layers), visual.original_image_url, visual.image_url, isVideo]);

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

  const handleCropComplete = (newImageUrl) => {
    setShowCropModal(false);
    // Notify parent to update visual
    if (onCropComplete) {
      onCropComplete(newImageUrl);
    }
  };

  const handleImageEditComplete = (newImageUrl, editPrompt) => {
    setShowImageEditModal(false);
    // Notify parent to update visual with edited image
    if (onCropComplete) {
      onCropComplete(newImageUrl);
    }
  };

  return (
    <>
      <div className="rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 group">
        {/* Image/Video Container */}
        <div className="relative overflow-hidden bg-black/20" style={{ aspectRatio: isVideo ? 'auto' : getAspectRatio(visual.dimensions) }}>
          {isVideo ? (
            <video 
              src={visual.video_url || visual.image_url}
              controls
              autoPlay
              loop
              muted
              className="w-full h-auto"
              style={{ aspectRatio: getAspectRatio(visual.dimensions) }}
            />
          ) : (
            <div 
              className="relative w-full h-full cursor-pointer"
              onClick={() => setShowImageModal(true)}
            >
              <img 
                src={composedImageUrl || visual.image_url} 
                alt={visual.title || 'Visuel généré'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Hover Overlay with + Icon */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        
        {/* Top Right - Favorite Button Only (inside image) */}
        <div className="absolute top-3 right-3">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(visual)}
              className={cn(
                "p-2.5 rounded-xl backdrop-blur-sm transition-all shadow-lg border",
                visual.is_favorite 
                  ? "bg-gradient-to-br from-red-600/90 to-rose-600/90 hover:from-red-500 hover:to-rose-500 shadow-red-500/30 border-red-400/30"
                  : "bg-gradient-to-br from-gray-600/90 to-gray-700/90 hover:from-gray-500 hover:to-gray-600 shadow-gray-500/30 border-gray-400/30"
              )}
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transition-all",
                  visual.is_favorite ? "fill-white text-white" : "text-white"
                )} 
              />
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





      </div>

      {/* Color Palette Bar - Just under image */}
      {visual.color_palette && visual.color_palette.length > 0 && (
        <button
          onClick={() => setShowColorModal(true)}
          className="w-full flex gap-1 px-4 py-2 hover:bg-white/5 transition-all cursor-pointer"
        >
          {visual.color_palette.map((color, idx) => (
            <div
              key={idx}
              className="flex-1 h-4 rounded-md shadow-lg hover:scale-105 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
        </button>
      )}

      {/* Info & Actions */}
      {showActions && (
        <div className="p-4 pt-2 space-y-3">
          {/* Original Prompt - Clickable */}
          {cleanPrompt && (
            <button
              onClick={() => setShowPromptModal(true)}
              className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
              title={language === 'fr' ? 'Cliquer pour voir le prompt complet' : 'Click to see full prompt'}
            >
              <p className="text-white/60 text-xs line-clamp-4 group-hover:text-white/80 transition-colors">
                {cleanPrompt}
              </p>
            </button>
          )}
          
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* Uploaded Badge */}
            {(cleanPrompt === 'Image uploadée' || cleanPrompt === 'Uploaded image') && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-600/90 text-white text-xs font-medium border border-orange-500/20">
                {cleanPrompt}
              </span>
            )}

            {/* Format Badge */}
            {visual.dimensions && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
                {visual.dimensions}
              </span>
            )}

            {/* Video-specific badges */}
            {isVideo && videoModel && (
              <>
                {/* Model Badge */}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium border border-violet-500/30">
                  {videoModel}
                </span>

                {/* Duration Badge */}
                {videoDuration && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                    {videoDuration}s
                  </span>
                )}
              </>
            )}
            
            {/* Other badges for images */}
            {!isVideo && visual.format_name && (
              <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                {visual.format_name}
              </span>
            )}
            {!isVideo && visual.category_name && (
              <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                {visual.category_name}
              </span>
            )}
            {!isVideo && visual.style && (
              <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-300">
                {visual.style}
              </span>
            )}
            {visual.art_director_name && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-600/20 text-blue-300 text-xs font-medium border border-blue-500/30">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                DA: {visual.art_director_name}
              </span>
            )}
          </div>

          {/* Action Buttons - Icons and Regenerate on same line */}
          <div className="flex gap-2">
            {/* Action Icons - only for images, always visible */}
            {!isVideo && onEdit && (
              <button
                onClick={() => onEdit(visual)}
                disabled={isRegenerating}
                className="relative p-2 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={language === 'fr' ? 'Éditeur magique' : 'Magic editor'}
              >
                <Wand2 className="h-4 w-4" />
                {visual.editor_layers && visual.editor_layers.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border border-white/20">
                    {visual.editor_layers.length}
                  </span>
                )}
              </button>
            )}

            {!isVideo && onImageEditOpen && (
              <button
                onClick={() => onImageEditOpen(visual)}
                disabled={isRegenerating}
                className="p-2 rounded-lg bg-gradient-to-br from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={language === 'fr' ? 'Éditer l\'image' : 'Edit image'}
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}

            {!isVideo && onVideoOpen && (
              <button
                onClick={() => onVideoOpen(visual)}
                disabled={isRegenerating}
                className="p-2 rounded-lg bg-gradient-to-br from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={language === 'fr' ? 'Créer vidéo' : 'Create video'}
              >
                <Video className="h-4 w-4" />
              </button>
            )}

            {!isVideo && onEffectApply && (
              <button
                onClick={() => setShowEffectsModal(true)}
                disabled={isRegenerating}
                className="p-2 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={language === 'fr' ? 'Effets One-clic' : 'One-click effects'}
              >
                <Sparkles className="h-4 w-4" />
              </button>
            )}

            {!isVideo && onCropOpen && (
              <button
                onClick={() => onCropOpen(visual)}
                disabled={isRegenerating}
                className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={language === 'fr' ? 'Découper' : 'Crop'}
              >
                <Scissors className="h-4 w-4" />
              </button>
            )}

            {onFolderClick && (
              <button
                onClick={() => onFolderClick(visual)}
                disabled={isRegenerating}
                className="p-2 rounded-lg bg-gradient-to-br from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={language === 'fr' ? 'Ranger dans un dossier' : 'Move to folder'}
              >
                <Folder className="h-4 w-4" />
              </button>
            )}

            {onDuplicate && (
              <button
                onClick={() => onDuplicate(visual)}
                disabled={isRegenerating}
                className="p-2 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={language === 'fr' ? 'Dupliquer le visuel' : 'Duplicate visual'}
              >
                <Copy className="h-4 w-4" />
              </button>
            )}

            {/* Regenerate Button - icon only */}
            {!isVideo && onRegenerate && (
              <button
                onClick={() => onRegenerate(visual)}
                disabled={isRegenerating}
                className="p-2 rounded-lg bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 text-white transition-all disabled:opacity-50"
                title={t('regenerate')}
              >
                <RefreshCw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />
              </button>
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

          {/* Download Button (when not in validation mode) */}
          {!showValidation && (
            <>
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
                <span className="text-xs">{downloaded ? t('downloaded') : t('download')}</span>
              </Button>

              {!canDownload && (
                <p className="text-xs text-amber-400/80 text-center mt-2">
                  {t('noCredits')}
                </p>
              )}
            </>
          )}
        </div>
      )}
      </div>

      {/* Download Modal - video formats only for videos */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        visual={visual}
        onDownload={handleDownloadComplete}
        videoOnly={isVideo}
      />

      {/* Video Generation Modal */}
      {onVideoGenerated && (
        <VideoGenerationModal
          visual={visual}
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          onVideoGenerated={onVideoGenerated}
        />
      )}

      {/* ADS Modal */}
      <ADSModal
        isOpen={showADSModal}
        onClose={() => setShowADSModal(false)}
        visual={visual}
      />

      {/* Crop Modal */}
      <CropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        visual={visual}
        onCropComplete={handleCropComplete}
      />

      {/* Image Edit Modal */}
      <ImageEditModal
        isOpen={showImageEditModal}
        onClose={() => setShowImageEditModal(false)}
        visual={visual}
        onEditComplete={handleImageEditComplete}
      />

      {/* Effects Modal */}
      <EffectsModal
        isOpen={showEffectsModal}
        onClose={() => setShowEffectsModal(false)}
        onApplyEffect={(effect, count) => onEffectApply?.(visual, effect, count)}
      />

      {/* Prompt Modal */}
      <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {language === 'fr' ? 'Prompt complet' : 'Full Prompt'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
              <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                {cleanPrompt}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(cleanPrompt);
                  toast.success(language === 'fr' ? 'Prompt copié' : 'Prompt copied');
                }}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {language === 'fr' ? 'Copier le prompt' : 'Copy prompt'}
              </Button>
              {onPromptClick && (
                <Button
                  onClick={() => {
                    onPromptClick(cleanPrompt);
                    setShowPromptModal(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {language === 'fr' ? 'Réutiliser' : 'Reuse'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Image Modal - Exact Store system */}
      {showImageModal && (() => {
        const dims = visual.dimensions || '1080x1080';
        const [w, h] = dims.split('x').map(n => parseInt(n));
        
        if (!w || !h) {
          console.error('Invalid dimensions:', dims);
          return null;
        }
        
        const aspectRatio = w / h;
        
        // Calculate max dimensions based on viewport
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;
        
        let displayWidth, displayHeight;
        if (aspectRatio > maxWidth / maxHeight) {
          // Width-constrained
          displayWidth = maxWidth;
          displayHeight = maxWidth / aspectRatio;
        } else {
          // Height-constrained
          displayHeight = maxHeight;
          displayWidth = maxHeight * aspectRatio;
        }
        
        return (
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center"
            style={{ zIndex: 99999 }}
            onClick={() => setShowImageModal(false)}
          >
            <div 
              className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="relative"
                style={{
                  width: `${displayWidth}px`,
                  height: `${displayHeight}px`,
                  aspectRatio: `${w} / ${h}`
                }}
              >
                {isVideo ? (
                  <video 
                    src={visual.video_url || visual.image_url}
                    controls
                    autoPlay
                    loop
                    className="rounded-lg shadow-2xl"
                    style={{ 
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      aspectRatio: `${w} / ${h}`
                    }}
                  />
                ) : (
                  <img
                    src={composedImageUrl || visual.image_url}
                    alt={visual.title || 'Preview'}
                    className="rounded-lg shadow-2xl"
                    style={{ 
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      aspectRatio: `${w} / ${h}`
                    }}
                  />
                )}
              </div>
              
              {/* Close button - outside image container */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 left-1/2 -translate-x-1/2 p-4 bg-red-600 hover:bg-red-700 rounded-full text-white transition-all shadow-2xl z-10"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );
}