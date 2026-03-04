'use client';

import { Shuffle } from 'lucide-react';

interface ShuffleButtonProps {
  onClick: () => void;
}

export default function ShuffleButton({ onClick }: ShuffleButtonProps) {
  return (
    <div className="fixed bottom-10 right-10 z-50">
      <button 
        onClick={onClick} 
        className="bg-white border-2 border-slate-100 px-8 py-5 rounded-[2rem] flex items-center gap-4 font-black text-xs uppercase tracking-[0.15em] hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all active:scale-95 text-slate-700 shadow-xl group"
      >
        <Shuffle className="w-5 h-5 text-amber-500 group-hover:text-white transition-colors" />
        <span>Chọn ngẫu nhiên</span>
      </button>
    </div>
  );
}
