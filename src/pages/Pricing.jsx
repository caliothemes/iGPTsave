import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown, CreditCard, MessageSquare, Rocket, Star, Gem, Loader2, Lock } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";

// Produits Stripe - IDs réels
const STRIPE_PRODUCTS = {
  subscriptions: {
    monthly: [
      { 
        id: 'starter_monthly',
        priceId: 'price_1SZIx2HfyAhC7kY5qlFmFIP8', // prod_TWLeCLUbXfQ4KF
        name: { fr: 'STARTER', en: 'STARTER' },
        price: 8.90,
        credits: 100,
        icon: 'Zap',
        gradient: 'from-blue-600 to-cyan-600',
        features: { 
          fr: ['100 messages/mois', 'Visuels HD', 'Support email'],
          en: ['100 messages/month', 'HD visuals', 'Email support']
        }
      },
      { 
        id: 'pro_monthly',
        priceId: 'price_1SZIzfHfyAhC7kY506OILTq9', // prod_TWLhV1pSXRSz3Q
        name: { fr: 'PRO', en: 'PRO' },
        price: 14.90,
        credits: 250,
        icon: 'Rocket',
        gradient: 'from-violet-600 to-purple-600',
        is_popular: true,
        features: { 
          fr: ['250 messages/mois', 'Visuels HD', 'Support prioritaire'],
          en: ['250 messages/month', 'HD visuals', 'Priority support']
        }
      },
      { 
        id: 'elite_monthly',
        priceId: 'price_1SZJ2HHfyAhC7kY5I0sUBlJq', // prod_TWLjEEHP8GyXTV
        name: { fr: 'ELITE', en: 'ELITE' },
        price: 24.90,
        credits: 500,
        icon: 'Crown',
        gradient: 'from-amber-600 to-orange-600',
        features: { 
          fr: ['500 messages/mois', 'Visuels HD & Print', 'Support VIP'],
          en: ['500 messages/month', 'HD & Print visuals', 'VIP support']
        }
      },
      { 
        id: 'elite_plus_monthly',
        priceId: 'price_1SZJ3tHfyAhC7kY520ohEG7x', // prod_TWLlhvQGwnrOHX
        name: { fr: 'ELITE PLUS', en: 'ELITE PLUS' },
        price: 39.90,
        credits: 1000,
        icon: 'Gem',
        gradient: 'from-rose-600 to-pink-600',
        features: { 
          fr: ['1000 messages/mois', 'Visuels HD & Print', 'Support VIP 24/7'],
          en: ['1000 messages/month', 'HD & Print visuals', 'VIP support 24/7']
        }
      }
    ],
    yearly: [
      { 
        id: 'starter_yearly',
        priceId: 'price_1SZIyTHfyAhC7kY5BAIvAIyy', // prod_TWLfJW2UaDTeo5
        name: { fr: 'STARTER', en: 'STARTER' },
        price: 89,
        priceMonthly: 8.90,
        credits: 1200,
        creditsPerMonth: 100,
        icon: 'Zap',
        gradient: 'from-blue-600 to-cyan-600',
        features: { 
          fr: ['100 messages/mois', '1200/an', 'Visuels HD'],
          en: ['100 messages/month', '1200/year', 'HD visuals']
        }
      },
      { 
        id: 'pro_yearly',
        priceId: 'price_1SZJ1IHfyAhC7kY5pcJVZdxv', // prod_TWLirA98VTt6kD
        name: { fr: 'PRO', en: 'PRO' },
        price: 149,
        priceMonthly: 14.90,
        credits: 3000,
        creditsPerMonth: 250,
        icon: 'Rocket',
        gradient: 'from-violet-600 to-purple-600',
        is_popular: true,
        features: { 
          fr: ['250 messages/mois', '3000/an', 'Support prioritaire'],
          en: ['250 messages/month', '3000/year', 'Priority support']
        }
      },
      { 
        id: 'elite_yearly',
        priceId: 'price_1SZJ33HfyAhC7kY5fdZqeGdC', // prod_TWLkczcFEQ2ebe
        name: { fr: 'ELITE', en: 'ELITE' },
        price: 249,
        priceMonthly: 24.90,
        credits: 6000,
        creditsPerMonth: 500,
        icon: 'Crown',
        gradient: 'from-amber-600 to-orange-600',
        features: { 
          fr: ['500 messages/mois', '6000/an', 'Support VIP'],
          en: ['500 messages/month', '6000/year', 'VIP support']
        }
      },
      { 
        id: 'elite_plus_yearly',
        priceId: 'price_1SZJ4hHfyAhC7kY54We57RJk', // prod_TWLm7SIvUgDBGh
        name: { fr: 'ELITE PLUS', en: 'ELITE PLUS' },
        price: 399,
        priceMonthly: 39.90,
        credits: 12000,
        creditsPerMonth: 1000,
        icon: 'Gem',
        gradient: 'from-rose-600 to-pink-600',
        features: { 
          fr: ['1000 messages/mois', '12000/an', 'Support VIP 24/7'],
          en: ['1000 messages/month', '12000/year', 'VIP support 24/7']
        }
      }
    ]
  },
  packs: [
    { 
      id: 'pack_250',
      priceId: 'price_1SZIvEHfyAhC7kY5PJgk7nME', // prod_TWLcf4UtzqMQe4
      credits: 250,
      price: 19.90
    },
    { 
      id: 'pack_500',
      priceId: 'price_1SZIvjHfyAhC7kY5irsRoqBB', // prod_TWLc6dyHxZtKJS
      credits: 500,
      price: 29.90,
      is_popular: true
    }
  ]
};

const ICONS = {
  Sparkles, Zap, Crown, CreditCard, MessageSquare, Rocket, Star, Gem
};

export default function Pricing() {
  const { language } = useLanguage();
  const [purchasing, setPurchasing] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handlePurchase = async (priceId, user) => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl('Pricing'));
      return;
    }

    setPurchasing(priceId);

    try {
      const response = await base44.functions.invoke('stripeCheckout', {
        priceId,
        successUrl: window.location.origin + createPageUrl('PaymentSuccess') + '?session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: window.location.origin + createPageUrl('Pricing')
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setPurchasing(null);
    }
  };

  const subscriptions = billingCycle === 'yearly' 
    ? STRIPE_PRODUCTS.subscriptions.yearly 
    : STRIPE_PRODUCTS.subscriptions.monthly;

  const getSavings = (plan) => {
    if (billingCycle !== 'yearly' || !plan.priceMonthly) return 0;
    const yearlyEquivalent = plan.priceMonthly * 12;
    return Math.round(((yearlyEquivalent - plan.price) / yearlyEquivalent) * 100);
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
                  {language === 'fr' ? 'Messages restants' : 'Messages left'}: {credits.subscription_type === 'unlimited' ? '∞' : (credits.free_downloads || 0) + (credits.paid_credits || 0)}
                </span>
              </div>
            )}
            <div className="mt-4 px-4 py-3 bg-violet-500/10 border border-violet-500/20 rounded-xl max-w-xl mx-auto">
              <p className="text-violet-300 text-sm flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                {language === 'fr' 
                  ? 'Paiement 100% sécurisé par Stripe' 
                  : '100% secure payment by Stripe'}
              </p>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors",
                billingCycle === 'monthly' 
                  ? "bg-violet-600 text-white" 
                  : "bg-white/10 text-white/60 hover:text-white"
              )}
            >
              {language === 'fr' ? 'Mensuel' : 'Monthly'}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                billingCycle === 'yearly' 
                  ? "bg-violet-600 text-white" 
                  : "bg-white/10 text-white/60 hover:text-white"
              )}
            >
              {language === 'fr' ? 'Annuel' : 'Yearly'}
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                {language === 'fr' ? '2 mois gratuits' : '2 months free'}
              </span>
            </button>
          </div>

          {/* Subscriptions */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              {language === 'fr' ? 'Abonnements' : 'Subscriptions'}
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {subscriptions.map((sub) => {
                const IconComp = ICONS[sub.icon] || MessageSquare;
                const savings = getSavings(sub);
                const features = language === 'fr' ? sub.features.fr : sub.features.en;
                
                return (
                  <div key={sub.id} className={cn(
                    "relative rounded-2xl p-5 transition-all duration-300 hover:scale-105 flex flex-col",
                    sub.is_popular 
                      ? "bg-gradient-to-br from-violet-800/30 to-purple-800/30 border-2 border-violet-500/50" 
                      : "bg-white/5 border border-white/10 hover:border-white/30"
                  )}>
                    {sub.is_popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-white text-xs font-medium whitespace-nowrap">
                        {language === 'fr' ? 'Populaire' : 'Popular'}
                      </div>
                    )}
                    
                    {/* Icon & Name */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn("p-2 rounded-lg bg-gradient-to-br", sub.gradient)}>
                        <IconComp className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {sub.name[language]}
                      </h3>
                    </div>

                    {/* Price */}
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-white">{sub.price}€</span>
                      <span className="text-white/50 text-sm">
                        /{billingCycle === 'yearly' ? (language === 'fr' ? 'an' : 'year') : (language === 'fr' ? 'mois' : 'month')}
                      </span>
                    </div>

                    {/* Savings badge */}
                    {savings > 0 && (
                      <div className="mb-2 px-2 py-1 bg-emerald-500/20 rounded-lg text-center">
                        <span className="text-emerald-400 text-xs font-medium">
                          {language === 'fr' ? `Économisez ${savings}%` : `Save ${savings}%`}
                        </span>
                      </div>
                    )}

                    {/* Messages */}
                    <div className="mb-3 px-2 py-1 bg-white/5 rounded-lg text-center">
                      <span className="text-white font-medium">
                        {billingCycle === 'yearly' ? sub.creditsPerMonth : sub.credits}
                      </span>
                      <span className="text-white/60 text-sm"> messages/{language === 'fr' ? 'mois' : 'mo'}</span>
                    </div>

                    {/* Cost per message */}
                    <p className="text-xs text-emerald-400 mb-3 text-center">
                      {(sub.price / (billingCycle === 'yearly' ? sub.credits : sub.credits)).toFixed(2)}€/message
                    </p>

                    {/* Features */}
                    <ul className="space-y-1.5 mb-4 flex-1">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-white/70 text-xs">
                          <Check className="h-3 w-3 text-green-400 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Button */}
                    <Button 
                      onClick={() => handlePurchase(sub.priceId, user)} 
                      disabled={purchasing === sub.priceId}
                      size="sm"
                      className={cn("w-full bg-gradient-to-r hover:opacity-90 transition-opacity", sub.gradient)}
                    >
                      {purchasing === sub.priceId
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : (language === 'fr' ? 'Souscrire' : 'Subscribe')}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Credit Packs */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              {language === 'fr' ? 'Recharges de crédits' : 'Credit packs'}
            </h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto">
              {STRIPE_PRODUCTS.packs.map((pack) => (
                <div key={pack.id} className={cn(
                  "relative rounded-2xl p-6 transition-all duration-300 hover:scale-105",
                  pack.is_popular 
                    ? "bg-gradient-to-br from-violet-800/20 to-blue-800/20 border-2 border-violet-700/50" 
                    : "bg-white/5 border border-white/10 hover:border-white/30"
                )}>
                  {pack.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-800 to-blue-800 rounded-full text-white text-xs font-medium">
                      {language === 'fr' ? 'Meilleur rapport' : 'Best value'}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white mb-1">{pack.credits}</p>
                    <p className="text-white/60 mb-2">messages</p>
                    <p className="text-3xl font-bold text-white mb-2">{pack.price}€</p>
                    <p className="text-xs text-emerald-400 mb-4">
                      {(pack.price / pack.credits).toFixed(2)}€/message
                    </p>
                    <Button 
                      onClick={() => handlePurchase(pack.priceId, user)} 
                      disabled={purchasing === pack.priceId} 
                      className={cn(
                        "w-full", 
                        pack.is_popular 
                          ? "bg-gradient-to-r from-violet-800 to-blue-800 hover:from-violet-900 hover:to-blue-900" 
                          : "bg-white/10 hover:bg-white/20 text-white"
                      )}
                    >
                      {purchasing === pack.priceId
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : (language === 'fr' ? 'Acheter' : 'Buy')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-white/40 text-sm">
            <p>{language === 'fr' ? 'Paiement sécurisé par Stripe • Annulation à tout moment • Support 24/7' : 'Secure payment by Stripe • Cancel anytime • 24/7 support'}</p>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}