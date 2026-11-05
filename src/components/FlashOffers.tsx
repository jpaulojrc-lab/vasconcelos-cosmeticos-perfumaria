import React from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { formatBRL, formatInstallment } from '../utils/formatters';

export const FlashOffers: React.FC = () => {
  const { products, addToCart, setSelectedProduct, setIsProductModalOpen } = useStore();

  const featuredOffers = products.filter(p => p.isFlashSale);

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  if (featuredOffers.length === 0) return null;

  return (
    <section className="bg-white py-12 border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header — Prestige Retail Style */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-neutral-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1E3F] block mb-1">
              Beauty Week • Seleção Especial
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
              Destaques da Semana
            </h2>
          </div>
          <p className="text-xs text-neutral-500 max-w-md sm:text-right">
            Curadoria de fragrâncias e kits presenteáveis com condições exclusivas por tempo limitado.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredOffers.map((product) => (
            <div
              key={product.id}
              className="group bg-[#F9F8F6] rounded-xl border border-neutral-200 p-4 hover:border-neutral-400 transition-colors flex flex-col justify-between"
            >
              {/* Image Container */}
              <div
                className="relative aspect-square rounded-lg overflow-hidden bg-white mb-4 cursor-pointer border border-neutral-100"
                onClick={() => handleOpenDetail(product)}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Clean Discount Tag */}
                {product.discountPercent && (
                  <span className="absolute top-2.5 left-2.5 bg-[#8B1E3F] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    -{product.discountPercent}%
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                  <span>{product.category}</span>
                  <span>{product.volume}</span>
                </div>

                <h3
                  onClick={() => handleOpenDetail(product)}
                  className="text-sm font-bold text-neutral-950 line-clamp-1 group-hover:text-[#8B1E3F] transition-colors cursor-pointer"
                >
                  {product.name}
                </h3>

                <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5 mb-2.5">
                  {product.subtitle}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-3.5 h-3.5 fill-neutral-900 stroke-neutral-900" />
                  <span className="text-xs font-bold text-neutral-900">{product.rating.toFixed(1)}</span>
                  <span className="text-[11px] text-neutral-400">({product.reviewCount})</span>
                </div>

                {/* Pricing */}
                <div className="mt-auto pt-3 border-t border-neutral-200/80">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-neutral-950">
                      {formatBRL(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs line-through text-neutral-400">
                        {formatBRL(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {formatInstallment(product.price, 10)}
                  </p>
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => addToCart(product, 1)}
                  className="mt-3.5 w-full py-2.5 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Adicionar à Sacola</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
