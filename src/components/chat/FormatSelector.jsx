import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Printer, Ruler } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';

// Format shape illustration component
const FormatShape = ({ w, h, selected, isCircle }) => {
  const maxSize = 24;
  const scale = maxSize / Math.max(w, h);
  const width = Math.max(w * scale, 8);
  const height = Math.max(h * scale, 8);
  
  return (
    <div className="w-8 h-8 flex items-center justify-center">
      <div 
        className={cn(
          "transition-all",
          isCircle ? "rounded-full" : "rounded-sm",
          selected ? "bg-violet-400" : "bg-white/40 group-hover:bg-white/60"
        )}
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
      { id: 'square', name: language === 'fr' ? 'Carré 1:1' : 'Square 1:1', dimensions: '1080x1080', ratio: '1:1', w: 1, h: 1 },
      { id: 'portrait_4_5', name: language === 'fr' ? 'Portrait 4:5' : 'Portrait 4:5', dimensions: '1080x1350', ratio: '4:5', w: 4, h: 5 },
      { id: 'story', name: 'Story 9:16', dimensions: '1080x1920', ratio: '9:16', w: 9, h: 16 },
      { id: 'portrait_2_3', name: language === 'fr' ? 'Portrait 2:3' : 'Portrait 2:3', dimensions: '1000x1500', ratio: '2:3', w: 2, h: 3 },
      { id: 'landscape_16_9', name: language === 'fr' ? 'Paysage 16:9' : 'Landscape 16:9', dimensions: '1920x1080', ratio: '16:9', w: 16, h: 9 },
      { id: 'landscape_4_3', name: language === 'fr' ? 'Paysage 4:3' : 'Landscape 4:3', dimensions: '1200x900', ratio: '4:3', w: 4, h: 3 },
      { id: 'banner', name: language === 'fr' ? 'Bannière 16:5' : 'Banner 16:5', dimensions: '1920x600', ratio: '16:5', w: 16, h: 5 },
      { id: 'ultra_wide', name: language === 'fr' ? 'Ultra large 4:1' : 'Ultra Wide 4:1', dimensions: '1584x396', ratio: '4:1', w: 4, h: 1 },
    ],
    print: [
      { id: 'carte_visite_paysage', name: language === 'fr' ? 'Carte de visite paysage' : 'Business Card Landscape', dimensions: '1050x600', w: 1.75, h: 1 },
      { id: 'carte_visite_portrait', name: language === 'fr' ? 'Carte de visite portrait' : 'Business Card Portrait', dimensions: '600x1050', w: 1, h: 1.75 },
      { id: 'flyer_portrait', name: language === 'fr' ? 'Flyer portrait' : 'Flyer Portrait', dimensions: '2480x3508', w: 1, h: 1.41 },
      { id: 'flyer_paysage', name: language === 'fr' ? 'Flyer paysage' : 'Flyer Landscape', dimensions: '3508x2480', w: 1.41, h: 1 },
      { id: 'affiche_portrait', name: language === 'fr' ? 'Affiche portrait' : 'Poster Portrait', dimensions: '3508x4961', w: 1, h: 1.41 },
      { id: 'affiche_paysage', name: language === 'fr' ? 'Affiche paysage' : 'Poster Landscape', dimensions: '4961x3508', w: 1.41, h: 1 },
      { id: 'sticker_rond', name: language === 'fr' ? 'Sticker rond' : 'Round Sticker', dimensions: '1000x1000', w: 1, h: 1, isCircle: true },
      { id: 'sticker_carre', name: language === 'fr' ? 'Sticker carré' : 'Square Sticker', dimensions: '1000x1000', w: 1, h: 1 },
      { id: 'carte_cadeau', name: language === 'fr' ? 'Carte cadeau' : 'Gift Card', dimensions: '1500x1000', w: 1.5, h: 1 },
      { id: 'logo_carre', name: language === 'fr' ? 'Logo carré' : 'Square Logo', dimensions: '2000x2000', w: 1, h: 1 },
      { id: 'invitation_paysage', name: language === 'fr' ? 'Invitation paysage' : 'Invitation Landscape', dimensions: '2100x1500', w: 1.4, h: 1 },
      { id: 'invitation_portrait', name: language === 'fr' ? 'Invitation portrait' : 'Invitation Portrait', dimensions: '1500x2100', w: 1, h: 1.4 },
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
        <div className="grid grid-cols-4 md:grid-cols-4 gap-2">
          {formats[category].map((format) => (
            <button
              key={format.id}
              onClick={() => onSelect(format)}
              className={cn(
                "p-2.5 rounded-xl text-center transition-all border group",
                selectedFormat?.id === format.id
                  ? "bg-violet-500/20 border-violet-500/50"
                  : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <FormatShape w={format.w} h={format.h} selected={selectedFormat?.id === format.id} isCircle={format.isCircle} />
                <p className={cn(
                  "text-[10px] font-medium leading-tight text-center",
                  selectedFormat?.id === format.id ? "text-violet-300" : "text-white/70"
                )}>{format.name}</p>
              </div>
            </button>
          ))}
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