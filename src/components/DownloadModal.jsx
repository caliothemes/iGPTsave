import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileImage, FileType, Loader2, Check, Eraser } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const FORMATS = [
  { id: 'png', name: 'PNG', ext: 'png', mime: 'image/png', desc: { fr: 'Haute qualité avec fond', en: 'High quality with background' }, icon: FileImage },
  { id: 'png-transparent', name: 'PNG Transparent', ext: 'png', mime: 'image/png', transparent: true, removeBg: true, desc: { fr: 'Fond supprimé automatiquement', en: 'Background automatically removed' }, icon: Eraser },
  { id: 'jpg', name: 'JPG', ext: 'jpg', mime: 'image/jpeg', desc: { fr: 'Compressé, idéal web', en: 'Compressed, ideal for web' }, icon: FileImage },
  { id: 'webp', name: 'WebP', ext: 'webp', mime: 'image/webp', desc: { fr: 'Moderne, léger', en: 'Modern, lightweight' }, icon: FileImage },
  { id: 'svg', name: 'SVG', ext: 'svg', mime: 'image/svg+xml', desc: { fr: 'Vectoriel, idéal impression', en: 'Vector, ideal for print' }, icon: FileType, premium: true },
];

export default function DownloadModal({ isOpen, onClose, visual, onDownload }) {
  const { language } = useLanguage();
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    const format = FORMATS.find(f => f.id === selectedFormat);
    
    try {
      let imageUrl = visual.image_url;
      
      // If transparent format selected, call our backend removeBg function (uses Render API)
      if (format.removeBg) {
        try {
          const response = await base44.functions.invoke('removeBg', { image_url: visual.image_url });
          if (response.data?.success && response.data?.image_url) {
            imageUrl = response.data.image_url;
          } else {
            console.error('Remove bg failed:', response.data?.error);
          }
        } catch (bgError) {
          console.error('Remove bg failed, using original:', bgError);
        }
      }
      
      await downloadImage(imageUrl, format);
      onDownload?.(format);
      onClose();
    } catch (e) {
      console.error(e);
    }
    setDownloading(false);
  };

  const downloadImage = async (url, format) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create canvas to convert format
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Handle transparent background
      if (!format.transparent) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      // Convert to selected format
      const quality = format.id === 'jpg' ? 0.92 : 1;
      const dataUrl = canvas.toDataURL(format.mime, quality);

      const link = document.createElement('a');
      link.download = `${visual.title || 'visual'}.${format.ext}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // Fallback: direct download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${visual.title || 'visual'}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-400" />
            {language === 'fr' ? 'Télécharger' : 'Download'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-white/60 text-sm">
            {language === 'fr' ? 'Choisissez le format:' : 'Choose format:'}
          </p>

          <div className="space-y-2">
            {FORMATS.map(format => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={cn(
                  "w-full p-3 rounded-lg flex items-center gap-3 transition-all text-left",
                  selectedFormat === format.id
                    ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                    : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                )}
              >
                <format.icon className={cn("h-5 w-5", selectedFormat === format.id ? "text-emerald-400" : "text-white/50")} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{format.name}</span>
                    {format.premium && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">PRO</span>
                    )}
                  </div>
                  <p className="text-white/50 text-xs">{format.desc[language]}</p>
                </div>
                {selectedFormat === format.id && (
                  <Check className="h-4 w-4 text-emerald-400" />
                )}
              </button>
            ))}
          </div>

          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {language === 'fr' ? 'Télécharger' : 'Download'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}