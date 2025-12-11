import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Gem, Printer, Image, Share2, ChevronDown, ChevronRight, Sparkles, Box
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
    id: 'design_3d',
    icon: Box,
    name: { fr: 'Design 3D', en: '3D Design' },
    description: { fr: 'Designs avec textes en 3D volumétriques', en: 'Designs with volumetric 3D texts' },
    hasSubmenu: true,
    defaultExpertMode: false,
    submenu: [
      { id: 'design_3d_square', name: { fr: 'Carré 1:1', en: 'Square 1:1' }, prompt: { fr: 'Crée un design 3D pour ', en: 'Create a 3D design for ' }, dimensions: '1080x1080' },
      { id: 'design_3d_story', name: { fr: 'Story 9:16', en: 'Story 9:16' }, prompt: { fr: 'Crée un design 3D pour ', en: 'Create a 3D design for ' }, dimensions: '1080x1920' },
      { id: 'design_3d_portrait', name: { fr: 'Portrait 3:4', en: 'Portrait 3:4' }, prompt: { fr: 'Crée un design 3D pour ', en: 'Create a 3D design for ' }, dimensions: '1080x1350' },
      { id: 'design_3d_landscape', name: { fr: 'Paysage 16:9', en: 'Landscape 16:9' }, prompt: { fr: 'Crée un design 3D pour ', en: 'Create a 3D design for ' }, dimensions: '1920x1080' },
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
    id: 'print',
    icon: Printer,
    name: { fr: 'Design Print', en: 'Print Design' },
    description: { fr: 'Carte de visite, Flyer, Affiche', en: 'Business card, Flyer, Poster' },
    hasSubmenu: true,
    submenu: [
      { id: 'print_carre', name: { fr: 'Carré (1:1)', en: 'Square (1:1)' }, prompt: { fr: 'Crée un design print format carré pour', en: 'Create a square format print design for' }, dimensions: '1080x1080' },
      { id: 'print_story', name: { fr: 'Story (9:16)', en: 'Story (9:16)' }, prompt: { fr: 'Crée un design print format story pour', en: 'Create a story format print design for' }, dimensions: '1080x1920' },
      { id: 'print_portrait', name: { fr: 'Portrait (4:5)', en: 'Portrait (4:5)' }, prompt: { fr: 'Crée un design print format portrait pour', en: 'Create a portrait format print design for' }, dimensions: '1080x1350' },
      { id: 'print_paysage', name: { fr: 'Paysage (16:9)', en: 'Landscape (16:9)' }, prompt: { fr: 'Crée un design print format paysage pour', en: 'Create a landscape format print design for' }, dimensions: '1920x1080' },
    ]
  },
  {
    id: 'social',
    icon: Share2,
    name: { fr: 'Réseaux Sociaux', en: 'Social Media' },
    description: { fr: 'Posts, Stories, Bannières', en: 'Posts, Stories, Banners' },
    hasSubmenu: true,
    submenu: [
      { id: 'social_carre', name: { fr: 'Carré (1:1)', en: 'Square (1:1)' }, prompt: { fr: 'Crée un design social format carré pour', en: 'Create a square format social design for' }, dimensions: '1080x1080' },
      { id: 'social_story', name: { fr: 'Story (9:16)', en: 'Story (9:16)' }, prompt: { fr: 'Crée un design social format story pour', en: 'Create a story format social design for' }, dimensions: '1080x1920' },
      { id: 'social_portrait', name: { fr: 'Portrait (4:5)', en: 'Portrait (4:5)' }, prompt: { fr: 'Crée un design social format portrait pour', en: 'Create a portrait format social design for' }, dimensions: '1080x1350' },
      { id: 'social_paysage', name: { fr: 'Paysage (16:9)', en: 'Landscape (16:9)' }, prompt: { fr: 'Crée un design social format paysage pour', en: 'Create a landscape format social design for' }, dimensions: '1920x1080' },
    ]
  },
  {
    id: 'mockup',
    icon: Image,
    name: { fr: 'Mockups', en: 'Mockups' },
    description: { fr: 'Mises en scène réalistes', en: 'Realistic mockups' },
    hasSubmenu: true,
    submenu: [
      { id: 'mockup_carre', name: { fr: 'Carré (1:1)', en: 'Square (1:1)' }, prompt: { fr: 'Crée un mockup carré', en: 'Create a square mockup' }, dimensions: '1080x1080' },
      { id: 'mockup_story', name: { fr: 'Story (9:16)', en: 'Story (9:16)' }, prompt: { fr: 'Crée un mockup story', en: 'Create a story mockup' }, dimensions: '1080x1920' },
      { id: 'mockup_portrait', name: { fr: 'Portrait (4:5)', en: 'Portrait (4:5)' }, prompt: { fr: 'Crée un mockup portrait', en: 'Create a portrait mockup' }, dimensions: '1080x1350' },
      { id: 'mockup_paysage', name: { fr: 'Paysage (16:9)', en: 'Landscape (16:9)' }, prompt: { fr: 'Crée un mockup paysage', en: 'Create a landscape mockup' }, dimensions: '1920x1080' },
    ]
  },
  {
    id: 'product',
    icon: Image,
    name: { fr: 'Produit', en: 'Product' },
    description: { fr: 'Photos de produits', en: 'Product photos' },
    hasSubmenu: true,
    submenu: [
      { id: 'product_carre', name: { fr: 'Carré (1:1)', en: 'Square (1:1)' }, prompt: { fr: 'Crée une photo de produit carrée', en: 'Create a square product photo' }, dimensions: '1080x1080' },
      { id: 'product_story', name: { fr: 'Story (9:16)', en: 'Story (9:16)' }, prompt: { fr: 'Crée une photo de produit story', en: 'Create a story product photo' }, dimensions: '1080x1920' },
      { id: 'product_portrait', name: { fr: 'Portrait (4:5)', en: 'Portrait (4:5)' }, prompt: { fr: 'Crée une photo de produit portrait', en: 'Create a portrait product photo' }, dimensions: '1080x1350' },
      { id: 'product_paysage', name: { fr: 'Paysage (16:9)', en: 'Landscape (16:9)' }, prompt: { fr: 'Crée une photo de produit paysage', en: 'Create a landscape product photo' }, dimensions: '1920x1080' },
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

  const handleBlockClick = (category) => {
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
    <div className="grid grid-cols-1 gap-3 w-full max-w-xl mx-auto mb-8">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isOpen = openSubmenu === category.id;
        const isSelected = selectedCategory?.id === category.id;
        const isFreePrompt = category.isFreePrompt;

        return (
          <div key={category.id} className="relative">
            <div
              onClick={() => handleBlockClick(category)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all cursor-pointer",
                isFreePrompt 
                  ? "bg-gradient-to-br from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border-2 border-blue-500/30 hover:border-blue-500/50"
                  : "bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20",
                isSelected && !isFreePrompt && "bg-violet-500/10 border-violet-500/30",
                isSelected && isFreePrompt && "border-blue-500/70"
              )}
            >
              <div className="p-2 rounded-lg bg-white/5">
                <Icon className="h-5 w-5 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-white text-sm font-medium">{category.name[language]}</span>
                    {category.hasSubmenu && (
                      <ChevronDown className={cn(
                        "h-4 w-4 text-white/40 transition-transform",
                        isOpen && "rotate-180"
                      )} />
                    )}
                  </div>
                  {/* Switch + Badge - side by side top right */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {category.id === 'free_prompt' ? (
                      // Free prompt : mode expert fixe, pas de switch
                      <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                        EXPERT
                      </span>
                    ) : category.id === 'logo_picto' ? (
                      // Logo pictogramme : mode assisté fixe (grisé)
                      <>
                        <div className={cn(
                          "relative inline-flex h-4 w-7 items-center rounded-full opacity-40 cursor-not-allowed",
                          "bg-white/20"
                        )}>
                          <span className="inline-block h-2.5 w-2.5 transform rounded-full bg-white translate-x-1" />
                        </div>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500/60 to-cyan-500/60 text-white text-[10px] font-medium rounded-full">
                          ASSISTÉ
                        </span>
                      </>
                    ) : category.id === 'logo_complet' ? (
                      // Logo complet : mode expert fixe (grisé)
                      <>
                        <div className={cn(
                          "relative inline-flex h-4 w-7 items-center rounded-full opacity-40 cursor-not-allowed",
                          "bg-violet-600"
                        )}>
                          <span className="inline-block h-2.5 w-2.5 transform rounded-full bg-white translate-x-4" />
                        </div>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                          EXPERT
                        </span>
                      </>
                    ) : (
                      // Tous les autres : switch actif
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpertMode(category.id, e);
                          }}
                          className={cn(
                            "relative inline-flex h-4 w-7 items-center rounded-full transition-colors group/switch",
                            expertMode[category.id] ? "bg-violet-600" : "bg-white/20"
                          )}
                          title={expertMode[category.id] 
                            ? (language === 'fr' ? 'Mode Expert : Prompt brut sans assistance' : 'Expert Mode: Raw prompt without assistance')
                            : (language === 'fr' ? 'Mode Assisté : iGPT enrichit votre prompt' : 'Assisted Mode: iGPT enhances your prompt')
                          }
                        >
                          <span className={cn(
                            "inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform",
                            expertMode[category.id] ? "translate-x-4" : "translate-x-1"
                          )} />
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/switch:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="bg-gray-900/95 backdrop-blur-sm border border-violet-500/30 rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                              <p className="text-white text-xs font-medium">
                                {expertMode[category.id] 
                                  ? (language === 'fr' ? 'Mode Expert' : 'Expert Mode')
                                  : (language === 'fr' ? 'Mode Assisté' : 'Assisted Mode')
                                }
                              </p>
                              <p className="text-white/60 text-[10px] mt-0.5">
                                {expertMode[category.id] 
                                  ? (language === 'fr' ? 'Prompt brut sans assistance' : 'Raw prompt without assistance')
                                  : (language === 'fr' ? 'iGPT enrichit votre prompt' : 'iGPT enhances your prompt')
                                }
                              </p>
                            </div>
                          </div>
                        </button>
                        {expertMode[category.id] ? (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                            EXPERT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500/60 to-cyan-500/60 text-white text-[10px] font-medium rounded-full">
                            ASSISTÉ
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <p className="text-white/40 text-xs truncate">{category.description[language]}</p>
                
                {/* Info for free prompt */}
                {category.id === 'free_prompt' && (
                  <div className="mt-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-[10px] text-blue-300 leading-tight">
                      {language === 'fr'
                        ? 'Aucune assistance iGPT. Aucun format défini, aucune catégorie. Votre prompt doit être complet et détaillé pour obtenir de bons résultats.'
                        : 'No iGPT assistance. No defined format, no category. Your prompt must be complete and detailed to get good results.'}
                    </p>
                  </div>
                  )}
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