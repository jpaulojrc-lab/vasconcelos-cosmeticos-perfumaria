export type ProductCategory = 'perfumaria' | 'bodysplash' | 'skincare' | 'maquiagem' | 'combos';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  volume: string;
  benefits: string[];
  notes?: {
    topo?: string;
    coracao?: string;
    fundo?: string;
  };
  actives?: string[];
  stock: number;
  isFlashSale?: boolean;
  soldPercentage?: number;
  isBestSeller?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  recommended?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string[];
  coverImage: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  relatedProductIds: string[];
  tags: string[];
}

export interface Address {
  id: string;
  name: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  cpf?: string;
  provider: 'google' | 'apple' | 'email';
  addresses: Address[];
  isAdmin?: boolean;
  phoneVerified?: boolean;
}

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

export type OrderStatus = 'pendente' | 'pago' | 'separacao' | 'enviado' | 'entregue';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  shippingAddress: Address;
  shippingMethod: {
    name: string;
    price: number;
    days: number;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: OrderStatus;
  installments?: number;
  trackingCode?: string;
  pixCopiaECola?: string;
  adminPaymentTerms?: string;
  adminFirstDueDate?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  description: string;
}

export interface ShippingQuote {
  id: string;
  name: string;
  company: string;
  price: number;
  deliveryDays: number;
  type: 'correios_pac' | 'correios_sedex' | 'transportadora_express';
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  discountCode?: string;
  badge?: string;
}
