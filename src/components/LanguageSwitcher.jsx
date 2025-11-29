import React from 'react';
import { useLanguage } from './LanguageContext';
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({ className }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("flex items-center gap-0.5 p-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10", className)}>
      <button
        onClick={() => setLanguage('fr')}
        className={cn(
          "w-6 h-4 rounded-sm overflow-hidden transition-all duration-300",
          language === 'fr' 
            ? "ring-1 ring-white/40 scale-105" 
            : "opacity-40 hover:opacity-70 grayscale hover:grayscale-0"
        )}
        title="Français"
      >
        <svg viewBox="0 0 640 480" className="w-full h-full">
          <path fill="#fff" d="M0 0h640v480H0z"/>
          <path fill="#002654" d="M0 0h213.3v480H0z"/>
          <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
        </svg>
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "w-6 h-4 rounded-sm overflow-hidden transition-all duration-300",
          language === 'en' 
            ? "ring-1 ring-white/40 scale-105" 
            : "opacity-40 hover:opacity-70 grayscale hover:grayscale-0"
        )}
        title="English"
      >
        <svg viewBox="0 0 640 480" className="w-full h-full">
          <path fill="#012169" d="M0 0h640v480H0z"/>
          <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
          <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
          <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
          <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
        </svg>
      </button>
    </div>
  );
}