import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Verifique seu e-mail para confirmar o cadastro!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1220] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full relative">
        {/* Decorative elements */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#3B82F6]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#3B82F6]/5 rounded-full blur-[100px]"></div>

        <div className="bg-[#1E293B]/60 backdrop-blur-xl rounded-[3rem] border border-white/5 shadow-2xl shadow-black/50 overflow-hidden relative z-10">
          <div className="p-8 sm:p-12">
            {/* Logo & Header */}
            <div className="text-center space-y-3 mb-10">
              {/* Logo - Interlocking Diamond */}
              <div className="relative w-20 h-20 mx-auto transform -rotate-12 transition-transform hover:rotate-0 duration-500 group">
                <div className="absolute inset-0 bg-[#3B82F6] rounded-2xl transform rotate-45 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20"></div>
                <div className="absolute inset-0 bg-white/10 rounded-2xl transform -rotate-12 border border-white/10 backdrop-blur-sm shadow-xl"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white font-black text-2xl z-10 italic">M</div>
              </div>
              <h1 className="text-3xl font-black text-[#F5F7FA] tracking-tighter font-display uppercase italic mt-6">
                Mons<span className="text-[#3B82F6] not-italic">Track</span>
              </h1>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-tight px-4 opacity-70">
                {isSignUp 
                  ? 'Strategic Asset Registration' 
                  : 'Access Strategic Operations'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#3B82F6] transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="E-mail Corporativo"
                    className="w-full pl-12 pr-4 py-4 bg-[#0D1220]/40 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#3B82F6] transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="Password Safekey"
                    className="w-full pl-12 pr-4 py-4 bg-[#0D1220]/40 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-sm font-black text-[#F5F7FA] placeholder:text-slate-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Feedback messages */}
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-black uppercase tracking-tight animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
              {message && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-black uppercase tracking-tight animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle2 size={18} />
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#3B82F6] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:bg-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed group italic"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
                    {isSignUp ? 'Initialize Profile' : 'Authenticate Access'}
                    <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setMessage(null);
                }}
                className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-[#3B82F6] transition-colors italic"
              >
                {isSignUp ? 'Switch to Authentication' : 'Request Profile Access'}
              </button>
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="h-1.5 bg-gradient-to-r from-[#3B82F6] via-blue-500 to-[#3B82F6]"></div>
        </div>

        <p className="mt-8 text-center text-[9px] text-slate-600 uppercase font-black tracking-[0.4em] italic opacity-50">
          MonsTrack Strategic Group © 2026
        </p>
      </div>
    </div>
  );
};

export default Auth;
