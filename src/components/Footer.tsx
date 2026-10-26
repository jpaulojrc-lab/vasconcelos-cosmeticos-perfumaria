import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  HeartHandshake, 
  Mail, 
  Send, 
  Sparkles, 
  Instagram, 
  Facebook, 
  Youtube,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { setViewMode, setSelectedCategory } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 4000);
  };

  return (
    <footer className="bg-neutral-900 text-white border-t border-neutral-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-pink-950/60 to-neutral-900 border border-pink-500/20 p-8 sm:p-10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left max-w-lg">
            <span className="text-xs font-bold uppercase tracking-widest text-pink-400 flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-4 h-4" />
              Clube VIP vasconcelos
            </span>
            <h3 className="text-2xl font-black font-display text-white">
              Ganhe 10% OFF na Primeira Compra
            </h3>
            <p className="text-xs text-neutral-300">
              Cadastre seu e-mail para receber cupons secretos, novidades de lançamentos e dicas exclusivas.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            {newsletterSubscribed ? (
              <div className="p-3 bg-pink-600/30 border border-pink-500 text-pink-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Inscrição confirmada! Use o cupom: <strong>BEMVINDO10</strong></span>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Seu melhor e-mail..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-xs text-white placeholder:text-neutral-400 outline-hidden focus:border-pink-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-md shrink-0"
                >
                  Quero Desconto
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-neutral-400">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <span className="text-2xl font-extrabold text-white tracking-tight font-display">
              vasconcelos <span className="text-pink-600 font-serif-luxury italic font-normal">Presente</span>
            </span>
            <p className="text-neutral-400 leading-relaxed text-xs">
              A marca brasileira sinônimo de alta perfumaria, kits de presentes inesquecíveis, body splashes e fórmulas dermatológicas de alta performance.
            </p>
            <div className="flex items-center space-x-3 text-neutral-300">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Categorias</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('perfumaria');
                    setViewMode('store');
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  }}
                  className="hover:text-pink-400 transition"
                >
                  Perfumaria Fina (Eau de Parfum)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('bodysplash');
                    setViewMode('store');
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  }}
                  className="hover:text-pink-400 transition"
                >
                  Body Splashes Virais
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('skincare');
                    setViewMode('store');
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  }}
                  className="hover:text-pink-400 transition"
                >
                  Skincare com Vitamina C e Niacinamida
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('combos');
                    setViewMode('store');
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  }}
                  className="hover:text-pink-400 transition"
                >
                  Kits Promocionais com Brinde
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setViewMode('blog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-pink-400 transition"
                >
                  Blog de Tendências de Beleza
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service (SAC 24h) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Atendimento 24h</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <strong className="text-white block">Central de Atendimento ao Cliente:</strong>
                0800 892 1400 (Segunda a Domingo 24h)
              </li>
              <li>
                <strong className="text-white block">WhatsApp Oficial:</strong>
                (11) 99876-5432
              </li>
              <li>
                <strong className="text-white block">E-mail:</strong>
                contato@vasconcelospresente.com.br
              </li>
              <li>
                <span className="text-emerald-400 font-semibold">● Chat ao vivo disponível 24h por dia</span>
              </li>
            </ul>
          </div>

          {/* Trust and Safety Badges */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Segurança & Selos</h4>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Site 100% Blindado SSL</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-pink-400 shrink-0" />
                <span>Pagamento Seguro Criptografado</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400 shrink-0" />
                <span>Entrega com Rastreamento</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Selo Cruelty Free Não Testado</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & payment methods */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© 2026 vasconcelos Presente Cosméticos e Presentes Especiais S.A. Todos os direitos reservados. CNPJ: 42.189.902/0001-14</p>
          
          {/* Payment Badges */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
            <span className="bg-white/10 px-2 py-1 rounded text-emerald-400 font-bold">PIX</span>
            <span className="bg-white/10 px-2 py-1 rounded">VISA</span>
            <span className="bg-white/10 px-2 py-1 rounded">MASTERCARD</span>
            <span className="bg-white/10 px-2 py-1 rounded">ELO</span>
            <span className="bg-white/10 px-2 py-1 rounded">BOLETO</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
