import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Logo({ size = 'default' }) {
  const sizes = {
    small: { icon: 24, text: 'text-xl' },
    default: { icon: 40, text: 'text-3xl' },
    large: { icon: 64, text: 'text-5xl' }
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 blur-lg opacity-50 animate-pulse" />
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-3 rounded-2xl">
          <Sparkles className="text-white" size={icon} />
        </div>
      </div>
      <div className={`${text} font-bold`}>
        <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          Visual
        </span>
        <span className="text-white">GPT</span>
      </div>
    </div>
  );
}