'use client';

import { User as UserIcon } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-[3.5rem] p-12 text-center border-4 border-slate-100 animate-in zoom-in-95">
        <div className="w-20 h-20 bg-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8"><UserIcon className="w-8 h-8 text-white" /></div>
        <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase text-slate-900 leading-none">Xin chào!</h3>
        <p className="text-xs font-bold text-slate-500 mb-10 uppercase tracking-widest leading-relaxed">Đăng nhập để tham gia cộng đồng quán ngon của chúng mình.</p>
        <div id="google-button" className="w-full flex justify-center mb-10"></div>
        <button onClick={onClose} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-800 transition-colors">Để sau nhé</button>
      </div>
    </div>
  );
}
