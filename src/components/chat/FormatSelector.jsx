import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Printer, Ruler, Instagram, Facebook, Linkedin, Globe, CreditCard, FileText, Image, Square, RectangleHorizontal, RectangleVertical } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';

const FormatIcon = ({ ratio }) => {
  const [w, h] = ratio.split(':').map(Number);
  const maxSize = 20;
  const scale = maxSize / Math.max(w, h);
  const width = w * scale;
  const height = h * scale;
  
  return (
    <div className="w-6 h-6 flex items-center justify-center">
      <div 
        className="border-2 border-current rounded-sm"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
};

export default function FormatSelector({ onSelect, selectedFormat }) {
  const { language } = useLanguage();
  const [category, setCategory] = useState('digital');
  const [customWidth, setCustomWidth] = useState('1080');
  const [customHeight, setCustomHeight] = useState('1080');

  const formats = {
    digital: [
      { id: 'post_instagram', name: language === 'fr' ? 'Post Instagram' : 'Instagram Post', dimensions: '1080x1080', ratio: '1:1', icon: Instagram },
      { id: 'story_instagram', name: language === 'fr' ? 'Story Instagram' : 'Instagram Story', dimensions: '1080x1920', ratio: '9:16', icon: Instagram },
      { id: 'reel_instagram', name: language === 'fr' ? 'Reel Instagram' : 'Instagram Reel', dimensions: '1080x1920', ratio: '9:16', icon: Instagram },
      { id: 'post_facebook', name: language === 'fr' ? 'Post Facebook' : 'Facebook Post', dimensions: '1200x630', ratio: '1.91:1', icon: Facebook },
      { id: 'cover_facebook', name: language === 'fr' ? 'Couverture Facebook' : 'Facebook Cover', dimensions: '820x312', ratio: '2.63:1', icon: Facebook },
      { id: 'post_linkedin', name: language === 'fr' ? 'Post LinkedIn' : 'LinkedIn Post', dimensions: '1200x627', ratio: '1.91:1', icon: Linkedin },
      { id: 'banner_linkedin', name: language === 'fr' ? 'Bannière LinkedIn' : 'LinkedIn Banner', dimensions: '1584x396', ratio: '4:1', icon: Linkedin },
      { id: 'banner_web', name: language === 'fr' ? 'Bannière Web' : 'Web Banner', dimensions: '1920x600', ratio: '16:5', icon: Globe },
      { id: 'thumbnail_youtube', name: 'YouTube Thumbnail', dimensions: '1280x720', ratio: '16:9', icon: RectangleHorizontal },
      { id: 'pinterest', name: 'Pinterest Pin', dimensions: '1000x1500', ratio: '2:3', icon: RectangleVertical },
    ],
    print: [
      { id: 'carte_visite', name: language === 'fr' ? 'Carte de visite' : 'Business Card', dimensions: '1050x600', ratio: '1.75:1', icon: CreditCard },
      { id: 'flyer_a5', name: language === 'fr' ? 'Flyer A5' : 'A5 Flyer', dimensions: '1748x2480', ratio: '1:1.42', icon: FileText },
      { id: 'flyer_a4', name: language === 'fr' ? 'Flyer A4' : 'A4 Flyer', dimensions: '2480x3508', ratio: '1:1.41', icon: FileText },
      { id: 'affiche_a3', name: language === 'fr' ? 'Affiche A3' : 'A3 Poster', dimensions: '3508x4961', ratio: '1:1.41', icon: Image },
      { id: 'affiche_a2', name: language === 'fr' ? 'Affiche A2' : 'A2 Poster', dimensions: '4961x7016', ratio: '1:1.41', icon: Image },
      { id: 'logo', name: language === 'fr' ? 'Logo HD' : 'HD Logo', dimensions: '2000x2000', ratio: '1:1', icon: Square },
      { id: 'menu_restaurant', name: language === 'fr' ? 'Menu Restaurant' : 'Restaurant Menu', dimensions: '2550x3300', ratio: '1:1.29', icon: FileText },
      { id: 'invitation', name: language === 'fr' ? 'Invitation' : 'Invitation', dimensions: '2100x1500', ratio: '1.4:1', icon: FileText },
    ]
  };

  const handleCustomFormat = () => {
    const w = parseInt(customWidth) || 1080;
    const h = parseInt(customHeight) || 1080;
    onSelect({
      id: 'custom',
      name: language === 'fr' ? 'Sur mesure' : 'Custom',
      dimensions: `${w}x${h}`,
      ratio: 'custom'
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCategory('digital')}
          className={cn(
            "flex-1 transition-all rounded-lg",
            category === 'digital' 
              ? "bg-violet-500/30 text-violet-300" 
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <Monitor className="h-4 w-4 mr-2" />
          Digital
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCategory('print')}
          className={cn(
            "flex-1 transition-all rounded-lg",
            category === 'print' 
              ? "bg-blue-500/30 text-blue-300" 
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <Printer className="h-4 w-4 mr-2" />
          {language === 'fr' ? 'Impression' : 'Print'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCategory('custom')}
          className={cn(
            "flex-1 transition-all rounded-lg",
            category === 'custom' 
              ? "bg-amber-500/30 text-amber-300" 
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <Ruler className="h-4 w-4 mr-2" />
          {language === 'fr' ? 'Sur mesure' : 'Custom'}
        </Button>
      </div>

      {/* Format Grid */}
      {category !== 'custom' ? (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {formats[category].map((format) => {
            const IconComponent = format.icon;
            return (
              <button
                key={format.id}
                onClick={() => onSelect(format)}
                className={cn(
                  "p-2 rounded-xl text-center transition-all border group",
                  selectedFormat?.id === format.id
                    ? "bg-violet-500/20 border-violet-500/50"
                    : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                )}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    selectedFormat?.id === format.id ? "bg-violet-500/30 text-violet-300" : "bg-white/10 text-white/60 group-hover:text-white"
                  )}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <p className="text-white text-[10px] font-medium leading-tight">{format.name}</p>
                  <p className="text-white/40 text-[9px]">{format.ratio}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-white/5 rounded-xl space-y-4">
          <p className="text-white/60 text-sm text-center">
            {language === 'fr' ? 'Définissez vos dimensions personnalisées' : 'Set your custom dimensions'}
          </p>
          <div className="flex items-center gap-3 justify-center">
            <div className="flex flex-col items-center gap-1">
              <label className="text-white/40 text-xs">{language === 'fr' ? 'Largeur' : 'Width'}</label>
              <Input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className="w-24 bg-white/10 border-white/20 text-white text-center"
                placeholder="1080"
              />
            </div>
            <span className="text-white/40 text-lg mt-5">×</span>
            <div className="flex flex-col items-center gap-1">
              <label className="text-white/40 text-xs">{language === 'fr' ? 'Hauteur' : 'Height'}</label>
              <Input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                className="w-24 bg-white/10 border-white/20 text-white text-center"
                placeholder="1080"
              />
            </div>
            <span className="text-white/40 text-xs mt-5">px</span>
          </div>
          <Button
            onClick={handleCustomFormat}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            {language === 'fr' ? 'Appliquer' : 'Apply'}
          </Button>
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
            {[
              { w: 800, h: 600, label: '4:3' },
              { w: 1920, h: 1080, label: '16:9' },
              { w: 1080, h: 1080, label: '1:1' },
              { w: 1080, h: 1350, label: '4:5' },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => { setCustomWidth(String(preset.w)); setCustomHeight(String(preset.h)); }}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white text-xs transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}