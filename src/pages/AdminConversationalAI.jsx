import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, MessageCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminConversationalAI() {
  const [qas, setQas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQA, setEditingQA] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    question_fr: '',
    answer_fr: '',
    question_en: '',
    answer_en: '',
    keywords: [],
    priority: 0,
    is_active: true
  });

  useEffect(() => {
    loadQAs();
  }, []);

  const loadQAs = async () => {
    try {
      const data = await base44.entities.ConversationalQA.list('-priority');
      setQas(data);
    } catch (e) {
      console.error('Failed to load Q&A:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (qa) => {
    setEditingQA(qa);
    setFormData({
      question_fr: qa.question_fr || '',
      answer_fr: qa.answer_fr || '',
      question_en: qa.question_en || '',
      answer_en: qa.answer_en || '',
      keywords: qa.keywords || [],
      priority: qa.priority || 0,
      is_active: qa.is_active
    });
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditingQA(null);
    setFormData({
      question_fr: '',
      answer_fr: '',
      question_en: '',
      answer_en: '',
      keywords: [],
      priority: 0,
      is_active: true
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingQA) {
        await base44.entities.ConversationalQA.update(editingQA.id, formData);
      } else {
        await base44.entities.ConversationalQA.create(formData);
      }
      await loadQAs();
      setModalOpen(false);
    } catch (e) {
      console.error('Failed to save:', e);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette Q&A ?')) return;
    try {
      await base44.entities.ConversationalQA.delete(id);
      await loadQAs();
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const handleToggleActive = async (qa) => {
    try {
      await base44.entities.ConversationalQA.update(qa.id, { is_active: !qa.is_active });
      await loadQAs();
    } catch (e) {
      console.error('Failed to toggle:', e);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-violet-400" />
              IA Conversationnel
            </h1>
            <p className="text-white/60 mt-1">
              Gérez les questions/réponses prédéfinies pour iGPT
            </p>
          </div>
          <Button
            onClick={handleNew}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Q&A
          </Button>
        </div>

        {/* Info Block */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-200 text-sm">
            💡 Ces questions/réponses seront automatiquement utilisées par iGPT dans ses conversations. 
            Ajoutez les questions fréquentes et leurs réponses exactes pour garantir la cohérence.
          </p>
        </div>

        {/* Q&A List */}
        <div className="space-y-3">
          {qas.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">Aucune Q&A définie</p>
              <Button
                onClick={handleNew}
                variant="outline"
                className="mt-4 bg-white/5 border-white/10 text-white"
              >
                Créer la première
              </Button>
            </div>
          ) : (
            qas.map((qa) => (
              <div
                key={qa.id}
                className={`bg-white/5 border ${qa.is_active ? 'border-white/10' : 'border-white/5 opacity-50'} rounded-xl p-4 hover:bg-white/10 transition-all`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Question FR */}
                    <div>
                      <p className="text-violet-400 text-xs font-medium mb-1">🇫🇷 Question</p>
                      <p className="text-white font-medium">{qa.question_fr}</p>
                    </div>
                    {/* Answer FR */}
                    <div>
                      <p className="text-emerald-400 text-xs font-medium mb-1">Réponse</p>
                      <p className="text-white/80 text-sm">{qa.answer_fr}</p>
                    </div>
                    {/* Question EN */}
                    {qa.question_en && (
                      <div>
                        <p className="text-violet-400 text-xs font-medium mb-1">🇬🇧 Question</p>
                        <p className="text-white/60 text-sm">{qa.question_en}</p>
                      </div>
                    )}
                    {/* Keywords */}
                    {qa.keywords && qa.keywords.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white/40 text-xs">Mots-clés:</p>
                        {qa.keywords.map((kw, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded text-xs">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Priority */}
                    {qa.priority > 0 && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-xs">
                        Priorité: {qa.priority}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleActive(qa)}
                      className={qa.is_active ? 'text-emerald-400' : 'text-white/40'}
                    >
                      {qa.is_active ? '✓ Actif' : '○ Inactif'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(qa)}
                      className="text-white/60 hover:text-white"
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(qa.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingQA ? 'Modifier la Q&A' : 'Nouvelle Q&A'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Question FR */}
            <div>
              <label className="text-white/80 text-sm mb-2 block">🇫🇷 Question (Français) *</label>
              <Input
                value={formData.question_fr}
                onChange={(e) => setFormData({ ...formData, question_fr: e.target.value })}
                placeholder="Ex: Combien coûte une vidéo ?"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* Answer FR */}
            <div>
              <label className="text-white/80 text-sm mb-2 block">Réponse (Français) *</label>
              <Textarea
                value={formData.answer_fr}
                onChange={(e) => setFormData({ ...formData, answer_fr: e.target.value })}
                placeholder="La réponse exacte à donner..."
                className="bg-white/10 border-white/20 text-white min-h-[120px]"
              />
            </div>

            {/* Question EN */}
            <div>
              <label className="text-white/80 text-sm mb-2 block">🇬🇧 Question (English)</label>
              <Input
                value={formData.question_en}
                onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
                placeholder="Ex: How much does a video cost?"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* Answer EN */}
            <div>
              <label className="text-white/80 text-sm mb-2 block">Answer (English)</label>
              <Textarea
                value={formData.answer_en}
                onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })}
                placeholder="The exact answer to give..."
                className="bg-white/10 border-white/20 text-white min-h-[120px]"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="text-white/80 text-sm mb-2 block">
                Mots-clés (séparés par des virgules)
              </label>
              <Input
                value={formData.keywords.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                })}
                placeholder="vidéo, prix, coût, tarif"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="text-white/80 text-sm mb-2 block">
                Priorité (0 = normale, plus élevé = plus important)
              </label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="bg-white/5 border-white/10 text-white"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.question_fr || !formData.answer_fr || saving}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}