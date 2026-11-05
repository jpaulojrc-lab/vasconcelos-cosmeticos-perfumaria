import React from 'react';
import { Home, Grid, ShoppingBag, Heart, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MobileBottomNav: React.FC = () => {
  const {
    cart,
    wishlist,
    currentUser,
    viewMode,
    setViewMode,
    setIsCartOpen,
    setIsAccountOpen,
    setIsAuthOpen,
    setSelectedCategory
  } = useStore();

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200 px-4 py-2 flex items-center justify-around">
      <button
        onClick={() => {
          setViewMode('store');
          setSelectedCategory('todos');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center gap-1 transition cursor-pointer ${viewMode === 'store' ? 'text-neutral-950 font-bold' : 'text-neutral-500'
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
        className="flex flex-col items-center gap-1 text-neutral-500 hover:text-neutral-950 transition cursor-pointer"
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Catálogo</span>
      </button>

      <button
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center gap-1 text-neutral-500 hover:text-neutral-950 transition relative cursor-pointer"
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
        className="flex flex-col items-center gap-1 text-neutral-500 hover:text-neutral-950 transition relative cursor-pointer"
      >
        <div className="relative">
          <Heart className="w-5 h-5" />
          {wishlist.length > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#8B1E3F] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold">Favoritos</span>
      </button>

      <button
        onClick={() => {
          if (currentUser) {
            setIsAccountOpen(true);
          } else {
            setIsAuthOpen(true);
          }
        }}
        className="flex flex-col items-center gap-1 text-neutral-500 hover:text-neutral-950 transition cursor-pointer"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-semibold">
          {currentUser ? currentUser.name.split(' ')[0] : 'Conta'}
        </span>
      </button>
    </div>
  );
};
