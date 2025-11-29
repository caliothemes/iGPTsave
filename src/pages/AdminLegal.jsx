import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, GripVertical, Save, Scale, Shield, FileText, Mail, Building, Server, CreditCard, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from "@/lib/utils";

const ICONS = [
  { name: 'FileText', label: 'Document' },
  { name: 'Shield', label: 'Bouclier' },
  { name: 'Scale', label: 'Balance' },
  { name: 'Mail', label: 'Email' },
  { name: 'Building', label: 'Bâtiment' },
  { name: 'Server', label: 'Serveur' },
  { name: 'CreditCard', label: 'Paiement' },
  { name: 'AlertCircle', label: 'Alerte' },
];

const iconMap = { Scale, Shield, FileText, Mail, Building, Server, CreditCard, AlertCircle };

export default function AdminLegal() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }
        const data = await base44.entities.LegalSection.list('order');
        setSections(data);
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
      setLoading(false);
    };
    init();
  }, []);

  const addSection = () => {
    setSections(prev => [...prev, {
      id: `new_${Date.now()}`,
      title_fr: '',
      title_en: '',
      content_fr: '',
      content_en: '',
      icon: 'FileText',
      order: prev.length,
      isNew: true
    }]);
  };

  const updateSection = (index, field, value) => {
    setSections(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const deleteSection = async (index) => {
    const section = sections[index];
    if (!section.isNew && section.id) {
      await base44.entities.LegalSection.delete(section.id);
    }
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  const moveSection = (index, direction) => {
    const newSections = [...sections];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setSections(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const handleSave = async () => {
    setSaving(true);
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const data = {
        title_fr: section.title_fr,
        title_en: section.title_en,
        content_fr: section.content_fr,
        content_en: section.content_en,
        icon: section.icon,
        order: i
      };
      if (section.isNew) {
        await base44.entities.LegalSection.create(data);
      } else {
        await base44.entities.LegalSection.update(section.id, data);
      }
    }
    const data = await base44.entities.LegalSection.list('order');
    setSections(data);
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout currentPage="legal">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="legal">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Mentions légales</h1>
            <p className="text-white/60">Gérez les sections des mentions légales</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={addSection} variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-violet-600 to-blue-600">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Sauvegarder
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => {
            const Icon = iconMap[section.icon] || FileText;
            return (
              <div key={section.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex flex-col gap-1 pt-2">
                    <button onClick={() => moveSection(index, -1)} disabled={index === 0} className="p-1 text-white/30 hover:text-white disabled:opacity-30">▲</button>
                    <GripVertical className="h-4 w-4 text-white/30" />
                    <button onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="p-1 text-white/30 hover:text-white disabled:opacity-30">▼</button>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-4">
                      <Select value={section.icon} onValueChange={(v) => updateSection(index, 'icon', v)}>
                        <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {ICONS.map(icon => {
                            const IconComp = iconMap[icon.name];
                            return (
                              <SelectItem key={icon.name} value={icon.name}>
                                <div className="flex items-center gap-2">
                                  <IconComp className="h-4 w-4" />
                                  {icon.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <Input
                        value={section.title_fr}
                        onChange={(e) => updateSection(index, 'title_fr', e.target.value)}
                        placeholder="Titre (FR)"
                        className="flex-1 bg-white/5 border-white/10 text-white"
                      />
                      <Input
                        value={section.title_en}
                        onChange={(e) => updateSection(index, 'title_en', e.target.value)}
                        placeholder="Title (EN)"
                        className="flex-1 bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Textarea
                        value={section.content_fr}
                        onChange={(e) => updateSection(index, 'content_fr', e.target.value)}
                        placeholder="Contenu (FR)"
                        className="bg-white/5 border-white/10 text-white min-h-24"
                      />
                      <Textarea
                        value={section.content_en}
                        onChange={(e) => updateSection(index, 'content_en', e.target.value)}
                        placeholder="Content (EN)"
                        className="bg-white/5 border-white/10 text-white min-h-24"
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteSection(index)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {sections.length === 0 && (
            <div className="text-center py-12 text-white/40">
              Aucune section. Cliquez sur "Ajouter" pour créer une section.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}