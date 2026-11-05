import React from 'react';
import { ArrowRight, ShoppingBag, Truck, CreditCard, ShieldCheck, Gift } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBRL } from '../utils/formatters';

export const HeroBanner: React.FC = () => {
  const { setSelectedCategory, products, addToCart, setSelectedProduct, setIsProductModalOpen } = useStore();

  const heroProduct = products.find(p => p.id === 'prod-1') || products[0];

  const handleOpenHeroProduct = () => {
    if (!heroProduct) return;
    setSelectedProduct(heroProduct);
    setIsProductModalOpen(true);
  };

  return (
    <section className="bg-white border-b border-neutral-200">
      {/* Main Campaign Split Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-neutral-200 bg-[#141312] text-white shadow-sm">
          
          {/* Left Editorial Column */}
          <div className="lg:col-span-7 p-7 sm:p-12 lg:p-14 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold px-2.5 py-1 bg-white/10 text-neutral-200 border border-white/15">
                  Eau de Parfum • 100ml
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#D4AF37] font-semibold">
                  Edição Assinatura
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                Obsession Rouge:{' '}
                <span className="font-serif-luxury italic font-normal text-[#E8D3B9]">
                  intensidade que permanece na pele.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed font-normal">
                Formulado com óleos essenciais importados de alta concentração para entregar mais de 14 horas de fixação real. Um acorde oriental floral criado para momentos inesquecíveis.
              </p>

              {/* Olfactory Notes Strip — Clean Studio Layout */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10 max-w-lg">
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.18em] text-neutral-400">Nota de Topo</span>
                  <span className="text-xs font-semibold text-white">Pera & Pimenta Rosa</span>
                </div>
                <div className="border-l border-white/10 pl-3">
                  <span className="block text-[9px] uppercase tracking-[0.18em] text-neutral-400">Coração</span>
                  <span className="text-xs font-semibold text-white">Orquídea Negra</span>
                </div>
                <div className="border-l border-white/10 pl-3">
                  <span className="block text-[9px] uppercase tracking-[0.18em] text-neutral-400">Fundo</span>
                  <span className="text-xs font-semibold text-white">Baunilha & Âmbar</span>
                </div>
              </div>
            </div>

            {/* Pricing & Commercial CTAs */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              {heroProduct && (
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {formatBRL(heroProduct.price)}
                    </span>
                    {heroProduct.originalPrice > heroProduct.price && (
                      <span className="text-xs text-neutral-500 line-through">
                        {formatBRL(heroProduct.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                    Em até 10x de {formatBRL(heroProduct.price / 10)} sem juros ou 5% OFF no PIX
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {heroProduct && (
                  <button
                    onClick={() => addToCart(heroProduct, 1)}
                    className="px-6 py-3.5 bg-white hover:bg-[#F3EFEA] text-neutral-950 font-bold text-xs uppercase tracking-[0.12em] rounded-lg flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Adicionar à Sacola</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedCategory('perfumaria');
                    const el = document.getElementById('catalogo-produtos');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3.5 border border-white/25 hover:border-white text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-lg flex items-center gap-2 transition cursor-pointer"
                >
                  <span>Ver Perfumaria</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Product Editorial Image */}
          <div 
            onClick={handleOpenHeroProduct}
            className="lg:col-span-5 relative min-h-[320px] sm:min-h-[420px] bg-[#1E1C1A] overflow-hidden cursor-pointer group"
          >
            {heroProduct && (
              <>
                <img
                  src={heroProduct.images[0]}
                  alt={heroProduct.name}
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                
                {/* Minimal Editorial Caption */}
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-300 block">
                      Best-Seller Nº 1
                    </span>
                    <p className="text-sm font-bold">{heroProduct.name}</p>
                  </div>
                  <span className="text-[11px] font-semibold underline underline-offset-4 text-neutral-200 group-hover:text-white">
                    Ver Pirâmide Olfativa
                  </span>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Commercial Service Strip — Sephora / Beleza na Web Reference */}
      <div className="border-t border-neutral-100 bg-[#F7F6F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-neutral-800 shrink-0" />
            <div>
              <p className="font-bold text-neutral-900">Frete Grátis Brasil</p>
              <p className="text-[11px] text-neutral-500">Em compras acima de R$ 199</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-neutral-800 shrink-0" />
            <div>
              <p className="font-bold text-neutral-900">Até 10x Sem Juros</p>
              <p className="text-[11px] text-neutral-500">Ou 5% de desconto imediato no PIX</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Gift className="w-4 h-4 text-neutral-800 shrink-0" />
            <div>
              <p className="font-bold text-neutral-900">Mimo Exclusivo na Sacola</p>
              <p className="text-[11px] text-neutral-500">Amostra de luxo em pedidos elegíveis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-neutral-800 shrink-0" />
            <div>
              <p className="font-bold text-neutral-900">Procedência Garantida</p>
              <p className="text-[11px] text-neutral-500">Fórmulas dermatologicamente testadas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
