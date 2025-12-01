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
        id: 'free',
        priceId: null, // Gratuit, pas de paiement
        name: { fr: 'GRATUIT', en: 'FREE' },
        price: 0,
        credits: 25,
        icon: 'MessageSquare',
        gradient: 'from-slate-600 to-gray-600',
        isFree: true,
        features: { 
          fr: ['25 messages à l\'inscription', 'Visuels avec filigrane', 'Support communauté'],
          en: ['25 messages on signup', 'Visuals with watermark', 'Community support']
        }
      },
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
        id: 'free',
        priceId: null,
        name: { fr: 'GRATUIT', en: 'FREE' },
        price: 0,
        credits: 25,
        creditsPerMonth: 0,
        icon: 'MessageSquare',
        gradient: 'from-slate-600 to-gray-600',
        isFree: true,
        features: { 
          fr: ['25 messages à l\'inscription', 'Visuels avec filigrane', 'Support communauté'],
          en: ['25 messages on signup', 'Visuals with watermark', 'Community support']
        }
      },
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
      id: 'pack_50',
      priceId: 'price_pack_50', // À configurer
      credits: 50,
      price: 5.90
    },
    { 
      id: 'pack_100',
      priceId: 'price_pack_100', // À configurer
      credits: 100,
      price: 9.90
    },
    { 
      id: 'pack_250',
      priceId: 'price_1SZIvEHfyAhC7kY5PJgk7nME', // prod_TWLcf4UtzqMQe4
      credits: 250,
      price: 19.90,
      is_popular: true
    },
    { 
      id: 'pack_500',
      priceId: 'price_1SZIvjHfyAhC7kY5irsRoqBB', // prod_TWLc6dyHxZtKJS
      credits: 500,
      price: 29.90
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
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
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
                      {sub.isFree ? (
                        <>
                          <span className="text-white font-medium">{sub.credits}</span>
                          <span className="text-white/60 text-sm"> {language === 'fr' ? 'messages offerts' : 'free messages'}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-white font-medium">
                            {billingCycle === 'yearly' ? sub.creditsPerMonth : sub.credits}
                          </span>
                          <span className="text-white/60 text-sm"> messages/{language === 'fr' ? 'mois' : 'mo'}</span>
                        </>
                      )}
                    </div>

                    {/* Cost per message */}
                    {!sub.isFree && (
                      <p className="text-xs text-emerald-400 mb-3 text-center">
                        {(sub.price / (billingCycle === 'yearly' ? sub.credits : sub.credits)).toFixed(2)}€/message
                      </p>
                    )}
                    {sub.isFree && (
                      <p className="text-xs text-white/40 mb-3 text-center">
                        {language === 'fr' ? 'Aucun paiement requis' : 'No payment required'}
                      </p>
                    )}

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
                    {sub.isFree ? (
                      <Button 
                        onClick={() => !user && base44.auth.redirectToLogin(createPageUrl('Pricing'))}
                        size="sm"
                        className={cn("w-full bg-gradient-to-r hover:opacity-90 transition-opacity", sub.gradient)}
                        disabled={!!user}
                      >
                        {user 
                          ? (language === 'fr' ? 'Actuel' : 'Current')
                          : (language === 'fr' ? 'S\'inscrire' : 'Sign up')}
                      </Button>
                    ) : (
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
                    )}
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
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto">
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

          {/* Trust Badge Stripe */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Stripe Badge */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#635BFF]/20 rounded-lg">
                  <svg className="h-8 w-8" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M59.64 12.8c0-4.24-2.06-7.59-5.98-7.59-3.94 0-6.32 3.35-6.32 7.55 0 4.98 2.81 7.49 6.85 7.49 1.97 0 3.46-.45 4.58-1.07v-3.32c-1.12.56-2.4.91-4.03.91-1.6 0-3.01-.56-3.19-2.5h8.05c0-.21.04-1.07.04-1.47zm-8.13-1.58c0-1.86 1.14-2.64 2.17-2.64 1.01 0 2.08.78 2.08 2.64h-4.25zM40.95 5.21c-1.61 0-2.65.76-3.23 1.28l-.21-1.02h-3.58v19.24l4.07-.87.01-4.67c.59.43 1.47 1.04 2.91 1.04 2.94 0 5.62-2.37 5.62-7.58-.01-4.77-2.73-7.42-5.59-7.42zm-.98 11.42c-.97 0-1.54-.35-1.94-.78l-.02-6.12c.43-.48 1.02-.82 1.96-.82 1.5 0 2.53 1.68 2.53 3.85 0 2.21-1.01 3.87-2.53 3.87zM28.24 4.06l4.08-.88V0l-4.08.87v3.19zM28.24 5.47h4.08v14.3h-4.08V5.47zM23.6 6.67l-.26-1.2h-3.5v14.3h4.07V10.2c.96-1.26 2.59-1.02 3.1-.85V5.47c-.53-.2-2.46-.56-3.41 1.2zM15.73 1.82l-3.98.85-.01 13.1c0 2.42 1.82 4.2 4.24 4.2 1.34 0 2.32-.25 2.86-.54v-3.3c-.52.21-3.1.96-3.1-1.45V8.82h3.1V5.47h-3.1l-.01-3.65zM4.32 9.68c0-.64.53-.89 1.41-.89 1.26 0 2.85.38 4.11 1.07V6.23c-1.38-.55-2.74-.76-4.11-.76C2.27 5.47 0 7.27 0 10.13c0 4.42 6.08 3.72 6.08 5.62 0 .76-.66 1.01-1.58 1.01-1.37 0-3.12-.56-4.5-1.32v3.69c1.53.66 3.08.95 4.5.95 3.54 0 5.98-1.75 5.98-4.65-.01-4.77-6.16-3.93-6.16-5.75z" fill="#635BFF"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {language === 'fr' ? 'Paiement 100% sécurisé' : '100% Secure Payment'}
                  </p>
                  <p className="text-white/50 text-xs">
                    {language === 'fr' ? 'Propulsé par Stripe' : 'Powered by Stripe'}
                  </p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center gap-3">
                {/* Visa */}
                <div className="bg-white rounded-md px-2 py-1">
                  <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
                    <rect width="48" height="32" rx="4" fill="white"/>
                    <path d="M19.5 21.5H16.8L18.6 10.5H21.3L19.5 21.5Z" fill="#00579F"/>
                    <path d="M28.2 10.7C27.6 10.5 26.7 10.2 25.6 10.2C22.9 10.2 21 11.6 21 13.5C21 14.9 22.3 15.7 23.3 16.2C24.3 16.7 24.7 17 24.7 17.5C24.7 18.2 23.8 18.5 23 18.5C21.9 18.5 21.3 18.3 20.4 17.9L20 17.7L19.6 20.3C20.3 20.6 21.5 20.9 22.8 20.9C25.7 20.9 27.5 19.5 27.5 17.5C27.5 16.4 26.8 15.5 25.3 14.8C24.4 14.3 23.8 14 23.8 13.5C23.8 13 24.4 12.5 25.5 12.5C26.4 12.5 27.1 12.7 27.6 12.9L27.9 13L28.2 10.7Z" fill="#00579F"/>
                    <path d="M32.5 10.5H30.4C29.7 10.5 29.2 10.7 28.9 11.4L24.8 21.5H27.7L28.3 19.8H31.8L32.2 21.5H34.8L32.5 10.5ZM29.1 17.6C29.3 17 30.2 14.6 30.2 14.6C30.2 14.6 30.4 14 30.6 13.6L30.8 14.5C30.8 14.5 31.3 16.8 31.4 17.6H29.1Z" fill="#00579F"/>
                    <path d="M15.3 10.5L12.6 17.8L12.3 16.3C11.8 14.6 10.2 12.8 8.4 11.9L10.9 21.5H13.8L18.2 10.5H15.3Z" fill="#00579F"/>
                    <path d="M10.5 10.5H6.1L6 10.7C9.4 11.6 11.7 13.7 12.3 16.3L11.6 11.4C11.5 10.7 11 10.5 10.5 10.5Z" fill="#FAA61A"/>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="bg-white rounded-md px-2 py-1">
                  <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
                    <rect width="48" height="32" rx="4" fill="white"/>
                    <circle cx="19" cy="16" r="8" fill="#EB001B"/>
                    <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
                    <path d="M24 10.5C25.9 12 27 14.3 27 16.8C27 19.3 25.9 21.6 24 23.1C22.1 21.6 21 19.3 21 16.8C21 14.3 22.1 12 24 10.5Z" fill="#FF5F00"/>
                  </svg>
                </div>
                {/* Amex */}
                <div className="bg-[#006FCF] rounded-md px-2 py-1">
                  <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
                    <rect width="48" height="32" rx="4" fill="#006FCF"/>
                    <path d="M8 16L10 12H12.5L10.5 16L12.5 20H10L8 16Z" fill="white"/>
                    <path d="M13 12H16L17 14L18 12H21V20H18.5V15L17 18H16L14.5 15V20H13V12Z" fill="white"/>
                    <path d="M22 12H28V14H24.5V15H28V17H24.5V18H28V20H22V12Z" fill="white"/>
                    <path d="M29 12H32L33 14L34 12H37L34.5 16L37 20H34L33 18L32 20H29L31.5 16L29 12Z" fill="white"/>
                  </svg>
                </div>
                {/* Apple Pay */}
                <div className="bg-black rounded-md px-2 py-1">
                  <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
                    <rect width="48" height="32" rx="4" fill="black"/>
                    <path d="M16.5 10.5C16.1 11 15.5 11.4 14.8 11.3C14.7 10.6 15 9.9 15.4 9.4C15.9 8.9 16.5 8.5 17.1 8.5C17.2 9.2 16.9 10 16.5 10.5ZM17.1 11.5C16.2 11.4 15.4 12 14.9 12C14.4 12 13.7 11.5 13 11.5C12 11.5 11 12.1 10.5 13C9.4 15 10.2 17.8 11.3 19.4C11.8 20.2 12.4 21 13.2 21C13.9 21 14.2 20.5 15.1 20.5C16 20.5 16.2 21 17 21C17.8 21 18.3 20.2 18.8 19.4C19.4 18.5 19.6 17.7 19.6 17.6C19.6 17.6 18.2 17 18.2 15.4C18.2 14 19.3 13.3 19.4 13.2C18.7 12.1 17.7 11.5 17.1 11.5Z" fill="white"/>
                    <path d="M24 12H26.5C28.2 12 29.5 13.2 29.5 15C29.5 16.8 28.1 18 26.4 18H25.5V21H24V12ZM25.5 13.3V16.7H26.3C27.3 16.7 28 16 28 15C28 14 27.3 13.3 26.3 13.3H25.5Z" fill="white"/>
                    <path d="M33.5 21C32.2 21 31.2 20.2 31.2 19C31.2 17.9 32 17.3 33.5 17.2L35.2 17.1V16.7C35.2 15.9 34.7 15.5 33.9 15.5C33.2 15.5 32.7 15.9 32.6 16.4H31.2C31.3 15.2 32.4 14.3 34 14.3C35.6 14.3 36.7 15.2 36.7 16.6V21H35.3V20C35 20.6 34.3 21 33.5 21ZM33.9 19.9C34.7 19.9 35.3 19.4 35.3 18.5V18.1L33.9 18.2C33.1 18.2 32.7 18.5 32.7 19C32.7 19.5 33.2 19.9 33.9 19.9Z" fill="white"/>
                    <path d="M38 23.5V22.3C38.1 22.3 38.3 22.3 38.5 22.3C39.1 22.3 39.5 22 39.7 21.3L39.8 21L37.5 14.5H39.1L40.6 19.5L42.1 14.5H43.6L41.2 21.5C40.6 23.2 39.9 23.6 38.5 23.6C38.4 23.5 38.1 23.5 38 23.5Z" fill="white"/>
                  </svg>
                </div>
              </div>

              {/* Trust Points */}
              <div className="flex items-center gap-4 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{language === 'fr' ? 'SSL 256-bit' : 'SSL 256-bit'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>{language === 'fr' ? 'Données cryptées' : 'Encrypted data'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}