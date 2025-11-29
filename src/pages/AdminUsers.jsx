import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Edit2, Check, X, Crown, Zap } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from "@/lib/utils";

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [allCredits, setAllCredits] = useState([]);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editCredits, setEditCredits] = useState({ free: 0, paid: 0 });

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }

        const [fetchedUsers, fetchedCredits] = await Promise.all([
          base44.entities.User.list(),
          base44.entities.UserCredits.list()
        ]);

        setUsers(fetchedUsers);
        setAllCredits(fetchedCredits);
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
      setLoading(false);
    };
    init();
  }, []);

  const getUserCredits = (email) => {
    return allCredits.find(c => c.user_email === email);
  };

  const handleEditUser = (user) => {
    const credits = getUserCredits(user.email);
    setEditingUser(user.email);
    setEditCredits({
      free: credits?.free_downloads || 0,
      paid: credits?.paid_credits || 0
    });
  };

  const handleSaveCredits = async (email) => {
    const credits = getUserCredits(email);
    if (credits) {
      await base44.entities.UserCredits.update(credits.id, {
        free_downloads: editCredits.free,
        paid_credits: editCredits.paid
      });
      setAllCredits(prev => prev.map(c => 
        c.user_email === email 
          ? { ...c, free_downloads: editCredits.free, paid_credits: editCredits.paid }
          : c
      ));
    }
    setEditingUser(null);
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getSubscriptionBadge = (type) => {
    if (type === 'unlimited') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-violet-600/30 to-purple-600/30 text-violet-300 text-xs border border-violet-500/30">
          <Crown className="h-3 w-3" />
          Unlimited
        </span>
      );
    }
    if (type === 'limited') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-blue-300 text-xs border border-blue-500/30">
          <Zap className="h-3 w-3" />
          Pro
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full bg-white/10 text-white/50 text-xs">
        Gratuit
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout currentPage="users">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="users">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Utilisateurs</h1>
            <p className="text-white/60">{users.length} utilisateurs inscrits</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Rechercher par email ou nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 font-medium text-sm">Utilisateur</th>
                  <th className="text-left p-4 text-white/60 font-medium text-sm">Abonnement</th>
                  <th className="text-left p-4 text-white/60 font-medium text-sm">Crédits gratuits</th>
                  <th className="text-left p-4 text-white/60 font-medium text-sm">Crédits payants</th>
                  <th className="text-left p-4 text-white/60 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const credits = getUserCredits(user.email);
                  const isEditing = editingUser === user.email;

                  return (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{user.full_name || 'Sans nom'}</p>
                          <p className="text-white/50 text-sm">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {getSubscriptionBadge(credits?.subscription_type)}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editCredits.free}
                            onChange={(e) => setEditCredits(prev => ({ ...prev, free: parseInt(e.target.value) || 0 }))}
                            className="w-20 h-8 bg-white/10 border-white/20 text-white text-sm"
                          />
                        ) : (
                          <span className="text-white">{credits?.free_downloads || 0}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editCredits.paid}
                            onChange={(e) => setEditCredits(prev => ({ ...prev, paid: parseInt(e.target.value) || 0 }))}
                            className="w-20 h-8 bg-white/10 border-white/20 text-white text-sm"
                          />
                        ) : (
                          <span className="text-white">{credits?.paid_credits || 0}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleSaveCredits(user.email)}
                              className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingUser(null)}
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditUser(user)}
                            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}