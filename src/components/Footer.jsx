import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { useLanguage } from './LanguageContext';
import { ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Footer() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: createPageUrl('Store'), label: 'iGPT Store', icon: true },
    { href: createPageUrl('Pricing'), label: language === 'fr' ? 'Tarifs' : 'Pricing' },
    { href: createPageUrl('Portfolio'), label: 'Portfolio' },
    { href: createPageUrl('Support'), label: language === 'fr' ? 'Support et FAQ' : 'Support & FAQ' },
    { href: createPageUrl('Legal'), label: language === 'fr' ? 'Mentions légales' : 'Legal' },
  ];

  return (
    <>
      {/* Desktop Footer */}
      <div className="hidden md:flex items-center justify-center gap-4 text-xs text-white/40 bg-[#0a0a0f]/90 backdrop-blur-sm px-4 py-3 rounded-lg border-t border-white/5">
        {links.map((link, idx) => (
          <React.Fragment key={link.href}>
            {idx > 0 && <span>•</span>}
            <a 
              href={link.href} 
              className={cn(
                "hover:text-white/60 transition-colors",
                link.icon && "inline-flex items-center gap-1"
              )}
            >
              {link.icon && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              )}
              {link.label}
            </a>
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Footer - Dropdown */}
      <div className="md:hidden bg-[#0a0a0f]/90 backdrop-blur-sm border-t border-white/5">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs text-white/60 hover:text-white/80 transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menu
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </button>
        
        {isOpen && (
          <div className="border-t border-white/5 bg-black/40">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                {link.icon && (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                )}
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}