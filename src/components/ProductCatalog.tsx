import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
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
    <section id="catalogo-produtos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Category Tabs & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
        
        {/* Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === c.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:bg-pink-50 hover:text-pink-600 border border-neutral-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-neutral-500">
          <span>{filteredProducts.length} produtos encontrados</span>

          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-full px-3 py-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-neutral-700 font-semibold focus:outline-hidden cursor-pointer"
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
        <div className="mt-4 flex items-center justify-between bg-pink-50 border border-pink-200 px-4 py-2.5 rounded-xl text-xs">
          <span className="text-pink-800">
            Resultados da busca por: <strong>"{searchQuery}"</strong>
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-pink-600 font-bold hover:underline"
          >
            Limpar busca
          </button>
        </div>
      )}

      {/* Grid of Products */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-300 mt-6 p-8">
          <Sparkles className="w-10 h-10 text-pink-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900">Nenhum produto encontrado</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Tente buscar por termos mais genéricos como "perfume", "creme" ou "splash".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('todos');
              setSearchQuery('');
            }}
            className="mt-4 px-6 py-2 rounded-full bg-pink-600 text-white text-xs font-bold"
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
