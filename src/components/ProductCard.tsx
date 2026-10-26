import React from 'react';
import { Star, Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatBRL, formatInstallment } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isInWishlist, toggleWishlist, setSelectedProduct, setIsProductModalOpen } = useStore();

  const isFavorited = isInWishlist(product.id);

  const handleOpenModal = () => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <div className="group bg-white rounded-3xl border border-neutral-200/80 hover:border-pink-300 p-3.5 sm:p-4 transition-all duration-300 hover:shadow-xl flex flex-col justify-between relative">
      
      {/* Top Badges & Wishlist */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 mb-3 cursor-pointer"
        onClick={handleOpenModal}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.discountPercent && (
            <span className="bg-pink-600 text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">
              -{product.discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-neutral-900 text-amber-300 text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-tight flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Best-Seller
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-tight">
              Novo
            </span>
          )}
        </div>

        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition shadow-md ${
            isFavorited
              ? 'bg-pink-600 text-white'
              : 'bg-white/90 text-neutral-600 hover:text-pink-600'
          }`}
          aria-label="Favoritar"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-white' : ''}`} />
        </button>

        {/* Quick view button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenModal();
          }}
          className="absolute bottom-2.5 right-2.5 p-2 bg-white/90 rounded-full text-neutral-700 hover:text-pink-600 opacity-0 group-hover:opacity-100 transition shadow-md hidden sm:block"
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
          className="text-sm font-bold text-neutral-900 group-hover:text-pink-600 transition cursor-pointer line-clamp-1"
        >
          {product.name}
        </h3>

        <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5 mb-2.5">
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
          <p className="text-[11px] text-pink-700 font-semibold">
            {formatInstallment(product.price, 10)}
          </p>
        </div>

        {/* Add to bag action */}
        <button
          onClick={() => addToCart(product, 1)}
          className="mt-3.5 w-full py-2.5 rounded-full bg-neutral-900 hover:bg-pink-600 text-white text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Comprar</span>
        </button>
      </div>
    </div>
  );
};
