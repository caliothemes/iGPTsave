import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Cookie, Shield } from 'lucide-react';
import { useLanguage } from './LanguageContext';

// EU/EEA country codes
const GDPR_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 
  // EEA
  'IS', 'LI', 'NO',
  // UK
  'GB'
];

export default function GDPRBanner() {
  const { language } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if already accepted
    if (localStorage.getItem('gdpr_accepted')) {
      return;
    }

    // Try to detect country from timezone/locale
    const detectGDPRCountry = () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const locale = navigator.language || navigator.userLanguage;
        
        // Check timezone for European cities
        const europeanTimezones = ['Europe/', 'Atlantic/Reykjavik', 'Atlantic/Canary', 'Atlantic/Madeira', 'Atlantic/Azores'];
        const isEuropeanTimezone = europeanTimezones.some(tz => timezone.startsWith(tz));
        
        // Check locale for EU countries
        const countryCode = locale.split('-')[1]?.toUpperCase();
        const isGDPRLocale = countryCode && GDPR_COUNTRIES.includes(countryCode);
        
        return isEuropeanTimezone || isGDPRLocale;
      } catch {
        // Default to showing for safety
        return true;
      }
    };

    if (detectGDPRCountry()) {
      // Small delay for animation effect
      setTimeout(() => setShow(true), 500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('gdpr_accepted', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 p-3 bg-violet-500/20 rounded-xl">
            <Cookie className="h-6 w-6 text-violet-400" />
          </div>
          
          {/* Text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-emerald-400" />
              <h3 className="text-white font-semibold text-sm">
                {language === 'fr' ? 'Protection de vos données' : 'Your data protection'}
              </h3>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              {language === 'fr' 
                ? "Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic. En continuant à utiliser ce site, vous acceptez notre politique de confidentialité."
                : "We use cookies to enhance your experience and analyze traffic. By continuing to use this site, you accept our privacy policy."
              }
            </p>
          </div>
          
          {/* Button */}
          <Button
            onClick={handleAccept}
            className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-6"
          >
            {language === 'fr' ? 'Accepter' : 'Accept'}
          </Button>
        </div>
      </div>
    </div>
  );
}