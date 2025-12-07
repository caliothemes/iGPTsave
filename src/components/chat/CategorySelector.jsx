import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Gem, Printer, Image, Share2, ChevronDown, ChevronRight, Sparkles
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'logo_picto',
    icon: Gem,
    name: { fr: 'Logo Pictogramme', en: 'Logo Icon' },
    description: { fr: 'Icône seule, symbole, pictogramme', en: 'Icon only, symbol, pictogram' },
    hasSubmenu: false,
    prompt: { fr: 'Crée un logo pictogramme', en: 'Create a logo icon' },
    defaultExpertMode: false
  },
  {
    id: 'logo_complet',
    icon: Sparkles,
    name: { fr: 'Logo Complet', en: 'Complete Logo' },
    description: { fr: 'Logo avec texte, prêt à l\'emploi', en: 'Logo with text, ready to use' },
    hasSubmenu: false,
    prompt: { fr: 'Crée un logo complet', en: 'Create a complete logo' },
    defaultExpertMode: true
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
                  { id: 'carte_visite_h', name: { fr: 'Horizontal', en: 'Horizontal' }, prompt: { fr: 'Crée une carte de visite horizontale', en: 'Create a horizontal business card' }, dimensions: '1050x600' },
                  { id: 'carte_visite_v', name: { fr: 'Vertical', en: 'Vertical' }, prompt: { fr: 'Crée une carte de visite verticale', en: 'Create a vertical business card' }, dimensions: '600x1050' },
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
    hasSubmenu: true,
    submenu: [
      { id: 'image_carre', name: { fr: 'Carré (1:1)', en: 'Square (1:1)' }, prompt: { fr: 'Crée une image réaliste format carré', en: 'Create a realistic image in square format' }, dimensions: '1080x1080' },
      { id: 'image_story', name: { fr: 'Story (9:16)', en: 'Story (9:16)' }, prompt: { fr: 'Crée une image réaliste format story', en: 'Create a realistic image in story format' }, dimensions: '1080x1920' },
      { id: 'image_portrait', name: { fr: 'Portrait (4:5)', en: 'Portrait (4:5)' }, prompt: { fr: 'Crée une image réaliste format portrait', en: 'Create a realistic image in portrait format' }, dimensions: '1080x1350' },
      { id: 'image_paysage', name: { fr: 'Paysage (16:9)', en: 'Landscape (16:9)' }, prompt: { fr: 'Crée une image réaliste format paysage', en: 'Create a realistic image in landscape format' }, dimensions: '1920x1080' },
    ]
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
  {
    id: 'free_prompt',
    icon: Sparkles,
    name: { fr: 'Prompt 100% libre', en: '100% Free Prompt' },
    description: { fr: '🎯 Pro uniquement - Aucune assistance', en: '🎯 Pro only - No assistance' },
    hasSubmenu: false,
    prompt: { fr: '', en: '' },
    defaultExpertMode: true,
    isFreePrompt: true
  },
  ];

export default function CategorySelector({ onSelect, selectedCategory }) {
  const { language } = useLanguage();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [openNestedSubmenu, setOpenNestedSubmenu] = useState(null);
  
  // Initialize expertMode with default values from categories
  const [expertMode, setExpertMode] = useState(() => {
    const defaults = {};
    CATEGORIES.forEach(cat => {
      if (cat.defaultExpertMode !== undefined) {
        defaults[cat.id] = cat.defaultExpertMode;
      }
    });
    return defaults;
  });

  const handleCategoryClick = (category) => {
    if (category.hasSubmenu) {
      setOpenSubmenu(openSubmenu === category.id ? null : category.id);
      setOpenNestedSubmenu(null);
    } else {
      onSelect({ ...category, expertMode: expertMode[category.id] || false });
      setOpenSubmenu(null);
      setOpenNestedSubmenu(null);
    }
  };

  const toggleExpertMode = (categoryId, e) => {
    e.stopPropagation();
    setExpertMode(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handleSubmenuClick = (category, submenuItem) => {
    if (submenuItem.orientations) {
      setOpenNestedSubmenu(openNestedSubmenu === submenuItem.id ? null : submenuItem.id);
    } else {
      onSelect({ ...category, selectedSubmenu: submenuItem, expertMode: expertMode[category.id] || false });
      setOpenSubmenu(null);
      setOpenNestedSubmenu(null);
    }
  };

  const handleOrientationClick = (category, submenuItem, orientation) => {
    onSelect({ ...category, selectedSubmenu: { ...submenuItem, ...orientation }, expertMode: expertMode[category.id] || false });
    setOpenSubmenu(null);
    setOpenNestedSubmenu(null);
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xl mx-auto">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isOpen = openSubmenu === category.id;
        const isSelected = selectedCategory?.id === category.id;
        const isFreePrompt = category.isFreePrompt;

        return (
          <div key={category.id} className="relative">
            <div
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all cursor-pointer",
                isFreePrompt 
                  ? "bg-gradient-to-br from-orange-600/20 to-red-600/20 hover:from-orange-600/30 hover:to-red-600/30 border-2 border-orange-500/30 hover:border-orange-500/50"
                  : "bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20",
                isSelected && !isFreePrompt && "bg-violet-500/10 border-violet-500/30",
                isSelected && isFreePrompt && "border-orange-500/70"
              )}
            >
              <div className="p-2 rounded-lg bg-white/5">
                <Icon className="h-5 w-5 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white text-sm font-medium">{category.name[language]}</span>
                  {category.hasSubmenu && (
                    <ChevronDown className={cn(
                      "h-4 w-4 text-white/40 transition-transform",
                      isOpen && "rotate-180"
                    )} />
                  )}
                  {/* Mode Badge - Always visible */}
                  {category.defaultExpertMode !== undefined && (
                    expertMode[category.id] ? (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                        EXPERT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500/60 to-cyan-500/60 text-white text-[10px] font-medium rounded-full">
                        ASSISTÉ
                      </span>
                    )
                  )}
                </div>
                <p className="text-white/40 text-xs truncate">{category.description[language]}</p>
                
                {/* Expert Mode Toggle */}
                {category.defaultExpertMode !== undefined ? (
                  category.isFreePrompt ? (
                    // Free Prompt : info warning uniquement
                    <div className="mt-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <p className="text-[10px] text-orange-300 leading-tight">
                        {language === 'fr'
                          ? 'Aucune assistance iGPT. Aucun format défini, aucune catégorie. Votre prompt doit être complet et détaillé pour obtenir de bons résultats.'
                          : 'No iGPT assistance. No defined format, no category. Your prompt must be complete and detailed to get good results.'}
                      </p>
                    </div>
                  ) : (
                    // Logo types : mode fixe
                    <div className="flex items-center gap-2 mt-2 group/toggle relative">
                      <div
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full opacity-40 cursor-not-allowed",
                          expertMode[category.id] ? "bg-violet-600" : "bg-white/20"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3 w-3 transform rounded-full bg-white",
                          expertMode[category.id] ? "translate-x-5" : "translate-x-1"
                        )} />
                      </div>
                      <span className="text-[10px] text-white/30">
                        {expertMode[category.id] ? (language === 'fr' ? 'Expert' : 'Expert') : (language === 'fr' ? 'Assisté' : 'Assisted')}
                      </span>

                      {/* Tooltip */}
                      <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover/toggle:opacity-100 pointer-events-none transition-opacity z-50 w-56">
                        <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                          <p className="text-white text-[10px] leading-relaxed">
                            {expertMode[category.id] 
                              ? (language === 'fr' 
                                ? '🎯 Mode expert fixe : optimal pour logos complets avec texte.'
                                : '🎯 Fixed expert mode: optimal for complete logos with text.')
                              : (language === 'fr'
                                ? '✨ Mode assisté fixe : optimal pour pictogrammes et icônes.'
                                : '✨ Fixed assisted mode: optimal for pictograms and icons.')
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2 mt-2 group/toggle relative">
                    <button
                      onClick={(e) => toggleExpertMode(category.id, e)}
                      className={cn(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                        expertMode[category.id] ? "bg-violet-600" : "bg-white/20"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                        expertMode[category.id] ? "translate-x-5" : "translate-x-1"
                      )} />
                    </button>
                    <span className="text-[10px] text-white/50">
                      {expertMode[category.id] ? (language === 'fr' ? 'Expert' : 'Expert') : (language === 'fr' ? 'Assisté' : 'Assisted')}
                    </span>
                    
                    {/* Tooltip */}
                    <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover/toggle:opacity-100 pointer-events-none transition-opacity z-50 w-56">
                      <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                        <p className="text-white text-[10px] leading-relaxed">
                          {expertMode[category.id] 
                            ? (language === 'fr' 
                              ? '🎯 Prompt non enrichi par iGPT, envoyé tel quel. Attention vous devez faire un prompt complet pour avoir de bons résultats.'
                              : '🎯 Prompt not enhanced by iGPT, sent as is. Warning: you must write a complete prompt for good results.')
                            : (language === 'fr'
                              ? '✨ Prompt enrichi en arrière plan par iGPT'
                              : '✨ Prompt enhanced in background by iGPT')
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Choose Button */}
                  <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(category);
                  }}
                  className={cn(
                    "mt-3 w-full py-2 px-3 rounded-lg text-xs font-medium transition-all",
                    isFreePrompt
                      ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  )}
                  >
                  {language === 'fr' ? 'Choisir ce format' : 'Choose this format'}
                  </button>
                  </div>
                  </div>

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