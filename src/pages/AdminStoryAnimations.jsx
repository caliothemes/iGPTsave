import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Save, X, Wand2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminStoryAnimations() {
  const [animations, setAnimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'transition',
    css_animation: '',
    duration: 1,
    preview_url: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    loadAnimations();
  }, []);

  const loadAnimations = async () => {
    try {
      const data = await base44.entities.StoryAnimation.list('order');
      setAnimations(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.type) {
      toast.error('Nom et type requis');
      return;
    }

    try {
      await base44.entities.StoryAnimation.create(formData);
      toast.success('Animation créée');
      setShowCreateModal(false);
      setFormData({
        name: '',
        type: 'transition',
        css_animation: '',
        duration: 1,
        preview_url: '',
        thumbnail_url: ''
      });
      loadAnimations();
    } catch (e) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await base44.entities.StoryAnimation.update(id, updates);
      toast.success('Animation mise à jour');
      loadAnimations();
      setEditingId(null);
    } catch (e) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette animation ?')) return;
    try {
      await base44.entities.StoryAnimation.delete(id);
      toast.success('Animation supprimée');
      loadAnimations();
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <AdminLayout currentPage="story-animations">
        <div className="text-white">Chargement...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="story-animations">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Wand2 className="h-8 w-8 text-violet-400" />
              Story Animations
            </h1>
            <p className="text-white/60">Gérez les animations et transitions pour le Story Studio</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-violet-600 to-purple-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle animation
          </Button>
        </div>

        {/* Animations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animations.map(anim => (
            <div
              key={anim.id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{anim.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      anim.type === 'transition' && "bg-blue-500/20 text-blue-300",
                      anim.type === 'text' && "bg-pink-500/20 text-pink-300",
                      anim.type === 'image_effect' && "bg-purple-500/20 text-purple-300"
                    )}>
                      {anim.type}
                    </span>
                    <span className="text-white/40 text-xs">{anim.duration}s</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(anim.id)}
                    className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(anim.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>

              {anim.thumbnail_url && (
                <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
                  <img src={anim.thumbnail_url} alt={anim.name} className="w-full h-32 object-cover" />
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <p className="text-white/40 text-xs">Animation CSS:</p>
                  <code className="text-violet-300 text-xs bg-black/30 px-2 py-1 rounded">
                    {anim.css_animation || 'N/A'}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>

        {animations.length === 0 && (
          <div className="text-center py-20">
            <Wand2 className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-lg">Aucune animation créée</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Nouvelle animation</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Nom</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Slide Left"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                >
                  <option value="transition">Transition</option>
                  <option value="text">Texte</option>
                  <option value="image_effect">Effet Image</option>
                </select>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Animation CSS</label>
                <Input
                  value={formData.css_animation}
                  onChange={(e) => setFormData({ ...formData, css_animation: e.target.value })}
                  placeholder="slide-left, fade-in, zoom-out..."
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Durée (secondes)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">URL Thumbnail</label>
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/20 text-white"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreate}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Créer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}