import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  FileText, 
  Truck, 
  Copy, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Clock, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, ShippingQuote, Address, Order } from '../types';
import { formatBRL, formatInstallment } from '../utils/formatters';
import { isValidCreditCardNumber, sanitizeText, maskSensitiveData } from '../utils/security';

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
    calculateShipping,
    freeShippingThreshold,
    setIsAccountOpen
  } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Step 1: Customer & Address Form
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [cpf, setCpf] = useState(currentUser?.cpf || '');
  
  const [cep, setCep] = useState(currentUser?.addresses[0]?.cep || '01415-000');
  const [logradouro, setLogradouro] = useState(currentUser?.addresses[0]?.logradouro || 'Alameda Santos');
  const [numero, setNumero] = useState(currentUser?.addresses[0]?.numero || '1800');
  const [complemento, setComplemento] = useState(currentUser?.addresses[0]?.complemento || 'Conjunto 14');
  const [bairro, setBairro] = useState(currentUser?.addresses[0]?.bairro || 'Cerqueira César');
  const [localidade, setLocalidade] = useState(currentUser?.addresses[0]?.localidade || 'São Paulo');
  const [uf, setUf] = useState(currentUser?.addresses[0]?.uf || 'SP');
  
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<ShippingQuote | null>(null);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Step 2: Payment Details
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  
  // Credit Card Form
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [cardHolder, setCardHolder] = useState(currentUser?.name.toUpperCase() || 'ISABELA VASCONCELOS');
  const [cardExpiry, setCardExpiry] = useState('11/29');
  const [cardCvv, setCardCvv] = useState('892');
  const [installments, setInstallments] = useState(1);

  // PIX states
  const [pixCopied, setPixCopied] = useState(false);
  const [pixTimer, setPixTimer] = useState(900); // 15 mins
  const [pixPaidSimulated, setPixPaidSimulated] = useState(false);

  // Auto calculate shipping when checkout opens or CEP changes
  useEffect(() => {
    if (isCheckoutOpen && cep.replace(/\D/g, '').length === 8) {
      handleLookupCep(cep);
    }
  }, [isCheckoutOpen]);

  // PIX countdown timer
  useEffect(() => {
    let interval: any;
    if (step === 2 && paymentMethod === 'pix' && pixTimer > 0) {
      interval = setInterval(() => {
        setPixTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, paymentMethod, pixTimer]);

  const handleLookupCep = async (targetCep: string) => {
    const raw = targetCep.replace(/\D/g, '');
    if (raw.length !== 8) return;
    setIsSearchingCep(true);
    try {
      const res = await calculateShipping(raw);
      if (res.address) {
        if (res.address.logradouro) setLogradouro(res.address.logradouro);
        if (res.address.bairro) setBairro(res.address.bairro);
        if (res.address.localidade) setLocalidade(res.address.localidade);
        if (res.address.uf) setUf(res.address.uf);
      }
      setShippingQuotes(res.quotes);
      if (res.quotes.length > 0) {
        setSelectedQuote(res.quotes[0]);
      }
    } catch {
      // ignore
    } finally {
      setIsSearchingCep(false);
    }
  };

  if (!isCheckoutOpen) return null;

  const shippingCost = selectedQuote ? selectedQuote.price : 0;
  const orderTotal = Math.max(0, cartSubtotal - cartDiscount + shippingCost);

  // Handle proceed to payment step
  const handleGoToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) {
      alert('Por favor, selecione um método de frete.');
      return;
    }
    setStep(2);
  };

  // Finalize order
  const handleFinalizeOrder = (instantPaid = false) => {
    if (!selectedQuote) return;

    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      name: 'Entrega',
      cep: sanitizeText(cep),
      logradouro: sanitizeText(logradouro),
      numero: sanitizeText(numero),
      complemento: sanitizeText(complemento),
      bairro: sanitizeText(bairro),
      localidade: sanitizeText(localidade),
      uf: sanitizeText(uf)
    };

    const order = createOrder({
      customer: {
        name: sanitizeText(name) || 'Cliente Vasconcelos',
        email: sanitizeText(email) || 'cliente@vasconcelosbeauty.com.br',
        phone: sanitizeText(phone) || '(11) 99999-9999',
        cpf: sanitizeText(cpf) || '000.000.000-00'
      },
      shippingAddress,
      shippingMethod: {
        name: selectedQuote.name,
        price: selectedQuote.price,
        days: selectedQuote.deliveryDays
      },
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shippingCost,
      total: orderTotal,
      couponCode: appliedCoupon?.code,
      paymentMethod,
      paymentStatus: (paymentMethod === 'credit_card' || instantPaid) ? 'paid' : 'pending',
      orderStatus: (paymentMethod === 'credit_card' || instantPaid) ? 'pago' : 'pendente',
      installments: paymentMethod === 'credit_card' ? installments : undefined,
      trackingCode: `VSC${Math.floor(100000 + Math.random() * 900000)}BR`
    });

    setCreatedOrder(order);
    setStep(3);

    // Launch celebratory confetti!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E91E63', '#FF2A85', '#D4AF37', '#111111']
      });
    } catch {
      // ignore
    }
  };

  const copyPixCode = () => {
    const pixCode = `00020126580014br.gov.bcb.pix0136pix@vasconcelosbeauty.com.br5204000053039865405${orderTotal.toFixed(2)}5802BR5916VASCONCELOS BEAUTY6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-pink-100 my-8">
        
        {/* Checkout Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Checkout Seguro vasconcelos Presente • Criptografia 256-bit
            </span>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 text-center text-xs font-bold border-b border-neutral-200 bg-white">
          <div className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${
            step >= 1 ? 'border-pink-600 text-pink-600' : 'border-transparent text-neutral-400'
          }`}>
            <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-[10px]">1</span>
            <span>Entrega</span>
          </div>
          <div className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${
            step >= 2 ? 'border-pink-600 text-pink-600' : 'border-transparent text-neutral-400'
          }`}>
            <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-[10px]">2</span>
            <span>Pagamento</span>
          </div>
          <div className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${
            step === 3 ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-neutral-400'
          }`}>
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">3</span>
            <span>Confirmação</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: Customer Details & Shipping Address */}
          {step === 1 && (
            <form onSubmit={handleGoToPayment} className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-neutral-900 mb-3 font-display">
                  1. Dados Pessoais do Comprador
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Maria Clara Vasconcelos"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700">E-mail para confirmação</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700">WhatsApp / Telefone</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700">CPF (Nota Fiscal)</label>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="123.456.789-00"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="pt-4 border-t border-neutral-200">
                <h3 className="text-base font-bold text-neutral-900 mb-3 font-display">
                  2. Endereço de Entrega
                </h3>
                
                <div className="space-y-3">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-[11px] font-bold text-neutral-700">CEP</label>
                      <input
                        type="text"
                        required
                        maxLength={9}
                        value={cep}
                        onChange={(e) => {
                          setCep(e.target.value);
                          if (e.target.value.replace(/\D/g, '').length === 8) {
                            handleLookupCep(e.target.value);
                          }
                        }}
                        placeholder="00000-000"
                        className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLookupCep(cep)}
                      className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition"
                    >
                      {isSearchingCep ? 'Buscando...' : 'Buscar CEP'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-neutral-700">Logradouro / Rua</label>
                      <input
                        type="text"
                        required
                        value={logradouro}
                        onChange={(e) => setLogradouro(e.target.value)}
                        placeholder="Rua ou Avenida"
                        className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700">Número</label>
                      <input
                        type="text"
                        required
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        placeholder="123"
                        className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700">Complemento</label>
                      <input
                        type="text"
                        value={complemento}
                        onChange={(e) => setComplemento(e.target.value)}
                        placeholder="Apto, Bloco (opcional)"
                        className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700">Bairro</label>
                      <input
                        type="text"
                        required
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                        className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700">Cidade / UF</label>
                      <input
                        type="text"
                        required
                        value={`${localidade} - ${uf}`}
                        readOnly
                        className="w-full mt-1 bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Method Options */}
              {shippingQuotes.length > 0 && (
                <div className="pt-4 border-t border-neutral-200">
                  <h3 className="text-base font-bold text-neutral-900 mb-2 font-display flex items-center gap-2">
                    <Truck className="w-4 h-4 text-pink-600" />
                    3. Escolha o Frete
                  </h3>
                  <div className="space-y-2">
                    {shippingQuotes.map((quote) => (
                      <label
                        key={quote.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                          selectedQuote?.id === quote.id
                            ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-200'
                            : 'bg-white border-neutral-200 hover:border-pink-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingQuote"
                            checked={selectedQuote?.id === quote.id}
                            onChange={() => setSelectedQuote(quote)}
                            className="text-pink-600 focus:ring-pink-500"
                          />
                          <div>
                            <p className="text-xs font-bold text-neutral-900">{quote.name}</p>
                            <p className="text-[11px] text-neutral-500">
                              Prazo de entrega: {quote.deliveryDays} {quote.deliveryDays === 1 ? 'dia útil' : 'dias úteis'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-neutral-900">
                          {quote.price === 0 ? (
                            <strong className="text-emerald-600">GRÁTIS</strong>
                          ) : (
                            formatBRL(quote.price)
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Order summary bar & Next step button */}
              <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-neutral-500">Total a pagar:</span>
                  <p className="text-xl font-black text-pink-600 font-display">
                    {formatBRL(orderTotal)}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-neutral-900 hover:bg-pink-600 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition"
                >
                  <span>Continuar para Pagamento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Integrated Payment Selection */}
          {step === 2 && (
            <div className="space-y-6">
              
              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'pix'
                      ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-200 text-pink-700 font-bold'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs">PIX Instantâneo</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                    Aprovação Imediata
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'credit_card'
                      ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-200 text-pink-700 font-bold'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-neutral-800" />
                  <span className="text-xs">Cartão de Crédito</span>
                  <span className="text-[9px] text-neutral-500 font-semibold">Até 10x s/ juros</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('boleto')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'boleto'
                      ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-200 text-pink-700 font-bold'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <FileText className="w-5 h-5 text-neutral-600" />
                  <span className="text-xs">Boleto Bancário</span>
                  <span className="text-[9px] text-neutral-500">Compensação em 1 dia</span>
                </button>
              </div>

              {/* PIX SCREEN */}
              {paymentMethod === 'pix' && (
                <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 text-center space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pague com PIX e receba seu pedido mais rápido!
                  </div>

                  {/* QR Code Container */}
                  <div className="mx-auto w-48 h-48 bg-white p-3 rounded-2xl shadow-md border border-neutral-200 flex flex-col items-center justify-center relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-900">
                      {/* Stylized QR Code SVG Pattern */}
                      <rect x="0" y="0" width="30" height="30" fill="currentColor" rx="2" />
                      <rect x="5" y="5" width="20" height="20" fill="white" rx="1" />
                      <rect x="10" y="10" width="10" height="10" fill="#E91E63" rx="1" />

                      <rect x="70" y="0" width="30" height="30" fill="currentColor" rx="2" />
                      <rect x="75" y="5" width="20" height="20" fill="white" rx="1" />
                      <rect x="80" y="10" width="10" height="10" fill="#E91E63" rx="1" />

                      <rect x="0" y="70" width="30" height="30" fill="currentColor" rx="2" />
                      <rect x="5" y="75" width="20" height="20" fill="white" rx="1" />
                      <rect x="10" y="80" width="10" height="10" fill="#E91E63" rx="1" />

                      {/* Random data squares */}
                      <rect x="36" y="8" width="8" height="8" fill="currentColor" />
                      <rect x="48" y="12" width="6" height="6" fill="currentColor" />
                      <rect x="14" y="38" width="6" height="6" fill="currentColor" />
                      <rect x="25" y="45" width="10" height="8" fill="currentColor" />
                      <rect x="40" y="40" width="20" height="20" fill="#111" rx="2" />
                      <circle cx="50" cy="50" r="5" fill="#E91E63" />
                      <rect x="68" y="40" width="8" height="12" fill="currentColor" />
                      <rect x="85" y="48" width="10" height="6" fill="currentColor" />
                      <rect x="40" y="68" width="12" height="8" fill="currentColor" />
                      <rect x="60" y="75" width="14" height="10" fill="currentColor" />
                      <rect x="80" y="80" width="12" height="12" fill="currentColor" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      QR Code expira em: {Math.floor(pixTimer / 60)}:
                      {String(pixTimer % 60).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="space-y-2 max-w-sm mx-auto">
                    <button
                      onClick={copyPixCode}
                      className="w-full py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-xs font-bold text-neutral-800 flex items-center justify-center gap-2 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{pixCopied ? 'Código PIX Copiado!' : 'Copiar Código Pix (Copia e Cola)'}</span>
                    </button>

                    <button
                      onClick={() => handleFinalizeOrder(true)}
                      className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Pagamento PIX (Simular Aprovação)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CREDIT CARD SCREEN */}
              {paymentMethod === 'credit_card' && (
                <div className="space-y-4">
                  {/* Visual card mockup */}
                  <div className="bg-gradient-to-tr from-neutral-900 via-neutral-800 to-rose-900 text-white p-5 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest text-pink-300 font-bold">
                        vasconcelos Presente VIP Card
                      </span>
                      <span className="font-extrabold italic tracking-wider">VISA / MASTER</span>
                    </div>

                    <div className="pt-2">
                      <p className="font-mono text-base tracking-widest">{cardNumber}</p>
                    </div>

                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="block text-[9px] text-neutral-400 uppercase">Titular</span>
                        <p className="font-semibold">{cardHolder}</p>
                      </div>
                      <div>
                        <span className="block text-[9px] text-neutral-400 uppercase">Validade</span>
                        <p className="font-semibold">{cardExpiry}</p>
                      </div>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700">Número do Cartão</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        className={`w-full mt-1 bg-neutral-50 border rounded-xl px-3 py-2 text-xs text-neutral-900 font-mono transition ${
                          isValidCreditCardNumber(cardNumber) || cardNumber.includes('••••')
                            ? 'border-emerald-400 focus:border-emerald-500'
                            : cardNumber.replace(/\D/g, '').length >= 13
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-neutral-300 focus:border-amber-500'
                        }`}
                      />
                      {isValidCreditCardNumber(cardNumber) || cardNumber.includes('••••') ? (
                        <p className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Cartão autenticado via Algoritmo de Luhn (Módulo 10)
                        </p>
                      ) : cardNumber.replace(/\D/g, '').length >= 13 ? (
                        <p className="text-[10px] text-rose-600 mt-1 font-medium">
                          Dígitos do cartão incorretos segundo validação de Luhn.
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-700">Nome Impresso no Cartão</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="NOME COMO NO CARTAO"
                        className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700">Validade (MM/AA)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/AA"
                          className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700">CVV (Código de segurança)</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 font-mono"
                        />
                      </div>
                    </div>

                    {/* Installments selector */}
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700">Número de Parcelas</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 font-semibold"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}x de {formatBRL(orderTotal / n)} sem juros
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFinalizeOrder(true)}
                    className="w-full py-4 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pagar {formatBRL(orderTotal)} no Cartão</span>
                  </button>
                </div>
              )}

              {/* BOLETO SCREEN */}
              {paymentMethod === 'boleto' && (
                <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 text-center space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                    <FileText className="w-3.5 h-3.5" />
                    Boleto Bancário Registrado
                  </div>

                  <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                    O boleto pode ser pago em qualquer banco ou aplicativo de banco. A confirmação ocorre normalmente em até 1 dia útil após o pagamento.
                  </p>

                  <div className="bg-white p-4 rounded-2xl border border-neutral-200 font-mono text-xs text-neutral-800 break-all select-all">
                    34191.79001 01043.510047 91020.150008 8 987600000{Math.round(orderTotal * 100)}
                  </div>

                  <button
                    onClick={() => handleFinalizeOrder(false)}
                    className="w-full py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Gerar Boleto & Finalizar Pedido</span>
                  </button>
                </div>
              )}

              {/* Back to Step 1 */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline font-semibold"
              >
                ← Voltar e alterar dados de entrega
              </button>
            </div>
          )}

          {/* STEP 3: Order Completed Confirmation */}
          {step === 3 && createdOrder && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  {createdOrder.paymentStatus === 'paid' ? 'Pagamento Confirmado!' : 'Pedido Criado com Sucesso!'}
                </span>
                <h2 className="text-2xl font-black text-neutral-900 font-display mt-1">
                  Obrigado pela sua compra na vasconcelos Presente!
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Enviamos o comprovante detalhado para <strong>{createdOrder.customer.email}</strong>
                </p>
              </div>

              {/* Order Info Card */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500">Número do Pedido:</span>
                  <span className="font-mono font-bold text-neutral-900">{createdOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Código de Rastreio:</span>
                  <span className="font-mono font-bold text-pink-600">{createdOrder.trackingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Método de Envio:</span>
                  <span className="font-semibold text-neutral-900">{createdOrder.shippingMethod.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Previsão de Entrega:</span>
                  <span className="font-semibold text-neutral-900">{createdOrder.shippingMethod.days} dias úteis</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200">
                  <span className="font-bold text-neutral-900">Total Pago:</span>
                  <span className="font-bold text-pink-600">{formatBRL(createdOrder.total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setIsAccountOpen(true);
                  }}
                  className="px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Acompanhar em Meus Pedidos
                </button>
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setStep(1);
                  }}
                  className="px-6 py-3 rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider"
                >
                  Continuar Comprando
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
