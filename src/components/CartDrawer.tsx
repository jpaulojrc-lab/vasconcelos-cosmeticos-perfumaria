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

  if (!isCartOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pink-600" />
            <h2 className="text-base font-extrabold text-neutral-900 font-display">
              Sua Sacola ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Gift & Free Shipping Progress Meters */}
        <div className="bg-pink-50/70 p-4 border-b border-pink-100 space-y-3">
          {/* Free Gift Progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1 font-bold">
              <span className="flex items-center gap-1.5 text-pink-700">
                <Gift className="w-4 h-4 text-pink-600" />
                {diffToGift === 0 ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Brinde Garantido: Mini Sérum Glow!
                  </span>
                ) : (
                  <span>Faltam {formatBRL(diffToGift)} para Brinde Exclusivo!</span>
                )}
              </span>
              <span className="text-[11px] text-pink-600 font-mono">{Math.round(giftProgress)}%</span>
            </div>
            <div className="w-full bg-pink-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 to-rose-600 h-2 rounded-full transition-all duration-300"
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
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Frete Grátis Liberado!
                  </span>
                ) : (
                  <span>Faltam {formatBRL(diffToFreeShipping)} para Frete Grátis</span>
                )}
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">{Math.round(shippingProgress)}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-neutral-800 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-neutral-100">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-600 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Sua sacola está vazia</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Que tal experimentar nossa linha de alta perfumaria ou body splashes marcantes?
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-pink-600 transition"
              >
                Explorar Produtos
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-4 flex gap-3.5">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-2xl border border-neutral-200 shrink-0"
                />
                
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-neutral-400 hover:text-red-500 p-0.5"
                        title="Remover produto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] text-neutral-500">{item.product.volume}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-neutral-200 rounded-full px-2 py-0.5 bg-neutral-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-pink-600 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-pink-600 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-neutral-900">
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
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50/80 space-y-4">
            
            {/* Coupon Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-pink-100 border border-pink-300 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-pink-800">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Cupom {appliedCoupon.code} aplicado</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-pink-700 hover:text-pink-900 text-xs font-bold underline"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Cupom (ex: BEMVINDO10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs uppercase placeholder:normal-case font-mono outline-hidden focus:border-pink-500"
                    />
                    <Tag className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-2.5" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition"
                  >
                    Aplicar
                  </button>
                </form>
              )}

              {couponFeedback && (
                <p className={`text-[11px] mt-1 font-semibold ${
                  couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {couponFeedback.message}
                </p>
              )}
            </div>

            {/* Calculations breakdown */}
            <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-neutral-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatBRL(cartSubtotal)}</span>
              </div>
              
              {cartDiscount > 0 && (
                <div className="flex justify-between text-pink-600 font-semibold">
                  <span>Desconto de Cupom</span>
                  <span>-{formatBRL(cartDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Frete</span>
                <span>
                  {cartSubtotal >= freeShippingThreshold ? (
                    <strong className="text-emerald-600">GRÁTIS</strong>
                  ) : (
                    'Calculado no checkout'
                  )}
                </span>
              </div>

              {diffToGift === 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Brinde Especial (Mini Sérum)</span>
                  <span>GRÁTIS</span>
                </div>
              )}

              <div className="flex justify-between text-sm sm:text-base font-extrabold text-neutral-900 pt-2 border-t border-neutral-200 font-display">
                <span>Total Estimado</span>
                <span className="text-pink-600">{formatBRL(cartTotal)}</span>
              </div>

              <p className="text-[11px] text-right text-neutral-500">
                ou até {formatInstallment(cartTotal, 10)}
              </p>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-4 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition transform hover:-translate-y-0.5 active:scale-95"
            >
              <span>Finalizar Compra</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
