import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Trash2, Download, Image, Star } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from "@/lib/utils";

export default function AdminVisuals() {
  const [loading, setLoading] = useState(true);
  const [visuals, setVisuals] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [portfolioFilter, setPortfolioFilter] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }

        const fetchedVisuals = await base44.entities.Visual.list('-updated_date', 200);
        setVisuals(fetchedVisuals);
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (visualId) => {
    if (!confirm('Supprimer ce visuel ?')) return;
    await base44.entities.Visual.delete(visualId);
    setVisuals(prev => prev.filter(v => v.id !== visualId));
  };

  const togglePortfolio = async (visual) => {
    const newValue = !visual.in_portfolio;
    await base44.entities.Visual.update(visual.id, { in_portfolio: newValue });
    setVisuals(prev => prev.map(v => v.id === visual.id ? { ...v, in_portfolio: newValue } : v));
  };

  const visualTypes = [...new Set(visuals.map(v => v.visual_type).filter(Boolean))];

  const filteredVisuals = visuals.filter(v => {
    const matchesSearch = v.title?.toLowerCase().includes(search.toLowerCase()) ||
                         v.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || v.visual_type === typeFilter;
    const matchesPortfolio = !portfolioFilter || v.in_portfolio;
    return matchesSearch && matchesType && matchesPortfolio;
  });

  if (loading) {
    return (
      <AdminLayout currentPage="visuals">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="visuals">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Visuels</h1>
          <p className="text-white/60">{visuals.length} visuels générés</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Rechercher par titre ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Type de visuel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {visualTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm flex-wrap">
          <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-white/60">Téléchargés: </span>
            <span className="text-white font-medium">{visuals.filter(v => v.downloaded).length}</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-white/60">Favoris: </span>
            <span className="text-white font-medium">{visuals.filter(v => v.is_favorite).length}</span>
          </div>
          <button 
            onClick={() => setPortfolioFilter(!portfolioFilter)}
            className={cn(
              "px-4 py-2 rounded-lg border transition-colors cursor-pointer",
              portfolioFilter 
                ? "bg-amber-500/30 border-amber-400 text-amber-300" 
                : "bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
            )}
          >
            <span>Portfolio: </span>
            <span className="font-medium">{visuals.filter(v => v.in_portfolio).length}</span>
            {portfolioFilter && <span className="ml-2">✓</span>}
          </button>
          <a 
            href={createPageUrl('Portfolio')} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-colors"
          >
            Voir le portfolio →
          </a>
        </div>

        {/* Visuals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredVisuals.map((visual) => (
            <div 
              key={visual.id}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
            >
              <div className="relative">
                {visual.image_url ? (
                  <img 
                    src={visual.image_url} 
                    alt={visual.title}
                    className="w-full h-auto block"
                    style={{ display: 'block' }}
                  />
                ) : (
                  <div className="w-full flex items-center justify-center bg-white/5" style={{ aspectRatio: '1' }}>
                    <Image className="h-8 w-8 text-white/20" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-medium truncate">{visual.title}</p>
                    <p className="text-white/60 text-xs truncate">{visual.user_email}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => togglePortfolio(visual)}
                    className={cn(
                      "h-8 w-8 bg-black/50",
                      visual.in_portfolio 
                        ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/20" 
                        : "text-white/60 hover:text-amber-400 hover:bg-amber-500/20"
                    )}
                    title={visual.in_portfolio ? "Retirer du portfolio" : "Ajouter au portfolio"}
                  >
                    <Star className={cn("h-4 w-4", visual.in_portfolio && "fill-current")} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(visual.id)}
                    className="h-8 w-8 bg-black/50 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Status badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {visual.downloaded && (
                    <span className="p-1 rounded-full bg-green-500/80">
                      <Download className="h-3 w-3 text-white" />
                    </span>
                  )}
                  {visual.in_portfolio && (
                    <span className="p-1 rounded-full bg-amber-500/80">
                      <Star className="h-3 w-3 text-white fill-current" />
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 px-2 py-0.5 rounded-full bg-white/5">
                    {visual.visual_type || 'autre'}
                  </span>
                  <span className="text-xs text-white/40">
                    v{visual.version || 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVisuals.length === 0 && (
          <div className="text-center py-12 text-white/40">
            Aucun visuel trouvé
          </div>
        )}
      </div>
    </AdminLayout>
  );
}