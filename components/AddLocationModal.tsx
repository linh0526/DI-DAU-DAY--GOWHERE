'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface AddLocationModalProps {
  onClose: () => void;
  userLocation: string;
  setUserLocation: (val: string) => void;
}

export default function AddLocationModal({
  onClose,
  userLocation,
  setUserLocation,
}: AddLocationModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [activeCity, setActiveCity] = useState<any>(null);

  useEffect(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllCategories(data.map(t => typeof t === 'string' ? t : t.name));
        }
      });

    fetch('/api/cities')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCities(data);
          // Auto select first city or userLocation if match found
          const initialCity = data.find((c: any) => c.slug === userLocation) || data[0];
          setActiveCity(initialCity);
        }
      });
  }, []);

  useEffect(() => {
    if (cities.length > 0) {
      const match = cities.find(c => c.slug === userLocation);
      if (match) setActiveCity(match);
    }
  }, [userLocation, cities]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedTags.length === 0) {
      toast.error('Vui lòng chọn ít nhất một phân loại món!');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.get('name'), 
          city: formData.get('city'), 
          district: formData.get('district'), 
          address: formData.get('address'), 
          tags: selectedTags,
          priceSegment: formData.get('price'),
          openingHours: { open: formData.get('open'), close: formData.get('close') },
          note: formData.get('note'),
          facebookUrl: formData.get('menu'),
          phoneNumber: formData.get('phone'),
          image: formData.get('image'),
          googleMapsUrl: formData.get('googleMapsUrl'),
          status: 'inactive' // Wait for admin to approve
        })
      });

      if (res.ok) {
        toast.success('🎉 Cảm ơn bạn! Địa điểm đã được gửi và đang chờ kiểm duyệt.');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        toast.error('Gửi đề xuất thất bại. Vui lòng thử lại sau.');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi dữ liệu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      <form 
        onSubmit={handleSubmit}
        className="relative bg-white w-full max-w-2xl rounded-[3.5rem] p-12 animate-in zoom-in-95 overflow-y-auto max-h-[90vh] custom-scrollbar border-4 border-slate-100 shadow-2xl"
      >
        <div className="text-center mb-12">
          <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 italic">Góp quán sịn cho cộng đồng</h3>
          <div className="w-12 h-1.5 bg-amber-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Tỉnh </label>
              <select 
                name="city" 
                value={userLocation} 
                className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-xs font-black uppercase tracking-wider focus:border-amber-600 transition-all appearance-none" 
                onChange={(e) => setUserLocation(e.target.value)}
              >
                {cities.map(city => <option key={city.slug} value={city.slug}>{city.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Thành phố/ Quận</label>
                <select name="district" className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-xs font-black uppercase tracking-wider focus:border-amber-600 transition-all appearance-none">
                {activeCity?.districts.map((d: any) => <option key={d.slug} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Tên địa điểm</label>
                <input name="name" required placeholder="Vd: Phở Thìn Lò Đúc" className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-amber-600 transition-all" />
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">SĐT liên hệ</label>
                <input name="phone" placeholder="Vd: 0912..." className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-amber-600 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Địa chỉ chi tiết</label>
              <input name="address" required placeholder="Số nhà, tên đường, tòa nhà..." className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-amber-600 transition-all" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Mức giá</label>
              <input name="price" placeholder="Vd: 30k - 50k" className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-amber-600 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Mở cửa</label>
              <input name="open" type="time" className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Đóng cửa</label>
              <input name="close" type="time" className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-xs" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end px-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Phân loại món</label>
              <p className="text-[9px] font-bold text-slate-400">Có thể chọn nhiều tag</p>
            </div>
            
            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-3xl border-2 border-slate-100">
              <div className="flex flex-wrap gap-2">
                       {allCategories.map(tag => (
                          <button 
                            key={tag} 
                            type="button" 
                            onClick={() => toggleTag(tag)}
                            className={cn(
                              "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                              selectedTags.includes(tag) 
                                ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-900/10" 
                                : "bg-slate-50 border-transparent text-slate-500 hover:border-slate-200"
                            )}
                          >
                             {tag}
                             {selectedTags.includes(tag) && <Check className="w-3 h-3 ml-2" />}
                          </button>
                       ))}
                    </div>
              
              <div className="flex items-center gap-2 mt-2 w-full">
                <input 
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  placeholder="Thêm tag khác..." 
                  className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold outline-none focus:border-amber-600"
                />
                <button 
                  type="button"
                  onClick={addCustomTag}
                  className="p-2 bg-slate-900 text-white rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 px-2">
                {selectedTags.map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100 group animate-in zoom-in-90">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer hover:text-amber-900" onClick={() => toggleTag(tag)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Link Google Maps</label>
              <input name="googleMapsUrl" placeholder="https://www.google.com/maps/..." className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-amber-600 transition-all font-outfit" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Link ảnh quán</label>
              <input name="image" placeholder="sao chép địa chỉ hình ảnh và dán" className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-amber-600 transition-all font-outfit" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Link Facebook (nếu có)</label>
            <input name="menu" placeholder="https://facebook.com/tenquan..." className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-amber-600 transition-all font-outfit" />
          </div>

          <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Ghi chú (Cảm nhận nhanh)</label>
              <textarea name="note" placeholder="Vd: Ghi chú (tips đi ăn, món ngon, giá/ng, không ck,...)" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none text-sm font-medium min-h-[120px] focus:border-amber-600 transition-all font-vietnam" />
          </div>

          <div className="flex gap-6 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Hủy thao tác</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`flex-[2] py-5 bg-amber-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-xl shadow-amber-900/10 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Đanh gửi...' : 'Gửi đề xuất nngay'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
