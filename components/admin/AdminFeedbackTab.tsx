'use client';

import { Mail, MessageSquare } from 'lucide-react';

interface SystemFeedback {
  email?: string;
  message: string;
  createdAt: string;
}

interface AdminFeedbackTabProps {
  allFeedbacks: SystemFeedback[];
}

export default function AdminFeedbackTab({ allFeedbacks }: AdminFeedbackTabProps) {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-14">
        <h1 className="text-5xl font-black tracking-tighter uppercase text-slate-900">Tin nhắn từ cộng đồng</h1>
        <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em] mt-3">
          Lắng nghe ý kiến đóng góp của người dùng
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {allFeedbacks.map((f, idx) => (
          <div
            key={idx}
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:border-amber-600 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Người gửi</p>
                  <p className="text-sm font-black uppercase tracking-tight text-slate-900">
                    {f.email || 'Ẩn danh'}
                  </p>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl">
                {new Date(f.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-8 rounded-3xl italic">
              "{f.message}"
            </p>
          </div>
        ))}
        {allFeedbacks.length === 0 && (
          <div className="bg-white p-32 rounded-[4rem] border border-dashed border-slate-200 text-center">
            <Mail className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Hòm thư đang trống rỗng</p>
          </div>
        )}
      </div>
    </div>
  );
}

