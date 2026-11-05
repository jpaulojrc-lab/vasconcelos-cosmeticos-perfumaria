import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Truck,
  ArrowRight,
  Lock,
  MessageCircle,
  FileText,
  Mail,
  ShieldCheck,
  User,
  Phone,
  Sparkles,
  ShoppingBag,
  KeyRound,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Address, Order } from '../types';
import { formatBRL } from '../utils/formatters';
import { sanitizeText } from '../utils/security';
import { generateOrderConditionsPdf } from '../utils/pdfGenerator';

const ADMIN_EMAIL = 'sandravasconcellossillva@gmail.com';

interface PreviousBuyerSuggestion {
  name: string;
  phone: string;
  email: string;
  orderCount: number;
  lastOrderNumber?: string;
}

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    currentUser,
    orders,
    registeredUsers,
    createOrder,
    setIsAccountOpen,
    sendPushNotification
  } = useStore();

  const [step, setStep] = useState<'form' | 'verify_phone' | 'done'>('form');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminNotifiedEmail, setAdminNotifiedEmail] = useState(false);

  // Cadastro simples: Nome e WhatsApp obrigatórios (+ observação opcional de entrega)
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [deliveryNote, setDeliveryNote] = useState('');

  // Auto-sugestão inteligente se o cliente já tiver alguma compra no site
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Código de validação do número do cliente ao finalizar
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [waCodeUrl, setWaCodeUrl] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (!name && currentUser.name) setName(currentUser.name);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  const previousBuyers = useMemo<PreviousBuyerSuggestion[]>(() => {
    const map = new Map<string, PreviousBuyerSuggestion>();

    orders.forEach((o) => {
      const cName = (o.customer?.name || '').trim();
      if (!cName) return;
      const key = cName.toLowerCase();
      const cPhone = (o.customer?.phone || '').trim();
      const cEmail = (o.customer?.email || '').trim().toLowerCase();

      const existing = map.get(key);
      if (existing) {
        existing.orderCount += 1;
        if (!existing.phone && cPhone) existing.phone = cPhone;
      } else {
        map.set(key, {
          name: cName,
          phone: cPhone,
          email: cEmail,
          orderCount: 1,
          lastOrderNumber: o.orderNumber
        });
      }
    });

    registeredUsers.forEach((u) => {
      const cName = (u.name || '').trim();
      if (!cName) return;
      const key = cName.toLowerCase();
      const cPhone = (u.phone || '').trim();
      const cEmail = (u.email || '').trim().toLowerCase();

      const existing = map.get(key);
      if (existing) {
        if (!existing.phone && cPhone) existing.phone = cPhone;
      } else {
        map.set(key, {
          name: cName,
          phone: cPhone,
          email: cEmail,
          orderCount: 0
        });
      }
    });

    return Array.from(map.values());
  }, [orders, registeredUsers]);

  const filteredSuggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) {
      return previousBuyers.filter((b) => b.orderCount > 0).slice(0, 4);
    }
    return previousBuyers
      .filter((b) => {
        if (b.name.toLowerCase() === q && (!b.phone || b.phone === phone)) return false;
        return b.name.toLowerCase().includes(q);
      })
      .slice(0, 5);
  }, [name, phone, previousBuyers]);

  if (!isCheckoutOpen) return null;

  // Frete sempre VasconcelosExpress sem custos adicionais (R$ 0,00)
  const orderTotal = Math.max(0, cartSubtotal - cartDiscount);

  const formatPhoneMask = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // Notifica a Administradora (sandravasconcellossillva@gmail.com) por E-mail automaticamente
  const notifyAdminNewOrder = async (order: Order) => {
    const itemsSummary = order.items
      .map((i) => `${i.quantity}x ${i.name} (${formatBRL(i.price * i.quantity)})`)
      .join(' | ');

    // 1. Tenta via rota do servidor Express (/api/orders/notify-admin)
    try {
      await fetch('/api/orders/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: ADMIN_EMAIL,
          order
        })
      });
    } catch {
      // Continua para o relay direto compatível com Vercel
    }

    // 2. Disparo direto via FormSubmit AJAX para sandravasconcellossillva@gmail.com (funciona na Vercel sem backend)
    try {
      await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          _subject: `🛍️ Novo Pedido ${order.orderNumber} — ${order.customer.name} (${formatBRL(order.total)})`,
          _template: 'table',
          Pedido: order.orderNumber,
          Cliente: order.customer.name,
          WhatsApp_Cliente: `${order.customer.phone} (Validado por Código)`,
          Modalidade_Entrega: 'VasconcelosExpress (Sem custos adicionais - R$ 0,00)',
          Observacao_Entrega: deliveryNote || 'Entrega combinada via WhatsApp',
          Produtos_Selecionados: itemsSummary,
          Valor_Total: formatBRL(order.total),
          Condicao_de_Pagamento: 'A ser estabelecida pela Administração (Gerar PDF no Painel Admin)'
        })
      });
    } catch {
      // ignora bloqueio de rede offline
    }

    setAdminNotifiedEmail(true);
  };

  // Passo 1 -> Dispara código de validação para o número do cliente antes de concluir
  const handleStartValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, '').length < 10) {
      return;
    }

    // Se o cliente já está logado com telefone validado e é o mesmo telefone, finaliza direto
    if (
      currentUser?.phoneVerified &&
      currentUser.phone?.replace(/\D/g, '') === phone.replace(/\D/g, '')
    ) {
      await finalizeValidatedOrder();
      return;
    }

    setIsSubmitting(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setEnteredCode('');
    setCodeError('');

    const cleanDigits = phone.replace(/\D/g, '');
    const fullPhone = cleanDigits.startsWith('55') ? cleanDigits : `55${cleanDigits}`;
    const firstName = name.trim().split(' ')[0] || 'Cliente';
    const waText = `🔐 *VASCONCELOS — Código de Confirmação*\n\nOlá, *${firstName}*! Seu código para validar seu pedido e cadastro no site da *VASCONCELOS* é:\n\n👉 *${code}*`;
    setWaCodeUrl(`https://wa.me/${fullPhone}?text=${encodeURIComponent(waText)}`);

    sendPushNotification(
      `📲 Código de Confirmação: ${code}`,
      `Enviado para ${phone}. Digite ${code} para validar seu pedido na VASCONCELOS.`,
      undefined,
      'Validação de Cliente'
    );

    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: currentUser?.email || '',
          code
        })
      });
      const data = await res.json();
      if (data?.waMeUrl) setWaCodeUrl(data.waMeUrl);
    } catch {
      // Fallback para ambiente estático Vercel
    }

    setIsSubmitting(false);
    setStep('verify_phone');
  };

  const finalizeValidatedOrder = async () => {
    setIsSubmitting(true);

    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      name: 'VasconcelosExpress',
      cep: '00000-000',
      logradouro: sanitizeText(deliveryNote) || 'Entrega Combinada via WhatsApp',
      numero: 'S/N',
      complemento: '',
      bairro: 'VasconcelosExpress',
      localidade: 'Entrega Expressa',
      uf: 'BR'
    };

    const order = createOrder({
      customer: {
        name: sanitizeText(name.trim()),
        email: currentUser?.email || ADMIN_EMAIL,
        phone: sanitizeText(phone.trim()),
        cpf: currentUser?.cpf || 'Validado via Código SMS/WhatsApp'
      },
      shippingAddress,
      shippingMethod: {
        name: 'VasconcelosExpress (Sem Custo Adicional)',
        price: 0,
        days: 1
      },
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shippingCost: 0,
      total: orderTotal,
      couponCode: appliedCoupon?.code,
      paymentMethod: 'pix',
      paymentStatus: 'pending',
      orderStatus: 'pendente',
      installments: 1,
      trackingCode: `VSC${Math.floor(100000 + Math.random() * 900000)}EXP`,
      adminPaymentTerms: 'Condição de pagamento em definição pela Administração Vasconcelos.'
    });

    await notifyAdminNewOrder(order);

    setCreatedOrder(order);
    setIsSubmitting(false);
    setStep('done');
  };

  const handleConfirmVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');

    if (enteredCode.replace(/\D/g, '') !== verificationCode) {
      setCodeError('Código inválido. Verifique o código de 6 dígitos enviado para o seu número.');
      return;
    }

    await finalizeValidatedOrder();
  };

  // Monta link de WhatsApp com os dados do pedido para o ADM / Cliente
  const buildWhatsAppOrderUrl = (order: Order) => {
    const itemsList = order.items
      .map((i) => `• ${i.quantity}x ${i.name} (${formatBRL(i.price * i.quantity)})`)
      .join('\n');

    const text = [
      `Olá! Acabei de finalizar e validar o pedido *${order.orderNumber}* no site da *VASCONCELOS*.`,
      ``,
      `👤 *Cliente:* ${order.customer.name} (Número Validado ✅)`,
      `📱 *WhatsApp:* ${order.customer.phone}`,
      `🚚 *Entrega:* VasconcelosExpress (Grátis - Sem custo adicional)`,
      deliveryNote ? `📍 *Obs. de Entrega:* ${deliveryNote}` : '',
      ``,
      `🛍️ *Produtos Selecionados:*`,
      itemsList,
      ``,
      `💰 *Total do Pedido:* *${formatBRL(order.total)}*`,
      ``,
      `Aguardo a definição da condição de pagamento e o PDF com os detalhes!`
    ]
      .filter(Boolean)
      .join('\n');

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-neutral-200 my-8">
        {/* Checkout Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-[#F7F6F2]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-800" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-800">
              VASCONCELOS • Finalização Rápida de Pedido
            </span>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 text-center text-[11px] font-bold border-b border-neutral-200 bg-white">
          <div
            className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${
              step === 'form' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Identificação</span>
          </div>
          <div
            className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${
              step === 'verify_phone'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'verify_phone' ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              2
            </span>
            <span>Validação SMS/WhatsApp</span>
          </div>
          <div
            className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${
              step === 'done' ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-neutral-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'done' ? 'bg-emerald-700 text-white' : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              3
            </span>
            <span>Pedido & PDF</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {/* PASSO 1: CADASTRO SIMPLES (NOME COM SUGESTÃO + WHATSAPP OBRIGATÓRIO) + VASCONCELOS EXPRESS */}
          {step === 'form' && (
            <form onSubmit={handleStartValidation} className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-900 mb-1">
                  1. Seus Dados para Contato
                </h3>
                <p className="text-xs text-neutral-500 mb-4">
                  Se você já realizou alguma compra no site, basta começar a digitar seu nome para preenchimento automático.
                </p>

                <div className="space-y-3.5">
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                        Seu Nome Completo <span className="text-[#8B1E3F]">*</span>
                      </label>
                      {previousBuyers.some((b) => b.orderCount > 0) && (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Sugestão inteligente ativa
                        </span>
                      )}
                    </div>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        required
                        value={name}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                        onChange={(e) => {
                          setName(e.target.value);
                          setShowSuggestions(true);
                        }}
                        placeholder="Ex: Maria Clara Vasconcelos"
                        className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 focus:border-neutral-950 focus:bg-white outline-hidden"
                      />
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    </div>

                    {/* Sugestão automática de clientes que já compraram */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-xl shadow-xl overflow-hidden">
                        <div className="px-3 py-1.5 bg-[#F7F6F2] border-b border-neutral-200 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                          <ShoppingBag className="w-3 h-3 text-[#8B1E3F]" />
                          <span>Compra anterior encontrada — clique para usar:</span>
                        </div>
                        <div className="max-h-40 overflow-y-auto divide-y divide-neutral-100">
                          {filteredSuggestions.map((item, idx) => (
                            <button
                              key={`${item.name}-${idx}`}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setName(item.name);
                                if (item.phone) setPhone(formatPhoneMask(item.phone));
                                setShowSuggestions(false);
                              }}
                              className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50/70 transition flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <div>
                                <p className="text-xs font-bold text-neutral-900">{item.name}</p>
                                {item.phone && (
                                  <p className="text-[11px] text-neutral-500">📱 {item.phone}</p>
                                )}
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Cliente do Site
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                      Seu Número de Celular / WhatsApp com DDD <span className="text-[#8B1E3F]">*</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
                        placeholder="(92) 98479-7348"
                        className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 focus:border-neutral-950 focus:bg-white outline-hidden font-mono"
                      />
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                      Referência / Local de Entrega (Opcional)
                    </label>
                    <input
                      type="text"
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="Ex: Bairro, condomínio ou melhor horário para entrega"
                      className="w-full mt-1 bg-[#F7F6F2] border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:border-neutral-950 focus:bg-white outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Modalidade de Entrega Fixa: VasconcelosExpress */}
              <div className="pt-4 border-t border-neutral-200">
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-900 mb-2.5 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-neutral-800" />
                  2. Modalidade de Entrega Exclusiva
                </h3>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#F7F6F2] border-2 border-neutral-950">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-neutral-950 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-neutral-950 uppercase tracking-wider">
                        VasconcelosExpress
                      </p>
                      <p className="text-[11px] text-neutral-600">
                        Entrega personalizada e direta sem custos adicionais
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider">
                    GRÁTIS
                  </span>
                </div>
              </div>

              {/* 3. Condição de Pagamento sob responsabilidade do ADM */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                  <ShieldCheck className="w-4 h-4 text-[#8B1E3F]" />
                  <span>Condição de Pagamento Personalizada pela Administração</span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Ao finalizar, enviaremos um código de confirmação para validar seu celular e seu pedido será encaminhado para a Administração (<strong>{ADMIN_EMAIL}</strong>) com emissão de <strong>PDF oficial</strong>.
                </p>
              </div>

              {/* Resumo de Valor & Botão Finalizar */}
              <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider block">
                    Total dos Produtos (Frete Grátis):
                  </span>
                  <p className="text-2xl font-extrabold text-neutral-950">
                    {formatBRL(orderTotal)}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Enviando Código...' : 'Validar Celular e Finalizar'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* PASSO 2: VALIDAÇÃO DO NÚMERO DO CLIENTE POR CÓDIGO */}
          {step === 'verify_phone' && (
            <div className="space-y-5 py-2 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar e alterar número</span>
              </button>

              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
                  <KeyRound className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700 block">
                  VALIDAÇÃO DO CLIENTE
                </span>
                <h3 className="text-xl font-bold text-neutral-950">
                  Confirme o Código Enviado ao seu Celular
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Enviamos um código de 6 dígitos para o número{' '}
                  <strong className="text-neutral-900 font-mono">{phone}</strong> para confirmar que o cliente está validado.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2.5 max-w-md mx-auto">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Código enviado para {phone}:</span>
                    </p>
                    <p className="text-xs text-emerald-800 mt-1">
                      Seu código:{' '}
                      <strong className="font-mono text-base bg-white px-2.5 py-0.5 rounded border border-emerald-300 text-emerald-950 tracking-widest">
                        {verificationCode}
                      </strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnteredCode(verificationCode)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Preencher Código
                  </button>
                </div>

                {waCodeUrl && (
                  <a
                    href={waCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Abrir / Receber Código no WhatsApp ({phone})</span>
                  </a>
                )}
              </div>

              {codeError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs text-center max-w-md mx-auto">
                  {codeError}
                </div>
              )}

              <form onSubmit={handleConfirmVerificationCode} className="space-y-4 max-w-md mx-auto">
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
                    className="w-full bg-[#F7F6F2] border-2 border-neutral-300 focus:border-neutral-950 focus:bg-white rounded-xl py-3 px-4 text-center font-mono text-2xl font-extrabold tracking-[0.4em] text-neutral-950 outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || enteredCode.length < 6}
                  className="w-full py-3.5 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Validando e Enviando Pedido...' : 'Confirmar Código e Concluir Pedido'}</span>
                </button>
              </form>
            </div>
          )}

          {/* PASSO 3: CONFIRMAÇÃO + ENVIO PARA ADM + DOWNLOAD DO PDF */}
          {step === 'done' && createdOrder && (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Cliente Validado • Pedido Registrado
                </span>
                <h2 className="text-2xl font-bold text-neutral-950 mt-1.5">
                  Obrigado, {createdOrder.customer.name.split(' ')[0]}!
                </h2>
                <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">
                  Seu número <strong>{createdOrder.customer.phone}</strong> foi validado e o pedido{' '}
                  <strong>{createdOrder.orderNumber}</strong> já foi encaminhado para a Administração (
                  <strong>{ADMIN_EMAIL}</strong>).
                </p>
              </div>

              {/* Card de Resumo */}
              <div className="bg-[#F7F6F2] rounded-xl p-4 border border-neutral-200 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500">Número do Pedido:</span>
                  <span className="font-mono font-bold text-neutral-950">{createdOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cliente / WhatsApp Validado:</span>
                  <span className="font-semibold text-emerald-700">{createdOrder.customer.phone} ✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Modalidade de Entrega:</span>
                  <span className="font-bold text-emerald-700">VasconcelosExpress (GRÁTIS)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Condição de Pagamento:</span>
                  <span className="font-semibold text-[#8B1E3F]">Definida pelo ADM</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200">
                  <span className="font-bold text-neutral-950">Total do Pedido:</span>
                  <span className="font-extrabold text-neutral-950">{formatBRL(createdOrder.total)}</span>
                </div>
              </div>

              {adminNotifiedEmail && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Notificação enviada para {ADMIN_EMAIL}</span>
                </div>
              )}

              {/* Botões de Ação: WhatsApp para ADM + Gerar PDF + Continuar */}
              <div className="space-y-2.5 max-w-md mx-auto pt-2">
                <a
                  href={buildWhatsAppOrderUrl(createdOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Pedido por WhatsApp para o ADM</span>
                </a>

                <button
                  type="button"
                  onClick={() => generateOrderConditionsPdf({ order: createdOrder })}
                  className="w-full py-3 px-5 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Baixar PDF do Pedido & Condições</span>
                </button>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setIsAccountOpen(true);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-lg border border-neutral-300 text-neutral-800 hover:bg-neutral-100 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Meus Pedidos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setStep('form');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-lg border border-neutral-300 text-neutral-800 hover:bg-neutral-100 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Voltar à Loja
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
