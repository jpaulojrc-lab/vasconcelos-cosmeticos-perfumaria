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
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { formatBRL, formatInstallment } from '../utils/formatters';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    freeGiftThreshold,
    setIsCheckoutOpen,
    calculateShipping
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Quick CEP preview
  const [cepInput, setCepInput] = useState('');
  const [shippingQuote, setShippingQuote] = useState<number | null>(null);
  const [isCalculatingCep, setIsCalculatingCep] = useState(false);

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

  const handleQuickCep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cepInput) return;
    setIsCalculatingCep(true);
    try {
      const res = await calculateShipping(cepInput);
      if (res.quotes.length > 0) {
        setShippingQuote(res.quotes[0].price);
      }
    } catch {
      // ignore
    } finally {
      setIsCalculatingCep(false);
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
          {/* Backdrop Blur Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Slide with Spring Physics */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 font-display">
                    Sua Sacola de Compras
                  </h2>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {totalQuantity} {totalQuantity === 1 ? 'item selecionado' : 'itens selecionados'}
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
                aria-label="Fechar sacola"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Free Gift & Free Shipping Progress Meters with Luxury Finish */}
            <div className="bg-gradient-to-b from-[#FAF7F2] to-white p-4 border-b border-neutral-200/70 space-y-3">
              {/* Free Gift Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-bold">
                  <span className="flex items-center gap-1.5 text-neutral-800">
                    <Gift className="w-4 h-4 text-amber-600" />
                    {diffToGift === 0 ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Brinde Exclusivo Desbloqueado!
                      </span>
                    ) : (
                      <span className="font-medium text-neutral-700">
                        Faltam <strong className="text-amber-800 font-bold">{formatBRL(diffToGift)}</strong> para Amostra de Luxo
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-amber-700 font-mono font-bold">{Math.round(giftProgress)}%</span>
                </div>
                <div className="w-full bg-neutral-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-rose-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${giftProgress}%` }}
                  />
                </div>
              </div>

              {/* Free Shipping Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-bold">
                  <span className="flex items-center gap-1.5 text-neutral-700">
                    <Truck className="w-3.5 h-3.5 text-neutral-600" />
                    {diffToFreeShipping === 0 ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Frete Grátis Liberado!
                      </span>
                    ) : (
                      <span className="font-medium text-neutral-700">
                        Faltam <strong className="text-neutral-900 font-bold">{formatBRL(diffToFreeShipping)}</strong> para Frete Grátis
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">{Math.round(shippingProgress)}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-neutral-800 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-neutral-100">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 font-display">Sua sacola está vazia</h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto font-light">
                      Descubra nossa alta perfumaria, body splashes e kits exclusivos para presentear.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-rose-600 transition cursor-pointer"
                  >
                    Explorar Coleção
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="py-4 flex gap-3.5"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-2xl border border-neutral-200 shrink-0 bg-[#FAF8F5]"
                      loading="lazy"
                    />
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-neutral-400 hover:text-red-500 p-0.5 transition cursor-pointer"
                            title="Remover produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] text-amber-800 font-medium">{item.product.volume}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-neutral-200 rounded-full px-2 py-0.5 bg-neutral-50">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-rose-600 font-bold cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-neutral-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-rose-600 font-bold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-neutral-900 font-display">
                            {formatBRL(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Drawer Footer with Coupon & Checkout */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50/90 space-y-4">
                
                {/* Coupon Code Input */}
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <Tag className="w-3.5 h-3.5 text-amber-700" />
                        <span>Cupom {appliedCoupon.code} aplicado</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-amber-800 hover:text-red-600 text-xs font-bold underline cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Possui cupom? Ex: BEMVINDO10"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs uppercase focus:outline-hidden focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
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
                      ) : shippingQuote ? (
                        formatBRL(shippingQuote)
                      ) : (
                        'Calculado no checkout'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-black text-neutral-900 pt-2 border-t border-neutral-200">
                    <span className="font-display">Total Previsto</span>
                    <span className="font-display">{formatBRL(cartTotal)}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 text-right">
                    ou até 10x de {formatBRL(cartTotal / 10)} sem juros
                  </p>
                </div>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-neutral-900 via-stone-900 to-black hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition duration-300 cursor-pointer"
                >
                  <span>FINALIZAR COMPRA</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
