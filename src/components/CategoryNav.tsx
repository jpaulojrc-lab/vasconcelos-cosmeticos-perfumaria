import React from 'react';
import { Sparkles, Flame, Droplets, Smile, Gift, Layers } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ElementType;
  tag?: string;
  image: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'todos',
    name: 'Ver Tudo',
    icon: Layers,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'perfumaria',
    name: 'Perfumaria',
    icon: Flame,
    tag: 'Mais Desejados',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'bodysplash',
    name: 'Body Splash',
    icon: Droplets,
    tag: 'Viralizou',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'skincare',
    name: 'Skincare',
    icon: Sparkles,
    tag: 'Alta Eficácia',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'maquiagem',
    name: 'Maquiagem',
    icon: Smile,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'combos',
    name: 'Kits & Combos',
    icon: Gift,
    tag: 'Até 48% OFF',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=300&q=80'
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight font-display">
            Navegue por Categorias
          </h2>
          <p className="text-xs text-neutral-500">Escolha sua linha favorita vasconcelos Presente</p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`group flex flex-col items-center text-center p-3 rounded-2xl transition border ${
                isSelected
                  ? 'bg-pink-50 border-pink-400 shadow-sm'
                  : 'bg-white border-neutral-100 hover:border-pink-200 hover:shadow-xs'
              }`}
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-2.5 p-0.5 border-2 transition duration-300 group-hover:scale-105"
                style={{ borderColor: isSelected ? '#E91E63' : 'transparent' }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl"
                />
                {cat.tag && (
                  <span className="absolute bottom-0 inset-x-0 bg-neutral-900/80 backdrop-blur-xs text-[8px] font-extrabold text-pink-300 py-0.5 tracking-tight uppercase">
                    {cat.tag}
                  </span>
                )}
              </div>
              <span className={`text-xs font-bold transition ${
                isSelected ? 'text-pink-600' : 'text-neutral-800 group-hover:text-pink-600'
              }`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
