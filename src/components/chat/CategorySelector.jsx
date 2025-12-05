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
    description: { fr: 'Carte de visite, affiches, flyers', en: 'Business cards, posters, flyers' },
    hasSubmenu: true,
    submenu: [
      { id: 'carte_visite', name: { fr: 'Carte de visite', en: 'Business Card' }, prompt: { fr: 'Crée une carte de visite', en: 'Create a business card' } },
      { id: 'flyer', name: { fr: 'Flyer', en: 'Flyer' }, prompt: { fr: 'Crée un flyer', en: 'Create a flyer' } },
      { id: 'affiche', name: { fr: 'Affiche', en: 'Poster' }, prompt: { fr: 'Crée une affiche', en: 'Create a poster' } },
      { id: 'invitation', name: { fr: 'Invitation', en: 'Invitation' }, prompt: { fr: 'Crée une invitation', en: 'Create an invitation' } },
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
    description: { fr: 'Posts Instagram, Facebook, LinkedIn', en: 'Instagram, Facebook, LinkedIn posts' },
    hasSubmenu: true,
    submenu: [
      { id: 'instagram', name: { fr: 'Post Instagram', en: 'Instagram Post' }, prompt: { fr: 'Crée un post Instagram', en: 'Create an Instagram post' } },
      { id: 'story', name: { fr: 'Story Instagram', en: 'Instagram Story' }, prompt: { fr: 'Crée une story Instagram', en: 'Create an Instagram story' } },
      { id: 'facebook', name: { fr: 'Post Facebook', en: 'Facebook Post' }, prompt: { fr: 'Crée un post Facebook', en: 'Create a Facebook post' } },
      { id: 'linkedin', name: { fr: 'Post LinkedIn', en: 'LinkedIn Post' }, prompt: { fr: 'Crée un post LinkedIn', en: 'Create a LinkedIn post' } },
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
              <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl">
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