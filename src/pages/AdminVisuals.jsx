import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Trash2, Download, Image, Star, ShoppingBag, Store, ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import StoreItemModal from '@/components/admin/StoreItemModal';
import DownloadModal from '@/components/DownloadModal';
import VisualEditor from '@/components/chat/VisualEditor';
import { cn } from "@/lib/utils";

function StoreStatsBlock({ storeCount, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "block w-full px-4 py-3 rounded-lg bg-gradient-to-br border transition-all group text-left",
        isActive 
          ? "from-violet-500/40 to-purple-500/40 border-violet-400" 
          : "from-violet-500/20 to-purple-500/20 border-violet-500/30 hover:border-violet-400/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-violet-600/30 group-hover:bg-violet-600/40 transition-colors">
          <Store className="h-5 w-5 text-violet-300" />
        </div>
        <div>
          <div className="text-violet-300 text-sm font-medium">In Store</div>
          <div className="text-white text-lg font-bold">{storeCount} visuels</div>
        </div>
        {isActive && <span className="ml-auto text-violet-300">✓</span>}
        <div className="ml-auto text-violet-400 group-hover:translate-x-1 transition-transform">
          {isActive ? '✓' : '→'}
        </div>
      </div>
    </button>
  );
}

export default function AdminVisuals() {
  const [loading, setLoading] = useState(true);
  const [visuals, setVisuals] = useState([]);
  const [allVisualsCount, setAllVisualsCount] = useState(0);
  const [storeItems, setStoreItems] = useState([]);
  const [storeCategories, setStoreCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [storeCategoryFilter, setStoreCategoryFilter] = useState('all');
  const [portfolioFilter, setPortfolioFilter] = useState(false);
  const [storeFilter, setStoreFilter] = useState(false);
  const [userFilter, setUserFilter] = useState('admins'); // 'all' or 'admins'
  const [adminVisuals, setAdminVisuals] = useState([]); // All admin visuals when filter is active
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [selectedVisual, setSelectedVisual] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [visualToDownload, setVisualToDownload] = useState(null);
  const [adminEmails, setAdminEmails] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingVisual, setEditingVisual] = useState(null);
  const itemsPerPage = 100;

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }

        // Get all admins first
        let adminEmailList = [];
        try {
          const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 10000);
          const admins = allUsers.filter(u => u.role === 'admin');
          adminEmailList = admins.map(a => a.email);
          setAdminEmails(adminEmailList);
        } catch (e) {
          console.error('Error loading admins:', e);
          setAdminEmails([]);
        }

        // Get total count first
        const allVisuals = await base44.entities.Visual.list('-updated_date', 10000);
        setAllVisualsCount(allVisuals.length);

        // Load all admin visuals for the filter
        const allAdminVisuals = allVisuals.filter(v => adminEmailList.includes(v.user_email));
        setAdminVisuals(allAdminVisuals);

        const [fetchedVisuals, fetchedStoreItems, fetchedStoreCategories] = await Promise.all([
          base44.entities.Visual.list('-updated_date', itemsPerPage, 0),
          base44.entities.StoreItem.list(),
          base44.entities.StoreCategory.list('order')
        ]);
        setVisuals(fetchedVisuals);
        setStoreItems(fetchedStoreItems);
        setStoreCategories(fetchedStoreCategories);
        
        setLoading(false);
      } catch (e) {
        console.error('Error in AdminVisuals init:', e);
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadPage = async (page) => {
    setLoadingMore(true);
    try {
      const skip = (page - 1) * itemsPerPage;
      const fetchedVisuals = await base44.entities.Visual.list('-updated_date', itemsPerPage, skip);
      setVisuals(fetchedVisuals);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error('Error loading page:', e);
    }
    setLoadingMore(false);
  };

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

  const handleOpenStoreModal = (visual) => {
    setSelectedVisual(visual);
    setStoreModalOpen(true);
  };

  const loadVisuals = async () => {
    const skip = (currentPage - 1) * itemsPerPage;
    const [fetchedVisuals, fetchedStoreItems, fetchedStoreCategories] = await Promise.all([
      base44.entities.Visual.list('-updated_date', itemsPerPage, skip),
      base44.entities.StoreItem.list(),
      base44.entities.StoreCategory.list('order')
    ]);
    setVisuals(fetchedVisuals);
    setStoreItems(fetchedStoreItems);
    setStoreCategories(fetchedStoreCategories);
  };

  const handleDownload = (visual) => {
    setVisualToDownload(visual);
    setDownloadModalOpen(true);
  };

  const handleEdit = (visual) => {
    setEditingVisual(visual);
    setShowEditor(true);
  };

  const handleEditorSave = async (newImageUrl, layers, originalImageUrl) => {
    // Update visual in state
    setVisuals(prev => prev.map(v => 
      v.id === editingVisual.id 
        ? { ...v, image_url: newImageUrl, editor_layers: layers, original_image_url: originalImageUrl }
        : v
    ));
    setShowEditor(false);
    setEditingVisual(null);
  };

  // Main categories
  const mainCategories = [
    { id: 'logo_picto', name: 'Logo Pictogramme' },
    { id: 'logo_complet', name: 'Logo complet' },
    { id: 'image', name: 'Image réaliste' },
    { id: 'print', name: 'Design Print' },
    { id: 'social', name: 'Réseaux sociaux' },
    { id: 'mockup', name: 'Mockups' },
    { id: 'product', name: 'Produit' },
    { id: 'design_3d', name: 'Design 3D' },
    { id: 'textures', name: 'Textures' },
    { id: 'illustrations', name: 'Illustrations' },
    { id: 'icones_picto', name: 'Icônes Picto' },
    { id: 'free_prompt', name: 'Prompt 100% libre' }
  ];

  const visualTypes = [...new Set(visuals.map(v => v.visual_type).filter(Boolean))];

  const storeVisualIds = new Set(storeItems.map(item => item.visual_id));
  
  // Map store items to their categories
  const visualToStoreCategories = {};
  storeItems.forEach(item => {
    visualToStoreCategories[item.visual_id] = item.category_slugs || [];
  });

  // Use admin visuals when filter is active, otherwise use paginated visuals
  const visualsToFilter = userFilter === 'admins' ? adminVisuals : visuals;
  
  const filteredVisuals = visualsToFilter.filter(v => {
    // Multi-word intelligent search
    const searchWords = search.toLowerCase().trim().split(/\s+/);
    const matchesSearch = search.trim() === '' || searchWords.every(word => {
      const titleMatch = v.title?.toLowerCase().includes(word);
      const emailMatch = v.user_email?.toLowerCase().includes(word);
      const typeMatch = v.visual_type?.toLowerCase().includes(word);
      return titleMatch || emailMatch || typeMatch;
    });
    
    const matchesType = typeFilter === 'all' || v.visual_type === typeFilter;
    const matchesPortfolio = !portfolioFilter || v.in_portfolio;
    const matchesStore = !storeFilter || storeVisualIds.has(v.id);
    
    // Filter by store category
    const matchesStoreCategory = storeCategoryFilter === 'all' || 
      (visualToStoreCategories[v.id] && visualToStoreCategories[v.id].includes(storeCategoryFilter));
    
    return matchesSearch && matchesType && matchesPortfolio && matchesStore && matchesStoreCategory;
  });

  const totalPages = Math.ceil(allVisualsCount / itemsPerPage);
  const showPagination = totalPages > 1 && userFilter !== 'admins'; // Hide pagination when filtering by admins

  if (loading) {
    return (
      <AdminLayout currentPage="visuals">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  // Editor view
  if (showEditor && editingVisual) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <VisualEditor
          visual={editingVisual}
          onClose={() => {
            setShowEditor(false);
            setEditingVisual(null);
          }}
          onSave={handleEditorSave}
        />
      </div>
    );
  }

  return (
    <AdminLayout currentPage="visuals">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Visuels</h1>
            <p className="text-white/60">{allVisualsCount} visuels générés • Page {currentPage}/{totalPages}</p>
          </div>
          
          {/* User Filter Toggle */}
          <div className="flex gap-2">
            <Button
              onClick={() => setUserFilter('admins')}
              variant={userFilter === 'admins' ? 'default' : 'outline'}
              className={cn(
                userFilter === 'admins' 
                  ? 'bg-violet-600 text-white hover:bg-violet-700' 
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              )}
            >
              Tous les visuels iGPT admins
            </Button>
            <Button
              onClick={() => setUserFilter('all')}
              variant={userFilter === 'all' ? 'default' : 'outline'}
              className={cn(
                userFilter === 'all' 
                  ? 'bg-violet-600 text-white hover:bg-violet-700' 
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              )}
            >
              Tous les visuels iGPT
            </Button>
          </div>
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
              {mainCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={storeCategoryFilter} onValueChange={setStoreCategoryFilter}>
            <SelectTrigger className="w-52 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Catégorie Store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories Store</SelectItem>
              {storeCategories.filter(c => c.is_active).map(cat => (
                <SelectItem key={cat.slug} value={cat.slug}>{cat.name_fr}</SelectItem>
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

        {/* Store Stats */}
        <StoreStatsBlock 
          storeCount={storeItems.length} 
          isActive={storeFilter}
          onClick={() => setStoreFilter(!storeFilter)}
        />

        {/* Visuals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredVisuals.map((visual) => {
            // Calculate aspect ratio from dimensions
            let aspectRatio = '1 / 1'; // default square
            if (visual.dimensions) {
              const [w, h] = visual.dimensions.split('x').map(n => parseInt(n));
              if (w && h) {
                aspectRatio = `${w} / ${h}`;
              }
            }
            
            return (
            <div 
              key={visual.id}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
            >
              <div className="relative" style={{ aspectRatio }}>
                {visual.video_url || (visual.image_url && (visual.image_url.includes('.mp4') || visual.image_url.includes('/video'))) ? (
                  <video 
                    src={visual.video_url || visual.image_url}
                    muted
                    loop
                    autoPlay
                    className="block"
                    style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : visual.image_url ? (
                  <img 
                    src={visual.image_url} 
                    alt={visual.title}
                    className="block"
                    style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
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
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(visual)}
                    className="h-8 w-8 bg-black/50 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                    title="Éditer"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenStoreModal(visual)}
                    className="h-8 w-8 bg-black/50 text-violet-400 hover:text-violet-300 hover:bg-violet-500/20"
                    title="Ajouter au Store"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </Button>
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
                  {storeVisualIds.has(visual.id) && (
                    <span className="p-1.5 rounded-full bg-violet-600 shadow-lg">
                      <ShoppingBag className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
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
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white/40 px-2 py-0.5 rounded-full bg-white/5">
                    {visual.visual_type || 'autre'}
                  </span>
                  <span className="text-xs text-white/40">
                    v{visual.version || 1}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(visual)}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Télécharger
                </Button>
              </div>
            </div>
          );
          })}
        </div>

        {filteredVisuals.length === 0 && (
          <div className="text-center py-12 text-white/40">
            Aucun visuel trouvé
          </div>
        )}

        {/* Pagination */}
        {showPagination && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              onClick={() => loadPage(currentPage - 1)}
              disabled={currentPage === 1 || loadingMore}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    onClick={() => loadPage(pageNum)}
                    disabled={loadingMore}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    className={cn(
                      "w-10 h-10",
                      currentPage === pageNum 
                        ? "bg-violet-600 text-white hover:bg-violet-700" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={() => loadPage(currentPage + 1)}
              disabled={currentPage === totalPages || loadingMore}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      <StoreItemModal
        visual={selectedVisual}
        isOpen={storeModalOpen}
        onClose={() => {
          setStoreModalOpen(false);
          setSelectedVisual(null);
        }}
        onSuccess={loadVisuals}
      />

      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => {
          setDownloadModalOpen(false);
          setVisualToDownload(null);
        }}
        visual={visualToDownload}
        onDownload={() => {}}
        videoOnly={visualToDownload?.video_url || (visualToDownload?.image_url && (visualToDownload?.image_url.includes('.mp4') || visualToDownload?.image_url.includes('/video')))}
      />
    </AdminLayout>
  );
}