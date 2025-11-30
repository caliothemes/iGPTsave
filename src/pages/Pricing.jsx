import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown, CreditCard, MessageSquare, Rocket, Star, Gem, Loader2 } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";

const ICONS = {
  Sparkles, Zap, Crown, CreditCard, MessageSquare, Rocket, Star, Gem
};

export default function Pricing() {
  const { language } = useLanguage();
  const [purchasing, setPurchasing] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or yearly
  const [subscriptions, setSubscriptions] = useState([]);
  const [creditPacks, setCreditPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const [plans, packs] = await Promise.all([
          base44.entities.SubscriptionPlan.filter({ is_active: true }),
          base44.entities.CreditPack.filter({ is_active: true })
        ]);
        setSubscriptions(plans.sort((a, b) => (a.order || 0) - (b.order || 0)));
        setCreditPacks(packs.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    loadPricing();
  }, []);

  const handlePurchase = async (type, item, user, userCredits, isYearly = false) => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl('Pricing'));
      return;
    }

    setPurchasing(item.id || item.plan_id || item.pack_id);

    const price = type === 'pack' ? item.price : (isYearly ? item.price_yearly : item.price_monthly);
    const messages = type === 'pack' 
      ? (item.credits + (item.bonus_credits || 0)) 
      : (item.messages_per_month === -1 ? 999999 : item.messages_per_month);

    await base44.entities.Transaction.create({
      user_email: user.email,
      type: type === 'pack' ? 'credit_pack' : `subscription_${item.plan_id}`,
      amount: price,
      credits_added: messages,
      status: 'completed'
    });

    if (type === 'pack') {
      await base44.entities.UserCredits.update(userCredits.id, { 
        paid_credits: (userCredits.paid_credits || 0) + messages 
      });
    } else {
      const endDate = new Date();
      if (isYearly) {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      const subType = item.messages_per_month === -1 ? 'unlimited' : 'limited';
      await base44.entities.UserCredits.update(userCredits.id, {
        subscription_type: subType,
        subscription_end_date: endDate.toISOString().split('T')[0],
        paid_credits: (userCredits.paid_credits || 0) + messages
      });
    }

    window.location.href = createPageUrl('Home');
  };

  const getPrice = (plan) => {
    return billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
  };

  const getSavings = (plan) => {
    if (!plan.price_yearly || !plan.price_monthly) return 0;
    const yearlyEquivalent = plan.price_monthly * 12;
    return Math.round(((yearlyEquivalent - plan.price_yearly) / yearlyEquivalent) * 100);
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

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Billing Toggle */}
              {subscriptions.some(s => s.price_yearly > 0) && (
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
              )}

              {/* Subscriptions */}
              {subscriptions.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-400" />
                    {language === 'fr' ? 'Abonnements' : 'Subscriptions'}
                  </h2>
                  <div className={cn(
                    "grid gap-4",
                    subscriptions.length <= 3 ? "grid-cols-1 md:grid-cols-3" : 
                    subscriptions.length <= 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" :
                    "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                  )}>
                    {subscriptions.map((sub) => {
                      const IconComp = ICONS[sub.icon] || MessageSquare;
                      const price = getPrice(sub);
                      const savings = getSavings(sub);
                      const features = language === 'fr' ? sub.features_fr : (sub.features_en || sub.features_fr);
                      const isFree = sub.price_monthly === 0;
                      
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
                            <div className={cn("p-2 rounded-lg bg-gradient-to-br", sub.gradient || "from-violet-600 to-blue-600")}>
                              <IconComp className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white">
                              {language === 'fr' ? sub.name_fr : (sub.name_en || sub.name_fr)}
                            </h3>
                          </div>

                          {/* Price */}
                          <div className="mb-2">
                            <span className="text-2xl font-bold text-white">{price}€</span>
                            {!isFree && (
                              <span className="text-white/50 text-sm">
                                /{billingCycle === 'yearly' ? (language === 'fr' ? 'an' : 'year') : (language === 'fr' ? 'mois' : 'month')}
                              </span>
                            )}
                          </div>

                          {/* Savings badge */}
                          {billingCycle === 'yearly' && savings > 0 && (
                            <div className="mb-2 px-2 py-1 bg-emerald-500/20 rounded-lg text-center">
                              <span className="text-emerald-400 text-xs font-medium">
                                {language === 'fr' ? `Économisez ${savings}%` : `Save ${savings}%`}
                              </span>
                            </div>
                          )}

                          {/* Messages */}
                          <div className="mb-3 px-2 py-1 bg-white/5 rounded-lg text-center">
                            <span className="text-white font-medium">
                              {sub.messages_per_month === -1 ? '∞' : sub.messages_per_month}
                            </span>
                            <span className="text-white/60 text-sm"> messages/{language === 'fr' ? 'mois' : 'mo'}</span>
                          </div>

                          {/* Cost per message */}
                          {!isFree && sub.messages_per_month > 0 && (
                            <p className="text-xs text-emerald-400 mb-3 text-center">
                              {(price / sub.messages_per_month).toFixed(2)}€/message
                            </p>
                          )}

                          {/* Features */}
                          {features && features.length > 0 && (
                            <ul className="space-y-1.5 mb-4 flex-1">
                              {features.slice(0, 4).map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-white/70 text-xs">
                                  <Check className="h-3 w-3 text-green-400 flex-shrink-0 mt-0.5" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Button */}
                          {!isFree ? (
                            <Button 
                              onClick={() => handlePurchase('subscription', sub, user, credits, billingCycle === 'yearly')} 
                              disabled={purchasing === (sub.id || sub.plan_id)}
                              size="sm"
                              className={cn("w-full bg-gradient-to-r hover:opacity-90 transition-opacity", sub.gradient || "from-violet-600 to-blue-600")}
                            >
                              {purchasing === (sub.id || sub.plan_id)
                                ? (language === 'fr' ? 'En cours...' : 'Processing...') 
                                : (language === 'fr' ? 'Souscrire' : 'Subscribe')}
                            </Button>
                          ) : (
                            <div className="text-center text-white/40 text-xs py-2">
                              {language === 'fr' ? 'Plan actuel' : 'Current plan'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-center text-white/40 text-xs mt-4">
                    {language === 'fr' 
                      ? '💡 Vous pouvez recharger votre abonnement à tout moment, même avant la fin du mois' 
                      : '💡 You can reload your subscription anytime, even before month end'}
                  </p>
                </div>
              )}

              {/* Credit Packs */}
              {creditPacks.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-400" />
                    {language === 'fr' ? 'Recharges de crédits' : 'Credit packs'}
                  </h2>
                  <div className={cn(
                    "grid gap-6",
                    creditPacks.length <= 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                  )}>
                    {creditPacks.map((pack) => (
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
                          <p className="text-white/60 mb-1">messages</p>
                          {pack.bonus_credits > 0 && (
                            <p className="text-xs text-emerald-400 mb-2">+{pack.bonus_credits} {language === 'fr' ? 'offerts' : 'free'}</p>
                          )}
                          <p className="text-3xl font-bold text-white mb-2">{pack.price}€</p>
                          <p className="text-xs text-emerald-400 mb-4">
                                                            {(pack.price / (pack.credits + (pack.bonus_credits || 0))).toFixed(2)}€/message
                                                          </p>
                          <Button 
                            onClick={() => handlePurchase('pack', pack, user, credits)} 
                            disabled={purchasing === (pack.id || pack.pack_id)} 
                            className={cn(
                              "w-full", 
                              pack.is_popular 
                                ? "bg-gradient-to-r from-violet-800 to-blue-800 hover:from-violet-900 hover:to-blue-900" 
                                : "bg-white/10 hover:bg-white/20 text-white"
                            )}
                          >
                            {purchasing === (pack.id || pack.pack_id)
                              ? (language === 'fr' ? 'Achat...' : 'Buying...') 
                              : (language === 'fr' ? 'Acheter' : 'Buy')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {subscriptions.length === 0 && creditPacks.length === 0 && (
                <div className="text-center text-white/60 py-10">
                  {language === 'fr' ? 'Aucune offre disponible pour le moment.' : 'No offers available at the moment.'}
                </div>
              )}
            </>
          )}

          <div className="text-center text-white/40 text-sm">
            <p>{language === 'fr' ? 'Paiement sécurisé • Annulation à tout moment • Support 24/7' : 'Secure payment • Cancel anytime • 24/7 support'}</p>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}