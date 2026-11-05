import {
  Product,
  Order,
  User,
  Coupon,
  Review,
  PushNotification
} from '../types';

// Credenciais oficiais do projeto Supabase Vasconcelos (Publishable Key segura para Front-end com RLS)
const RAW_SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://affqouhspuwcqyauxier.supabase.co/rest/v1/';

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_vqdFEwzJd6NUuXM-wO7sHg_4oI7j2BQ';

// Normaliza a URL para garantir sempre o sufixo /rest/v1 sem barra duplicada
export const SUPABASE_REST_URL = RAW_SUPABASE_URL.replace(/\/+$/, '').endsWith('/rest/v1')
  ? RAW_SUPABASE_URL.replace(/\/+$/, '')
  : `${RAW_SUPABASE_URL.replace(/\/+$/, '')}/rest/v1`;

// Nomes oficiais das tabelas com sufixo _vasconcelos
export const SUPABASE_TABLES = {
  products: 'products_vasconcelos',
  customers: 'customers_vasconcelos',
  orders: 'orders_vasconcelos',
  coupons: 'coupons_vasconcelos',
  reviews: 'reviews_vasconcelos',
  financialSettings: 'financial_settings_vasconcelos',
  billingLogs: 'billing_logs_vasconcelos',
  notifications: 'notifications_vasconcelos'
} as const;

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    ...extra
  };

  // Se for JWT legado (eyJ...), inclui Authorization Bearer; para sb_publishable_, apikey já autentica no gateway
  if (SUPABASE_ANON_KEY.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  }

  return headers;
}

// =============================================================================
// MAPEAMENTO DE TIPOS: APP (camelCase) <-> POSTGRESQL SUPABASE (snake_case)
// =============================================================================

export function mapProductToRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    subtitle: p.subtitle || '',
    category: p.category,
    price: Number(p.price),
    original_price: Number(p.originalPrice),
    discount_percent: p.discountPercent ?? 0,
    rating: Number(p.rating ?? 5.0),
    review_count: Number(p.reviewCount ?? 0),
    images: p.images || [],
    description: p.description || '',
    volume: p.volume || '',
    benefits: p.benefits || [],
    notes: p.notes || null,
    actives: p.actives || [],
    stock: Number(p.stock ?? 0),
    is_flash_sale: Boolean(p.isFlashSale),
    sold_percentage: Number(p.soldPercentage ?? 0),
    is_best_seller: Boolean(p.isBestSeller),
    is_new: Boolean(p.isNew)
  };
}

export function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle || '',
    category: row.category,
    price: Number(row.price),
    originalPrice: Number(row.original_price ?? row.price),
    discountPercent: row.discount_percent ?? undefined,
    rating: Number(row.rating ?? 5),
    reviewCount: Number(row.review_count ?? 0),
    images: Array.isArray(row.images) ? row.images : [],
    description: row.description || '',
    volume: row.volume || '',
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    notes: row.notes || undefined,
    actives: Array.isArray(row.actives) ? row.actives : undefined,
    stock: Number(row.stock ?? 0),
    isFlashSale: Boolean(row.is_flash_sale),
    soldPercentage: row.sold_percentage ?? undefined,
    isBestSeller: Boolean(row.is_best_seller),
    isNew: Boolean(row.is_new)
  };
}

export function mapOrderToRow(o: Order, settledInstallments?: number) {
  const totalInst = Math.max(1, o.installments || 1);
  const defaultSettled =
    settledInstallments !== undefined
      ? settledInstallments
      : o.paymentStatus === 'paid' && totalInst === 1
        ? 1
        : 0;

  return {
    id: o.id,
    order_number: o.orderNumber,
    created_at: o.createdAt,
    customer: o.customer,
    shipping_address: o.shippingAddress,
    shipping_method: {
      ...o.shippingMethod,
      adminPaymentTerms: o.adminPaymentTerms || undefined,
      adminFirstDueDate: o.adminFirstDueDate || undefined,
      paymentReceipts: o.paymentReceipts || []
    },
    items: o.items || [],
    subtotal: Number(o.subtotal),
    discount: Number(o.discount),
    shipping_cost: Number(o.shippingCost),
    total: Number(o.total),
    coupon_code: o.couponCode || null,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    order_status: o.orderStatus,
    installments: totalInst,
    settled_installments: defaultSettled,
    tracking_code: o.trackingCode || null,
    pix_copia_e_cola: o.pixCopiaECola || null
  };
}

export function mapRowToOrder(row: any): Order & { settledInstallments?: number } {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    customer: row.customer || { name: 'Cliente', email: '', phone: '', cpf: '' },
    shippingAddress: row.shipping_address || {
      id: 'addr-1',
      name: 'VasconcelosExpress',
      cep: '00000-000',
      logradouro: '',
      numero: 'S/N',
      bairro: 'VasconcelosExpress',
      localidade: 'Entrega Expressa',
      uf: 'BR'
    },
    shippingMethod: row.shipping_method || { name: 'VasconcelosExpress', price: 0, days: 1 },
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal ?? 0),
    discount: Number(row.discount ?? 0),
    shippingCost: Number(row.shipping_cost ?? 0),
    total: Number(row.total ?? 0),
    couponCode: row.coupon_code || undefined,
    paymentMethod: row.payment_method || 'pix',
    paymentStatus: row.payment_status || 'pending',
    orderStatus: row.order_status || 'pendente',
    installments: Number(row.installments ?? 1),
    settledInstallments:
      typeof row.settled_installments === 'number' ? row.settled_installments : undefined,
    trackingCode: row.tracking_code || undefined,
    pixCopiaECola: row.pix_copia_e_cola || undefined,
    adminPaymentTerms: row.shipping_method?.adminPaymentTerms || undefined,
    adminFirstDueDate: row.shipping_method?.adminFirstDueDate || undefined,
    paymentReceipts: Array.isArray(row.shipping_method?.paymentReceipts)
      ? row.shipping_method.paymentReceipts
      : undefined
  };
}

export function mapCustomerToRow(u: User, passwordHash?: string) {
  return {
    id: u.id,
    name: u.name,
    email: u.email.trim().toLowerCase(),
    avatar: u.avatar || null,
    phone: u.phone || '',
    cpf: u.cpf || '',
    provider: u.provider || 'email',
    ...(passwordHash ? { password_hash: passwordHash } : {}),
    addresses: u.addresses || [],
    is_admin: Boolean(u.isAdmin)
  };
}

export function mapRowToCustomer(row: any): User & { passwordHash?: string } {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar || undefined,
    phone: row.phone || '',
    cpf: row.cpf || '',
    provider: row.provider || 'email',
    addresses: Array.isArray(row.addresses) ? row.addresses : [],
    isAdmin: Boolean(row.is_admin),
    passwordHash: row.password_hash || undefined
  };
}

export function mapCouponToRow(c: Coupon) {
  return {
    code: c.code.trim().toUpperCase(),
    discount_type: c.discountType,
    value: Number(c.value),
    min_order_value: Number(c.minOrderValue ?? 0),
    description: c.description || '',
    active: true
  };
}

export function mapRowToCoupon(row: any): Coupon {
  return {
    code: row.code,
    discountType: row.discount_type,
    value: Number(row.value),
    minOrderValue: Number(row.min_order_value ?? 0),
    description: row.description || ''
  };
}

export function mapReviewToRow(r: Review) {
  return {
    id: r.id,
    product_id: r.productId,
    user_name: r.userName,
    user_avatar: r.userAvatar || null,
    rating: Number(r.rating),
    title: r.title || '',
    comment: r.comment,
    date_label: r.date || 'Hoje',
    verified_purchase: Boolean(r.verifiedPurchase),
    helpful_count: Number(r.helpfulCount ?? 1),
    recommended: r.recommended !== false
  };
}

export function mapRowToReview(row: any): Review {
  return {
    id: row.id,
    productId: row.product_id,
    userName: row.user_name,
    userAvatar: row.user_avatar || undefined,
    rating: Number(row.rating),
    title: row.title || '',
    comment: row.comment,
    date: row.date_label || 'Hoje',
    verifiedPurchase: Boolean(row.verified_purchase),
    helpfulCount: Number(row.helpful_count ?? 1),
    recommended: row.recommended !== false
  };
}

export function mapNotificationToRow(n: PushNotification) {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    timestamp_label: n.timestamp || 'Agora mesmo',
    read: Boolean(n.read),
    discount_code: n.discountCode || null,
    badge: n.badge || 'Novidade'
  };
}

export function mapRowToNotification(row: any): PushNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    timestamp: row.timestamp_label || 'Agora mesmo',
    read: Boolean(row.read),
    discountCode: row.discount_code || undefined,
    badge: row.badge || undefined
  };
}

// =============================================================================
// OPERAÇÕES GENÉRICAS REST POSTGREST SUPABASE
// =============================================================================

export async function supabaseSelectAll<T = any>(
  table: string,
  query = 'select=*'
): Promise<{ ok: boolean; data: T[]; status: number }> {
  try {
    const res = await fetch(`${SUPABASE_REST_URL}/${table}?${query}`, {
      method: 'GET',
      headers: buildHeaders()
    });

    if (!res.ok) {
      return { ok: false, data: [], status: res.status };
    }

    const data = await res.json();
    return { ok: true, data: Array.isArray(data) ? data : [], status: res.status };
  } catch {
    return { ok: false, data: [], status: 0 };
  }
}

export async function supabaseUpsert(
  table: string,
  payload: Record<string, any> | Array<Record<string, any>>,
  onConflict = 'id'
): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_REST_URL}/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
      method: 'POST',
      headers: buildHeaders({
        Prefer: 'resolution=merge-duplicates,return=minimal'
      }),
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function supabasePatch(
  table: string,
  filterQuery: string,
  payload: Record<string, any>
): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_REST_URL}/${table}?${filterQuery}`, {
      method: 'PATCH',
      headers: buildHeaders({
        Prefer: 'return=minimal'
      }),
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function supabaseDelete(
  table: string,
  filterQuery: string
): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_REST_URL}/${table}?${filterQuery}`, {
      method: 'DELETE',
      headers: buildHeaders({
        Prefer: 'return=minimal'
      })
    });
    return res.ok;
  } catch {
    return false;
  }
}

