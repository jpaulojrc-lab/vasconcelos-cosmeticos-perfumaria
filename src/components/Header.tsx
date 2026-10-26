import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Bell, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Menu, 
  ChevronRight,
  Truck,
  CreditCard,
  Percent,
  Lock,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { formatBRL } from '../utils/formatters';

export const Header: React.FC = () => {
  const { 
    cart, 
    wishlist, 
    notifications, 
    currentUser, 
    viewMode, 
    setViewMode, 
    setIsCartOpen, 
    setIsAuthOpen, 
    setIsAccountOpen, 
    setSelectedCategory,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    products,
    setSelectedProduct,
    setIsProductModalOpen,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    isAdminAuthenticated
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  // Filtered search preview
  const searchResults = searchQuery.trim().length > 1
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside notification dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setViewMode('store');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const handleOpenProduct = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs">
      {/* Top Banner with Luxury Gold & Rose Styling */}
      <div className="bg-gradient-to-r from-neutral-900 via-stone-900 to-black text-amber-100/90 text-xs font-semibold py-2 px-4 border-b border-amber-500/20 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center space-x-6 text-[11px] tracking-wider uppercase mx-auto">
            <span className="flex items-center gap-1.5 hover:text-white transition">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              FRETE GRÁTIS ACIMA DE R$ 199
            </span>
            <span className="text-amber-500/60">•</span>
            <span className="flex items-center gap-1.5 hover:text-white transition">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              ATÉ 10X SEM JUROS
            </span>
            <span className="text-amber-500/60">•</span>
            <span className="flex items-center gap-1.5 hover:text-white transition">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              AMOSTRA DE ALTA PERFUMARIA EM TODOS OS PEDIDOS
            </span>
            <span className="text-amber-500/60">•</span>
            <span className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-rose-400" />
              CUPOM 10% OFF: <strong className="bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded text-amber-200 tracking-widest">BEMVINDO10</strong>
            </span>
          </div>

          {/* Mobile version ticker */}
          <div className="md:hidden flex items-center justify-center w-full text-[11px] font-bold tracking-wide">
            <span className="flex items-center gap-1 text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              VASCONCELOS PRESENTE: ALTA FIXAÇÃO + ATÉ 10X SEM JUROS
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          
          {/* Mobile menu trigger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-neutral-700 hover:text-rose-600 md:hidden transition cursor-pointer"
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo "vasconcelos Presente" */}
            <button
              onClick={() => {
                setViewMode('store');
                setSelectedCategory('todos');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left group flex items-baseline focus:outline-hidden cursor-pointer"
            >
              <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-neutral-900 group-hover:text-rose-600 transition font-display">
                vasconcelos <span className="text-rose-600 font-serif-luxury italic font-normal">Presente</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block ml-1 animate-pulse" />
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-300/60 px-2 py-0.5 rounded-full">
                Alta Perfumaria & Luxo
              </span>
            </button>
          </div>

          {/* Search bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar perfume, body splash, skincare, presentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF8F5] focus:bg-white text-sm text-neutral-900 pl-10 pr-10 py-2.5 rounded-full border border-neutral-300/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50 transition outline-hidden"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Dropdown Autocomplete */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-amber-200/60 overflow-hidden z-50">
                <div className="p-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-50 border-b border-neutral-100">
                  Resultados sugeridos ({searchResults.length})
                </div>
                <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleOpenProduct(product)}
                      className="w-full text-left p-3 flex items-center gap-3 hover:bg-amber-50/60 transition group cursor-pointer"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-neutral-200 group-hover:scale-105 transition"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-rose-600">
                          {product.name}
                        </p>
                        <p className="text-xs text-neutral-500 truncate font-light">{product.subtitle}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold text-neutral-900 font-display">{formatBRL(product.price)}</span>
                          <span className="text-xs text-neutral-400 line-through">{formatBRL(product.originalPrice)}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-rose-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action icons & buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search trigger (Mobile) */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-neutral-700 hover:text-rose-600 lg:hidden rounded-full hover:bg-neutral-100 transition cursor-pointer"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Dashboard Switch */}
            <button
              onClick={() => setViewMode(viewMode === 'admin' ? 'store' : 'admin')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                viewMode === 'admin'
                  ? 'bg-neutral-900 text-white ring-2 ring-amber-400'
                  : isAdminAuthenticated
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
              }`}
              title={isAdminAuthenticated ? "Painel Admin Autenticado" : "Acesso Restrito ao Painel Admin"}
            >
              {isAdminAuthenticated ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-neutral-500" />
              )}
              <span className="hidden sm:inline">
                {viewMode === 'admin' ? 'Voltar à Loja' : isAdminAuthenticated ? 'Painel Admin' : 'Admin'}
              </span>
              <span className="sm:hidden">{viewMode === 'admin' ? 'Loja' : 'Admin'}</span>
            </button>

            {/* Notifications Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="p-2 text-neutral-700 hover:text-rose-600 rounded-full hover:bg-neutral-100 transition relative cursor-pointer"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Alertas & Lançamentos
                    </span>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-neutral-500 font-light">
                        Nenhuma notificação no momento.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-3.5 hover:bg-amber-50/40 transition cursor-pointer text-left ${
                            !notif.read ? 'bg-amber-50/25' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {notif.badge || 'Lançamento'}
                            </span>
                            <span className="text-[10px] text-neutral-400">{notif.timestamp}</span>
                          </div>
                          <p className="text-xs font-bold text-neutral-900">{notif.title}</p>
                          <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed font-light">{notif.message}</p>
                          {notif.discountCode && (
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-neutral-900 text-white text-[11px] font-mono px-2 py-0.5 rounded-md">
                              Cupom: <strong>{notif.discountCode}</strong>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => {
                if (currentUser) {
                  setIsAccountOpen(true);
                } else {
                  setIsAuthOpen(true);
                }
              }}
              className="p-2 text-neutral-700 hover:text-rose-600 rounded-full hover:bg-neutral-100 transition relative hidden sm:block cursor-pointer"
              aria-label="Lista de Desejos"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Customer User Account */}
            <button
              onClick={() => {
                if (currentUser) {
                  setIsAccountOpen(true);
                } else {
                  setIsAuthOpen(true);
                }
              }}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-neutral-100 transition text-neutral-700 hover:text-rose-600 cursor-pointer"
              aria-label="Minha Conta"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-xs">
                  {currentUser ? currentUser.name.charAt(0) : <UserIcon className="w-4 h-4" />}
                </div>
              )}
              {currentUser && (
                <span className="text-xs font-semibold hidden md:inline truncate max-w-[100px]">
                  {currentUser.name.split(' ')[0]}
                </span>
              )}
            </button>

            {/* Cart Bag trigger with animated bounce counter */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="bg-neutral-900 hover:bg-rose-600 text-white pl-3.5 pr-4.5 py-2.5 rounded-full flex items-center gap-2.5 text-xs font-bold transition duration-300 shadow-md hover:shadow-rose-600/20 cursor-pointer"
              aria-label="Abrir Sacola de Compras"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {totalCartItems > 0 && (
                  <motion.span
                    key={totalCartItems}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: [1.25, 1] }}
                    transition={{ duration: 0.25 }}
                    className="absolute -top-2 -right-2.5 bg-rose-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs"
                  >
                    {totalCartItems}
                  </motion.span>
                )}
              </div>
              <span className="hidden sm:inline tracking-wide uppercase font-semibold">Sacola</span>
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Input Drawer (When toggled) */}
        {isSearchOpen && (
          <div className="py-2 pb-3 lg:hidden border-t border-neutral-100">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar produtos vasconcelos presente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-100 text-sm text-neutral-900 pl-10 pr-10 py-2.5 rounded-full border border-neutral-200 focus:border-amber-500 outline-hidden"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-neutral-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden divide-y divide-neutral-100 max-h-60 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleOpenProduct(product)}
                    className="w-full text-left p-2.5 flex items-center gap-3 hover:bg-amber-50/50 cursor-pointer"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">{product.name}</p>
                      <p className="text-xs text-rose-600 font-semibold">{formatBRL(product.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center justify-center space-x-8 py-3 border-t border-neutral-100 text-xs font-bold uppercase tracking-wider text-neutral-700">
          <button
            onClick={() => handleSelectCategory('todos')}
            className={`hover:text-rose-600 transition pb-1 border-b-2 cursor-pointer ${
              selectedCategory === 'todos' && viewMode === 'store'
                ? 'border-amber-500 text-neutral-900'
                : 'border-transparent text-neutral-600'
            }`}
          >
            Todos os Produtos
          </button>
          <button
            onClick={() => handleSelectCategory('perfumaria')}
            className={`hover:text-rose-600 transition pb-1 border-b-2 cursor-pointer ${
              selectedCategory === 'perfumaria'
                ? 'border-amber-500 text-neutral-900'
                : 'border-transparent text-neutral-600'
            }`}
          >
            Perfumaria Fina
          </button>
          <button
            onClick={() => handleSelectCategory('bodysplash')}
            className={`hover:text-rose-600 transition pb-1 border-b-2 cursor-pointer ${
              selectedCategory === 'bodysplash'
                ? 'border-amber-500 text-neutral-900'
                : 'border-transparent text-neutral-600'
            }`}
          >
            Body Splashes
          </button>
          <button
            onClick={() => handleSelectCategory('skincare')}
            className={`hover:text-rose-600 transition pb-1 border-b-2 cursor-pointer ${
              selectedCategory === 'skincare'
                ? 'border-amber-500 text-neutral-900'
                : 'border-transparent text-neutral-600'
            }`}
          >
            Skincare Facial
          </button>
          <button
            onClick={() => handleSelectCategory('maquiagem')}
            className={`hover:text-rose-600 transition pb-1 border-b-2 cursor-pointer ${
              selectedCategory === 'maquiagem'
                ? 'border-amber-500 text-neutral-900'
                : 'border-transparent text-neutral-600'
            }`}
          >
            Maquiagem & Gloss
          </button>
          <button
            onClick={() => handleSelectCategory('combos')}
            className={`hover:text-rose-600 transition pb-1 border-b-2 cursor-pointer ${
              selectedCategory === 'combos'
                ? 'border-rose-600 text-rose-600 font-extrabold'
                : 'border-transparent text-rose-600'
            } flex items-center gap-1.5`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Kits & Presentes
          </button>
          <button
            onClick={() => {
              setViewMode('blog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`hover:text-rose-600 transition pb-1 border-b-2 cursor-pointer ${
              viewMode === 'blog'
                ? 'border-amber-500 text-neutral-900'
                : 'border-transparent text-neutral-600'
            }`}
          >
            Blog Editorial
          </button>
        </nav>
      </div>

      {/* Mobile Sidebar Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-black/60 md:hidden backdrop-blur-xs">
          <div className="bg-white w-4/5 max-w-sm h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <span className="font-extrabold text-xl text-neutral-900 font-display">
                  vasconcelos <span className="text-rose-600 font-serif-luxury italic font-normal">Presente</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Categorias</p>
                <div className="flex flex-col space-y-1">
                  {[
                    { id: 'todos', label: 'Todos os Produtos' },
                    { id: 'perfumaria', label: 'Perfumaria Fina' },
                    { id: 'bodysplash', label: 'Body Splashes' },
                    { id: 'skincare', label: 'Skincare Facial' },
                    { id: 'maquiagem', label: 'Maquiagem & Gloss' },
                    { id: 'combos', label: 'Kits & Presentes' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between cursor-pointer ${
                        selectedCategory === cat.id && viewMode === 'store'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <button
                  onClick={() => {
                    setViewMode('blog');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Blog Editorial de Beleza</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                <button
                  onClick={() => {
                    setViewMode('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between cursor-pointer ${
                    isAdminAuthenticated ? 'text-emerald-700 bg-emerald-50' : 'text-neutral-700 bg-neutral-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isAdminAuthenticated ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-neutral-500" />}
                    {isAdminAuthenticated ? 'Painel Administrativo' : 'Painel Admin'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Bottom user action in mobile drawer */}
            <div className="pt-6 border-t border-neutral-100">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                    />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{currentUser.name}</p>
                      <p className="text-[11px] text-neutral-500">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAccountOpen(true);
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Ver
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold tracking-wide cursor-pointer"
                >
                  Entrar ou Cadastrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
