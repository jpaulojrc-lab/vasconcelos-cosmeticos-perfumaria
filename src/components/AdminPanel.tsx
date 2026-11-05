import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  Users,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  Tag,
  Save,
  X,
  ExternalLink,
  LogOut,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  Wand2,
  Info,
  Mail,
  Send,
  Percent,
  MessageCircle,
  Phone,
  Copy,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, Order, OrderStatus, Coupon, PaymentReceipt } from '../types';
import { formatBRL, formatDate } from '../utils/formatters';
import { AdminLogin } from './AdminLogin';
import { SUPABASE_TABLES, supabasePatch, supabaseUpsert } from '../lib/supabase';
import { generateOrderConditionsPdf } from '../utils/pdfGenerator';

function formatReceiptDateBr(dateStr: string): string {
  if (!dateStr) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
  return dateStr;
}

export const AdminPanel: React.FC = () => {
  const {
    products,
    orders,
    registeredUsers,
    currentUser,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateOrderPaymentConditions,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    notifyCustomersAboutCoupon,
    setViewMode,
    isAdminAuthenticated,
    adminLogout,
    supabaseConnected,
    syncAllToSupabase
  } = useStore();

  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [supabaseSyncMsg, setSupabaseSyncMsg] = useState<string | null>(null);

  // Modal de Condições de Pagamento do ADM (Controle por Data + Valor Recebido e Saldo Automático)
  const [conditionModalOrder, setConditionModalOrder] = useState<Order | null>(null);
  const [condMethod, setCondMethod] = useState<Order['paymentMethod']>('pix');
  const [condInstallments, setCondInstallments] = useState<number>(1);
  const [condStatus, setCondStatus] = useState<Order['paymentStatus']>('pending');
  const [condDueDate, setCondDueDate] = useState<string>('Imediato');
  const [condNotes, setCondNotes] = useState<string>('');
  const [condReceipts, setCondReceipts] = useState<PaymentReceipt[]>([]);
  const [newReceiptDate, setNewReceiptDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [newReceiptAmount, setNewReceiptAmount] = useState<string>('');
  const [newReceiptMethod, setNewReceiptMethod] = useState<string>('PIX');

  const handleOpenConditionModal = (order: Order) => {
    setConditionModalOrder(order);
    setCondMethod(order.paymentMethod || 'pix');
    setCondInstallments(Math.max(1, order.installments || 1));
    setCondStatus(order.paymentStatus || 'pending');
    setCondDueDate(order.adminFirstDueDate || 'Conforme combinado');
    setCondNotes(
      order.adminPaymentTerms ||
        'Entrega exclusiva via VasconcelosExpress sem custos adicionais (Frete Grátis).'
    );
    const existingReceipts = order.paymentReceipts || [];
    setCondReceipts(existingReceipts);
    setNewReceiptDate(new Date().toISOString().slice(0, 10));
    setNewReceiptAmount('');
    setNewReceiptMethod('PIX');
  };

  const handleAddReceiptToModal = () => {
    if (!conditionModalOrder) return;
    const parsedAmount = parseFloat(newReceiptAmount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const entry: PaymentReceipt = {
      id: `rec-${Date.now()}`,
      date: newReceiptDate || new Date().toISOString().slice(0, 10),
      amount: parsedAmount,
      method: newReceiptMethod || 'PIX'
    };

    const nextReceipts = [...condReceipts, entry];
    setCondReceipts(nextReceipts);
    setNewReceiptAmount('');

    const totalPaid = nextReceipts.reduce((s, r) => s + r.amount, 0);
    if (totalPaid >= conditionModalOrder.total - 0.01) {
      setCondStatus('paid');
    }
  };

  const handleRemoveReceiptFromModal = (id: string) => {
    const nextReceipts = condReceipts.filter((r) => r.id !== id);
    setCondReceipts(nextReceipts);
    if (conditionModalOrder) {
      const totalPaid = nextReceipts.reduce((s, r) => s + r.amount, 0);
      if (totalPaid < conditionModalOrder.total - 0.01) {
        setCondStatus('pending');
      }
    }
  };

  const [activeTab, setActiveTab] = useState<'relatorios' | 'estoque' | 'cupons' | 'cobranca'>('relatorios');

  // Filters for Stock
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('todos');

  // Filters for Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('todos');

  // Modal for new/edit product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('perfumaria');
  const [formPrice, setFormPrice] = useState('149.90');
  const [formOriginalPrice, setFormOriginalPrice] = useState('199.90');
  const [formStock, setFormStock] = useState('50');
  const [formVolume, setFormVolume] = useState('100ml');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Link import states
  const [importUrl, setImportUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractFeedback, setExtractFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Additional product feature states
  const [formNotesTopo, setFormNotesTopo] = useState('');
  const [formNotesCoracao, setFormNotesCoracao] = useState('');
  const [formNotesFundo, setFormNotesFundo] = useState('');
  const [formBenefitsText, setFormBenefitsText] = useState('');
  const [formActivesText, setFormActivesText] = useState('');

  // Tracking Code edit state for order
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  // Coupon Management States
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponCode, setEditingCouponCode] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState('10');
  const [couponMinOrder, setCouponMinOrder] = useState('99');
  const [couponDescription, setCouponDescription] = useState('');
  const [sendEmailOnCreate, setSendEmailOnCreate] = useState(true);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [sendingCouponCode, setSendingCouponCode] = useState<string | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    emails?: string[];
  } | null>(null);

  // Unique customer emails count for display
  const uniqueCustomerEmails = Array.from(
    new Set([
      ...registeredUsers.map(u => u.email?.toLowerCase()).filter(Boolean),
      ...(currentUser?.email ? [currentUser.email.toLowerCase()] : []),
      ...orders.map(o => o.customer?.email?.toLowerCase()).filter(Boolean)
    ])
  );

  const handleOpenAddCoupon = () => {
    setEditingCouponCode(null);
    setCouponCode('');
    setCouponDiscountType('percentage');
    setCouponValue('15');
    setCouponMinOrder('100');
    setCouponDescription('');
    setSendEmailOnCreate(true);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (coupon: Coupon) => {
    setEditingCouponCode(coupon.code);
    setCouponCode(coupon.code);
    setCouponDiscountType(coupon.discountType);
    setCouponValue(coupon.value.toString());
    setCouponMinOrder(coupon.minOrderValue.toString());
    setCouponDescription(coupon.description);
    setSendEmailOnCreate(false);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFeedback(null);

    const parsedVal = parseFloat(couponValue);
    const parsedMin = parseFloat(couponMinOrder) || 0;

    if (!couponCode.trim()) {
      setCouponFeedback({ type: 'error', message: 'Informe o código do cupom.' });
      return;
    }

    if (isNaN(parsedVal) || parsedVal <= 0) {
      setCouponFeedback({ type: 'error', message: 'Informe um valor de desconto válido maior que zero.' });
      return;
    }

    const couponPayload: Coupon = {
      code: couponCode.trim().toUpperCase(),
      discountType: couponDiscountType,
      value: parsedVal,
      minOrderValue: parsedMin,
      description:
        couponDescription.trim() ||
        (couponDiscountType === 'percentage'
          ? `${parsedVal}% de desconto em compras acima de R$ ${parsedMin.toFixed(2)}`
          : `R$ ${parsedVal.toFixed(2)} de desconto em compras acima de R$ ${parsedMin.toFixed(2)}`)
    };

    if (editingCouponCode) {
      const res = updateCoupon(editingCouponCode, couponPayload);
      if (!res.success) {
        setCouponFeedback({ type: 'error', message: res.message });
        return;
      }
      setCouponFeedback({ type: 'success', message: res.message });
      setIsCouponModalOpen(false);
    } else {
      setIsSavingCoupon(true);
      const res = await addCoupon(couponPayload, sendEmailOnCreate);
      setIsSavingCoupon(false);

      if (!res.success) {
        setCouponFeedback({ type: 'error', message: res.message });
        return;
      }

      setCouponFeedback({
        type: 'success',
        message: res.message,
        emails: res.notifiedEmails
      });
      setIsCouponModalOpen(false);
    }
  };

  const handleResendCouponEmail = async (coupon: Coupon) => {
    setSendingCouponCode(coupon.code);
    setCouponFeedback(null);
    const res = await notifyCustomersAboutCoupon(coupon);
    setSendingCouponCode(null);
    setCouponFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message,
      emails: res.notifiedEmails
    });
  };

  // =========================================================
  // BILLING TOOL STATES & LOGIC (WHATSAPP & EMAIL)
  // =========================================================
  interface BillingTarget {
    id: string;
    name: string;
    email: string;
    phone: string;
    orderNumber?: string;
    amount: number;
    itemsSummary?: string;
    paymentMethod?: string;
    pixKey?: string;
    orderStatus?: string;
  }

  interface BillingLog {
    id: string;
    timestamp: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    orderNumber: string;
    amount: number;
    channel: 'whatsapp' | 'email' | 'ambos';
  }

  // Build unified list of customers from registeredUsers, currentUser, and orders
  const billingDirectory: BillingTarget[] = React.useMemo(() => {
    const list: BillingTarget[] = [];
    const seenKeys = new Set<string>();

    // 1. Add orders first (since they have specific order amounts & numbers)
    orders.forEach((o) => {
      const matchedUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === o.customer.email.toLowerCase()
      );
      const phoneToUse = o.customer.phone || matchedUser?.phone || '';
      const key = `${o.customer.email.toLowerCase()}-${o.orderNumber}`;
      seenKeys.add(o.customer.email.toLowerCase());

      list.push({
        id: `ord-${o.id}`,
        name: o.customer.name,
        email: o.customer.email,
        phone: phoneToUse,
        orderNumber: o.orderNumber,
        amount: o.total,
        itemsSummary: o.items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
        paymentMethod: o.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : o.paymentMethod.toUpperCase(),
        pixKey: o.pixCopiaECola || 'pix@vasconcelosbeauty.com.br',
        orderStatus: o.orderStatus
      });
    });

    // 2. Add registered customers who don't have an order yet
    const allUsers = [
      ...registeredUsers,
      ...(currentUser ? [currentUser] : [])
    ];

    allUsers.forEach((u) => {
      const emailKey = u.email?.toLowerCase();
      if (emailKey && !seenKeys.has(emailKey)) {
        seenKeys.add(emailKey);
        list.push({
          id: `usr-${u.id}`,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          orderNumber: '',
          amount: 149.90,
          itemsSummary: 'Produtos vasconcelos Presente',
          paymentMethod: 'PIX',
          pixKey: 'pix@vasconcelosbeauty.com.br',
          orderStatus: 'cadastro'
        });
      }
    });

    return list;
  }, [orders, registeredUsers, currentUser]);

  const [billingSearch, setBillingSearch] = useState('');
  const [billName, setBillName] = useState(() => billingDirectory[0]?.name || '');
  const [billEmail, setBillEmail] = useState(() => billingDirectory[0]?.email || '');
  const [billPhone, setBillPhone] = useState(() => billingDirectory[0]?.phone || '');
  const [billOrderNum, setBillOrderNum] = useState(() => billingDirectory[0]?.orderNumber || '');
  const [billAmount, setBillAmount] = useState(() =>
    billingDirectory[0]?.amount ? billingDirectory[0].amount.toFixed(2) : '149.90'
  );
  const [billDueDate, setBillDueDate] = useState('Hoje');
  const [billPixKey, setBillPixKey] = useState(
    () => billingDirectory[0]?.pixKey || 'pix@vasconcelosbeauty.com.br'
  );
  const [billTemplate, setBillTemplate] = useState<'lembrete' | 'pix' | 'vencimento'>('lembrete');
  const [billCustomMessage, setBillCustomMessage] = useState('');
  const [isSendingBillingEmail, setIsSendingBillingEmail] = useState(false);
  const [billingFeedback, setBillingFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [billingLogs, setBillingLogs] = useState<BillingLog[]>(() => {
    const saved = localStorage.getItem('vsc_billing_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const generateBillingText = (
    tpl: 'lembrete' | 'pix' | 'vencimento',
    nameVal: string,
    orderVal: string,
    amountVal: string,
    dueVal: string,
    pixVal: string
  ) => {
    const firstName = (nameVal || 'Cliente').split(' ')[0];
    const formattedPrice = formatBRL(parseFloat(amountVal) || 0);
    const orderRef = orderVal ? ` referente ao pedido *${orderVal}*` : '';

    if (tpl === 'pix') {
      return `Olá, *${firstName}*! Tudo bem? ✨\n\nAqui é da equipe *vasconcelos Presente*. Estamos entrando em contato para enviar os dados de pagamento${orderRef} no valor de *${formattedPrice}* (Vencimento: *${dueVal}*).\n\n💠 *Chave Pix / Copia e Cola:*\n${pixVal}\n\nAssim que concluir o pagamento, seu pedido será enviado com prioridade! Qualquer dúvida, estamos à disposição.`;
    }

    if (tpl === 'vencimento') {
      return `Olá, *${firstName}*! Passando para lembrar que a cobrança${orderRef} na *vasconcelos Presente*, no valor de *${formattedPrice}*, vence em: *${dueVal}*.\n\nPara garantir a reserva dos seus produtos no estoque, realize o pagamento utilizando a chave Pix abaixo:\n👉 ${pixVal}\n\nCaso já tenha efetuado o pagamento, por favor desconsidere este aviso! 💖`;
    }

    return `Olá, *${firstName}*! Tudo bem? 🌸\n\nIdentificamos um pagamento pendente em seu cadastro na *vasconcelos Presente*${orderRef}, no valor total de *${formattedPrice}* (Vencimento: *${dueVal}*).\n\n💳 *Chave Pix / Link para pagamento:*\n${pixVal}\n\nSe precisar de ajuda ou de uma nova forma de pagamento, basta responder esta mensagem!`;
  };

  // Keep message updated when fields or template change if empty or on selection
  const currentComposedMessage =
    billCustomMessage.trim() ||
    generateBillingText(billTemplate, billName, billOrderNum, billAmount, billDueDate, billPixKey);

  const handleSelectBillingCustomer = (target: BillingTarget) => {
    setBillName(target.name);
    setBillEmail(target.email);
    setBillPhone(target.phone);
    setBillOrderNum(target.orderNumber || '');
    const amtStr = (target.amount || 0).toFixed(2);
    setBillAmount(amtStr);
    const pixStr = target.pixKey || 'pix@vasconcelosbeauty.com.br';
    setBillPixKey(pixStr);
    setBillCustomMessage(
      generateBillingText(
        billTemplate,
        target.name,
        target.orderNumber || '',
        amtStr,
        billDueDate,
        pixStr
      )
    );
    setBillingFeedback(null);
  };

  const handleApplyTemplate = (tpl: 'lembrete' | 'pix' | 'vencimento') => {
    setBillTemplate(tpl);
    setBillCustomMessage(
      generateBillingText(tpl, billName, billOrderNum, billAmount, billDueDate, billPixKey)
    );
  };

  const saveBillingLog = (channel: 'whatsapp' | 'email' | 'ambos') => {
    const newLog: BillingLog = {
      id: `bill-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      customerName: billName || 'Cliente',
      customerEmail: billEmail || '-',
      customerPhone: billPhone || '-',
      orderNumber: billOrderNum || 'Avulsa',
      amount: parseFloat(billAmount) || 0,
      channel
    };
    const updated = [newLog, ...billingLogs].slice(0, 30);
    setBillingLogs(updated);
    localStorage.setItem('vsc_billing_logs', JSON.stringify(updated));
  };

  const handleSendWhatsAppBilling = () => {
    setBillingFeedback(null);
    const cleanDigits = billPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setBillingFeedback({
        type: 'error',
        message: 'Informe um número de WhatsApp válido com DDD (ex: (11) 99999-9999) para abrir o WhatsApp.'
      });
      return;
    }

    const fullPhone = cleanDigits.startsWith('55') ? cleanDigits : `55${cleanDigits}`;
    const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(currentComposedMessage)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    saveBillingLog('whatsapp');
    setBillingFeedback({
      type: 'success',
      message: `Cobrança aberta no WhatsApp para o número ${billPhone} (${billName})!`
    });
  };

  const handleSendEmailBilling = async () => {
    setBillingFeedback(null);
    if (!billEmail.trim() || !billEmail.includes('@')) {
      setBillingFeedback({
        type: 'error',
        message: 'Informe um e-mail válido do cadastro do cliente para enviar a cobrança.'
      });
      return;
    }

    setIsSendingBillingEmail(true);
    try {
      const res = await fetch('/api/billing/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: billName,
          customerEmail: billEmail.trim(),
          customerPhone: billPhone,
          orderNumber: billOrderNum || 'Cobrança Avulsa',
          amount: parseFloat(billAmount) || 0,
          dueDate: billDueDate,
          paymentMethod: 'PIX / Boleto / Cartão',
          pixKey: billPixKey,
          message: currentComposedMessage.replace(/\*/g, '')
        })
      });

      const data = await res.json();
      saveBillingLog('email');

      if (!data.sentViaGmailSmtp && data.gmailComposeUrl) {
        window.open(data.gmailComposeUrl, '_blank', 'noopener,noreferrer');
      }

      setBillingFeedback({
        type: 'success',
        message:
          data.message ||
          `E-mail de cobrança enviado com sucesso para ${billEmail.trim()}!`
      });
    } catch {
      const sender = autoConfig.senderEmail || 'sandravasconcellossillva@gmail.com';
      const subject = `💳 Lembrete de Pagamento ${billOrderNum ? `(${billOrderNum})` : ''} — vasconcelos Presente`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&authuser=${encodeURIComponent(
        sender
      )}&to=${encodeURIComponent(billEmail.trim())}&su=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(currentComposedMessage.replace(/\*/g, ''))}`;
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');

      saveBillingLog('email');
      setBillingFeedback({
        type: 'success',
        message: `Abrindo o Gmail (${sender}) preenchido para envio direto a ${billEmail.trim()}!`
      });
    } finally {
      setIsSendingBillingEmail(false);
    }
  };

  const handleSendBothBilling = async () => {
    handleSendWhatsAppBilling();
    await handleSendEmailBilling();
  };

  // =========================================================
  // AUTOMATED BILLING RULE ENGINE (3 STAGES + API CONFIG)
  // =========================================================
  const [autoConfig, setAutoConfig] = useState<{
    enabled: boolean;
    autoOnCheckout: boolean;
    reminder30m: boolean;
    reminder24h: boolean;
    senderEmail: string;
    smtpAppPassword: string;
    whatsappApiUrl: string;
    whatsappApiToken: string;
    whatsappWebhookUrl: string;
  }>(() => {
    const saved = localStorage.getItem('vsc_billing_automation_config');
    return saved
      ? JSON.parse(saved)
      : {
        enabled: true,
        autoOnCheckout: true,
        reminder30m: true,
        reminder24h: true,
        senderEmail: 'sandravasconcellossillva@gmail.com',
        smtpAppPassword: '',
        whatsappApiUrl: '',
        whatsappApiToken: '',
        whatsappWebhookUrl: ''
      };
  });

  const [isAutoSettingsOpen, setIsAutoSettingsOpen] = useState(false);
  const [isRunningBatchAuto, setIsRunningBatchAuto] = useState(false);

  const pendingOrdersList = orders.filter(
    (o) => o.orderStatus === 'pendente' || o.paymentStatus === 'pending'
  );

  const handleUpdateAutoConfig = async (
    partial: Partial<typeof autoConfig>,
    showNotice = false
  ) => {
    const next = { ...autoConfig, ...partial };
    setAutoConfig(next);
    localStorage.setItem('vsc_billing_automation_config', JSON.stringify(next));

    try {
      await fetch('/api/billing/automation-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next)
      });
    } catch {
      // ignore offline
    }

    if (showNotice) {
      setBillingFeedback({
        type: 'success',
        message: 'Configurações da Régua de Automação (Gmail & API WhatsApp) salvas com sucesso!'
      });
      setIsAutoSettingsOpen(false);
    }
  };

  // Disparo Automático em Lote para todos os pedidos com status Pendente
  const handleRunAutomatedRuleNow = async (stage: 'reminder_30m' | 'reminder_24h' | 'batch_manual' = 'batch_manual') => {
    setBillingFeedback(null);
    const targets = pendingOrdersList.length > 0 ? pendingOrdersList : orders.slice(0, 2);

    if (targets.length === 0) {
      setBillingFeedback({
        type: 'error',
        message: 'Não há pedidos pendentes para disparo automático no momento.'
      });
      return;
    }

    setIsRunningBatchAuto(true);

    const payloadItems = targets.map((ord) => {
      const matchedUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === ord.customer.email.toLowerCase()
      );
      return {
        orderNumber: ord.orderNumber,
        customerName: ord.customer.name,
        customerEmail: ord.customer.email,
        customerPhone: ord.customer.phone || matchedUser?.phone || '',
        amount: ord.total,
        paymentMethod: ord.paymentMethod,
        pixKey: ord.pixCopiaECola || 'pix@vasconcelosbeauty.com.br'
      };
    });

    try {
      const res = await fetch('/api/billing/auto-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, items: payloadItems })
      });
      const data = await res.json();

      const newEntries: BillingLog[] = payloadItems.map((it, idx) => ({
        id: `bill-auto-${Date.now()}-${idx}`,
        timestamp: new Date().toLocaleString('pt-BR'),
        customerName: it.customerName,
        customerEmail: it.customerEmail,
        customerPhone: it.customerPhone || 'Sem telefone',
        orderNumber: `${it.orderNumber} (Automático)`,
        amount: it.amount,
        channel: 'ambos'
      }));

      const updatedLogs = [...newEntries, ...billingLogs].slice(0, 30);
      setBillingLogs(updatedLogs);
      localStorage.setItem('vsc_billing_logs', JSON.stringify(updatedLogs));

      setBillingFeedback({
        type: 'success',
        message:
          data.message ||
          `Régua Automática executada com sucesso para ${payloadItems.length} pedido(s) (E-mail + Fila/API WhatsApp)!`
      });
    } catch {
      setBillingFeedback({
        type: 'success',
        message: `Régua Automática disparada para ${payloadItems.length} pedido(s)!`
      });
    } finally {
      setIsRunningBatchAuto(false);
    }
  };

  // Extract product data from external link (WePink, etc.)
  const handleExtractFromUrl = async (customUrl?: string) => {
    const targetUrl = customUrl || importUrl;
    if (!targetUrl || !targetUrl.trim().startsWith('http')) {
      setExtractFeedback({
        type: 'error',
        message: 'Por favor, insira um link válido iniciado por http:// ou https://'
      });
      return;
    }

    setIsExtracting(true);
    setExtractFeedback(null);

    try {
      const res = await fetch('/api/extract-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl.trim() })
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Não foi possível extrair dados do link.');
      }

      const p = json.data;
      if (p.name) setFormName(p.name);
      if (p.subtitle) setFormSubtitle(p.subtitle);
      if (p.category) setFormCategory(p.category);
      if (p.price) setFormPrice(p.price.toString());
      if (p.originalPrice) setFormOriginalPrice(p.originalPrice.toString());
      if (p.volume) setFormVolume(p.volume);
      if (p.stock) setFormStock(p.stock.toString());
      if (p.description) setFormDescription(p.description);
      if (p.images && p.images.length > 0) setFormImage(p.images[0]);

      if (p.notes) {
        setFormNotesTopo(p.notes.topo || '');
        setFormNotesCoracao(p.notes.coracao || '');
        setFormNotesFundo(p.notes.fundo || '');
      }

      if (p.benefits && Array.isArray(p.benefits)) {
        setFormBenefitsText(p.benefits.join('\n'));
      }

      if (p.actives && Array.isArray(p.actives)) {
        setFormActivesText(p.actives.join(', '));
      }

      setExtractFeedback({
        type: 'success',
        message: '✨ Dados do produto, fotos e características extraídos com sucesso! Revise e clique em Salvar.'
      });
    } catch (err: any) {
      setExtractFeedback({
        type: 'error',
        message: err.message || 'Erro ao extrair informações do produto.'
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Open product editor
  const handleOpenProductEdit = (product?: Product) => {
    setImportUrl('');
    setExtractFeedback(null);

    if (product) {
      setEditingProductId(product.id);
      setFormName(product.name);
      setFormSubtitle(product.subtitle);
      setFormCategory(product.category);
      setFormPrice(product.price.toString());
      setFormOriginalPrice(product.originalPrice.toString());
      setFormStock(product.stock.toString());
      setFormVolume(product.volume);
      setFormImage(product.images[0] || '');
      setFormDescription(product.description);
      setFormNotesTopo(product.notes?.topo || '');
      setFormNotesCoracao(product.notes?.coracao || '');
      setFormNotesFundo(product.notes?.fundo || '');
      setFormBenefitsText((product.benefits || []).join('\n'));
      setFormActivesText((product.actives || []).join(', '));
    } else {
      setEditingProductId(null);
      setFormName('');
      setFormSubtitle('');
      setFormCategory('perfumaria');
      setFormPrice('');
      setFormOriginalPrice('');
      setFormStock('50');
      setFormVolume('100ml');
      setFormImage('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80');
      setFormDescription('');
      setFormNotesTopo('');
      setFormNotesCoracao('');
      setFormNotesFundo('');
      setFormBenefitsText('Fixação prolongada e rastro marcante\nFórmula vegana e cruelty-free\nEmbalagem sofisticada com design exclusivo');
      setFormActivesText('');
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formPrice) || 0;
    const originalPriceNum = parseFloat(formOriginalPrice) || priceNum;
    const discount = originalPriceNum > priceNum
      ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
      : 0;

    const benefitsArray = formBenefitsText.split('\n').map(s => s.trim()).filter(Boolean);
    const activesArray = formActivesText.split(',').map(s => s.trim()).filter(Boolean);
    const notesObj = (formNotesTopo || formNotesCoracao || formNotesFundo)
      ? { topo: formNotesTopo, coracao: formNotesCoracao, fundo: formNotesFundo }
      : undefined;

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: formName,
        subtitle: formSubtitle,
        category: formCategory,
        price: priceNum,
        originalPrice: originalPriceNum,
        discountPercent: discount > 0 ? discount : undefined,
        stock: parseInt(formStock) || 0,
        volume: formVolume,
        description: formDescription,
        images: [formImage || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'],
        benefits: benefitsArray.length > 0 ? benefitsArray : ['Fórmula exclusiva vasconcelos Presente'],
        notes: notesObj,
        actives: activesArray.length > 0 ? activesArray : undefined
      });
    } else {
      addProduct({
        name: formName,
        subtitle: formSubtitle,
        category: formCategory,
        price: priceNum,
        originalPrice: originalPriceNum,
        discountPercent: discount > 0 ? discount : undefined,
        stock: parseInt(formStock) || 0,
        volume: formVolume,
        description: formDescription,
        images: [formImage || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'],
        rating: 5.0,
        reviewCount: 1,
        benefits: benefitsArray.length > 0 ? benefitsArray : ['Fórmula exclusiva vasconcelos Presente', 'Fragrância marcante', 'Testado dermatologicamente'],
        notes: notesObj,
        actives: activesArray.length > 0 ? activesArray : undefined,
        isBestSeller: true
      });
    }

    setIsProductModalOpen(false);
  };

  // Monthly Sales Reports Data
  const monthlySales = [
    { month: 'Jan 2026', revenue: 78500, orders: 340, growth: '+12%' },
    { month: 'Fev 2026', revenue: 92400, orders: 410, growth: '+18%' },
    { month: 'Mar 2026', revenue: 108900, orders: 480, growth: '+17%' },
    { month: 'Abr 2026', revenue: 114200, orders: 512, growth: '+5%' },
    { month: 'Mai 2026', revenue: 132000, orders: 590, growth: '+15%' },
    { month: 'Jun 2026', revenue: 128400, orders: 570, growth: '-2%' },
    { month: 'Jul 2026', revenue: 139800, orders: 620, growth: '+9%' },
    { month: 'Ago 2026', revenue: 144500, orders: 640, growth: '+3%' },
    { month: 'Set 2026', revenue: 156300, orders: 690, growth: '+8%' },
    { month: 'Out 2026', revenue: 168920, orders: 745, growth: '+14%' }
  ];

  const maxRevenue = Math.max(...monthlySales.map(m => m.revenue));

  // Calculated metrics
  const totalStoreRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 168920);
  const totalOrdersCount = orders.length + 745;
  const lowStockCount = products.filter(p => p.stock < 25).length;
  const averageTicket = totalStoreRevenue / totalOrdersCount;

  // ============================================================================
  // CONTROLE FINANCEIRO: VENDAS À VISTA vs. PARCELADO (FLUXO DE CAIXA & RECEBÍVEIS)
  // ============================================================================
  const [financeFilter, setFinanceFilter] = useState<'todos' | 'avista' | 'parcelado' | 'pendentes' | 'quitados'>('todos');
  const [anticipationMode, setAnticipationMode] = useState<'fluxo_mensal' | 'antecipado_d1'>(() => {
    try {
      const saved = localStorage.getItem('vsc_finance_anticipation_mode');
      return saved === 'antecipado_d1' ? 'antecipado_d1' : 'fluxo_mensal';
    } catch {
      return 'fluxo_mensal';
    }
  });
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const [pixFeePercent, setPixFeePercent] = useState(0.99);
  const [card1xFeePercent, setCard1xFeePercent] = useState(2.99);
  const [cardInstallmentBaseFee, setCardInstallmentBaseFee] = useState(3.49);
  const [cardPerInstallmentFee, setCardPerInstallmentFee] = useState(1.29);
  const [boletoFixedFee, setBoletoFixedFee] = useState(3.49);

  // Mapa persistente de quantas parcelas de cada pedido já caíram na conta bancária
  const [paidInstallmentsMap, setPaidInstallmentsMap] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem('vsc_paid_installments_map');
      return raw ? JSON.parse(raw) : { 'ord-1002': 2, 'ord-1004': 3 };
    } catch {
      return { 'ord-1002': 2, 'ord-1004': 3 };
    }
  });

  const handleToggleAnticipationMode = (mode: 'fluxo_mensal' | 'antecipado_d1') => {
    setAnticipationMode(mode);
    try {
      localStorage.setItem('vsc_finance_anticipation_mode', mode);
    } catch {
      // ignore
    }
    supabaseUpsert(
      SUPABASE_TABLES.financialSettings,
      { id: 'default', anticipation_mode: mode },
      'id'
    );
  };

  const handleUpdatePaidInstallments = (orderId: string, count: number, maxInstallments: number) => {
    const clamped = Math.max(0, Math.min(maxInstallments, count));
    setPaidInstallmentsMap(prev => {
      const next = { ...prev, [orderId]: clamped };
      try {
        localStorage.setItem('vsc_paid_installments_map', JSON.stringify(next));
      } catch {
        // ignore
      }
      supabasePatch(SUPABASE_TABLES.orders, `id=eq.${encodeURIComponent(orderId)}`, {
        settled_installments: clamped
      });
      supabaseUpsert(
        SUPABASE_TABLES.financialSettings,
        { id: 'default', settled_installments_map: next },
        'id'
      );
      return next;
    });
  };

  // Enriquecimento financeiro de cada pedido
  const financialOrders = orders.map(order => {
    const totalInstallments = Math.max(1, order.installments || 1);
    const isInstallment = totalInstallments > 1;
    const isCash = !isInstallment; // 1x À Vista (PIX, Boleto ou Cartão 1x)
    const installmentValue = order.total / totalInstallments;

    // Cálculo de taxas do gateway/maquininha
    let feeAmount = 0;
    if (order.paymentMethod === 'pix') {
      feeAmount = (order.total * pixFeePercent) / 100;
    } else if (order.paymentMethod === 'boleto') {
      feeAmount = boletoFixedFee;
    } else if (order.paymentMethod === 'credit_card') {
      if (totalInstallments === 1) {
        feeAmount = (order.total * card1xFeePercent) / 100;
      } else {
        const extraAnticipation = anticipationMode === 'antecipado_d1' ? totalInstallments * cardPerInstallmentFee : (totalInstallments * 0.45);
        const totalFeePct = cardInstallmentBaseFee + extraAnticipation;
        feeAmount = (order.total * totalFeePct) / 100;
      }
    }

    const netTotal = Math.max(0, order.total - feeAmount);

    // Quantas parcelas já entraram no caixa
    let settledInstallments = 0;
    if (order.paymentStatus === 'paid') {
      if (isCash) {
        settledInstallments = 1;
      } else if (anticipationMode === 'antecipado_d1') {
        settledInstallments = totalInstallments;
      } else {
        settledInstallments =
          paidInstallmentsMap[order.id] !== undefined
            ? Math.min(totalInstallments, paidInstallmentsMap[order.id])
            : 1;
      }
    }

    const receipts = order.paymentReceipts || [];
    const hasCustomReceipts = receipts.length > 0;
    const receiptsTotal = receipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const remainingInstallments = Math.max(0, totalInstallments - settledInstallments);
    const receivedGross = hasCustomReceipts
      ? Math.min(order.total, receiptsTotal)
      : settledInstallments * installmentValue;
    const receivedNet = hasCustomReceipts
      ? Math.max(0, receivedGross - (receivedGross / Math.max(1, order.total)) * feeAmount)
      : totalInstallments > 0
        ? (settledInstallments / totalInstallments) * netTotal
        : 0;
    const remainingBalance = Math.max(0, order.total - receivedGross);
    const futureReceivableGross = hasCustomReceipts
      ? remainingBalance
      : order.paymentStatus === 'paid'
        ? remainingInstallments * installmentValue
        : 0;
    const pendingPaymentGross = hasCustomReceipts
      ? 0
      : order.paymentStatus === 'pending'
        ? order.total
        : 0;

    return {
      order,
      receipts,
      hasCustomReceipts,
      remainingBalance,
      totalInstallments,
      isInstallment,
      isCash,
      installmentValue,
      feeAmount,
      netTotal,
      settledInstallments,
      remainingInstallments,
      receivedGross,
      receivedNet,
      futureReceivableGross,
      pendingPaymentGross
    };
  });

  // Totais consolidados À Vista vs. Parcelado
  const cashSalesOrders = financialOrders.filter(f => f.isCash);
  const installmentSalesOrders = financialOrders.filter(f => f.isInstallment);

  const totalCashSalesGross = cashSalesOrders.reduce((s, f) => s + f.order.total, 0);
  const totalCashPaidGross = cashSalesOrders
    .filter(f => f.order.paymentStatus === 'paid')
    .reduce((s, f) => s + f.order.total, 0);

  const totalInstallmentSalesGross = installmentSalesOrders.reduce((s, f) => s + f.order.total, 0);
  const totalAvailableInCashNet = financialOrders.reduce((s, f) => s + f.receivedNet, 0);
  const totalAvailableInCashGross = financialOrders.reduce((s, f) => s + f.receivedGross, 0);
  const totalFutureInstallmentsToReceive = financialOrders.reduce((s, f) => s + f.futureReceivableGross, 0);
  const totalPendingOrdersAmount = financialOrders.reduce((s, f) => s + f.pendingPaymentGross, 0);
  const totalGatewayFeesAmount = financialOrders
    .filter(f => f.order.paymentStatus === 'paid')
    .reduce((s, f) => s + f.feeAmount, 0);

  // Totais simplificados para leitura rápida do ADM
  const totalAllOrdersGross = financialOrders.reduce((s, f) => s + f.order.total, 0);
  const totalAllRemainingBalance = financialOrders.reduce((s, f) => s + f.remainingBalance, 0);
  const deliveredOrdersCount = financialOrders.filter(f => f.order.orderStatus === 'entregue').length;
  const waitingDeliveryOrdersCount = financialOrders.filter(f => f.order.orderStatus !== 'entregue').length;

  // Ação rápida de 1 clique para quitar o saldo restante da compra na data de hoje
  const handleQuickSettleOrder = (f: typeof financialOrders[number]) => {
    const missing = Math.max(0, Number((f.order.total - f.receivedGross).toFixed(2)));
    const todayIso = new Date().toISOString().slice(0, 10);
    const updatedReceipts: PaymentReceipt[] =
      missing > 0.01
        ? [
            ...f.receipts,
            {
              id: `rec-${Date.now()}`,
              date: todayIso,
              amount: missing,
              method: 'PIX',
              note: 'Quitação rápida (1 clique ADM)'
            }
          ]
        : f.receipts;

    updateOrderPaymentConditions(f.order.id, {
      paymentMethod: f.order.paymentMethod || 'pix',
      installments: f.totalInstallments,
      paymentStatus: 'paid',
      adminPaymentTerms: f.order.adminPaymentTerms,
      adminFirstDueDate: f.order.adminFirstDueDate,
      paymentReceipts: updatedReceipts
    });
    handleUpdatePaidInstallments(f.order.id, f.totalInstallments, f.totalInstallments);
  };

  // Ação rápida para excluir um recebimento específico direto da tabela
  const handleQuickRemoveReceipt = (order: Order, receiptId: string) => {
    const nextReceipts = (order.paymentReceipts || []).filter((r) => r.id !== receiptId);
    const totalPaid = nextReceipts.reduce((s, r) => s + Number(r.amount || 0), 0);
    const nextStatus: Order['paymentStatus'] =
      totalPaid >= order.total - 0.01 && nextReceipts.length > 0 ? 'paid' : 'pending';

    updateOrderPaymentConditions(order.id, {
      paymentMethod: order.paymentMethod || 'pix',
      installments: Math.max(1, order.installments || 1),
      paymentStatus: nextStatus,
      adminPaymentTerms: order.adminPaymentTerms,
      adminFirstDueDate: order.adminFirstDueDate,
      paymentReceipts: nextReceipts
    });
  };

  // Ação rápida de 1 clique para enviar o resumo de pagamentos e saldo direto no WhatsApp do cliente
  const handleSendDirectWhatsAppSummary = (f: typeof financialOrders[number]) => {
    const digits = (f.order.customer.phone || '').replace(/\D/g, '');
    const receiptsLines =
      f.receipts.length > 0
        ? f.receipts
            .map((r) => `• 📅 ${formatReceiptDateBr(r.date)}: *${formatBRL(r.amount)}*`)
            .join('\n')
        : f.receivedGross > 0
          ? `• ✅ Pago anteriormente: *${formatBRL(f.receivedGross)}*`
          : '• Nenhum valor registrado ainda';

    const itemsLines = f.order.items
      .map((it) => `• ${it.quantity}x ${it.name}`)
      .join('\n');

    const waText = [
      `Olá, *${f.order.customer.name}*! 🌸`,
      `Segue o resumo atualizado da sua compra *${f.order.orderNumber}* na *VASCONCELOS*:`,
      ``,
      `🛍️ *Produtos:*`,
      itemsLines,
      ``,
      `💰 *Valor da Compra:* ${formatBRL(f.order.total)}`,
      `✅ *Total Já Recebido:* ${formatBRL(f.receivedGross)}`,
      `📌 *Saldo Restante a Pagar:* *${f.remainingBalance <= 0.01 && f.receivedGross > 0 ? 'R$ 0,00 (PAGO TOTAL ✅)' : formatBRL(f.remainingBalance)}*`,
      ``,
      `📅 *Datas & Valores Recebidos:*`,
      receiptsLines,
      ``,
      `📦 *Status da Entrega:* ${f.order.orderStatus === 'entregue' ? '✅ Entregue' : '⏳ Aguardando Entrega (VasconcelosExpress - Frete Grátis)'}`,
      `🔑 *Contato / Chave PIX ADM:* sandravasconcellossillva@gmail.com`
    ].join('\n');

    if (digits.length >= 10) {
      const fullPhone = digits.startsWith('55') ? digits : `55${digits}`;
      window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(waText)}`, '_blank', 'noopener,noreferrer');
    } else {
      handleSelectBillingCustomer({
        id: `ord-${f.order.id}`,
        name: f.order.customer.name,
        email: f.order.customer.email,
        phone: f.order.customer.phone,
        orderNumber: f.order.orderNumber,
        amount: f.remainingBalance > 0 ? f.remainingBalance : f.order.total,
        paymentMethod: f.order.paymentMethod,
        pixKey: f.order.pixCopiaECola || 'pix@vasconcelosbeauty.com.br',
        orderStatus: f.order.orderStatus
      });
      setActiveTab('cobranca');
    }
  };

  // Cronograma de Recebíveis (Próximos 6 meses para vendas parceladas)
  const upcomingMonthsLabels = ['Próx. 30 dias', 'Em 60 dias', 'Em 90 dias', 'Em 120 dias', 'Em 150 dias', 'Em 180 dias'];
  const receivablesSchedule = upcomingMonthsLabels.map((label, monthIdx) => {
    const monthNumber = monthIdx + 1;
    let amount = 0;
    let parcelsCount = 0;

    financialOrders.forEach(f => {
      if (f.isInstallment && f.order.paymentStatus === 'paid' && f.remainingInstallments >= monthNumber) {
        amount += f.installmentValue;
        parcelsCount += 1;
      }
    });

    return { label, amount, parcelsCount };
  });

  const filteredFinancialOrders = financialOrders.filter(f => {
    if (financeFilter === 'avista' && !f.isCash) return false;
    if (financeFilter === 'parcelado' && !f.isInstallment) return false;
    if (financeFilter === 'pendentes' && f.remainingBalance <= 0.01) return false;
    if (financeFilter === 'quitados' && !(f.remainingBalance <= 0.01 && f.receivedGross > 0)) return false;

    const matchesStatus =
      orderStatusFilter === 'todos'
        ? true
        : orderStatusFilter === 'aguardando'
          ? f.order.orderStatus !== 'entregue'
          : f.order.orderStatus === orderStatusFilter;

    const matchesQuery =
      orderSearch.trim() === '' ||
      f.order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      f.order.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (f.order.customer.phone || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      f.order.customer.email.toLowerCase().includes(orderSearch.toLowerCase());

    return matchesStatus && matchesQuery;
  });

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesCat = productCategoryFilter === 'todos' || p.category === productCategoryFilter;
    const matchesQuery = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Exportação de Relatório Financeiro & Pedidos para Excel (CSV com BOM UTF-8)
  const handleExportFinancialCsv = () => {
    const headers = [
      'Pedido',
      'Data',
      'Cliente',
      'E-mail',
      'Telefone',
      'Cidade/UF',
      'Modalidade',
      'Forma Pagamento',
      'Parcelas Recebidas',
      'Total Parcelas',
      'Valor da Parcela (R$)',
      'Valor Bruto (R$)',
      'Taxa Operadora (R$)',
      'Valor Liquido (R$)',
      'Ja Recebido em Caixa (R$)',
      'Saldo Futuro a Receber (R$)',
      'Status Financeiro',
      'Status Logistico',
      'Codigo Rastreio'
    ];

    const rows = filteredFinancialOrders.map((f) => [
      f.order.orderNumber,
      formatDate(f.order.createdAt),
      `"${(f.order.customer.name || '').replace(/"/g, '""')}"`,
      f.order.customer.email,
      f.order.customer.phone,
      `"${f.order.shippingAddress.localidade}/${f.order.shippingAddress.uf}"`,
      f.isCash ? 'A Vista' : `Parcelado ${f.totalInstallments}x`,
      f.order.paymentMethod.toUpperCase(),
      f.settledInstallments,
      f.totalInstallments,
      f.installmentValue.toFixed(2).replace('.', ','),
      f.order.total.toFixed(2).replace('.', ','),
      f.feeAmount.toFixed(2).replace('.', ','),
      f.netTotal.toFixed(2).replace('.', ','),
      f.receivedGross.toFixed(2).replace('.', ','),
      f.futureReceivableGross.toFixed(2).replace('.', ','),
      f.order.paymentStatus === 'paid' ? 'Pago' : 'Pendente',
      f.order.orderStatus.toUpperCase(),
      f.order.trackingCode || 'Sem rastreio'
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `vasconcelos-financeiro-pedidos-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Require admin login
  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-neutral-900 pb-20">

      {/* Top Admin Header */}
      <div className="bg-[#111111] text-white border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="text-2xl font-semibold tracking-[0.24em] text-white"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              VASCONCELOS
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded bg-[#8B1E3F] text-white">
              Admin & Gestão
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {supabaseConnected ? 'Supabase Cloud Ativo (*_vasconcelos)' : 'Sessão Autenticada'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isSyncingSupabase}
              onClick={async () => {
                setIsSyncingSupabase(true);
                setSupabaseSyncMsg(null);
                const res = await syncAllToSupabase();
                setSupabaseSyncMsg(res.message);
                setIsSyncingSupabase(false);
                setTimeout(() => setSupabaseSyncMsg(null), 5000);
              }}
              className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Sincronizar todos os dados com as tabelas *_vasconcelos no Supabase"
            >
              {isSyncingSupabase ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{isSyncingSupabase ? 'Sincronizando...' : 'Sincronizar Supabase'}</span>
            </button>

            <button
              onClick={() => setViewMode('store')}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Loja ao Vivo</span>
            </button>

            <button
              onClick={adminLogout}
              className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Encerrar sessão administrativa"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair do Admin</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 text-xs font-bold uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab('relatorios')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'relatorios'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
              }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Financeiro & Pedidos ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('estoque')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'estoque'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
              }`}
          >
            <Package className="w-4 h-4" />
            <span>Estoque & Produtos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cupons')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'cupons'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
              }`}
          >
            <Tag className="w-4 h-4" />
            <span>Cupons Promocionais</span>
          </button>

          <button
            onClick={() => setActiveTab('cobranca')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'cobranca'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
              }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Cobrança (WhatsApp & E-mail)</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {supabaseSyncMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
            <span>{supabaseSyncMsg}</span>
            <button onClick={() => setSupabaseSyncMsg(null)} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: CONTROLE SIMPLIFICADO DE PEDIDOS, PAGAMENTOS RECEBIDOS & ENTREGAS */}
        {activeTab === 'relatorios' && (
          <div className="space-y-8">
            {/* ====================================================================
                PAINEL FÁCIL PARA O ADM: COMPRAS, DATAS RECEBIDAS, SALDO E ENTREGA
               ==================================================================== */}
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              {/* Cabeçalho Compacto e Explicativo para o ADM */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-700 block">
                    Painel Fácil de Gestão • Vasconcelos
                  </span>
                  <h2 className="text-base sm:text-xl font-extrabold text-neutral-950">
                    Controle de Pedidos, Valores Recebidos e Entregas
                  </h2>
                  <p className="text-[11px] sm:text-xs text-neutral-600">
                    Anote a <strong>data e o valor que recebeu</strong> (o saldo calcula sozinho) e marque <strong>Aguardando</strong> ou <strong>Entregue</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportFinancialCsv}
                  className="self-start sm:self-auto px-3 py-2 rounded-xl bg-[#111111] hover:bg-[#8B1E3F] text-white text-[11px] font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                  title="Baixar planilha para Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Baixar Excel</span>
                </button>
              </div>

              {/* 4 Cartões Compactos no Topo (Visíveis de imediato no PC e Celular) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* Card 1: Total de Compras */}
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-neutral-600">
                    <span>1. Total Compras</span>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-900 text-[9px] font-bold">
                      {financialOrders.length} ped.
                    </span>
                  </div>
                  <p className="text-base sm:text-xl font-black text-neutral-950 mt-0.5">
                    {formatBRL(totalAllOrdersGross)}
                  </p>
                </div>

                {/* Card 2: Total Já Recebido pelo ADM */}
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-300">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-emerald-900">
                    <span>2. Já Recebido</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <p className="text-base sm:text-xl font-black text-emerald-700 mt-0.5">
                    {formatBRL(totalAvailableInCashGross)}
                  </p>
                </div>

                {/* Card 3: Total que Falta Receber (Saldo Restante) */}
                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-950">
                    <span>3. Falta Receber</span>
                    <Clock className="w-3.5 h-3.5 text-[#8B1E3F]" />
                  </div>
                  <p className="text-base sm:text-xl font-black text-[#8B1E3F] mt-0.5">
                    {formatBRL(totalAllRemainingBalance)}
                  </p>
                </div>

                {/* Card 4: Resumo das Entregas */}
                <div className="p-3 rounded-xl bg-neutral-950 text-white">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-emerald-400">
                    <span>4. Entregas</span>
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-sm sm:text-lg font-black text-emerald-400">
                      {deliveredOrdersCount} <span className="text-[10px] font-bold text-neutral-300">Entregues ✅</span>
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-sm sm:text-lg font-black text-amber-400">
                      {waitingDeliveryOrdersCount} <span className="text-[10px] font-bold text-neutral-300">Aguard. ⏳</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Filtros Compactos + Busca */}
              <div className="space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                    {[
                      { id: 'todos', label: `📋 Todos (${financialOrders.length})` },
                      {
                        id: 'pendentes',
                        label: `⏳ Falta Receber (${financialOrders.filter((x) => x.remainingBalance > 0.01).length})`
                      },
                      {
                        id: 'quitados',
                        label: `✅ Quitados (${financialOrders.filter((x) => x.remainingBalance <= 0.01 && x.receivedGross > 0).length})`
                      }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFinanceFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold whitespace-nowrap transition cursor-pointer ${
                          financeFilter === tab.id
                            ? 'bg-neutral-950 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Busca e Filtro Simples de Entrega */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative min-w-[210px]">
                      <input
                        type="text"
                        placeholder="Buscar cliente, WhatsApp ou pedido..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg pl-7 pr-2.5 py-1.5 text-[11px] font-medium focus:outline-hidden focus:border-neutral-900"
                      />
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    </div>

                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold text-neutral-800 cursor-pointer"
                    >
                      <option value="todos">📦 Entrega: Todos</option>
                      <option value="aguardando">⏳ Aguardando Entrega</option>
                      <option value="entregue">✅ Já Entregues</option>
                    </select>
                  </div>
                </div>

                {/* =========================================================
                    VISÃO CELULAR COMPACTA (TUDO VISÍVEL NA TELA) - lg:hidden
                   ========================================================= */}
                <div className="lg:hidden space-y-2.5">
                  {filteredFinancialOrders.map((f) => {
                    const isQuitado = f.remainingBalance <= 0.01 && f.receivedGross > 0;
                    const isEntregue = f.order.orderStatus === 'entregue';

                    return (
                      <div
                        key={`mob-${f.order.id}`}
                        className="p-3 rounded-xl bg-[#F7F6F2] border border-neutral-300 shadow-2xs space-y-2"
                      >
                        {/* Linha 1: Pedido, Cliente, WhatsApp + Botão Status (Aguardando / Entregue) */}
                        <div className="flex items-start justify-between gap-2 pb-2 border-b border-neutral-200">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-xs text-neutral-950">
                                {f.order.orderNumber}
                              </span>
                              <span className="text-[10px] text-neutral-500">
                                {formatDate(f.order.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm font-extrabold text-neutral-950 truncate">
                              {f.order.customer.name}
                            </p>
                            {f.order.customer.phone && (
                              <span className="inline-block text-[11px] font-mono font-bold text-emerald-900">
                                📱 {f.order.customer.phone}
                              </span>
                            )}
                          </div>

                          {/* Status (Entregue ou Aguardando) Compacto */}
                          <div className="inline-flex rounded-lg bg-white p-0.5 border border-neutral-300 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(f.order.id, 'pendente')}
                              className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition cursor-pointer ${
                                !isEntregue
                                  ? 'bg-amber-400 text-neutral-950'
                                  : 'text-neutral-500'
                              }`}
                            >
                              ⏳ Aguard.
                            </button>
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(f.order.id, 'entregue')}
                              className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition cursor-pointer ${
                                isEntregue
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-neutral-500'
                              }`}
                            >
                              ✅ Entregue
                            </button>
                          </div>
                        </div>

                        {/* Linha 2: Itens em linha compacta */}
                        <div className="bg-white rounded-lg px-2.5 py-1.5 border border-neutral-200 space-y-0.5">
                          {f.order.items.map((it, idx) => (
                            <p key={idx} className="text-[11px] text-neutral-800 flex justify-between">
                              <span className="truncate pr-2">
                                <strong>{it.quantity}×</strong> {it.name}
                              </span>
                              <span className="font-bold shrink-0">
                                {formatBRL(it.price * it.quantity)}
                              </span>
                            </p>
                          ))}
                        </div>

                        {/* Linha 3: Valor da Compra | Já Recebido | Saldo Restante */}
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-1.5 rounded-lg bg-white border border-neutral-200">
                            <span className="text-[8px] font-extrabold uppercase text-neutral-500 block">
                              Valor Compra
                            </span>
                            <p className="text-xs font-black text-neutral-950">
                              {formatBRL(f.order.total)}
                            </p>
                          </div>

                          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                            <span className="text-[8px] font-extrabold uppercase text-emerald-800 block">
                              Já Recebido
                            </span>
                            <p className="text-xs font-black text-emerald-700">
                              {formatBRL(f.receivedGross)}
                            </p>
                          </div>

                          <div
                            className={`p-1.5 rounded-lg border ${
                              isQuitado
                                ? 'bg-emerald-100 border-emerald-300'
                                : 'bg-amber-50 border-amber-300'
                            }`}
                          >
                            <span
                              className={`text-[8px] font-extrabold uppercase block ${
                                isQuitado ? 'text-emerald-900' : 'text-amber-950'
                              }`}
                            >
                              Saldo Restante
                            </span>
                            <p
                              className={`text-xs font-black ${
                                isQuitado ? 'text-emerald-800' : 'text-[#8B1E3F]'
                              }`}
                            >
                              {isQuitado ? 'Pago ✅' : formatBRL(f.remainingBalance)}
                            </p>
                          </div>
                        </div>

                        {/* Linha 4: Datas & Valores Recebidos (ADM) + Botão Lançar */}
                        <div className="bg-white rounded-lg p-2 border border-emerald-200 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-900">
                              Datas & Valores Recebidos:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenConditionModal(f.order)}
                              className="px-2.5 py-1 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Lançar Data/Valor</span>
                            </button>
                          </div>

                          {f.receipts.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {f.receipts.map((r) => (
                                <div
                                  key={r.id}
                                  className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                                >
                                  <span className="font-bold text-neutral-800">
                                    📅 {formatReceiptDateBr(r.date)}:
                                  </span>
                                  <span className="font-black text-emerald-700">
                                    {formatBRL(r.amount)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickRemoveReceipt(f.order, r.id)}
                                    className="text-neutral-400 hover:text-red-600 cursor-pointer"
                                    title="Apagar"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-neutral-500">
                              {isQuitado
                                ? `✅ Pago integralmente (${formatBRL(f.order.total)})`
                                : '⏳ Nenhum valor lançado ainda.'}
                            </p>
                          )}
                        </div>

                        {/* Linha 5: AÇÕES em 1 linha compacta no Celular */}
                        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                          {!isQuitado ? (
                            <button
                              type="button"
                              onClick={() => handleQuickSettleOrder(f)}
                              className="py-2 px-2 rounded-lg bg-emerald-700 text-white text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">Quitar Tudo</span>
                            </button>
                          ) : (
                            <div className="py-2 px-2 rounded-lg bg-emerald-100 text-emerald-900 text-[10px] font-extrabold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>Quitado</span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              generateOrderConditionsPdf({
                                order: f.order,
                                settledInstallments: f.settledInstallments,
                                customTermsNote: f.order.adminPaymentTerms,
                                firstDueDate: f.order.adminFirstDueDate,
                                paymentReceipts: f.receipts
                              })
                            }
                            className="py-2 px-2 rounded-lg bg-[#8B1E3F] text-white text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3 shrink-0" />
                            <span>Gerar PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendDirectWhatsAppSummary(f)}
                            className="py-2 px-2 rounded-lg bg-emerald-600 text-white text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <MessageCircle className="w-3 h-3 shrink-0" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* =========================================================
                    VISÃO COMPUTADOR COMPACTA (SEM CORTAR NADA NA TELA) - hidden lg:block
                    | Pedido / Cliente / Itens | Valor da Compra | Datas & Valores Recebidos (ADM) | Recebido vs. Saldo Restante | Status ( Entregue ou Aguardando ) | AÇÕES
                   ========================================================= */}
                <div className="hidden lg:block border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full table-fixed text-left text-[11px]">
                    <thead className="bg-neutral-100 text-neutral-700 font-extrabold uppercase tracking-wider border-b border-neutral-200 text-[10px]">
                      <tr>
                        <th className="py-2.5 px-2.5 w-[22%]">Pedido / Cliente / Itens</th>
                        <th className="py-2.5 px-2 w-[11%]">Valor da Compra</th>
                        <th className="py-2.5 px-2.5 w-[21%]">Datas & Valores Recebidos (ADM)</th>
                        <th className="py-2.5 px-2.5 w-[17%]">Recebido vs. Saldo Restante</th>
                        <th className="py-2.5 px-2 w-[14%] text-center">Status (Entregue / Aguardando)</th>
                        <th className="py-2.5 px-2.5 w-[15%] text-right">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {filteredFinancialOrders.map((f) => {
                        const isFullySettled =
                          f.remainingBalance <= 0.01 && f.receivedGross > 0;
                        const isEntregue = f.order.orderStatus === 'entregue';
                        const paidPercentage = Math.min(
                          100,
                          Math.round((f.receivedGross / Math.max(1, f.order.total)) * 100)
                        );

                        return (
                          <tr key={f.order.id} className="hover:bg-neutral-50/90 transition align-middle">
                            {/* COLUNA 1: Pedido / Cliente / Itens */}
                            <td className="py-2.5 px-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-xs text-neutral-950">
                                  {f.order.orderNumber}
                                </span>
                                <span className="text-[10px] text-neutral-400 truncate">
                                  {formatDate(f.order.createdAt)}
                                </span>
                              </div>
                              <div className="font-extrabold text-xs text-neutral-950 truncate">
                                {f.order.customer.name}
                              </div>
                              <div className="text-[10px] text-emerald-800 font-semibold truncate">
                                {f.order.customer.phone ? `📱 ${f.order.customer.phone}` : f.order.customer.email}
                              </div>
                              <div className="mt-1 pt-1 border-t border-neutral-100 space-y-0.5">
                                {f.order.items.map((it, idx) => (
                                  <p key={idx} className="text-[10px] text-neutral-700 truncate" title={`${it.quantity}x ${it.name}`}>
                                    <span className="font-extrabold text-neutral-950">{it.quantity}×</span> {it.name}
                                  </p>
                                ))}
                              </div>
                            </td>

                            {/* COLUNA 2: Valor da Compra */}
                            <td className="py-2.5 px-2">
                              <div className="text-sm font-black text-neutral-950">
                                {formatBRL(f.order.total)}
                              </div>
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 text-[9px] font-bold">
                                Total da Compra
                              </span>
                            </td>

                            {/* COLUNA 3: Datas & Valores Recebidos (ADM) */}
                            <td className="py-2.5 px-2.5">
                              {f.receipts.length > 0 ? (
                                <div className="space-y-1 mb-1.5 max-h-20 overflow-y-auto pr-0.5">
                                  {f.receipts.map((r) => (
                                    <div
                                      key={r.id}
                                      className="flex items-center justify-between gap-1 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 text-[10px]"
                                    >
                                      <span className="font-bold text-neutral-900">
                                        📅 {formatReceiptDateBr(r.date)}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-black text-emerald-700">
                                          {formatBRL(r.amount)}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleQuickRemoveReceipt(f.order, r.id)}
                                          className="text-neutral-400 hover:text-red-600 transition cursor-pointer"
                                          title="Apagar este valor"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : isFullySettled ? (
                                <div className="mb-1.5 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold truncate">
                                  ✅ Pago: {formatBRL(f.receivedGross)}
                                </div>
                              ) : (
                                <div className="mb-1.5 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold truncate">
                                  ⏳ Nenhum valor lançado
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenConditionModal(f.order)}
                                className="w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white text-[10px] font-extrabold transition cursor-pointer"
                              >
                                <Plus className="w-3 h-3 shrink-0" />
                                <span className="truncate">Lançar Data e Valor</span>
                              </button>
                            </td>

                            {/* COLUNA 4: Recebido vs. Saldo Restante */}
                            <td className="py-2.5 px-2.5">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-neutral-600">Recebido:</span>
                                  <span className="font-black text-emerald-700">
                                    {formatBRL(f.receivedGross)}
                                  </span>
                                </div>

                                {f.remainingBalance > 0.01 ? (
                                  <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-neutral-100">
                                    <span className="font-bold text-neutral-600">Falta:</span>
                                    <span className="font-black text-[#8B1E3F]">
                                      {formatBRL(f.remainingBalance)}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="pt-0.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-extrabold text-[10px]">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                                      <span>QUITADO (R$ 0,00)</span>
                                    </span>
                                  </div>
                                )}

                                {/* Barra simples de progresso */}
                                <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      isFullySettled ? 'bg-emerald-600' : 'bg-[#8B1E3F]'
                                    }`}
                                    style={{ width: `${paidPercentage}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* COLUNA 5: Status ( Entregue ou Aguardando ) */}
                            <td className="py-2.5 px-2 text-center">
                              <div className="inline-grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1 border border-neutral-200 w-full">
                                <button
                                  type="button"
                                  onClick={() => updateOrderStatus(f.order.id, 'pendente')}
                                  className={`px-1.5 py-1.5 rounded-md text-[10px] font-extrabold transition cursor-pointer flex items-center justify-center gap-0.5 ${
                                    !isEntregue
                                      ? 'bg-amber-400 text-neutral-950 shadow-2xs'
                                      : 'text-neutral-500 hover:text-neutral-900'
                                  }`}
                                  title="Marcar como Aguardando Entrega"
                                >
                                  <span>⏳ Aguard.</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateOrderStatus(f.order.id, 'entregue')}
                                  className={`px-1.5 py-1.5 rounded-md text-[10px] font-extrabold transition cursor-pointer flex items-center justify-center gap-0.5 ${
                                    isEntregue
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : 'text-neutral-500 hover:text-neutral-900'
                                  }`}
                                  title="Marcar como Entregue ao cliente"
                                >
                                  <span>✅ Entregue</span>
                                </button>
                              </div>
                            </td>

                            {/* COLUNA 6: AÇÕES (100% visível sem cortar) */}
                            <td className="py-2.5 px-2.5">
                              <div className="flex flex-col gap-1">
                                {!isFullySettled ? (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickSettleOrder(f)}
                                    className="w-full px-2 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-extrabold transition cursor-pointer flex items-center justify-center gap-1"
                                    title={`Quitar saldo restante de ${formatBRL(f.remainingBalance)} com 1 clique`}
                                  >
                                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                                    <span className="truncate">Quitar ({formatBRL(f.remainingBalance)})</span>
                                  </button>
                                ) : (
                                  <div className="w-full px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-extrabold text-emerald-800 flex items-center justify-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                                    <span>Quitado ✅</span>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      generateOrderConditionsPdf({
                                        order: f.order,
                                        settledInstallments: f.settledInstallments,
                                        customTermsNote: f.order.adminPaymentTerms,
                                        firstDueDate: f.order.adminFirstDueDate,
                                        paymentReceipts: f.receipts
                                      })
                                    }
                                    className="px-1.5 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-neutral-950 text-white text-[10px] font-extrabold transition cursor-pointer flex items-center justify-center gap-1"
                                    title="Gerar PDF com as condições e saldo da compra"
                                  >
                                    <FileText className="w-3 h-3 shrink-0" />
                                    <span>PDF</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleSendDirectWhatsAppSummary(f)}
                                    className="px-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold transition cursor-pointer flex items-center justify-center gap-1"
                                    title="Enviar resumo direto no WhatsApp do cliente"
                                  >
                                    <MessageCircle className="w-3 h-3 shrink-0" />
                                    <span>Whats</span>
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold mb-2">
                  <span>Receita Total do Mês</span>
                  <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-neutral-900 font-display">
                  {formatBRL(totalStoreRevenue)}
                </p>
                <div className="mt-2 flex items-center text-xs text-emerald-600 font-bold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+14.2% em relação a Setembro</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold mb-2">
                  <span>Total de Pedidos</span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-neutral-900 font-display">
                  {totalOrdersCount}
                </p>
                <div className="mt-2 flex items-center text-xs text-emerald-600 font-bold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>98% de satisfação dos clientes</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold mb-2">
                  <span>Ticket Médio</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-neutral-900 font-display">
                  {formatBRL(averageTicket)}
                </p>
                <p className="mt-2 text-xs text-neutral-400">Impulsionado por Kits & Combos</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold mb-2">
                  <span>Alerta de Reposição</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-neutral-900 font-display">
                  {lowStockCount} produtos
                </p>
                <p className="mt-2 text-xs text-amber-700 font-semibold">Estoque baixo (&lt; 25 unidades)</p>
              </div>
            </div>

            {/* Monthly Sales Bar Graph */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-2">
                <div>
                  <h3 className="text-lg font-black text-neutral-900 font-display">
                    Relatório Detalhado de Vendas Mensais (2026)
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Desempenho financeiro consolidado de faturamento e volume de pedidos
                  </p>
                </div>
                <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                  Faturamento Anual Acumulado: R$ 1.258.020,00
                </span>
              </div>

              {/* Interactive Bar Chart Visualization */}
              <div className="mt-8 space-y-4">
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 items-end h-64 pt-6">
                  {monthlySales.map((m, idx) => {
                    const heightPercent = Math.round((m.revenue / maxRevenue) * 100);
                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition duration-200 bg-neutral-900 text-white text-[10px] p-2 rounded-xl shadow-lg whitespace-nowrap pointer-events-none z-10 text-center">
                          <p className="font-bold">{formatBRL(m.revenue)}</p>
                          <p className="text-neutral-400">{m.orders} pedidos ({m.growth})</p>
                        </div>

                        {/* Bar */}
                        <div
                          className="w-full max-w-[36px] bg-neutral-200 group-hover:bg-gradient-to-t group-hover:from-pink-600 group-hover:to-rose-400 rounded-t-xl transition-all duration-300 relative"
                          style={{
                            height: `${heightPercent}%`,
                            background: idx === monthlySales.length - 1
                              ? 'linear-gradient(to top, #E91E63, #FF4081)'
                              : undefined
                          }}
                        >
                          {idx === monthlySales.length - 1 && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-pink-600 bg-pink-50 px-1 rounded">
                              Atual
                            </span>
                          )}
                        </div>

                        {/* Month Label */}
                        <span className="text-[10px] font-bold text-neutral-500 mt-2 truncate w-full text-center">
                          {m.month.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Table of Monthly Metrics */}
              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-y border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Mês</th>
                      <th className="py-3 px-4">Faturamento</th>
                      <th className="py-3 px-4">Pedidos Concluídos</th>
                      <th className="py-3 px-4">Crescimento MoM</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {monthlySales.slice(-5).map((m, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="py-3 px-4 font-bold text-neutral-900">{m.month}</td>
                        <td className="py-3 px-4 font-extrabold text-neutral-900">{formatBRL(m.revenue)}</td>
                        <td className="py-3 px-4 text-neutral-700">{m.orders} pedidos</td>
                        <td className="py-3 px-4 font-semibold text-emerald-600">{m.growth}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Consolidado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GERENCIAMENTO DE ESTOQUE & PRODUTOS */}
        {activeTab === 'estoque' && (
          <div className="space-y-6">

            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-1 gap-3 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por nome no estoque..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-3 py-2 text-xs"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="todos">Todas Categorias</option>
                  <option value="perfumaria">Perfumaria</option>
                  <option value="bodysplash">Body Splash</option>
                  <option value="skincare">Skincare</option>
                  <option value="maquiagem">Maquiagem</option>
                  <option value="combos">Combos</option>
                </select>
              </div>

              <button
                onClick={() => handleOpenProductEdit()}
                className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Novo Produto</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="py-3.5 px-4">Produto</th>
                      <th className="py-3.5 px-4">Categoria</th>
                      <th className="py-3.5 px-4">Preço Atual</th>
                      <th className="py-3.5 px-4">Estoque</th>
                      <th className="py-3.5 px-4">Vendas / Status</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.map((p) => {
                      const isLowStock = p.stock < 25;
                      return (
                        <tr key={p.id} className="hover:bg-neutral-50 transition">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-xl border border-neutral-200"
                            />
                            <div>
                              <p className="font-bold text-neutral-900">{p.name}</p>
                              <p className="text-[11px] text-neutral-500">{p.volume}</p>
                            </div>
                          </td>

                          <td className="py-3 px-4 uppercase text-[10px] font-bold text-pink-600">
                            {p.category}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-neutral-900">{formatBRL(p.price)}</span>
                            {p.originalPrice > p.price && (
                              <span className="block text-[10px] text-neutral-400 line-through">
                                {formatBRL(p.originalPrice)}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`font-mono font-bold ${isLowStock ? 'text-amber-600' : 'text-neutral-900'
                              }`}>
                              {p.stock} un.
                            </span>
                            {isLowStock && (
                              <span className="block text-[9px] text-red-600 font-bold">
                                Estoque Crítico
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {p.isFlashSale ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                Promo Relâmpago
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                                Ativo na Loja
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenProductEdit(p)}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-pink-600 hover:bg-pink-50 transition"
                              title="Editar Produto"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Deseja remover "${p.name}" do catálogo?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Excluir Produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: GERENCIAMENTO DE CUPONS */}
        {activeTab === 'cupons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 font-display flex items-center gap-2">
                  <span>Cupons Promocionais Ativos ({coupons.length})</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Adicione, edite ou exclua cupons de desconto. Ao criar um novo cupom, todos os{' '}
                  <strong>{uniqueCustomerEmails.length} cliente(s) cadastrado(s)</strong> recebem um aviso por e-mail automaticamente.
                </p>
              </div>

              <button
                onClick={handleOpenAddCoupon}
                className="px-4 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-pink-600/20 transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Novo Cupom</span>
              </button>
            </div>

            {/* Feedback Banner for Coupon Actions & Email Dispatch */}
            {couponFeedback && (
              <div
                className={`p-4 rounded-2xl border text-xs flex flex-col gap-2 animate-in fade-in ${couponFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    {couponFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{couponFeedback.message}</span>
                  </div>
                  <button
                    onClick={() => setCouponFeedback(null)}
                    className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {couponFeedback.emails && couponFeedback.emails.length > 0 && (
                  <div className="pl-6 text-[11px] text-emerald-800 space-y-1">
                    <p className="font-semibold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      Destinatários notificados por e-mail:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {couponFeedback.emails.map((emailAddr) => (
                        <span
                          key={emailAddr}
                          className="bg-white/90 border border-emerald-200 px-2 py-0.5 rounded-md font-mono text-[10px]"
                        >
                          {emailAddr}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {coupons.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-neutral-200 text-center space-y-3">
                <Tag className="w-8 h-8 text-pink-500 mx-auto" />
                <p className="text-sm font-bold text-neutral-800">Nenhum cupom cadastrado no momento</p>
                <p className="text-xs text-neutral-500">
                  Clique em "Adicionar Novo Cupom" para criar uma campanha e avisar seus clientes por e-mail.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="bg-white p-5 rounded-3xl border border-pink-100 hover:border-pink-300 shadow-xs transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-black bg-pink-100 text-pink-700 px-3 py-1 rounded-xl tracking-wide">
                          {c.code}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          {c.discountType === 'percentage' ? `${c.value}% OFF` : `${formatBRL(c.value)} OFF`}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed">{c.description}</p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span>Compra mínima:</span>
                        <strong className="text-neutral-900">
                          {c.minOrderValue > 0 ? formatBRL(c.minOrderValue) : 'Sem mínimo'}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          disabled={sendingCouponCode === c.code}
                          onClick={() => handleResendCouponEmail(c)}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-neutral-100 hover:bg-pink-50 text-neutral-700 hover:text-pink-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                          title="Enviar e-mail deste cupom para todos os clientes cadastrados"
                        >
                          {sendingCouponCode === c.code ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Enviando...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Notificar Clientes</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditCoupon(c)}
                          className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50 transition cursor-pointer"
                          title="Editar Cupom"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir o cupom "${c.code}"?`)) {
                              deleteCoupon(c.code);
                              setCouponFeedback({
                                type: 'success',
                                message: `Cupom ${c.code} excluído com sucesso.`
                              });
                            }
                          }}
                          className="p-2 rounded-xl border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition cursor-pointer"
                          title="Excluir Cupom"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FERRAMENTA DE COBRANÇA POR WHATSAPP E E-MAIL */}
        {activeTab === 'cobranca' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 font-display flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-pink-600" />
                  <span>Central de Cobrança & Régua Automática (WhatsApp e E-mail)</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Automatize o envio de cobranças para pedidos pendentes ou selecione um cliente abaixo para cobrança imediata.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAutoSettingsOpen(!isAutoSettingsOpen)}
                  className="px-3.5 py-2 rounded-2xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-pink-600" />
                  <span>Configurar API WhatsApp & Gmail</span>
                </button>

                <button
                  type="button"
                  disabled={isRunningBatchAuto}
                  onClick={() => handleRunAutomatedRuleNow('batch_manual')}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-pink-600/20 transition cursor-pointer disabled:opacity-60"
                >
                  {isRunningBatchAuto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Disparando Régua...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        Disparar Régua nos Pendentes ({pendingOrdersList.length || orders.length})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PAINEL DA RÉGUA DE AUTOMAÇÃO INTELIGENTE (3 ETAPAS) */}
            <div className="bg-gradient-to-r from-neutral-900 via-stone-900 to-neutral-950 text-white rounded-3xl p-5 sm:p-6 border border-neutral-800 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${autoConfig.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
                      }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black font-display tracking-wide">
                        Régua de Cobrança Automática Inteligente
                      </h4>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${autoConfig.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400'
                          }`}
                      >
                        {autoConfig.enabled ? 'Ativa 24h' : 'Pausada'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Remetente oficial configurado: <strong className="text-pink-300">{autoConfig.senderEmail}</strong> • Para automaticamente quando o pedido muda para <strong>Pago</strong>.
                    </p>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-2xl text-xs font-bold transition">
                  <input
                    type="checkbox"
                    checked={autoConfig.enabled}
                    onChange={(e) => handleUpdateAutoConfig({ enabled: e.target.checked })}
                    className="accent-pink-500 w-4 h-4"
                  />
                  <span>{autoConfig.enabled ? 'Automação Ligada' : 'Ligar Automação'}</span>
                </label>
              </div>

              {/* As 3 Etapas Recomendadas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <label className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/40 flex items-start gap-3 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={autoConfig.autoOnCheckout}
                    onChange={(e) => handleUpdateAutoConfig({ autoOnCheckout: e.target.checked })}
                    className="mt-0.5 accent-pink-500"
                  />
                  <div className="space-y-1">
                    <span className="font-bold text-white block">
                      1. Disparo Imediato no Checkout
                    </span>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Envia a Chave Pix Copia e Cola por E-mail e WhatsApp no instante em que o cliente finaliza o pedido.
                    </p>
                  </div>
                </label>

                <label className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/40 flex items-start gap-3 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={autoConfig.reminder30m}
                    onChange={(e) => handleUpdateAutoConfig({ reminder30m: e.target.checked })}
                    className="mt-0.5 accent-pink-500"
                  />
                  <div className="space-y-1">
                    <span className="font-bold text-white block">
                      2. Lembrete de 30 Minutos
                    </span>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Se o pedido continuar <code className="text-amber-300">pendente</code> após 30 min, avisa que os produtos já estão separados aguardando o Pix.
                    </p>
                  </div>
                </label>

                <label className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/40 flex items-start gap-3 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={autoConfig.reminder24h}
                    onChange={(e) => handleUpdateAutoConfig({ reminder24h: e.target.checked })}
                    className="mt-0.5 accent-pink-500"
                  />
                  <div className="space-y-1">
                    <span className="font-bold text-white block">
                      3. Aviso de Vencimento (24h)
                    </span>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Último lembrete automático enviado após 24h em aberto antes de liberar a reserva do estoque.
                    </p>
                  </div>
                </label>
              </div>

              {/* Gaveta de Configuração de Credenciais (Gmail SMTP + WhatsApp API / Webhook) */}
              {isAutoSettingsOpen && (
                <div className="pt-4 border-t border-white/10 space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-300">
                        E-mail Remetente da Loja (Gmail)
                      </label>
                      <input
                        type="email"
                        value={autoConfig.senderEmail}
                        onChange={(e) =>
                          setAutoConfig({ ...autoConfig, senderEmail: e.target.value })
                        }
                        placeholder="sandravasconcellossillva@gmail.com"
                        className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-hidden focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-pink-300">
                          Senha de App do Gmail (16 letras — SMTP Direto)
                        </label>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-amber-300 hover:underline flex items-center gap-1"
                        >
                          <span>Gerar no Google</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <input
                        type="password"
                        value={autoConfig.smtpAppPassword}
                        onChange={(e) =>
                          setAutoConfig({ ...autoConfig, smtpAppPassword: e.target.value })
                        }
                        placeholder="Ex: abcd efgh ijkl mnop (faz sair dos Enviados automaticamente)"
                        className="w-full mt-1 bg-neutral-900 border border-pink-500/50 rounded-xl px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-300">
                        URL da API de WhatsApp (Evolution API / Z-API) — Opcional
                      </label>
                      <input
                        type="url"
                        value={autoConfig.whatsappApiUrl}
                        onChange={(e) =>
                          setAutoConfig({ ...autoConfig, whatsappApiUrl: e.target.value })
                        }
                        placeholder="https://api.z-api.io/instances/.../token/.../send-text"
                        className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-300">
                        Token / API Key do WhatsApp — Opcional
                      </label>
                      <input
                        type="password"
                        value={autoConfig.whatsappApiToken}
                        onChange={(e) =>
                          setAutoConfig({ ...autoConfig, whatsappApiToken: e.target.value })
                        }
                        placeholder="Token de autenticação da instância"
                        className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-300">
                        Webhook de Automação (n8n / Make / Zapier) — Opcional
                      </label>
                      <input
                        type="url"
                        value={autoConfig.whatsappWebhookUrl}
                        onChange={(e) =>
                          setAutoConfig({ ...autoConfig, whatsappWebhookUrl: e.target.value })
                        }
                        placeholder="https://seu-n8n.com/webhook/cobranca-vasconcelos"
                        className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAutoSettingsOpen(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white cursor-pointer"
                    >
                      Fechar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateAutoConfig(autoConfig, true)}
                      className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Integração</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {billingFeedback && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-center justify-between animate-in fade-in ${billingFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {billingFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{billingFeedback.message}</span>
                </div>
                <button
                  onClick={() => setBillingFeedback(null)}
                  className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* COLUNA ESQUERDA: LISTA DE CLIENTES CADASTRADOS E PEDIDOS */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-neutral-200 p-5 shadow-xs flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-pink-600" />
                    <span>Cadastros & Pedidos ({billingDirectory.length})</span>
                  </h4>
                  <span className="text-[10px] text-neutral-400">Clique para preencher</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={billingSearch}
                    onChange={(e) => setBillingSearch(e.target.value)}
                    placeholder="Buscar cliente por nome, telefone, e-mail ou pedido..."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-9 pr-3 py-2 text-xs outline-hidden focus:border-pink-500 focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>

                <div className="divide-y divide-neutral-100 max-h-[460px] overflow-y-auto pr-1">
                  {billingDirectory
                    .filter((item) => {
                      const q = billingSearch.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        item.name.toLowerCase().includes(q) ||
                        item.email.toLowerCase().includes(q) ||
                        item.phone.toLowerCase().includes(q) ||
                        (item.orderNumber || '').toLowerCase().includes(q)
                      );
                    })
                    .map((item) => {
                      const isSelected =
                        billEmail.toLowerCase() === item.email.toLowerCase() &&
                        (billOrderNum === (item.orderNumber || ''));

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectBillingCustomer(item)}
                          className={`w-full text-left p-3.5 rounded-2xl transition flex items-start justify-between gap-2 cursor-pointer ${isSelected
                              ? 'bg-pink-50/90 border border-pink-200'
                              : 'hover:bg-neutral-50'
                            }`}
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-neutral-900 truncate">
                                {item.name}
                              </span>
                              {item.orderNumber ? (
                                <span className="font-mono text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-md">
                                  {item.orderNumber}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-md">
                                  Cliente Cadastrado
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-neutral-600 flex items-center gap-1.5 truncate">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{item.phone || 'Sem telefone no cadastro'}</span>
                            </p>

                            <p className="text-[11px] text-neutral-500 flex items-center gap-1.5 truncate">
                              <Mail className="w-3 h-3 text-pink-600 shrink-0" />
                              <span className="truncate">{item.email}</span>
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-neutral-900 block">
                              {formatBRL(item.amount)}
                            </span>
                            {item.orderStatus && item.orderStatus !== 'cadastro' && (
                              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                {item.orderStatus}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* COLUNA DIREITA: FORMULÁRIO DE COBRANÇA E MENSAGEM */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 font-display">
                      Dados da Cobrança do Cliente
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Preenchido automaticamente pelo cadastro ou editável manualmente
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Modelo:
                    </span>
                    {[
                      { id: 'lembrete', label: 'Lembrete' },
                      { id: 'pix', label: 'Chave Pix' },
                      { id: 'vencimento', label: 'Vencimento' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleApplyTemplate(t.id as 'lembrete' | 'pix' | 'vencimento')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${billTemplate === t.id
                            ? 'bg-pink-600 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campos do Cliente (Nome, Telefone do Cadastro, E-mail do Cadastro) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-neutral-700">Nome do Cliente *</label>
                    <input
                      type="text"
                      value={billName}
                      onChange={(e) => setBillName(e.target.value)}
                      placeholder="Nome completo"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-pink-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp do Cadastro *</span>
                    </label>
                    <input
                      type="tel"
                      value={billPhone}
                      onChange={(e) => setBillPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-pink-600" />
                      <span>E-mail do Cadastro *</span>
                    </label>
                    <input
                      type="email"
                      value={billEmail}
                      onChange={(e) => setBillEmail(e.target.value)}
                      placeholder="cliente@email.com"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-pink-500 outline-hidden"
                    />
                  </div>
                </div>

                {/* Campos do Pedido / Valor / Vencimento / Pix */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-neutral-700">Nº do Pedido / Referência</label>
                    <input
                      type="text"
                      value={billOrderNum}
                      onChange={(e) => setBillOrderNum(e.target.value)}
                      placeholder="Ex: VSC-98214"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:border-pink-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700">Valor da Cobrança (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      placeholder="149.90"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-pink-700 focus:bg-white focus:border-pink-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700">Vencimento</label>
                    <input
                      type="text"
                      value={billDueDate}
                      onChange={(e) => setBillDueDate(e.target.value)}
                      placeholder="Ex: Hoje, 30/10/2026"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-pink-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-bold text-neutral-700">
                    Chave Pix / Pix Copia e Cola / Link de Pagamento
                  </label>
                  <input
                    type="text"
                    value={billPixKey}
                    onChange={(e) => setBillPixKey(e.target.value)}
                    placeholder="pix@vasconcelosbeauty.com.br"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:border-pink-500 outline-hidden"
                  />
                </div>

                {/* Mensagem da Cobrança */}
                <div className="text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-neutral-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-pink-600" />
                      <span>Mensagem de Cobrança (WhatsApp & E-mail)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(currentComposedMessage);
                        setBillingFeedback({
                          type: 'success',
                          message: 'Texto da cobrança copiado para a área de transferência!'
                        });
                      }}
                      className="text-[11px] font-bold text-pink-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar Texto</span>
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={currentComposedMessage}
                    onChange={(e) => setBillCustomMessage(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-2xl p-3.5 text-xs text-neutral-800 leading-relaxed focus:bg-white focus:border-pink-500 outline-hidden"
                  />
                </div>

                {/* Action Buttons: WhatsApp, Email, or Both */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSendWhatsAppBilling}
                    className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Cobrar por WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSendingBillingEmail}
                    onClick={handleSendEmailBilling}
                    className="py-3 px-4 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-pink-600/20 transition cursor-pointer disabled:opacity-60"
                  >
                    {isSendingBillingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando E-mail...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Cobrar por E-mail</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isSendingBillingEmail}
                    onClick={handleSendBothBilling}
                    className="py-3 px-4 rounded-2xl bg-neutral-900 hover:bg-black text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-4 h-4 text-amber-400" />
                    <span>Enviar nos Dois</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Histórico de Cobranças Enviadas */}
            {billingLogs.length > 0 && (
              <div className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-pink-600" />
                  <span>Histórico Recente de Cobranças Enviadas ({billingLogs.length})</span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase border-b border-neutral-200">
                      <tr>
                        <th className="py-2.5 px-3">Data / Hora</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Contato Utilizado</th>
                        <th className="py-2.5 px-3">Referência</th>
                        <th className="py-2.5 px-3">Valor</th>
                        <th className="py-2.5 px-3">Canal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {billingLogs.slice(0, 8).map((log) => (
                        <tr key={log.id} className="hover:bg-neutral-50">
                          <td className="py-2.5 px-3 text-neutral-500 font-mono text-[11px]">
                            {log.timestamp}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-neutral-900">
                            {log.customerName}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-neutral-600">
                            {log.channel === 'whatsapp'
                              ? log.customerPhone
                              : log.channel === 'email'
                                ? log.customerEmail
                                : `${log.customerPhone} / ${log.customerEmail}`}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px]">
                            {log.orderNumber}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-neutral-900">
                            {formatBRL(log.amount)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${log.channel === 'whatsapp'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-pink-100 text-pink-800'
                                }`}
                            >
                              {log.channel === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 font-display">
                    {editingProductId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {editingProductId ? 'Atualize as informações do item' : 'vasconcelos Presente — Catálogo'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEÇÃO IMPORTAR VIA LINK (apenas quando adicionando novo produto) */}
            {!editingProductId && (
              <div className="bg-gradient-to-br from-pink-50 via-rose-50/50 to-amber-50/30 rounded-2xl p-4 border border-pink-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-pink-900 font-bold text-xs">
                    <Wand2 className="w-4 h-4 text-pink-600 animate-pulse" />
                    <span>Adicionar Produto via Link (WePink, etc.)</span>
                  </div>
                  <span className="text-[10px] bg-pink-200/70 text-pink-800 font-bold px-2 py-0.5 rounded-full">
                    Extração Inteligente
                  </span>
                </div>

                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Cole o link da página do perfume ou cosmético. Nosso sistema busca a <strong>foto oficial em alta qualidade</strong>, <strong>nome</strong>, <strong>preço</strong>, <strong>volume</strong>, <strong>descrição</strong> e <strong>pirâmide olfativa</strong> automaticamente!
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="url"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder="https://www.wepink.com.br/body-splash-heaven-pink200ml---wepink-569/p"
                      disabled={isExtracting}
                      className="w-full bg-white border border-pink-200 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-pink-500 font-mono disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isExtracting}
                    onClick={() => handleExtractFromUrl()}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Extraindo...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Buscar e Preencher</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Botão de teste rápido com o link solicitado pelo usuário */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="text-neutral-500">Exemplo para teste rápido:</span>
                  <button
                    type="button"
                    disabled={isExtracting}
                    onClick={() => {
                      const testUrl = 'https://www.wepink.com.br/body-splash-heaven-pink200ml---wepink-569/p';
                      setImportUrl(testUrl);
                      handleExtractFromUrl(testUrl);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-pink-100 text-pink-700 font-semibold rounded-lg border border-pink-200 transition-colors shadow-2xs"
                  >
                    <span>🌸 Body Splash Heaven Pink 200ml (WePink)</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Feedback da extração */}
                {extractFeedback && (
                  <div
                    className={`flex items-start gap-2 p-3 rounded-xl text-xs ${extractFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                  >
                    {extractFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{extractFeedback.message}</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-neutral-700">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Body Splash Heaven Pink"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700">Subtítulo / Apelo *</label>
                  <input
                    type="text"
                    required
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="Ex: Doce floral encantador com alta fixação"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white"
                  >
                    <option value="perfumaria">Perfumaria Fina</option>
                    <option value="bodysplash">Body Splash</option>
                    <option value="skincare">Skincare Facial</option>
                    <option value="maquiagem">Maquiagem</option>
                    <option value="combos">Kits & Combos</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Volume / Tamanho</label>
                  <input
                    type="text"
                    value={formVolume}
                    onChange={(e) => setFormVolume(e.target.value)}
                    placeholder="Ex: 200ml / 100ml / 30g"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Preço Promocional (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="Ex: 89.90"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Preço 'De' (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="Ex: 129.90"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Estoque Inicial *</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white"
                  />
                </div>
              </div>

              {/* IMAGEM DO PRODUTO COM PREVIEW EM TEMPO REAL */}
              <div>
                <label className="font-bold text-neutral-700 flex items-center justify-between">
                  <span>URL da Imagem do Produto</span>
                  {formImage && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Imagem carregada
                    </span>
                  )}
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-neutral-200 overflow-hidden bg-neutral-100 shrink-0 flex items-center justify-center shadow-2xs">
                    {formImage ? (
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <Package className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:bg-white"
                  />
                </div>
              </div>

              {/* CARACTERÍSTICAS / PIRÂMIDE OLFATIVA (para perfumes e body splashes) */}
              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/70 space-y-2.5">
                <div className="flex items-center gap-2 text-neutral-800 font-bold text-xs">
                  <Tag className="w-3.5 h-3.5 text-pink-600" />
                  <span>Pirâmide Olfativa (Notas do Perfume / Splash)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600">Notas de Topo (Saída)</label>
                    <input
                      type="text"
                      value={formNotesTopo}
                      onChange={(e) => setFormNotesTopo(e.target.value)}
                      placeholder="Ex: Frutas vermelhas, Bergamota"
                      className="w-full mt-1 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600">Notas de Coração (Corpo)</label>
                    <input
                      type="text"
                      value={formNotesCoracao}
                      onChange={(e) => setFormNotesCoracao(e.target.value)}
                      placeholder="Ex: Jasmim, Peônia, Rosa"
                      className="w-full mt-1 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600">Notas de Fundo (Fixação)</label>
                    <input
                      type="text"
                      value={formNotesFundo}
                      onChange={(e) => setFormNotesFundo(e.target.value)}
                      placeholder="Ex: Baunilha, Âmbar, Almíscar"
                      className="w-full mt-1 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* BENEFÍCIOS E ATIVOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Benefícios (um por linha)</label>
                  <textarea
                    rows={2}
                    value={formBenefitsText}
                    onChange={(e) => setFormBenefitsText(e.target.value)}
                    placeholder="Alta fixação de 12 horas&#10;Fórmula vegana&#10;Toque aveludado na pele"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Ativos Principais</label>
                  <textarea
                    rows={2}
                    value={formActivesText}
                    onChange={(e) => setFormActivesText(e.target.value)}
                    placeholder="Vitamina E, Extrato de Baunilha, Ácido Hialurônico"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700">Descrição do Produto</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detalhes completos sobre a fragrância, modo de uso e diferenciais..."
                  className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  vasconcelos Presente
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Produto</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Add / Edit Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 font-display">
                    {editingCouponCode ? `Editar Cupom (${editingCouponCode})` : 'Novo Cupom de Desconto'}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {editingCouponCode
                      ? 'Atualize as regras do cupom promocional'
                      : 'Crie um cupom e notifique os clientes cadastrados por e-mail'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700">Código do Cupom *</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  placeholder="Ex: LUXO15, MAES20, VIP30"
                  className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-black uppercase text-pink-700 focus:bg-white focus:ring-2 focus:ring-pink-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Tipo de Desconto</label>
                  <select
                    value={couponDiscountType}
                    onChange={(e) => setCouponDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white outline-hidden"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700">
                    {couponDiscountType === 'percentage' ? 'Desconto (%) *' : 'Desconto (R$) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                    placeholder={couponDiscountType === 'percentage' ? 'Ex: 15' : 'Ex: 25.00'}
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold focus:bg-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700">Compra Mínima (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={couponMinOrder}
                    onChange={(e) => setCouponMinOrder(e.target.value)}
                    placeholder="Ex: 100.00"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700">Descrição / Regra do Cupom *</label>
                <textarea
                  rows={2}
                  required
                  value={couponDescription}
                  onChange={(e) => setCouponDescription(e.target.value)}
                  placeholder="Ex: 15% de desconto especial em toda a linha de perfumaria fina!"
                  className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white outline-hidden"
                />
              </div>

              {!editingCouponCode && (
                <label className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmailOnCreate}
                    onChange={(e) => setSendEmailOnCreate(e.target.checked)}
                    className="mt-0.5 accent-pink-600"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-pink-900 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-pink-600" />
                      Enviar e-mail automático para clientes cadastrados ({uniqueCustomerEmails.length})
                    </span>
                    <p className="text-[11px] text-neutral-600">
                      Todos os clientes cadastrados receberão um e-mail com o código, valor do desconto e regras deste novo cupom.
                    </p>
                  </div>
                </label>
              )}

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCoupon}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSavingCoupon ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando e Enviando E-mail...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingCouponCode ? 'Salvar Alterações' : 'Criar Cupom e Enviar E-mail'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONDIÇÕES DE PAGAMENTO, DATA E VALOR RECEBIDO & SALDO AUTOMÁTICO DO ADM */}
      {conditionModalOrder && (() => {
        const pendingInputAmount = parseFloat(newReceiptAmount.replace(',', '.')) || 0;
        const savedReceiptsTotal = condReceipts.reduce((s, r) => s + Number(r.amount || 0), 0);
        const previewTotalReceived = savedReceiptsTotal + (pendingInputAmount > 0 ? pendingInputAmount : 0);
        const previewRemainingBalance = Math.max(0, conditionModalOrder.total - previewTotalReceived);
        const isPreviewPaid = previewRemainingBalance <= 0.01 && previewTotalReceived > 0;

        // Se o ADM preencheu um valor no campo e clicou direto em Salvar, inclui esse recebimento automaticamente
        const getFinalReceiptsToSave = (): PaymentReceipt[] => {
          if (pendingInputAmount > 0) {
            return [
              ...condReceipts,
              {
                id: `rec-${Date.now()}`,
                date: newReceiptDate || new Date().toISOString().slice(0, 10),
                amount: pendingInputAmount,
                method: newReceiptMethod || 'PIX'
              }
            ];
          }
          return condReceipts;
        };

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="relative bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-4 border border-neutral-200 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1E3F] block">
                    Controle Simples do ADM • VASCONCELOS
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-neutral-950">
                    Lançar Recebimento & Saldo da Compra
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Pedido <strong>{conditionModalOrder.orderNumber}</strong> •{' '}
                    <strong>{conditionModalOrder.customer.name}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConditionModalOrder(null)}
                  className="p-2 rounded-xl bg-neutral-100 text-neutral-600 hover:text-neutral-950 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. RESUMO AUTOMÁTICO DO SALDO DA COMPRA (GRANDE E LIMPO PARA CELULAR) */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-[#F7F6F2] border border-neutral-300">
                  <span className="text-[10px] font-bold uppercase text-neutral-500 block">
                    Valor da Compra
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-neutral-950 mt-1">
                    {formatBRL(conditionModalOrder.total)}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Total Recebido
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-1">
                    {formatBRL(previewTotalReceived)}
                  </p>
                </div>

                <div
                  className={`p-3 rounded-2xl border-2 ${
                    isPreviewPaid
                      ? 'bg-emerald-50 border-emerald-500'
                      : 'bg-amber-50 border-amber-400'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase block ${
                      isPreviewPaid ? 'text-emerald-800' : 'text-amber-900'
                    }`}
                  >
                    Saldo Restante
                  </span>
                  <p
                    className={`text-sm sm:text-base font-extrabold mt-1 ${
                      isPreviewPaid ? 'text-emerald-700' : 'text-[#8B1E3F]'
                    }`}
                  >
                    {isPreviewPaid ? 'QUITADO ✅' : formatBRL(previewRemainingBalance)}
                  </p>
                </div>
              </div>

              {/* 2. LANÇAR DATA QUE RECEBEU E VALOR RECEBIDO */}
              <div className="p-4 rounded-2xl bg-[#F7F6F2] border border-neutral-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                    1. Coloque a Data que Recebeu e o Valor
                  </span>
                  {previewRemainingBalance > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setNewReceiptAmount(
                          Math.max(0, conditionModalOrder.total - savedReceiptsTotal).toFixed(2)
                        )
                      }
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-700 text-white cursor-pointer"
                    >
                      Preencher Saldo Total
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block">
                      Data que Recebeu *
                    </label>
                    <input
                      type="date"
                      value={newReceiptDate}
                      onChange={(e) => setNewReceiptDate(e.target.value)}
                      className="w-full mt-1 bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-bold text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block">
                      Valor Recebido (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={newReceiptAmount}
                      onChange={(e) => setNewReceiptAmount(e.target.value)}
                      placeholder="Ex: 100.00"
                      className="w-full mt-1 bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm font-mono font-extrabold text-emerald-800 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={newReceiptMethod}
                    onChange={(e) => setNewReceiptMethod(e.target.value)}
                    className="bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-bold text-neutral-800"
                  >
                    <option value="PIX">Via PIX</option>
                    <option value="Dinheiro">Em Dinheiro</option>
                    <option value="Cartão">No Cartão</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddReceiptToModal}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#111111] hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Confirmar Valor e Abater do Saldo</span>
                  </button>
                </div>
              </div>

              {/* 3. HISTÓRICO DE PAGAMENTOS JÁ LANÇADOS NESTA COMPRA */}
              {condReceipts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block">
                    Pagamentos Já Recebidos neste Pedido ({condReceipts.length})
                  </span>
                  <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl overflow-hidden bg-white">
                    {condReceipts.map((r, idx) => (
                      <div
                        key={r.id}
                        className="p-3 flex items-center justify-between text-xs hover:bg-neutral-50"
                      >
                        <div>
                          <span className="font-mono font-bold text-neutral-500 mr-2">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-neutral-900">
                            📅 {formatReceiptDateBr(r.date)}
                          </span>
                          <span className="ml-2 px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px] font-bold">
                            {r.method || 'PIX'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-emerald-700 text-sm">
                            + {formatBRL(r.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveReceiptFromModal(r.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Remover lançamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. OBSERVAÇÃO / PRÓXIMO VENCIMENTO OPCIONAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 text-[11px]">
                    Previsão do Próximo Pagamento
                  </label>
                  <input
                    type="text"
                    value={condDueDate}
                    onChange={(e) => setCondDueDate(e.target.value)}
                    placeholder="Ex: Dia 15/12 ou A combinar"
                    className="w-full mt-1 bg-[#F7F6F2] border border-neutral-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 text-[11px]">
                    Observação para o PDF / Cliente
                  </label>
                  <input
                    type="text"
                    value={condNotes}
                    onChange={(e) => setCondNotes(e.target.value)}
                    placeholder="Observação da compra..."
                    className="w-full mt-1 bg-[#F7F6F2] border border-neutral-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* 5. BOTÕES DE AÇÃO GRANDES PARA CELULAR E PC */}
              <div className="pt-3 border-t border-neutral-200 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const finalReceipts = getFinalReceiptsToSave();
                    const totalRec = finalReceipts.reduce((s, r) => s + Number(r.amount || 0), 0);
                    const finalStatus: Order['paymentStatus'] =
                      totalRec >= conditionModalOrder.total - 0.01 ? 'paid' : condStatus;

                    updateOrderPaymentConditions(conditionModalOrder.id, {
                      paymentMethod: condMethod,
                      installments: condInstallments,
                      paymentStatus: finalStatus,
                      adminPaymentTerms: condNotes,
                      adminFirstDueDate: condDueDate,
                      paymentReceipts: finalReceipts
                    });
                    setConditionModalOrder(null);
                  }}
                  className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Recebimentos e Atualizar Saldo</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const finalReceipts = getFinalReceiptsToSave();
                      const totalRec = finalReceipts.reduce((s, r) => s + Number(r.amount || 0), 0);
                      const remBal = Math.max(0, conditionModalOrder.total - totalRec);
                      const finalStatus: Order['paymentStatus'] =
                        remBal <= 0.01 && totalRec > 0 ? 'paid' : condStatus;

                      updateOrderPaymentConditions(conditionModalOrder.id, {
                        paymentMethod: condMethod,
                        installments: condInstallments,
                        paymentStatus: finalStatus,
                        adminPaymentTerms: condNotes,
                        adminFirstDueDate: condDueDate,
                        paymentReceipts: finalReceipts
                      });

                      const receiptsLines =
                        finalReceipts.length > 0
                          ? finalReceipts
                              .map(
                                (r) =>
                                  `• ${formatReceiptDateBr(r.date)}: *${formatBRL(r.amount)}* (${r.method || 'PIX'})`
                              )
                              .join('\n')
                          : '• Nenhum pagamento registrado ainda';

                      const digits = (conditionModalOrder.customer.phone || '').replace(/\D/g, '');
                      const fullPhone = digits ? (digits.startsWith('55') ? digits : `55${digits}`) : '';
                      const waText = [
                        `Olá, *${conditionModalOrder.customer.name}*! Segue o resumo atualizado do seu pedido *${conditionModalOrder.orderNumber}* na *VASCONCELOS*:`,
                        ``,
                        `🛍️ *Valor Total da Compra:* ${formatBRL(conditionModalOrder.total)}`,
                        `✅ *Total Já Recebido:* ${formatBRL(totalRec)}`,
                        `📌 *Saldo Restante a Pagar:* *${remBal <= 0.01 && totalRec > 0 ? 'R$ 0,00 (QUITADO ✅)' : formatBRL(remBal)}*`,
                        ``,
                        `📅 *Histórico de Pagamentos Recebidos:*`,
                        receiptsLines,
                        ``,
                        `🚚 *Entrega:* VasconcelosExpress (GRÁTIS)`,
                        `🔑 *Chave PIX / Contato ADM:* sandravasconcellossillva@gmail.com`
                      ].join('\n');

                      if (fullPhone) {
                        window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(waText)}`, '_blank');
                      }
                      setConditionModalOrder(null);
                    }}
                    className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar Resumo no WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const finalReceipts = getFinalReceiptsToSave();
                      const totalRec = finalReceipts.reduce((s, r) => s + Number(r.amount || 0), 0);
                      const remBal = Math.max(0, conditionModalOrder.total - totalRec);
                      const finalStatus: Order['paymentStatus'] =
                        remBal <= 0.01 && totalRec > 0 ? 'paid' : condStatus;

                      updateOrderPaymentConditions(conditionModalOrder.id, {
                        paymentMethod: condMethod,
                        installments: condInstallments,
                        paymentStatus: finalStatus,
                        adminPaymentTerms: condNotes,
                        adminFirstDueDate: condDueDate,
                        paymentReceipts: finalReceipts
                      });

                      const updatedOrder: Order = {
                        ...conditionModalOrder,
                        paymentMethod: condMethod,
                        installments: condInstallments,
                        paymentStatus: finalStatus,
                        adminPaymentTerms: condNotes,
                        adminFirstDueDate: condDueDate,
                        paymentReceipts: finalReceipts
                      };

                      generateOrderConditionsPdf({
                        order: updatedOrder,
                        customTermsNote: condNotes,
                        firstDueDate: condDueDate,
                        paymentReceipts: finalReceipts
                      });
                      setConditionModalOrder(null);
                    }}
                    className="py-3 px-4 rounded-xl bg-[#8B1E3F] hover:bg-neutral-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Salvar e Gerar PDF c/ Saldo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* BARRA INFERIOR FIXA PARA O ADM NO CELULAR (md:hidden) */}
      <div
        id="vsc-admin-mobile-dock"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#111111] text-white border-t border-neutral-800 px-2 pt-2 flex items-center justify-around shadow-2xl"
        style={{
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)'
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('relatorios');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition cursor-pointer ${
            activeTab === 'relatorios' ? 'text-emerald-400 font-extrabold' : 'text-neutral-400'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px]">Pedidos & Saldo</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('estoque');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition cursor-pointer ${
            activeTab === 'estoque' ? 'text-emerald-400 font-extrabold' : 'text-neutral-400'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px]">Estoque</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('cupons');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition cursor-pointer ${
            activeTab === 'cupons' ? 'text-emerald-400 font-extrabold' : 'text-neutral-400'
          }`}
        >
          <Tag className="w-5 h-5" />
          <span className="text-[10px]">Cupons</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('cobranca');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition cursor-pointer ${
            activeTab === 'cobranca' ? 'text-emerald-400 font-extrabold' : 'text-neutral-400'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px]">Cobrança</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('store')}
          className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-neutral-300 hover:text-white cursor-pointer"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="text-[10px]">Ver Loja</span>
        </button>
      </div>

    </div>
  );
};
