import React from 'react';
import { Flame, Sparkles, ShoppingBag, Eye, Zap } from 'lucide-react';
import { motion } from 'motion/react';
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
    <section className="bg-gradient-to-b from-[#F7F3EE] via-[#FAF8F5] to-white py-12 border-y border-amber-200/40 relative overflow-hidden">
      {/* Subtle luxury glow effect in background */}
      <div className="absolute top-0 right-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-600/10 text-rose-700 border border-rose-500/20 text-xs font-black uppercase tracking-wider mb-2.5 shimmer-badge">
              <Zap className="w-3.5 h-3.5 text-rose-600" />
              OFERTAS RELÂMPAGO • LOTE LIMITADO
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 font-display">
              Os Mais Desejados da Live
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-light mt-0.5">
              Condições especiais com até 48% de desconto enquanto durarem os estoques do lote exclusivo.
            </p>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashProducts.map((product) => {
            const soldPercent = product.soldPercentage || 75;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="group bg-white rounded-3xl border border-neutral-200/80 p-4 shadow-sm hover:shadow-xl hover:border-amber-300/80 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Image Showcase */}
                <div
                  className="relative aspect-square rounded-2xl overflow-hidden bg-[#FAF8F5] mb-4 cursor-pointer"
                  onClick={() => handleOpenDetail(product)}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-106 transition duration-700 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Discount percentage tag */}
                  {product.discountPercent && (
                    <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md shimmer-badge tracking-tight">
                      -{product.discountPercent}% OFF
                    </span>
                  )}

                  {/* Quick look preview button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(product);
                    }}
                    className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full text-neutral-700 hover:text-rose-600 shadow-md transition cursor-pointer"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                    {product.category} • {product.volume}
                  </div>

                  <h3
                    onClick={() => handleOpenDetail(product)}
                    className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-rose-600 transition cursor-pointer"
                  >
                    {product.name}
                  </h3>

                  <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5 mb-3 font-light">
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
                    <p className="text-[11px] text-rose-700 font-medium">
                      ou {formatInstallment(product.price, 10)}
                    </p>
                  </div>

                  {/* Stock meter */}
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-[11px] mb-1.5 font-semibold">
                      <span className="text-rose-600 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-500" />
                        {soldPercent}% reservado
                      </span>
                      <span className="text-neutral-500 font-normal">Restam {product.stock} un.</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden p-0.5">
                      <div
                        className="bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 h-full rounded-full transition-all duration-700"
                        style={{ width: `${soldPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Buy Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => addToCart(product, 1)}
                    className="mt-4 w-full py-2.5 rounded-full bg-neutral-900 hover:bg-rose-600 text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition duration-300 shadow-sm hover:shadow-lg hover:shadow-rose-600/20 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Adicionar à Sacola</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
