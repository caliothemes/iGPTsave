import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Edit, Trash2, Save, X, HelpCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminSupport() {
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadFAQ();
  }, []);

  const loadFAQ = async () => {
    const data = await base44.entities.FAQItem.list('order');
    setFaqItems(data);
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingItem({
      question_fr: '',
      question_en: '',
      answer_fr: '',
      answer_en: '',
      is_active: true,
      order: 0
    });
    setShowDialog(true);
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (editingItem.id) {
      await base44.entities.FAQItem.update(editingItem.id, editingItem);
    } else {
      await base44.entities.FAQItem.create(editingItem);
    }
    await loadFAQ();
    setShowDialog(false);
    setEditingItem(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Confirmer la suppression ?')) {
      await base44.entities.FAQItem.delete(id);
      await loadFAQ();
    }
  };

  if (loading) {
    return (
      <AdminLayout currentPage="support">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="support">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Support & FAQ</h1>
            <p className="text-white/60">Gérez les questions fréquentes</p>
          </div>
          <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle question
          </Button>
        </div>

        <div className="grid gap-4">
          {faqItems.map((item) => (
            <div key={item.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-violet-600/20">
                      <HelpCircle className="h-5 w-5 text-violet-300" />
                    </div>
                    {!item.is_active && (
                      <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-300 text-xs">
                        Inactif
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-white/40 text-xs">Question FR:</span>
                      <p className="text-white font-medium mt-1">{item.question_fr}</p>
                    </div>
                    {item.question_en && (
                      <div>
                        <span className="text-white/40 text-xs">Question EN:</span>
                        <p className="text-white font-medium mt-1">{item.question_en}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-white/40 text-xs">Réponse FR:</span>
                      <p className="text-white/70 text-sm mt-1 whitespace-pre-wrap">{item.answer_fr}</p>
                    </div>
                    {item.answer_en && (
                      <div>
                        <span className="text-white/40 text-xs">Réponse EN:</span>
                        <p className="text-white/70 text-sm mt-1 whitespace-pre-wrap">{item.answer_en}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(item)}
                    className="text-white/60 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {faqItems.length === 0 && (
            <div className="text-center py-12 text-white/40">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune question FAQ configurée</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id ? 'Modifier la question' : 'Nouvelle question'}
            </DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Question FR *</label>
                <Input
                  value={editingItem.question_fr}
                  onChange={(e) => setEditingItem({ ...editingItem, question_fr: e.target.value })}
                  placeholder="Qu'est-ce que iGPT ?"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Question EN</label>
                <Input
                  value={editingItem.question_en || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, question_en: e.target.value })}
                  placeholder="What is iGPT?"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Réponse FR *</label>
                <Textarea
                  value={editingItem.answer_fr}
                  onChange={(e) => setEditingItem({ ...editingItem, answer_fr: e.target.value })}
                  placeholder="Réponse détaillée en français..."
                  className="bg-white/5 border-white/10 text-white min-h-32"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Réponse EN</label>
                <Textarea
                  value={editingItem.answer_en || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, answer_en: e.target.value })}
                  placeholder="Detailed answer in English..."
                  className="bg-white/5 border-white/10 text-white min-h-32"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_active}
                    onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-white/80 text-sm">Active</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-white/60 text-sm">Ordre:</label>
                  <Input
                    type="number"
                    value={editingItem.order}
                    onChange={(e) => setEditingItem({ ...editingItem, order: parseInt(e.target.value) })}
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