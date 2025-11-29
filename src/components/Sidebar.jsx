import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  PanelLeftClose, PanelLeft, Plus, MessageSquare, Image, 
  User, CreditCard, Crown, LogOut, LogIn, ChevronDown, Trash2, Shield, Home
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { createPageUrl } from '@/utils';
import { useLanguage } from './LanguageContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function Sidebar({ 
  isOpen, 
  onToggle, 
  user, 
  credits,
  conversations,
  visuals,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onSelectVisual,
  onLogin,
  onLogout,
  sidebarTitle
}) {
  const { t } = useLanguage();
  const [visualsOpen, setVisualsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);

  const getTotalCredits = () => {
    if (!credits) return 0;
    if (credits.subscription_type === 'unlimited') return '∞';
    return (credits.free_downloads || 0) + (credits.paid_credits || 0);
  };

  const getSubscriptionBadge = () => {
    if (!credits) return null;
    if (credits.subscription_type === 'unlimited') return { label: 'Unlimited', color: 'bg-purple-500/20 text-purple-300' };
    if (credits.subscription_type === 'limited') return { label: 'Pro', color: 'bg-blue-500/20 text-blue-300' };
    return { label: t('free'), color: 'bg-white/10 text-white/60' };
  };

  const badge = getSubscriptionBadge();

  return (
    <>
      {/* Toggle Button - Always visible */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={cn(
          "fixed top-4 left-4 z-50 text-white/70 hover:text-white hover:bg-white/10 transition-all",
          isOpen && "left-[268px]"
        )}
      >
        {isOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-black/60 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-3 pt-4 flex flex-col border-b border-white/10">
          <p className="text-white/50 text-xs font-medium mb-3 ml-1">{sidebarTitle || 'iGPT 1.0.1 beta'}</p>
          {user?.role === 'admin' && (
            <a
              href={createPageUrl('Admin')}
              className="w-full mb-2 inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors"
            >
              <Crown className="h-4 w-4 mr-2" />
              Admin
            </a>
          )}
          <a
            href={createPageUrl('Home')}
            className="w-full mb-2 inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            {t('home')}
          </a>
          <a
            href={createPageUrl('MyVisuals')}
            className="w-full mb-2 inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Image className="h-4 w-4 mr-2" />
            {t('myVisuals')}
          </a>
          <Button
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-violet-800/80 to-blue-800/80 hover:from-violet-900 hover:to-blue-900 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('newCreation')}
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-3">
          {/* Conversation History */}
          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen} className="mb-4">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 text-sm text-white/60 hover:text-white transition-colors">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t('history')}
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", historyOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {conversations.length === 0 ? (
                <p className="text-white/40 text-xs px-2 py-2">{t('noConversation')}</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors",
                      currentConversationId === conv.id 
                        ? "bg-violet-500/20 text-white" 
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                    onClick={() => onSelectConversation(conv)}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate text-sm">{conv.title || 'Conversation'}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                    >
                      <Trash2 className="h-3 w-3 text-white/50 hover:text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Current Session Visuals */}
          {visuals.length > 0 && (
            <Collapsible open={visualsOpen} onOpenChange={setVisualsOpen} className="mb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 text-sm text-white/60 hover:text-white transition-colors">
                <span className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  {t('visualsInProgress')} ({visuals.length > 4 ? '4+' : visuals.length})
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", visualsOpen && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 gap-2 p-2">
                  {visuals.slice(0, 4).map((visual, idx) => (
                    <div
                      key={visual.id || idx}
                      onClick={() => onSelectVisual(visual)}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer border border-white/10 hover:border-violet-500/50 transition-colors"
                    >
                      <img src={visual.image_url} alt={visual.title} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                {visuals.length > 4 && (
                  <a 
                    href={createPageUrl('MyVisuals')}
                    className="block text-violet-400 text-xs text-center py-2 hover:text-violet-300 transition-colors"
                  >
                    {t('seeAll')} ({visuals.length})
                  </a>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </ScrollArea>

        {/* Footer - Account Section */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {user ? (
            <>
              {/* Credits Badge */}
              <a 
                href={createPageUrl('Pricing')}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-violet-400" />
                  <span className="text-white/80 text-sm">{getTotalCredits()} {t('credits')}</span>
                </div>
                {badge && (
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", badge.color)}>
                    {badge.label}
                  </span>
                )}
              </a>

              {/* User Info - Clickable to Account page */}
              <a 
                href={createPageUrl('Account')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center overflow-hidden">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {user.full_name?.[0] || user.email?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{user.full_name || 'User'}</p>
                  <p className="text-white/50 text-xs truncate">{user.email}</p>
                </div>
              </a>

              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </>
          ) : (
            <Button
              onClick={onLogin}
              className="w-full bg-white/10 hover:bg-white/20 text-white"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {t('login')}
            </Button>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}