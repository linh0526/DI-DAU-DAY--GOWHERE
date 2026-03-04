'use client';

import { MapPin } from 'lucide-react';
import { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FeedbackItem {
  _id: string;
  user: string;
  comment: string;
  isHidden: boolean;
  date: string;
}

interface LocationWithFeedback {
  _id: string;
  name: string;
  district: string;
  feedback: FeedbackItem[];
}

interface AdminContentTabProps {
  locations: LocationWithFeedback[];
  onToggleFeedbackModeration: (locId: string, feedbackId: string, isHidden: boolean) => void;
}

export default function AdminContentTab({ locations, onToggleFeedbackModeration }: AdminContentTabProps) {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-14">
        <h1 className="text-5xl font-black tracking-tighter uppercase text-slate-900">Kiểm duyệt cộng đồng</h1>
        <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em] mt-3">
          Quản lý nhận xét và hình ảnh từ người dùng
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10">
        {locations
          .filter((l) => l.feedback?.length > 0)
          .map((loc) => (
            <div key={loc._id} className="bg-white p-10 rounded-[3rem] border border-slate-100">
              <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-xl">{loc.name}</h3>
                  <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">{loc.district}</p>
                </div>
              </div>

              <div className="space-y-6">
                {loc.feedback.map((f) => (
                  <div
                    key={f._id}
                    className={cn(
                      'p-6 rounded-3xl transition-all',
                      f.isHidden
                        ? 'bg-red-50/30 border border-red-50 grayscale'
                        : 'bg-slate-50 border border-slate-100',
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-black uppercase text-slate-900">{f.user}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          {new Date(f.date).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {f.isHidden ? (
                          <button
                            onClick={() => onToggleFeedbackModeration(loc._id, f._id, false)}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
                          >
                            Hiển thị lại
                          </button>
                        ) : (
                          <button
                            onClick={() => onToggleFeedbackModeration(loc._id, f._id, true)}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
                          >
                            Ẩn đánh giá
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{f.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

