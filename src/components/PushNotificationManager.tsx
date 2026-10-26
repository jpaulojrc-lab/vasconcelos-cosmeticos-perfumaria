import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, X, Check, Gift } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PushNotificationManager: React.FC = () => {
  const { 
    pushPermission, 
    requestPushPermission, 
    sendPushNotification,
    notifications,
    setIsCartOpen,
    applyCoupon
  } = useStore();

  const [showPromptBanner, setShowPromptBanner] = useState(false);
  const [activeToast, setActiveToast] = useState<{ title: string; message: string; discountCode?: string } | null>(null);

  useEffect(() => {
    // Show banner after 4 seconds if permission is not yet decided
    const timer = setTimeout(() => {
      if (pushPermission === 'default') {
        setShowPromptBanner(true);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [pushPermission]);

  // Handle push activation
  const handleEnablePush = async () => {
    setShowPromptBanner(false);
    await requestPushPermission();
  };

  const handleApplyToastCoupon = (code: string) => {
    applyCoupon(code);
    setIsCartOpen(true);
    setActiveToast(null);
  };

  return (
    <>
      {/* Push Notification Opt-In Banner */}
      {showPromptBanner && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 max-w-sm bg-neutral-900 text-white p-4 rounded-3xl shadow-2xl border border-pink-500/40 animate-in fade-in slide-in-from-bottom-5">
          <button
            onClick={() => setShowPromptBanner(false)}
            className="absolute top-3 right-3 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-600 text-white shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-pink-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Alertas Exclusivos vasconcelos Presente
              </h4>
              <p className="text-xs text-neutral-300 leading-snug">
                Ative notificações para não perder cupons secretos de até 50% OFF e lançamentos da live!
              </p>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleEnablePush}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-[11px] font-black tracking-wider uppercase transition shadow-md"
                >
                  Ativar Alertas
                </button>
                <button
                  onClick={() => setShowPromptBanner(false)}
                  className="px-3 py-2 text-[11px] text-neutral-400 hover:text-white transition font-medium"
                >
                  Mais tarde
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Active Push Notification Toast (when active) */}
      {activeToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-white text-neutral-900 p-4 rounded-3xl shadow-2xl border-2 border-pink-500 animate-in slide-in-from-right duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-600 animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600">
                Promoção Relâmpago
              </span>
            </div>
            <button onClick={() => setActiveToast(null)} className="text-neutral-400 hover:text-neutral-900">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 space-y-1">
            <h4 className="text-xs font-bold text-neutral-900">{activeToast.title}</h4>
            <p className="text-xs text-neutral-600">{activeToast.message}</p>
          </div>

          {activeToast.discountCode && (
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-100">
              <span className="font-mono text-xs font-bold text-neutral-800">
                Cupom: {activeToast.discountCode}
              </span>
              <button
                onClick={() => handleApplyToastCoupon(activeToast.discountCode!)}
                className="px-3 py-1 bg-pink-600 text-white text-[10px] font-bold rounded-full hover:bg-pink-700 transition"
              >
                Aplicar e Comprar
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
