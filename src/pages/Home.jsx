import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Image, Palette, Printer, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        setIsAuthenticated(auth);
      } catch (e) {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleStart = () => {
    if (isAuthenticated) {
      window.location.href = createPageUrl('Create');
    } else {
      base44.auth.redirectToLogin(createPageUrl('Create'));
    }
  };

  const features = [
    { icon: Image, title: 'Logos', desc: 'Créez des logos uniques et professionnels' },
    { icon: Palette, title: 'Visuels', desc: 'Cartes de visite, flyers, affiches' },
    { icon: Printer, title: 'Print Ready', desc: 'Fichiers haute résolution pour impression' },
    { icon: Share2, title: 'Social Media', desc: 'Posts et stories optimisés' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <Logo size="small" />
          {!loading && (
            <Button
              variant="outline"
              onClick={() => isAuthenticated ? base44.auth.logout() : base44.auth.redirectToLogin()}
              className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              {isAuthenticated ? 'Déconnexion' : 'Connexion'}
            </Button>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8 animate-fade-in">
              <Logo size="large" />
            </div>

            {/* Tagline */}
            <h1 className="text-2xl md:text-4xl text-white/90 font-light leading-relaxed">
              Votre assistant IA pour créer des{' '}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent font-medium">
                visuels professionnels
              </span>
              <br />prêts à imprimer ou à partager
            </h1>

            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Logos, cartes de visite, flyers, posts pour réseaux sociaux... 
              Décrivez votre besoin et laissez l'IA créer pour vous.
            </p>

            {/* CTA Button */}
            <div className="pt-6">
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-2xl shadow-violet-500/25 transition-all duration-300 hover:scale-105 group"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Commencer à créer
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 max-w-3xl mx-auto">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-violet-500/50 transition-all duration-300 hover:bg-white/10"
                >
                  <feature.icon className="h-8 w-8 text-violet-400 mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                  <p className="text-white/50 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-white/40 text-sm">
            5 téléchargements gratuits • Sans engagement •{' '}
            <a href={createPageUrl('Legal')} className="hover:text-violet-400 transition-colors">
              Mentions légales
            </a>
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}