import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Grid, List, Heart, Download, Pencil, ChevronLeft, ChevronRight, Wand2, Video, Scissors } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import VisualCard from '@/components/chat/VisualCard';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";
import { CATEGORIES } from '@/components/chat/CategorySelector';
import VisualEditor from '@/components/chat/VisualEditor';
import VideoGenerationModal from '@/components/chat/VideoGenerationModal';
import ADSModal from '@/components/chat/ADSModal';
import CropModal from '@/components/chat/CropModal';

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
  const [showEditor, setShowEditor] = useState(false);
  const [editingVisual, setEditingVisual] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoVisual, setVideoVisual] = useState(null);
  const [showADSModal, setShowADSModal] = useState(false);
  const [adsVisual, setAdsVisual] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropVisual, setCropVisual] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const VISUALS_PER_PAGE = 15;
  const visualRefs = useRef({});

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
    setEditingVisual(visual);
    setShowEditor(true);
  };

  const handleOpenVideo = (visual) => {
    setVideoVisual(visual);
    setShowVideoModal(true);
  };

  const handleOpenADS = (visual) => {
    setAdsVisual(visual);
    setShowADSModal(true);
  };

  const handleEditorSave = async (newImageUrl, layers, originalImageUrl) => {
    if (!editingVisual?.id) return;
    
    const updatedVisual = await base44.entities.Visual.update(editingVisual.id, {
      image_url: newImageUrl,
      editor_layers: layers,
      original_image_url: originalImageUrl
    });
    
    setVisuals(prev => prev.map(v => v.id === editingVisual.id ? updatedVisual : v));
    setShowEditor(false);
    
    // Scroll to the edited visual after closing editor
    setTimeout(() => {
      const visualElement = visualRefs.current[editingVisual.id];
      if (visualElement) {
        visualElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    setEditingVisual(null);
  };

  const handleVideoGenerated = async (videoUrl, animationPrompt) => {
    if (!videoVisual) return;

    const newVisual = await base44.entities.Visual.create({
      user_email: videoVisual.user_email,
      image_url: videoUrl,
      video_url: videoUrl,
      title: videoVisual.title + ' (Vidéo)',
      original_prompt: animationPrompt,
      dimensions: videoVisual.dimensions,
      visual_type: videoVisual.visual_type,
      parent_visual_id: videoVisual.id
    });

    setVisuals(prev => [newVisual, ...prev]);
    setShowVideoModal(false);
    setVideoVisual(null);

    // Scroll to top to see the new video
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCropComplete = async (newImageUrl) => {
    if (!cropVisual?.id) return;
    
    await base44.entities.Visual.update(cropVisual.id, {
      image_url: newImageUrl,
      original_image_url: cropVisual.original_image_url || cropVisual.image_url
    });
    
    setVisuals(prev => prev.map(v => 
      v.id === cropVisual.id 
        ? { ...v, image_url: newImageUrl, original_image_url: cropVisual.original_image_url || cropVisual.image_url }
        : v
    ));
    
    setShowCropModal(false);
    setCropVisual(null);
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
    { id: 'image', name: language === 'fr' ? 'Image réaliste' : 'Realistic Image' },
    { id: 'print', name: language === 'fr' ? 'Design Print' : 'Print Design' },
    { id: 'social', name: language === 'fr' ? 'Réseaux sociaux' : 'Social Media' },
    { id: 'mockup', name: 'Mockups' },
    { id: 'product', name: language === 'fr' ? 'Produit' : 'Product' },
    { id: 'design_3d', name: 'Design 3D' },
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

  // Pagination
  const totalPages = Math.ceil(filteredVisuals.length / VISUALS_PER_PAGE);
  const startIndex = (currentPage - 1) * VISUALS_PER_PAGE;
  const endIndex = startIndex + VISUALS_PER_PAGE;
  const paginatedVisuals = filteredVisuals.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, typeFilter, formatFilter]);

  // Editor view
  if (showEditor && editingVisual) {
    return (
      <VisualEditor
        visual={editingVisual}
        onClose={() => {
          setShowEditor(false);
          setEditingVisual(null);
        }}
        onSave={handleEditorSave}
      />
    );
  }

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
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {paginatedVisuals.map((visual) => (
                  <div 
                    key={visual.id} 
                    className="relative"
                    ref={(el) => {
                      if (el) visualRefs.current[visual.id] = el;
                    }}
                  >
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
                      onEdit={handleEdit}
                      onValidate={(action) => {
                        if (action === 'edit') handleEdit(visual);
                        else if (action === 'video') handleOpenVideo(visual);
                        else if (action === 'ads') handleOpenADS(visual);
                      }}
                      onCropOpen={(v) => {
                        setCropVisual(v);
                        setShowCropModal(true);
                      }}
                      isRegenerating={false}
                      canDownload={true}
                      compact
                      hideInfoMessage={true}
                      showActions={false}
                      showValidation={false}
                      hideEditButton={false}
                    />
                    
                    {/* Action buttons below card */}
                    {!visual.video_url && !visual.image_url?.includes('.mp4') && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleEdit(visual)}
                          className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                          title={language === 'fr' ? 'Éditeur magique' : 'Magic editor'}
                        >
                          <Wand2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{language === 'fr' ? 'Éditer' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setVideoVisual(visual);
                            setShowVideoModal(true);
                          }}
                          className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-br from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                          title={language === 'fr' ? 'Créer vidéo' : 'Create video'}
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{language === 'fr' ? 'Vidéo' : 'Video'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setCropVisual(visual);
                            setShowCropModal(true);
                          }}
                          className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                          title={language === 'fr' ? 'Découper' : 'Crop'}
                        >
                          <Scissors className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{language === 'fr' ? 'Découpe' : 'Crop'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = [];
                      const showEllipsis = totalPages > 7;
                      
                      if (!showEllipsis) {
                        // Show all pages if 7 or less
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Always show first page
                        pages.push(1);
                        
                        if (currentPage > 3) {
                          pages.push('ellipsis-start');
                        }
                        
                        // Show pages around current page
                        const start = Math.max(2, currentPage - 1);
                        const end = Math.min(totalPages - 1, currentPage + 1);
                        
                        for (let i = start; i <= end; i++) {
                          if (!pages.includes(i)) {
                            pages.push(i);
                          }
                        }
                        
                        if (currentPage < totalPages - 2) {
                          pages.push('ellipsis-end');
                        }
                        
                        // Always show last page
                        if (!pages.includes(totalPages)) {
                          pages.push(totalPages);
                        }
                      }
                      
                      return pages.map((page, idx) => {
                        if (typeof page === 'string') {
                          return (
                            <span key={page} className="px-2 text-white/40">
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setCurrentPage(page);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={cn(
                              "min-w-[32px]",
                              currentPage === page 
                                ? "bg-violet-600 text-white hover:bg-violet-700" 
                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            )}
                          >
                            {page}
                          </Button>
                        );
                      });
                    })()}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Modals */}
          <VideoGenerationModal
            isOpen={showVideoModal}
            onClose={() => {
              setShowVideoModal(false);
              setVideoVisual(null);
            }}
            visual={videoVisual}
            onVideoGenerated={handleVideoGenerated}
          />

          <ADSModal
            isOpen={showADSModal}
            onClose={() => {
              setShowADSModal(false);
              setAdsVisual(null);
            }}
            visual={adsVisual}
          />

          <CropModal
            isOpen={showCropModal}
            onClose={() => {
              setShowCropModal(false);
              setCropVisual(null);
            }}
            visual={cropVisual}
            onCropComplete={handleCropComplete}
          />
        </div>
      )}
    </PageWrapper>
  );
}