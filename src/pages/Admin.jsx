import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Users, Image, CreditCard, TrendingUp, Search, ArrowLeft, Shield, 
  Trash2, Edit, Check, X, Loader2, Settings, FileText, BarChart3,
  Download, Eye, Calendar, DollarSign, Activity, Save
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [credits, setCredits] = useState([]);
  const [visuals, setVisuals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [settings, setSettings] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCredit, setEditingCredit] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }
        setUser(currentUser);
        
        const [usersData, creditsData, visualsData, transactionsData, conversationsData, settingsData] = await Promise.all([
          base44.entities.User.list('-created_date', 500),
          base44.entities.UserCredits.list('-created_date', 500),
          base44.entities.Visual.list('-created_date', 500),
          base44.entities.Transaction.list('-created_date', 500),
          base44.entities.Conversation.list('-created_date', 500),
          base44.entities.AppSettings.list()
        ]);
        
        setUsers(usersData);
        setCredits(creditsData);
        setVisuals(visualsData);
        setTransactions(transactionsData);
        setConversations(conversationsData);
        
        const settingsMap = {};
        settingsData.forEach(s => { settingsMap[s.key] = { id: s.id, value: s.value }; });
        setSettings(settingsMap);
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
      setLoading(false);
    };
    init();
  }, []);

  // Analytics calculations
  const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalDownloads = visuals.filter(v => v.downloaded).length;
  const activeSubscriptions = credits.filter(c => c.subscription_type !== 'free').length;
  
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      date: format(date, 'dd/MM'),
      users: users.filter(u => u.created_date?.startsWith(dateStr)).length,
      visuals: visuals.filter(v => v.created_date?.startsWith(dateStr)).length,
      revenue: transactions.filter(t => t.created_date?.startsWith(dateStr) && t.status === 'completed').reduce((acc, t) => acc + (t.amount || 0), 0)
    };
  });

  const visualTypeData = Object.entries(
    visuals.reduce((acc, v) => { acc[v.visual_type || 'autre'] = (acc[v.visual_type || 'autre'] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  const subscriptionData = [
    { name: 'Gratuit', value: credits.filter(c => c.subscription_type === 'free').length, color: '#6b7280' },
    { name: 'Pro', value: credits.filter(c => c.subscription_type === 'limited').length, color: '#3b82f6' },
    { name: 'Unlimited', value: credits.filter(c => c.subscription_type === 'unlimited').length, color: '#8b5cf6' },
  ];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

  const stats = [
    { label: 'Utilisateurs', value: users.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Visuels créés', value: visuals.length, icon: Image, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Téléchargements', value: totalDownloads, icon: Download, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Conversations', value: conversations.length, icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Abonnements actifs', value: activeSubscriptions, icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Revenus totaux', value: `${totalRevenue.toFixed(2)}€`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserCredits = (email) => credits.find(c => c.user_email === email);

  const handleSaveSetting = async (key, value) => {
    setSaving(true);
    if (settings[key]?.id) {
      await base44.entities.AppSettings.update(settings[key].id, { value });
      setSettings(prev => ({ ...prev, [key]: { ...prev[key], value } }));
    } else {
      const newSetting = await base44.entities.AppSettings.create({ key, value });
      setSettings(prev => ({ ...prev, [key]: { id: newSetting.id, value } }));
    }
    setSaving(false);
  };

  const handleEditCredit = (credit) => {
    setEditingCredit(credit.id);
    setEditValues({
      free_downloads: credit.free_downloads,
      paid_credits: credit.paid_credits,
      subscription_type: credit.subscription_type
    });
  };

  const handleSaveCredit = async (creditId) => {
    await base44.entities.UserCredits.update(creditId, editValues);
    setCredits(prev => prev.map(c => c.id === creditId ? { ...c, ...editValues } : c));
    setEditingCredit(null);
  };

  const handleDeleteVisual = async (visualId) => {
    await base44.entities.Visual.delete(visualId);
    setVisuals(prev => prev.filter(v => v.id !== visualId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader2 className="h-8 w-8 text-violet-400 animate-spin relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <a href={createPageUrl('Home')} className="text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </a>
              <Logo size="small" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm">
                <Shield className="h-4 w-4" />
                Administration
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {stats.map((stat, idx) => (
              <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/50 text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10 p-1">
              <TabsTrigger value="analytics" className="data-[state=active]:bg-violet-600 text-white/70 data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistiques
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-violet-600 text-white/70 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="visuals" className="data-[state=active]:bg-violet-600 text-white/70 data-[state=active]:text-white">
                <Image className="h-4 w-4 mr-2" />
                Visuels
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-violet-600 text-white/70 data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Activité (30 jours)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={last30Days}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorVisuals" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="date" stroke="#ffffff50" fontSize={10} />
                          <YAxis stroke="#ffffff50" fontSize={10} />
                          <Tooltip 
                            contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="users" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsers)" name="Utilisateurs" />
                          <Area type="monotone" dataKey="visuals" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVisuals)" name="Visuels" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Revenus (30 jours)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={last30Days}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="date" stroke="#ffffff50" fontSize={10} />
                          <YAxis stroke="#ffffff50" fontSize={10} />
                          <Tooltip 
                            contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value) => [`${value}€`, 'Revenus']}
                          />
                          <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Visual Types */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Types de visuels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={visualTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {visualTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {visualTypeData.map((entry, idx) => (
                        <span key={idx} className="flex items-center gap-1 text-xs text-white/70">
                          <span className="w-2 h-2 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                          {entry.name}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Subscriptions */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Abonnements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={subscriptionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {subscriptionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 justify-center mt-4">
                      {subscriptionData.map((entry, idx) => (
                        <span key={idx} className="flex items-center gap-2 text-sm text-white/70">
                          <span className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                          {entry.name}: {entry.value}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Gestion des utilisateurs</CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher..."
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-white/10 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-white/60">Utilisateur</TableHead>
                          <TableHead className="text-white/60">Email</TableHead>
                          <TableHead className="text-white/60">Crédits gratuits</TableHead>
                          <TableHead className="text-white/60">Crédits payants</TableHead>
                          <TableHead className="text-white/60">Abonnement</TableHead>
                          <TableHead className="text-white/60">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((u) => {
                          const userCredit = getUserCredits(u.email);
                          const isEditing = editingCredit === userCredit?.id;
                          
                          return (
                            <TableRow key={u.id} className="border-white/10 hover:bg-white/5">
                              <TableCell className="text-white font-medium">{u.full_name || '-'}</TableCell>
                              <TableCell className="text-white/80">{u.email}</TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editValues.free_downloads}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, free_downloads: parseInt(e.target.value) }))}
                                    className="w-20 h-8 bg-white/10 border-white/20 text-white"
                                  />
                                ) : (
                                  <span className="text-white/80">{userCredit?.free_downloads || 0}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editValues.paid_credits}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, paid_credits: parseInt(e.target.value) }))}
                                    className="w-20 h-8 bg-white/10 border-white/20 text-white"
                                  />
                                ) : (
                                  <span className="text-white/80">{userCredit?.paid_credits || 0}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-xs",
                                  userCredit?.subscription_type === 'unlimited' ? "bg-purple-500/20 text-purple-300" :
                                  userCredit?.subscription_type === 'limited' ? "bg-blue-500/20 text-blue-300" :
                                  "bg-white/10 text-white/60"
                                )}>
                                  {userCredit?.subscription_type || 'free'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {userCredit && (
                                  isEditing ? (
                                    <div className="flex gap-1">
                                      <Button size="icon" variant="ghost" onClick={() => handleSaveCredit(userCredit.id)} className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/20">
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button size="icon" variant="ghost" onClick={() => setEditingCredit(null)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20">
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button size="icon" variant="ghost" onClick={() => handleEditCredit(userCredit)} className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Visuals Tab */}
            <TabsContent value="visuals">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Visuels générés ({visuals.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {visuals.slice(0, 48).map((visual) => (
                      <div key={visual.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group relative">
                        <div className="aspect-square">
                          <img src={visual.image_url} alt={visual.title} className="w-full h-full object-cover" />
                        </div>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeleteVisual(visual.id)}
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="p-2">
                          <p className="text-white text-xs truncate">{visual.title || 'Sans titre'}</p>
                          <p className="text-white/40 text-xs truncate">{visual.user_email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Home Settings FR */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Page d'accueil - Français 🇫🇷
                  </CardTitle>
                  <CardDescription className="text-white/50">Personnalisez le titre et sous-titre de l'accueil (FR)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Titre principal (FR)</Label>
                    <Input
                      value={settings.home_title_fr?.value || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, home_title_fr: { ...prev.home_title_fr, value: e.target.value } }))}
                      placeholder="Votre assistant IA pour créer des visuels professionnels"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Sous-titre (FR)</Label>
                    <Input
                      value={settings.home_subtitle_fr?.value || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, home_subtitle_fr: { ...prev.home_subtitle_fr, value: e.target.value } }))}
                      placeholder="Logos, cartes de visite, flyers..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                  <Button 
                    onClick={async () => {
                      await handleSaveSetting('home_title_fr', settings.home_title_fr?.value || '');
                      await handleSaveSetting('home_subtitle_fr', settings.home_subtitle_fr?.value || '');
                    }}
                    disabled={saving}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Sauvegarder FR
                  </Button>
                </CardContent>
              </Card>

              {/* Home Settings EN */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Home Page - English 🇬🇧
                  </CardTitle>
                  <CardDescription className="text-white/50">Customize home title and subtitle (EN)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Main Title (EN)</Label>
                    <Input
                      value={settings.home_title_en?.value || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, home_title_en: { ...prev.home_title_en, value: e.target.value } }))}
                      placeholder="Your AI assistant for creating professional visuals"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Subtitle (EN)</Label>
                    <Input
                      value={settings.home_subtitle_en?.value || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, home_subtitle_en: { ...prev.home_subtitle_en, value: e.target.value } }))}
                      placeholder="Logos, business cards, flyers..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                  <Button 
                    onClick={async () => {
                      await handleSaveSetting('home_title_en', settings.home_title_en?.value || '');
                      await handleSaveSetting('home_subtitle_en', settings.home_subtitle_en?.value || '');
                    }}
                    disabled={saving}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save EN
                  </Button>
                </CardContent>
              </Card>

              {/* Legal Settings FR */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Mentions légales - Français 🇫🇷
                  </CardTitle>
                  <CardDescription className="text-white/50">Modifiez le contenu des mentions légales (FR)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={settings.legal_content_fr?.value || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, legal_content_fr: { ...prev.legal_content_fr, value: e.target.value } }))}
                    placeholder="Contenu des mentions légales..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[200px]"
                  />
                  <Button 
                    onClick={() => handleSaveSetting('legal_content_fr', settings.legal_content_fr?.value || '')}
                    disabled={saving}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Sauvegarder FR
                  </Button>
                </CardContent>
              </Card>

              {/* Legal Settings EN */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Legal Notice - English 🇬🇧
                  </CardTitle>
                  <CardDescription className="text-white/50">Edit legal notice content (EN)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={settings.legal_content_en?.value || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, legal_content_en: { ...prev.legal_content_en, value: e.target.value } }))}
                    placeholder="Legal notice content..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[200px]"
                  />
                  <Button 
                    onClick={() => handleSaveSetting('legal_content_en', settings.legal_content_en?.value || '')}
                    disabled={saving}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save EN
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}