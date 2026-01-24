import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Upload, Loader2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from '@/components/admin/AdminLayout';

const CATEGORIES = [
  { id: 'style', name: 'Style' },
  { id: 'color', name: 'Couleur / Color' },
  { id: 'texture', name: 'Texture' },
  { id: 'artistic', name: 'Artistique / Artistic' },
  { id: 'filter', name: 'Filtre / Filter' },
  { id: 'transform', name: 'Transformation / Transform' }
];

export default function AdminEffects() {
  const [effects, setEffects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEffect, setEditingEffect] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name_fr: '',
    name_en: '',
    category: 'style',
    prompt: '',
    thumbnail_url: '',
    is_active: true,
    order: 0
  });

  useEffect(() => {
    loadEffects();
  }, []);

  const loadEffects = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.EffectPreset.list('order');
      setEffects(data);
    } catch (e) {
      console.error('Failed to load effects:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, thumbnail_url: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingEffect) {
        await base44.entities.EffectPreset.update(editingEffect.id, formData);
      } else {
        await base44.entities.EffectPreset.create(formData);
      }
      loadEffects();
      handleCloseModal();
    } catch (e) {
      console.error('Save failed:', e);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet effet ?')) return;
    try {
      await base44.entities.EffectPreset.delete(id);
      loadEffects();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleOpenModal = (effect = null) => {
    if (effect) {
      setEditingEffect(effect);
      setFormData({
        name_fr: effect.name_fr || '',
        name_en: effect.name_en || '',
        category: effect.category || 'style',
        prompt: effect.prompt || '',
        thumbnail_url: effect.thumbnail_url || '',
        is_active: effect.is_active !== false,
        order: effect.order || 0
      });
    } else {
      setEditingEffect(null);
      setFormData({
        name_fr: '',
        name_en: '',
        category: 'style',
        prompt: '',
        thumbnail_url: '',
        is_active: true,
        order: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEffect(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Effets prédéfinis</h1>
            <p className="text-white/60 text-sm">Gérez les effets disponibles pour les utilisateurs</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel effet
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {effects.map((effect) => (
              <div key={effect.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {effect.thumbnail_url ? (
                  <img src={effect.thumbnail_url} alt={effect.name_fr} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-white/50" />
                  </div>
                )}
                
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{effect.name_fr}</h3>
                      {effect.name_en && <p className="text-white/60 text-sm">{effect.name_en}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenModal(effect)}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      >
                        <Pencil className="h-4 w-4 text-white/60" />
                      </button>
                      <button
                        onClick={() => handleDelete(effect.id)}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">
                      {CATEGORIES.find(c => c.id === effect.category)?.name || effect.category}
                    </span>
                    {!effect.is_active && (
                      <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-300 text-xs">
                        Inactif
                      </span>
                    )}
                  </div>
                  
                  <p className="text-white/60 text-xs line-clamp-2">{effect.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEffect ? 'Modifier l\'effet' : 'Nouvel effet'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-white/80 text-sm mb-2 block">Nom (FR) *</label>
                <Input
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                  placeholder="Vintage"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Nom (EN)</label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Vintage"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Catégorie *</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="text-white">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Prompt *</label>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="vintage photography style, warm tones, film grain, nostalgic mood"
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Miniature</label>
                <div className="flex items-center gap-3">
                  {formData.thumbnail_url && (
                    <img src={formData.thumbnail_url} alt="" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                  )}
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span className="text-sm">Choisir une image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadThumbnail}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label className="text-white/80 text-sm">Actif</label>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Ordre</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
                {editingEffect ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}