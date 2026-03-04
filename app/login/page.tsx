'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        // Store user in localStorage for client-side state
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError(data.msg || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối Server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
          Chào sếp! <span className="text-red-500">.</span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tên đăng nhập" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-12 pr-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:border-orange-500 outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:border-orange-500 outline-none transition-all"
            />
          </div>

          {error && <p className="text-red-500 text-sm italic">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 text-white rounded-xl py-4 font-bold text-lg shadow-lg shadow-orange-500/30 hover:bg-orange-600 active:scale-95 transition-all text-center"
          >
            {loading ? 'Đang vào...' : 'Đăng nhập hệ thống'}
          </button>
        </form>
      </div>
    </div>
  );
}
