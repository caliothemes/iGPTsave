import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, Send, Eye, Edit, Trash2, Mail, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { createPageUrl } from '@/utils';

export default function AdminNewsletters() {
  const [newsletters, setNewsletters] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [sending, setSending] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    template_id: '',
    subject: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [newslettersData, templatesData, usersData] = await Promise.all([
        base44.entities.Newsletter.filter({}, '-created_date'),
        base44.entities.NewsletterTemplate.filter({ is_active: true }),
        base44.entities.User.list()
      ]);
      setNewsletters(newslettersData);
      setTemplates(templatesData);
      setUsers(usersData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const generateNewsletterContent = async (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return '';

    // Get latest visuals from each category
    const categories = await base44.entities.StoreCategory.filter({ is_active: true }, 'order');
    const storeItems = await base44.entities.StoreItem.filter({ is_active: true }, '-created_date');

    let visualsByCategory = {};
    categories.forEach(cat => {
      // Exclure les catégories vidéo
      if (cat.slug && cat.slug.toLowerCase().includes('video')) return;
      
      const categoryItems = storeItems
        .filter(item => {
          // Exclure les items avec vidéo
          if (item.video_url || (item.image_url && (item.image_url.includes('.mp4') || item.image_url.includes('/video')))) {
            return false;
          }
          return item.category_slugs && item.category_slugs.includes(cat.slug);
        })
        .slice(0, 4); // 4 items (2x2)
      if (categoryItems.length > 0) {
        visualsByCategory[cat.slug] = {
          name: cat.name_fr,
          items: categoryItems
        };
      }
    });

    // Replace placeholders in template
    let html = template.html_content;
    html = html.replace('{{DATE}}', new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));

    // Build visuals sections
    let visualsHtml = '';
    Object.values(visualsByCategory).forEach(category => {
      visualsHtml += `
        <div style="margin-bottom: 40px;">
          <h2 style="text-align: center; font-size: 32px; margin-bottom: 30px; font-weight: bold; background: linear-gradient(to right, #a78bfa, #f0abfc, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #a78bfa;">${category.name}</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${category.items.slice(0, 2).map(item => `
                <td width="50%" style="padding: 10px;" valign="top">
                  <div style="background: #1f2937; border-radius: 12px; overflow: hidden; border: 1px solid #374151;">
                    <img src="${item.image_url}" alt="${item.title}" style="width: 100%; height: 250px; object-fit: cover; display: block;" />
                    <div style="padding: 15px;">
                      <h3 style="color: #fff; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">${item.title}</h3>
                      <div style="display: flex; align-items: center; gap: 5px;">
                        <span style="color: #fbbf24; font-size: 16px; font-weight: bold;">${item.price_credits}</span>
                        <span style="color: #9ca3af; font-size: 12px;">crédits</span>
                      </div>
                    </div>
                  </div>
                </td>
              `).join('')}
            </tr>
            ${category.items.length > 2 ? `
            <tr>
              ${category.items.slice(2, 4).map(item => `
                <td width="50%" style="padding: 10px;" valign="top">
                  <div style="background: #1f2937; border-radius: 12px; overflow: hidden; border: 1px solid #374151;">
                    <img src="${item.image_url}" alt="${item.title}" style="width: 100%; height: 250px; object-fit: cover; display: block;" />
                    <div style="padding: 15px;">
                      <h3 style="color: #fff; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">${item.title}</h3>
                      <div style="display: flex; align-items: center; gap: 5px;">
                        <span style="color: #fbbf24; font-size: 16px; font-weight: bold;">${item.price_credits}</span>
                        <span style="color: #9ca3af; font-size: 12px;">crédits</span>
                      </div>
                    </div>
                  </div>
                </td>
              `).join('')}
            </tr>
            ` : ''}
          </table>
        </div>
      `;
    });

    html = html.replace('{{VISUALS_CONTENT}}', visualsHtml);
    return html;
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.template_id || !formData.subject) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      const htmlContent = await generateNewsletterContent(formData.template_id);
      const user = await base44.auth.me();
      
      const newsletter = await base44.entities.Newsletter.create({
        ...formData,
        html_content: htmlContent,
        created_by: user.email,
        recipients_count: users.length
      });

      setNewsletters(prev => [newsletter, ...prev]);
      setShowCreateModal(false);
      setFormData({ title: '', template_id: '', subject: '' });
      toast.success('Newsletter créée avec succès');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la création');
    }
  };

  const handlePreview = async (newsletter) => {
    setSelectedNewsletter(newsletter);
    setPreviewHtml(newsletter.html_content);
    setShowPreviewModal(true);
  };

  const handleSend = async (newsletter) => {
    if (!confirm(`Envoyer cette newsletter à ${users.length} abonnés ?`)) return;

    setSending(true);
    try {
      const response = await base44.functions.invoke('sendNewsletter', {
        newsletterId: newsletter.id,
        subject: newsletter.subject,
        htmlContent: newsletter.html_content
      });

      if (response.data.success) {
        await base44.entities.Newsletter.update(newsletter.id, {
          status: 'sent',
          sent_date: new Date().toISOString()
        });
        toast.success(`Newsletter envoyée à ${response.data.sent} destinataires`);
        loadData();
      } else {
        toast.error('Erreur lors de l\'envoi');
      }
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de l\'envoi');
    }
    setSending(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette newsletter ?')) return;
    try {
      await base44.entities.Newsletter.delete(id);
      setNewsletters(prev => prev.filter(n => n.id !== id));
      toast.success('Newsletter supprimée');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <AdminLayout currentPage="newsletters">
        <div className="text-white">Chargement...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="newsletters">
      <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">📧 Newsletters</h1>
              <p className="text-white/60">Créez et envoyez des newsletters à vos abonnés</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.href = createPageUrl('AdminNewsletterTemplates')}
                variant="outline"
                className="bg-white/5 text-white border-white/20"
              >
                <Edit className="h-4 w-4 mr-2" />
                Gérer les templates
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-violet-600 to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle newsletter
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total newsletters</p>
                  <p className="text-white text-2xl font-bold">{newsletters.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Send className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Envoyées</p>
                  <p className="text-white text-2xl font-bold">
                    {newsletters.filter(n => n.status === 'sent').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-violet-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Abonnés</p>
                  <p className="text-white text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletters List */}
          <div className="space-y-4">
            {newsletters.map(newsletter => (
              <div
                key={newsletter.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white text-lg font-bold">{newsletter.title}</h3>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        newsletter.status === 'sent' 
                          ? "bg-green-500/20 text-green-300"
                          : newsletter.status === 'scheduled'
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-gray-500/20 text-gray-300"
                      )}>
                        {newsletter.status === 'sent' ? 'Envoyée' : newsletter.status === 'scheduled' ? 'Programmée' : 'Brouillon'}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mb-2">📧 {newsletter.subject}</p>
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {newsletter.recipients_count} destinataires
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(newsletter.created_date).toLocaleDateString('fr-FR')}
                      </span>
                      {newsletter.sent_date && (
                        <span className="text-green-400">
                          Envoyée le {new Date(newsletter.sent_date).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(newsletter)}
                      className="bg-white/5 text-white border-white/20"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {newsletter.status !== 'sent' && (
                      <Button
                        size="sm"
                        onClick={() => handleSend(newsletter)}
                        disabled={sending}
                        className="bg-gradient-to-r from-green-600 to-emerald-600"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(newsletter.id)}
                      className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle newsletter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Titre</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Newsletter de janvier 2024"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Sujet de l'email</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="🎨 Découvrez les nouveautés iGPT Store"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Template</label>
              <Select value={formData.template_id} onValueChange={(v) => setFormData({ ...formData, template_id: v })}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Choisir un template" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-white">
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} className="w-full bg-gradient-to-r from-violet-600 to-purple-600">
              Créer la newsletter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Aperçu de la newsletter</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh] bg-white rounded-lg">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-[600px] border-0"
              title="Newsletter Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}