import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Sidebar from '@/components/Sidebar';
import GlobalHeader from '@/components/GlobalHeader';
import { useLanguage } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import Masonry from 'react-masonry-css';

export default function Portfolio() {
  const { language, t } = useLanguage();
  const [visuals, setVisuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [userVisuals, setUserVisuals] = useState([]);
  const observerRef = useRef();
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const initUser = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (auth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          const [userCreds, userVis, userConvs] = await Promise.all([
            base44.entities.UserCredits.filter({ user_email: currentUser.email }),
            base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 50),
            base44.entities.Conversation.filter({ user_email: currentUser.email }, '-updated_date', 20)
          ]);
          if (userCreds.length > 0) setCredits(userCreds[0]);
          setUserVisuals(userVis);
          setConversations(userConvs);
        }
      } catch (e) {
        console.error(e);
      }
    };
    initUser();
  }, []);

  const loadVisuals = useCallback(async (pageNum) => {
    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const fetched = await base44.entities.Visual.filter(
        { in_portfolio: true },
        '-created_date',
        ITEMS_PER_PAGE,
        pageNum * ITEMS_PER_PAGE
      );

      if (fetched.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      if (pageNum === 0) {
        setVisuals(fetched);
      } else {
        setVisuals(prev => [...prev, ...fetched]);
      }
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    loadVisuals(0);
  }, [loadVisuals]);

  // Infinite scroll observer
  const lastVisualRef = useCallback((node) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => {
          const nextPage = prev + 1;
          loadVisuals(nextPage);
          return nextPage;
        });
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore, loadVisuals]);

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        <ScrollToTop />
        </div>
        );
        }

  return (
    <div className="min-h-screen relative" onContextMenu={(e) => e.preventDefault()}>
      <AnimatedBackground />
      <GlobalHeader page="Portfolio" />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        credits={credits}
        conversations={conversations}
        visuals={userVisuals}
        onNewChat={() => window.location.href = createPageUrl('Home')}
        onSelectConversation={() => window.location.href = createPageUrl('Home')}
        onDeleteConversation={() => {}}
        onSelectVisual={() => window.location.href = createPageUrl('Home')}
        onLogin={() => base44.auth.redirectToLogin(createPageUrl('Portfolio'))}
        onLogout={() => base44.auth.logout()}
      />

      <div className={cn(
        "relative z-10 min-h-screen flex flex-col transition-all duration-300",
        sidebarOpen && "md:ml-64"
      )}>
        {/* Hero */}
        <div className="px-6 py-12 text-center pt-20">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="h-6 w-6 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Portfolio iGPT
            </h1>
            <Sparkles className="h-6 w-6 text-violet-400" />
          </div>
          <p className="text-base text-white/50">
            {language === 'fr' 
              ? 'Les plus belles créations de nos membres'
              : 'The most beautiful creations from our members'}
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="px-2 pb-32 flex-1 w-full">
          <style>{`
            .masonry-grid {
              display: flex;
              margin-left: -8px;
              width: auto;
            }
            .masonry-column {
              padding-left: 8px;
              background-clip: padding-box;
            }
            .masonry-column > div {
              margin-bottom: 8px;
            }
          `}</style>
          {visuals.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">
                {language === 'fr' ? 'Aucune création dans le portfolio pour le moment' : 'No creations in the portfolio yet'}
              </p>
            </div>
          ) : (
            <Masonry
              breakpointCols={{
                default: 6,
                1400: 5,
                1024: 4,
                768: 3,
                480: 2
              }}
              className="masonry-grid"
              columnClassName="masonry-column"
            >
              {visuals.map((visual, index) => {
                const isLast = index === visuals.length - 1;
                return (
                  <div
                    key={visual.id}
                    ref={isLast ? lastVisualRef : null}
                  >
                    <div className="group relative overflow-hidden rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all duration-300">
                      <img
                        src={visual.image_url}
                        alt={visual.title || 'Création iGPT'}
                        className="w-full h-auto block pointer-events-none select-none"
                        loading="lazy"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-white/20 text-3xl font-bold rotate-[-30deg] select-none">
                          iGPT
                        </div>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          {visual.title && (
                            <p className="text-white font-medium text-xs truncate">{visual.title}</p>
                          )}
                          {visual.visual_type && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-white/20 rounded-full text-white/80 text-[10px]">
                              {visual.visual_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Masonry>
          )}

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
            </div>
          )}

          {!hasMore && visuals.length > 0 && (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">
                {language === 'fr' ? 'Vous avez vu toutes les créations' : 'You have seen all creations'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0a0a0f] to-transparent py-4">
          <div className={cn("transition-all duration-300", sidebarOpen && "md:ml-64")}>
            <div className="flex items-center justify-center">
              <p className="text-white/25 text-xs">
                <a href={createPageUrl('Store')} className="hover:text-violet-400 transition-colors">iGPT Store</a>
                {' • '}
                <a href={createPageUrl('Pricing')} className="hover:text-violet-400 transition-colors">{t('pricing')}</a>
                {' • '}
                <a href={createPageUrl('Portfolio')} className="hover:text-violet-400 transition-colors text-violet-400">Portfolio</a>
                {' • '}
                <a href={createPageUrl('Legal')} className="hover:text-violet-400 transition-colors">{t('legal')}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}