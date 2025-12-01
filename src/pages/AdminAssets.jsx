import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Brush, ImagePlus, Save, Eye, Upload, Sparkles, Circle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from "@/lib/utils";

export default function AdminAssets() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [editingAsset, setEditingAsset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [newAsset, setNewAsset] = useState({
    type: 'texture',
    name_fr: '',
    name_en: '',
    prompt: '',
    preview_url: '',
    is_active: true,
    order: 0
  });

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }
        const allAssets = await base44.entities.EditorAsset.list();
        setAssets(allAssets);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingAsset) {
        await base44.entities.EditorAsset.update(editingAsset.id, newAsset);
        setAssets(prev => prev.map(a => a.id === editingAsset.id ? { ...a, ...newAsset } : a));
      } else {
        const created = await base44.entities.EditorAsset.create(newAsset);
        setAssets(prev => [...prev, created]);
      }
      setEditingAsset(null);
      setNewAsset({ type: 'texture', name_fr: '', name_en: '', prompt: '', preview_url: '', is_active: true, order: 0 });
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.EditorAsset.delete(id);
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setNewAsset({
      type: asset.type,
      name_fr: asset.name_fr || '',
      name_en: asset.name_en || '',
      prompt: asset.prompt || '',
      preview_url: asset.preview_url || '',
      is_active: asset.is_active !== false,
      order: asset.order || 0
    });
  };

  const handleGeneratePreview = async () => {
    if (!newAsset.prompt) return;
    setGenerating('preview');
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: newAsset.prompt + ', high quality, 512x512'
      });
      setNewAsset(prev => ({ ...prev, preview_url: result.url }));
    } catch (e) {
      console.error(e);
    }
    setGenerating(null);
  };

  const handleToggleActive = async (asset) => {
    await base44.entities.EditorAsset.update(asset.id, { is_active: !asset.is_active });
    setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, is_active: !a.is_active } : a));
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewAsset(prev => ({ ...prev, preview_url: file_url }));
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
    e.target.value = '';
  };

  const filteredAssets = assets.filter(a => filter === 'all' || a.type === filter);

  if (loading) {
    return (
      <AdminLayout currentPage="assets">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="assets">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Assets Éditeur</h1>
            <p className="text-white/60">Gérez les textures et illustrations de l'éditeur magique</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingAsset ? 'Modifier l\'asset' : 'Ajouter un asset'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block">Type</label>
              <Select value={newAsset.type} onValueChange={(v) => setNewAsset(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="texture">Texture</SelectItem>
                  <SelectItem value="illustration">Illustration</SelectItem>
                  <SelectItem value="gradient">Dégradé PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Ordre</label>
              <Input
                type="number"
                value={newAsset.order}
                onChange={(e) => setNewAsset(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Nom (FR)</label>
              <Input
                value={newAsset.name_fr}
                onChange={(e) => setNewAsset(prev => ({ ...prev, name_fr: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Marbre"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Nom (EN)</label>
              <Input
                value={newAsset.name_en}
                onChange={(e) => setNewAsset(prev => ({ ...prev, name_en: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Marble"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-white/60 text-sm mb-1 block flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Prompt IA <span className="text-white/40 font-normal">(utilisé pour générer l'asset à la demande dans l'éditeur)</span>
              </label>
              <Textarea
                value={newAsset.prompt}
                onChange={(e) => setNewAsset(prev => ({ ...prev, prompt: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
                placeholder="seamless marble texture, elegant white and gray veins..."
                rows={3}
              />
              <p className="text-white/30 text-xs mt-1">Ce prompt sera utilisé quand un utilisateur clique sur cet asset dans l'éditeur pour générer l'image via l'IA.</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-white/60 text-sm mb-1 block">Image (upload ou génération IA)</label>
              <div className="flex gap-3 flex-wrap">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm transition-colors">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Uploader une image
                  </div>
                </label>
                <span className="text-white/40 self-center">ou</span>
                <Button
                  onClick={handleGeneratePreview}
                  disabled={generating || !newAsset.prompt}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {generating === 'preview' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span className="ml-2">Générer via IA</span>
                </Button>
              </div>
              {newAsset.preview_url && (
                <div className="mt-3">
                  <img src={newAsset.preview_url} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                  <Input
                    value={newAsset.preview_url}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, preview_url: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white mt-2 text-xs"
                    placeholder="URL de l'image"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            {editingAsset && (
              <Button variant="ghost" onClick={() => { setEditingAsset(null); setNewAsset({ type: 'texture', name_fr: '', name_en: '', prompt: '', preview_url: '', is_active: true, order: 0 }); }} className="text-white/60">
                Annuler
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving || !newAsset.name_fr || (!newAsset.prompt && !newAsset.preview_url)} className="bg-gradient-to-r from-violet-600 to-blue-600">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {editingAsset ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button variant={filter === 'all' ? 'default' : 'ghost'} onClick={() => setFilter('all')} className={cn(filter === 'all' ? 'bg-violet-600' : 'text-white/60')}>
            Tous ({assets.length})
          </Button>
          <Button variant={filter === 'texture' ? 'default' : 'ghost'} onClick={() => setFilter('texture')} className={cn(filter === 'texture' ? 'bg-violet-600' : 'text-white/60')}>
            <Brush className="h-4 w-4 mr-1" />
            Textures ({assets.filter(a => a.type === 'texture').length})
          </Button>
          <Button variant={filter === 'illustration' ? 'default' : 'ghost'} onClick={() => setFilter('illustration')} className={cn(filter === 'illustration' ? 'bg-violet-600' : 'text-white/60')}>
            <ImagePlus className="h-4 w-4 mr-1" />
            Illustrations ({assets.filter(a => a.type === 'illustration').length})
          </Button>
          <Button variant={filter === 'gradient' ? 'default' : 'ghost'} onClick={() => setFilter('gradient')} className={cn(filter === 'gradient' ? 'bg-violet-600' : 'text-white/60')}>
            <Circle className="h-4 w-4 mr-1" style={{ background: 'linear-gradient(135deg, #f472b6, #a855f7, #3b82f6)', borderRadius: '50%' }} />
            Dégradés PRO ({assets.filter(a => a.type === 'gradient').length})
          </Button>
        </div>

        {/* List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={cn(
                "bg-white/5 border border-white/10 rounded-xl p-4 transition-all",
                !asset.is_active && "opacity-50"
              )}
            >
              <div className="flex gap-3">
                {asset.preview_url && (
                  <img src={asset.preview_url} alt={asset.name_fr} className="w-16 h-16 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {asset.type === 'texture' ? <Brush className="h-4 w-4 text-violet-400" /> : asset.type === 'gradient' ? <Circle className="h-4 w-4" style={{ background: 'linear-gradient(135deg, #f472b6, #a855f7, #3b82f6)', borderRadius: '50%' }} /> : <ImagePlus className="h-4 w-4 text-blue-400" />}
                    <h4 className="text-white font-medium">{asset.name_fr}</h4>
                  </div>
                  <p className="text-white/40 text-xs mb-2 line-clamp-2">{asset.prompt}</p>
                  <div className="flex items-center gap-2">
                    <Switch checked={asset.is_active} onCheckedChange={() => handleToggleActive(asset)} />
                    <span className="text-white/40 text-xs">{asset.is_active ? 'Actif' : 'Inactif'}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(asset)} className="text-white/60 hover:text-white">
                  Modifier
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(asset.id)} className="text-red-400/60 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}