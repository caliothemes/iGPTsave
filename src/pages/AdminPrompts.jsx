import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Edit, Trash2, Save, X, Wand2, Upload, Image as ImageIcon } from 'lucide-react';
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
  const [filterExampleCategory, setFilterExampleCategory] = useState('all');
  const [adsPrompt, setAdsPrompt] = useState('');
  const [savingAds, setSavingAds] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'logo_picto', label: 'Logo Pictogramme', mode: 'assisté' },
    { value: 'logo_complet', label: 'Logo Complet', mode: 'expert' },
    { value: 'print', label: 'Print', mode: 'modifiable' },
    { value: 'social', label: 'Posts, Story', mode: 'modifiable' },
    { value: 'pub_ads', label: 'Pub ADS', mode: 'modifiable' },
    { value: 'image', label: 'Image réaliste', mode: 'modifiable' },
    { value: 'mockup', label: 'Mockups', mode: 'modifiable' },
    { value: 'product', label: 'Produit', mode: 'modifiable' },
    { value: 'design_3d', label: 'Design Texte 3D', mode: 'modifiable' }
  ];

  const exampleCategories = [
    { value: 'logo_picto', label: 'Logo Pictogramme' },
    { value: 'logo_complet', label: 'Logo Complet' },
    { value: 'print', label: 'Design Print' },
    { value: 'social', label: 'Posts, Story' },
    { value: 'pub_ads', label: 'Pub ADS' },
    { value: 'image', label: 'Image réaliste' },
    { value: 'mockup', label: 'Mockups' },
    { value: 'product', label: 'Produit' },
    { value: 'design_3d', label: 'Design Texte 3D' },
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
      base44.entities.PromptExample.list('order'),
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
      image_url: '',
      order: 0,
      is_active: true
    });
    setShowExampleDialog(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditingExample({ ...editingExample, image_url: file_url });
    } catch (error) {
      console.error('Upload error:', error);
    }
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
                <h2 className="text-lg font-semibold text-white">Prompt arrière-plan - Catégorie Pub ADS</h2>
                <p className="text-sm text-white/50">Prompt utilisé pour générer le fond d'image des publicités (textes ajoutés après par l'IA)</p>
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
            placeholder="advertising background image for {userMessage}, professional ad backdrop, commercial photography style, clean and uncluttered background perfect for adding text overlays, marketing visual design, attention-grabbing composition, space for headlines and call-to-action, brand-oriented imagery --no text --no letters --no typography --no words --no writing"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-32 font-mono text-xs"
          />
          <p className="text-xs text-white/40 mt-2">
            Ce prompt génère le fond d'image sans texte. L'IA ajoutera ensuite automatiquement les textes publicitaires sous forme de calques éditables. Utilisez {"{userMessage}"} pour insérer le prompt utilisateur.
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

          {/* Filter for Examples */}
          <div className="flex items-center gap-4 mb-6">
            <Select value={filterExampleCategory} onValueChange={setFilterExampleCategory}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {exampleCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            {examples.filter(ex => filterExampleCategory === 'all' || ex.category === filterExampleCategory).map((example) => (
              <div key={example.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
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
                  {example.image_url && (
                    <div className="flex-shrink-0">
                      <img 
                        src={example.image_url} 
                        alt="Exemple" 
                        className="w-24 h-24 object-cover rounded-lg border border-white/10"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
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
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
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

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Texte Assistant iGPT
                </h3>
                <p className="text-white/40 text-xs mb-3">
                  Texte personnalisé affiché dans l'assistant pour cette catégorie. Si vide, le texte par défaut sera utilisé.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Texte Assistant FR</label>
                    <Textarea
                      value={editingPrompt.assistant_text_fr || ''}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, assistant_text_fr: e.target.value })}
                      placeholder="Pour des résultats optimaux, ajoutez un style (moderne, vintage...), des couleurs précises..."
                      className="bg-white/5 border-white/10 text-white text-sm min-h-20"
                    />
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Texte Assistant EN</label>
                    <Textarea
                      value={editingPrompt.assistant_text_en || ''}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, assistant_text_en: e.target.value })}
                      placeholder="For optimal results, add a style (modern, vintage...), precise colors..."
                      className="bg-white/5 border-white/10 text-white text-sm min-h-20"
                    />
                  </div>
                </div>
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

              <div>
                <label className="text-white/60 text-sm mb-2 block">Image thumbnail (optionnel)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {editingExample.image_url ? (
                  <div className="flex items-center gap-3">
                    <img 
                      src={editingExample.image_url} 
                      alt="Preview" 
                      className="w-24 h-24 object-cover rounded-lg border border-white/10"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Changer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingExample({ ...editingExample, image_url: '' })}
                        className="bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Ajouter une image
                  </Button>
                )}
                <p className="text-xs text-white/40 mt-2">
                  L'image s'affichera à droite du texte dans l'assistant. Sans image, le texte prend toute la largeur.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingExample.is_active}
                    onChange={(e) => setEditingExample({ ...editingExample, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-white/80 text-sm">Actif</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-white/60 text-sm">Ordre:</label>
                  <Input
                    type="number"
                    value={editingExample.order || 0}
                    onChange={(e) => setEditingExample({ ...editingExample, order: parseInt(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white w-20"
                  />
                </div>
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