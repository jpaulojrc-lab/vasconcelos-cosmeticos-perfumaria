import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Clock, Shield, Award, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HeroBanner: React.FC = () => {
  const { setSelectedCategory, setViewMode } = useStore();

  // Live countdown timer state (2 hours 45 min reset cycle)
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 48,
    seconds: 15
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollToCatalog = (cat = 'todos') => {
    setSelectedCategory(cat);
    setViewMode('store');
    const catalogEl = document.getElementById('catalogo-produtos');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-stone-900 to-black text-white">
      {/* Decorative Glow Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Live Promo Tag with Urgency */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-600/30 border border-pink-500/40 text-pink-300 text-xs font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping inline-block" />
              <span>LIVE PROMOCIONAL • ATÉ 50% OFF</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white font-display">
              A ESSÊNCIA DO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-pink-500 italic font-serif-luxury font-normal">
                Poder & Sedução.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Descubra a alta perfumaria, presentes especiais e o skincare de alta performance <strong>vasconcelos Presente</strong>. Fragrâncias que fixam por mais de 14 horas com ingredientes nobres e fórmulas exclusivas.
            </p>

            {/* Countdown Urgency Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl max-w-md mx-auto lg:mx-0">
              <div className="flex items-center justify-between text-xs text-neutral-300 mb-2 font-medium">
                <span className="flex items-center gap-1.5 text-pink-300 font-semibold">
                  <Clock className="w-4 h-4" />
                  Ofertas Relâmpago Terminam em:
                </span>
                <span className="text-[11px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md font-mono">
                  ÚLTIMAS UNIDADES
                </span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <div className="bg-black/60 rounded-xl px-3 py-1.5 text-center min-w-[50px] border border-white/10">
                  <span className="text-xl font-bold font-mono text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider text-neutral-400">Horas</span>
                </div>
                <span className="text-lg font-bold text-pink-400">:</span>
                <div className="bg-black/60 rounded-xl px-3 py-1.5 text-center min-w-[50px] border border-white/10">
                  <span className="text-xl font-bold font-mono text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider text-neutral-400">Minutos</span>
                </div>
                <span className="text-lg font-bold text-pink-400">:</span>
                <div className="bg-black/60 rounded-xl px-3 py-1.5 text-center min-w-[50px] border border-white/10">
                  <span className="text-xl font-bold font-mono text-pink-400">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider text-neutral-400">Segundos</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => scrollToCatalog('combos')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-pink-600/30 hover:shadow-pink-600/50 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>APROVEITAR KITS EM PROMOÇÃO</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => scrollToCatalog('perfumaria')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm tracking-wide backdrop-blur-sm transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-pink-300" />
                <span>Explorar Fragrâncias</span>
              </button>
            </div>

            {/* Social Proof Mini */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-3 text-xs text-neutral-300">
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-neutral-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Avatar" />
                <img className="w-7 h-7 rounded-full border-2 border-neutral-900 object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80" alt="Avatar" />
                <img className="w-7 h-7 rounded-full border-2 border-neutral-900 object-cover" src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=80&q=80" alt="Avatar" />
              </div>
              <p>
                <strong className="text-white">+45.000 clientes apaixonadas</strong> pelo rastro vasconcelos Presente.
              </p>
            </div>
          </div>

          {/* Right Column: Visual Product Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-neutral-800/60 backdrop-blur-md p-4 group">
              <div className="relative rounded-2xl overflow-hidden aspect-4/5">
                <img
                  src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80"
                  alt="Obsession Rouge vasconcelos Presente"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                
                {/* Floating Tag */}
                <div className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  MAIS VENDIDO • -34% OFF
                </div>

                {/* Floating Bottom Card */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-pink-400 font-bold">Lançamento Exclusivo</p>
                      <h4 className="text-sm font-bold">Obsession Rouge 100ml</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs line-through text-neutral-400">R$ 289,90</p>
                      <p className="text-base font-black text-white">R$ 189,90</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Trust Badges Strip */}
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 text-xs text-neutral-300">
              <Shield className="w-4 h-4 text-pink-400 shrink-0" />
              <span><strong>100% Original</strong> & Cruelty Free</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2.5 text-xs text-neutral-300">
              <Award className="w-4 h-4 text-pink-400 shrink-0" />
              <span><strong>Fixação 14 Horas</strong> Comprovada</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2.5 text-xs text-neutral-300">
              <Clock className="w-4 h-4 text-pink-400 shrink-0" />
              <span><strong>Envio Expresso</strong> com Rastreio</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2.5 text-xs text-neutral-300">
              <Heart className="w-4 h-4 text-pink-400 shrink-0" />
              <span><strong>Suporte 24h</strong> Especializado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
