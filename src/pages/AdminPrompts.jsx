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
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [
    { value: 'logo', label: 'Logo' },
    { value: 'print', label: 'Print' },
    { value: 'social', label: 'Réseaux sociaux' },
    { value: 'image', label: 'Image réaliste' }
  ];

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const data = await base44.entities.PromptTemplate.list('order');
    setPrompts(data);
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingPrompt({
      category: 'logo',
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
            <h1 className="text-3xl font-bold text-white mb-2">Templates de Prompts</h1>
            <p className="text-white/60">Gérez les prompts de génération par catégorie</p>
          </div>
          <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau prompt
          </Button>
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
                      {prompt.category}
                    </span>
                    {prompt.subcategory && (
                      <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 text-xs">
                        {prompt.subcategory}
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
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <label className="text-white/60 text-sm mb-2 block">Prompt FR *</label>
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
    </AdminLayout>
  );
}