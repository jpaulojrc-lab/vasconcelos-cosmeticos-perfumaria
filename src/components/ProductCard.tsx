import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, Eye, Sparkles, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatBRL, formatInstallment } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isInWishlist, toggleWishlist, setSelectedProduct, setIsProductModalOpen } = useStore();
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const handleOpenModal = () => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const hasSecondaryImage = product.images.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-3xl border border-neutral-200/80 hover:border-amber-300/60 p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between relative"
    >
      {/* Top Image Showcase */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-[#FBF9F5] mb-3 cursor-pointer select-none"
        onClick={handleOpenModal}
      >
        {/* Primary Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            hasSecondaryImage && isHovered ? 'opacity-0 scale-105' : 'opacity-100 group-hover:scale-108'
          }`}
          loading="lazy"
        />

        {/* Secondary Image on Hover for Luxury Reveal */}
        {hasSecondaryImage && (
          <img
            src={product.images[1]}
            alt={`${product.name} detalhe`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
            loading="lazy"
          />
        )}

        {/* Subtle Vignette Gradient for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {product.discountPercent && (
            <span className="bg-rose-600 text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md shimmer-badge tracking-tight">
              -{product.discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-neutral-900/90 backdrop-blur-sm border border-amber-400/40 text-amber-300 text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              Best-Seller
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
              Exclusivo
            </span>
          )}
        </div>

        {/* Wishlist toggle with Spring bounce */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition shadow-md z-10 ${
            isFavorited
              ? 'bg-rose-600 text-white'
              : 'bg-white/90 backdrop-blur-sm text-neutral-600 hover:text-rose-600'
          }`}
          aria-label="Favoritar"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-white stroke-white' : ''}`} />
        </motion.button>

        {/* Quick view button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenModal();
          }}
          className="absolute bottom-2.5 right-2.5 p-2 bg-white/95 backdrop-blur-sm rounded-full text-neutral-700 hover:text-rose-600 hover:bg-white opacity-0 group-hover:opacity-100 transition duration-300 shadow-md hidden sm:block z-10 cursor-pointer"
          title="Espiar produto"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Body info */}
      <div className="flex-1 flex flex-col">
        {/* Rating */}
        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mb-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="text-neutral-400 font-normal">({product.reviewCount})</span>
        </div>

        <h3
          onClick={handleOpenModal}
          className="text-sm font-bold text-neutral-900 group-hover:text-rose-600 transition cursor-pointer line-clamp-1"
        >
          {product.name}
        </h3>

        <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5 mb-2.5 font-light">
          {product.subtitle}
        </p>

        {/* Pricing */}
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-neutral-900 font-display">
              {formatBRL(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                {formatBRL(product.originalPrice)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-rose-700 font-medium">
            {formatInstallment(product.price, 10)}
          </p>
        </div>

        {/* Add to bag action with animated feedback */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleAddToCart}
          className={`mt-3.5 w-full py-2.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all duration-300 shadow-xs cursor-pointer ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-neutral-900 hover:bg-rose-600 text-white shadow-neutral-900/10 hover:shadow-rose-600/20 hover:shadow-lg'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Adicionado!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Comprar</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
