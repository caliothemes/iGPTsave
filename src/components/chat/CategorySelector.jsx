import React, { useState } from 'react';
import { Crown, Printer, Camera, Share2, ChevronDown, Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';

const CATEGORIES = [
  {
    id: 'logo',
    icon: Crown,
    name: { fr: 'Logo HD', en: 'HD Logo' },
    description: { fr: 'Logos vectoriels, icônes, symboles', en: 'Vector logos, icons, symbols' },
    gradient: 'from-amber-500 to-orange-600',
    hasSubOptions: false
  },
  {
    id: 'print',
    icon: Printer,
    name: { fr: 'Print', en: 'Print' },
    description: { fr: 'Carte de visite, affiches, flyers', en: 'Business cards, posters, flyers' },
    gradient: 'from-blue-500 to-cyan-600',
    hasSubOptions: true,
    subOptions: [
      { id: 'portrait', name: { fr: 'Portrait', en: 'Portrait' }, ratio: '3:4' },
      { id: 'landscape', name: { fr: 'Paysage', en: 'Landscape' }, ratio: '4:3' },
      { id: 'square', name: { fr: 'Carré', en: 'Square' }, ratio: '1:1' }
    ]
  },
  {
    id: 'realistic',
    icon: Camera,
    name: { fr: 'Image réaliste', en: 'Realistic Image' },
    description: { fr: 'Photos IA, portraits, paysages', en: 'AI photos, portraits, landscapes' },
    gradient: 'from-emerald-500 to-teal-600',
    hasSubOptions: false
  },
  {
    id: 'social',
    icon: Share2,
    name: { fr: 'Réseaux sociaux', en: 'Social Media' },
    description: { fr: 'Posts Instagram, Facebook, LinkedIn', en: 'Instagram, Facebook, LinkedIn posts' },
    gradient: 'from-pink-500 to-rose-600',
    hasSubOptions: true,
    subOptions: [
      { id: 'square', name: { fr: 'Post carré', en: 'Square post' }, ratio: '1:1', dimensions: '1080x1080' },
      { id: 'portrait', name: { fr: 'Post portrait', en: 'Portrait post' }, ratio: '4:5', dimensions: '1080x1350' },
      { id: 'story', name: { fr: 'Story', en: 'Story' }, ratio: '9:16', dimensions: '1080x1920' },
      { id: 'landscape', name: { fr: 'Post paysage', en: 'Landscape post' }, ratio: '16:9', dimensions: '1920x1080' }
    ]
  }
];

// Export pour utilisation dans Home.jsx
export const getCategoryPromptConfig = (categoryId, subOptionId) => {
  const configs = {
    logo: {
      systemPrompt: `Tu génères des LOGOS HD uniquement.
RÈGLES ABSOLUES:
- Logo vectoriel, icône ou symbole abstrait UNIQUEMENT
- JAMAIS de texte, lettres, mots ou typographie
- Style clean, minimaliste, professionnel
- Centré, fond transparent ou neutre
- Prompt: "absolutely no text, no letters, abstract logo design, vector icon, symbol, clean minimal style, centered, professional logo, high quality"`,
      dimensions: '2000x2000',
      visualType: 'logo'
    },
    print: {
      portrait: {
        systemPrompt: `Tu génères des visuels PRINT à plat pour impression.
RÈGLES ABSOLUES:
- Design ABSTRAIT et GRAPHIQUE uniquement - jamais de représentation réaliste
- JAMAIS de texte, lettres, mots
- Design à PLAT, FULL BLEED, bord à bord
- Formes géométriques, dégradés élégants, motifs sophistiqués
- Prêt à imprimer, 300dpi
- Prompt: "absolutely no text, abstract flat design, FULL BLEED edge-to-edge, geometric shapes, elegant gradient, print-ready 300dpi, completely text-free"`,
        dimensions: '2480x3508',
        visualType: 'print'
      },
      landscape: {
        systemPrompt: `Tu génères des visuels PRINT à plat pour impression.
RÈGLES ABSOLUES:
- Design ABSTRAIT et GRAPHIQUE uniquement
- JAMAIS de texte, lettres, mots
- Design à PLAT, FULL BLEED, bord à bord
- Formes géométriques, dégradés élégants
- Prêt à imprimer, 300dpi`,
        dimensions: '3508x2480',
        visualType: 'print'
      },
      square: {
        systemPrompt: `Tu génères des visuels PRINT à plat pour impression.
RÈGLES ABSOLUES:
- Design ABSTRAIT et GRAPHIQUE uniquement
- JAMAIS de texte, lettres, mots
- Design à PLAT, FULL BLEED, bord à bord
- Formes géométriques, dégradés élégants
- Prêt à imprimer, 300dpi`,
        dimensions: '2480x2480',
        visualType: 'print'
      }
    },
    realistic: {
      systemPrompt: `Tu génères des IMAGES RÉALISTES IA de haute qualité.
RÈGLES:
- Photoréalisme, qualité photographique
- Éclairage naturel ou studio professionnel
- Détails fins, textures réalistes
- Peut inclure personnes, paysages, objets, scènes
- Prompt: "photorealistic, high quality photography, natural lighting, sharp details, professional photo, 8k resolution"`,
      dimensions: '1920x1080',
      visualType: 'realistic'
    },
    social: {
      square: {
        systemPrompt: `Tu génères des visuels pour RÉSEAUX SOCIAUX.
RÈGLES:
- Design moderne et engageant
- Couleurs vibrantes, tendance
- Peut être graphique ou photo selon demande
- Format carré 1:1 optimisé Instagram/Facebook`,
        dimensions: '1080x1080',
        visualType: 'post_instagram'
      },
      portrait: {
        systemPrompt: `Tu génères des visuels pour RÉSEAUX SOCIAUX.
Format portrait 4:5 optimisé pour feed Instagram.`,
        dimensions: '1080x1350',
        visualType: 'post_instagram'
      },
      story: {
        systemPrompt: `Tu génères des visuels pour STORIES.
Format vertical 9:16 optimisé pour Stories Instagram/Facebook.`,
        dimensions: '1080x1920',
        visualType: 'story_instagram'
      },
      landscape: {
        systemPrompt: `Tu génères des visuels pour RÉSEAUX SOCIAUX.
Format paysage 16:9 optimisé pour YouTube/LinkedIn.`,
        dimensions: '1920x1080',
        visualType: 'post_linkedin'
      }
    }
  };

  if (categoryId === 'logo' || categoryId === 'realistic') {
    return configs[categoryId];
  }
  
  if (configs[categoryId] && subOptionId) {
    return configs[categoryId][subOptionId];
  }
  
  return null;
};

export default function CategorySelector({ onSelect, selectedCategory }) {
  const { language } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedSubOption, setSelectedSubOption] = useState(null);

  const handleCategoryClick = (category) => {
    if (category.hasSubOptions) {
      setExpandedCategory(expandedCategory === category.id ? null : category.id);
      setSelectedSubOption(null);
    } else {
      onSelect({ category: category.id, subOption: null });
    }
  };

  const handleSubOptionClick = (categoryId, subOption) => {
    setSelectedSubOption(subOption.id);
    onSelect({ category: categoryId, subOption: subOption.id });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <p className="text-white/60 text-sm text-center mb-4">
        {language === 'fr' 
          ? 'Choisissez le type de création pour commencer'
          : 'Choose the type of creation to start'}
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory?.category === category.id;
          const isExpanded = expandedCategory === category.id;
          
          return (
            <div key={category.id} className="flex flex-col">
              <button
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  "relative p-4 rounded-xl border transition-all duration-300 text-left group",
                  isSelected
                    ? "bg-gradient-to-br border-white/30 shadow-lg"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
                  isSelected && `bg-gradient-to-br ${category.gradient}`
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isSelected ? "bg-white/20" : `bg-gradient-to-br ${category.gradient} bg-opacity-20`
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      isSelected ? "text-white" : "text-white/80"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-medium text-sm",
                        isSelected ? "text-white" : "text-white/90"
                      )}>
                        {category.name[language]}
                      </h3>
                      {category.hasSubOptions && (
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180",
                          isSelected ? "text-white/80" : "text-white/50"
                        )} />
                      )}
                      {isSelected && !category.hasSubOptions && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <p className={cn(
                      "text-xs mt-1 line-clamp-2",
                      isSelected ? "text-white/80" : "text-white/50"
                    )}>
                      {category.description[language]}
                    </p>
                  </div>
                </div>
              </button>
              
              {/* Sub-options dropdown */}
              {category.hasSubOptions && isExpanded && (
                <div className="mt-2 ml-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {category.subOptions.map((subOption) => {
                    const isSubSelected = selectedCategory?.category === category.id && 
                                          selectedCategory?.subOption === subOption.id;
                    return (
                      <button
                        key={subOption.id}
                        onClick={() => handleSubOptionClick(category.id, subOption)}
                        className={cn(
                          "w-full px-3 py-2 rounded-lg border text-left text-sm transition-all flex items-center justify-between",
                          isSubSelected
                            ? `bg-gradient-to-r ${category.gradient} border-white/30 text-white`
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span>{subOption.name[language]}</span>
                        <span className="text-xs opacity-60">{subOption.ratio}</span>
                        {isSubSelected && <Check className="h-3 w-3 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}