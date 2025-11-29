import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Heart, Download, Grid3X3, LayoutGrid, Loader2, Image as ImageIcon } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlobalHeader from '@/components/GlobalHeader';
import Logo from '@/components/Logo';
import VisualCard from '@/components/chat/VisualCard';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";

export default function MyVisuals() {
  const { language } = useLanguage();
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [visuals, setVisuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, favorites, downloaded
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [gridSize, setGridSize] = useState('medium'); // small, medium

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const [userCredits, userVisuals] = await Promise.all([
          base44.entities.UserCredits.filter({ user_email: currentUser.email }),
          base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 200)
        ]);

        if (userCredits.length > 0) {
          setCredits(userCredits[0]);
        }
        setVisuals(userVisuals);
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
      setLoading(false);
    };
    init();
  }, []);

  const getTotalCredits = () => {
    if (!credits) return 0;
    if (credits.subscription_type === 'unlimited') return Infinity;
    return (credits.free_downloads || 0) + (credits.paid_credits || 0);
  };

  const handleDownload = async (visual) => {
    const totalCredits = getTotalCredits();
    if (totalCredits <= 0) {
      window.location.href = createPageUrl('Pricing');
      return;
    }

    if (credits.subscription_type !== 'unlimited') {
      if (credits.free_downloads > 0) {
        await base44.entities.UserCredits.update(credits.id, { free_downloads: credits.free_downloads - 1 });
        setCredits(prev => ({ ...prev, free_downloads: prev.free_downloads - 1 }));
      } else if (credits.paid_credits > 0) {
        await base44.entities.UserCredits.update(credits.id, { paid_credits: credits.paid_credits - 1 });
        setCredits(prev => ({ ...prev, paid_credits: prev.paid_credits - 1 }));
      }
    }

    await base44.entities.Visual.update(visual.id, { downloaded: true });
    setVisuals(prev => prev.map(v => v.id === visual.id ? { ...v, downloaded: true } : v));

    const link = document.createElement('a');
    link.href = visual.image_url;
    link.download = `${visual.title || 'visual'}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleFavorite = async (visual) => {
    const newFavoriteState = !visual.is_favorite;
    await base44.entities.Visual.update(visual.id, { is_favorite: newFavoriteState });
    setVisuals(prev => prev.map(v => v.id === visual.id ? { ...v, is_favorite: newFavoriteState } : v));
  };

  const handleRegenerate = async (visual) => {
    // Redirect to home with visual context
    window.location.href = createPageUrl('Home') + `?regenerate=${visual.id}`;
  };

  const visualTypes = [...new Set(visuals.map(v => v.visual_type).filter(Boolean))];

  const filteredVisuals = visuals.filter(v => {
    if (filter === 'favorites' && !v.is_favorite) return false;
    if (filter === 'downloaded' && !v.downloaded) return false;
    if (typeFilter !== 'all' && v.visual_type !== typeFilter) return false;
    if (search && !v.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const texts = {
    fr: {
      title: 'Mes Visuels',
      subtitle: 'Retrouvez tous vos visuels générés',
      all: 'Tous',
      favorites: 'Favoris',
      downloaded: 'Téléchargés',
      search: 'Rechercher...',
      noVisuals: 'Aucun visuel trouvé',
      createFirst: 'Créez votre premier visuel',
      back: 'Retour',
      credits: 'crédits',
      unlimited: 'Illimité'
    },
    en: {
      title: 'My Visuals',
      subtitle: 'Find all your generated visuals',
      all: 'All',
      favorites: 'Favorites',
      downloaded: 'Downloaded',
      search: 'Search...',
      noVisuals: 'No visuals found',
      createFirst: 'Create your first visual',
      back: 'Back',
      credits: 'credits',
      unlimited: 'Unlimited'
    }
  };

  const t = texts[language] || texts.fr;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader2 className="h-8 w-8 text-violet-400 animate-spin relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <GlobalHeader />

      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <a href={createPageUrl('Home')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
                {t.back}
              </a>
            </div>
            <Logo size="small" showText={false} />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-sm">
              <Download className="h-4 w-4" />
              {credits?.subscription_type === 'unlimited' 
                ? t.unlimited 
                : `${getTotalCredits()} ${t.credits}`}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t.title}</h1>
            <p className="text-white/60">{t.subtitle}</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Status Tabs */}
            <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
              <TabsList className="bg-white/10 border border-white/10">
                <TabsTrigger value="all" className="data-[state=active]:bg-violet-600">
                  {t.all} ({visuals.length})
                </TabsTrigger>
                <TabsTrigger value="favorites" className="data-[state=active]:bg-violet-600">
                  <Heart className="h-4 w-4 mr-1" />
                  {t.favorites} ({visuals.filter(v => v.is_favorite).length})
                </TabsTrigger>
                <TabsTrigger value="downloaded" className="data-[state=active]:bg-violet-600">
                  <Download className="h-4 w-4 mr-1" />
                  {t.downloaded} ({visuals.filter(v => v.downloaded).length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Type Filter */}
            {visualTypes.length > 0 && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all" className="bg-gray-900">{t.all}</option>
                {visualTypes.map(type => (
                  <option key={type} value={type} className="bg-gray-900">
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            )}

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.search}
                className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            {/* Grid Size Toggle */}
            <div className="flex gap-1 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setGridSize('medium')}
                className={cn(
                  "p-2 rounded transition-colors",
                  gridSize === 'medium' ? "bg-violet-600 text-white" : "text-white/60 hover:text-white"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setGridSize('small')}
                className={cn(
                  "p-2 rounded transition-colors",
                  gridSize === 'small' ? "bg-violet-600 text-white" : "text-white/60 hover:text-white"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Visuals Grid */}
          {filteredVisuals.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-lg mb-4">{t.noVisuals}</p>
              <Button
                onClick={() => window.location.href = createPageUrl('Home')}
                className="bg-gradient-to-r from-violet-600 to-blue-600"
              >
                {t.createFirst}
              </Button>
            </div>
          ) : (
            <div className={cn(
              "grid gap-4",
              gridSize === 'medium' 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            )}>
              {filteredVisuals.map((visual) => (
                <VisualCard
                  key={visual.id}
                  visual={visual}
                  onRegenerate={handleRegenerate}
                  onDownload={() => handleDownload(visual)}
                  onToggleFavorite={handleToggleFavorite}
                  isRegenerating={false}
                  canDownload={getTotalCredits() > 0}
                  hasWatermark={credits?.subscription_type === 'free' && !visual.downloaded}
                  showActions={gridSize === 'medium'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}