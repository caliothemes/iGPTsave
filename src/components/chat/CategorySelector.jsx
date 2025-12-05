import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Gem, Printer, Image, Share2, ChevronDown
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'logo',
    icon: Gem,
    name: { fr: 'Logo HD', en: 'HD Logo' },
    description: { fr: 'Logos vectoriels, icônes, symboles', en: 'Vector logos, icons, symbols' },
    hasSubmenu: false,
    prompt: { fr: 'Crée un logo', en: 'Create a logo' }
  },
  {
    id: 'print',
    icon: Printer,
    name: { fr: 'Print', en: 'Print' },
    description: { fr: 'Portrait, paysage, carré', en: 'Portrait, landscape, square' },
    hasSubmenu: true,
    submenu: [
      { id: 'print_portrait', name: { fr: 'Portrait (3:4)', en: 'Portrait (3:4)' }, prompt: { fr: 'Crée un visuel print format portrait', en: 'Create a print visual in portrait format' }, dimensions: '2100x2800' },
      { id: 'print_paysage', name: { fr: 'Paysage (4:3)', en: 'Landscape (4:3)' }, prompt: { fr: 'Crée un visuel print format paysage', en: 'Create a print visual in landscape format' }, dimensions: '2800x2100' },
      { id: 'print_carre', name: { fr: 'Carré (1:1)', en: 'Square (1:1)' }, prompt: { fr: 'Crée un visuel print format carré', en: 'Create a print visual in square format' }, dimensions: '2400x2400' },
      { id: 'print_allonge_v', name: { fr: 'Allongé vertical (9:16)', en: 'Tall vertical (9:16)' }, prompt: { fr: 'Crée un visuel print format allongé vertical', en: 'Create a tall vertical print visual' }, dimensions: '1080x1920' },
      { id: 'print_allonge_h', name: { fr: 'Allongé horizontal (16:9)', en: 'Wide horizontal (16:9)' }, prompt: { fr: 'Crée un visuel print format allongé horizontal', en: 'Create a wide horizontal print visual' }, dimensions: '1920x1080' },
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

  const handleCategoryClick = (category) => {
    if (category.hasSubmenu) {
      setOpenSubmenu(openSubmenu === category.id ? null : category.id);
    } else {
      onSelect(category);
      setOpenSubmenu(null);
    }
  };

  const handleSubmenuClick = (category, submenuItem) => {
    onSelect({ ...category, selectedSubmenu: submenuItem });
    setOpenSubmenu(null);
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
                  <button
                    key={item.id}
                    onClick={() => handleSubmenuClick(category, item)}
                    className="w-full px-4 py-2.5 text-left text-white/80 text-sm hover:bg-white/10 transition-colors"
                  >
                    {item.name[language]}
                  </button>
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