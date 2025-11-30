import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { cn } from "@/lib/utils";

const FlagFR = () => (
  <svg viewBox="0 0 640 480" className="w-full h-full scale-150">
    <path fill="#fff" d="M0 0h640v480H0z"/>
    <path fill="#002654" d="M0 0h213.3v480H0z"/>
    <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
  </svg>
);

const FlagEN = () => (
  <svg viewBox="0 0 640 480" className="w-full h-full scale-150">
    <path fill="#012169" d="M0 0h640v480H0z"/>
    <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
    <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
    <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
    <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
  </svg>
);

export default function LanguageSwitcher({ className }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-1.5 hover:bg-white/10 transition-colors"
        title={language === 'fr' ? 'Français' : 'English'}
      >
        {language === 'fr' ? <FlagFR /> : <FlagEN />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleSelect('fr')}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors",
              language === 'fr' ? "bg-violet-500/20 text-violet-300" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <span className="w-5 h-5 rounded-full overflow-hidden"><FlagFR /></span>
            Français
          </button>
          <button
            onClick={() => handleSelect('en')}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors",
              language === 'en' ? "bg-violet-500/20 text-violet-300" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <span className="w-5 h-5 rounded-full overflow-hidden"><FlagEN /></span>
            English
          </button>
        </div>
      )}
    </div>
  );
}