import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, Scale, Shield, FileText, Mail, Building, Server, CreditCard, AlertCircle } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const iconMap = {
  Scale, Shield, FileText, Mail, Building, Server, CreditCard, AlertCircle
};

export default function Legal() {
  const { t, language } = useLanguage();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.LegalSection.list('order');
      setSections(data);
      setLoading(false);
    };
    load();
  }, []);

  const toggleSection = (id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getIcon = (iconName) => {
    return iconMap[iconName] || FileText;
  };

  return (
    <PageWrapper>
      {() => (
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t('legalTitle')}</h1>
            <p className="text-white/60">{t('lastUpdate')}: {language === 'fr' ? '29 novembre 2025' : 'November 29, 2025'}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              {language === 'fr' ? 'Aucune section configurée' : 'No sections configured'}
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section) => {
                const Icon = getIcon(section.icon);
                const isOpen = openSections[section.id];
                
                return (
                  <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                      <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-violet-600/20">
                            <Icon className="h-5 w-5 text-violet-400" />
                          </div>
                          <h2 className="text-lg font-semibold text-white text-left">
                            {language === 'fr' ? section.title_fr : (section.title_en || section.title_fr)}
                          </h2>
                        </div>
                        <ChevronDown className={cn("h-5 w-5 text-white/50 transition-transform", isOpen && "rotate-180")} />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-6 pb-6 pt-0">
                          <div className="pl-14 text-white/70 whitespace-pre-line leading-relaxed">
                            {language === 'fr' ? section.content_fr : (section.content_en || section.content_fr)}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}