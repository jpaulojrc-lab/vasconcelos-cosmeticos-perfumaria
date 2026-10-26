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
  Lock
} from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xs">
      {/* Top Banner Marquee (WePink Style) */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white text-xs font-semibold py-2 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center space-x-6 text-[11px] tracking-wider uppercase mx-auto">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-pink-200" />
              FRETE GRÁTIS EM COMPRAS ACIMA DE R$ 199
            </span>
            <span className="text-pink-300">•</span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-pink-200" />
              PARCELAMENTO EM ATÉ 10X SEM JUROS
            </span>
            <span className="text-pink-300">•</span>
            <span className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-pink-200" />
              CUPOM 10% OFF: <strong className="bg-white/20 px-1.5 py-0.5 rounded text-white tracking-widest">BEMVINDO10</strong>
            </span>
          </div>

          {/* Mobile version ticker */}
          <div className="md:hidden flex items-center justify-center w-full text-[11px] font-bold tracking-wide">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-200 animate-pulse" />
              MEGA PROMOÇÃO VASCONCELOS PRESENTE: ATÉ 50% OFF + 10X SEM JUROS
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
              className="p-2 -ml-2 rounded-lg text-neutral-700 hover:text-pink-600 md:hidden transition"
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
              className="text-left group flex items-baseline focus:outline-hidden"
            >
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-neutral-900 group-hover:text-pink-600 transition font-display">
                vasconcelos <span className="text-pink-600 font-serif-luxury italic font-normal">Presente</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-pink-600 inline-block ml-1 animate-pulse" />
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-widest text-pink-600 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full">
                Beauty & Presentes
              </span>
            </button>
          </div>

          {/* Search bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar perfume, body splash, sérum, base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-100/80 focus:bg-white text-sm text-neutral-900 pl-10 pr-10 py-2.5 rounded-full border border-neutral-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition outline-hidden"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Dropdown Autocomplete */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden z-50">
                <div className="p-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-50 border-b border-neutral-100">
                  Resultados sugeridos ({searchResults.length})
                </div>
                <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleOpenProduct(product)}
                      className="w-full text-left p-3 flex items-center gap-3 hover:bg-pink-50/60 transition group"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-neutral-200 group-hover:scale-105 transition"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-pink-600">
                          {product.name}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">{product.subtitle}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold text-pink-600">{formatBRL(product.price)}</span>
                          <span className="text-xs text-neutral-400 line-through">{formatBRL(product.originalPrice)}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-pink-600" />
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
              className="p-2 text-neutral-700 hover:text-pink-600 lg:hidden rounded-full hover:bg-pink-50 transition"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Dashboard Switch */}
            <button
              onClick={() => setViewMode(viewMode === 'admin' ? 'store' : 'admin')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition flex items-center gap-1.5 shadow-xs ${
                viewMode === 'admin'
                  ? 'bg-neutral-900 text-white ring-2 ring-pink-500'
                  : isAdminAuthenticated
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-neutral-100 text-neutral-800 hover:bg-pink-100 hover:text-pink-700'
              }`}
              title={isAdminAuthenticated ? "Painel Admin Autenticado" : "Acesso Restrito ao Painel Admin"}
            >
              {isAdminAuthenticated ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-neutral-500" />
              )}
              <span className="hidden sm:inline">
                {viewMode === 'admin' ? 'Voltar à Loja' : isAdminAuthenticated ? 'Painel Admin' : 'Admin (Login)'}
              </span>
              <span className="sm:hidden">{viewMode === 'admin' ? 'Loja' : 'Admin'}</span>
            </button>

            {/* Push Notifications Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="p-2 text-neutral-700 hover:text-pink-600 rounded-full hover:bg-pink-50 transition relative"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-pink-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-pink-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-pink-600" />
                      Alertas & Promoções
                    </span>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-pink-600 hover:underline font-semibold"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-neutral-500">
                        Nenhuma notificação no momento.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-3.5 hover:bg-pink-50/50 transition cursor-pointer text-left ${
                            !notif.read ? 'bg-pink-50/30' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                              {notif.badge || 'Promoção'}
                            </span>
                            <span className="text-[10px] text-neutral-400">{notif.timestamp}</span>
                          </div>
                          <p className="text-xs font-bold text-neutral-900">{notif.title}</p>
                          <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{notif.message}</p>
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
              className="p-2 text-neutral-700 hover:text-pink-600 rounded-full hover:bg-pink-50 transition relative hidden sm:block"
              aria-label="Lista de Desejos"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-pink-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-pink-50 transition text-neutral-700 hover:text-pink-600"
              aria-label="Minha Conta"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-500"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs">
                  {currentUser ? currentUser.name.charAt(0) : <UserIcon className="w-4 h-4" />}
                </div>
              )}
              {currentUser && (
                <span className="text-xs font-semibold hidden md:inline truncate max-w-[100px]">
                  {currentUser.name.split(' ')[0]}
                </span>
              )}
            </button>

            {/* Cart Bag trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-neutral-900 hover:bg-pink-600 text-white pl-3 pr-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold transition shadow-md hover:shadow-pink-500/25 active:scale-95"
              aria-label="Abrir Sacola de Compras"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {totalCartItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Sacola</span>
            </button>
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
                className="w-full bg-neutral-100 text-sm text-neutral-900 pl-10 pr-10 py-2.5 rounded-full border border-neutral-200 focus:border-pink-500 outline-hidden"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-xl shadow-lg border border-pink-100 overflow-hidden divide-y divide-neutral-100 max-h-60 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleOpenProduct(product)}
                    className="w-full text-left p-2.5 flex items-center gap-3 hover:bg-pink-50/50"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">{product.name}</p>
                      <p className="text-xs text-pink-600 font-semibold">{formatBRL(product.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center justify-center space-x-8 py-2.5 border-t border-neutral-100 text-xs font-bold uppercase tracking-wider text-neutral-700">
          <button
            onClick={() => handleSelectCategory('todos')}
            className={`hover:text-pink-600 transition pb-1 border-b-2 ${
              selectedCategory === 'todos' && viewMode === 'store'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent'
            }`}
          >
            Todos os Produtos
          </button>
          <button
            onClick={() => handleSelectCategory('perfumaria')}
            className={`hover:text-pink-600 transition pb-1 border-b-2 ${
              selectedCategory === 'perfumaria'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent'
            }`}
          >
            Perfumaria Fina
          </button>
          <button
            onClick={() => handleSelectCategory('bodysplash')}
            className={`hover:text-pink-600 transition pb-1 border-b-2 ${
              selectedCategory === 'bodysplash'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent'
            }`}
          >
            Body Splashes
          </button>
          <button
            onClick={() => handleSelectCategory('skincare')}
            className={`hover:text-pink-600 transition pb-1 border-b-2 ${
              selectedCategory === 'skincare'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent'
            }`}
          >
            Skincare Facial
          </button>
          <button
            onClick={() => handleSelectCategory('maquiagem')}
            className={`hover:text-pink-600 transition pb-1 border-b-2 ${
              selectedCategory === 'maquiagem'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent'
            }`}
          >
            Maquiagem & Gloss
          </button>
          <button
            onClick={() => handleSelectCategory('combos')}
            className={`hover:text-pink-600 transition pb-1 border-b-2 ${
              selectedCategory === 'combos'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent'
            } flex items-center gap-1 text-pink-600`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            Kits & Combos
          </button>
          <button
            onClick={() => {
              setViewMode('blog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`hover:text-pink-600 transition pb-1 border-b-2 ${
              viewMode === 'blog'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent'
            }`}
          >
            Blog vasconcelos Presente
          </button>
        </nav>
      </div>

      {/* Mobile Sidebar Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-black/50 md:hidden backdrop-blur-xs">
          <div className="bg-white w-4/5 max-w-sm h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <span className="font-extrabold text-xl text-neutral-900 font-display">
                  vasconcelos <span className="text-pink-600 font-serif-luxury italic font-normal">Presente</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900"
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
                    { id: 'combos', label: 'Kits & Combos Promocionais' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                        selectedCategory === cat.id && viewMode === 'store'
                          ? 'bg-pink-50 text-pink-600'
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
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
                >
                  <span>Blog de Beleza</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                <button
                  onClick={() => {
                    setViewMode('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                    isAdminAuthenticated ? 'text-emerald-700 bg-emerald-50' : 'text-neutral-700 bg-neutral-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isAdminAuthenticated ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-neutral-500" />}
                    {isAdminAuthenticated ? 'Painel Administrativo' : 'Painel Admin (Requer Senha)'}
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
                      className="w-10 h-10 rounded-full object-cover"
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
                    className="text-xs font-bold text-pink-600 hover:underline"
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
                  className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold tracking-wide"
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
