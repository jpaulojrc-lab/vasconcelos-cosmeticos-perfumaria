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
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40">
      {/* Barra Flutuante Inteligente para o Cliente no Celular quando há itens na sacola */}
      {totalItems > 0 && viewMode === 'store' && (
        <div className="mx-3 mb-2 p-3 rounded-2xl bg-[#111111] text-white shadow-2xl border border-white/15 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#8B1E3F] text-white flex items-center justify-center font-extrabold text-xs">
              {totalItems}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-300 font-bold">
                Sua Sacola • Frete Grátis
              </p>
              <p className="text-sm font-extrabold text-white">{formatBRL(cartTotal)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Finalizar Pedido</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de Navegação Inferior do App no Celular */}
      <div className="bg-white border-t border-neutral-200 px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            setViewMode('store');
            setSelectedCategory('todos');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 px-2 py-0.5 transition cursor-pointer ${
            viewMode === 'store' ? 'text-neutral-950 font-extrabold' : 'text-neutral-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Início</span>
        </button>

        <button
          onClick={() => {
            setViewMode('store');
            const catEl = document.getElementById('catalogo-produtos');
            if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-1 px-2 py-0.5 text-neutral-500 hover:text-neutral-950 transition cursor-pointer"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Produtos</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 px-2 py-0.5 text-neutral-500 hover:text-neutral-950 transition relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#8B1E3F] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Sacola</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              setIsAccountOpen(true);
            } else {
              setIsAuthOpen(true);
            }
          }}
          className="flex flex-col items-center gap-1 px-2 py-0.5 text-neutral-500 hover:text-neutral-950 transition cursor-pointer"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold">
            {currentUser ? currentUser.name.split(' ')[0] : 'Meus Pedidos'}
          </span>
        </button>

        <button
          onClick={() => {
            setViewMode('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 px-2 py-0.5 transition cursor-pointer ${
            isAdminAuthenticated ? 'text-[#8B1E3F] font-extrabold' : 'text-neutral-400'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Painel ADM</span>
        </button>
      </div>
    </div>
  );
};
