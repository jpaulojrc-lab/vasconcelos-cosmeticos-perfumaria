import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  User as UserIcon,
  Phone,
  Loader2,
  Gift,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { User } from '../types';

type AuthStep = 'main' | 'google' | 'apple' | 'success';

export const SocialAuthModal: React.FC = () => {
  const {
    isAuthOpen,
    setIsAuthOpen,
    setIsAccountOpen,
    registeredUsers,
    loginWithSocial,
    loginWithEmail
  } = useStore();

  const [step, setStep] = useState<AuthStep>('main');
  const [isRegisterMode, setIsRegisterMode] = useState(true);

  // Email/Password form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Social OAuth form state (Google / Apple)
  const [socialName, setSocialName] = useState('');
  const [socialEmail, setSocialEmail] = useState('');
  const [socialPhone, setSocialPhone] = useState('');
  const [appleHideEmail, setAppleHideEmail] = useState(false);
  const [showCustomSocialForm, setShowCustomSocialForm] = useState(false);

  // Feedback & Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [isNewRegistration, setIsNewRegistration] = useState(false);

  if (!isAuthOpen) return null;

  const googleAccounts = registeredUsers.filter(u => u.provider === 'google');
  const appleAccounts = registeredUsers.filter(u => u.provider === 'apple');

  const resetModal = () => {
    setStep('main');
    setErrorMsg('');
    setIsLoading(false);
    setShowCustomSocialForm(false);
  };

  const handleClose = () => {
    resetModal();
    setIsAuthOpen(false);
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // Handler for Email Login/Registration
  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor, insira um endereço de e-mail válido.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (isRegisterMode && !name.trim()) {
      setErrorMsg('Por favor, informe como prefere ser chamado(a).');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginWithEmail(email, name, password, phone, isRegisterMode);
      setIsLoading(false);

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      if (res.user) {
        setAuthenticatedUser(res.user);
        setIsNewRegistration(isRegisterMode);
        setStep('success');
      }
    }, 500);
  };

  // Open Google OAuth Step
  const handleStartGoogle = () => {
    setErrorMsg('');
    setSocialName('');
    setSocialEmail('');
    setSocialPhone('');
    setShowCustomSocialForm(googleAccounts.length === 0);
    setStep('google');
  };

  // Open Apple OAuth Step
  const handleStartApple = () => {
    setErrorMsg('');
    setSocialName('');
    setSocialEmail('');
    setSocialPhone('');
    setAppleHideEmail(false);
    setShowCustomSocialForm(appleAccounts.length === 0);
    setStep('apple');
  };

  // Quick login with a previously saved Google/Apple account
  const handleQuickSelectSocialAccount = (account: User) => {
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      const res = loginWithSocial(account.provider === 'apple' ? 'apple' : 'google', {
        name: account.name,
        email: account.email,
        phone: account.phone,
        avatar: account.avatar
      });
      setIsLoading(false);
      setAuthenticatedUser(res.user);
      setIsNewRegistration(res.isNewUser);
      setStep('success');
    }, 500);
  };

  // Complete Google or Apple authentication with user-provided details
  const handleConfirmSocialAuth = (provider: 'google' | 'apple', e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = socialName.trim();
    let cleanEmail = socialEmail.trim().toLowerCase();

    if (!cleanName) {
      setErrorMsg('Informe seu nome para vincular à sua conta.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg(
        provider === 'google'
          ? 'Informe um e-mail válido da sua Conta Google (ex: seuemail@gmail.com).'
          : 'Informe o e-mail do seu ID Apple (ex: seuemail@icloud.com).'
      );
      return;
    }

    if (provider === 'apple' && appleHideEmail && !cleanEmail.endsWith('@privaterelay.appleid.com')) {
      const hash = cleanEmail
        .split('@')[0]
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 8);
      cleanEmail = `${hash || 'appleuser'}.vsc@privaterelay.appleid.com`;
    }

    setIsLoading(true);
    setTimeout(() => {
      const avatarBg = provider === 'google' ? '4285F4' : '171717';
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        cleanName
      )}&background=${avatarBg}&color=fff&bold=true`;

      const res = loginWithSocial(provider, {
        name: cleanName,
        email: cleanEmail,
        phone: socialPhone,
        avatar: avatarUrl
      });

      setIsLoading(false);
      setAuthenticatedUser(res.user);
      setIsNewRegistration(res.isNewUser);
      setStep('success');
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 border border-neutral-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* =========================================================
            STEP 1: MAIN LOGIN / REGISTER VIEW
           ========================================================= */}
        {step === 'main' && (
          <>
            {/* Editorial Brand Header */}
            <div className="text-center space-y-1.5 pt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-neutral-400 block">
                VASCONCELOS
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
                {isRegisterMode ? 'Criar Conta de Cliente' : 'Acessar Minha Conta'}
              </h2>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Acompanhe seus pedidos em tempo real, salve seus favoritos e gerencie seus benefícios.
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-2.5">
              {/* Google Login */}
              <button
                type="button"
                onClick={handleStartGoogle}
                className="w-full py-3 px-4 rounded-lg border border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold flex items-center justify-center gap-3 transition cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continuar com o Google</span>
              </button>

              {/* Apple Login */}
              <button
                type="button"
                onClick={handleStartApple}
                className="w-full py-3 px-4 rounded-lg bg-[#111111] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-3 transition cursor-pointer"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.83-11.96-14.39-7.98-12.24-13.56-25.75-16.74-40.54-3.18-14.78-3.18-27.81 0-39.09 3.18-11.28 8.85-20.25 17-26.91 8.16-6.66 17.58-10.05 28.28-10.16 5.56 0 11.29 1.41 17.18 4.24 5.89 2.83 10.04 4.24 12.44 4.24 2.18 0 6.32-1.35 12.44-4.07 6.12-2.72 11.59-3.97 16.42-3.76 14.81.98 26.68 6.75 35.61 17.3-13.07 7.95-19.49 18.9-19.26 32.86.23 10.89 4.3 20.08 12.21 27.57 7.91 7.49 17.47 11.66 28.69 12.51-2.28 7.3-5.27 14.62-8.98 21.96zM119.22 33.15c0-7.3 2.67-14.31 8.01-21.03 5.34-6.72 11.96-10.96 19.86-12.72.65 1.52.98 3.26.98 5.22 0 7.4-2.73 14.54-8.19 21.42-5.46 6.88-12.23 11.22-20.31 13.01-.22-1.95-.35-3.91-.35-5.9z" />
                </svg>
                <span>Continuar com Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-400 font-semibold">
                ou com e-mail
              </span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmitEmail} className="space-y-3">
              {isRegisterMode && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700">Nome Completo</label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Como prefere ser chamado(a)?"
                        className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition"
                      />
                      <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-700">
                      WhatsApp / Telefone <span className="text-neutral-400 font-normal">(opcional)</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        placeholder="(11) 99999-9999"
                        className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition"
                      />
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-bold text-neutral-700">E-mail</label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-700">Senha</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-9 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white text-xs font-bold tracking-[0.1em] uppercase transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <span>{isRegisterMode ? 'Criar Conta e Ativar 10% OFF' : 'Entrar na Conta'}</span>
                )}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setErrorMsg('');
                }}
                className="text-xs text-neutral-500 hover:text-neutral-950 font-semibold transition cursor-pointer"
              >
                {isRegisterMode
                  ? 'Já possui cadastro? Acesse sua conta'
                  : 'Ainda não possui conta? Cadastre-se gratuitamente'}
              </button>
            </div>
          </>
        )}

        {/* =========================================================
            STEP 2: GOOGLE OAUTH ACCOUNT SELECTOR & REGISTRATION
           ========================================================= */}
        {step === 'google' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => setStep('main')}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200 mx-auto flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-950">
                Continuar com o Google
              </h3>
              <p className="text-xs text-neutral-500">
                Prosseguir para <strong className="text-neutral-900">VASCONCELOS</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Saved Google Accounts List */}
            {googleAccounts.length > 0 && !showCustomSocialForm && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Escolha uma conta Google conectada:
                </p>
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                  {googleAccounts.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickSelectSocialAccount(acc)}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-neutral-50 transition text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{acc.name}</p>
                          <p className="text-[11px] text-neutral-500">{acc.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomSocialForm(true)}
                  className="w-full py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                >
                  + Usar outra conta do Google
                </button>
              </div>
            )}

            {/* Google Account Registration / Sign-In Form */}
            {showCustomSocialForm && (
              <form
                onSubmit={(e) => handleConfirmSocialAuth('google', e)}
                className="space-y-3.5"
              >
                <div>
                  <label className="text-[11px] font-bold text-neutral-700">
                    Nome da Conta Google
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      required
                      value={socialName}
                      onChange={(e) => setSocialName(e.target.value)}
                      placeholder="Ex: Maria Clara Silva"
                      className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition"
                    />
                    <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700">
                    E-mail do Google (Gmail)
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="email"
                      required
                      value={socialEmail}
                      onChange={(e) => setSocialEmail(e.target.value)}
                      placeholder="seuemail@gmail.com"
                      className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition"
                    />
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700">
                    WhatsApp para Rastreio de Pedidos <span className="text-neutral-400 font-normal">(opcional)</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="tel"
                      value={socialPhone}
                      onChange={(e) => setSocialPhone(formatPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition"
                    />
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Autenticando junto ao Google...</span>
                    </>
                  ) : (
                    <span>Continuar com Conta Google</span>
                  )}
                </button>
              </form>
            )}

            <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
              Ao prosseguir, o Google compartilhará seu nome e endereço de e-mail com a{' '}
              <strong>VASCONCELOS</strong>.
            </p>
          </div>
        )}

        {/* =========================================================
            STEP 3: APPLE ID OAUTH SELECTOR & REGISTRATION
           ========================================================= */}
        {step === 'apple' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => setStep('main')}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#111111] text-white mx-auto flex items-center justify-center">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.83-11.96-14.39-7.98-12.24-13.56-25.75-16.74-40.54-3.18-14.78-3.18-27.81 0-39.09 3.18-11.28 8.85-20.25 17-26.91 8.16-6.66 17.58-10.05 28.28-10.16 5.56 0 11.29 1.41 17.18 4.24 5.89 2.83 10.04 4.24 12.44 4.24 2.18 0 6.32-1.35 12.44-4.07 6.12-2.72 11.59-3.97 16.42-3.76 14.81.98 26.68 6.75 35.61 17.3-13.07 7.95-19.49 18.9-19.26 32.86.23 10.89 4.3 20.08 12.21 27.57 7.91 7.49 17.47 11.66 28.69 12.51-2.28 7.3-5.27 14.62-8.98 21.96zM119.22 33.15c0-7.3 2.67-14.31 8.01-21.03 5.34-6.72 11.96-10.96 19.86-12.72.65 1.52.98 3.26.98 5.22 0 7.4-2.73 14.54-8.19 21.42-5.46 6.88-12.23 11.22-20.31 13.01-.22-1.95-.35-3.91-.35-5.9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-950">
                Iniciar sessão com a Apple
              </h3>
              <p className="text-xs text-neutral-500">
                Use seu ID Apple para acessar a <strong>VASCONCELOS</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Saved Apple Accounts */}
            {appleAccounts.length > 0 && !showCustomSocialForm && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  ID Apple salvo neste dispositivo:
                </p>
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                  {appleAccounts.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickSelectSocialAccount(acc)}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-neutral-50 transition text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{acc.name}</p>
                          <p className="text-[11px] text-neutral-500">{acc.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomSocialForm(true)}
                  className="w-full py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                >
                  + Usar outro ID Apple
                </button>
              </div>
            )}

            {/* Apple ID Form */}
            {showCustomSocialForm && (
              <form
                onSubmit={(e) => handleConfirmSocialAuth('apple', e)}
                className="space-y-3.5"
              >
                <div>
                  <label className="text-[11px] font-bold text-neutral-700">Nome Completo</label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      required
                      value={socialName}
                      onChange={(e) => setSocialName(e.target.value)}
                      placeholder="Seu Nome no ID Apple"
                      className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition"
                    />
                    <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700">
                    ID Apple (iCloud ou E-mail)
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="email"
                      required
                      value={socialEmail}
                      onChange={(e) => setSocialEmail(e.target.value)}
                      placeholder="seuemail@icloud.com"
                      className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition"
                    />
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700">
                    WhatsApp <span className="text-neutral-400 font-normal">(opcional)</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="tel"
                      value={socialPhone}
                      onChange={(e) => setSocialPhone(formatPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition"
                    />
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Apple Privacy Option: Share or Hide Email */}
                <div className="p-3 rounded-xl bg-[#F7F6F2] border border-neutral-200 space-y-2">
                  <p className="text-[11px] font-bold text-neutral-800">Privacidade de E-mail Apple</p>
                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="appleEmailPrivacy"
                      checked={!appleHideEmail}
                      onChange={() => setAppleHideEmail(false)}
                      className="accent-black"
                    />
                    <span>Compartilhar Meu E-mail</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="appleEmailPrivacy"
                      checked={appleHideEmail}
                      onChange={() => setAppleHideEmail(true)}
                      className="accent-black"
                    />
                    <span>Ocultar Meu E-mail (Encaminhar para meu iCloud)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-lg bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Autenticando ID Apple...</span>
                    </>
                  ) : (
                    <span>Continuar com ID Apple</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* =========================================================
            STEP 4: SUCCESS & WELCOME COUPON CONFIRMATION
           ========================================================= */}
        {step === 'success' && authenticatedUser && (
          <div className="text-center space-y-5 py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                {authenticatedUser.provider === 'google'
                  ? 'Conta Google Conectada'
                  : authenticatedUser.provider === 'apple'
                  ? 'ID Apple Conectado'
                  : 'Conta Verificada'}
              </span>
              <h3 className="text-xl font-bold text-neutral-950 pt-1">
                {isNewRegistration
                  ? `Bem-vinda(o), ${authenticatedUser.name.split(' ')[0]}!`
                  : `Olá novamente, ${authenticatedUser.name.split(' ')[0]}!`}
              </h3>
              <p className="text-xs text-neutral-500">{authenticatedUser.email}</p>
            </div>

            {/* Welcome Coupon Box */}
            <div className="p-4 rounded-xl bg-[#F7F6F2] border border-neutral-200 space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-neutral-950 font-bold text-xs">
                <Gift className="w-4 h-4 text-[#8B1E3F]" />
                <span>BENEFÍCIO DE BOAS-VINDAS ATIVADO</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                O cupom <strong className="font-mono bg-white px-2 py-0.5 rounded border border-neutral-300 text-neutral-900">BEMVINDO10</strong> (10% OFF) já está aplicado em sua sacola.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Ir às Compras
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setIsAccountOpen(true);
                }}
                className="flex-1 py-3 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Ver Minha Conta
              </button>
            </div>
          </div>
        )}

        {/* Security Footer */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Ambiente autenticado • Proteção de dados LGPD</span>
        </div>

      </div>
    </div>
  );
};
