import React from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function LogoModal({ isOpen, onClose, content }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="text-white/80 leading-relaxed mb-3">{children}</p>,
              strong: ({ children }) => <strong className="text-violet-300 font-semibold">{children}</strong>,
              h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-semibold text-white mb-3">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-medium text-white mb-2">{children}</h3>,
              ul: ({ children }) => <ul className="list-disc list-inside text-white/80 space-y-1 mb-3">{children}</ul>,
              a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">{children}</a>,
            }}
          >
            {content || ''}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}