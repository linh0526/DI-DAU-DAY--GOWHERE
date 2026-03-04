'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bookmark, 
  X, 
  Filter, 
  Utensils, 
  Coffee, 
  Beer, 
  Waves, 
  Flame, 
  Pizza, 
  Sparkles, 
  GlassWater,
  ArrowUpDown,
  CheckCircle2,
  Library
} from 'lucide-react';
import { CATEGORIES } from '@/lib/data-locations';
import { cn } from '@/lib/utils';
import { User } from '@/types';

interface HeroSectionProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeTag: string;
  onTagChange: (tag: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showSavedOnly: boolean;
  onToggleSavedOnly: () => void;
  onClearFilters: () => void;
  user: User | null;
  onOpenLogin: () => void;
  userDistrict: string;
  categories: string[];
}

export default function HeroSection({
  search,
  onSearchChange,
  activeTag,
  onTagChange,
  sortBy,
  onSortChange,
  showSavedOnly,
  onToggleSavedOnly,
  onClearFilters,
  user,
  onOpenLogin,
  userDistrict,
  categories,
}: HeroSectionProps) {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSavedOnlyToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onOpenLogin();
      return;
    }
    onToggleSavedOnly();
  };

  const hasActiveFilters = activeTag !== 'all' || showSavedOnly || sortBy !== 'newest';

  return (
    <section className="bg-white border-b border-slate-100 py-10 relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative group max-w-xl mx-auto z-[60]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-amber-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm quán ngon bạn đang thèm..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-5 pl-14 pr-24 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-amber-600 focus:ring-8 focus:ring-amber-50/50 transition-all text-base font-bold placeholder:text-slate-300 shadow-sm shadow-slate-100 placeholder:italic"
          />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Clear button if any filter is active INCLUDING search */}
            {(search || hasActiveFilters) && (
              <button 
                onClick={onClearFilters}
                className="p-2.5 bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                title="Xóa tất cả bộ lọc"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Unified Filter Button */}
            <div className="relative" ref={filterMenuRef}>
              <button 
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={cn(
                  "p-3.5 rounded-2xl transition-all border-2 flex items-center gap-2 relative",
                  hasActiveFilters || isFilterMenuOpen 
                    ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-900/20" 
                    : "bg-white border-slate-100 text-slate-400 hover:border-amber-600 hover:text-amber-600"
                )}
                title="Bộ lọc nâng cao"
              >
                <Filter className="w-5 h-5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>

              {isFilterMenuOpen && (
                <div className="absolute top-[calc(100%+16px)] right-0 w-[85vw] sm:w-[500px] md:w-[600px] bg-white rounded-[2.5rem] shadow-2xl border-4 border-slate-100 p-8 animate-in zoom-in-95 slide-in-from-top-4 origin-top-right overflow-hidden custom-scrollbar max-h-[80vh] overflow-y-auto">
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Sort Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sắp xếp theo</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: 'newest', label: 'Mới nhất' },
                            { id: 'popular', label: 'Yêu thích nhất' },
                            { id: 'views', label: 'Xem nhiều nhất' }
                          ].map(item => (
                            <button
                              key={item.id}
                              onClick={() => onSortChange(item.id)}
                              className={cn(
                                "flex items-center justify-between px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2",
                                sortBy === item.id ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-500 border-transparent hover:border-slate-200"
                              )}
                            >
                              {item.label}
                              {sortBy === item.id && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Saved Only Filter */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ưu tiên cá nhân</span>
                        </div>
                        <button
                          onClick={handleSavedOnlyToggle}
                          className={cn(
                            "w-full h-[calc(100%-24px)] flex flex-col items-center justify-center p-6 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all border-2 gap-4 text-center",
                            showSavedOnly 
                              ? "bg-red-50 border-red-200 text-red-700" 
                              : "bg-slate-50 border-transparent text-slate-500 hover:border-slate-200"
                          )}
                        >
                          <Bookmark className={cn("w-8 h-8", showSavedOnly ? "fill-red-700" : "fill-none")} />
                          <div className="space-y-1">
                            <span>Quán bạn đã lưu</span>
                            <p className="text-[8px] font-bold text-slate-400 normal-case italic">Chỉ hiển thị các địa điểm bạn đã lưu</p>
                          </div>
                          <div className={cn(
                            "w-12 h-7 rounded-full relative transition-all duration-300 shadow-inner",
                            showSavedOnly ? "bg-red-500" : "bg-slate-300"
                          )}>
                            <div className={cn(
                              "absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md",
                              showSavedOnly ? "left-6" : "left-1"
                            )}></div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Categories Section */}
                    <div className="space-y-5 pt-8 border-t-2 border-slate-50">
                      <div className="flex items-center gap-2 px-1">
                        <Library className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Danh mục món ăn phổ biến</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <button 
                          onClick={() => onTagChange('all')}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                            activeTag === 'all' ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-900/10" : "bg-slate-50 border-transparent text-slate-500 hover:border-slate-200"
                          )}
                        >
                          <Utensils className="w-4 h-4" />
                          Tất cả
                        </button>
                        {categories.map(tag => {
                          const Icon = tag === 'Cafe' ? Coffee : 
                                       tag === 'Quán nhậu' ? Beer : 
                                       tag === 'Hải sản' ? Waves : 
                                       tag === 'Lẩu & Nướng' ? Flame : 
                                       tag === 'Ăn vặt' ? Pizza : 
                                       tag === 'Sang trọng' ? Sparkles : 
                                       tag.includes('Bún') || tag.includes('Phở') || tag.includes('Miến') ? GlassWater : Utensils;
                          return (
                            <button 
                              key={tag} 
                              onClick={() => onTagChange(tag)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                activeTag === tag ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-900/10" : "bg-slate-50 border-transparent text-slate-500 hover:border-slate-200"
                              )}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{tag}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-tight text-slate-900 mb-3 italic">Tìm quán sịn, đi măm ngay thôi!! 🥢</h2>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.5em]">Hàng trăm địa điểm ăn chơi được chia sẻ bời cộng đồng</p>
        </div>
      </div>
    </section>
  );
}
