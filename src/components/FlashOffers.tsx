import React from 'react';
import { Flame, Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { formatBRL, formatInstallment } from '../utils/formatters';

export const FlashOffers: React.FC = () => {
  const { products, addToCart, setSelectedProduct, setIsProductModalOpen } = useStore();

  const flashProducts = products.filter(p => p.isFlashSale);

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  if (flashProducts.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-rose-50/60 to-white py-10 border-y border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5 text-red-600 animate-bounce" />
              OFERTAS RELÂMPAGO • ESTOQUE LIMITADO
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-display">
              Os Mais Desejados da Live
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Descontos de até 48% válidos apenas enquanto durarem os lotes promocionais.
            </p>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashProducts.map((product) => {
            const soldPercent = product.soldPercentage || 75;
            return (
              <div
                key={product.id}
                className="group bg-white rounded-3xl border border-pink-100 p-4 shadow-xs hover:shadow-xl hover:border-pink-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Badges */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 mb-4 cursor-pointer"
                  onClick={() => handleOpenDetail(product)}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  
                  {/* Discount percentage tag */}
                  {product.discountPercent && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md">
                      -{product.discountPercent}% OFF
                    </span>
                  )}

                  {/* Quick look preview button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(product);
                    }}
                    className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full text-neutral-700 hover:text-pink-600 shadow-md transition hover:scale-110"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-pink-600 mb-1">
                    {product.category} • {product.volume}
                  </div>

                  <h3
                    onClick={() => handleOpenDetail(product)}
                    className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-pink-600 transition cursor-pointer"
                  >
                    {product.name}
                  </h3>

                  <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5 mb-3">
                    {product.subtitle}
                  </p>

                  {/* Pricing */}
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-neutral-900 font-display">
                        {formatBRL(product.price)}
                      </span>
                      <span className="text-xs line-through text-neutral-400">
                        {formatBRL(product.originalPrice)}
                      </span>
                    </div>
                    <p className="text-[11px] text-pink-700 font-medium">
                      ou {formatInstallment(product.price, 10)}
                    </p>
                  </div>

                  {/* Stock meter */}
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-red-600 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-500" />
                        {soldPercent}% vendido
                      </span>
                      <span className="text-neutral-500">Restam {product.stock} un.</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${soldPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="mt-4 w-full py-2.5 rounded-full bg-neutral-900 hover:bg-pink-600 text-white text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-pink-600/10"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Adicionar à Sacola</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
