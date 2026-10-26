import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const SocialAuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, loginWithSocial, loginWithEmail } = useStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  if (!isAuthOpen) return null;

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    loginWithEmail(email, name || 'Cliente Vasconcelos');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 border border-pink-100">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 font-display">
            {isRegisterMode ? 'Criar Conta vasconcelos Presente' : 'Acesse sua Conta vasconcelos Presente'}
          </h2>
          <p className="text-xs text-neutral-500">
            Acompanhe seus pedidos em tempo real, salve seus favoritos e receba cupons exclusivos.
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          {/* Google Login */}
          <button
            onClick={() => loginWithSocial('google')}
            className="w-full py-3 px-4 rounded-2xl border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold flex items-center justify-center gap-3 transition shadow-xs active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            onClick={() => loginWithSocial('apple')}
            className="w-full py-3 px-4 rounded-2xl bg-neutral-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-3 transition shadow-xs active:scale-95"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.83-11.96-14.39-7.98-12.24-13.56-25.75-16.74-40.54-3.18-14.78-3.18-27.81 0-39.09 3.18-11.28 8.85-20.25 17-26.91 8.16-6.66 17.58-10.05 28.28-10.16 5.56 0 11.29 1.41 17.18 4.24 5.89 2.83 10.04 4.24 12.44 4.24 2.18 0 6.32-1.35 12.44-4.07 6.12-2.72 11.59-3.97 16.42-3.76 14.81.98 26.68 6.75 35.61 17.3-13.07 7.95-19.49 18.9-19.26 32.86.23 10.89 4.3 20.08 12.21 27.57 7.91 7.49 17.47 11.66 28.69 12.51-2.28 7.3-5.27 14.62-8.98 21.96zM119.22 33.15c0-7.3 2.67-14.31 8.01-21.03 5.34-6.72 11.96-10.96 19.86-12.72.65 1.52.98 3.26.98 5.22 0 7.4-2.73 14.54-8.19 21.42-5.46 6.88-12.23 11.22-20.31 13.01-.22-1.95-.35-3.91-.35-5.9z" />
            </svg>
            <span>Continuar com Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
            ou com e-mail
          </span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmitEmail} className="space-y-3">
          {isRegisterMode && (
            <div>
              <label className="text-[11px] font-bold text-neutral-700">Seu Nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como prefere ser chamado(a)?"
                className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-pink-500"
              />
            </div>
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
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-pink-500"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-700">Senha</label>
            <div className="relative mt-1">
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-pink-500"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-black tracking-wider uppercase transition shadow-md"
          >
            {isRegisterMode ? 'Cadastrar e Ganhar 10% OFF' : 'Entrar na Conta'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-xs text-neutral-500 hover:text-pink-600 font-semibold transition"
          >
            {isRegisterMode
              ? 'Já tem uma conta? Clique para entrar'
              : 'Ainda não é cadastrada? Crie sua conta grátis'}
          </button>
        </div>

      </div>
    </div>
  );
};
