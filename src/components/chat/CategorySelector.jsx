import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Gem, Printer, Image, Share2, ChevronDown, ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'logo',
    icon: Gem,
    name: { fr: 'Logo HD', en: 'HD Logo' },
    description: { fr: 'Logos vectoriels, icônes, symboles', en: 'Vector logos, icons, symbols' },
    hasSubmenu: false,
    prompt: { fr: 'Crée un logo sans texte', en: 'Create a logo without text' }
  },
  {
    id: 'print',
    icon: Printer,
    name: { fr: 'Print', en: 'Print' },
    description: { fr: 'Carte de visite, flyer, affiche...', en: 'Business card, flyer, poster...' },
    hasSubmenu: true,
    hasNestedSubmenu: true,
    submenu: [
      { 
        id: 'carte_visite', 
        name: { fr: 'Carte de visite', en: 'Business Card' },
        orientations: [
                  { id: 'carte_visite_h', name: { fr: 'Horizontal', en: 'Horizontal' }, prompt: { fr: 'Crée une carte de visite horizontale sans texte', en: 'Create a horizontal business card without text' }, dimensions: '1050x600' },
                  { id: 'carte_visite_v', name: { fr: 'Vertical', en: 'Vertical' }, prompt: { fr: 'Crée une carte de visite verticale sans texte', en: 'Create a vertical business card without text' }, dimensions: '600x1050' },
                ]
      },
      { 
        id: 'flyer', 
        name: { fr: 'Flyer', en: 'Flyer' },
        orientations: [
          { id: 'flyer_v', name: { fr: 'Vertical', en: 'Vertical' }, prompt: { fr: 'Crée un flyer vertical', en: 'Create a vertical flyer' }, dimensions: '2100x2970' },
          { id: 'flyer_h', name: { fr: 'Horizontal', en: 'Horizontal' }, prompt: { fr: 'Crée un flyer horizontal', en: 'Create a horizontal flyer' }, dimensions: '2970x2100' },
        ]
      },
      { 
        id: 'affiche', 
        name: { fr: 'Affiche', en: 'Poster' },
        orientations: [
          { id: 'affiche_v', name: { fr: 'Vertical', en: 'Vertical' }, prompt: { fr: 'Crée une affiche verticale', en: 'Create a vertical poster' }, dimensions: '2480x3508' },
          { id: 'affiche_h', name: { fr: 'Horizontal', en: 'Horizontal' }, prompt: { fr: 'Crée une affiche horizontale', en: 'Create a horizontal poster' }, dimensions: '3508x2480' },
        ]
      },
      { 
        id: 'sticker', 
        name: { fr: 'Sticker', en: 'Sticker' },
        orientations: [
          { id: 'sticker_rond', name: { fr: 'Rond', en: 'Round' }, prompt: { fr: 'Crée un sticker rond', en: 'Create a round sticker' }, dimensions: '1000x1000' },
          { id: 'sticker_carre', name: { fr: 'Carré', en: 'Square' }, prompt: { fr: 'Crée un sticker carré', en: 'Create a square sticker' }, dimensions: '1000x1000' },
        ]
      },
      { 
        id: 'invitation', 
        name: { fr: 'Invitation', en: 'Invitation' },
        orientations: [
          { id: 'invitation_v', name: { fr: 'Vertical', en: 'Vertical' }, prompt: { fr: 'Crée une invitation verticale', en: 'Create a vertical invitation' }, dimensions: '1400x2100' },
          { id: 'invitation_h', name: { fr: 'Horizontal', en: 'Horizontal' }, prompt: { fr: 'Crée une invitation horizontale', en: 'Create a horizontal invitation' }, dimensions: '2100x1400' },
        ]
      },
      { 
        id: 'menu', 
        name: { fr: 'Menu', en: 'Menu' },
        orientations: [
          { id: 'menu_v', name: { fr: 'Vertical', en: 'Vertical' }, prompt: { fr: 'Crée un menu vertical', en: 'Create a vertical menu' }, dimensions: '2100x2970' },
          { id: 'menu_h', name: { fr: 'Horizontal', en: 'Horizontal' }, prompt: { fr: 'Crée un menu horizontal', en: 'Create a horizontal menu' }, dimensions: '2970x2100' },
        ]
      },
    ]
  },
  {
    id: 'image',
    icon: Image,
    name: { fr: 'Image réaliste', en: 'Realistic Image' },
    description: { fr: 'Photos IA, portraits, paysages', en: 'AI photos, portraits, landscapes' },
    hasSubmenu: false,
    prompt: { fr: 'Crée une image réaliste', en: 'Create a realistic image' }
  },
  {
    id: 'social',
    icon: Share2,
    name: { fr: 'Réseaux sociaux', en: 'Social Media' },
    description: { fr: 'Carré, Story, Bannière', en: 'Square, Story, Banner' },
    hasSubmenu: true,
    submenu: [
      { id: 'social_carre', name: { fr: 'Carré (1:1)', en: 'Square (1:1)' }, prompt: { fr: 'Crée un post pour les réseaux sociaux format carré', en: 'Create a social media post in square format' }, dimensions: '1080x1080' },
      { id: 'social_story', name: { fr: 'Story (9:16)', en: 'Story (9:16)' }, prompt: { fr: 'Crée une story pour les réseaux sociaux', en: 'Create a social media story' }, dimensions: '1080x1920' },
      { id: 'social_portrait', name: { fr: 'Portrait (4:5)', en: 'Portrait (4:5)' }, prompt: { fr: 'Crée un post portrait pour les réseaux sociaux', en: 'Create a portrait social media post' }, dimensions: '1080x1350' },
      { id: 'social_paysage', name: { fr: 'Paysage (16:9)', en: 'Landscape (16:9)' }, prompt: { fr: 'Crée une bannière pour les réseaux sociaux', en: 'Create a social media banner' }, dimensions: '1920x1080' },
    ]
  },
];

export default function CategorySelector({ onSelect, selectedCategory }) {
  const { language } = useLanguage();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [openNestedSubmenu, setOpenNestedSubmenu] = useState(null);

  const handleCategoryClick = (category) => {
    if (category.hasSubmenu) {
      setOpenSubmenu(openSubmenu === category.id ? null : category.id);
      setOpenNestedSubmenu(null);
    } else {
      onSelect(category);
      setOpenSubmenu(null);
      setOpenNestedSubmenu(null);
    }
  };

  const handleSubmenuClick = (category, submenuItem) => {
    if (submenuItem.orientations) {
      setOpenNestedSubmenu(openNestedSubmenu === submenuItem.id ? null : submenuItem.id);
    } else {
      onSelect({ ...category, selectedSubmenu: submenuItem });
      setOpenSubmenu(null);
      setOpenNestedSubmenu(null);
    }
  };

  const handleOrientationClick = (category, submenuItem, orientation) => {
    onSelect({ ...category, selectedSubmenu: { ...submenuItem, ...orientation } });
    setOpenSubmenu(null);
    setOpenNestedSubmenu(null);
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xl mx-auto">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isOpen = openSubmenu === category.id;
        const isSelected = selectedCategory?.id === category.id;

        return (
          <div key={category.id} className="relative">
            <button
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left",
                "bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20",
                isSelected && "bg-violet-500/10 border-violet-500/30"
              )}
            >
              <div className="p-2 rounded-lg bg-white/5">
                <Icon className="h-5 w-5 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{category.name[language]}</span>
                  {category.hasSubmenu && (
                    <ChevronDown className={cn(
                      "h-4 w-4 text-white/40 transition-transform",
                      isOpen && "rotate-180"
                    )} />
                  )}
                </div>
                <p className="text-white/40 text-xs truncate">{category.description[language]}</p>
              </div>
            </button>

            {/* Submenu */}
            {category.hasSubmenu && isOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 z-50 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl">
                {category.submenu.map((item) => (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => handleSubmenuClick(category, item)}
                      className="w-full px-4 py-2.5 text-left text-white/80 text-sm hover:bg-white/10 transition-colors flex items-center justify-between"
                    >
                      {item.name[language]}
                      {item.orientations && (
                        <ChevronRight className={cn(
                          "h-4 w-4 text-white/40 transition-transform",
                          openNestedSubmenu === item.id && "rotate-90"
                        )} />
                      )}
                    </button>
                    
                    {/* Nested orientation submenu */}
                    {item.orientations && openNestedSubmenu === item.id && (
                      <div className="bg-gray-800/90 border-t border-white/5">
                        {item.orientations.map((orientation) => (
                          <button
                            key={orientation.id}
                            onClick={() => handleOrientationClick(category, item, orientation)}
                            className="w-full px-6 py-2 text-left text-white/70 text-xs hover:bg-white/10 transition-colors"
                          >
                            {orientation.name[language]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { CATEGORIES };