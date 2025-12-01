import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Monitor, Printer, Sparkles, Wand2, X,
  Image, Layout, FileText, CreditCard, 
  Layers, Type, Square, Palette
} from 'lucide-react';
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
    description_fr: "Votre assistant IA pour créer des visuels professionnels en quelques clics. Logos, cartes de visite, posts réseaux sociaux et bien plus encore.",
    description_en: "Your AI assistant to create professional visuals in a few clicks. Logos, business cards, social media posts and much more."
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
    items_fr: ["Cartes de visite", "Flyers A5", "Affiches A3", "Invitations", "Stickers", "Cartes cadeaux"],
    items_en: ["Business Cards", "A5 Flyers", "A3 Posters", "Invitations", "Stickers", "Gift Cards"]
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
    description_fr: "Personnalisez vos créations avec notre éditeur intégré : ajoutez du texte, des formes, des textures générées par IA, des illustrations et bien plus. Exportez en haute définition.",
    description_en: "Customize your creations with our built-in editor: add text, shapes, AI-generated textures, illustrations and more. Export in high definition.",
    items_fr: ["Textes personnalisables", "Formes géométriques", "Textures IA", "Illustrations", "Effets & filtres", "Export HD"],
    items_en: ["Custom Text", "Geometric Shapes", "AI Textures", "Illustrations", "Effects & Filters", "HD Export"]
  },
  footer: {
    title_fr: "Créez en 3 étapes",
    title_en: "Create in 3 steps",
    description_fr: "1. Décrivez votre visuel en quelques mots\n2. L'IA génère plusieurs propositions\n3. Personnalisez et téléchargez",
    description_en: "1. Describe your visual in a few words\n2. AI generates multiple proposals\n3. Customize and download"
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
            <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-500/20">
              {/* Background Image */}
              {content.editor?.image_url && (
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url(${content.editor.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              )}
              
              <div className="relative p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500">
                    <Wand2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-white">
                    {t('editor', 'title')}
                  </h3>
                </div>
                
                <p className="text-white/70 mb-6 max-w-2xl">
                  {t('editor', 'description')}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getItems('editor').map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-white/80 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg md:text-xl font-medium text-white mb-2">
                {t('footer', 'title')}
              </h3>
              <p className="text-white/60 text-sm whitespace-pre-line">
                {t('footer', 'description')}
              </p>
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