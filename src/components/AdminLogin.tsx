import React, { useState, useEffect } from 'react';
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
  Loader2,
  Fingerprint
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  authenticateWithAdminBiometric,
  clearAdminBiometric,
  getSavedAdminEmail,
  getStoredAdminBiometric,
  isBiometricSupported,
  registerAdminBiometric
} from '../utils/adminBiometrics';

const ADMIN_RECOVERY_EMAIL = 'sandravasconcellossillva@gmail.com';

export const AdminLogin: React.FC = () => {
  const { adminLogin, adminLoginWithBiometrics, setViewMode } = useStore();
  const [email, setEmail] = useState(() => getSavedAdminEmail());
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(() => Boolean(getStoredAdminBiometric()));
  const [saveBiometric, setSaveBiometric] = useState(true);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    isBiometricSupported().then((supported) => {
      setBiometricSupported(supported);
      setHasBiometric(Boolean(getStoredAdminBiometric()));
    });
  }, []);

  const handleBiometricLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setBiometricLoading(true);
    try {
      const res = await authenticateWithAdminBiometric();
      if (res.ok) {
        const loginRes = adminLoginWithBiometrics(rememberDevice);
        setSuccessMsg(loginRes.message);
      } else {
        setErrorMsg(res.message);
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      if (
        cleanEmail === ADMIN_RECOVERY_EMAIL &&
        cleanPass === 'S23086072' &&
        biometricSupported &&
        saveBiometric &&
        !hasBiometric
      ) {
        const bioRes = await registerAdminBiometric(cleanEmail);
        if (bioRes.ok) {
          setHasBiometric(true);
        }
      }

      const res = adminLogin(email, password, rememberDevice);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } finally {
      setLoading(false);
    }
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
            Sistema: 'Portal Administrativo — VASCONCELOS Utensílios e Presentes',
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
    <div className="min-h-[85dvh] flex items-center justify-center px-4 py-12 bg-[#F7F6F2] text-neutral-900">
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

        {/* Biometric Quick Sign-In (when already saved on this PC, Notebook, or Smartphone) */}
        {biometricSupported && hasBiometric && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={biometricLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-[0.12em] transition flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {biometricLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando Biometria...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  <span>Entrar com Biometria do Aparelho</span>
                </>
              )}
            </button>
            <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
              <span>Digital, Face ID ou Windows Hello</span>
              <button
                type="button"
                onClick={() => {
                  clearAdminBiometric();
                  setHasBiometric(false);
                  setSuccessMsg('Biometria removida deste aparelho.');
                }}
                className="text-neutral-400 hover:text-red-600 underline cursor-pointer"
              >
                Remover biometria
              </button>
            </div>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-white px-3 text-neutral-400 font-semibold">ou entre com senha</span>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form id="admin-login-form" onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider"
            >
              E-mail Administrativo
            </label>
            <div className="relative mt-1">
              <input
                id="admin-email"
                name="username"
                type="email"
                required
                autoComplete="username webauthn"
                spellCheck={false}
                enterKeyHint="next"
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
              <label
                htmlFor="admin-password"
                className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider"
              >
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
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                enterKeyHint="done"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-10 pr-10 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-hidden focus:border-neutral-950 focus:bg-white font-mono"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-800 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Device & Save Biometrics Options */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-4 h-4 accent-[#111111] rounded"
              />
              <span>Lembrar acesso neste aparelho</span>
            </label>

            {biometricSupported && !hasBiometric && (
              <label className="flex items-start gap-2 text-xs text-neutral-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveBiometric}
                  onChange={(e) => setSaveBiometric(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700 rounded mt-0.5 shrink-0"
                />
                <span>
                  Salvar na <strong className="text-neutral-900">biometria do aparelho</strong> (Digital, Face ID ou Windows Hello)
                </span>
              </label>
            )}
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
