import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Edit, Trash2, Save, X, Wand2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminPrompts() {
  const [prompts, setPrompts] = useState([]);
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [editingExample, setEditingExample] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showExampleDialog, setShowExampleDialog] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [adsPrompt, setAdsPrompt] = useState('');
  const [savingAds, setSavingAds] = useState(false);

  const categories = [
    { value: 'logo_picto', label: 'Logo Pictogramme', mode: 'assisté' },
    { value: 'logo_complet', label: 'Logo Complet', mode: 'expert' },
    { value: 'print', label: 'Print', mode: 'modifiable' },
    { value: 'social', label: 'Réseaux sociaux', mode: 'modifiable' },
    { value: 'image', label: 'Image réaliste', mode: 'modifiable' }
  ];

  const exampleCategories = [
    { value: 'logo_picto', label: 'Logo Pictogramme' },
    { value: 'logo_complet', label: 'Logo Complet' },
    { value: 'print', label: 'Design Print' },
    { value: 'social', label: 'Réseaux sociaux' },
    { value: 'image', label: 'Image réaliste' },
    { value: 'mockup', label: 'Mockups' },
    { value: 'product', label: 'Produit' },
    { value: 'design_3d', label: 'Design 3D' },
    { value: 'textures', label: 'Textures' },
    { value: 'illustrations', label: 'Illustrations' },
    { value: 'icones_picto', label: 'Icônes Picto' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [promptData, exampleData, settings] = await Promise.all([
      base44.entities.PromptTemplate.list('order'),
      base44.entities.PromptExample.list(),
      base44.entities.AppSettings.list()
    ]);
    setPrompts(promptData);
    setExamples(exampleData);
    
    const adsSetting = settings.find(s => s.key === 'ads_base_prompt');
    setAdsPrompt(adsSetting?.value || '');
    
    setLoading(false);
  };

  const loadPrompts = async () => {
    const data = await base44.entities.PromptTemplate.list('order');
    setPrompts(data);
  };

  const handleCreate = () => {
    setEditingPrompt({
      category: 'logo_picto',
      subcategory: '',
      prompt_fr: '',
      prompt_en: '',
      description: '',
      is_active: true,
      order: 0
    });
    setShowDialog(true);
  };

  const handleEdit = (prompt) => {
    setEditingPrompt({ ...prompt });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (editingPrompt.id) {
      await base44.entities.PromptTemplate.update(editingPrompt.id, editingPrompt);
    } else {
      await base44.entities.PromptTemplate.create(editingPrompt);
    }
    await loadPrompts();
    setShowDialog(false);
    setEditingPrompt(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Confirmer la suppression ?')) {
      await base44.entities.PromptTemplate.delete(id);
      await loadPrompts();
    }
  };

  const handleSaveAdsPrompt = async () => {
    setSavingAds(true);
    const allSettings = await base44.entities.AppSettings.list();
    const existing = allSettings.find(s => s.key === 'ads_base_prompt');
    
    if (existing) {
      await base44.entities.AppSettings.update(existing.id, { value: adsPrompt });
    } else {
      await base44.entities.AppSettings.create({ key: 'ads_base_prompt', value: adsPrompt });
    }
    
    setSavingAds(false);
  };

  const handleCreateExample = () => {
    setEditingExample({
      category: 'logo_picto',
      example_text_fr: '',
      example_text_en: '',
      is_active: true
    });
    setShowExampleDialog(true);
  };

  const handleEditExample = (example) => {
    setEditingExample({ ...example });
    setShowExampleDialog(true);
  };

  const handleSaveExample = async () => {
    if (editingExample.id) {
      await base44.entities.PromptExample.update(editingExample.id, editingExample);
    } else {
      await base44.entities.PromptExample.create(editingExample);
    }
    await loadData();
    setShowExampleDialog(false);
    setEditingExample(null);
  };

  const handleDeleteExample = async (id) => {
    if (confirm('Confirmer la suppression ?')) {
      await base44.entities.PromptExample.delete(id);
      await loadData();
    }
  };

  const filteredPrompts = filterCategory === 'all' 
    ? prompts 
    : prompts.filter(p => p.category === filterCategory);

  if (loading) {
    return (
      <AdminLayout currentPage="prompts">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="prompts">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Prompts IA</h1>
            <p className="text-white/60">Gérez les prompts de génération par catégorie et le prompt de base pour les publicités</p>
          </div>
          <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau prompt
          </Button>
        </div>

        {/* ADS Base Prompt Section */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-600/20">
                <Wand2 className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Prompt de base - Créateur de Pub IA</h2>
                <p className="text-sm text-white/50">Instructions ajoutées automatiquement avant la demande utilisateur</p>
              </div>
            </div>
            <Button
              onClick={handleSaveAdsPrompt}
              disabled={savingAds}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {savingAds ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
          
          <Textarea
            value={adsPrompt}
            onChange={(e) => setAdsPrompt(e.target.value)}
            placeholder={`Create ULTRA MODERN professional advertising design with BOLD, CONTEMPORARY styling.

MODERN DESIGN PRINCIPLES:
1. TYPOGRAPHY: Use bold sans-serif fonts (Impact, Arial Black, Helvetica) with large sizes (80-140px titles)
2. COLORS: Vibrant gradients (neon, pastel, or bold contrasts), avoid plain colors
3. BACKGROUNDS: Full-width colored boxes with gradients, semi-transparent overlays (rgba 0.85-0.95)
4. EFFECTS: Strong shadows + thick strokes (5-8px) for maximum pop and readability
5. LAYOUT: Asymmetric, dynamic placement - use corners and edges, avoid center
6. SPACING: Generous padding (40-60px) in background boxes, leave breathing room
7. STYLE: Instagram/TikTok aesthetic - punchy, eye-catching, trendy

BACKGROUND BOX RULES:
- Must extend FULL WIDTH or near-full width of text
- Use backgroundPadding: 50-70 for generous spacing
- Prefer gradient backgrounds over solid colors
- Examples: "linear-gradient(135deg, rgba(255,20,147,0.95), rgba(138,43,226,0.95))"`}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-64 font-mono text-xs"
          />
          <p className="text-xs text-white/40 mt-2">
            Ce prompt définit le style et les règles de génération des publicités dans l'outil de création de pub.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prompts List */}
        <div className="grid gap-4">
          {filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-violet-600/20 text-violet-300 text-xs font-medium">
                      {categories.find(c => c.value === prompt.category)?.label || prompt.category}
                    </span>
                    {prompt.subcategory && (
                      <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 text-xs">
                        {prompt.subcategory}
                      </span>
                    )}
                    {/* Mode Badge */}
                    {prompt.category === 'logo_complet' && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full">
                        MODE EXPERT
                      </span>
                    )}
                    {prompt.category === 'logo_picto' && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500/60 to-cyan-500/60 text-white text-[10px] font-medium rounded-full">
                        MODE ASSISTÉ
                      </span>
                    )}
                    {!prompt.is_active && (
                      <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-300 text-xs">
                        Inactif
                      </span>
                    )}
                  </div>
                  {prompt.description && (
                    <p className="text-white/60 text-sm mb-3">{prompt.description}</p>
                  )}
                  <div className="space-y-2">
                    <div>
                      <span className="text-white/40 text-xs">FR:</span>
                      <p className="text-white text-sm mt-1 font-mono bg-black/20 p-3 rounded-lg">
                        {prompt.prompt_fr}
                      </p>
                    </div>
                    {prompt.prompt_en && (
                      <div>
                        <span className="text-white/40 text-xs">EN:</span>
                        <p className="text-white text-sm mt-1 font-mono bg-black/20 p-3 rounded-lg">
                          {prompt.prompt_en}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(prompt)}
                    className="text-white/60 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(prompt.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredPrompts.length === 0 && (
            <div className="text-center py-12 text-white/40">
              <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun prompt dans cette catégorie</p>
            </div>
          )}
        </div>

        {/* Prompt Examples Section */}
        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Exemples de prompts cliquables</h2>
              <p className="text-white/60">Suggestions affichées dans l'assistant iGPT par catégorie</p>
            </div>
            <Button onClick={handleCreateExample} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel exemple
            </Button>
          </div>

          <div className="grid gap-3">
            {examples.map((example) => (
              <div key={example.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 text-xs font-medium">
                        {exampleCategories.find(c => c.value === example.category)?.label || example.category}
                      </span>
                      {!example.is_active && (
                        <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-300 text-xs">
                          Inactif
                        </span>
                      )}
                    </div>
                    <p className="text-white text-sm mb-1">
                      <span className="text-white/40 text-xs">FR: </span>
                      {example.example_text_fr}
                    </p>
                    {example.example_text_en && (
                      <p className="text-white text-sm">
                        <span className="text-white/40 text-xs">EN: </span>
                        {example.example_text_en}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditExample(example)}
                      className="text-white/60 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExample(example.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {examples.length === 0 && (
              <div className="text-center py-12 text-white/40">
                <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun exemple configuré</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt?.id ? 'Modifier le prompt' : 'Nouveau prompt'}
            </DialogTitle>
          </DialogHeader>

          {editingPrompt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Catégorie *</label>
                  <Select
                    value={editingPrompt.category}
                    onValueChange={(value) => setEditingPrompt({ ...editingPrompt, category: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                          {cat.mode === 'expert' && ' 🎯'}
                          {cat.mode === 'assisté' && ' ✨'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editingPrompt.category === 'logo_complet' && (
                    <p className="text-orange-400 text-xs mt-1">🎯 Mode expert fixe - prompt non enrichi</p>
                  )}
                  {editingPrompt.category === 'logo_picto' && (
                    <p className="text-cyan-400 text-xs mt-1">✨ Mode assisté fixe - prompt enrichi par iGPT</p>
                  )}
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">Sous-catégorie</label>
                  <Input
                    value={editingPrompt.subcategory || ''}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, subcategory: e.target.value })}
                    placeholder="Ex: carte_visite, flyer..."
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Description</label>
                <Input
                  value={editingPrompt.description || ''}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, description: e.target.value })}
                  placeholder="Description du prompt"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">
                  Prompt FR * 
                  {(editingPrompt.category === 'logo_picto' || editingPrompt.category === 'logo_complet') && (
                    <span className="ml-2 text-yellow-400 text-xs">⚠️ Utilisez --no text --no letters --no words --no typography pour éviter les textes</span>
                  )}
                </label>
                <Textarea
                  value={editingPrompt.prompt_fr}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, prompt_fr: e.target.value })}
                  placeholder="Template de prompt en français"
                  className="bg-white/5 border-white/10 text-white font-mono text-sm min-h-24"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Prompt EN</label>
                <Textarea
                  value={editingPrompt.prompt_en || ''}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, prompt_en: e.target.value })}
                  placeholder="Template de prompt en anglais"
                  className="bg-white/5 border-white/10 text-white font-mono text-sm min-h-24"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPrompt.is_active}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-white/80 text-sm">Actif</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-white/60 text-sm">Ordre:</label>
                  <Input
                    type="number"
                    value={editingPrompt.order}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, order: parseInt(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white w-20"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Example Dialog */}
      <Dialog open={showExampleDialog} onOpenChange={setShowExampleDialog}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingExample?.id ? 'Modifier l\'exemple' : 'Nouvel exemple'}
            </DialogTitle>
          </DialogHeader>

          {editingExample && (
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Catégorie *</label>
                <Select
                  value={editingExample.category}
                  onValueChange={(value) => setEditingExample({ ...editingExample, category: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exampleCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Texte d'exemple FR *</label>
                <Textarea
                  value={editingExample.example_text_fr}
                  onChange={(e) => setEditingExample({ ...editingExample, example_text_fr: e.target.value })}
                  placeholder="Ex: pour un restaurant italien moderne avec une ambiance chaleureuse, tons orangés et dorés"
                  className="bg-white/5 border-white/10 text-white min-h-20"
                />
                <p className="text-xs text-white/40 mt-1">
                  Ce texte s'ajoutera au prompt de l'utilisateur s'il clique dessus
                </p>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Texte d'exemple EN</label>
                <Textarea
                  value={editingExample.example_text_en || ''}
                  onChange={(e) => setEditingExample({ ...editingExample, example_text_en: e.target.value })}
                  placeholder="Ex: for a modern Italian restaurant with a warm atmosphere, orange and gold tones"
                  className="bg-white/5 border-white/10 text-white min-h-20"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingExample.is_active}
                    onChange={(e) => setEditingExample({ ...editingExample, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-white/80 text-sm">Actif</span>
                </label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowExampleDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSaveExample} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}