import React, { useState, useMemo } from 'react';
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
  Sparkles,
  MessageCircle,
  RefreshCw,
  KeyRound,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { User } from '../types';

type AuthStep = 'main' | 'verify' | 'success';

interface KnownCustomerSuggestion {
  name: string;
  phone: string;
  email: string;
  orderCount: number;
  lastOrderNumber?: string;
}

const ADMIN_DEFAULT_EMAIL = 'sandravasconcellossillva@gmail.com';

export const SocialAuthModal: React.FC = () => {
  const {
    isAuthOpen,
    setIsAuthOpen,
    setIsAccountOpen,
    orders,
    registeredUsers,
    loginWithEmail,
    sendPushNotification
  } = useStore();

  const [step, setStep] = useState<AuthStep>('main');
  const [isRegisterMode, setIsRegisterMode] = useState(true);

  // Registration / Login form state (all mandatory on registration)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Smart customer auto-suggestion state (from previous orders on the site)
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [autoFilledFromOrder, setAutoFilledFromOrder] = useState<string | null>(null);

  // Phone verification (OTP) state
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [waVerificationUrl, setWaVerificationUrl] = useState('');
  const [codeDispatchedNotice, setCodeDispatchedNotice] = useState('');

  // Feedback & Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [isNewRegistration, setIsNewRegistration] = useState(false);

  // Aggregate unique customers who already made purchases on the site (or are in registeredUsers)
  const knownCustomers = useMemo<KnownCustomerSuggestion[]>(() => {
    const map = new Map<string, KnownCustomerSuggestion>();

    // 1. Prioritize customers with purchases in `orders`
    orders.forEach((order) => {
      const custName = (order.customer?.name || '').trim();
      if (!custName) return;
      const key = custName.toLowerCase();
      const custPhone = (order.customer?.phone || '').trim();
      const rawEmail = (order.customer?.email || '').trim().toLowerCase();
      const custEmail = rawEmail && rawEmail !== ADMIN_DEFAULT_EMAIL ? rawEmail : '';

      const existing = map.get(key);
      if (existing) {
        existing.orderCount += 1;
        if (!existing.phone && custPhone) existing.phone = custPhone;
        if (!existing.email && custEmail) existing.email = custEmail;
      } else {
        map.set(key, {
          name: custName,
          phone: custPhone,
          email: custEmail,
          orderCount: 1,
          lastOrderNumber: order.orderNumber
        });
      }
    });

    // 2. Also include previously registered customers
    registeredUsers.forEach((u) => {
      const custName = (u.name || '').trim();
      if (!custName) return;
      const key = custName.toLowerCase();
      const custPhone = (u.phone || '').trim();
      const rawEmail = (u.email || '').trim().toLowerCase();
      const custEmail = rawEmail && rawEmail !== ADMIN_DEFAULT_EMAIL ? rawEmail : '';

      const existing = map.get(key);
      if (existing) {
        if (!existing.phone && custPhone) existing.phone = custPhone;
        if (!existing.email && custEmail) existing.email = custEmail;
      } else {
        map.set(key, {
          name: custName,
          phone: custPhone,
          email: custEmail,
          orderCount: 0
        });
      }
    });

    return Array.from(map.values());
  }, [orders, registeredUsers]);

  // Filter suggestions based on typed name or phone
  const matchingSuggestions = useMemo(() => {
    const query = name.trim().toLowerCase();
    const phoneDigits = phone.replace(/\D/g, '');

    if (!query && phoneDigits.length < 3) {
      // Show top customers with previous purchases when focused
      return knownCustomers.filter((c) => c.orderCount > 0).slice(0, 4);
    }

    return knownCustomers
      .filter((c) => {
        const nameMatch = query.length > 0 && c.name.toLowerCase().includes(query);
        const phoneMatch =
          phoneDigits.length >= 3 && c.phone.replace(/\D/g, '').includes(phoneDigits);
        // Hide if exact name and phone are already selected
        if (
          c.name.toLowerCase() === query &&
          (!c.phone || c.phone === phone)
        ) {
          return false;
        }
        return nameMatch || phoneMatch;
      })
      .slice(0, 5);
  }, [name, phone, knownCustomers]);

  if (!isAuthOpen) return null;

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const resetModal = () => {
    setStep('main');
    setErrorMsg('');
    setIsLoading(false);
    setEnteredCode('');
    setGeneratedCode('');
    setCodeDispatchedNotice('');
    setShowNameSuggestions(false);
  };

  const handleClose = () => {
    resetModal();
    setIsAuthOpen(false);
  };

  const handleSelectCustomerSuggestion = (suggestion: KnownCustomerSuggestion) => {
    setName(suggestion.name);
    if (suggestion.phone) {
      setPhone(formatPhone(suggestion.phone));
    }
    if (suggestion.email) {
      setEmail(suggestion.email);
    }
    setAutoFilledFromOrder(
      suggestion.lastOrderNumber
        ? `Dados encontrados da compra anterior (${suggestion.lastOrderNumber})`
        : 'Dados encontrados do histórico de compras no site'
    );
    setShowNameSuggestions(false);
    setErrorMsg('');
  };

  // Dispatches the 6-digit verification code to the customer's phone/WhatsApp + email
  const dispatchPhoneVerificationCode = async (targetCode: string) => {
    const cleanDigits = phone.replace(/\D/g, '');
    const fullPhone = cleanDigits.startsWith('55') ? cleanDigits : `55${cleanDigits}`;
    const firstName = name.trim().split(' ')[0] || 'Cliente';

    const waText = [
      `🔐 *VASCONCELOS — Confirmação de Cadastro*`,
      ``,
      `Olá, *${firstName}*!`,
      `Seu código de validação para confirmar seu cadastro no site da *VASCONCELOS* é:`,
      ``,
      `👉 *${targetCode}*`,
      ``,
      `Digite este código na tela do site para validar seu número e liberar seu cupom *BEMVINDO10* (10% OFF).`
    ].join('\n');

    const fallbackWaUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(waText)}`;
    setWaVerificationUrl(fallbackWaUrl);

    // 1. Trigger push / in-app notification so the user receives the code immediately on their device
    sendPushNotification(
      `📲 Código de Validação: ${targetCode}`,
      `Enviado para ${phone}. Digite o código ${targetCode} para confirmar seu cadastro na VASCONCELOS.`,
      undefined,
      'Validação SMS/WhatsApp'
    );

    // 2. Call backend endpoint (/api/auth/send-verification-code) for WhatsApp API/Webhook & SMTP
    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          code: targetCode
        })
      });
      const data = await res.json();
      if (data?.waMeUrl) {
        setWaVerificationUrl(data.waMeUrl);
      }
    } catch {
      // Fallback for static Vercel environment
    }

    // 3. Also send confirmation code to customer's email via FormSubmit AJAX (works on Vercel)
    if (email.trim().includes('@')) {
      try {
        fetch(`https://formsubmit.co/ajax/${email.trim().toLowerCase()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            _subject: `🔐 Código ${targetCode} — Confirmação de Cadastro VASCONCELOS`,
            _template: 'table',
            Cliente: name.trim(),
            Celular_Validado: phone.trim(),
            Codigo_de_Validacao: targetCode,
            Instrucao: `Digite o código ${targetCode} na tela de cadastro do site VASCONCELOS para validar sua conta.`
          })
        }).catch(() => {});
      } catch {
        // Ignore network errors
      }
    }

    setCodeDispatchedNotice(`Código enviado para o número ${phone}`);
  };

  // Step 1: Validate fields and send verification code (or login directly if in login mode)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const phoneDigits = phone.replace(/\D/g, '');

    if (isRegisterMode) {
      if (!name.trim()) {
        setErrorMsg('O Nome Completo é obrigatório.');
        return;
      }

      if (phoneDigits.length < 10) {
        setErrorMsg('O número de celular / WhatsApp com DDD é obrigatório (ex: (92) 98479-7348).');
        return;
      }

      if (!cleanEmail || !cleanEmail.includes('@')) {
        setErrorMsg('Informe um endereço de e-mail válido.');
        return;
      }

      if (password.length < 4) {
        setErrorMsg('A senha é obrigatória e deve ter pelo menos 4 caracteres.');
        return;
      }

      const alreadyRegistered = registeredUsers.some(
        (u) => u.email.toLowerCase() === cleanEmail
      );
      if (alreadyRegistered) {
        setErrorMsg('Este e-mail já possui cadastro. Clique em "Já possui cadastro? Acesse sua conta".');
        return;
      }

      // Generate 6-digit verification code and send to customer's phone
      setIsLoading(true);
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(newCode);
      setEnteredCode('');

      await dispatchPhoneVerificationCode(newCode);

      setIsLoading(false);
      setStep('verify');
      return;
    }

    // Login Mode
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Por favor, insira um endereço de e-mail válido.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginWithEmail(cleanEmail, name, password, phone, false);
      setIsLoading(false);

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      if (res.user) {
        setAuthenticatedUser(res.user);
        setIsNewRegistration(false);
        setStep('success');
      }
    }, 400);
  };

  // Step 2: Verify the 6-digit code sent to the customer's phone and complete registration
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEntered = enteredCode.replace(/\D/g, '').trim();
    if (cleanEntered.length !== 6) {
      setErrorMsg('Digite os 6 dígitos do código de confirmação enviado para o seu celular.');
      return;
    }

    if (cleanEntered !== generatedCode) {
      setErrorMsg('Código de confirmação inválido. Verifique o código enviado para o seu número e tente novamente.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginWithEmail(email, name, password, phone, true);
      setIsLoading(false);

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      if (res.user) {
        setAuthenticatedUser({ ...res.user, phoneVerified: true });
        setIsNewRegistration(true);
        setStep('success');
      }
    }, 400);
  };

  const handleResendCode = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setEnteredCode('');
    await dispatchPhoneVerificationCode(newCode);
    setIsLoading(false);
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
            STEP 1: CADASTRO DIRETO (SEM GOOGLE/APPLE) + SUGESTÃO INTELIGENTE
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
                {isRegisterMode
                  ? 'Cadastre seus dados e valide seu número de celular para acompanhar pedidos e ativar benefícios.'
                  : 'Entre com seu e-mail e senha cadastrados para acompanhar seus pedidos.'}
              </p>
            </div>

            {/* Auto-fill confirmation pill if customer selected a suggestion from a previous order */}
            {isRegisterMode && autoFilledFromOrder && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">{autoFilledFromOrder}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoFilledFromOrder(null)}
                  className="text-emerald-600 hover:text-emerald-900 text-[10px] font-bold cursor-pointer"
                >
                  OK
                </button>
              </div>
            )}

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Direct Registration / Login Form */}
            <form onSubmit={handleSubmitForm} className="space-y-3.5">
              {isRegisterMode && (
                <>
                  {/* NOME COMPLETO COM AUTO-SUGESTÃO DE COMPRAS ANTERIORES */}
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-neutral-800">
                        Nome Completo <span className="text-[#8B1E3F]">*</span>
                      </label>
                      {knownCustomers.some((c) => c.orderCount > 0) && (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Busca automática de clientes ativa
                        </span>
                      )}
                    </div>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        required
                        value={name}
                        onFocus={() => setShowNameSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => setShowNameSuggestions(false), 180);
                        }}
                        onChange={(e) => {
                          setName(e.target.value);
                          setShowNameSuggestions(true);
                        }}
                        placeholder="Digite seu nome (sugestão automática se já comprou)"
                        className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition"
                      />
                      <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    </div>

                    {/* Dropdown de Sugestão de Clientes que já compraram no site */}
                    {showNameSuggestions && matchingSuggestions.length > 0 && (
                      <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-150">
                        <div className="px-3 py-1.5 bg-[#F7F6F2] border-b border-neutral-200 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                            <ShoppingBag className="w-3 h-3 text-[#8B1E3F]" />
                            Cliente encontrado no site — toque para preencher:
                          </span>
                        </div>
                        <div className="max-h-44 overflow-y-auto divide-y divide-neutral-100">
                          {matchingSuggestions.map((item, idx) => (
                            <button
                              key={`${item.name}-${idx}`}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectCustomerSuggestion(item);
                              }}
                              className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50/70 transition flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <div>
                                <p className="text-xs font-bold text-neutral-900">{item.name}</p>
                                <p className="text-[11px] text-neutral-500">
                                  {item.phone ? `📱 ${item.phone}` : ''}
                                  {item.phone && item.email ? ' • ' : ''}
                                  {item.email ? `✉️ ${item.email}` : ''}
                                </p>
                              </div>
                              <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {item.orderCount > 0 ? 'Já comprou' : 'Cadastrado'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* WHATSAPP / TELEFONE OBRIGATÓRIO */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-800">
                      WhatsApp / Telefone <span className="text-[#8B1E3F]">*</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setPhone(formatted);
                          // Se o usuário digitar um telefone que já comprou antes e o nome estiver vazio, sugere/preenche
                          const digits = formatted.replace(/\D/g, '');
                          if (digits.length >= 10 && !name.trim()) {
                            const matchedByPhone = knownCustomers.find(
                              (c) => c.phone.replace(/\D/g, '') === digits
                            );
                            if (matchedByPhone) {
                              handleSelectCustomerSuggestion(matchedByPhone);
                            }
                          }
                        }}
                        placeholder="(92) 98479-7348"
                        className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition font-mono"
                      />
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Enviaremos um código de confirmação para validar seu número de celular.
                    </p>
                  </div>
                </>
              )}

              {/* E-MAIL OBRIGATÓRIO */}
              <div>
                <label className="text-[11px] font-bold text-neutral-800">
                  E-mail <span className="text-[#8B1E3F]">*</span>
                </label>
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

              {/* SENHA OBRIGATÓRIA */}
              <div>
                <label className="text-[11px] font-bold text-neutral-800">
                  Senha <span className="text-[#8B1E3F]">*</span>
                </label>
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
                    <span>Enviando Código de Confirmação...</span>
                  </>
                ) : (
                  <span>
                    {isRegisterMode ? 'Receber Código e Ativar 10% OFF' : 'Entrar na Conta'}
                  </span>
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
            STEP 2: VALIDAÇÃO DO NÚMERO DE CELULAR POR CÓDIGO (OTP)
           ========================================================= */}
        {step === 'verify' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => {
                setStep('main');
                setErrorMsg('');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Corrigir Dados</span>
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-700 block">
                VALIDAÇÃO DE SEGURANÇA
              </span>
              <h3 className="text-xl font-bold text-neutral-950">
                Confirme seu Número de Celular
              </h3>
              <p className="text-xs text-neutral-500">
                Enviamos uma confirmação com um código de 6 dígitos para o número{' '}
                <strong className="text-neutral-900 font-mono">{phone}</strong> de{' '}
                <strong className="text-neutral-900">{name}</strong>.
              </p>
            </div>

            {/* Banner de Confirmação Instantânea do Código para o Celular */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{codeDispatchedNotice || `Código gerado para ${phone}`}</span>
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    Código de validação do cliente:{' '}
                    <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-950 tracking-widest">
                      {generatedCode}
                    </strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnteredCode(generatedCode)}
                  className="shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Usar Código
                </button>
              </div>

              {waVerificationUrl && (
                <a
                  href={waVerificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Abrir / Receber Confirmação no WhatsApp ({phone})</span>
                </a>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block text-center mb-1.5">
                  Digite o Código de 6 Dígitos *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-[#F7F6F2] border-2 border-neutral-300 focus:border-neutral-950 focus:bg-white rounded-xl py-3 px-4 text-center font-mono text-2xl font-extrabold tracking-[0.4em] text-neutral-950 outline-hidden transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || enteredCode.length < 6}
                className="w-full py-3.5 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white text-xs font-bold tracking-[0.1em] uppercase transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validando Cliente...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Validar Código e Concluir Cadastro</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleResendCode}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-950 font-semibold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Não recebeu? Enviar novo código para {phone}</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 3: SUCESSO — CLIENTE VALIDADO & CUPOM ATIVADO
           ========================================================= */}
        {step === 'success' && authenticatedUser && (
          <div className="text-center space-y-5 py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Cliente Validado • Celular Confirmado
              </span>
              <h3 className="text-xl font-bold text-neutral-950 pt-1">
                {isNewRegistration
                  ? `Bem-vinda(o), ${authenticatedUser.name.split(' ')[0]}!`
                  : `Olá novamente, ${authenticatedUser.name.split(' ')[0]}!`}
              </h3>
              <p className="text-xs text-neutral-500">
                {authenticatedUser.phone ? `${authenticatedUser.phone} • ` : ''}
                {authenticatedUser.email}
              </p>
            </div>

            {/* Welcome Coupon Box */}
            <div className="p-4 rounded-xl bg-[#F7F6F2] border border-neutral-200 space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-neutral-950 font-bold text-xs">
                <Gift className="w-4 h-4 text-[#8B1E3F]" />
                <span>BENEFÍCIO DE BOAS-VINDAS ATIVADO</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                O cupom{' '}
                <strong className="font-mono bg-white px-2 py-0.5 rounded border border-neutral-300 text-neutral-900">
                  BEMVINDO10
                </strong>{' '}
                (10% OFF) já está aplicado em sua sacola.
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
                className="flex-1 py-3 rounded-lg border border-neutral-300 hover:border-neutral-900 text-neutral-800 hover:text-neutral-950 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Minha Conta
              </button>
            </div>
          </div>
        )}

        {/* Security Footer */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Ambiente autenticado • Proteção de dados LGPD</span>
        </div>
      </div>
    </div>
  );
};
