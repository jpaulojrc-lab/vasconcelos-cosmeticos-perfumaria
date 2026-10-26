import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, User, Review, Coupon, PushNotification, ShippingQuote, Address } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_COUPONS, INITIAL_NOTIFICATIONS } from '../data/mockData';

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
  loginWithSocial: (provider: 'google' | 'apple') => void;
  loginWithEmail: (email: string, name?: string) => void;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  
  // Products Admin Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Orders
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['orderStatus'], trackingCode?: string) => void;
  
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

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vsc_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-default',
      name: 'Isabela Vasconcelos',
      email: 'isabela.vasconcelos@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      phone: '(11) 99876-5432',
      cpf: '432.189.902-12',
      provider: 'google',
      isAdmin: true,
      addresses: [
        {
          id: 'addr-main',
          name: 'Principal',
          cep: '01415-000',
          logradouro: 'Alameda Santos',
          numero: '1800',
          complemento: 'Conjunto 14',
          bairro: 'Cerqueira César',
          localidade: 'São Paulo',
          uf: 'SP',
          isDefault: true
        }
      ]
    };
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

  const adminLogin = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Valid credentials:
    // User / Password combinations accepted
    if (
      (cleanEmail === 'admin@vasconcelos.com.br' || cleanEmail === 'admin' || cleanEmail === 'jpaulojrc@gmail.com') &&
      (cleanPass === 'admin123' || cleanPass === 'vasconcelos' || cleanPass === 'admin')
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
  const loginWithSocial = (provider: 'google' | 'apple') => {
    const mockUser: User = {
      id: `usr-${Date.now()}`,
      name: provider === 'google' ? 'Juliana Vasconcelos' : 'Beatriz Vasconcelos',
      email: provider === 'google' ? 'juliana.vasconcelos@gmail.com' : 'beatriz@icloud.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      phone: '(11) 98765-4321',
      cpf: '345.678.901-23',
      provider,
      isAdmin: true,
      addresses: [
        {
          id: 'addr-social',
          name: 'Residência',
          cep: '04538-132',
          logradouro: 'Avenida Brigadeiro Faria Lima',
          numero: '3477',
          complemento: '12º andar',
          bairro: 'Itaim Bibi',
          localidade: 'São Paulo',
          uf: 'SP',
          isDefault: true
        }
      ]
    };
    setCurrentUser(mockUser);
    setIsAuthOpen(false);
  };

  const loginWithEmail = (email: string, name = 'Cliente Vasconcelos') => {
    const mockUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      provider: 'email',
      isAdmin: false,
      addresses: []
    };
    setCurrentUser(mockUser);
    setIsAuthOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, ...data });
  };

  // Admin Product Actions
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const created: Product = {
      ...newProd,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [created, ...prev]);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
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
    clearCart();
    
    // Decrement stock
    setProducts(prev =>
      prev.map(p => {
        const item = newOrder.items.find(i => i.productId === p.id);
        if (item) {
          const newStock = Math.max(0, p.stock - item.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus'], trackingCode?: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: status,
              trackingCode: trackingCode || o.trackingCode,
              paymentStatus: status === 'pendente' ? o.paymentStatus : 'paid'
            }
          : o
      )
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
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
        loginWithSocial,
        loginWithEmail,
        logout,
        updateUserProfile,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
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
