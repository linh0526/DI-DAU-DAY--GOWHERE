'use client';

import { Plus, Trash2 } from 'lucide-react';
import { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LocationFormData {
  name: string;
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  priceSegment: string;
  tags: string[];
  note: string;
  phone: string;
  open: string;
  close: string;
  menu: string;
  image: string;
  facebookUrl: string;
  website: string;
  googleMapsUrl: string;
  status: string;
}

interface AdminLocationFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: LocationFormData;
  allTags: { name: string; status: string }[];
  customTag: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setFormData: (data: LocationFormData) => void;
  setCustomTag: (v: string) => void;
  onToggleTag: (tag: string) => void;
  onAddCustomTag: () => void;
  onParseGoogleMapsUrl: (url: string) => void;
  cities: any[];
}

export default function AdminLocationFormModal({
  isOpen,
  isEditing,
  formData,
  allTags,
  customTag,
  onClose,
  onSubmit,
  setFormData,
  setCustomTag,
  onToggleTag,
  onAddCustomTag,
  onParseGoogleMapsUrl,
  cities
}: AdminLocationFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-md animate-in fade-in transition-all">
      <div className="absolute inset-0" onClick={onClose}></div>
      <form
        onSubmit={onSubmit}
        className="relative bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[4rem] p-14 custom-scrollbar border-8 border-slate-100"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">
            {isEditing ? 'Cập nhật địa điểm' : 'Thêm đề xuất mới'} 🔥
          </h2>
          <div className="w-16 h-1.5 bg-amber-600 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="space-y-12">
          {/* Section 1: Core Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-6 bg-slate-900 rounded-full"></div>
              <h4 className="font-black uppercase tracking-widest text-xs text-slate-900">1. Thông tin cốt lõi</h4>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Tỉnh / Thành</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value, district: '' })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4.5 px-8 font-black text-xs outline-none focus:border-amber-600 transition-all appearance-none uppercase tracking-wider"
                >
                  <option value="">Chọn tỉnh thành</option>
                  {cities.map((city) => (
                    <option key={city.slug} value={city.slug}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Quận / Huyện</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4.5 px-8 font-black text-xs outline-none focus:border-amber-600 transition-all appearance-none uppercase tracking-wider"
                >
                  <option value="">Chọn quận huyện</option>
                  {cities.find(c => c.slug === formData.city)?.districts.map((d: any) => (
                    <option key={d.slug} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <input
              required
              placeholder="Tên quán ăn / Cafe..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4.5 px-8 text-sm font-bold outline-none focus:bg-white focus:border-amber-600 transition-all"
            />
            <input
              required
              placeholder="Địa chỉ chi tiết..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4.5 px-8 text-sm font-bold outline-none focus:bg-white focus:border-amber-600 transition-all"
            />
          </div>

          {/* Section 2: Utilities & Media */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-6 bg-amber-600 rounded-full"></div>
              <h4 className="font-black uppercase tracking-widest text-xs text-slate-900">2. Tiện ích & Phương tiện</h4>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Số điện thoại</label>
                <input
                  placeholder="VD: 0912..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4.5 px-8 text-sm font-bold outline-none focus:bg-white focus:border-amber-600 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Trạng thái quán</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4.5 px-8 font-black text-xs outline-none focus:border-amber-600 transition-all appearance-none uppercase tracking-wider"
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm ngưng</option>
                  <option value="maintenance">Đang sửa chữa</option>
                  <option value="closed">Đã đóng cửa</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Mức giá</label>
                <input
                  placeholder="VD: 50k - 100k"
                  value={formData.priceSegment}
                  onChange={(e) => setFormData({ ...formData, priceSegment: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4.5 px-8 text-sm font-bold outline-none focus:bg-white focus:border-amber-600 transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Mở cửa</label>
                  <input
                    type="time"
                    value={formData.open}
                    onChange={(e) => setFormData({ ...formData, open: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4 px-6 font-black text-xs outline-none focus:bg-white focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Đóng cửa</label>
                  <input
                    type="time"
                    value={formData.close}
                    onChange={(e) => setFormData({ ...formData, close: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4 px-6 font-black text-xs outline-none focus:bg-white focus:border-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* Multi-select Tags Section */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                Phân loại món (Tags)
              </label>
              <div className="flex flex-wrap gap-2 p-6 bg-white border-2 border-slate-100 rounded-[2.5rem]">
                {allTags
                  .filter((t) => t.status === 'approved')
                  .map((t) => t.name)
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onToggleTag(t)}
                      className={cn(
                        'px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                        formData.tags.includes(t)
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/10 scale-105'
                          : 'bg-slate-50 text-slate-400 border border-transparent hover:border-amber-600 hover:text-amber-600',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                <div className="flex items-center gap-2 ml-2">
                  <input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddCustomTag())}
                    placeholder="Thêm nhanh..."
                    className="bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold outline-none focus:bg-white focus:border-amber-600 w-32"
                  />
                  <button
                    type="button"
                    onClick={onAddCustomTag}
                    className="p-2 bg-slate-900 text-white rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 italic">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100"
                    >
                      {tag}
                      <Trash2
                        className="w-3 h-3 cursor-pointer hover:text-red-600"
                        onClick={() => onToggleTag(tag)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: GPS & Notes */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
              <h4 className="font-black uppercase tracking-widest text-xs text-slate-900">
                3. Vị trí chính xác & Ghi chú
              </h4>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                Dán Link Google Maps
              </label>
              <div className="relative group/map">
                <input
                  placeholder="https://www.google.com/maps/place/..."
                  value={formData.googleMapsUrl}
                  onChange={(e) => onParseGoogleMapsUrl(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4.5 px-8 pr-32 text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all font-outfit"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                  Link ảnh minh họa
                </label>
                <input
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4.5 px-8 text-sm font-bold outline-none focus:bg-white focus:border-amber-600 transition-all font-outfit"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                  Link Facebook
                </label>
                <input
                  placeholder="https://facebook.com/..."
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4.5 px-8 text-sm font-bold outline-none focus:bg-white focus:border-amber-600 transition-all font-outfit"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                  Link Website
                </label>
                <input
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-4.5 px-8 text-sm font-bold outline-none focus:bg-white focus:border-amber-600 transition-all font-outfit"
                />
              </div>
            </div>
            <textarea
              placeholder="Ghi chú (tips đi ăn, món ngon, giá/ng, không ck,...)"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] py-8 px-10 text-sm font-bold h-40 outline-none resize-none focus:bg-white focus:border-amber-600 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-6 mt-16 border-t-4 border-slate-50 pt-10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all"
          >
            Hủy thao tác
          </button>
          <button
            type="submit"
            className="flex-[2] bg-slate-900 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-amber-600 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Lưu địa điểm ngay
          </button>
        </div>
      </form>
    </div>
  );
}

