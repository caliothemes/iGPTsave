import React from 'react';
import { X, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function LogoModal({ isOpen, onClose, content }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300 rounded-2xl overflow-hidden">
        {/* Dark gradient background like home */}
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-[#0a0a0f] to-blue-950/30" />
        
        {/* Subtle animated glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl" />
        
        {/* Professional background pattern - subtle dots */}
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Border */}
        <div className="absolute inset-0 rounded-2xl border border-white/10" />
        
        {/* Close button - positioned inside */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors z-20"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        
        {/* Content */}
        <div className="relative z-10 p-6 pt-5">
          <div className="prose prose-invert prose-xs max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="text-white/70 leading-relaxed mb-2 text-xs">{children}</p>,
                strong: ({ children }) => <strong className="text-violet-300 font-semibold">{children}</strong>,
                h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-400" />{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold text-white mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-medium text-white mb-1.5">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside text-white/70 space-y-0.5 mb-2 text-xs">{children}</ul>,
                li: ({ children }) => <li className="text-xs">{children}</li>,
                a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">{children}</a>,
              }}
            >
              {content || ''}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}