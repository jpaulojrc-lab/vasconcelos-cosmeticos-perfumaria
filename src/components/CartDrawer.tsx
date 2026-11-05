import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Gift, 
  Truck, 
  ArrowRight, 
  Tag, 
  Plus, 
  Minus, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { formatBRL } from '../utils/formatters';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    cartSubtotal,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    freeGiftThreshold,
    setIsCheckoutOpen
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponFeedback({ type: 'success', message: res.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', message: res.message });
    }
  };

  const giftProgress = Math.min(100, (cartSubtotal / freeGiftThreshold) * 100);
  const diffToGift = Math.max(0, freeGiftThreshold - cartSubtotal);

  const shippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const diffToFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const totalQuantity = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Slide */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-neutral-950">
                    Sacola de Compras
                  </h2>
                  <span className="text-[11px] text-neutral-500">
                    {totalQuantity} {totalQuantity === 1 ? 'item selecionado' : 'itens selecionados'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
                aria-label="Fechar sacola"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Gift & Free Shipping Progress Meters */}
            <div className="bg-[#F7F6F2] p-4 border-b border-neutral-200 space-y-3">
              {/* Free Shipping Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-neutral-800">
                    <Truck className="w-3.5 h-3.5 text-neutral-700" />
                    {diffToFreeShipping === 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Frete Grátis desbloqueado
                      </span>
                    ) : (
                      <span>
                        Faltam <strong className="text-neutral-950 font-bold">{formatBRL(diffToFreeShipping)}</strong> para Frete Grátis
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">{Math.round(shippingProgress)}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-neutral-950 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Free Gift Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-neutral-800">
                    <Gift className="w-3.5 h-3.5 text-[#8B1E3F]" />
                    {diffToGift === 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Amostra de perfumaria incluída
                      </span>
                    ) : (
                      <span>
                        Faltam <strong className="text-neutral-950 font-bold">{formatBRL(diffToGift)}</strong> para Amostra de Perfumaria
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">{Math.round(giftProgress)}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#8B1E3F] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${giftProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-neutral-200">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#F7F6F2] border border-neutral-200 text-neutral-600 mx-auto flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-wider">Sua sacola está vazia</h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                      Explore nossas fragrâncias autorais, body splashes e estojos presenteáveis.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 rounded-lg bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#8B1E3F] transition cursor-pointer"
                  >
                    Explorar Catálogo
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="py-4 flex gap-3.5"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-lg border border-neutral-200 shrink-0 bg-[#F6F5F2]"
                      loading="lazy"
                    />
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-950 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-neutral-400 hover:text-red-600 p-0.5 transition cursor-pointer"
                            title="Remover produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] text-neutral-500">{item.product.volume}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-neutral-300 rounded-lg px-2 py-0.5 bg-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-neutral-950 font-bold cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-neutral-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-neutral-950 font-bold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold text-neutral-950">
                            {formatBRL(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer with Coupon & Checkout */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-neutral-200 bg-[#F7F6F2] space-y-4">
                
                {/* Coupon Code Input */}
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-neutral-300 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                        <Tag className="w-3.5 h-3.5 text-[#8B1E3F]" />
                        <span>Cupom {appliedCoupon.code} aplicado</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-neutral-500 hover:text-red-600 text-xs font-bold underline cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Cupom promocional (ex: BEMVINDO10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs uppercase focus:outline-hidden focus:border-neutral-900"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#111111] hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </form>
                  )}
                  {couponFeedback && (
                    <p className={`text-[11px] mt-1 font-medium ${
                      couponFeedback.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                    }`}>
                      {couponFeedback.message}
                    </p>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="space-y-1.5 text-xs text-neutral-600 pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">{formatBRL(cartSubtotal)}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Desconto</span>
                      <span>-{formatBRL(cartDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span className="font-semibold text-neutral-900">
                      {cartSubtotal >= freeShippingThreshold ? (
                        <span className="text-emerald-700 font-bold uppercase">Grátis</span>
                      ) : (
                        'Calculado no checkout'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-extrabold text-neutral-950 pt-2 border-t border-neutral-200">
                    <span>Total</span>
                    <span>{formatBRL(cartTotal)}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 text-right">
                    em até 10x de {formatBRL(cartTotal / 10)} sem juros
                  </p>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white text-xs font-bold tracking-[0.12em] uppercase flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Finalizar Compra</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Trust and Security micro badge */}
                <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-neutral-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Compra 100% Segura • Criptografia SSL 256-Bit</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
