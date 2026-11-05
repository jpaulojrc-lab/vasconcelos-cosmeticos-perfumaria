import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatBRL, formatInstallment } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, setSelectedProduct, setIsProductModalOpen } = useStore();
  const [addedFeedback, setAddedFeedback] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1200);
  };

  const handleOpenDetail = () => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <div
      onClick={handleOpenDetail}
      className="group bg-white rounded-xl border border-neutral-200 hover:border-neutral-400 transition-colors duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-4/5 bg-[#F6F5F2] overflow-hidden border-b border-neutral-100">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
          loading="lazy"
        />

        {/* Minimal Prestige Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isBestSeller && (
            <span className="bg-[#111111] text-white text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded">
              Best-Seller
            </span>
          )}
          {product.discountPercent && (
            <span className="bg-[#8B1E3F] text-white text-[10px] font-bold px-2 py-0.5 rounded w-fit">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full transition-colors cursor-pointer ${
            isFavorited
              ? 'bg-[#8B1E3F] text-white'
              : 'bg-white/90 text-neutral-700 hover:text-[#8B1E3F]'
          }`}
          aria-label="Adicionar à Lista de Desejos"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white stroke-white' : ''}`} />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Volume */}
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 mb-1">
            <span>{product.category}</span>
            <span>{product.volume}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-bold text-neutral-950 line-clamp-2 group-hover:text-[#8B1E3F] transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Subtitle / Olfactory family */}
          <p className="text-xs text-neutral-500 line-clamp-1 mt-1">
            {product.subtitle}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-3.5 h-3.5 fill-neutral-900 stroke-neutral-900" />
            <span className="text-xs font-bold text-neutral-900">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-neutral-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-extrabold text-neutral-950">
              {formatBRL(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                {formatBRL(product.originalPrice)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {formatInstallment(product.price, 10)}
          </p>

          <button
            onClick={handleQuickAdd}
            className={`mt-3 w-full py-2.5 px-3 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              addedFeedback
                ? 'bg-emerald-700 text-white'
                : 'bg-[#111111] hover:bg-[#8B1E3F] text-white'
            }`}
          >
            {addedFeedback ? (
              <>
                <Check className="w-4 h-4" />
                <span>Adicionado</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Adicionar à Sacola</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
