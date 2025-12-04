import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import VisitTracker from './VisitTracker';

export default function GlobalHeader({ page = 'Home' }) {
  return (
    <>
      <VisitTracker page={page} />
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
    </>
  );
}