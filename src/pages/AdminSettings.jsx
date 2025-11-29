import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Globe, FileText, Layout, MessageSquare } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from "@/lib/utils";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allSettings, setAllSettings] = useState([]);
  const [settings, setSettings] = useState({
    home_title_fr: '',
    home_title_en: '',
    home_subtitle_fr: '',
    home_subtitle_en: '',
    sidebar_title: '',
    legal_content_fr: '',
    legal_content_en: '',
    welcome_message_fr: '',
    welcome_message_en: '',
    guest_message_fr: '',
    guest_message_en: ''
  });

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }

        const fetchedSettings = await base44.entities.AppSettings.list();
        setAllSettings(fetchedSettings);

        const settingsMap = {};
        fetchedSettings.forEach(s => {
          settingsMap[s.key] = s.value;
        });

        setSettings(prev => ({
          ...prev,
          ...settingsMap
        }));
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    
    for (const [key, value] of Object.entries(settings)) {
      const existing = allSettings.find(s => s.key === key);
      if (existing) {
        await base44.entities.AppSettings.update(existing.id, { value: value || '' });
      } else if (value) {
        await base44.entities.AppSettings.create({ key, value });
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout currentPage="settings">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="settings">
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
            <p className="text-white/60">Configurez votre application</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>

        {/* Sidebar Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-600/20">
              <Layout className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Sidebar</h2>
              <p className="text-sm text-white/50">Personnalisez le titre de la sidebar</p>
            </div>
          </div>
          <Input
            value={settings.sidebar_title}
            onChange={(e) => setSettings(prev => ({ ...prev, sidebar_title: e.target.value }))}
            placeholder="iGPT 1.0.1 beta"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>

        {/* Welcome Messages */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-600/20">
              <MessageSquare className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Message d'accueil</h2>
              <p className="text-sm text-white/50">Premier message affiché dans le chat</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Utilisateur connecté (Français)</label>
                <Textarea
                  value={settings.welcome_message_fr}
                  onChange={(e) => setSettings(prev => ({ ...prev, welcome_message_fr: e.target.value }))}
                  placeholder="Bonjour {name} ! 👋&#10;&#10;Je suis **iGPT**. Décrivez-moi le visuel..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-24"
                />
                <p className="text-xs text-white/40 mt-1">Utilisez {'{name}'} pour le nom de l'utilisateur</p>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Logged in user (English)</label>
                <Textarea
                  value={settings.welcome_message_en}
                  onChange={(e) => setSettings(prev => ({ ...prev, welcome_message_en: e.target.value }))}
                  placeholder="Hello {name}! 👋&#10;&#10;I'm **iGPT**. Describe the visual..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-24"
                />
                <p className="text-xs text-white/40 mt-1">Use {'{name}'} for the user's name</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Visiteur non connecté (Français)</label>
                <Textarea
                  value={settings.guest_message_fr}
                  onChange={(e) => setSettings(prev => ({ ...prev, guest_message_fr: e.target.value }))}
                  placeholder="Bienvenue sur **iGPT** ! 👋&#10;&#10;Décrivez-moi ce que vous souhaitez créer..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-24"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Guest visitor (English)</label>
                <Textarea
                  value={settings.guest_message_en}
                  onChange={(e) => setSettings(prev => ({ ...prev, guest_message_en: e.target.value }))}
                  placeholder="Welcome to **iGPT**! 👋&#10;&#10;Describe what you want to create..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-24"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Home Page Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-600/20">
              <Globe className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Page d'accueil</h2>
              <p className="text-sm text-white/50">Personnalisez le titre et sous-titre</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Titre (Français)</label>
                <Input
                  value={settings.home_title_fr}
                  onChange={(e) => setSettings(prev => ({ ...prev, home_title_fr: e.target.value }))}
                  placeholder="Votre assistant IA..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Titre (English)</label>
                <Input
                  value={settings.home_title_en}
                  onChange={(e) => setSettings(prev => ({ ...prev, home_title_en: e.target.value }))}
                  placeholder="Your AI assistant..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Sous-titre (Français)</label>
                <Input
                  value={settings.home_subtitle_fr}
                  onChange={(e) => setSettings(prev => ({ ...prev, home_subtitle_fr: e.target.value }))}
                  placeholder="Logos, cartes de visite..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Sous-titre (English)</label>
                <Input
                  value={settings.home_subtitle_en}
                  onChange={(e) => setSettings(prev => ({ ...prev, home_subtitle_en: e.target.value }))}
                  placeholder="Logos, business cards..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Legal Content Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-600/20">
              <FileText className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Mentions légales</h2>
              <p className="text-sm text-white/50">Contenu personnalisé des mentions légales</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Contenu (Français)</label>
              <Textarea
                value={settings.legal_content_fr}
                onChange={(e) => setSettings(prev => ({ ...prev, legal_content_fr: e.target.value }))}
                placeholder="Contenu des mentions légales en français..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-32"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Content (English)</label>
              <Textarea
                value={settings.legal_content_en}
                onChange={(e) => setSettings(prev => ({ ...prev, legal_content_en: e.target.value }))}
                placeholder="Legal notice content in English..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-32"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}