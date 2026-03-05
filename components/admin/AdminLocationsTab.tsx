'use client';

import { MapPin, Clock, Image as ImageIcon, CheckCircle2, XCircle, Trash2, Edit3, ChevronLeft } from 'lucide-react';
import { useState, useMemo } from 'react';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 10;
import { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Location {
  _id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  priceSegment: string;
  tags: string[];
  status: 'active' | 'inactive' | 'closed' | 'maintenance';
  openingHours?: { open: string; close: string };
  image?: string;
  likes: number;
  upvotes: number;
  views: number;
  saves: number;
  googleRating?: number;
  googleReviewCount?: number;
  feedback: any[];
  reports: any[];
}

interface AdminLocationsTabProps {
  locations: Location[];
  filteredLocations: Location[];
  selectedLocations: string[];
  cities: any[];
  setSelectedLocations: (ids: string[]) => void;
  adminSearch: string;
  adminCity: string;
  adminDistrict: string;
  adminStatus: string;
  adminTag: string;
  allTags: any[];
  setAdminSearch: (v: string) => void;
  setAdminCity: (v: string) => void;
  setAdminDistrict: (v: string) => void;
  setAdminStatus: (v: string) => void;
  setAdminTag: (v: string) => void;
  onOpenCreate: () => void;
  onOpenEdit: (loc: Location) => void;
  onDelete: (id: string) => void;
  onBulkDelete: () => void;
  onExcelImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importing: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function AdminLocationsTab({
  locations,
  filteredLocations,
  selectedLocations,
  cities,
  setSelectedLocations,
  adminSearch,
  adminCity,
  adminDistrict,
  adminStatus,
  adminTag,
  allTags,
  setAdminSearch,
  setAdminCity,
  setAdminDistrict,
  setAdminStatus,
  setAdminTag,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onBulkDelete,
  onExcelImport,
  importing,
  fileInputRef,
}: AdminLocationsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedLocations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLocations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLocations, currentPage]);

  const totalPages = Math.ceil(filteredLocations.length / ITEMS_PER_PAGE);

  // Reset page when filter changes
  useMemo(() => {
    setCurrentPage(1);
  }, [adminSearch, adminCity, adminDistrict, adminStatus, adminTag]);

  const isAllSelected = filteredLocations.length > 0 && selectedLocations.length === filteredLocations.length;

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-14">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase text-slate-900 flex items-center gap-4">
            Quản lý kho dữ liệu
            <span className="text-2xl text-amber-600 bg-amber-50 px-5 py-1.5 rounded-2xl border border-amber-100/50">{filteredLocations.length}</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em] mt-3">
            Thêm, sửa và điều chỉnh trạng thái địa điểm
          </p>
        </div>
        <div className="flex gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onExcelImport}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-slate-900 text-white px-8 py-5 rounded-2xl flex items-center gap-4 font-black text-sm uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <ImageIcon className="w-5 h-5 text-amber-500" />
            {importing ? 'Đang xử lý...' : 'Nhập Excel'}
          </button>
          <button
            onClick={onOpenCreate}
            className="bg-amber-600 text-white px-10 py-5 rounded-2xl flex items-center gap-4 font-black text-sm uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all"
          >
            <MapPin className="w-6 h-6" />
            Thêm quán mới
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
        {/* FILTERS */}
        <div className="p-10 border-b border-slate-50 flex flex-wrap items-center gap-6 bg-slate-50/50">
          <div className="flex-1 min-w-[300px] relative">
            <input
              type="text"
              placeholder="Tìm kiếm địa điểm..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4.5 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-bold outline-none focus:border-amber-600 transition-all shadow-sm"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
              <MapPin className="w-5 h-5" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <select
              value={adminCity}
              onChange={(e) => setAdminCity(e.target.value)}
              className="px-6 py-4.5 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-600 shadow-sm"
            >
              <option value="all">📍 Tỉnh thành</option>
              {cities.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>

            <select
              value={adminDistrict}
              onChange={(e) => setAdminDistrict(e.target.value)}
              className="px-6 py-4.5 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-600 shadow-sm"
            >
              <option value="all">🏘️ Quận huyện</option>
              {cities.find(c => c.slug === adminCity)?.districts.map((d: any) => (
                <option key={d.slug} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={adminStatus}
              onChange={(e) => setAdminStatus(e.target.value)}
              className="px-6 py-4.5 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-600 shadow-sm"
            >
              <option value="all">🚦 Trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm ngưng</option>
              <option value="maintenance">Sửa chữa</option>
              <option value="closed">Đã đóng</option>
            </select>

            <select
              value={adminTag}
              onChange={(e) => setAdminTag(e.target.value)}
              className="px-6 py-4.5 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-600 shadow-sm"
            >
              <option value="all">🏷️ Phân loại</option>
              {allTags.filter(t => t.status === 'approved').map((tag) => (
                <option key={tag._id} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </select>

            {selectedLocations.length > 0 && (
              <button
                onClick={onBulkDelete}
                className="bg-red-50 text-red-600 px-6 py-4.5 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Xóa ({selectedLocations.length})
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-6 w-16">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-600 cursor-pointer"
                    checked={isAllSelected}
                    onChange={(e) =>
                      setSelectedLocations(e.target.checked ? filteredLocations.map((l) => l._id) : [])
                    }
                  />
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Địa điểm
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Khu vực
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Thông tin
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Trạng thái
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedLocations.map((loc) => (
                <tr
                  key={loc._id}
                  className={cn(
                    'hover:bg-slate-50 transition-colors group',
                    selectedLocations.includes(loc._id) ? 'bg-amber-50/50' : ''
                  )}
                >
                  <td className="px-8 py-8 w-16">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-600 cursor-pointer"
                      checked={selectedLocations.includes(loc._id)}
                      onChange={(e) =>
                        setSelectedLocations(
                          e.target.checked
                            ? [...selectedLocations, loc._id]
                            : selectedLocations.filter((id) => id !== loc._id)
                        )
                      }
                    />
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-slate-100 overflow-hidden border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                        {loc.image ? (
                          <img src={loc.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                          {loc.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {loc.openingHours ? `${loc.openingHours.open} - ${loc.openingHours.close}` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <p className="font-black text-[10px] uppercase text-slate-900">{loc.district}</p>
                    <p className="text-[10px] font-black text-amber-600 mt-1 uppercase tracking-widest">
                      {cities.find(c => c.slug === loc.city)?.name || loc.city}
                    </p>
                  </td>
                  <td className="px-8 py-8">
                    <div className="space-y-2">
                      {loc.priceSegment && (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          💰 {loc.priceSegment}
                        </p>
                      )}
                      {loc.googleRating ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-100/50 w-fit">
                           ⭐ {loc.googleRating.toFixed(1)} ({loc.googleReviewCount?.toLocaleString('vi-VN')})
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-1">
                        {loc.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded-lg border border-slate-100 text-[8px] font-black uppercase tracking-tighter"
                          >
                            {t}
                          </span>
                        ))}
                        {loc.tags.length > 2 && (
                          <span className="text-[8px] font-black text-amber-600">+ {loc.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest',
                        loc.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : loc.status === 'inactive'
                          ? 'bg-slate-50 text-slate-400 border border-slate-100'
                          : loc.status === 'maintenance'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      )}
                    >
                      {loc.status === 'active' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : loc.status === 'inactive' ? (
                        <Clock className="w-3 h-3" />
                      ) : loc.status === 'maintenance' ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {loc.status === 'active'
                        ? 'Hoạt động'
                        : loc.status === 'inactive'
                        ? 'Tạm ngưng'
                        : loc.status === 'maintenance'
                        ? 'Sửa chữa'
                        : 'Đóng cửa'}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => onOpenEdit(loc)}
                        className="p-3 bg-slate-100 text-slate-400 hover:bg-amber-500 hover:text-white rounded-xl hover:scale-110 transition-all shadow-lg shadow-slate-200/50"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(loc._id)}
                        className="p-3 bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white rounded-xl hover:scale-110 transition-all shadow-lg shadow-slate-200/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLocations.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-32 text-center text-slate-400 font-black uppercase text-xs tracking-[0.2em]"
                  >
                    Không tìm thấy địa điểm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="my-8"
        />
      </div>
    </div>
  );
}
