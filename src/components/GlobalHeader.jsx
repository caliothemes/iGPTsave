import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';

export default function GlobalHeader() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <LanguageSwitcher />
    </div>
  );
}