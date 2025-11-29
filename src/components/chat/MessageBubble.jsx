import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { Sparkles, Loader2 } from 'lucide-react';

export default function MessageBubble({ message, isStreaming }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {/* Avatar - only for assistant */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/80 to-purple-600/80 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Message Content */}
      <div className={cn("max-w-[85%]", isUser && "text-right")}>
        <div className={cn(
          "inline-block rounded-2xl px-4 py-2.5",
          isUser 
            ? "bg-white/10 text-white" 
            : "text-white/90"
        )}>
          {isStreaming && !message.content ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
              <span className="text-white/50 text-sm">Réflexion...</span>
            </div>
          ) : (
            <ReactMarkdown 
              className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                p: ({ children }) => <p className="my-1 leading-relaxed text-sm">{children}</p>,
                ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1 text-sm">{children}</ul>,
                ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1 text-sm">{children}</ol>,
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-violet-300">{children}</strong>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}