import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

export const ProductCatalog: React.FC = () => {
  const { products, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStore();
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'rating'>('relevance');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
      
      // Search filter
      const matchesSearch = searchQuery.trim() === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const categories = [
    { id: 'todos', label: 'Todos os Produtos' },
    { id: 'perfumaria', label: 'Perfumaria' },
    { id: 'bodysplash', label: 'Body Splash' },
    { id: 'skincare', label: 'Skincare' },
    { id: 'maquiagem', label: 'Maquiagem' },
    { id: 'combos', label: 'Kits & Combos' }
  ];

  return (
    <section id="catalogo-produtos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Category Tabs & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-200/80 gap-4">
        
        {/* Pills with subtle luxury borders */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((c) => {
            const isActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-md shadow-neutral-900/10'
                    : 'bg-white text-neutral-600 hover:text-neutral-900 hover:border-amber-300 border border-neutral-200/80'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                )}
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-neutral-500">
          <span className="font-medium">
            <strong className="text-neutral-800 font-bold">{filteredProducts.length}</strong> produtos selecionados
          </span>

          <div className="flex items-center gap-2 bg-white border border-neutral-200/90 rounded-full px-3.5 py-1.5 shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-neutral-800 text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="relevance">Mais Populares</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="rating">Melhor Avaliados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Search Badge */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-between bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-2xl text-xs"
        >
          <span className="text-rose-900">
            Resultados da busca por: <strong>"{searchQuery}"</strong>
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-rose-600 font-bold hover:underline cursor-pointer"
          >
            Limpar busca
          </button>
        </motion.div>
      )}

      {/* Grid of Products */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-300 mt-6 p-8">
          <Sparkles className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900 font-display">Nenhum produto encontrado</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto font-light">
            Tente buscar por termos mais genéricos como "perfume", "creme" ou "splash".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('todos');
              setSearchQuery('');
            }}
            className="mt-5 px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-rose-600 text-white text-xs font-bold transition duration-300 cursor-pointer"
          >
            Ver catálogo completo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </section>
  );
};
