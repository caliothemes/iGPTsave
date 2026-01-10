import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/LanguageContext';

export default function AdminFeatures() {
  const { language } = useLanguage();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title_fr: '',
    title_en: '',
    description_fr: '',
    description_en: '',
    icon: 'Sparkles',
    gradient: 'from-violet-600 to-purple-600',
    action_type: 'none',
    order: 0,
    is_active: true
  });

  const iconOptions = ['Sparkles', 'Pencil', 'Video', 'Upload', 'ShoppingBag', 'Image', 'Wand2', 'Palette', 'Zap'];
  const actionTypes = [
    { value: 'none', label: 'Aucune action' },
    { value: 'open_image_edit', label: 'Ouvrir exemples édition image' },
    { value: 'open_video_examples', label: 'Ouvrir exemples vidéo' },
    { value: 'link_to_store', label: 'Lien vers Store' }
  ];

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      const data = await base44.entities.FeatureCard.filter({ is_active: true }, 'order');
      setFeatures(data);
    } catch (e) {
      console.error('Failed to load features:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feature) => {
    setEditingId(feature.id);
    setFormData({
      title_fr: feature.title_fr || '',
      title_en: feature.title_en || '',
      description_fr: feature.description_fr || '',
      description_en: feature.description_en || '',
      icon: feature.icon || 'Sparkles',
      gradient: feature.gradient || 'from-violet-600 to-purple-600',
      action_type: feature.action_type || 'none',
      order: feature.order || 0,
      is_active: feature.is_active !== undefined ? feature.is_active : true
    });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await base44.entities.FeatureCard.update(editingId, formData);
      } else {
        await base44.entities.FeatureCard.create(formData);
      }
      setEditingId(null);
      setFormData({
        title_fr: '',
        title_en: '',
        description_fr: '',
        description_en: '',
        icon: 'Sparkles',
        gradient: 'from-violet-600 to-purple-600',
        action_type: 'none',
        order: 0,
        is_active: true
      });
      loadFeatures();
    } catch (e) {
      console.error('Failed to save feature:', e);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Confirmer la suppression ?')) return;
    try {
      await base44.entities.FeatureCard.delete(id);
      loadFeatures();
    } catch (e) {
      console.error('Failed to delete feature:', e);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title_fr: '',
      title_en: '',
      description_fr: '',
      description_en: '',
      icon: 'Sparkles',
      gradient: 'from-violet-600 to-purple-600',
      action_type: 'none',
      order: 0,
      is_active: true
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Chargement...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Carousel de fonctionnalités</h1>
          <p className="text-white/60 text-sm">Gérez les cartes affichées dans le carousel de la page d'accueil</p>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Modifier la carte' : 'Ajouter une carte'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Titre (FR)</label>
              <Input
                value={formData.title_fr}
                onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                placeholder="Text To Image"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Titre (EN)</label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="Text To Image"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="text-white/80 text-sm mb-2 block">Description (FR)</label>
              <Textarea
                value={formData.description_fr}
                onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                placeholder="Générez des images incroyables..."
                rows={3}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="text-white/80 text-sm mb-2 block">Description (EN)</label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Generate incredible images..."
                rows={3}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Icône</label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(icon => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Gradient</label>
              <Input
                value={formData.gradient}
                onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                placeholder="from-violet-600 to-purple-600"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Action au clic</label>
              <Select value={formData.action_type} onValueChange={(value) => setFormData({ ...formData, action_type: value })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map(action => (
                    <SelectItem key={action.value} value={action.value}>{action.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
              <Save className="h-4 w-4 mr-2" />
              {editingId ? 'Mettre à jour' : 'Créer'}
            </Button>
            {editingId && (
              <Button onClick={handleCancel} variant="outline" className="border-white/10 text-white hover:bg-white/10">
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold">{feature.title_fr}</h3>
                <p className="text-white/60 text-sm mt-1">{feature.description_fr}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-white/10 rounded text-white/70 text-xs">{feature.icon}</span>
                  <span className="px-2 py-1 bg-white/10 rounded text-white/70 text-xs">{feature.gradient}</span>
                  <span className="px-2 py-1 bg-white/10 rounded text-white/70 text-xs">Ordre: {feature.order}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(feature)} className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => handleDelete(feature.id)} className="bg-red-600 hover:bg-red-700">
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