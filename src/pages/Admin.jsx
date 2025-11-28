import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Users, Image, CreditCard, TrendingUp, Search, 
  ArrowLeft, Shield, Trash2, Edit, Check, X, Loader2
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [credits, setCredits] = useState([]);
  const [visuals, setVisuals] = useState([]);
  const [transactions, setTransactions] = useState([]);
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
        
        // Load all data
        const [usersData, creditsData, visualsData, transactionsData] = await Promise.all([
          base44.entities.User.list('-created_date', 100),
          base44.entities.UserCredits.list('-created_date', 100),
          base44.entities.Visual.list('-created_date', 100),
          base44.entities.Transaction.list('-created_date', 100)
        ]);
        
        setUsers(usersData);
        setCredits(creditsData);
        setVisuals(visualsData);
        setTransactions(transactionsData);
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
      setLoading(false);
    };
    init();
  }, []);

  const stats = [
    { label: 'Utilisateurs', value: users.length, icon: Users, color: 'text-blue-400' },
    { label: 'Visuels créés', value: visuals.length, icon: Image, color: 'text-violet-400' },
    { label: 'Transactions', value: transactions.length, icon: CreditCard, color: 'text-green-400' },
    { label: 'Revenus', value: `${transactions.filter(t => t.status === 'completed').reduce((acc, t) => acc + (t.amount || 0), 0).toFixed(2)}€`, icon: TrendingUp, color: 'text-amber-400' },
  ];

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserCredits = (email) => credits.find(c => c.user_email === email);

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
      
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <a href={createPageUrl('Home')} className="text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </a>
              <Logo size="small" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm">
                <Shield className="h-4 w-4" />
                Admin
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <stat.icon className={cn("h-8 w-8 mb-3", stat.color)} />
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-white/10 border border-white/10">
              <TabsTrigger value="users" className="data-[state=active]:bg-violet-600">Utilisateurs</TabsTrigger>
              <TabsTrigger value="visuals" className="data-[state=active]:bg-violet-600">Visuels</TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-violet-600">Transactions</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
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
                                <div className="flex gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleSaveCredit(userCredit.id)}
                                    className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setEditingCredit(null)}
                                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEditCredit(userCredit)}
                                  className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                                >
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
            </TabsContent>

            {/* Visuals Tab */}
            <TabsContent value="visuals">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {visuals.map((visual) => (
                  <div key={visual.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group">
                    <div className="aspect-square relative">
                      <img src={visual.image_url} alt={visual.title} className="w-full h-full object-cover" />
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDeleteVisual(visual.id)}
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-3">
                      <p className="text-white text-sm truncate">{visual.title || 'Sans titre'}</p>
                      <p className="text-white/50 text-xs">{visual.user_email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/60">Date</TableHead>
                      <TableHead className="text-white/60">Utilisateur</TableHead>
                      <TableHead className="text-white/60">Type</TableHead>
                      <TableHead className="text-white/60">Montant</TableHead>
                      <TableHead className="text-white/60">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white/80">
                          {new Date(t.created_date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-white/80">{t.user_email}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-violet-500/20 text-violet-300">
                            {t.type?.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-white font-medium">{t.amount}€</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs",
                            t.status === 'completed' ? "bg-green-500/20 text-green-300" :
                            t.status === 'pending' ? "bg-amber-500/20 text-amber-300" :
                            "bg-red-500/20 text-red-300"
                          )}>
                            {t.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}