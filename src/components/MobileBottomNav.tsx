import React from 'react';
import {
  Home,
  Grid,
  ShoppingBag,
  User,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBRL } from '../utils/formatters';

export const MobileBottomNav: React.FC = () => {
  const {
    cart,
    cartTotal,
    currentUser,
    viewMode,
    setViewMode,
    setIsCartOpen,
    setIsCheckoutOpen,
    setIsAccountOpen,
    setIsAuthOpen,
    setSelectedCategory,
    isAdminAuthenticated
  } = useStore();

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div
      id="vsc-mobile-bottom-nav"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 pointer-events-none"
      style={{
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
    >
      {/* Barra Flutuante Inteligente para o Cliente no Celular quando há itens na sacola */}
      {totalItems > 0 && viewMode === 'store' && (
        <div className="pointer-events-auto mx-2.5 mb-2 p-2.5 rounded-2xl bg-[#111111] text-white shadow-2xl border border-white/15 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-2">
          <div
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 cursor-pointer min-w-0"
          >
            <div className="w-8 h-8 rounded-xl bg-[#8B1E3F] text-white flex items-center justify-center font-extrabold text-xs shrink-0">
              {totalItems}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-wider text-neutral-300 font-bold truncate">
                Sua Sacola • Frete Grátis
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                {formatBRL(cartTotal)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Finalizar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Barra de Navegação Inferior do App no Celular (Adaptada a qualquer modelo e navegador) */}
      <nav
        aria-label="Menu inferior mobile"
        className="pointer-events-auto bg-white/95 backdrop-blur-md border-t border-neutral-200 px-1 pt-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))'
        }}
      >
        <button
          onClick={() => {
            setViewMode('store');
            setSelectedCategory('todos');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1 transition cursor-pointer ${
            viewMode === 'store' ? 'text-neutral-950 font-extrabold' : 'text-neutral-500'
          }`}
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px] font-semibold truncate">Início</span>
        </button>

        <button
          onClick={() => {
            setViewMode('store');
            const catEl = document.getElementById('catalogo-produtos');
            if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex-1 flex flex-col items-center gap-0.5 py-1 text-neutral-500 hover:text-neutral-950 transition cursor-pointer"
        >
          <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px] font-semibold truncate">Produtos</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex-1 flex flex-col items-center gap-0.5 py-1 text-neutral-500 hover:text-neutral-950 transition relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#8B1E3F] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-semibold truncate">Sacola</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              setIsAccountOpen(true);
            } else {
              setIsAuthOpen(true);
            }
          }}
          className="flex-1 flex flex-col items-center gap-0.5 py-1 text-neutral-500 hover:text-neutral-950 transition cursor-pointer"
        >
          <User className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px] font-semibold truncate max-w-[64px]">
            {currentUser ? currentUser.name.split(' ')[0] : 'Pedidos'}
          </span>
        </button>

        <button
          onClick={() => {
            setViewMode('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1 transition cursor-pointer ${
            isAdminAuthenticated ? 'text-[#8B1E3F] font-extrabold' : 'text-neutral-400'
          }`}
        >
          <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px] font-semibold truncate">ADM</span>
        </button>
      </nav>
    </div>
  );
};
