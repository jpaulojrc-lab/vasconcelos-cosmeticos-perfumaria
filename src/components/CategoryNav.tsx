import React from 'react';
import { useStore } from '../context/StoreContext';

interface CategoryItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'todos',
    name: 'Todo o Catálogo',
    subtitle: 'Curadoria completa',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'perfumaria',
    name: 'Perfumaria Fina',
    subtitle: 'Eau de Parfum',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'bodysplash',
    name: 'Body Splash',
    subtitle: 'Perfumação diária',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'skincare',
    name: 'Skincare',
    subtitle: 'Fórmulas clínicas',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'maquiagem',
    name: 'Maquiagem',
    subtitle: 'Lábios & Rosto',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'combos',
    name: 'Estojos & Kits',
    subtitle: 'Para presentear',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80'
  }
];

export const CategoryNav: React.FC = () => {
  const { selectedCategory, setSelectedCategory, setViewMode } = useStore();

  const handleSelect = (id: string) => {
    setSelectedCategory(id);
    setViewMode('store');
    const catalogEl = document.getElementById('catalogo-produtos');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold block mb-1">
            Departamentos
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
            Compre por Categoria
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`group text-left rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer flex flex-col bg-white ${
                isSelected
                  ? 'border-neutral-950 ring-1 ring-neutral-950 shadow-sm'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <div className="aspect-4/3 w-full overflow-hidden bg-[#F2F0EC]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <span className="block text-xs font-bold text-neutral-950 group-hover:text-[#8B1E3F] transition-colors">
                  {cat.name}
                </span>
                <span className="block text-[11px] text-neutral-500 mt-0.5">
                  {cat.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
