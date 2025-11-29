import React from 'react';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692a3549022b223ef419900f/ae6dde733_3.png";

export default function Logo({ size = 'default', showText = true, animate = false }) {
  const sizes = {
    small: { img: 32, text: 'text-xl' },
    default: { img: 48, text: 'text-2xl' },
    large: { img: 240, text: 'text-4xl' }
  };

  const { img, text } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <img 
        src={LOGO_URL} 
        alt="iGPT" 
        style={{ width: img, height: img }}
        className={`object-contain ${animate ? 'animate-float' : ''}`}
      />
      {showText && (
        <span className={`${text} font-bold text-white`}>
          iGPT
        </span>
      )}
      {animate && (
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      )}
    </div>
  );
}