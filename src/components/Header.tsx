import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Menu,
  X,
  ShieldAlert,
  Store
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBRL } from '../utils/formatters';

export const Header: React.FC = () => {
  const {
    cart,
    cartTotal,
    wishlist,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    setIsCartOpen,
    setIsAuthOpen,
    setIsAccountOpen,
    currentUser,
    isAdminAuthenticated
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const categories = [
    { id: 'todos', label: 'Catálogo Completo' },
    { id: 'perfumaria', label: 'Perfumaria Fina' },
    { id: 'bodysplash', label: 'Body Splash' },
    { id: 'skincare', label: 'Skincare & Dermocosméticos' },
    { id: 'maquiagem', label: 'Maquiagem' },
    { id: 'combos', label: 'Estojos & Presentes' }
  ];

  const handleCategoryClick = (id: string) => {
    setSelectedCategory(id);
    setViewMode('store');
    setMobileMenuOpen(false);
    const catalogEl = document.getElementById('catalogo-produtos');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-neutral-200">
      {/* Top Commercial Bar — Prestige Retail Style */}
      <div className="bg-[#111111] text-neutral-200 text-[10px] sm:text-[11px] py-2 px-4 tracking-[0.1em] uppercase">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6 overflow-x-auto whitespace-nowrap scrollbar-none mx-auto sm:mx-0">
            <span className="font-medium">
              Frete Grátis acima de <strong className="text-white font-bold">R$ 199</strong>
            </span>
            <span className="hidden md:inline text-neutral-600">|</span>
            <span className="hidden md:inline font-medium">
              Parcelamento em até <strong className="text-white font-bold">10x sem juros</strong>
            </span>
            <span className="hidden lg:inline text-neutral-600">|</span>
            <span className="hidden lg:inline font-medium">
              Amostra de perfumaria em todos os pedidos
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="text-neutral-400">1ª Compra 10% OFF:</span>
            <span className="bg-white/10 text-white px-2 py-0.5 font-mono font-bold tracking-widest border border-white/15">
              BEMVINDO10
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4">

          {/* Mobile Hamburger + Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-neutral-800 hover:text-black lg:hidden cursor-pointer"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div
              onClick={() => {
                setViewMode('store');
                setSelectedCategory('todos');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer group flex flex-col"
            >
              <span className="text-lg sm:text-2xl font-extrabold tracking-[0.22em] text-neutral-950 leading-none">
                VASCONCELOS
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.28em] text-neutral-500 font-semibold mt-1">
                Perfumaria & Cosméticos
              </span>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          {viewMode === 'store' && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar fragrâncias, notas olfativas ou linhas..."
                  className="w-full bg-[#F6F5F2] border border-neutral-200 focus:border-neutral-900 focus:bg-white rounded-lg py-2.5 pl-10 pr-8 text-xs text-neutral-900 placeholder:text-neutral-400 transition-colors outline-hidden"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">

            {/* Admin Back-to-Store or Discrete Admin Toggle */}
            {viewMode === 'admin' ? (
              <button
                onClick={() => setViewMode('store')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voltar à Loja</span>
              </button>
            ) : (
              <button
                onClick={() => setViewMode('admin')}
                className={`p-2 rounded-lg transition cursor-pointer ${isAdminAuthenticated
                    ? 'text-neutral-900 bg-neutral-100 hover:bg-neutral-200'
                    : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                  }`}
                title={isAdminAuthenticated ? 'Painel Administrativo (Logado)' : 'Acesso Restrito (Administração)'}
                aria-label="Acesso Administrativo"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => {
                if (currentUser) {
                  setIsAccountOpen(true);
                } else {
                  setIsAuthOpen(true);
                }
              }}
              className="relative p-2 text-neutral-700 hover:text-[#8B1E3F] transition rounded-lg hover:bg-neutral-100 cursor-pointer"
              title="Lista de Desejos"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#8B1E3F] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User Account / Login */}
            {currentUser ? (
              <button
                onClick={() => setIsAccountOpen(true)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-neutral-100 border border-transparent hover:border-neutral-200 transition cursor-pointer"
                title="Minha Conta"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-neutral-300"
                />
                <span className="hidden xl:inline text-xs font-semibold text-neutral-800">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-neutral-800 hover:text-black rounded-lg hover:bg-neutral-100 transition text-xs font-semibold cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span className="hidden xl:inline">Entrar</span>
              </button>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 bg-[#111111] hover:bg-[#8B1E3F] text-white px-3.5 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#8B1E3F] border border-white text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Sacola</span>
                <span className="text-xs font-bold">{formatBRL(cartTotal)}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {viewMode === 'store' && (
          <div className="pb-3 md:hidden">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar fragrâncias, séruns ou presentes..."
                className="w-full bg-[#F6F5F2] border border-neutral-200 focus:border-neutral-900 focus:bg-white rounded-lg py-2 pl-9 pr-4 text-xs text-neutral-900 outline-hidden"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
          </div>
        )}
      </div>

      {/* Category & Editorial Navigation Bar (Desktop) */}
      {viewMode !== 'admin' && (
        <nav className="hidden lg:block border-t border-neutral-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center space-x-8">
            {categories.map((cat) => {
              const isActive = viewMode === 'store' && selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`py-3 text-[11px] uppercase tracking-[0.14em] transition border-b-2 cursor-pointer ${isActive
                      ? 'border-neutral-950 text-neutral-950 font-bold'
                      : 'border-transparent text-neutral-600 hover:text-neutral-950 font-medium'
                    }`}
                >
                  {cat.label}
                </button>
              );
            })}

            <span className="text-neutral-200">|</span>

            <button
              onClick={() => setViewMode('blog')}
              className={`py-3 text-[11px] uppercase tracking-[0.14em] transition border-b-2 cursor-pointer ${viewMode === 'blog'
                  ? 'border-[#8B1E3F] text-[#8B1E3F] font-bold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-950 font-medium'
                }`}
            >
              Journal & Editorial
            </button>
          </div>
        </nav>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 pt-3 pb-6 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400 px-2 pb-1">
            Departamentos
          </div>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between ${selectedCategory === cat.id && viewMode === 'store'
                  ? 'bg-neutral-950 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
                }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}

          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-1">
            <button
              onClick={() => {
                setViewMode('blog');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Journal & Editorial de Beleza
            </button>
            <button
              onClick={() => {
                setViewMode('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-100 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Gestão da Loja (Restrito)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
