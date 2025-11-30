import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '@/utils';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useLanguage } from '@/components/LanguageContext';

export default function PaymentSuccess() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attendre quelques secondes pour que le webhook traite le paiement
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />
      
      <div className="relative z-10 text-center p-8 max-w-md">
        {loading ? (
          <div className="space-y-4">
            <Loader2 className="h-16 w-16 text-violet-400 animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-white">
              {language === 'fr' ? 'Traitement en cours...' : 'Processing...'}
            </h1>
            <p className="text-white/60">
              {language === 'fr' 
                ? 'Votre paiement est en cours de validation' 
                : 'Your payment is being validated'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-emerald-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white">
              {language === 'fr' ? 'Paiement réussi !' : 'Payment successful!'}
            </h1>
            
            <p className="text-white/60 text-lg">
              {language === 'fr' 
                ? 'Vos crédits ont été ajoutés à votre compte. Merci pour votre confiance !' 
                : 'Your credits have been added to your account. Thank you for your trust!'}
            </p>

            <Button
              onClick={() => window.location.href = createPageUrl('Home')}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-lg px-8 py-6"
            >
              {language === 'fr' ? 'Commencer à créer' : 'Start creating'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}