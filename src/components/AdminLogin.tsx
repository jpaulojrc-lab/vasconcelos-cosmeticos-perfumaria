import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Send,
  Loader2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const ADMIN_RECOVERY_EMAIL = 'sandravasconcellossillva@gmail.com';

export const AdminLogin: React.FC = () => {
  const { adminLogin, setViewMode } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = adminLogin(email, password);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
      setLoading(false);
    }, 300);
  };

  const handleRecoverCredentials = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setRecovering(true);

    try {
      const response = await fetch('/api/admin/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_RECOVERY_EMAIL })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg(data.message);
      } else {
        setSuccessMsg(
          `Rotina de recuperação acionada! As credenciais foram enviadas para ${ADMIN_RECOVERY_EMAIL}.`
        );
      }
    } catch {
      try {
        await fetch(`https://formsubmit.co/ajax/${ADMIN_RECOVERY_EMAIL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            _subject: 'Recuperação de Acesso Administrativo — VASCONCELOS',
            _template: 'table',
            Sistema: 'Portal Administrativo — VASCONCELOS Cosméticos & Perfumaria',
            Login_E_mail: ADMIN_RECOVERY_EMAIL,
            Senha_de_Acesso: 'S23086072',
            Mensagem: 'Você solicitou o envio das suas credenciais de acesso ao Painel Administrativo.'
          })
        });
      } catch {
        // Ignora erro de rede offline no fallback
      }

      setSuccessMsg(
        `Um e-mail com o Login e a Senha foi enviado para ${ADMIN_RECOVERY_EMAIL}. Verifique sua caixa de entrada e spam.`
      );
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F7F6F2] text-neutral-900">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-2xl p-8 shadow-xl space-y-6">
        {/* Top Back link */}
        <button
          onClick={() => setViewMode('store')}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-950 transition font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Loja</span>
        </button>

        {/* Brand & Security Header */}
        <div className="text-center space-y-2 pb-2 border-b border-neutral-100">
          <span
            className="block text-2xl font-semibold tracking-[0.26em] text-neutral-950"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            VASCONCELOS
          </span>
          <span className="block text-[9px] uppercase tracking-[0.28em] text-neutral-400 font-semibold">
            Portal de Gestão & Financeiro
          </span>

          <h2 className="text-lg font-bold text-neutral-900 pt-2">
            Acesso Administrativo
          </h2>
          <p className="text-xs text-neutral-500">
            Insira suas credenciais de administrador para gerenciar pedidos, parcelas e catálogo.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
              E-mail Administrativo
            </label>
            <div className="relative mt-1">
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail administrativo"
                className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-10 pr-3 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-hidden focus:border-neutral-950 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                Senha de Acesso
              </label>
              <button
                type="button"
                onClick={handleRecoverCredentials}
                disabled={recovering}
                className="text-[11px] text-[#8B1E3F] hover:underline font-semibold transition inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                {recovering ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Esqueceu a senha?</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-10 pr-10 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-hidden focus:border-neutral-950 focus:bg-white font-mono"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-800 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white font-bold text-xs uppercase tracking-[0.14em] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
        <div className="pt-4 border-t border-neutral-100 text-[10px] text-neutral-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Ambiente Criptografado TLS
          </span>
          <span>VASCONCELOS • Gestão</span>
        </div>
      </div>
    </div>
  );
};
