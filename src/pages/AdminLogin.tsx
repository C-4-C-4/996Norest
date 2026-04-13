import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert } from 'lucide-react';
import { useStore } from '../store';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请检查账号密码');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-danger/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="glass-card max-w-md w-full p-8 rounded-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-danger/20">
            <Lock className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">管理员登录</h2>
          <p className="text-gray-400 text-sm">请输入管理员账号和密码以进入后台系统</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger p-3 rounded-lg flex items-start gap-2 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              账号
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-dark-border rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-danger transition-colors"
              placeholder="请输入管理员账号"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              密码
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-dark-border rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-danger transition-colors"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-danger py-3 text-base font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            登录后台
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;