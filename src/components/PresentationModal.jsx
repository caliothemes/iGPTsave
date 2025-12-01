import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Monitor, Printer, Sparkles, Wand2, X,
  Image, Layout, FileText, CreditCard, 
  Layers, Type, Square, Palette
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from './LanguageContext';
import { base44 } from '@/api/base44Client';
import Logo from './Logo';

const ICON_MAP = {
  Monitor, Printer, Sparkles, Wand2, Image, Layout, 
  FileText, CreditCard, Layers, Type, Square, Palette
};

// Default content if no admin data
const DEFAULT_CONTENT = {
  header: {
    title_fr: "Bienvenue sur iGPT",
    title_en: "Welcome to iGPT",
    description_fr: "iGPT est votre assistant créatif propulsé par l'intelligence artificielle. Créez des visuels professionnels en quelques secondes : logos, cartes de visite, flyers, posts pour réseaux sociaux, affiches et bien plus encore. Décrivez simplement ce que vous voulez, et notre IA génère des designs uniques et personnalisables. Aucune compétence en design requise !",
    description_en: "iGPT is your creative assistant powered by artificial intelligence. Create professional visuals in seconds: logos, business cards, flyers, social media posts, posters and much more. Simply describe what you want, and our AI generates unique, customizable designs. No design skills required!"
  },
  digital: {
    title_fr: "Visuels Digital",
    title_en: "Digital Visuals",
    icon: "Monitor",
    items_fr: ["Logos HD", "Posts Instagram", "Stories", "Bannières web", "Posts Facebook", "Posts LinkedIn"],
    items_en: ["HD Logos", "Instagram Posts", "Stories", "Web Banners", "Facebook Posts", "LinkedIn Posts"]
  },
  print: {
    title_fr: "Supports Print",
    title_en: "Print Materials",
    icon: "Printer",
    items_fr: ["Cartes de visite", "Flyers", "Affiches", "Invitations", "Stickers", "Cartes cadeaux"],
    items_en: ["Business Cards", "Flyers", "Posters", "Invitations", "Stickers", "Gift Cards"]
  },
  ai_images: {
    title_fr: "Images IA",
    title_en: "AI Images",
    icon: "Sparkles",
    items_fr: ["Illustrations uniques", "Arrière-plans créatifs", "Textures sur mesure", "Art conceptuel", "Portraits stylisés", "Scènes imaginaires"],
    items_en: ["Unique Illustrations", "Creative Backgrounds", "Custom Textures", "Concept Art", "Stylized Portraits", "Imaginary Scenes"]
  },
  editor: {
    title_fr: "Éditeur Magique",
    title_en: "Magic Editor",
    description_fr: "Personnalisez vos créations avec notre éditeur intégré : ajoutez du texte avec effets (ombre, néon, 3D), des formes géométriques, des textures générées par IA, des illustrations et bien plus. Exportez en haute définition.",
    description_en: "Customize your creations with our built-in editor: add text with effects (shadow, neon, 3D), geometric shapes, AI-generated textures, illustrations and more. Export in high definition.",
    items_fr: ["Textes avec effets", "Formes géométriques", "Textures IA", "Illustrations", "Fonds & dégradés", "Export HD"],
    items_en: ["Text with Effects", "Geometric Shapes", "AI Textures", "Illustrations", "Backgrounds & Gradients", "HD Export"]
  },
  footer: {
    title_fr: "Écrivez, iGPT le crée...",
    title_en: "Write it, iGPT creates it...",
    description_fr: "",
    description_en: ""
  }
};

export default function PresentationModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await base44.entities.AppPresentation.filter({ is_active: true });
        if (data && data.length > 0) {
          const newContent = { ...DEFAULT_CONTENT };
          data.forEach(item => {
            if (item.section) {
              newContent[item.section] = {
                ...DEFAULT_CONTENT[item.section],
                ...item
              };
            }
          });
          setContent(newContent);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    if (isOpen) loadContent();
  }, [isOpen]);

  const t = (section, field) => {
    const data = content[section];
    if (!data) return '';
    return language === 'fr' ? data[`${field}_fr`] : (data[`${field}_en`] || data[`${field}_fr`]);
  };

  const getItems = (section) => {
    const data = content[section];
    if (!data) return [];
    return language === 'fr' ? (data.items_fr || []) : (data.items_en || data.items_fr || []);
  };

  const getIcon = (section) => {
    const iconName = content[section]?.icon;
    return ICON_MAP[iconName] || Monitor;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-white/10 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-4 md:p-8">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo size="large" showText={false} />
              </div>
              <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                {t('header', 'description')}
              </p>
            </div>

            {/* Section Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-light">
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {language === 'fr' ? 'Que peut réaliser iGPT ?' : 'What can iGPT create?'}
                </span>
              </h2>
            </div>

            {/* 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              {/* Digital Column */}
              <FeatureColumn
                icon={getIcon('digital')}
                title={t('digital', 'title')}
                items={getItems('digital')}
                gradient="from-violet-500 to-purple-500"
              />
              
              {/* Print Column */}
              <FeatureColumn
                icon={getIcon('print')}
                title={t('print', 'title')}
                items={getItems('print')}
                gradient="from-blue-500 to-cyan-500"
              />
              
              {/* AI Images Column */}
              <FeatureColumn
                icon={getIcon('ai_images')}
                title={t('ai_images', 'title')}
                items={getItems('ai_images')}
                gradient="from-pink-500 to-rose-500"
              />
            </div>

            {/* Editor Section */}
            <div className="relative rounded-2xl overflow-hidden mb-8 border border-violet-500/30">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-purple-900/50 to-indigo-900/60" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
              
              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
              
              <div className="relative p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Left: Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30">
                        <Wand2 className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-semibold text-white">
                        {t('editor', 'title')}
                      </h3>
                    </div>
                    
                    <p className="text-white/70 mb-4 max-w-xl">
                      {t('editor', 'description')}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {getItems('editor').map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-white/80 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-purple-400" />
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    {/* Team Update Notice */}
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg">
                      <Sparkles className="h-4 w-4 text-violet-300" />
                      <span className="text-violet-200 text-xs">
                        {language === 'fr' 
                          ? 'Notre équipe ajoute de nouvelles textures et illustrations régulièrement !' 
                          : 'Our team adds new textures and illustrations regularly!'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right: Illustration */}
                  <div className="hidden md:flex items-center justify-center w-40">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl blur-xl opacity-30" />
                      <div className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                            <Type className="h-4 w-4 text-white" />
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                            <Square className="h-4 w-4 text-white" />
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                            <Palette className="h-4 w-4 text-white" />
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Layers className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="text-center py-8">
              <div className="relative inline-block animate-float-gentle">
                {/* Glow effect behind */}
                <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-violet-500/30 via-purple-500/30 to-blue-500/30 rounded-full scale-150" />
                <h3 className="relative text-3xl md:text-4xl lg:text-5xl font-light tracking-wide">
                  <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-lg">
                    {language === 'fr' ? 'Imaginez et écrivez, iGPT le crée...' : 'Imagine and write, iGPT creates it...'}
                  </span>
                </h3>
              </div>
              <style>{`
                @keyframes float-gentle {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-6px); }
                }
                .animate-float-gentle {
                  animation: float-gentle 4s ease-in-out infinite;
                }
              `}</style>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function FeatureColumn({ icon: Icon, title, items, gradient }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 md:p-5 border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg bg-gradient-to-r ${gradient}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-medium text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2 text-white/70 text-sm">
            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}