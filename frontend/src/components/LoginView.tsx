import React, { useState } from 'react';
import { Loader2, User, Lock, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';
import client from '../api/client';

interface LoginViewProps {
  onLogin: (token: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await client.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const { access_token } = response.data;
      if (access_token) {
        onLogin(access_token);
      }
    } catch (err: any) {
      console.error('Login error', err);
      setError('Invalid username or password / اسم المستخدم أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Dynamic Animated Background Gradients & Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-lime-500/20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-teal-600/10 blur-[160px] pointer-events-none" />

      {/* Main Glassmorphic Container Card */}
      <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-950/50 z-10 transition-all duration-300">
        
        {/* Logo & Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative group mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-lime-400 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-500" />
            <img 
              src="/logo.png" 
              alt="SSMS Logo" 
              className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl drop-shadow-xl transform group-hover:scale-105 transition-all duration-300" 
            />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-lime-300 to-teal-200 tracking-tight">
            SSMS
          </h1>
          <p className="text-sm font-semibold text-emerald-400/90 mt-1">
            Smart School Management System
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            نظام إدارة المدارس الذكي
          </p>
        </div>

        {/* Form Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start space-x-2 animate-shake">
            <ShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Username or Email / اسم المستخدم
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5 text-emerald-500/80" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password / كلمة المرور
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5 text-emerald-500/80" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-lime-400 to-teal-400 hover:from-emerald-300 hover:to-lime-300 shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all duration-200 flex items-center justify-center text-sm disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-slate-950" />
                <span>Logging in... / جاري الدخول</span>
              </>
            ) : (
              <span className="flex items-center">
                Sign In / تسجيل الدخول
              </span>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Options */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quick Demo Accounts / حسابات التجربة</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="py-2 px-2 rounded-lg bg-slate-800/60 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/40 font-medium transition-all text-center"
            >
              👑 Admin
            </button>
            <button
              onClick={() => handleQuickLogin('teacher1', 'teacher123')}
              className="py-2 px-2 rounded-lg bg-slate-800/60 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/40 font-medium transition-all text-center"
            >
              👨‍🏫 Teacher
            </button>
            <button
              onClick={() => handleQuickLogin('alice', 'alice123')}
              className="py-2 px-2 rounded-lg bg-slate-800/60 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/40 font-medium transition-all text-center"
            >
              🎓 Student
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          SSMS &copy; {new Date().getFullYear()} All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default LoginView;
