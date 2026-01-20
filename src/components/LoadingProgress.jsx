import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

export default function LoadingProgress() {
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDasharray = `${circumference * 0.75} ${circumference * 0.25}`; // 75% visible, 25% gap

  return (
    <div className="relative flex items-center justify-center">
      {/* Circular progress bar */}
      <svg className="absolute animate-spin" width="220" height="220" style={{ animationDuration: '2s' }}>
        {/* Background circle */}
        <circle
          cx="110"
          cy="110"
          r="90"
          fill="none"
          stroke="rgba(139, 92, 246, 0.1)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="110"
          cy="110"
          r="90"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Logo in center */}
      <div className="relative z-10">
        <Logo size="large" animate showText={false} />
      </div>
    </div>
  );
}