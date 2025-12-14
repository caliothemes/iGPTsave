import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';

export default function CropModal({ isOpen, onClose, visual, onCropComplete }) {
  const { language } = useLanguage();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [image, setImage] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [bleed, setBleed] = useState(0); // Fonds perdus en pixels
  const [isCropping, setIsCropping] = useState(false);
  
  // Crop rectangle (x, y, width, height in canvas coordinates)
  const [cropRect, setCropRect] = useState({ x: 50, y: 50, width: 300, height: 300 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Convert pixels to mm at 300 DPI (1 inch = 25.4mm, 300 DPI)
  const pxToMm = (px) => {
    return Math.round((px * 25.4) / 300);
  };

  const t = {
    fr: {
      title: "Finaliser la découpe pour l'impression",
      bleed: "Fonds perdus",
      bleedDesc: "Ajoutez une marge de sécurité autour de la découpe",
      cancel: "Annuler",
      crop: "Découper",
      cropping: "Découpe en cours..."
    },
    en: {
      title: "Finalize crop for printing",
      bleed: "Bleed",
      bleedDesc: "Add a safety margin around the crop",
      cancel: "Cancel",
      crop: "Crop",
      cropping: "Cropping..."
    }
  }[language];

  // Load image
  useEffect(() => {
    if (isOpen && visual?.image_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImage(img);
        setImageLoaded(true);
        // Initialize crop rect to 80% of image, centered, maintaining aspect
        const margin = 0.1; // 10% margin on each side
        setCropRect({
          x: img.width * margin,
          y: img.height * margin,
          width: img.width * 0.8,
          height: img.height * 0.8
        });
      };
      img.src = visual.image_url;
    }
  }, [isOpen, visual]);

  // Store scale factor for converting between display and original coordinates
  const [scale, setScale] = useState(1);

  // Draw canvas
  useEffect(() => {
    if (!imageLoaded || !image || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    
    // Set canvas to match image aspect ratio, fitting in container
    const containerWidth = container.clientWidth - 40;
    const containerHeight = container.clientHeight - 40;
    const imageAspect = image.width / image.height;
    const containerAspect = containerWidth / containerHeight;
    
    let displayWidth, displayHeight;
    if (imageAspect > containerAspect) {
      // Image is wider - fit to width
      displayWidth = containerWidth;
      displayHeight = containerWidth / imageAspect;
    } else {
      // Image is taller - fit to height
      displayHeight = containerHeight;
      displayWidth = containerHeight * imageAspect;
    }
    
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    const displayScale = displayWidth / image.width;
    setScale(displayScale);

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw overlay (darkened area outside crop)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    const scaledRect = {
      x: cropRect.x * displayScale,
      y: cropRect.y * displayScale,
      width: cropRect.width * displayScale,
      height: cropRect.height * displayScale
    };
    ctx.clearRect(scaledRect.x, scaledRect.y, scaledRect.width, scaledRect.height);
    ctx.drawImage(
      image,
      cropRect.x, cropRect.y, cropRect.width, cropRect.height,
      scaledRect.x, scaledRect.y, scaledRect.width, scaledRect.height
    );

    // Draw crop rectangle border
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.strokeRect(scaledRect.x, scaledRect.y, scaledRect.width, scaledRect.height);

    // Draw bleed zone if bleed > 0
    if (bleed > 0) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        scaledRect.x - bleed * displayScale,
        scaledRect.y - bleed * displayScale,
        scaledRect.width + 2 * bleed * displayScale,
        scaledRect.height + 2 * bleed * displayScale
      );
      ctx.setLineDash([]);
    }

    // Draw resize handles (corners + sides)
    const handleSize = 12;
    const handles = [
      // Corners
      { x: scaledRect.x, y: scaledRect.y, cursor: 'nw-resize', pos: 'tl' },
      { x: scaledRect.x + scaledRect.width, y: scaledRect.y, cursor: 'ne-resize', pos: 'tr' },
      { x: scaledRect.x, y: scaledRect.y + scaledRect.height, cursor: 'sw-resize', pos: 'bl' },
      { x: scaledRect.x + scaledRect.width, y: scaledRect.y + scaledRect.height, cursor: 'se-resize', pos: 'br' },
      // Sides
      { x: scaledRect.x, y: scaledRect.y + scaledRect.height / 2, cursor: 'w-resize', pos: 'l' },
      { x: scaledRect.x + scaledRect.width, y: scaledRect.y + scaledRect.height / 2, cursor: 'e-resize', pos: 'r' },
      { x: scaledRect.x + scaledRect.width / 2, y: scaledRect.y, cursor: 'n-resize', pos: 't' },
      { x: scaledRect.x + scaledRect.width / 2, y: scaledRect.y + scaledRect.height, cursor: 's-resize', pos: 'b' }
    ];

    handles.forEach(handle => {
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    });
  }, [imageLoaded, image, cropRect, bleed, pxToMm]);

  const handleMouseDown = (e) => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const scale = canvas.width / image.width;
    const scaledRect = {
      x: cropRect.x * scale,
      y: cropRect.y * scale,
      width: cropRect.width * scale,
      height: cropRect.height * scale
    };

    const handleSize = 12;
    const handles = [
      // Corners
      { x: scaledRect.x, y: scaledRect.y, pos: 'tl' },
      { x: scaledRect.x + scaledRect.width, y: scaledRect.y, pos: 'tr' },
      { x: scaledRect.x, y: scaledRect.y + scaledRect.height, pos: 'bl' },
      { x: scaledRect.x + scaledRect.width, y: scaledRect.y + scaledRect.height, pos: 'br' },
      // Sides
      { x: scaledRect.x, y: scaledRect.y + scaledRect.height / 2, pos: 'l' },
      { x: scaledRect.x + scaledRect.width, y: scaledRect.y + scaledRect.height / 2, pos: 'r' },
      { x: scaledRect.x + scaledRect.width / 2, y: scaledRect.y, pos: 't' },
      { x: scaledRect.x + scaledRect.width / 2, y: scaledRect.y + scaledRect.height, pos: 'b' }
    ];

    // Check if clicking on a handle
    for (const handle of handles) {
      if (
        x >= handle.x - handleSize / 2 &&
        x <= handle.x + handleSize / 2 &&
        y >= handle.y - handleSize / 2 &&
        y <= handle.y + handleSize / 2
      ) {
        setIsResizing(true);
        setResizeHandle(handle.pos);
        setDragStart({ x, y });
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current || !image || !isResizing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const scale = canvas.width / image.width;
    const dx = (x - dragStart.x) / scale;
    const dy = (y - dragStart.y) / scale;

    if (isResizing) {
      setCropRect(prev => {
        let newRect = { ...prev };
        
        // Corners
        if (resizeHandle === 'tl') {
          const newX = Math.max(0, Math.min(prev.x + prev.width - 50, prev.x + dx));
          const newY = Math.max(0, Math.min(prev.y + prev.height - 50, prev.y + dy));
          newRect.width = prev.width + (prev.x - newX);
          newRect.height = prev.height + (prev.y - newY);
          newRect.x = newX;
          newRect.y = newY;
        } else if (resizeHandle === 'tr') {
          const newY = Math.max(0, Math.min(prev.y + prev.height - 50, prev.y + dy));
          newRect.width = Math.max(50, Math.min(image.width - prev.x, prev.width + dx));
          newRect.height = prev.height + (prev.y - newY);
          newRect.y = newY;
        } else if (resizeHandle === 'bl') {
          const newX = Math.max(0, Math.min(prev.x + prev.width - 50, prev.x + dx));
          newRect.width = prev.width + (prev.x - newX);
          newRect.height = Math.max(50, Math.min(image.height - prev.y, prev.height + dy));
          newRect.x = newX;
        } else if (resizeHandle === 'br') {
          newRect.width = Math.max(50, Math.min(image.width - prev.x, prev.width + dx));
          newRect.height = Math.max(50, Math.min(image.height - prev.y, prev.height + dy));
        }
        // Sides
        else if (resizeHandle === 'l') {
          const newX = Math.max(0, Math.min(prev.x + prev.width - 50, prev.x + dx));
          newRect.width = prev.width + (prev.x - newX);
          newRect.x = newX;
        } else if (resizeHandle === 'r') {
          newRect.width = Math.max(50, Math.min(image.width - prev.x, prev.width + dx));
        } else if (resizeHandle === 't') {
          const newY = Math.max(0, Math.min(prev.y + prev.height - 50, prev.y + dy));
          newRect.height = prev.height + (prev.y - newY);
          newRect.y = newY;
        } else if (resizeHandle === 'b') {
          newRect.height = Math.max(50, Math.min(image.height - prev.y, prev.height + dy));
        }

        return newRect;
      });
    }

    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizeHandle(null);
  };

  const handleCrop = async () => {
    if (!image) return;

    setIsCropping(true);

    try {
      // Create a temporary canvas at ORIGINAL image resolution
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      // Calculate crop area in ORIGINAL image coordinates (not display coordinates)
      const cropWithBleed = {
        x: Math.max(0, cropRect.x - bleed),
        y: Math.max(0, cropRect.y - bleed),
        width: Math.min(image.width - (cropRect.x - bleed), cropRect.width + 2 * bleed),
        height: Math.min(image.height - (cropRect.y - bleed), cropRect.height + 2 * bleed)
      };
      
      // Set canvas to crop size at ORIGINAL resolution (no downscaling)
      tempCanvas.width = cropWithBleed.width;
      tempCanvas.height = cropWithBleed.height;
      
      // Draw cropped portion at full original resolution
      ctx.drawImage(
        image,
        cropWithBleed.x,
        cropWithBleed.y,
        cropWithBleed.width,
        cropWithBleed.height,
        0,
        0,
        cropWithBleed.width,
        cropWithBleed.height
      );

      // Convert to blob with maximum quality
      const blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png', 1.0));
      const file = new File([blob], 'cropped.png', { type: 'image/png' });

      // Upload cropped image at full resolution
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Update visual in database
      if (visual.id) {
        await base44.entities.Visual.update(visual.id, {
          image_url: file_url,
          original_image_url: visual.original_image_url || visual.image_url
        });
      }

      // Call callback with new URL
      onCropComplete(file_url);
    } catch (error) {
      console.error('Crop failed:', error);
    } finally {
      setIsCropping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-gray-900 rounded-2xl shadow-2xl w-[90vw] h-[90vh] max-w-6xl flex flex-col border border-white/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">{t.title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Canvas Area */}
          <div
            ref={containerRef}
            className="flex-1 flex items-center justify-center p-6 overflow-hidden"
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="max-w-full max-h-full"
              style={{ cursor: isResizing ? 'nwse-resize' : 'default' }}
            />
          </div>

          {/* Controls */}
          <div className="px-6 py-4 border-t border-white/10 space-y-4">
            {/* Bleed Control */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-white mb-1 block">{t.bleed}</label>
                <p className="text-xs text-white/60">{t.bleedDesc}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={bleed}
                  onChange={(e) => setBleed(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-white text-sm font-medium w-12">{bleed}px</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isCropping}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleCrop}
                disabled={isCropping}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
              >
                {isCropping ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    {t.cropping}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t.crop}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}