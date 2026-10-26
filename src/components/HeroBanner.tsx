import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Clock, Shield, Award, Heart, Flame } from 'lucide-react';
import { motion } from 'motion/react';
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
    <div className="relative overflow-hidden bg-velvet-dark text-white border-b border-white/5">
      {/* Decorative Luxury Glow Orbs */}
      <div className="absolute -top-32 -left-24 w-[32rem] h-[32rem] bg-gradient-to-br from-amber-500/15 via-rose-600/20 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-gradient-to-tl from-pink-600/20 via-amber-400/10 to-transparent rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(197,160,89,0.06),_transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Live Promo Tag with Urgency */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-luxury-dark border border-amber-400/30 text-amber-200 text-xs font-semibold tracking-widest uppercase shadow-sm shimmer-badge"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                ALTA PERFUMARIA • ATÉ 50% OFF HOJE
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white font-display"
            >
              A ESSÊNCIA DO <br />
              <span className="italic font-serif-luxury font-normal text-rose-gold-gradient drop-shadow-sm">
                Poder & Sedução.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-neutral-300/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
            >
              Mergulhe no universo exclusivo da <strong>vasconcelos Presente</strong>. Fragrâncias com fixação superior a 14 horas, acordes nobres europeus e alta concentração de essência pura para marcar presença.
            </motion.p>

            {/* Countdown Urgency Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-luxury-dark border border-white/10 p-4 sm:p-5 rounded-2xl max-w-md mx-auto lg:mx-0 shadow-xl"
            >
              <div className="flex items-center justify-between text-xs text-neutral-300 mb-2.5 font-medium">
                <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Ofertas Relâmpago Expiram em:
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono font-semibold tracking-wider">
                  ÚLTIMOS FRASCOS
                </span>
              </div>
              
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <div className="bg-black/70 rounded-xl px-3.5 py-2 text-center min-w-[56px] border border-amber-500/20 shadow-inner">
                  <span className="text-2xl font-bold font-mono text-white tracking-wider">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-neutral-400 font-medium mt-0.5">Horas</span>
                </div>
                <span className="text-xl font-bold text-amber-400/80">:</span>
                <div className="bg-black/70 rounded-xl px-3.5 py-2 text-center min-w-[56px] border border-amber-500/20 shadow-inner">
                  <span className="text-2xl font-bold font-mono text-white tracking-wider">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-neutral-400 font-medium mt-0.5">Minutos</span>
                </div>
                <span className="text-xl font-bold text-amber-400/80">:</span>
                <div className="bg-black/70 rounded-xl px-3.5 py-2 text-center min-w-[56px] border border-amber-500/20 shadow-inner">
                  <span className="text-2xl font-bold font-mono text-amber-300 tracking-wider">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-amber-300/70 font-medium mt-0.5">Segundos</span>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToCatalog('combos')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-rose-700 hover:from-pink-500 hover:to-rose-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-pink-600/30 hover:shadow-pink-600/50 transition duration-300 flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                <span>APROVEITAR KITS EM PROMOÇÃO</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToCatalog('perfumaria')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full glass-luxury-dark hover:bg-white/15 border border-amber-400/25 text-white font-medium text-sm tracking-wide transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Explorar Fragrâncias</span>
              </motion.button>
            </motion.div>

            {/* Social Proof Mini */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="pt-2 flex items-center justify-center lg:justify-start gap-3 text-xs text-neutral-300"
            >
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-neutral-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Cliente vasconcelos" />
                <img className="w-7 h-7 rounded-full border-2 border-neutral-900 object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80" alt="Cliente vasconcelos" />
                <img className="w-7 h-7 rounded-full border-2 border-neutral-900 object-cover" src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=80&q=80" alt="Cliente vasconcelos" />
              </div>
              <p>
                <strong className="text-white font-semibold">+45.000 clientes encantadas</strong> com a fixação vasconcelos.
              </p>
            </motion.div>
          </div>

          {/* Right Column: Visual Product Showcase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative mx-auto max-w-sm rounded-3xl overflow-hidden border border-amber-400/20 shadow-2xl bg-neutral-900/70 backdrop-blur-md p-4 group"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-4/5">
                <img
                  src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80"
                  alt="Obsession Rouge vasconcelos Presente"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                />
                
                {/* Floating Tag */}
                <div className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 shimmer-badge">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  DESTAQUE DA SEMANA • -34% OFF
                </div>

                {/* Floating Bottom Glass Card */}
                <div className="absolute bottom-3 left-3 right-3 glass-luxury-dark p-3.5 rounded-xl border border-white/15 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-amber-300 font-bold">Alta Fixação • 100ml</p>
                      <h4 className="text-sm font-bold text-white">Obsession Rouge Eau de Parfum</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs line-through text-neutral-400">R$ 289,90</p>
                      <p className="text-base font-black text-rose-300">R$ 189,90</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Trust Badges Strip with Subtle Glow */}
      <div className="border-t border-white/10 bg-black/50 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 text-xs text-neutral-300 hover:text-white transition">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>100% Original</strong> & Cruelty Free</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2.5 text-xs text-neutral-300 hover:text-white transition">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Fixação 14 Horas</strong> Certificada</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2.5 text-xs text-neutral-300 hover:text-white transition">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Envio Rápido</strong> com Rastreio</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2.5 text-xs text-neutral-300 hover:text-white transition">
              <Heart className="w-4 h-4 text-rose-400 shrink-0" />
              <span><strong>Garantia de Satisfação</strong> vasconcelos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
