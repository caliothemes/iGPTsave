import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown, CreditCard } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";

const creditPacks = [
  { id: 'pack_10', credits: 10, price: 4.99, popular: false },
  { id: 'pack_30', credits: 30, price: 9.99, popular: true },
  { id: 'pack_100', credits: 100, price: 24.99, popular: false },
];

export default function Pricing() {
  const { t } = useLanguage();
  const [purchasing, setPurchasing] = useState(null);

  const subscriptions = [
    {
      id: 'limited',
      name: 'Pro',
      price: 14.99,
      period: t('perMonth'),
      credits: 50,
      features: [`50 ${t('downloadsMonth')}`, t('noWatermark'), t('hdFormats'), t('prioritySupport')],
      icon: Zap,
      gradient: 'from-blue-800 to-cyan-800'
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: 29.99,
      period: t('perMonth'),
      credits: Infinity,
      features: [t('unlimited'), t('noWatermark'), t('hdPrintFormats'), t('vipSupport'), t('apiAccess')],
      icon: Crown,
      gradient: 'from-violet-800 to-purple-800',
      popular: true
    }
  ];

  const handlePurchase = async (type, item, user, credits) => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl('Pricing'));
      return;
    }

    setPurchasing(item.id);

    await base44.entities.Transaction.create({
      user_email: user.email,
      type: type === 'pack' ? 'credit_pack' : `subscription_${item.id}`,
      amount: item.price,
      credits_added: item.credits === Infinity ? 0 : item.credits,
      status: 'completed'
    });

    if (type === 'pack') {
      await base44.entities.UserCredits.update(credits.id, { paid_credits: (credits.paid_credits || 0) + item.credits });
    } else {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      await base44.entities.UserCredits.update(credits.id, {
        subscription_type: item.id,
        subscription_end_date: endDate.toISOString().split('T')[0],
        paid_credits: item.id === 'limited' ? 50 : 0
      });
    }

    window.location.href = createPageUrl('Home');
  };

  return (
    <PageWrapper>
      {({ user, credits }) => (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">{t('chooseFormula')}</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">{t('unlockPotential')}</p>
            {credits && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80">
                <CreditCard className="h-4 w-4" />
                <span>{t('currentCredits')}: {credits.subscription_type === 'unlimited' ? '∞' : (credits.free_downloads || 0) + (credits.paid_credits || 0)}</span>
              </div>
            )}
          </div>

          {/* Credit Packs */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              {t('creditPacks')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {creditPacks.map((pack) => (
                <div key={pack.id} className={cn(
                  "relative rounded-2xl p-6 transition-all duration-300 hover:scale-105",
                  pack.popular ? "bg-gradient-to-br from-violet-800/20 to-blue-800/20 border-2 border-violet-700/50" : "bg-white/5 border border-white/10 hover:border-white/30"
                )}>
                  {pack.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-800 to-blue-800 rounded-full text-white text-xs font-medium">{t('popular')}</div>}
                  <div className="text-center">
                    <p className="text-5xl font-bold text-white mb-2">{pack.credits}</p>
                    <p className="text-white/60 mb-4">crédits</p>
                    <p className="text-3xl font-bold text-white mb-6">{pack.price}€</p>
                    <Button onClick={() => handlePurchase('pack', pack, user, credits)} disabled={purchasing === pack.id} className={cn("w-full", pack.popular ? "bg-gradient-to-r from-violet-800 to-blue-800 hover:from-violet-900 hover:to-blue-900" : "bg-white/10 hover:bg-white/20 text-white")}>
                      {purchasing === pack.id ? t('buying') : t('buy')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscriptions */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              {t('subscriptions')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {subscriptions.map((sub) => (
                <div key={sub.id} className={cn(
                  "relative rounded-2xl p-8 transition-all duration-300 hover:scale-105",
                  sub.popular ? "bg-gradient-to-br from-violet-800/20 to-purple-800/20 border-2 border-violet-700/50" : "bg-white/5 border border-white/10 hover:border-white/30"
                )}>
                  {sub.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-800 to-purple-800 rounded-full text-white text-xs font-medium">{t('recommended')}</div>}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn("p-3 rounded-xl bg-gradient-to-br", sub.gradient)}>
                      <sub.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{sub.name}</h3>
                      <p className="text-white/60 text-sm">{sub.credits === Infinity ? 'Illimité' : `${sub.credits} crédits/mois`}</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{sub.price}€</span>
                    <span className="text-white/60">{sub.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {sub.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-white/80">
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button onClick={() => handlePurchase('subscription', sub, user, credits)} disabled={purchasing === sub.id} className={cn("w-full bg-gradient-to-r hover:opacity-90 transition-opacity", sub.gradient)}>
                    {purchasing === sub.id ? t('subscribing') : t('subscribe')}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-white/40 text-sm">
            <p>{t('securePayment')}</p>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}