import React, { useState } from 'react';
import { Sparkles, Clock, BookOpen, ChevronRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BlogPost, Product } from '../types';
import { INITIAL_BLOG_POSTS } from '../data/mockData';
import { formatBRL } from '../utils/formatters';

export const BlogSection: React.FC = () => {
  const { products, addToCart, setSelectedProduct, setIsProductModalOpen, setViewMode } = useStore();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const posts = INITIAL_BLOG_POSTS;

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Blog Article Detail View */}
      {selectedPost ? (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
          <button
            onClick={() => setSelectedPost(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-pink-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar a todos os artigos</span>
          </button>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedPost.tags.map((t, i) => (
                <span key={i} className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded-full">
                  {t}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 leading-tight font-display">
              {selectedPost.title}
            </h1>

            <div className="flex items-center gap-3 pt-2">
              <img
                src={selectedPost.author.avatar}
                alt={selectedPost.author.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500"
              />
              <div>
                <p className="text-xs font-bold text-neutral-900">{selectedPost.author.name}</p>
                <p className="text-[11px] text-neutral-500">{selectedPost.author.role} • {selectedPost.readTime}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden aspect-16/9 shadow-lg">
            <img
              src={selectedPost.coverImage}
              alt={selectedPost.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Body */}
          <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed space-y-4 text-sm sm:text-base">
            {selectedPost.content.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Marketing Integration: Shop the Post */}
          <div className="p-6 rounded-3xl bg-pink-50/60 border border-pink-200 space-y-4 mt-8">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-600" />
              <h3 className="text-base font-extrabold text-neutral-900 font-display">
                Compre os Produtos Desta Matéria
              </h3>
            </div>
            <p className="text-xs text-neutral-600">
              Aproveite os segredos revelados nesta matéria e garanta sua rotina com até 10x sem juros:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedPost.relatedProductIds.map((pid) => {
                const prod = products.find(p => p.id === pid);
                if (!prod) return null;
                return (
                  <div key={prod.id} className="bg-white p-3.5 rounded-2xl border border-neutral-200 flex items-center gap-3 shadow-xs">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-16 h-16 object-cover rounded-xl shrink-0 cursor-pointer"
                      onClick={() => handleOpenProduct(prod)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        onClick={() => handleOpenProduct(prod)}
                        className="text-xs font-bold text-neutral-900 truncate hover:text-pink-600 cursor-pointer"
                      >
                        {prod.name}
                      </h4>
                      <p className="text-xs font-black text-pink-600 mt-0.5">{formatBRL(prod.price)}</p>
                      
                      <button
                        onClick={() => addToCart(prod, 1)}
                        className="mt-2 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-pink-600 text-white text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Blog List View */
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-pink-600 px-3 py-1 rounded-full bg-pink-100">
              Blog & Marketing de Beleza
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 font-display">
              Universo vasconcelos <span className="text-pink-600 font-serif-luxury italic font-normal">Presente</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Dicas de perfumaria fina, cuidados com a pele, tutoriais de maquiagem e tendências do mundo da beleza.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-pink-300 transition duration-300 flex flex-col cursor-pointer"
              >
                <div className="aspect-16/10 overflow-hidden relative">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-pink-400" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex gap-2 mb-2">
                      {post.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-base font-bold text-neutral-900 group-hover:text-pink-600 transition line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-xs text-neutral-500 line-clamp-2 mt-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-600">{post.author.name}</span>
                    <span className="text-pink-600 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition">
                      Ler Artigo <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
