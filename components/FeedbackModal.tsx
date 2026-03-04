'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, Facebook, Send, Sparkles, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface FeedbackModalProps {
  onClose: () => void;
  userEmail?: string;
}

export default function FeedbackModal({ onClose, userEmail }: FeedbackModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Vui lòng nhập nội dung góp ý!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, message })
      });
      
      if (res.ok) {
        toast.success('Cảm ơn bạn đã góp ý! Admin đã nhận được tin nhắn.');
        onClose();
      } else {
        throw new Error('Failed to send');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in transition-all">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-xl overflow-hidden rounded-[3.5rem] p-12 shadow-2xl border-8 border-slate-100 animate-in zoom-in-95">
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-900/5">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Góp ý cho Admin 🔥</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Chúng mình luôn lắng nghe từ bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute top-6 left-6 text-slate-300 group-focus-within:text-amber-600 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <textarea 
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bạn muốn nhắn nhủ điều gì với Admin? (Feedback lỗi, đề xuất tính năng...)"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] py-6 px-14 text-sm font-bold outline-none focus:bg-white focus:border-amber-600 transition-all resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-amber-600 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi góp ý ngay
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-slate-100">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">- Hoặc kết nối qua Facebook -</p>
          <a 
            href="https://m.me/your_fb_id" // Thay bằng link Messenger thật
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-4 py-5 px-8 bg-[#1877F2] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-900/20"
          >
            <Facebook className="w-5 h-5 fill-current" />
            Nhắn tin qua Messenger
          </a>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-amber-600">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest italic opacity-60">DIDAUDAY Developer Team</span>
        </div>
      </div>
    </div>
  );
}
