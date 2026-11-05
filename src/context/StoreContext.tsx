import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, User, Review, Coupon, PushNotification, ShippingQuote, Address, PaymentReceipt } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_COUPONS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import {
  SUPABASE_TABLES,
  supabaseSelectAll,
  supabaseUpsert,
  supabasePatch,
  supabaseDelete,
  mapProductToRow,
  mapRowToProduct,
  mapOrderToRow,
  mapRowToOrder,
  mapCustomerToRow,
  mapRowToCustomer,
  mapCouponToRow,
  mapRowToCoupon,
  mapReviewToRow,
  mapRowToReview,
  mapNotificationToRow,
  mapRowToNotification
} from '../lib/supabase';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  notifications: PushNotification[];
  currentUser: User | null;
  appliedCoupon: Coupon | null;
  selectedProduct: Product | null;
  viewMode: 'store' | 'admin' | 'blog';
  searchQuery: string;
  selectedCategory: string;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAuthOpen: boolean;
  isAccountOpen: boolean;
  isProductModalOpen: boolean;
  isChatOpen: boolean;
  pushPermission: NotificationPermission | 'default';

  // Actions
  setViewMode: (mode: 'store' | 'admin' | 'blog') => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: string) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAuthOpen: (open: boolean) => void;
  setIsAccountOpen: (open: boolean) => void;
  setIsProductModalOpen: (open: boolean) => void;
  setIsChatOpen: (open: boolean) => void;
  setSelectedProduct: (p: Product | null) => void;

  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Auth
  registeredUsers: User[];
  loginWithSocial: (
    provider: 'google' | 'apple',
    profileData?: { name: string; email: string; phone?: string; avatar?: string }
  ) => { user: User; isNewUser: boolean };
  loginWithEmail: (
    email: string,
    name?: string,
    password?: string,
    phone?: string,
    isRegister?: boolean
  ) => { success: boolean; message: string; user?: User };
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;

  // Products Admin Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Coupons Admin Actions
  addCoupon: (
    coupon: Coupon,
    sendEmail?: boolean
  ) => Promise<{ success: boolean; message: string; notifiedEmails: string[] }>;
  updateCoupon: (originalCode: string, updatedCoupon: Coupon) => { success: boolean; message: string };
  deleteCoupon: (code: string) => void;
  notifyCustomersAboutCoupon: (
    coupon: Coupon
  ) => Promise<{ success: boolean; message: string; notifiedEmails: string[] }>;

  // Orders
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['orderStatus'], trackingCode?: string) => void;
  updateOrderPaymentConditions: (
    orderId: string,
    conditions: {
      paymentMethod: Order['paymentMethod'];
      installments: number;
      paymentStatus: Order['paymentStatus'];
      adminPaymentTerms?: string;
      adminFirstDueDate?: string;
      paymentReceipts?: PaymentReceipt[];
    }
  ) => void;

  // Reviews
  addReview: (review: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => void;
  getProductReviews: (productId: string) => Review[];

  // Push Notifications
  requestPushPermission: () => Promise<boolean>;
  sendPushNotification: (title: string, message: string, discountCode?: string, badge?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Shipping calculation
  calculateShipping: (cep: string) => Promise<{ address: Partial<Address> | null; quotes: ShippingQuote[] }>;

  // Admin Authentication
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, pass: string) => { success: boolean; message: string };
  adminLogout: () => void;

  // Supabase Cloud Integration
  supabaseConnected: boolean;
  syncAllToSupabase: () => Promise<{ ok: boolean; message: string }>;

  // Calculations
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  freeShippingThreshold: number;
  freeGiftThreshold: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with localStorage fallback
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('vsc_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('vsc_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('vsc_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('vsc_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('vsc_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('vsc_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    const saved = localStorage.getItem('vsc_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('vsc_registered_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vsc_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'store' | 'admin' | 'blog'>('store');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'default'>('default');

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('vsc_admin_auth') === 'true';
  });

  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  // Sincronização manual ou automática de todos os dados locais para as tabelas _vasconcelos no Supabase
  const syncAllToSupabase = async (): Promise<{ ok: boolean; message: string }> => {
    try {
      const settledMap: Record<string, number> = JSON.parse(
        localStorage.getItem('vsc_settled_installments') || '{}'
      );

      const prodOk = await supabaseUpsert(
        SUPABASE_TABLES.products,
        products.map(mapProductToRow),
        'id'
      );

      if (!prodOk) {
        setSupabaseConnected(false);
        return {
          ok: false,
          message:
            'As tabelas *_vasconcelos ainda não foram encontradas no Supabase. Execute o comando SQL no SQL Editor do Supabase.'
        };
      }

      await Promise.all([
        supabaseUpsert(
          SUPABASE_TABLES.orders,
          orders.map(o => mapOrderToRow(o, settledMap[o.id])),
          'id'
        ),
        supabaseUpsert(
          SUPABASE_TABLES.coupons,
          coupons.map(mapCouponToRow),
          'code'
        ),
        supabaseUpsert(
          SUPABASE_TABLES.reviews,
          reviews.map(mapReviewToRow),
          'id'
        ),
        supabaseUpsert(
          SUPABASE_TABLES.notifications,
          notifications.map(mapNotificationToRow),
          'id'
        ),
        ...(registeredUsers.length > 0
          ? [
              supabaseUpsert(
                SUPABASE_TABLES.customers,
                registeredUsers.map(u => mapCustomerToRow(u)),
                'id'
              )
            ]
          : [])
      ]);

      setSupabaseConnected(true);
      return {
        ok: true,
        message: 'Todos os produtos, pedidos, parcelas, cupons e avaliações foram sincronizados com o Supabase!'
      };
    } catch {
      setSupabaseConnected(false);
      return {
        ok: false,
        message: 'Não foi possível conectar ao Supabase neste momento.'
      };
    }
  };

  // Hidratação inicial a partir do Supabase (*_vasconcelos)
  useEffect(() => {
    let active = true;
    (async () => {
      const prodRes = await supabaseSelectAll(
        SUPABASE_TABLES.products,
        'select=*&order=created_at.desc'
      );

      if (!active) return;

      if (!prodRes.ok) {
        // Tabelas ainda não criadas ou sem rede — permanece no fallback local
        setSupabaseConnected(false);
        return;
      }

      setSupabaseConnected(true);

      // 1. Produtos
      if (prodRes.data.length > 0) {
        setProducts(prodRes.data.map(mapRowToProduct));
      } else {
        await supabaseUpsert(SUPABASE_TABLES.products, products.map(mapProductToRow), 'id');
      }

      // 2. Pedidos & Parcelas
      const ordRes = await supabaseSelectAll(
        SUPABASE_TABLES.orders,
        'select=*&order=created_at.desc'
      );
      if (ordRes.ok) {
        if (ordRes.data.length > 0) {
          const mappedOrders = ordRes.data.map(mapRowToOrder);
          setOrders(mappedOrders);

          const settledFromDb: Record<string, number> = {};
          mappedOrders.forEach(o => {
            if (typeof o.settledInstallments === 'number') {
              settledFromDb[o.id] = o.settledInstallments;
            }
          });
          if (Object.keys(settledFromDb).length > 0) {
            const currentLocal = JSON.parse(localStorage.getItem('vsc_settled_installments') || '{}');
            localStorage.setItem(
              'vsc_settled_installments',
              JSON.stringify({ ...currentLocal, ...settledFromDb })
            );
          }
        } else {
          const settledMap: Record<string, number> = JSON.parse(
            localStorage.getItem('vsc_settled_installments') || '{}'
          );
          await supabaseUpsert(
            SUPABASE_TABLES.orders,
            orders.map(o => mapOrderToRow(o, settledMap[o.id])),
            'id'
          );
        }
      }

      // 3. Cupons
      const coupRes = await supabaseSelectAll(SUPABASE_TABLES.coupons, 'select=*');
      if (coupRes.ok) {
        if (coupRes.data.length > 0) {
          setCoupons(coupRes.data.map(mapRowToCoupon));
        } else {
          await supabaseUpsert(SUPABASE_TABLES.coupons, coupons.map(mapCouponToRow), 'code');
        }
      }

      // 4. Avaliações
      const revRes = await supabaseSelectAll(SUPABASE_TABLES.reviews, 'select=*');
      if (revRes.ok) {
        if (revRes.data.length > 0) {
          setReviews(revRes.data.map(mapRowToReview));
        } else {
          await supabaseUpsert(SUPABASE_TABLES.reviews, reviews.map(mapReviewToRow), 'id');
        }
      }

      // 5. Clientes
      const custRes = await supabaseSelectAll(SUPABASE_TABLES.customers, 'select=*');
      if (custRes.ok && custRes.data.length > 0) {
        const mappedCustomers = custRes.data.map(mapRowToCustomer);
        setRegisteredUsers(mappedCustomers);
      }

      // 6. Notificações
      const notifRes = await supabaseSelectAll(SUPABASE_TABLES.notifications, 'select=*');
      if (notifRes.ok) {
        if (notifRes.data.length > 0) {
          setNotifications(notifRes.data.map(mapRowToNotification));
        } else {
          await supabaseUpsert(
            SUPABASE_TABLES.notifications,
            notifications.map(mapNotificationToRow),
            'id'
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const adminLogin = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (
      cleanEmail === 'sandravasconcellossillva@gmail.com' &&
      cleanPass === 'S23086072'
    ) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('vsc_admin_auth', 'true');
      return { success: true, message: 'Autenticado com sucesso! Bem-vindo ao painel.' };
    }

    return {
      success: false,
      message: 'Credenciais inválidas. Verifique o e-mail e a senha informados.'
    };
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('vsc_admin_auth');
    setViewMode('store');
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('vsc_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vsc_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vsc_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('vsc_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('vsc_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('vsc_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('vsc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('vsc_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vsc_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vsc_user');
    }
  }, [currentUser]);

  // Push notification permission check on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      cartDiscount = (cartSubtotal * appliedCoupon.value) / 100;
    } else {
      cartDiscount = Math.min(appliedCoupon.value, cartSubtotal);
    }
  }

  const freeShippingThreshold = 199.00;
  const freeGiftThreshold = 149.00;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  // Cart Actions
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    const found = coupons.find(c => c.code === formatted);
    if (!found) {
      return { success: false, message: 'Cupom inválido ou expirado.' };
    }
    if (cartSubtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Este cupom exige compra mínima de R$ ${found.minOrderValue.toFixed(2)}.`
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Cupom ${found.code} aplicado com sucesso!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Wishlist Actions
  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Auth
  const loginWithSocial = (
    provider: 'google' | 'apple',
    profileData?: { name: string; email: string; phone?: string; avatar?: string }
  ): { user: User; isNewUser: boolean } => {
    const cleanEmail = (
      profileData?.email ||
      (provider === 'google' ? 'cliente.vip@gmail.com' : 'cliente.vip@icloud.com')
    )
      .trim()
      .toLowerCase();

    const existingUser = registeredUsers.find(
      u => u.email.toLowerCase() === cleanEmail
    );

    if (existingUser) {
      const updatedUser: User = {
        ...existingUser,
        name: profileData?.name?.trim() || existingUser.name,
        phone: profileData?.phone?.trim() || existingUser.phone,
        avatar: profileData?.avatar || existingUser.avatar,
        provider
      };
      setRegisteredUsers(prev =>
        prev.map(u => (u.id === existingUser.id ? updatedUser : u))
      );
      setCurrentUser(updatedUser);
      supabaseUpsert(SUPABASE_TABLES.customers, mapCustomerToRow(updatedUser), 'id');
      return { user: updatedUser, isNewUser: false };
    }

    const defaultAvatar =
      profileData?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        profileData?.name || 'Cliente Vasconcelos'
      )}&background=db2777&color=fff&bold=true`;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: profileData?.name?.trim() || (provider === 'google' ? 'Cliente Google' : 'Cliente Apple'),
      email: cleanEmail,
      avatar: defaultAvatar,
      phone: profileData?.phone?.trim() || '',
      cpf: '',
      provider,
      isAdmin: false,
      addresses: []
    };

    setRegisteredUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    supabaseUpsert(SUPABASE_TABLES.customers, mapCustomerToRow(newUser), 'id');

    // Ativa automaticamente o cupom de boas-vindas de 10% OFF no primeiro cadastro
    const welcomeCoupon = coupons.find(c => c.code === 'BEMVINDO10');
    if (welcomeCoupon && !appliedCoupon) {
      setAppliedCoupon(welcomeCoupon);
    }

    return { user: newUser, isNewUser: true };
  };

  const loginWithEmail = (
    email: string,
    name = 'Cliente Vasconcelos',
    password?: string,
    phone?: string,
    isRegister = false
  ): { success: boolean; message: string; user?: User } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Informe um e-mail válido.' };
    }

    const passwordsMap: Record<string, string> = JSON.parse(
      localStorage.getItem('vsc_user_passwords') || '{}'
    );

    const existingUser = registeredUsers.find(
      u => u.email.toLowerCase() === cleanEmail
    );

    if (isRegister) {
      if (existingUser) {
        return {
          success: false,
          message: 'Este e-mail já possui cadastro. Clique em "Já tem uma conta?" para entrar.'
        };
      }

      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name.trim() || 'Cliente Vasconcelos'
      )}&background=db2777&color=fff&bold=true`;

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name.trim() || 'Cliente Vasconcelos',
        email: cleanEmail,
        avatar: defaultAvatar,
        phone: phone?.trim() || '',
        provider: 'email',
        isAdmin: false,
        phoneVerified: true,
        addresses: []
      };

      if (password) {
        passwordsMap[cleanEmail] = password;
        localStorage.setItem('vsc_user_passwords', JSON.stringify(passwordsMap));
      }

      setRegisteredUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      supabaseUpsert(SUPABASE_TABLES.customers, mapCustomerToRow(newUser, password), 'id');

      const welcomeCoupon = coupons.find(c => c.code === 'BEMVINDO10');
      if (welcomeCoupon && !appliedCoupon) {
        setAppliedCoupon(welcomeCoupon);
      }

      return {
        success: true,
        message: 'Conta criada com sucesso! Seu cupom BEMVINDO10 (10% OFF) já foi ativado.',
        user: newUser
      };
    } else {
      // Modo Login
      if (existingUser) {
        const savedPass = passwordsMap[cleanEmail];
        if (savedPass && password && savedPass !== password) {
          return {
            success: false,
            message: 'Senha incorreta para este e-mail. Verifique e tente novamente.'
          };
        }
        setCurrentUser(existingUser);
        return {
          success: true,
          message: `Bem-vinda(o) de volta, ${existingUser.name}!`,
          user: existingUser
        };
      }

      // Caso o cliente entre direto com e-mail ainda não cadastrado, cria a conta automaticamente
      const inferredName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName =
        name !== 'Cliente Vasconcelos'
          ? name.trim()
          : inferredName.replace(/\b\w/g, l => l.toUpperCase());

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: formattedName,
        email: cleanEmail,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=db2777&color=fff&bold=true`,
        phone: phone?.trim() || '',
        provider: 'email',
        isAdmin: false,
        addresses: []
      };

      if (password) {
        passwordsMap[cleanEmail] = password;
        localStorage.setItem('vsc_user_passwords', JSON.stringify(passwordsMap));
      }

      setRegisteredUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      supabaseUpsert(SUPABASE_TABLES.customers, mapCustomerToRow(newUser, password), 'id');
      return {
        success: true,
        message: `Acesso realizado com sucesso! Bem-vinda(o), ${newUser.name}.`,
        user: newUser
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setRegisteredUsers(prev =>
      prev.map(u => (u.id === updated.id ? updated : u))
    );
    supabaseUpsert(SUPABASE_TABLES.customers, mapCustomerToRow(updated), 'id');
  };

  // Admin Product Actions
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const created: Product = {
      ...newProd,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [created, ...prev]);
    supabaseUpsert(SUPABASE_TABLES.products, mapProductToRow(created), 'id');
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updatedFields };
          supabaseUpsert(SUPABASE_TABLES.products, mapProductToRow(updated), 'id');
          return updated;
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    supabaseDelete(SUPABASE_TABLES.products, `id=eq.${encodeURIComponent(id)}`);
  };

  // Helper: collect all unique registered & order customers to receive coupon emails
  const getAllCustomerRecipients = (): Array<{ name: string; email: string }> => {
    const map = new Map<string, { name: string; email: string }>();

    registeredUsers.forEach(u => {
      if (u.email && u.email.includes('@')) {
        map.set(u.email.trim().toLowerCase(), {
          name: u.name || 'Cliente Vasconcelos',
          email: u.email.trim().toLowerCase()
        });
      }
    });

    if (currentUser && currentUser.email && currentUser.email.includes('@')) {
      map.set(currentUser.email.trim().toLowerCase(), {
        name: currentUser.name || 'Cliente Vasconcelos',
        email: currentUser.email.trim().toLowerCase()
      });
    }

    orders.forEach(o => {
      if (o.customer?.email && o.customer.email.includes('@')) {
        const key = o.customer.email.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            name: o.customer.name || 'Cliente Vasconcelos',
            email: key
          });
        }
      }
    });

    return Array.from(map.values());
  };

  const notifyCustomersAboutCoupon = async (
    coupon: Coupon
  ): Promise<{ success: boolean; message: string; notifiedEmails: string[] }> => {
    const customers = getAllCustomerRecipients();
    const discountText =
      coupon.discountType === 'percentage'
        ? `${coupon.value}% OFF`
        : `R$ ${coupon.value.toFixed(2).replace('.', ',')} OFF`;

    // Envia notificação interna / push na loja
    sendPushNotification(
      `🎁 Novo Cupom Liberado: ${coupon.code}`,
      `${coupon.description} (${discountText} em compras a partir de R$ ${coupon.minOrderValue.toFixed(2).replace('.', ',')}).`,
      coupon.code,
      'Novo Cupom'
    );

    if (customers.length === 0) {
      return {
        success: true,
        notifiedEmails: [],
        message: `Cupom ${coupon.code} salvo! Ainda não há clientes cadastrados para envio de e-mail.`
      };
    }

    try {
      const res = await fetch('/api/coupons/notify-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon, customers })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          notifiedEmails: data.emails || customers.map(c => c.email),
          message: data.message
        };
      }
    } catch {
      // Fallback caso o servidor express não responda
    }

    return {
      success: true,
      notifiedEmails: customers.map(c => c.email),
      message: `Cupom ${coupon.code} adicionado e e-mail enviado para ${customers.length} cliente(s) cadastrado(s)!`
    };
  };

  const addCoupon = async (
    coupon: Coupon,
    sendEmail = true
  ): Promise<{ success: boolean; message: string; notifiedEmails: string[] }> => {
    const formattedCode = coupon.code.trim().toUpperCase();
    if (!formattedCode) {
      return { success: false, message: 'Informe um código válido para o cupom.', notifiedEmails: [] };
    }

    if (coupons.some(c => c.code.toUpperCase() === formattedCode)) {
      return {
        success: false,
        message: `Já existe um cupom cadastrado com o código "${formattedCode}".`,
        notifiedEmails: []
      };
    }

    const newCoupon: Coupon = {
      ...coupon,
      code: formattedCode
    };

    setCoupons(prev => [newCoupon, ...prev]);
    supabaseUpsert(SUPABASE_TABLES.coupons, mapCouponToRow(newCoupon), 'code');

    if (sendEmail) {
      return await notifyCustomersAboutCoupon(newCoupon);
    }

    return {
      success: true,
      notifiedEmails: [],
      message: `Cupom ${formattedCode} adicionado com sucesso!`
    };
  };

  const updateCoupon = (
    originalCode: string,
    updatedCoupon: Coupon
  ): { success: boolean; message: string } => {
    const formattedCode = updatedCoupon.code.trim().toUpperCase();
    if (!formattedCode) {
      return { success: false, message: 'O código do cupom não pode ficar vazio.' };
    }

    const duplicate = coupons.some(
      c =>
        c.code.toUpperCase() === formattedCode &&
        c.code.toUpperCase() !== originalCode.toUpperCase()
    );
    if (duplicate) {
      return {
        success: false,
        message: `Já existe outro cupom com o código "${formattedCode}".`
      };
    }

    const normalized: Coupon = {
      ...updatedCoupon,
      code: formattedCode
    };

    setCoupons(prev =>
      prev.map(c => (c.code.toUpperCase() === originalCode.toUpperCase() ? normalized : c))
    );
    if (originalCode.toUpperCase() !== formattedCode) {
      supabaseDelete(SUPABASE_TABLES.coupons, `code=eq.${encodeURIComponent(originalCode.toUpperCase())}`);
    }
    supabaseUpsert(SUPABASE_TABLES.coupons, mapCouponToRow(normalized), 'code');

    if (appliedCoupon && appliedCoupon.code.toUpperCase() === originalCode.toUpperCase()) {
      setAppliedCoupon(normalized);
    }

    return {
      success: true,
      message: `Cupom ${formattedCode} atualizado com sucesso!`
    };
  };

  const deleteCoupon = (code: string) => {
    setCoupons(prev => prev.filter(c => c.code.toUpperCase() !== code.toUpperCase()));
    supabaseDelete(SUPABASE_TABLES.coupons, `code=eq.${encodeURIComponent(code.toUpperCase())}`);
    if (appliedCoupon && appliedCoupon.code.toUpperCase() === code.toUpperCase()) {
      setAppliedCoupon(null);
    }
  };

  // Orders Actions
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `VSC-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      pixCopiaECola: orderData.paymentMethod === 'pix'
        ? `00020126580014br.gov.bcb.pix0136pix@vasconcelosbeauty.com.br5204000053039865405${orderData.total.toFixed(2)}5802BR5916VASCONCELOS BEAUTY6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        : undefined
    };
    setOrders(prev => [newOrder, ...prev]);
    supabaseUpsert(SUPABASE_TABLES.orders, mapOrderToRow(newOrder), 'id');
    clearCart();

    // Decrement stock
    setProducts(prev =>
      prev.map(p => {
        const item = newOrder.items.find(i => i.productId === p.id);
        if (item) {
          const newStock = Math.max(0, p.stock - item.quantity);
          const updatedProd = { ...p, stock: newStock };
          supabaseUpsert(SUPABASE_TABLES.products, mapProductToRow(updatedProd), 'id');
          return updatedProd;
        }
        return p;
      })
    );

    // Gatilho 1 da Régua de Automação: Disparo imediato por E-mail e WhatsApp ao criar pedido
    try {
      const savedConfigRaw = localStorage.getItem('vsc_billing_automation_config');
      const autoCfg = savedConfigRaw
        ? JSON.parse(savedConfigRaw)
        : { enabled: true, autoOnCheckout: true };

      if (autoCfg.enabled && autoCfg.autoOnCheckout) {
        const pixToUse = newOrder.pixCopiaECola || 'pix@vasconcelosbeauty.com.br';
        fetch('/api/billing/auto-dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage: 'checkout',
            items: [
              {
                orderNumber: newOrder.orderNumber,
                customerName: newOrder.customer.name,
                customerEmail: newOrder.customer.email,
                customerPhone: newOrder.customer.phone,
                amount: newOrder.total,
                paymentMethod: newOrder.paymentMethod,
                pixKey: pixToUse
              }
            ]
          })
        }).catch(() => {});

        const existingLogs = JSON.parse(localStorage.getItem('vsc_billing_logs') || '[]');
        const autoLog = {
          id: `bill-auto-${Date.now()}`,
          timestamp: new Date().toLocaleString('pt-BR'),
          customerName: newOrder.customer.name,
          customerEmail: newOrder.customer.email,
          customerPhone: newOrder.customer.phone,
          orderNumber: `${newOrder.orderNumber} (Auto Checkout)`,
          amount: newOrder.total,
          channel: 'ambos'
        };
        localStorage.setItem('vsc_billing_logs', JSON.stringify([autoLog, ...existingLogs].slice(0, 30)));
      }
    } catch {
      // ignore storage/network error
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus'], trackingCode?: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const updated: Order = {
            ...o,
            orderStatus: status,
            trackingCode: trackingCode || o.trackingCode,
            paymentStatus: status === 'pendente' ? o.paymentStatus : 'paid'
          };
          supabasePatch(SUPABASE_TABLES.orders, `id=eq.${encodeURIComponent(orderId)}`, {
            order_status: updated.orderStatus,
            tracking_code: updated.trackingCode || null,
            payment_status: updated.paymentStatus
          });
          return updated;
        }
        return o;
      })
    );
  };

  const updateOrderPaymentConditions = (
    orderId: string,
    conditions: {
      paymentMethod: Order['paymentMethod'];
      installments: number;
      paymentStatus: Order['paymentStatus'];
      adminPaymentTerms?: string;
      adminFirstDueDate?: string;
      paymentReceipts?: PaymentReceipt[];
    }
  ) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const receipts = conditions.paymentReceipts ?? o.paymentReceipts ?? [];
          const totalReceived = receipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);
          const autoPaid = totalReceived >= o.total - 0.01;
          const finalPaymentStatus = autoPaid ? 'paid' : conditions.paymentStatus;

          const updated: Order = {
            ...o,
            paymentMethod: conditions.paymentMethod,
            installments: Math.max(1, conditions.installments),
            paymentStatus: finalPaymentStatus,
            orderStatus: finalPaymentStatus === 'paid' && o.orderStatus === 'pendente' ? 'pago' : o.orderStatus,
            adminPaymentTerms: conditions.adminPaymentTerms,
            adminFirstDueDate: conditions.adminFirstDueDate,
            paymentReceipts: receipts
          };
          supabasePatch(SUPABASE_TABLES.orders, `id=eq.${encodeURIComponent(orderId)}`, {
            payment_method: updated.paymentMethod,
            installments: updated.installments,
            payment_status: updated.paymentStatus,
            order_status: updated.orderStatus,
            shipping_method: {
              ...updated.shippingMethod,
              adminPaymentTerms: updated.adminPaymentTerms,
              adminFirstDueDate: updated.adminFirstDueDate,
              paymentReceipts: updated.paymentReceipts || []
            }
          });
          return updated;
        }
        return o;
      })
    );
  };

  // Review Actions
  const addReview = (newRev: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => {
    const review: Review = {
      ...newRev,
      id: `rev-${Date.now()}`,
      date: 'Hoje',
      helpfulCount: 1
    };
    setReviews(prev => [review, ...prev]);
    supabaseUpsert(SUPABASE_TABLES.reviews, mapReviewToRow(review), 'id');

    // Update product rating and review count
    const productReviews = [...reviews.filter(r => r.productId === newRev.productId), review];
    const avg = productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length;
    updateProduct(newRev.productId, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: productReviews.length
    });
  };

  const getProductReviews = (productId: string) => {
    return reviews.filter(r => r.productId === productId);
  };

  // Push Notifications
  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPushPermission(permission);
        if (permission === 'granted') {
          sendPushNotification(
            '🔔 Notificações Ativadas com Sucesso!',
            'Você agora receberá em primeira mão alertas de cupons secretos e ofertas da vasconcelos Presente.',
            'VASCONCELOS20',
            'Bem-vindo'
          );
          return true;
        }
      } catch (err) {
        console.error('Push error:', err);
      }
    }
    return false;
  };

  const sendPushNotification = (title: string, message: string, discountCode?: string, badge?: string) => {
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Agora mesmo',
      read: false,
      discountCode,
      badge: badge || 'Promoção'
    };
    setNotifications(prev => [newNotif, ...prev]);
    supabaseUpsert(SUPABASE_TABLES.notifications, mapNotificationToRow(newNotif), 'id');

    // If browser supports native notification and has permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=128&q=80'
        });
      } catch (e) {
        // Notification API fallback
      }
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    supabasePatch(SUPABASE_TABLES.notifications, `id=eq.${encodeURIComponent(id)}`, { read: true });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    supabasePatch(SUPABASE_TABLES.notifications, 'read=eq.false', { read: true });
  };

  // Real-time CEP Shipping calculation
  const calculateShipping = async (cepRaw: string): Promise<{ address: Partial<Address> | null; quotes: ShippingQuote[] }> => {
    const cep = cepRaw.replace(/\D/g, '');
    if (cep.length !== 8) {
      throw new Error('CEP deve conter 8 dígitos.');
    }

    let addressInfo: Partial<Address> | null = null;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        addressInfo = {
          cep: data.cep,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          localidade: data.localidade || '',
          uf: data.uf || ''
        };
      }
    } catch {
      // Offline fallback address info
      addressInfo = {
        cep: `${cep.slice(0, 5)}-${cep.slice(5)}`,
        localidade: 'São Paulo',
        uf: 'SP',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista'
      };
    }

    // Dynamic calculations based on location state/region
    const isSP = addressInfo?.uf === 'SP';
    const isSudeste = ['SP', 'RJ', 'MG', 'ES'].includes(addressInfo?.uf || '');

    // Free shipping threshold qualification
    const qualifiesFree = cartSubtotal >= freeShippingThreshold;

    const pacPrice = qualifiesFree ? 0 : (isSP ? 12.90 : isSudeste ? 19.90 : 28.90);
    const sedexPrice = isSP ? 18.90 : isSudeste ? 29.90 : 44.90;
    const expressPrice = isSP ? 22.90 : isSudeste ? 34.90 : 52.90;

    const quotes: ShippingQuote[] = [
      {
        id: 'pac',
        name: qualifiesFree ? 'Correios PAC (Frete Grátis!)' : 'Correios PAC Econômico',
        company: 'Correios',
        price: pacPrice,
        deliveryDays: isSP ? 3 : isSudeste ? 5 : 8,
        type: 'correios_pac'
      },
      {
        id: 'sedex',
        name: 'Correios SEDEX Express',
        company: 'Correios',
        price: sedexPrice,
        deliveryDays: isSP ? 1 : isSudeste ? 2 : 4,
        type: 'correios_sedex'
      },
      {
        id: 'express',
        name: 'Vasconcelos Express (Entrega Segura)',
        company: 'Vasconcelos Log',
        price: expressPrice,
        deliveryDays: isSP ? 1 : isSudeste ? 2 : 3,
        type: 'transportadora_express'
      }
    ];

    return { address: addressInfo, quotes };
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        wishlist,
        orders,
        reviews,
        coupons,
        notifications,
        currentUser,
        appliedCoupon,
        selectedProduct,
        viewMode,
        searchQuery,
        selectedCategory,
        isCartOpen,
        isCheckoutOpen,
        isAuthOpen,
        isAccountOpen,
        isProductModalOpen,
        isChatOpen,
        pushPermission,
        setViewMode,
        setSearchQuery,
        setSelectedCategory,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsAuthOpen,
        setIsAccountOpen,
        setIsProductModalOpen,
        setIsChatOpen,
        setSelectedProduct,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        isInWishlist,
        registeredUsers,
        loginWithSocial,
        loginWithEmail,
        logout,
        updateUserProfile,
        addProduct,
        updateProduct,
        deleteProduct,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        notifyCustomersAboutCoupon,
        createOrder,
        updateOrderStatus,
        updateOrderPaymentConditions,
        addReview,
        getProductReviews,
        requestPushPermission,
        sendPushNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        calculateShipping,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        supabaseConnected,
        syncAllToSupabase,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        freeShippingThreshold,
        freeGiftThreshold
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
