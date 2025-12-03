import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Portfolio() {
  const [visuals, setVisuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerRef = useRef();
  const ITEMS_PER_PAGE = 20;

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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <Logo size="small" />
              <span className="text-white font-semibold text-lg hidden sm:block">iGPT</span>
            </Link>
            <Link 
              to={createPageUrl('Home')}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 rounded-lg text-white text-sm font-medium hover:from-violet-700 hover:to-blue-700 transition-all"
            >
              Créer mon visuel
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-amber-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Portfolio iGPT
            </h1>
          </div>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Les plus belles créations de nos membres, générées par intelligence artificielle
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          {visuals.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">Aucune création dans le portfolio pour le moment</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {visuals.map((visual, index) => {
                const isLast = index === visuals.length - 1;
                return (
                  <div
                    key={visual.id}
                    ref={isLast ? lastVisualRef : null}
                    className="break-inside-avoid group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all duration-300"
                  >
                    <img
                      src={visual.image_url}
                      alt={visual.title || 'Création iGPT'}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {visual.title && (
                          <p className="text-white font-medium text-sm truncate">{visual.title}</p>
                        )}
                        {visual.visual_type && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-white/80 text-xs">
                            {visual.visual_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
            </div>
          )}

          {!hasMore && visuals.length > 0 && (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">Vous avez vu toutes les créations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}