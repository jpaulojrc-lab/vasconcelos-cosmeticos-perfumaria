import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AdminLogin: React.FC = () => {
  const { adminLogin, setViewMode } = useStore();
  const [email, setEmail] = useState('admin@vasconcelos.com.br');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = adminLogin(email, password);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
      setLoading(false);
    }, 400);
  };

  const handleFillDemo = () => {
    setEmail('admin@vasconcelos.com.br');
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-900 text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Back link */}
        <button
          onClick={() => setViewMode('store')}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Loja</span>
        </button>

        {/* Brand & Security Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-600/30">
            <Lock className="w-7 h-7" />
          </div>
          
          <h2 className="text-2xl font-black font-display tracking-tight text-white">
            Acesso Restrito
          </h2>
          <p className="text-xs text-neutral-400">
            Portal administrativo da <strong>vasconcelos Presente</strong>. Insira seu e-mail e senha de administrador para continuar.
          </p>
        </div>

        {/* Demo Credentials Quick Fill Banner */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs text-neutral-300 space-y-2">
          <div className="flex items-center justify-between font-bold text-pink-400">
            <span className="flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              Credenciais Administrativas:
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] bg-pink-600/40 hover:bg-pink-600 text-pink-200 hover:text-white px-2 py-0.5 rounded-md font-bold transition"
            >
              Preencher Automaticamente
            </button>
          </div>
          <div className="font-mono text-[11px] space-y-0.5 text-neutral-300">
            <p>E-mail: <strong className="text-white">admin@vasconcelos.com.br</strong></p>
            <p>Senha: <strong className="text-white">admin123</strong></p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 text-xs flex items-center gap-2 animate-in shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
              E-mail Administrativo
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vasconcelos.com.br"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                Senha de Acesso
              </label>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-mono"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-neutral-500 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Acessar Painel Administrativo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Seals Footer */}
        <div className="pt-4 border-t border-neutral-800 text-[10px] text-neutral-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Criptografia TLS 256-bit
          </span>
          <span>Sessão Protegida vasconcelos Presente</span>
        </div>

      </div>
    </div>
  );
};
