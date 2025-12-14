import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, 
  Users, 
  Image, 
  Settings, 
  ArrowLeft,
  BarChart3,
  Scale,
  Brush,
  CreditCard,
  Wand2,
  Store,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import AnimatedBackground from '@/components/AnimatedBackground';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, page: 'Admin' },
  { id: 'users', label: 'Utilisateurs', icon: Users, page: 'AdminUsers' },
  { id: 'visuals', label: 'Visuels', icon: Image, page: 'AdminVisuals' },
  { id: 'store-categories', label: 'Store Catégories', icon: Store, page: 'AdminStoreCategories' },
  { id: 'prompts', label: 'Prompts IA', icon: Wand2, page: 'AdminPrompts' },
  { id: 'assets', label: 'Assets Éditeur', icon: Brush, page: 'AdminAssets' },
  { id: 'presentation', label: 'Présentation', icon: LayoutDashboard, page: 'AdminPresentation' },
  { id: 'pricing', label: 'Tarification', icon: CreditCard, page: 'AdminPricing' },
  { id: 'support', label: 'Support & FAQ', icon: HelpCircle, page: 'AdminSupport' },
  { id: 'legal', label: 'Mentions légales', icon: Scale, page: 'AdminLegal' },
  { id: 'settings', label: 'Paramètres', icon: Settings, page: 'AdminSettings' },
];

export default function AdminLayout({ children, currentPage }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className={cn(
          "bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}>
          {/* Header */}
          <div className={cn(
            "p-6 border-b border-white/10",
            collapsed && "p-4"
          )}>
            {!collapsed && (
              <Link 
                to={createPageUrl('Home')}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l'app
              </Link>
            )}
            <div className={cn(
              "flex items-center gap-2",
              collapsed && "justify-center"
            )}>
              <BarChart3 className="h-5 w-5 text-violet-400 flex-shrink-0" />
              {!collapsed && (
                <h1 className="text-xl font-bold text-white">
                  Administration
                </h1>
              )}
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mx-4 my-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all flex items-center justify-center"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group",
                  currentPage === item.id
                    ? "bg-gradient-to-r from-violet-600/30 to-blue-600/30 text-white border border-violet-500/30"
                    : "text-white/60 hover:text-white hover:bg-white/5",
                  collapsed && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                
                {/* Tooltip on hover when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className={cn(
            "p-4 border-t border-white/10",
            collapsed && "text-center"
          )}>
            {collapsed ? (
              <p className="text-white/30 text-xs">iGPT</p>
            ) : (
              <p className="text-white/30 text-xs text-center">
                iGPT Admin Panel
              </p>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}