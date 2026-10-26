import React from 'react';
import { Sparkles, Flame, Droplets, Smile, Gift, Layers } from 'lucide-react';
import { motion } from 'motion/react';
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
    tag: 'Sensação',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'skincare',
    name: 'Skincare',
    icon: Sparkles,
    tag: 'Alta Performance',
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
    name: 'Kits & Presentes',
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-amber-700 font-bold block mb-1">
            Coleções Exclusivas
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight font-display">
            Navegue por Categorias
          </h2>
          <p className="text-xs text-neutral-500 font-light">
            Selecione uma linha para explorar acordes olfativos e cuidados nobres
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-5">
        {CATEGORIES.map((cat, index) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(cat.id)}
              className={`group flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 border cursor-pointer ${
                isSelected
                  ? 'bg-amber-50/70 border-amber-400 shadow-md shadow-amber-500/10'
                  : 'bg-white border-neutral-200/70 hover:border-amber-300/80 hover:shadow-md'
              }`}
            >
              <div
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-2.5 p-0.5 border-2 transition duration-500 group-hover:scale-105 ${
                  isSelected ? 'border-amber-500 shadow-sm' : 'border-transparent'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
                {cat.tag && (
                  <span className="absolute bottom-0 inset-x-0 bg-neutral-900/85 backdrop-blur-xs text-[8px] font-black text-amber-300 py-0.5 tracking-tighter uppercase">
                    {cat.tag}
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-bold transition line-clamp-1 ${
                  isSelected ? 'text-amber-800' : 'text-neutral-800 group-hover:text-rose-600'
                }`}
              >
                {cat.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
