'use client';

import { AlertTriangle } from 'lucide-react';
import { Location, User } from '@/types';

interface ReportModalProps {
  location: Location;
  onClose: () => void;
  reportText: string;
  setReportText: (val: string) => void;
  onSubmit: (id: string, text: string) => Promise<void>;
  user: User | null;
  onOpenLogin: () => void;
}

export default function ReportModal({
  location,
  onClose,
  reportText,
  setReportText,
  onSubmit,
  user,
  onOpenLogin,
}: ReportModalProps) {
  const handleSubmit = async () => {
    if (!user) {
      onOpenLogin();
      return;
    }
    await onSubmit(location._id, reportText);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] p-12 animate-in zoom-in-95 border-4 border-slate-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Báo cáo vấn đề</h3>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Giúp admin kiểm chứng thông tin nhé</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Bạn muốn nhắn gì admin?</label>
                <textarea 
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Vd: Quán đã đóng cửa, sai địa chỉ, hoặc thực đơn đã thay đổi..." 
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none text-sm font-medium min-h-[140px] focus:border-amber-600 transition-all" 
                />
            </div>

            <div className="flex gap-4">
                <button onClick={onClose} className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Hủy bỏ</button>
                <button 
                  onClick={handleSubmit}
                  className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-slate-900/10"
                >Gửi báo cáo ngay</button>
            </div>
          </div>
      </div>
    </div>
  );
}
