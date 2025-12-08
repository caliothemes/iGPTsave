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

export default function MyVisuals() {
  const { language } = useLanguage();
  const [visuals, setVisuals] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('filter') || 'all';
  });
  const [typeFilter, setTypeFilter] = useState('all');
  const [gridSize, setGridSize] = useState('medium');
  const [selectedVisual, setSelectedVisual] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const t = {
    fr: { title: "Mes visuels", subtitle: "Retrouvez toutes vos créations", search: "Rechercher...", all: "Tous", favorites: "Favoris", downloaded: "Téléchargés", noVisuals: "Aucun visuel trouvé" },
    en: { title: "My Visuals", subtitle: "Find all your creations", search: "Search...", all: "All", favorites: "Favorites", downloaded: "Downloaded", noVisuals: "No visuals found" }
  }[language];

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const [userVisuals, purchases] = await Promise.all([
          base44.entities.Visual.filter({ user_email: user.email }, '-updated_date', 200),
          base44.entities.StorePurchase.filter({ user_email: user.email }, '-created_date')
        ]);
        
        const purchasedVisualIds = new Set(purchases.map(p => p.visual_id));
        const visualsWithPurchaseFlag = userVisuals.map(v => ({
          ...v,
          isPurchased: purchasedVisualIds.has(v.id)
        }));
        
        setVisuals(visualsWithPurchaseFlag);
      } catch (e) {
        console.error(e);
      }
    };
    load();
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

  const visualTypes = [...new Set(visuals.map(v => v.visual_type).filter(Boolean))];

  const filteredVisuals = visuals.filter(v => {
    const matchesSearch = v.title?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'favorites' && v.is_favorite) || (filter === 'downloaded' && v.downloaded);
    const matchesType = typeFilter === 'all' || v.visual_type === typeFilter;
    return matchesSearch && matchesFilter && matchesType;
  });

  return (
    <PageWrapper requireAuth>
      {({ credits }) => (
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
            <p className="text-white/60">{t.subtitle} ({visuals.length})</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40" />
            </div>
            <div className="flex gap-2">
              <Button variant={filter === 'all' ? 'default' : 'ghost'} onClick={() => setFilter('all')} className={cn(filter === 'all' ? 'bg-violet-600' : 'text-white/60 hover:text-white')}>{t.all}</Button>
              <Button variant={filter === 'favorites' ? 'default' : 'ghost'} onClick={() => setFilter('favorites')} className={cn(filter === 'favorites' ? 'bg-violet-600' : 'text-white/60 hover:text-white')}><Heart className="h-4 w-4 mr-1" />{t.favorites}</Button>
              <Button variant={filter === 'downloaded' ? 'default' : 'ghost'} onClick={() => setFilter('downloaded')} className={cn(filter === 'downloaded' ? 'bg-violet-600' : 'text-white/60 hover:text-white')}><Download className="h-4 w-4 mr-1" />{t.downloaded}</Button>
            </div>
            {visualTypes.length > 0 && (
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  {visualTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Grid */}
          {filteredVisuals.length === 0 ? (
            <div className="text-center py-12 text-white/40">{t.noVisuals}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredVisuals.map((visual) => (
                <div key={visual.id} className="relative">
                  {visual.isPurchased && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-600 text-white text-xs font-medium rounded-full shadow-lg">
                        🛍️ Store
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