import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Loader2, DollarSign, Download, MessageSquare, Users, TrendingUp, Eye, Activity, Calendar, CalendarDays, UserPlus, CreditCard, Image, Clock, BarChart3 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalDownloads: 0,
    totalConversations: 0,
    activeSubscriptions: 0,
    totalUsers: 0
  });
  const [visitStats, setVisitStats] = useState({
    currentVisitors: 0,
    today: 0,
    yesterday: 0,
    lastWeek: 0,
    lastMonth: 0
  });
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    newToday: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    starterSubs: 0,
    proSubs: 0,
    eliteSubs: 0,
    elitePlusSubs: 0,
    revenueToday: 0,
    revenueThisWeek: 0,
    revenueThisMonth: 0,
    avgRevenuePerUser: 0
  });
  const [conversationStats, setConversationStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    avgPerUser: 0,
    totalMessages: 0,
    avgMessagesPerConv: 0,
    totalVisuals: 0,
    visualsToday: 0,
    visualsThisWeek: 0,
    downloadsToday: 0,
    downloadsThisWeek: 0
  });
  const [activityData, setActivityData] = useState([]);
  const [visualTypesData, setVisualTypesData] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }

        const [users, allCredits, allVisuals, allTransactions, allConversations] = await Promise.all([
          base44.entities.User.list(),
          base44.entities.UserCredits.list(),
          base44.entities.Visual.list('-created_date', 500),
          base44.entities.Transaction.list(),
          base44.entities.Conversation.list()
        ]);

        // Calculate stats
        const totalRevenue = allTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const totalDownloads = allVisuals.filter(v => v.downloaded).length;
        const activeSubscriptions = allCredits.filter(c => 
          c.subscription_type === 'limited' || c.subscription_type === 'unlimited'
        ).length;

        setStats({
          totalRevenue,
          totalDownloads,
          totalConversations: allConversations.length,
          activeSubscriptions,
          totalUsers: users.length
        });

        // Activity data (last 30 days)
        const last30Days = [...Array(30)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString().split('T')[0];
        });

        const activity = last30Days.map(date => ({
          date: date.slice(5),
          visuals: allVisuals.filter(v => v.created_date?.startsWith(date)).length,
          conversations: allConversations.filter(c => c.created_date?.startsWith(date)).length
        }));
        setActivityData(activity);

        // Visual types
        const typeCounts = {};
        allVisuals.forEach(v => {
          const type = v.visual_type || 'autre';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        setVisualTypesData(Object.entries(typeCounts).map(([name, value]) => ({ name, value })));

        // Calculate visit stats based on conversations/visuals activity
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const todayStart = new Date(todayStr);
        
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayEnd = new Date(todayStart);
        
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const lastWeekStart = new Date(weekAgo);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const lastMonthStart = new Date(monthAgo);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

        // Get admin emails to exclude
        const adminEmailsSet = new Set(users.filter(u => u.role === 'admin').map(u => u.email));

        // Simulate current visitors based on recent activity (last 5 minutes), excluding admins
        const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const recentActivity = [...allVisuals, ...allConversations].filter(item => {
          const userEmail = item.user_email || item.created_by;
          return new Date(item.created_date || item.updated_date) > fiveMinAgo && !adminEmailsSet.has(userEmail);
        }).length;

        // Count unique users by period (excluding admins)
        const getUniqueUsers = (items, afterDate, beforeDate = null) => {
          const uniqueUsers = new Set();
          items.forEach(item => {
            const userEmail = item.user_email || item.created_by;
            const itemDate = new Date(item.created_date);
            const afterCheck = itemDate > afterDate;
            const beforeCheck = beforeDate ? itemDate < beforeDate : true;
            if (afterCheck && beforeCheck && userEmail && !adminEmailsSet.has(userEmail)) {
              uniqueUsers.add(userEmail);
            }
          });
          return uniqueUsers.size;
        };

        const allItems = [...allVisuals, ...allConversations];

        setVisitStats({
          currentVisitors: Math.max(1, recentActivity),
          today: getUniqueUsers(allItems, todayStart),
          yesterday: getUniqueUsers(allItems, yesterdayStart, yesterdayEnd),
          lastWeek: getUniqueUsers(allItems, lastWeekStart, weekAgo),
          lastMonth: getUniqueUsers(allItems, lastMonthStart, monthAgo)
        });

        // User & Subscription Stats
        const newUsersToday = users.filter(u => u.created_date?.startsWith(todayStr)).length;
        const newUsersWeek = users.filter(u => new Date(u.created_date) > weekAgo).length;
        const newUsersMonth = users.filter(u => new Date(u.created_date) > monthAgo).length;

        // Count subscriptions by type
        const starterSubs = allCredits.filter(c => c.subscription_type === 'limited' && (c.paid_credits || 0) <= 100).length;
        const proSubs = allCredits.filter(c => c.subscription_type === 'limited' && (c.paid_credits || 0) > 100 && (c.paid_credits || 0) <= 250).length;
        const eliteSubs = allCredits.filter(c => c.subscription_type === 'limited' && (c.paid_credits || 0) > 250 && (c.paid_credits || 0) <= 500).length;
        const elitePlusSubs = allCredits.filter(c => c.subscription_type === 'unlimited' || ((c.paid_credits || 0) > 500)).length;

        // Revenue stats
        const revenueToday = allTransactions.filter(t => t.status === 'completed' && t.created_date?.startsWith(todayStr)).reduce((sum, t) => sum + (t.amount || 0), 0);
        const revenueThisWeek = allTransactions.filter(t => t.status === 'completed' && new Date(t.created_date) > weekAgo).reduce((sum, t) => sum + (t.amount || 0), 0);
        const revenueThisMonth = allTransactions.filter(t => t.status === 'completed' && new Date(t.created_date) > monthAgo).reduce((sum, t) => sum + (t.amount || 0), 0);
        const payingUsers = new Set(allTransactions.filter(t => t.status === 'completed').map(t => t.user_email)).size;
        const avgRevenuePerUser = payingUsers > 0 ? totalRevenue / payingUsers : 0;

        setUserStats({
          totalUsers: users.length,
          newToday: newUsersToday,
          newThisWeek: newUsersWeek,
          newThisMonth: newUsersMonth,
          starterSubs,
          proSubs,
          eliteSubs,
          elitePlusSubs,
          revenueToday,
          revenueThisWeek,
          revenueThisMonth,
          avgRevenuePerUser
        });

        // Conversation Stats
        const convsToday = allConversations.filter(c => c.created_date?.startsWith(todayStr)).length;
        const convsThisWeek = allConversations.filter(c => new Date(c.created_date) > weekAgo).length;
        const convsThisMonth = allConversations.filter(c => new Date(c.created_date) > monthAgo).length;
        const totalMessages = allConversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0);
        const avgMessagesPerConv = allConversations.length > 0 ? totalMessages / allConversations.length : 0;
        const activeUserCount = new Set(allConversations.map(c => c.user_email)).size;
        const avgConvsPerUser = activeUserCount > 0 ? allConversations.length / activeUserCount : 0;

        const visualsToday = allVisuals.filter(v => v.created_date?.startsWith(todayStr)).length;
        const visualsThisWeek = allVisuals.filter(v => new Date(v.created_date) > weekAgo).length;
        const downloadsToday = allVisuals.filter(v => v.downloaded && v.updated_date?.startsWith(todayStr)).length;
        const downloadsThisWeek = allVisuals.filter(v => v.downloaded && new Date(v.updated_date) > weekAgo).length;

        setConversationStats({
          total: allConversations.length,
          today: convsToday,
          thisWeek: convsThisWeek,
          thisMonth: convsThisMonth,
          avgPerUser: avgConvsPerUser,
          totalMessages,
          avgMessagesPerConv,
          totalVisuals: allVisuals.length,
          visualsToday,
          visualsThisWeek,
          downloadsToday,
          downloadsThisWeek
        });

      } catch (e) {
        console.error(e);
        window.location.href = createPageUrl('Home');
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <AdminLayout currentPage="dashboard">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/60">Vue d'ensemble de votre application</p>
        </div>

        {/* Visit Stats Grid */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-violet-400" />
            Statistiques de visites
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-green-300 text-xs">En ce moment</span>
              </div>
              <p className="text-2xl font-bold text-white">{visitStats.currentVisitors}</p>
              <p className="text-white/50 text-xs">visiteurs actifs</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300 text-xs">Aujourd'hui</span>
              </div>
              <p className="text-2xl font-bold text-white">{visitStats.today}</p>
              <p className="text-white/50 text-xs">visiteurs</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-violet-400" />
                <span className="text-violet-300 text-xs">Cette semaine</span>
              </div>
              <p className="text-2xl font-bold text-white">{visitStats.thisWeek}</p>
              <p className="text-white/50 text-xs">visiteurs</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-amber-400" />
                <span className="text-amber-300 text-xs">Ce mois-ci</span>
              </div>
              <p className="text-2xl font-bold text-white">{visitStats.thisMonth}</p>
              <p className="text-white/50 text-xs">visiteurs</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-pink-400" />
                <span className="text-pink-300 text-xs">Cette année</span>
              </div>
              <p className="text-2xl font-bold text-white">{visitStats.thisYear}</p>
              <p className="text-white/50 text-xs">visiteurs</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Revenus totaux"
            value={`${stats.totalRevenue.toFixed(2)}€`}
            icon={DollarSign}
            gradient="bg-gradient-to-br from-green-600 to-emerald-600"
          />
          <StatCard
            title="Téléchargements"
            value={stats.totalDownloads}
            icon={Download}
            gradient="bg-gradient-to-br from-blue-600 to-cyan-600"
          />
          <StatCard
            title="Conversations"
            value={stats.totalConversations}
            icon={MessageSquare}
            gradient="bg-gradient-to-br from-violet-600 to-purple-600"
          />
          <StatCard
            title="Abonnements actifs"
            value={stats.activeSubscriptions}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-amber-600 to-orange-600"
          />
          <StatCard
            title="Utilisateurs"
            value={stats.totalUsers}
            icon={Users}
            gradient="bg-gradient-to-br from-pink-600 to-rose-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Activité (30 jours)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorVisuals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} />
                <YAxis stroke="#ffffff40" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="visuals" name="Visuels" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorVisuals)" />
                <Area type="monotone" dataKey="conversations" name="Conversations" stroke="#3b82f6" fillOpacity={1} fill="url(#colorConversations)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Visual Types Chart */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Types de visuels</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={visualTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {visualTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {visualTypesData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs text-white/60">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}