import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown, CreditCard, MessageSquare, Rocket, Star, Gem } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";

const creditPacks = [
  { id: 'pack_10', credits: 10, messages: 100, price: 8.99, pricePerMsg: 0.09, popular: false },
  { id: 'pack_50', credits: 50, messages: 500, price: 39.99, pricePerMsg: 0.08, popular: true },
  { id: 'pack_100', credits: 100, messages: 1000, price: 59.99, pricePerMsg: 0.06, popular: false },
];

const subscriptions = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    messages: 50,
    pricePerMsg: 0,
    features: ['50 messages/mois', 'Génération de visuels', 'Éditeur magique', 'Sans filigrane'],
    icon: MessageSquare,
    gradient: 'from-gray-600 to-gray-700',
    isFree: true
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 6.99,
    messages: 100,
    pricePerMsg: 0.07,
    features: ['100 messages/mois', 'Sans filigrane', 'Éditeur magique', 'Support email'],
    icon: Zap,
    gradient: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 14.99,
    messages: 250,
    pricePerMsg: 0.06,
    features: ['250 messages/mois', 'Sans filigrane', 'Éditeur magique', 'Support prioritaire'],
    icon: Star,
    gradient: 'from-violet-600 to-purple-600',
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 24.99,
    messages: 500,
    pricePerMsg: 0.05,
    features: ['500 messages/mois', 'Sans filigrane', 'Éditeur magique', 'Formats HD & Print', 'Support VIP'],
    icon: Crown,
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: 39.90,
    messages: 1000,
    pricePerMsg: 0.04,
    features: ['1000 messages/mois', 'Sans filigrane', 'Éditeur magique', 'Formats HD & Print', 'API Access', 'Support VIP dédié'],
    icon: Gem,
    gradient: 'from-rose-500 to-pink-600'
  }
];

export default function Pricing() {
  const { language } = useLanguage();
  const [purchasing, setPurchasing] = useState(null);

  const handlePurchase = async (type, item, user, userCredits) => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl('Pricing'));
      return;
    }

    setPurchasing(item.id);

    await base44.entities.Transaction.create({
      user_email: user.email,
      type: type === 'pack' ? 'credit_pack' : `subscription_${item.id}`,
      amount: item.price,
      credits_added: item.messages,
      status: 'completed'
    });

    if (type === 'pack') {
      await base44.entities.UserCredits.update(userCredits.id, { 
        paid_credits: (userCredits.paid_credits || 0) + item.messages 
      });
    } else {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      await base44.entities.UserCredits.update(userCredits.id, {
        subscription_type: item.id,
        subscription_end_date: endDate.toISOString().split('T')[0],
        paid_credits: (userCredits.paid_credits || 0) + item.messages
      });
    }

    window.location.href = createPageUrl('Home');
  };

  return (
    <PageWrapper>
      {({ user, credits }) => (
        <div className="space-y-10">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              {language === 'fr' ? 'Choisissez votre formule' : 'Choose your plan'}
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {language === 'fr' 
                ? 'Débloquez tout le potentiel de iGPT avec nos offres flexibles' 
                : 'Unlock the full potential of iGPT with our flexible plans'}
            </p>
            {credits && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80">
                <MessageSquare className="h-4 w-4" />
                <span>
                  {language === 'fr' ? 'Messages restants' : 'Messages left'}: {(credits.free_downloads || 0) + (credits.paid_credits || 0)}
                </span>
              </div>
            )}
          </div>

          {/* Subscriptions */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              {language === 'fr' ? 'Abonnements' : 'Subscriptions'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className={cn(
                  "relative rounded-2xl p-5 transition-all duration-300 hover:scale-105 flex flex-col",
                  sub.popular 
                    ? "bg-gradient-to-br from-violet-800/30 to-purple-800/30 border-2 border-violet-500/50" 
                    : "bg-white/5 border border-white/10 hover:border-white/30"
                )}>
                  {sub.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-white text-xs font-medium whitespace-nowrap">
                      {language === 'fr' ? 'Populaire' : 'Popular'}
                    </div>
                  )}
                  
                  {/* Icon & Name */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("p-2 rounded-lg bg-gradient-to-br", sub.gradient)}>
                      <sub.icon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{sub.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-white">{sub.price}€</span>
                    {!sub.isFree && <span className="text-white/50 text-sm">/mois</span>}
                  </div>

                  {/* Messages */}
                  <div className="mb-3 px-2 py-1 bg-white/5 rounded-lg text-center">
                    <span className="text-white font-medium">{sub.messages}</span>
                    <span className="text-white/60 text-sm"> messages</span>
                  </div>

                  {/* Cost per message */}
                  {!sub.isFree && (
                    <p className="text-xs text-emerald-400 mb-3 text-center">
                      {sub.pricePerMsg.toFixed(2)}€/message
                    </p>
                  )}

                  {/* Features */}
                  <ul className="space-y-1.5 mb-4 flex-1">
                    {sub.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-white/70 text-xs">
                        <Check className="h-3 w-3 text-green-400 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  {!sub.isFree && (
                    <Button 
                      onClick={() => handlePurchase('subscription', sub, user, credits)} 
                      disabled={purchasing === sub.id}
                      size="sm"
                      className={cn("w-full bg-gradient-to-r hover:opacity-90 transition-opacity", sub.gradient)}
                    >
                      {purchasing === sub.id 
                        ? (language === 'fr' ? 'En cours...' : 'Processing...') 
                        : (language === 'fr' ? 'Souscrire' : 'Subscribe')}
                    </Button>
                  )}
                  {sub.isFree && (
                    <div className="text-center text-white/40 text-xs py-2">
                      {language === 'fr' ? 'Plan actuel' : 'Current plan'}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-white/40 text-xs mt-4">
              {language === 'fr' 
                ? '💡 Vous pouvez recharger votre abonnement à tout moment, même avant la fin du mois' 
                : '💡 You can reload your subscription anytime, even before month end'}
            </p>
          </div>

          {/* Credit Packs */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              {language === 'fr' ? 'Recharges de crédits' : 'Credit packs'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {creditPacks.map((pack) => (
                <div key={pack.id} className={cn(
                  "relative rounded-2xl p-6 transition-all duration-300 hover:scale-105",
                  pack.popular 
                    ? "bg-gradient-to-br from-violet-800/20 to-blue-800/20 border-2 border-violet-700/50" 
                    : "bg-white/5 border border-white/10 hover:border-white/30"
                )}>
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-800 to-blue-800 rounded-full text-white text-xs font-medium">
                      {language === 'fr' ? 'Meilleur rapport' : 'Best value'}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white mb-1">{pack.messages}</p>
                    <p className="text-white/60 mb-1">messages</p>
                    <p className="text-xs text-violet-300 mb-4">({pack.credits} crédits)</p>
                    <p className="text-3xl font-bold text-white mb-2">{pack.price}€</p>
                    <p className="text-xs text-emerald-400 mb-4">{pack.pricePerMsg.toFixed(2)}€/message</p>
                    <Button 
                      onClick={() => handlePurchase('pack', pack, user, credits)} 
                      disabled={purchasing === pack.id} 
                      className={cn(
                        "w-full", 
                        pack.popular 
                          ? "bg-gradient-to-r from-violet-800 to-blue-800 hover:from-violet-900 hover:to-blue-900" 
                          : "bg-white/10 hover:bg-white/20 text-white"
                      )}
                    >
                      {purchasing === pack.id 
                        ? (language === 'fr' ? 'Achat...' : 'Buying...') 
                        : (language === 'fr' ? 'Acheter' : 'Buy')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-white/40 text-sm">
            <p>{language === 'fr' ? 'Paiement sécurisé • Annulation à tout moment • Support 24/7' : 'Secure payment • Cancel anytime • 24/7 support'}</p>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}