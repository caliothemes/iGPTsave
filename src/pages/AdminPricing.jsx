import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2, Save, CreditCard, Crown, Sparkles, Star, Zap } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from "@/lib/utils";

const ICONS = [
  { id: 'Sparkles', icon: Sparkles },
  { id: 'Crown', icon: Crown },
  { id: 'Star', icon: Star },
  { id: 'Zap', icon: Zap },
  { id: 'CreditCard', icon: CreditCard },
];

export default function AdminPricing() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [packs, setPacks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingPack, setEditingPack] = useState(null);

  const [newPlan, setNewPlan] = useState({
    plan_id: '',
    name_fr: '',
    name_en: '',
    price_monthly: 0,
    price_yearly: 0,
    messages_per_month: 0,
    features_fr: [],
    features_en: [],
    icon: 'Sparkles',
    gradient: 'from-violet-600 to-blue-600',
    is_popular: false,
    is_active: true,
    order: 0
  });

  const [newPack, setNewPack] = useState({
    pack_id: '',
    credits: 0,
    price: 0,
    bonus_credits: 0,
    is_popular: false,
    is_active: true,
    order: 0
  });

  const [featuresText, setFeaturesText] = useState({ fr: '', en: '' });

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }
        const [allPlans, allPacks] = await Promise.all([
          base44.entities.SubscriptionPlan.list(),
          base44.entities.CreditPack.list()
        ]);
        setPlans(allPlans.sort((a, b) => (a.order || 0) - (b.order || 0)));
        setPacks(allPacks.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSavePlan = async () => {
    setSaving(true);
    try {
      const planData = {
        ...newPlan,
        features_fr: featuresText.fr.split('\n').filter(f => f.trim()),
        features_en: featuresText.en.split('\n').filter(f => f.trim())
      };
      if (editingPlan) {
        await base44.entities.SubscriptionPlan.update(editingPlan.id, planData);
        setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...planData } : p));
      } else {
        const created = await base44.entities.SubscriptionPlan.create(planData);
        setPlans(prev => [...prev, created]);
      }
      resetPlanForm();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleSavePack = async () => {
    setSaving(true);
    try {
      if (editingPack) {
        await base44.entities.CreditPack.update(editingPack.id, newPack);
        setPacks(prev => prev.map(p => p.id === editingPack.id ? { ...p, ...newPack } : p));
      } else {
        const created = await base44.entities.CreditPack.create(newPack);
        setPacks(prev => [...prev, created]);
      }
      resetPackForm();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const resetPlanForm = () => {
    setEditingPlan(null);
    setNewPlan({ plan_id: '', name_fr: '', name_en: '', price_monthly: 0, price_yearly: 0, messages_per_month: 0, features_fr: [], features_en: [], icon: 'Sparkles', gradient: 'from-violet-600 to-blue-600', is_popular: false, is_active: true, order: 0 });
    setFeaturesText({ fr: '', en: '' });
  };

  const resetPackForm = () => {
    setEditingPack(null);
    setNewPack({ pack_id: '', credits: 0, price: 0, bonus_credits: 0, is_popular: false, is_active: true, order: 0 });
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setNewPlan({
      plan_id: plan.plan_id || '',
      name_fr: plan.name_fr || '',
      name_en: plan.name_en || '',
      price_monthly: plan.price_monthly || 0,
      price_yearly: plan.price_yearly || 0,
      messages_per_month: plan.messages_per_month || 0,
      icon: plan.icon || 'Sparkles',
      gradient: plan.gradient || 'from-violet-600 to-blue-600',
      is_popular: plan.is_popular || false,
      is_active: plan.is_active !== false,
      order: plan.order || 0
    });
    setFeaturesText({
      fr: (plan.features_fr || []).join('\n'),
      en: (plan.features_en || []).join('\n')
    });
  };

  const handleEditPack = (pack) => {
    setEditingPack(pack);
    setNewPack({
      pack_id: pack.pack_id || '',
      credits: pack.credits || 0,
      price: pack.price || 0,
      bonus_credits: pack.bonus_credits || 0,
      is_popular: pack.is_popular || false,
      is_active: pack.is_active !== false,
      order: pack.order || 0
    });
  };

  const handleDeletePlan = async (id) => {
    await base44.entities.SubscriptionPlan.delete(id);
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const handleDeletePack = async (id) => {
    await base44.entities.CreditPack.delete(id);
    setPacks(prev => prev.filter(p => p.id !== id));
  };

  if (loading) {
    return (
      <AdminLayout currentPage="pricing">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="pricing">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tarification</h1>
          <p className="text-white/60">Gérez les abonnements et packs de crédits</p>
        </div>

        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="bg-white/10 border-white/10">
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-violet-600">
              <Crown className="h-4 w-4 mr-2" />
              Abonnements ({plans.length})
            </TabsTrigger>
            <TabsTrigger value="credits" className="data-[state=active]:bg-violet-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Packs de crédits ({packs.length})
            </TabsTrigger>
          </TabsList>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6 mt-6">
            {/* Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingPlan ? 'Modifier l\'abonnement' : 'Ajouter un abonnement'}
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-1 block">ID unique</label>
                  <Input value={newPlan.plan_id} onChange={(e) => setNewPlan(prev => ({ ...prev, plan_id: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white" placeholder="pro, unlimited..." />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Nom (FR)</label>
                  <Input value={newPlan.name_fr} onChange={(e) => setNewPlan(prev => ({ ...prev, name_fr: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white" placeholder="Pro" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Nom (EN)</label>
                  <Input value={newPlan.name_en} onChange={(e) => setNewPlan(prev => ({ ...prev, name_en: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white" placeholder="Pro" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Prix mensuel (€)</label>
                  <Input type="number" value={newPlan.price_monthly} onChange={(e) => setNewPlan(prev => ({ ...prev, price_monthly: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Prix annuel (€) <span className="text-white/40">2 mois gratuits</span></label>
                  <Input type="number" value={newPlan.price_yearly} onChange={(e) => setNewPlan(prev => ({ ...prev, price_yearly: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white" placeholder={`${(newPlan.price_monthly * 10).toFixed(2)}`} />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Messages/mois <span className="text-white/40">(-1 = illimité)</span></label>
                  <Input type="number" value={newPlan.messages_per_month} onChange={(e) => setNewPlan(prev => ({ ...prev, messages_per_month: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Ordre</label>
                  <Input type="number" value={newPlan.order} onChange={(e) => setNewPlan(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Icône</label>
                  <div className="flex gap-2">
                    {ICONS.map(({ id, icon: Icon }) => (
                      <button key={id} onClick={() => setNewPlan(prev => ({ ...prev, icon: id }))}
                        className={cn("p-2 rounded-lg transition-colors", newPlan.icon === id ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/60 hover:bg-white/10")}>
                        <Icon className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={newPlan.is_popular} onCheckedChange={(v) => setNewPlan(prev => ({ ...prev, is_popular: v }))} />
                    <span className="text-white/60 text-sm">Populaire</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={newPlan.is_active} onCheckedChange={(v) => setNewPlan(prev => ({ ...prev, is_active: v }))} />
                    <span className="text-white/60 text-sm">Actif</span>
                  </div>
                </div>
                <div className="md:col-span-3 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Fonctionnalités (FR) - une par ligne</label>
                    <Textarea value={featuresText.fr} onChange={(e) => setFeaturesText(prev => ({ ...prev, fr: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white" rows={4} placeholder="100 messages/mois&#10;Support prioritaire&#10;..." />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Fonctionnalités (EN) - une par ligne</label>
                    <Textarea value={featuresText.en} onChange={(e) => setFeaturesText(prev => ({ ...prev, en: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white" rows={4} placeholder="100 messages/month&#10;Priority support&#10;..." />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                {editingPlan && <Button variant="ghost" onClick={resetPlanForm} className="text-white/60">Annuler</Button>}
                <Button onClick={handleSavePlan} disabled={saving || !newPlan.plan_id || !newPlan.name_fr} className="bg-gradient-to-r from-violet-600 to-blue-600">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {editingPlan ? 'Mettre à jour' : 'Ajouter'}
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const IconComp = ICONS.find(i => i.id === plan.icon)?.icon || Sparkles;
                return (
                  <div key={plan.id} className={cn("bg-white/5 border border-white/10 rounded-xl p-4", !plan.is_active && "opacity-50")}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("p-2 rounded-lg bg-gradient-to-r", plan.gradient || "from-violet-600 to-blue-600")}>
                        <IconComp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{plan.name_fr}</h4>
                        {plan.is_popular && <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Populaire</span>}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-white/60 mb-4">
                      <p>Mensuel: <span className="text-white">{plan.price_monthly}€</span></p>
                      <p>Annuel: <span className="text-white">{plan.price_yearly}€</span></p>
                      <p>Messages: <span className="text-white">{plan.messages_per_month === -1 ? 'Illimité' : plan.messages_per_month}</span></p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEditPlan(plan)} className="text-white/60 hover:text-white">Modifier</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeletePlan(plan.id)} className="text-red-400/60 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits" className="space-y-6 mt-6">
            {/* Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingPack ? 'Modifier le pack' : 'Ajouter un pack de crédits'}
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-1 block">ID unique</label>
                  <Input value={newPack.pack_id} onChange={(e) => setNewPack(prev => ({ ...prev, pack_id: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white" placeholder="pack_50, pack_100..." />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Crédits/Messages</label>
                  <Input type="number" value={newPack.credits} onChange={(e) => setNewPack(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Bonus (offerts)</label>
                  <Input type="number" value={newPack.bonus_credits} onChange={(e) => setNewPack(prev => ({ ...prev, bonus_credits: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Prix (€)</label>
                  <Input type="number" step="0.01" value={newPack.price} onChange={(e) => setNewPack(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Ordre</label>
                  <Input type="number" value={newPack.order} onChange={(e) => setNewPack(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={newPack.is_popular} onCheckedChange={(v) => setNewPack(prev => ({ ...prev, is_popular: v }))} />
                    <span className="text-white/60 text-sm">Populaire</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={newPack.is_active} onCheckedChange={(v) => setNewPack(prev => ({ ...prev, is_active: v }))} />
                    <span className="text-white/60 text-sm">Actif</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                {editingPack && <Button variant="ghost" onClick={resetPackForm} className="text-white/60">Annuler</Button>}
                <Button onClick={handleSavePack} disabled={saving || !newPack.pack_id || !newPack.credits} className="bg-gradient-to-r from-violet-600 to-blue-600">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {editingPack ? 'Mettre à jour' : 'Ajouter'}
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packs.map((pack) => (
                <div key={pack.id} className={cn("bg-white/5 border border-white/10 rounded-xl p-4", !pack.is_active && "opacity-50")}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-white">{pack.credits}</span>
                    {pack.is_popular && <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Populaire</span>}
                  </div>
                  <p className="text-white/60 text-sm mb-1">messages</p>
                  {pack.bonus_credits > 0 && <p className="text-emerald-400 text-sm">+{pack.bonus_credits} offerts</p>}
                  <p className="text-xl font-semibold text-white mt-2">{pack.price}€</p>
                  <p className="text-white/40 text-xs">{((pack.price / (pack.credits + (pack.bonus_credits || 0))) * 100).toFixed(1)}c/msg</p>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button size="sm" variant="ghost" onClick={() => handleEditPack(pack)} className="text-white/60 hover:text-white">Modifier</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeletePack(pack.id)} className="text-red-400/60 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}