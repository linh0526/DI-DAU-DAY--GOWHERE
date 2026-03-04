'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Navigation, 
  Filter, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  LayoutDashboard, 
  Bookmark, 
  MessageSquare, 
  Mail,
  ChevronDown,
  MapPin 
} from 'lucide-react';
import { User } from '@/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: User | null;
  userLocation: string;
  userDistrict: string;
  onCityChange: (slug: string) => void;
  onDistrictChange: (name: string) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenAdd: () => void;
  onToggleSaved: () => void;
  onOpenFeedback: () => void;
}

export default function Header({
  user,
  userLocation,
  userDistrict,
  onCityChange,
  onDistrictChange,
  onLogout,
  onOpenLogin,
  onOpenAdd,
  onToggleSaved,
  onOpenFeedback,
}: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [citySearch, setCitySearch] = useState('');
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const locationPickerRef = useRef<HTMLDivElement>(null);
  const districtPickerRef = useRef<HTMLDivElement>(null);

  const cleanName = (name: string) => {
    if (!name) return '';
    return name
      .replace(/^(Tỉnh|Thành phố|Quận|Huyện|Thị xã) /i, '')
      .trim();
  };

  useEffect(() => {
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCities(data);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (locationPickerRef.current && !locationPickerRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (districtPickerRef.current && !districtPickerRef.current.contains(event.target as Node)) {
        setIsDistrictOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-[100] bg-white border-b-2 border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-black tracking-tighter text-amber-600 hover:scale-105 transition-transform">DIDAUDAY</Link>
          
          <div className="hidden lg:flex items-center gap-2 p-1.5 bg-slate-50 rounded-[1.5rem] border-2 border-slate-100 shadow-inner">
            <div className="relative" ref={locationPickerRef}>
              <button 
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-wider border-2 shrink-0",
                  isLocationOpen ? "bg-white text-amber-600 border-amber-600/20" : "text-slate-600 hover:text-slate-900 border-slate-100/50 hover:border-slate-200 bg-white"
                )}
              >
                <MapPin className={cn("w-3.5 h-3.5 transition-colors", isLocationOpen ? "text-amber-600" : "text-slate-400")} />
                <span className="min-w-[40px] text-left">{cleanName(cities.find(c => c.slug === userLocation)?.name) || 'Hà Nội'}</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isLocationOpen && "rotate-180")} />
              </button>

              {isLocationOpen && (
                <div className="absolute top-[calc(100%+12px)] left-0 w-72 bg-white rounded-[2.5rem] shadow-2xl border-4 border-slate-100 p-4 animate-in fade-in slide-in-from-top-2 origin-top-left z-[200]">
                   <div className="mb-4 px-2">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Chọn tỉnh thành</p>
                     <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Tìm tỉnh thành..." 
                          className="w-full pl-8 pr-4 py-2.5 bg-slate-50 rounded-xl text-[11px] font-bold outline-none border border-transparent focus:border-amber-200 transition-all"
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                        />
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                     </div>
                   </div>
                   
                   <div className="max-h-72 overflow-y-auto custom-scrollbar pr-1 space-y-1">
                      {cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())).map(city => (
                        <button 
                          key={city.slug}
                          onClick={() => {
                            onCityChange(city.slug);
                            setIsLocationOpen(false);
                            setCitySearch('');
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[11px] font-bold transition-all group",
                            userLocation === city.slug ? "bg-amber-50 text-amber-700 border border-amber-100" : "hover:bg-slate-50 text-slate-600"
                          )}
                        >
                          <span>{city.name}</span>
                          <span className="text-[9px] px-2 py-0.5 bg-slate-100 group-hover:bg-white rounded-full text-slate-400 font-black">{city.count || 0} quán</span>
                        </button>
                      ))}
                   </div>
                </div>
              )}
            </div>

            <div className="w-[2px] h-6 bg-slate-200 rounded-full mx-1"></div>

            <div className="relative" ref={districtPickerRef}>
              <button 
                onClick={() => setIsDistrictOpen(!isDistrictOpen)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-wider border-2 shrink-0",
                  isDistrictOpen ? "bg-white text-amber-600 border-amber-600/20" : "text-slate-600 hover:text-slate-900 border-slate-100/50 hover:border-slate-200 bg-white"
                )}
              >
                <Filter className={cn("w-3.5 h-3.5 transition-colors", isDistrictOpen ? "text-amber-600" : "text-slate-400")} />
                <span className="truncate max-w-[100px] min-w-[30px] text-left">{userDistrict === 'all' ? 'Tất cả' : cleanName(userDistrict)}</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isDistrictOpen && "rotate-180")} />
              </button>

              {isDistrictOpen && (
                <div className="absolute top-[calc(100%+12px)] left-0 w-64 bg-white rounded-[2.5rem] shadow-2xl border-4 border-slate-100 p-4 animate-in fade-in slide-in-from-top-2 origin-top-left z-[200]">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Khu vực tại {cities.find(c => c.slug === userLocation)?.name}</p>
                   <div className="max-h-64 overflow-y-auto custom-scrollbar pr-1 space-y-1">
                      <button 
                        onClick={() => { onDistrictChange('all'); setIsDistrictOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-2xl text-[11px] font-bold transition-all",
                          userDistrict === 'all' ? "bg-amber-50 text-amber-700 border border-amber-100" : "hover:bg-slate-50 text-slate-600"
                        )}
                      >
                        Tất cả
                      </button>
                      {cities.find(c => c.slug === userLocation)?.districts.map((dist: any, index: number) => (
                        <button 
                          key={`${dist.slug}-${index}`}
                          onClick={() => { onDistrictChange(dist.name); setIsDistrictOpen(false); }}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-2xl text-[11px] font-bold transition-all",
                            userDistrict === dist.name ? "bg-amber-50 text-amber-700 border border-amber-100" : "hover:bg-slate-50 text-slate-600"
                          )}
                        >
                          {dist.name}
                        </button>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative pr-4 border-r-2 border-slate-100" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-2xl transition-all group",
                  isUserMenuOpen ? "border-amber-600 bg-white" : "hover:border-slate-200"
                )}
              >
                <div className="w-7 h-7 bg-amber-600 rounded-xl flex items-center justify-center text-white font-black text-[10px] uppercase shadow-lg shadow-amber-900/10">
                  {user.username.charAt(0)}
                </div>
                <div className="flex items-center gap-2 text-left">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">{user.username}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-300", isUserMenuOpen && "rotate-180")} />
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-[calc(100%+12px)] right-0 w-64 bg-white rounded-[2rem] shadow-2xl border-4 border-slate-100 p-4 animate-in zoom-in-95 origin-top-right overflow-hidden">
                  <div className="flex flex-col gap-1.5">
                    {user.role === 'admin' && (
                      <Link 
                        href="/admin/dashboard" 
                        className="flex items-center gap-3 px-5 py-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 hover:bg-amber-100 transition-all group/item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4.5 h-4.5 group-hover/item:scale-110 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Trang quản trị 👑</span>
                      </Link>
                    )}
                    
                    <button 
                      onClick={() => { onToggleSaved(); setIsUserMenuOpen(false); }}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 text-slate-600 rounded-2xl transition-all group/item text-left"
                    >
                      <Bookmark className="w-4.5 h-4.5 group-hover/item:scale-110 group-hover/item:text-amber-600 transition-all" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Danh sách đã lưu</span>
                    </button>

                    <button 
                      onClick={() => { onOpenFeedback(); setIsUserMenuOpen(false); }}
                      className="flex items-center gap-3 px-5 py-4 w-full hover:bg-slate-50 text-slate-600 rounded-2xl transition-all group/item border-b border-slate-50 mb-1 text-left"
                    >
                      <MessageSquare className="w-4.5 h-4.5 group-hover/item:scale-110 group-hover/item:text-amber-600 transition-all" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Góp ý cho admin</span>
                    </button>

                    <button 
                      onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all group/item text-left"
                    >
                      <LogOut className="w-4.5 h-4.5 group-hover/item:scale-110 transition-all" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onOpenLogin} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-amber-600 pr-4 border-r-2 border-slate-100 transition-colors">Login</button>
          )}

          <button 
            onClick={onOpenAdd}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-900/10"
          >
            <Plus className="w-4.5 h-4.5" />
            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Thêm địa điểm</span>
          </button>
        </div>
      </div>
    </header>
  );
}
