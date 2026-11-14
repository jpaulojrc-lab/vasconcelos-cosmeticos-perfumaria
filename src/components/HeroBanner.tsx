import React, { useState } from 'react';
import { ArrowRight, ShoppingBag, Truck, CreditCard, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBRL, sanitizeHtmlToText } from '../utils/formatters';
import { ProductCategory } from '../types';

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  perfumaria: 'Perfumaria',
  bodysplash: 'Body Splash',
  skincare: 'Skincare',
  maquiagem: 'Maquiagem',
  combos: 'Combos & Kits',
};

export const HeroBanner: React.FC = () => {
  const { setSelectedCategory, products, addToCart, setSelectedProduct, setIsProductModalOpen } = useStore();
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const featuredProducts = products.filter(p => p.isBestSeller);
  const displayList = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 1);
  const safeIndex = displayList.length > 0 ? featuredIndex % displayList.length : 0;
  const heroProduct = displayList[safeIndex];

  const categoryLabel = heroProduct ? (CATEGORY_LABELS[heroProduct.category] || 'Catálogo') : 'Catálogo';
  const isFragranceCategory = heroProduct?.category === 'perfumaria' || heroProduct?.category === 'bodysplash';
  const hasNotes = Boolean(
    isFragranceCategory &&
    heroProduct?.notes &&
    (heroProduct.notes.topo || heroProduct.notes.coracao || heroProduct.notes.fundo)
  );
  const cleanSubtitle = sanitizeHtmlToText(heroProduct?.subtitle);
  const cleanDescription = sanitizeHtmlToText(heroProduct?.description);
  const showSubtitleInHeading = Boolean(
    cleanSubtitle &&
    cleanSubtitle.length <= 90 &&
    !cleanDescription.toLowerCase().startsWith(cleanSubtitle.toLowerCase())
  );

  const handleOpenHeroProduct = () => {
    if (!heroProduct) return;
    setSelectedProduct(heroProduct);
    setIsProductModalOpen(true);
  };

  const handlePrevFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (displayList.length <= 1) return;
    setFeaturedIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
  };

  const handleNextFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (displayList.length <= 1) return;
    setFeaturedIndex((prev) => (prev + 1) % displayList.length);
  };

  return (
    <section className="bg-white border-b border-neutral-200">
      {/* Main Campaign Split Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-neutral-200 bg-[#141312] text-white shadow-sm">

          {/* Left Editorial Column */}
          <div className="lg:col-span-7 p-5 sm:p-10 lg:p-14 flex flex-col justify-between space-y-5 sm:space-y-8">
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold px-2.5 py-1 bg-white/10 text-neutral-200 border border-white/15">
                  {categoryLabel}{heroProduct?.volume ? ` • ${heroProduct.volume}` : ''}
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#D4AF37] font-semibold">
                  Destaque da Loja
                </span>
                {displayList.length > 1 && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevFeatured}
                      aria-label="Destaque anterior"
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-neutral-300 px-1">
                      {safeIndex + 1}/{displayList.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextFeatured}
                      aria-label="Próximo destaque"
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {heroProduct ? (
                <>
                  <h1 className="text-2xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15]">
                    {heroProduct.name}
                    {showSubtitleInHeading && (
                      <>
                        {': '}
                        <span className="font-serif-luxury italic font-normal text-[#E8D3B9]">
                          {cleanSubtitle}
                        </span>
                      </>
                    )}
                  </h1>

                  {cleanDescription && (
                    <div className="space-y-2 max-w-xl">
                      <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal line-clamp-4">
                        {cleanDescription}
                      </p>
                      {cleanDescription.length > 220 && (
                        <button
                          type="button"
                          onClick={handleOpenHeroProduct}
                          className="text-xs font-semibold text-[#E8D3B9] hover:text-white underline underline-offset-4 transition cursor-pointer"
                        >
                          Ler descrição completa
                        </button>
                      )}
                    </div>
                  )}

                  {/* Olfactory Notes Strip — Only shown when product has notes */}
                  {hasNotes && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2 border-t border-white/10 max-w-lg">
                      {heroProduct.notes?.topo && (
                        <div>
                          <span className="block text-[9px] uppercase tracking-[0.18em] text-neutral-400">Nota de Topo</span>
                          <span className="text-xs font-semibold text-white">{heroProduct.notes.topo}</span>
                        </div>
                      )}
                      {heroProduct.notes?.coracao && (
                        <div className={heroProduct.notes?.topo ? 'border-t pt-2 sm:border-t-0 sm:pt-0 sm:border-l border-white/10 sm:pl-3' : ''}>
                          <span className="block text-[9px] uppercase tracking-[0.18em] text-neutral-400">Coração</span>
                          <span className="text-xs font-semibold text-white">{heroProduct.notes.coracao}</span>
                        </div>
                      )}
                      {heroProduct.notes?.fundo && (
                        <div className={(heroProduct.notes?.topo || heroProduct.notes?.coracao) ? 'border-t pt-2 sm:border-t-0 sm:pt-0 sm:border-l border-white/10 sm:pl-3' : ''}>
                          <span className="block text-[9px] uppercase tracking-[0.18em] text-neutral-400">Fundo</span>
                          <span className="text-xs font-semibold text-white">{heroProduct.notes.fundo}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <h1 className="text-2xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15]">
                  Vasconcelos Utensílios e Presentes
                </h1>
              )}
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
                    Parcelamento c/ gerente ou 5% OFF no PIX
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
                    setSelectedCategory(heroProduct?.category || 'todos');
                    const el = document.getElementById('catalogo-produtos');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3.5 border border-white/25 hover:border-white text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-lg flex items-center gap-2 transition cursor-pointer"
                >
                  <span>Ver {categoryLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Product Editorial Image */}
          <div
            onClick={handleOpenHeroProduct}
            className="order-first lg:order-last lg:col-span-5 relative min-h-[240px] sm:min-h-[340px] lg:min-h-[420px] bg-[#1E1C1A] overflow-hidden cursor-pointer group"
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
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-300 block">
                      Destaque da Loja
                    </span>
                    <p className="text-sm font-bold">{heroProduct.name}</p>
                  </div>
                  <span className="text-[11px] font-semibold underline underline-offset-4 text-neutral-200 group-hover:text-white shrink-0">
                    {hasNotes ? 'Ver Pirâmide Olfativa' : 'Ver Detalhes'}
                  </span>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Commercial Service Strip */}
      <div className="border-t border-neutral-100 bg-[#F7F6F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-neutral-800 shrink-0" />
            <div>
              <p className="font-bold text-neutral-900">Entrega Grátis</p>
              <p className="text-[11px] text-neutral-500">Em compras acima de R$ 199</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-neutral-800 shrink-0" />
            <div>
              <p className="font-bold text-neutral-900">Parcelamento Facilitado</p>
              <p className="text-[11px] text-neutral-500">Parcelamento c/ gerente</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Gift className="w-4 h-4 text-neutral-800 shrink-0" />
            <div>
              <p className="font-bold text-neutral-900">Mimo Exclusivo na Sacola</p>
              <p className="text-[11px] text-neutral-500">Amostra de luxo em pedidos elegíveis</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
