import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PushNotificationManager: React.FC = () => {
  const { setIsCartOpen, applyCoupon } = useStore();
  const [activeToast, setActiveToast] = useState<{ title: string; message: string; discountCode?: string } | null>(null);

  const handleApplyToastCoupon = (code: string) => {
    applyCoupon(code);
    setIsCartOpen(true);
    setActiveToast(null);
  };

  if (!activeToast) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm bg-white text-neutral-900 p-4 rounded-xl shadow-xl border border-neutral-200 animate-in slide-in-from-right duration-300">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8B1E3F]">
          Benefício Exclusivo
        </span>
        <button onClick={() => setActiveToast(null)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-1.5 space-y-1">
        <h4 className="text-xs font-bold text-neutral-950">{activeToast.title}</h4>
        <p className="text-xs text-neutral-600">{activeToast.message}</p>
      </div>

      {activeToast.discountCode && (
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-100">
          <span className="font-mono text-xs font-bold text-neutral-900">
            Código: {activeToast.discountCode}
          </span>
          <button
            onClick={() => handleApplyToastCoupon(activeToast.discountCode!)}
            className="px-3 py-1.5 bg-[#111111] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#8B1E3F] transition cursor-pointer"
          >
            Aplicar na Sacola
          </button>
        </div>
      )}
    </div>
  );
};
