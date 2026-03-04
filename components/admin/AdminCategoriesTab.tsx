'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, ChevronRight, MapPin, Search, Globe, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface District {
  _id?: string;
  name: string;
  slug: string;
  count?: number;
}

interface City {
  _id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  districts: District[];
  count?: number;
}

interface AdminCategoriesTabProps {
  cities: City[];
  onNavigateToLocations: (citySlug?: string, districtName?: string) => void;
  onRefresh: () => void;
}

export default function AdminCategoriesTab({ cities, onNavigateToLocations, onRefresh }: AdminCategoriesTabProps) {
  const [search, setSearch] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<string | null>(cities[0]?._id || null);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [editingCity, setEditingCity] = useState<Partial<City>>({});
  const [newDistrictName, setNewDistrictName] = useState('');
  const [isAddingCity, setIsAddingCity] = useState(false);

  const [editingDistId, setEditingDistId] = useState<string | null>(null);
  const [editingDistName, setEditingDistName] = useState('');
  const [editingDistSlug, setEditingDistSlug] = useState('');

  const selectedCity = cities.find(c => c._id === selectedCityId);

  const handleUpdateCity = async () => {
    if (!editingCity.name || !editingCity.slug) return;
    try {
      const res = await fetch('/api/admin/cities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCity)
      });
      if (res.ok) {
        toast.success('Đã cập nhật tỉnh thành');
        setIsEditingCity(false);
        onRefresh();
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật');
    }
  };

  const handleDeleteCity = async (id: string) => {
    if (!confirm('Xác nhận xóa tỉnh thành này? Tất cả dữ liệu liên quan sẽ bị ảnh hưởng.')) return;
    try {
      const res = await fetch(`/api/admin/cities?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Đã xóa');
        if (selectedCityId === id) setSelectedCityId(cities[0]?._id || null);
        onRefresh();
      }
    } catch (err) {
      toast.error('Lỗi khi xóa');
    }
  };

  const handleAddDistrict = async () => {
    if (!selectedCity || !newDistrictName.trim()) return;
    const slug = newDistrictName.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd').replace(/[^a-z0-9]/g, '').trim();
    
    const updatedDistricts = [...selectedCity.districts, { name: newDistrictName.trim(), slug }];
    
    try {
      const res = await fetch('/api/admin/cities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: selectedCity._id, districts: updatedDistricts })
      });
      if (res.ok) {
        toast.success('Đã thêm khu vực mới');
        setNewDistrictName('');
        onRefresh();
      }
    } catch (err) {
      toast.error('Lỗi khi thêm khu vực');
    }
  };

  const handleUpdateDistrict = async () => {
    if (!selectedCity || !editingDistId) return;
    const updatedDistricts = selectedCity.districts.map(d => 
      d._id === editingDistId ? { name: editingDistName, slug: editingDistSlug } : d
    );
    try {
      const res = await fetch('/api/admin/cities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: selectedCity._id, districts: updatedDistricts })
      });
      if (res.ok) {
        toast.success('Đã cập nhật khu vực');
        setEditingDistId(null);
        onRefresh();
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật khu vực');
    }
  };

  const handleDeleteDistrict = async (distId: string) => {
    if (!selectedCity) return;
    const updatedDistricts = selectedCity.districts.filter(d => d._id !== distId);
    try {
      const res = await fetch('/api/admin/cities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: selectedCity._id, districts: updatedDistricts })
      });
      if (res.ok) {
        toast.success('Đã xóa khu vực');
        onRefresh();
      }
    } catch (err) {
      toast.error('Lỗi khi xóa khu vực');
    }
  };

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">Danh mục hành chính</h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Quản lý Tỉnh/Thành phố & Quận/Huyện</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-280px)]">
        {/* LEFT: City List */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col overflow-hidden shadow-sm">
           <div className="p-6 border-b border-slate-50 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Tìm tỉnh thành..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-bold outline-none focus:border-amber-600 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button 
                onClick={() => { setIsAddingCity(true); setEditingCity({}); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-amber-900/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm tỉnh mới
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
              {cities.length === 0 ? (
                <div className="py-10 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest animate-pulse">Đang tải dữ liệu...</div>
              ) : filteredCities.length === 0 ? (
                <div className="py-10 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">Không tìm thấy kết quả</div>
              ) : (
                filteredCities.map(city => (
                  <div 
                    key={city._id}
                    onClick={() => { setSelectedCityId(city._id); setIsEditingCity(false); setIsAddingCity(false); setEditingDistId(null); }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-all group border-2 cursor-pointer outline-none",
                      selectedCityId === city._id 
                        ? "bg-amber-50 border-amber-100 text-amber-700 shadow-sm" 
                        : "bg-white border-transparent text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] transition-all",
                        selectedCityId === city._id ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                      )}>
                        {city.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-black uppercase tracking-tight">{city.name}</p>
                        <div className="flex items-center gap-2">
                           <p className="text-[8px] font-bold text-slate-400 font-mono tracking-widest">{city.slug}</p>
                           <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                           <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">{city.count || 0} quán</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onNavigateToLocations(city.slug); }}
                        className="p-2 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-amber-600 shadow-sm border border-slate-100"
                      >
                         <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", selectedCityId === city._id ? "text-amber-500 translate-x-1" : "text-slate-200")} />
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* RIGHT: Manager Area */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 p-10 flex flex-col overflow-hidden shadow-sm relative">
          {!selectedCity && !isAddingCity ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 text-center px-10">
              <Globe className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-black uppercase tracking-widest text-sm">Chọn một tỉnh thành để quản lý</p>
            </div>
          ) : isAddingCity ? (
            <div className="h-full flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
               <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">Thêm tỉnh/thành mới</h3>
                  <div className="w-10 h-1 bg-amber-600 mt-2 mb-8 rounded-full"></div>
               </div>
               
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tên hiển thị</label>
                    <input 
                      type="text" 
                      placeholder="Vd: Tiền Giang"
                      className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-amber-600 font-bold"
                      value={editingCity.name || ''}
                      onChange={(e) => setEditingCity({ ...editingCity, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Slug định danh</label>
                    <input 
                      type="text" 
                      placeholder="Vd: tiengiang"
                      className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-amber-600 font-mono text-sm"
                      value={editingCity.slug || ''}
                      onChange={(e) => setEditingCity({ ...editingCity, slug: e.target.value })}
                    />
                  </div>
               </div>
               
               <button 
                  onClick={async () => {
                    if (!editingCity.name || !editingCity.slug) return;
                    try {
                      const res = await fetch('/api/admin/cities', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...editingCity, districts: [] })
                      });
                      if (res.ok) {
                        toast.success('Đã thêm tỉnh mới');
                        setIsAddingCity(false);
                        setEditingCity({});
                        onRefresh();
                      }
                    } catch (err) { toast.error('Lỗi'); }
                  }}
                  className="mt-4 px-10 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-amber-600 transition-all self-start shadow-xl shadow-slate-900/10"
               >
                 Tạo danh mục mới
               </button>
            </div>
          ) : (
            <>
              {/* Header Info */}
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 bg-amber-600 rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-amber-900/20">
                     {selectedCity?.name.charAt(0)}
                   </div>
                   <div>
                      {isEditingCity ? (
                        <div className="flex gap-4 items-center">
                           <input 
                              className="text-2xl font-black uppercase tracking-tighter bg-slate-50 border-b-2 border-amber-600 px-2 outline-none" 
                              value={editingCity.name} 
                              onChange={(e) => setEditingCity({ ...editingCity, name: e.target.value })} 
                           />
                           <input 
                              className="text-xs font-mono font-bold text-amber-600 lowercase bg-slate-50 border-b-2 border-amber-600 px-2 outline-none" 
                              value={editingCity.slug} 
                              onChange={(e) => setEditingCity({ ...editingCity, slug: e.target.value })} 
                           />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">{selectedCity?.name}</h2>
                            <button onClick={() => { setIsEditingCity(true); setEditingCity(selectedCity!); }} className="p-2 hover:text-amber-600 text-slate-300 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 font-mono">{selectedCity?.slug}</p>
                        </>
                      )}
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   {isEditingCity ? (
                      <>
                        <button onClick={() => setIsEditingCity(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200">Hủy</button>
                        <button onClick={handleUpdateCity} className="px-5 py-2.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-900/10"><Save className="w-3.5 h-3.5" /> Lưu lại</button>
                      </>
                   ) : (
                      <button onClick={() => handleDeleteCity(selectedCity!._id)} className="p-3.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 className="w-5 h-5" /></button>
                   )}
                </div>
              </div>

              {/* Districts Manager */}
              <div className="flex-1 flex flex-col min-h-0">
                 <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Danh sách các khu vực ({selectedCity?.districts.length})</h4>
                    <div className="flex items-center gap-3">
                       <input 
                          type="text" 
                          placeholder="Tên Quận/Huyện mới..." 
                          className="px-4 py-2.5 bg-slate-50 rounded-xl text-[11px] font-bold border-2 border-slate-100 focus:border-amber-500 outline-none w-48 transition-all"
                          value={newDistrictName}
                          onChange={(e) => setNewDistrictName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddDistrict()}
                       />
                       <button 
                        onClick={handleAddDistrict}
                        className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-amber-600 transition-all shadow-lg"
                       >
                         <Plus className="w-4 h-4" />
                       </button>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                       {selectedCity?.districts.map((dist, index) => (
                          <div 
                            key={dist._id || `${dist.slug}-${index}`}
                            className={cn(
                             "group relative p-6 bg-slate-50 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer",
                             editingDistId === dist._id ? "border-amber-600 bg-white shadow-xl shadow-amber-900/5" : "border-slate-100 hover:border-amber-200 hover:bg-white hover:shadow-xl hover:shadow-slate-100"
                            )}
                            onClick={() => {
                              if (!editingDistId) {
                                onNavigateToLocations(selectedCity.slug, dist.name);
                              }
                            }}
                          >
                             {editingDistId === dist._id ? (
                               <div className="space-y-3" onClick={e => e.stopPropagation()}>
                                  <input 
                                    className="w-full text-[11px] font-black uppercase tracking-tight bg-slate-50 border-b border-amber-500 outline-none p-1" 
                                    value={editingDistName} 
                                    onChange={(e) => setEditingDistName(e.target.value)}
                                  />
                                  <input 
                                    className="w-full text-[9px] font-mono font-bold text-amber-600 lowercase outline-none bg-slate-50 p-1" 
                                    value={editingDistSlug} 
                                    onChange={(e) => setEditingDistSlug(e.target.value)}
                                  />
                                  <div className="flex gap-2 pt-2">
                                     <button onClick={handleUpdateDistrict} className="flex-1 bg-amber-600 text-white rounded-lg py-1.5 text-[8px] font-black uppercase tracking-widest">Lưu</button>
                                     <button onClick={() => setEditingDistId(null)} className="flex-1 bg-slate-100 text-slate-500 rounded-lg py-1.5 text-[8px] font-black uppercase tracking-widest">Hủy</button>
                                  </div>
                               </div>
                             ) : (
                               <>
                                 <div className="flex flex-col gap-1.5 pt-2">
                                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-800">{dist.name}</span>
                                    <div className="flex items-center justify-between">
                                       <span className="text-[9px] font-bold text-slate-300 font-mono lowercase tracking-widest">{dist.slug}</span>
                                       <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">{dist.count || 0} quán</span>
                                    </div>
                                 </div>
                                 <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" onClick={e => e.stopPropagation()}>
                                    <button 
                                      onClick={() => {
                                        setEditingDistId(dist._id || null);
                                        setEditingDistName(dist.name);
                                        setEditingDistSlug(dist.slug);
                                      }}
                                      className="p-2 text-slate-300 hover:text-amber-600 transition-colors"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteDistrict(dist._id!)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                 </div>
                                 <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-60 transition-all -translate-x-2 group-hover:translate-x-0" />
                               </>
                             )}
                          </div>
                       ))}
                       {selectedCity?.districts.length === 0 && (
                         <div className="col-span-full py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                           <MapPin className="w-10 h-10 mb-4 opacity-20" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Chưa có khu vực nào được thêm</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
