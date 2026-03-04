'use client';

import Link from 'next/link';
import { LayoutDashboard, MapPin, ShieldAlert, Globe, Tag as TagIcon, Mail, LogOut, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

type AdminTab = 'overview' | 'locations' | 'content' | 'categories' | 'tags' | 'feedback';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (t: AdminTab) => void;
  locationsCount: number;
  pendingTagsCount: number;
  feedbackCount: number;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  locationsCount,
  pendingTagsCount,
  feedbackCount,
}: AdminSidebarProps) {
  const [isModerationOpen, setIsModerationOpen] = useState(['content', 'tags', 'categories', 'feedback'].includes(activeTab));
  return (
    <aside className="w-80 bg-white border-r-2 border-slate-100 hidden lg:flex flex-col p-8 flex-shrink-0 h-full">
      <div className="flex items-center gap-4 mb-14">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">
          A
        </div>
        <div>
          <span className="font-black text-xl tracking-tighter uppercase block leading-none">Admin</span>
          <span className="text-[10px] font-black text-amber-600 tracking-[0.3em] uppercase mt-1 block">
            Management
          </span>
        </div>
      </div>

      <nav className="flex-grow space-y-2 overflow-y-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all',
            activeTab === 'overview'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
              : 'text-slate-400 hover:bg-slate-50',
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          Bảng điều khiển
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={cn(
            'w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all',
            activeTab === 'locations'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
              : 'text-slate-400 hover:bg-slate-50',
          )}
        >
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5" />
            Kho dữ liệu
          </div>
          <span
            className={cn(
              'px-2 py-0.5 rounded-lg text-[10px]',
              activeTab === 'locations' ? 'bg-white/20' : 'bg-slate-100 text-slate-400',
            )}
          >
            {locationsCount}
          </span>
        </button>

        <div className="space-y-1">
          <button
            onClick={() => setIsModerationOpen(!isModerationOpen)}
            className={cn(
              'w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all',
              ['content', 'tags', 'categories', 'feedback'].includes(activeTab)
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-50',
            )}
          >
            <div className="flex items-center gap-4">
              <ShieldAlert className="w-5 h-5" />
              Kiểm duyệt
            </div>
            <ChevronLeft className={cn("w-4 h-4 transition-transform", isModerationOpen ? "-rotate-90" : "")} />
          </button>

          {isModerationOpen && (
            <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => setActiveTab('content')}
                className={cn(
                  'w-full flex items-center gap-4 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                  activeTab === 'content' ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:bg-slate-50',
                )}
              >
                Nhận xét
              </button>
              
              <button
                onClick={() => setActiveTab('tags')}
                className={cn(
                  'w-full flex items-center justify-between px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                  activeTab === 'tags' ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:bg-slate-50',
                )}
              >
                <span>Thẻ (Tags)</span>
                {pendingTagsCount > 0 && (
                  <span className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[7px] font-black animate-pulse">
                    {pendingTagsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={cn(
                  'w-full flex items-center gap-4 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                  activeTab === 'categories' ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:bg-slate-50',
                )}
              >
                Danh mục
              </button>

              <button
                onClick={() => setActiveTab('feedback')}
                className={cn(
                  'w-full flex items-center justify-between px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                  activeTab === 'feedback' ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:bg-slate-50',
                )}
              >
                <span>Góp ý</span>
                {feedbackCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded-md text-[7px] font-black">
                    {feedbackCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-8 border-t border-slate-50">
        <Link
          href="/"
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Thoát về Home
        </Link>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            localStorage.removeItem('user');
            window.location.href = '/';
          }}
          className="w-full flex items-center gap-4 px-6 py-4 text-slate-400 hover:text-red-500 font-black text-xs uppercase tracking-widest transition-all"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

