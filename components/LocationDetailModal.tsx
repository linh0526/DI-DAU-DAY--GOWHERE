'use client';

import { useEffect } from 'react';
import { X, Bookmark, Clock, Banknote, MapPin, Phone, FileText, AlertTriangle, Sparkles, ExternalLink, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Location, User } from '@/types';

interface LocationDetailModalProps {
  location: Location;
  onClose: () => void;
  user: User | null;
  onLike: (id: string) => Promise<void>;
  onReport: () => void;
  onAddFeedback: (id: string, text: string) => Promise<void>;
  feedbackText: string;
  setFeedbackText: (val: string) => void;
}

export default function LocationDetailModal({
  location,
  onClose,
  user,
  onLike,
  onReport,
  onAddFeedback,
  feedbackText,
  setFeedbackText,
}: LocationDetailModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-5xl h-fit md:h-[92vh] overflow-hidden rounded-[3rem] flex flex-col md:flex-row animate-in slide-in-from-bottom-8 shadow-2xl">
        <button 
          onClick={onReport} 
          className="absolute top-8 left-8 z-10 px-5 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all shadow-xl shadow-red-900/20 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest animate-in fade-in"
        >
          <AlertTriangle className="w-4 h-4" />
          Báo cáo
        </button>
        <button onClick={onClose} className="absolute top-8 right-8 z-10 p-3 bg-white/90 backdrop-blur rounded-2xl hover:bg-red-500 hover:text-white transition-all group border border-slate-100"><X className="w-5 h-5" /></button>
        
        {/* LEFT: Image & Map */}
        <div className="w-full md:w-1/2 h-auto md:h-full bg-slate-50 flex flex-col border-r-2 border-slate-100 flex-shrink-0">
          <div className="relative h-[50%] w-full overflow-hidden bg-white">
            <img src={location.image || 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42339?auto=format&fit=crop&w=1200&q=80'} className="w-full h-full object-cover" alt={location.name} />
            <div className="absolute top-6 right-6 flex flex-col gap-3">
              <button 
                onClick={() => onLike(location._id)}
                className="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-amber-600 hover:scale-110 active:scale-90 transition-all group"
                title="Lưu quán này"
              >
                <Bookmark className={cn("w-6 h-6", location.isLiked ? "fill-amber-600" : "fill-none")} />
              </button>
            </div>

            {/* Directions Button Overlay on Image */}
            <div className="absolute bottom-6 left-6 right-6">
              <a 
                href={location.googleMapsUrl || `https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full bg-amber-600/90 backdrop-blur-md text-white px-4 py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-amber-900/20"
              >
                <MapPin className="w-4 h-4" />
                Google Maps
              </a>
            </div>
          </div>

          {/* INFO PANEL ON LEFT */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-10 space-y-8 bg-white border-b-2 border-slate-100">
              {/* Address Section */}
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tọa lạc tại</p>
                <p className="text-sm font-bold text-slate-800 leading-relaxed">{location.address || 'Đang cập nhật'}</p>
              </div>

              {/* Parallel Hours & Budget */}
              <div className="flex flex-wrap gap-x-10 gap-y-6 pt-6 border-t border-slate-50">
                <div className="min-w-fit">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Giờ mở cửa</p>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                    {location.openingHours?.open || location.openingHours?.close 
                      ? `${location.openingHours.open || '??:??'} - ${location.openingHours.close || '??:??'}` 
                      : 'Đang cập nhật'}
                  </p>
                </div>
                {location.priceSegment && (
                  <div className="min-w-fit">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Giá</p>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight capitalize">{location.priceSegment}</p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="pt-2 flex flex-wrap gap-x-10 gap-y-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Liên hệ</p>
                  <p className="text-sm font-black text-slate-800">{location.phoneNumber || 'Đang cập nhật'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Facebook</p>
                  {location.facebookUrl ? (
                    <a href={location.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-amber-600 hover:text-amber-700 underline flex items-center gap-1">
                       Xem trang <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-sm font-black text-slate-800">Đang cập nhật</p>
                  )}
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Website</p>
                  {location.website ? (
                    <a href={location.website} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-amber-600 hover:text-amber-700 underline flex items-center gap-1">
                       Truy cập <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-sm font-black text-slate-800">Đang cập nhật</p>
                  )}
                </div>
              </div>
            </div>

            {location.note && (
              <div className="p-8 bg-amber-50 m-6 rounded-3xl border-2 border-amber-100 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-3 text-amber-700">
                  <FileText className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ghi chú</span>
                </div>
                <p className="text-sm text-amber-900 font-bold leading-relaxed italic">"{location.note}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-white">
          <div className="max-w-3xl mx-auto">
              <div className="mb-10 text-center md:text-left">
                <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mb-6">
                  {location.tags.map(t => <span key={t} className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-slate-100">{t}</span>)}
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter leading-tight text-slate-900">{location.name}</h2>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4 mb-2">
                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-amber-700">{location.googleRating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {location.googleReviewCount?.toLocaleString('vi-VN') || 0} Đánh giá từ Google Maps
                  </div>
                </div>
                <div className="w-10 h-1 bg-amber-600 rounded-full mx-auto md:mx-0 mb-10"></div>
              </div>

            {/* Feedback Section */}
            <div className="border-t-2 border-slate-100 pt-16">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-1">Cộng đồng nói gì?</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Góc chia sẻ trải nghiệm thực tế</p>
                </div>
                <div className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">{location.feedback?.filter(f => !f.isHidden).length || 0} Nhận xét</div>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onAddFeedback(location._id, feedbackText);
                }}
                className="mb-16 relative"
              >
                <textarea 
                  value={feedbackText} 
                  onChange={(e) => setFeedbackText(e.target.value)} 
                  placeholder="Bạn thấy quán này như thế nào?..." 
                  className="w-full p-6 pr-24 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:bg-white focus:border-amber-600 focus:ring-8 focus:ring-amber-50/50 transition-all min-h-[90px] text-sm font-medium placeholder:text-slate-400" 
                />
                <button 
                  type="submit" 
                  className="absolute right-3 bottom-3 bg-amber-600 text-white p-3.5 rounded-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-amber-900/10 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest pr-1 hidden sm:block">Gửi</span>
                </button>
              </form>

              <div className="space-y-10">
                {location.feedback?.filter(f => !f.isHidden).map((f, i) => (
                  <div key={i} className="group border-l-4 border-slate-100 pl-8 hover:border-amber-600 transition-all duration-500">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-black text-xs text-amber-600 uppercase tracking-widest">{f.user}</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{new Date(f.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="text-slate-700 text-base font-medium leading-[1.6] group-hover:text-slate-900 transition-colors">{f.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
