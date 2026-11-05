import React, { useState, useEffect } from 'react';
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
  Phone
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Address, Order } from '../types';
import { formatBRL } from '../utils/formatters';
import { sanitizeText } from '../utils/security';
import { generateOrderConditionsPdf } from '../utils/pdfGenerator';

const ADMIN_EMAIL = 'sandravasconcellossillva@gmail.com';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    currentUser,
    createOrder,
    setIsAccountOpen
  } = useStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminNotifiedEmail, setAdminNotifiedEmail] = useState(false);

  // Cadastro simples: apenas Nome e WhatsApp (+ observação opcional de entrega)
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [deliveryNote, setDeliveryNote] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (!name && currentUser.name) setName(currentUser.name);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  if (!isCheckoutOpen) return null;

  // Frete sempre VasconcelosExpress sem custos adicionais (R$ 0,00)
  const shippingCost = 0;
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
          WhatsApp_Cliente: order.customer.phone,
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

  const handleSubmitSimpleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, '').length < 10) {
      return;
    }

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
        cpf: currentUser?.cpf || 'Isento'
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
    setStep(2);
  };

  // Monta link de WhatsApp com os dados do pedido para o ADM / Cliente
  const buildWhatsAppOrderUrl = (order: Order) => {
    const itemsList = order.items
      .map((i) => `• ${i.quantity}x ${i.name} (${formatBRL(i.price * i.quantity)})`)
      .join('\n');

    const text = [
      `Olá! Acabei de finalizar o pedido *${order.orderNumber}* no site da *VASCONCELOS*.`,
      ``,
      `👤 *Cliente:* ${order.customer.name}`,
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

        {/* Step Indicator (2 passos simples) */}
        <div className="grid grid-cols-2 text-center text-xs font-bold border-b border-neutral-200 bg-white">
          <div
            className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${step === 1 ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-400'
              }`}
          >
            <span className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Identificação & VasconcelosExpress</span>
          </div>
          <div
            className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${step === 2 ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-neutral-400'
              }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-emerald-700 text-white' : 'bg-neutral-100 text-neutral-500'
                }`}
            >
              2
            </span>
            <span>Pedido Enviado & PDF</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {/* PASSO 1: CADASTRO SIMPLES (NOME + WHATSAPP) + VASCONCELOS EXPRESS */}
          {step === 1 && (
            <form onSubmit={handleSubmitSimpleOrder} className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-900 mb-1">
                  1. Seus Dados para Contato
                </h3>
                <p className="text-xs text-neutral-500 mb-4">
                  Preencha apenas seu nome e WhatsApp para receber o atendimento e as condições de pagamento.
                </p>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                      Seu Nome Completo *
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Maria Clara Vasconcelos"
                        className="w-full bg-[#F7F6F2] border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-neutral-900 focus:border-neutral-950 focus:bg-white outline-hidden"
                      />
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                      Seu WhatsApp com DDD *
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
                        placeholder="(11) 98765-4321"
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
                  Ao concluir, seu pedido será enviado diretamente para a Administração (<strong>{ADMIN_EMAIL}</strong>) e via WhatsApp. As condições de pagamento (à vista ou parcelado) serão estabelecidas pelo ADM com emissão de <strong>PDF oficial</strong>.
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
                  <span>{isSubmitting ? 'Enviando Pedido...' : 'Finalizar Pedido'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* PASSO 2: CONFIRMAÇÃO + ENVIO PARA ADM + DOWNLOAD DO PDF */}
          {step === 2 && createdOrder && (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                  Pedido Registrado com Sucesso
                </span>
                <h2 className="text-2xl font-bold text-neutral-950 mt-1">
                  Obrigado, {createdOrder.customer.name.split(' ')[0]}!
                </h2>
                <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">
                  Seu pedido <strong>{createdOrder.orderNumber}</strong> já foi encaminhado para a Administração (<strong>{ADMIN_EMAIL}</strong>).
                </p>
              </div>

              {/* Card de Resumo */}
              <div className="bg-[#F7F6F2] rounded-xl p-4 border border-neutral-200 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500">Número do Pedido:</span>
                  <span className="font-mono font-bold text-neutral-950">{createdOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cliente / WhatsApp:</span>
                  <span className="font-semibold text-neutral-900">{createdOrder.customer.phone}</span>
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
                      setStep(1);
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
