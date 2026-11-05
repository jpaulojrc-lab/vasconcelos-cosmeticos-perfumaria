import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Search,
  ShoppingBag,
  Smartphone,
  FileText
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery
  } = useStore();
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'rating'>('relevance');

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
        const matchesSearch =
          searchQuery.trim() === '' ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
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
    { id: 'combos', label: 'Estojos & Kits' }
  ];

  return (
    <section id="catalogo-produtos" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 pb-28 md:pb-12">
      {/* Guia Visual Exclusivo para Celular (md:hidden) — Para o cliente entender cada passo */}
      <div className="md:hidden mb-5 p-3.5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B1E3F]">
            Compra Fácil pelo Celular • 3 Passos
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Frete Grátis
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-[#F7F6F2] border border-neutral-200">
            <ShoppingBag className="w-4 h-4 mx-auto text-neutral-900 mb-1" />
            <p className="text-[10px] font-extrabold text-neutral-900 leading-tight">
              1. Escolha o Perfume
            </p>
            <p className="text-[9px] text-neutral-500 mt-0.5">Toque em Adicionar</p>
          </div>

          <div className="p-2 rounded-xl bg-[#F7F6F2] border border-neutral-200">
            <Smartphone className="w-4 h-4 mx-auto text-emerald-700 mb-1" />
            <p className="text-[10px] font-extrabold text-neutral-900 leading-tight">
              2. Nome e WhatsApp
            </p>
            <p className="text-[9px] text-neutral-500 mt-0.5">Valide seu código</p>
          </div>

          <div className="p-2 rounded-xl bg-[#F7F6F2] border border-neutral-200">
            <FileText className="w-4 h-4 mx-auto text-[#8B1E3F] mb-1" />
            <p className="text-[10px] font-extrabold text-neutral-900 leading-tight">
              3. PDF & Saldo
            </p>
            <p className="text-[9px] text-neutral-500 mt-0.5">Controle simples</p>
          </div>
        </div>
      </div>

      {/* Category Tabs & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-neutral-200 gap-3.5">
        {/* Clean Commercial Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
          {categories.map((c) => {
            const isActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-white text-neutral-600 hover:text-neutral-950 border border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-neutral-500">
          <span>
            <strong className="text-neutral-900 font-bold">{filteredProducts.length}</strong> produtos disponíveis
          </span>

          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-neutral-900 text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="relevance">Mais Relevantes</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="rating">Melhor Avaliados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Search Badge */}
      {searchQuery && (
        <div className="mt-4 flex items-center justify-between bg-white border border-neutral-200 px-4 py-2.5 rounded-lg text-xs">
          <span className="text-neutral-700">
            Resultados para: <strong className="text-neutral-950">"{searchQuery}"</strong>
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-[#8B1E3F] font-bold hover:underline cursor-pointer"
          >
            Limpar filtro
          </button>
        </div>
      )}

      {/* Grid of Products */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-neutral-200 mt-6 p-8">
          <Search className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900">Nenhum produto encontrado</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Tente buscar por termos como "perfume", "sérum" ou "body splash".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('todos');
              setSearchQuery('');
            }}
            className="mt-5 px-6 py-2.5 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Mostrar todo o catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};
