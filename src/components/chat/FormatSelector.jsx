import React from 'react';
import { Button } from "@/components/ui/button";
import { Monitor, Printer } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';

export default function FormatSelector({ onSelect, selectedFormat }) {
  const { t } = useLanguage();
  const [category, setCategory] = React.useState('digital');

  const formats = {
    digital: [
      { id: 'post_instagram', name: t('postInstagram'), dimensions: '1080x1080', icon: '📱' },
      { id: 'story_instagram', name: t('storyInstagram'), dimensions: '1080x1920', icon: '📱' },
      { id: 'post_facebook', name: t('postFacebook'), dimensions: '1200x630', icon: '👍' },
      { id: 'post_linkedin', name: t('postLinkedin'), dimensions: '1200x627', icon: '💼' },
      { id: 'banner', name: t('webBanner'), dimensions: '1920x600', icon: '🖥️' },
    ],
    print: [
      { id: 'carte_visite', name: t('businessCard'), dimensions: '85x55mm', icon: '💳' },
      { id: 'flyer', name: t('flyerA5'), dimensions: '148x210mm', icon: '📄' },
      { id: 'affiche', name: t('posterA3'), dimensions: '297x420mm', icon: '🖼️' },
      { id: 'logo', name: t('logoHD'), dimensions: '2000x2000', icon: '✨' },
    ]
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCategory('digital')}
          className={cn(
            "flex-1 transition-all",
            category === 'digital' 
              ? "bg-violet-500/20 text-violet-300" 
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <Monitor className="h-4 w-4 mr-2" />
          {t('digital')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCategory('print')}
          className={cn(
            "flex-1 transition-all",
            category === 'print' 
              ? "bg-blue-500/20 text-blue-300" 
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <Printer className="h-4 w-4 mr-2" />
          {t('print')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {formats[category].map((format) => (
          <button
            key={format.id}
            onClick={() => onSelect(format)}
            className={cn(
              "p-3 rounded-xl text-left transition-all border",
              selectedFormat?.id === format.id
                ? "bg-violet-500/20 border-violet-500/50"
                : "bg-white/5 border-white/10 hover:border-white/30"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{format.icon}</span>
              <div>
                <p className="text-white text-sm font-medium">{format.name}</p>
                <p className="text-white/50 text-xs">{format.dimensions}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}