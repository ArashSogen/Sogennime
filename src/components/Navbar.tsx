import React from 'react';
import { Bell, Shield, Heart, Film } from 'lucide-react';

interface NavbarProps {
  activeTab: 'all' | 'mylist';
  setActiveTab: (tab: 'all' | 'mylist') => void;
  onOpenRequests: () => void;
  onOpenAdmin: () => void;
  onHomeClick: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenRequests,
  onOpenAdmin,
  onHomeClick,
  unreadCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-50 glass-heavy border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={onHomeClick}
          className="flex items-center gap-2.5 text-xl font-black tracking-tight text-white group cursor-pointer shrink-0"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.9)] transition-transform group-hover:scale-125" />
          <span className="bg-gradient-to-r from-white via-sky-300 to-orange-400 bg-clip-text text-transparent">
            Sogenime
          </span>
        </button>

        {/* Zone 2: Navigation Links (Only Catalog, My List, Requests) */}
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
          <button
            onClick={() => {
              setActiveTab('all');
              onHomeClick();
            }}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'all' ? 'text-sky-400 font-semibold' : 'hover:text-zinc-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Catalog</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('mylist');
              onHomeClick();
            }}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'mylist' ? 'text-sky-400 font-semibold' : 'hover:text-zinc-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>My List</span>
          </button>

          <button
            onClick={onOpenRequests}
            className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Requests</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Admin Action (Admin Only) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/40 hover:bg-orange-500/25 transition-all cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.2)] whitespace-nowrap"
          >
            <Shield className="w-3.5 h-3.5 text-orange-400" />
            <span>Admin Panel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
