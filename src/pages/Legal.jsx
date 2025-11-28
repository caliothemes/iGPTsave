import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';

export default function Legal() {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <a href={createPageUrl('Home')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              Retour
            </a>
            <Logo size="small" />
          </div>

          {/* Content */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 space-y-8">
            <h1 className="text-3xl font-bold text-white">Mentions Légales</h1>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">1. Éditeur du site</h2>
              <div className="text-white/70 space-y-2">
                <p><strong className="text-white">VisualGPT</strong></p>
                <p>Service de création de visuels assisté par intelligence artificielle</p>
                <p>Email : contact@visualgpt.ai</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">2. Hébergement</h2>
              <div className="text-white/70 space-y-2">
                <p>Le site est hébergé par Base44</p>
                <p>Infrastructure cloud sécurisée</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">3. Propriété intellectuelle</h2>
              <div className="text-white/70 space-y-2">
                <p>Les visuels générés par VisualGPT sont la propriété de l'utilisateur qui les a créés, sous réserve du respect des conditions d'utilisation.</p>
                <p>L'utilisateur garantit ne pas utiliser le service pour générer des contenus illicites, diffamatoires ou portant atteinte aux droits de tiers.</p>
                <p>Les visuels générés en version gratuite comportent un filigrane VisualGPT.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">4. Protection des données personnelles</h2>
              <div className="text-white/70 space-y-2">
                <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.</p>
                <p>Les données collectées sont :</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Adresse email (pour l'authentification)</li>
                  <li>Visuels créés (stockés de manière sécurisée)</li>
                  <li>Historique des transactions</li>
                </ul>
                <p>Vos données ne sont jamais revendues à des tiers.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">5. Conditions d'utilisation</h2>
              <div className="text-white/70 space-y-2">
                <p><strong className="text-white">Version gratuite :</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>5 téléchargements gratuits</li>
                  <li>Filigrane sur les visuels</li>
                  <li>Génération illimitée (prévisualisation)</li>
                </ul>
                <p className="mt-4"><strong className="text-white">Version payante :</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Téléchargements selon la formule choisie</li>
                  <li>Sans filigrane</li>
                  <li>Formats haute définition</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">6. Politique de remboursement</h2>
              <div className="text-white/70 space-y-2">
                <p>Les packs de crédits achetés ne sont pas remboursables.</p>
                <p>Les abonnements peuvent être annulés à tout moment. L'accès reste actif jusqu'à la fin de la période payée.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">7. Limitation de responsabilité</h2>
              <div className="text-white/70 space-y-2">
                <p>VisualGPT utilise des technologies d'intelligence artificielle pour générer des visuels. Les résultats peuvent varier et ne sont pas garantis.</p>
                <p>VisualGPT ne peut être tenu responsable des utilisations faites des visuels générés par les utilisateurs.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">8. Contact</h2>
              <div className="text-white/70 space-y-2">
                <p>Pour toute question concernant ces mentions légales ou vos données personnelles :</p>
                <p>Email : contact@visualgpt.ai</p>
              </div>
            </section>

            <div className="pt-8 border-t border-white/10">
              <p className="text-white/50 text-sm">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}