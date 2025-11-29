import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, 
  Users, 
  Image, 
  Settings, 
  ArrowLeft,
  BarChart3
} from 'lucide-react';
import { cn } from "@/lib/utils";
import AnimatedBackground from '@/components/AnimatedBackground';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, page: 'Admin' },
  { id: 'users', label: 'Utilisateurs', icon: Users, page: 'AdminUsers' },
  { id: 'visuals', label: 'Visuels', icon: Image, page: 'AdminVisuals' },
  { id: 'settings', label: 'Paramètres', icon: Settings, page: 'AdminSettings' },
];

export default function AdminLayout({ children, currentPage }) {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <Link 
              to={createPageUrl('Home')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'app
            </Link>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-400" />
              Administration
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  currentPage === item.id
                    ? "bg-gradient-to-r from-violet-600/30 to-blue-600/30 text-white border border-violet-500/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <p className="text-white/30 text-xs text-center">
              iGPT Admin Panel
            </p>
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