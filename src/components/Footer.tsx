import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  HeartHandshake, 
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
    <footer className="bg-[#111111] text-white border-t border-neutral-800 pt-14 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Newsletter Section — Clean Prestige Strip */}
        <div className="bg-[#1A1918] border border-white/10 p-7 sm:p-10 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left max-w-lg">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400 block">
              Vasconcelos Insider
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Receba 10% OFF na sua primeira compra
            </h3>
            <p className="text-xs text-neutral-400">
              Cadastre seu e-mail para acompanhar lançamentos de perfumaria, convites e condições exclusivas.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            {newsletterSubscribed ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cadastro confirmado. Utilize o código: <strong>BEMVINDO10</strong></span>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Digite seu e-mail..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-xs text-white placeholder:text-neutral-500 outline-hidden focus:border-white transition"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold uppercase tracking-wider transition shrink-0 cursor-pointer"
                >
                  Cadastrar
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-neutral-400">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div>
              <span className="text-xl font-extrabold text-white tracking-[0.22em] block">
                VASCONCELOS
              </span>
              <span className="text-[9px] uppercase tracking-[0.26em] text-neutral-500 font-semibold block mt-1">
                Perfumaria & Cosméticos
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-xs">
              Curadoria brasileira de alta perfumaria, body splashes de longa duração, dermocosméticos clínicos e estojos presenteáveis.
            </p>
            <div className="flex items-center space-x-2.5 text-neutral-300">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition" aria-label="Youtube">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.16em]">Departamentos</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('perfumaria');
                    setViewMode('store');
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition cursor-pointer"
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
                  className="hover:text-white transition cursor-pointer"
                >
                  Body Splashes Perfumados
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('skincare');
                    setViewMode('store');
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition cursor-pointer"
                >
                  Skincare & Dermocosméticos
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('combos');
                    setViewMode('store');
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition cursor-pointer"
                >
                  Estojos & Kits para Presente
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setViewMode('blog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition cursor-pointer"
                >
                  Journal & Editorial de Beleza
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.16em]">Atendimento ao Cliente</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <strong className="text-white block">Central de Relacionamento:</strong>
                0800 892 1400
              </li>
              <li>
                <strong className="text-white block">WhatsApp Concierge:</strong>
                (11) 99876-5432
              </li>
              <li>
                <strong className="text-white block">E-mail Oficial:</strong>
                sandravasconcellossillva@gmail.com
              </li>
              <li className="pt-1">
                <span className="text-neutral-300 font-medium">Segunda a Sábado, das 8h às 20h</span>
              </li>
            </ul>
          </div>

          {/* Trust and Safety Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.16em]">Segurança & Garantias</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-300 shrink-0" />
                <span>Certificado SSL 256-Bit</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-neutral-300 shrink-0" />
                <span>Checkout Criptografado</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <Truck className="w-4 h-4 text-neutral-300 shrink-0" />
                <span>Envio com Rastreio</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-neutral-300 shrink-0" />
                <span>100% Cruelty-Free</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & payment methods */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© 2026 Vasconcelos Perfumaria e Cosméticos Ltda. Todos os direitos reservados. CNPJ: 42.189.902/0001-14</p>
          
          {/* Payment Badges */}
          <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-300">
            <span className="bg-white/10 px-2.5 py-1 rounded font-bold">PIX</span>
            <span className="bg-white/10 px-2.5 py-1 rounded">VISA</span>
            <span className="bg-white/10 px-2.5 py-1 rounded">MASTERCARD</span>
            <span className="bg-white/10 px-2.5 py-1 rounded">ELO</span>
            <span className="bg-white/10 px-2.5 py-1 rounded">BOLETO</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
