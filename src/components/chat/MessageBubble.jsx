import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";


function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-1">
      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.2s' }} />
      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.2s' }} />
      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.2s' }} />
    </div>
  );
}

export default function MessageBubble({ message, isStreaming, thinkingText = "Réflexion...", user }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {/* Avatar - for assistant */}
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-violet-500/10">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692a3549022b223ef419900f/1df0e0151_iGPT-icon.png" 
            alt="iGPT" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {/* Avatar - for user */}
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center overflow-hidden order-last">
          {user?.profile_image ? (
            <img src={user.profile_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-xs font-medium">
              {user?.full_name?.[0] || user?.email?.[0] || 'U'}
            </span>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={cn("max-w-[85%]", isUser && "text-right")}>
        <div className={cn(
          "inline-block rounded-2xl px-4 py-3",
          isUser 
            ? "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 text-white shadow-lg" 
            : "bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-md border border-violet-500/10 text-white/90 shadow-lg shadow-violet-500/5"
        )}>
          {isStreaming ? (
            <TypingIndicator />
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