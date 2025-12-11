import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Grid, List, Heart, Download, Pencil } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import VisualCard from '@/components/chat/VisualCard';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";
import { CATEGORIES } from '@/components/chat/CategorySelector';

export default function MyVisuals() {
  const { language } = useLanguage();
  const [visuals, setVisuals] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('filter') || 'all';
  });
  const [typeFilter, setTypeFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [gridSize, setGridSize] = useState('medium');
  const [selectedVisual, setSelectedVisual] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const t = {
    fr: { title: "Mes visuels", subtitle: "Retrouvez toutes vos créations", search: "Rechercher...", all: "Tous", favorites: "Favoris", downloaded: "Téléchargés", noVisuals: "Aucun visuel trouvé" },
    en: { title: "My Visuals", subtitle: "Find all your creations", search: "Search...", all: "All", favorites: "Favorites", downloaded: "Downloaded", noVisuals: "No visuals found" }
  }[language];

  useEffect(() => {
    const loadAllVisuals = async () => {
      try {
        const user = await base44.auth.me();
        let allVisuals = [];
        let skip = 0;
        const limit = 200;
        let hasMoreData = true;
        
        // Load all visuals in batches
        while (hasMoreData) {
          const batch = await base44.entities.Visual.filter(
            { user_email: user.email }, 
            '-updated_date', 
            limit, 
            skip
          );
          
          if (batch.length === 0) {
            hasMoreData = false;
          } else {
            allVisuals = [...allVisuals, ...batch];
            skip += limit;
            if (batch.length < limit) {
              hasMoreData = false;
            }
          }
        }
        
        const purchases = await base44.entities.StorePurchase.filter({ user_email: user.email }, '-created_date');
        const purchasedVisualIds = new Set(purchases.map(p => p.visual_id));
        const visualsWithPurchaseFlag = allVisuals.map(v => ({
          ...v,
          isPurchased: purchasedVisualIds.has(v.id)
        }));
        
        setVisuals(visualsWithPurchaseFlag);
        setHasMore(false);
      } catch (e) {
        console.error(e);
      }
    };
    loadAllVisuals();
  }, []);

  // Deduct 1 message/credit
  const deductCredit = async (credits) => {
    if (!credits) return;
    if (credits.subscription_type === 'unlimited') return;
    
    if (credits.free_downloads > 0) {
      await base44.entities.UserCredits.update(credits.id, { free_downloads: credits.free_downloads - 1 });
    } else if (credits.paid_credits > 0) {
      await base44.entities.UserCredits.update(credits.id, { paid_credits: credits.paid_credits - 1 });
    }
  };

  const handleDownload = async (visual, credits) => {
    // Deduct credit for download
    await deductCredit(credits);
    
    const link = document.createElement('a');
    link.href = visual.image_url;
    link.download = `${visual.title || 'visual'}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (visual.id) {
      await base44.entities.Visual.update(visual.id, { downloaded: true });
      setVisuals(prev => prev.map(v => v.id === visual.id ? { ...v, downloaded: true } : v));
    }
  };

  const handleEdit = (visual) => {
    // Redirect to Home with visual ID to open in chat
    window.location.href = createPageUrl('Home') + `?editVisual=${visual.id}`;
  };



  const handleToggleFavorite = async (visual) => {
    const newState = !visual.is_favorite;
    await base44.entities.Visual.update(visual.id, { is_favorite: newState });
    setVisuals(prev => prev.map(v => v.id === visual.id ? { ...v, is_favorite: newState } : v));
    if (selectedVisual?.id === visual.id) setSelectedVisual(prev => ({ ...prev, is_favorite: newState }));
  };

  // Main categories to display
  const mainCategories = [
    { id: 'logo_picto', name: language === 'fr' ? 'Logo Pictogramme' : 'Logo Pictogram' },
    { id: 'logo_complet', name: language === 'fr' ? 'Logo complet' : 'Full Logo' },
    { id: 'design_3d', name: 'Design 3D' },
    { id: 'image', name: language === 'fr' ? 'Image réaliste' : 'Realistic Image' },
    { id: 'print', name: language === 'fr' ? 'Design Print' : 'Print Design' },
    { id: 'social', name: language === 'fr' ? 'Réseaux sociaux' : 'Social Media' },
    { id: 'mockup', name: 'Mockups' },
    { id: 'product', name: language === 'fr' ? 'Produit' : 'Product' },
    { id: 'textures', name: 'Textures' },
    { id: 'illustrations', name: 'Illustrations' },
    { id: 'icones_picto', name: language === 'fr' ? 'Icônes Picto' : 'Icons Picto' },
    { id: 'free_prompt', name: language === 'fr' ? 'Prompt 100% libre' : '100% Free Prompt' }
  ];

  // Map visual_type to main category
  const getMainCategory = (visualType) => {
    if (!visualType) return null;
    
    // Direct match
    const direct = mainCategories.find(c => c.id === visualType);
    if (direct) return direct.id;
    
    // Check if it's a subcategory of print
    if (visualType.includes('carte') || visualType.includes('flyer') || visualType.includes('affiche') || 
        visualType === 'business_card' || visualType === 'flyer_a5' || visualType === 'poster') {
      return 'print';
    }
    
    // Check if it's a subcategory of social
    if (visualType.includes('instagram') || visualType.includes('facebook') || visualType.includes('linkedin') ||
        visualType.includes('post') || visualType.includes('story') || visualType.includes('banner')) {
      return 'social';
    }
    
    return visualType;
  };

  // Count visuals by main category
  const categoryCounts = visuals.reduce((acc, v) => {
    const mainCat = getMainCategory(v.visual_type);
    if (mainCat) {
      acc[mainCat] = (acc[mainCat] || 0) + 1;
    }
    return acc;
  }, {});

  // Get aspect ratio from dimensions
  const getAspectRatio = (dimensions) => {
    if (!dimensions) return null;
    const [w, h] = dimensions.split('x').map(Number);
    if (!w || !h) return null;
    const ratio = w / h;
    if (Math.abs(ratio - 1) < 0.1) return '1:1'; // Square
    if (Math.abs(ratio - 9/16) < 0.1 || Math.abs(ratio - 0.5625) < 0.1) return '9:16'; // Story
    if (Math.abs(ratio - 3/4) < 0.1 || Math.abs(ratio - 0.75) < 0.1) return '3:4'; // Portrait
    if (Math.abs(ratio - 16/9) < 0.1 || Math.abs(ratio - 1.777) < 0.1) return '16:9'; // Landscape
    return 'other';
  };

  const filteredVisuals = visuals.filter(v => {
    const matchesSearch = v.title?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'favorites' && v.is_favorite) || (filter === 'downloaded' && v.downloaded);
    const mainCat = getMainCategory(v.visual_type);
    const matchesType = typeFilter === 'all' || mainCat === typeFilter;
    const aspectRatio = getAspectRatio(v.dimensions);
    const matchesFormat = formatFilter === 'all' || aspectRatio === formatFilter;
    return matchesSearch && matchesFilter && matchesType && matchesFormat;
  });

  return (
    <PageWrapper requireAuth fullWidth>
      {({ credits }) => (
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
            <p className="text-white/60">{t.subtitle}</p>
          </div>

          {/* Filters */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40" />
              </div>
              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'fr' ? 'Tous formats' : 'All formats'}</SelectItem>
                  <SelectItem value="1:1">{language === 'fr' ? 'Carré 1:1' : 'Square 1:1'}</SelectItem>
                  <SelectItem value="9:16">Story 9:16</SelectItem>
                  <SelectItem value="3:4">Portrait 3:4</SelectItem>
                  <SelectItem value="16:9">Paysage 16:9</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant={filter === 'all' ? 'default' : 'ghost'} onClick={() => setFilter('all')} className={cn(filter === 'all' ? 'bg-violet-600' : 'text-white/60 hover:text-white')}>{t.all}</Button>
                <Button variant={filter === 'favorites' ? 'default' : 'ghost'} onClick={() => setFilter('favorites')} className={cn(filter === 'favorites' ? 'bg-violet-600' : 'text-white/60 hover:text-white')}><Heart className="h-4 w-4 mr-1" />{t.favorites}</Button>
                <Button variant={filter === 'downloaded' ? 'default' : 'ghost'} onClick={() => setFilter('downloaded')} className={cn(filter === 'downloaded' ? 'bg-violet-600' : 'text-white/60 hover:text-white')}><Download className="h-4 w-4 mr-1" />{t.downloaded}</Button>
              </div>
            </div>

            {/* Category Tags */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  typeFilter === 'all' 
                    ? "bg-violet-600 text-white" 
                    : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                )}
              >
                {language === 'fr' ? 'Tous' : 'All'} ({visuals.length})
              </button>
              {mainCategories.map(cat => {
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setTypeFilter(cat.id)}
                    disabled={count === 0}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
                      typeFilter === cat.id 
                        ? "bg-violet-600 text-white" 
                        : count > 0
                          ? "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                          : "bg-white/5 text-white/30 cursor-not-allowed"
                    )}
                  >
                    {cat.name}
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px]",
                      typeFilter === cat.id
                        ? "bg-white/20"
                        : count > 0
                          ? "bg-white/10"
                          : "bg-white/5"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          {filteredVisuals.length === 0 ? (
            <div className="text-center py-12 text-white/40">{t.noVisuals}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredVisuals.map((visual) => (
                <div key={visual.id} className="relative">
                  {visual.isPurchased && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-600 text-white text-xs font-medium rounded-full shadow-lg">
                        🛍️ {language === 'fr' ? 'Acheté sur l\'iGPT Store' : 'Purchased on iGPT Store'}
                      </span>
                    </div>
                  )}
                  <VisualCard
                    visual={visual}
                    onDownload={() => handleDownload(visual, credits)}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={() => handleEdit(visual)}
                    isRegenerating={false}
                    canDownload={true}
                    compact
                    hideInfoMessage={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}