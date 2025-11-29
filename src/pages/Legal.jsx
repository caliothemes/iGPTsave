import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/components/LanguageContext';

export default function Legal() {
  const { t, language } = useLanguage();
  
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <a href={createPageUrl('Home')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              {t('back')}
            </a>
            <Logo size="small" />
            <LanguageSwitcher />
          </div>

          {/* Content */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('legalTitle')}</h1>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">1. {t('editor')}</h2>
              <div className="text-white/70 space-y-2">
                <p><strong className="text-white">iGPT</strong></p>
                <p>{t('editorDesc')}</p>
                <p>Email : contact@igpt.app</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">2. {t('hosting')}</h2>
              <div className="text-white/70 space-y-2 whitespace-pre-line">
                <p>{t('hostingDesc')}</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">3. {t('intellectualProperty')}</h2>
              <div className="text-white/70 space-y-2">
                <p>{t('ipDesc')}</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">4. {t('dataProtection')}</h2>
              <div className="text-white/70 space-y-2">
                <p>{t('dataDesc')}</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">5. {t('termsOfUse')}</h2>
              <div className="text-white/70 space-y-2">
                <p><strong className="text-white">{language === 'fr' ? 'Version gratuite' : 'Free version'}:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{t('freeDownloads')}</li>
                  <li>{language === 'fr' ? 'Filigrane sur les visuels' : 'Watermark on visuals'}</li>
                  <li>{language === 'fr' ? 'Génération illimitée (prévisualisation)' : 'Unlimited generation (preview)'}</li>
                </ul>
                <p className="mt-4"><strong className="text-white">{language === 'fr' ? 'Version payante' : 'Paid version'}:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{language === 'fr' ? 'Téléchargements selon la formule choisie' : 'Downloads according to chosen plan'}</li>
                  <li>{t('noWatermark')}</li>
                  <li>{t('hdFormats')}</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">6. {t('refundPolicy')}</h2>
              <div className="text-white/70 space-y-2">
                <p>{language === 'fr' ? 'Les packs de crédits achetés ne sont pas remboursables.' : 'Purchased credit packs are non-refundable.'}</p>
                <p>{language === 'fr' ? "Les abonnements peuvent être annulés à tout moment. L'accès reste actif jusqu'à la fin de la période payée." : 'Subscriptions can be cancelled at any time. Access remains active until the end of the paid period.'}</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">7. {t('liability')}</h2>
              <div className="text-white/70 space-y-2">
                <p>{language === 'fr' ? "VisualGPT utilise des technologies d'intelligence artificielle pour générer des visuels. Les résultats peuvent varier et ne sont pas garantis." : 'VisualGPT uses artificial intelligence technologies to generate visuals. Results may vary and are not guaranteed.'}</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">8. {t('contact')}</h2>
              <div className="text-white/70 space-y-2">
                <p>Email : contact@igpt.app</p>
              </div>
            </section>

            <div className="pt-8 border-t border-white/10">
              <p className="text-white/50 text-sm">
                {t('lastUpdate')} : {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}