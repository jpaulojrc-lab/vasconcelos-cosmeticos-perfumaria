import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Heart, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  MessageSquare,
  ThumbsUp,
  UserCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBRL, formatInstallment } from '../utils/formatters';

export const ProductModal: React.FC = () => {
  const { 
    selectedProduct, 
    isProductModalOpen, 
    setIsProductModalOpen, 
    addToCart, 
    isInWishlist, 
    toggleWishlist,
    calculateShipping,
    getProductReviews,
    addReview
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cepInput, setCepInput] = useState('');
  const [shippingResults, setShippingResults] = useState<any[] | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');

  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (!isProductModalOpen || !selectedProduct) return null;

  const isFavorited = isInWishlist(selectedProduct.id);
  const reviews = getProductReviews(selectedProduct.id);

  const handleSimulateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setShippingError('');
    setShippingLoading(true);
    try {
      const res = await calculateShipping(cepInput);
      setShippingResults(res.quotes);
    } catch (err: any) {
      setShippingError(err.message || 'Erro ao calcular frete');
    } finally {
      setShippingLoading(false);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewTitle || !newReviewComment || !newReviewName) return;

    addReview({
      productId: selectedProduct.id,
      userName: newReviewName,
      rating: newReviewRating,
      title: newReviewTitle,
      comment: newReviewComment,
      verifiedPurchase: true,
      recommended: true
    });

    setReviewSuccess(true);
    setTimeout(() => {
      setShowReviewForm(false);
      setReviewSuccess(false);
      setNewReviewTitle('');
      setNewReviewComment('');
      setNewReviewName('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-pink-100 my-8">
        
        {/* Close Button */}
        <button
          onClick={() => setIsProductModalOpen(false)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-neutral-100 text-neutral-600 hover:bg-pink-100 hover:text-pink-600 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 relative">
              <img
                src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              {selectedProduct.discountPercent && (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                  -{selectedProduct.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail selector */}
            {selectedProduct.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {selectedProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === idx ? 'border-pink-600 ring-2 ring-pink-200' : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Olfactory Notes OR Skincare Actives Card */}
            {selectedProduct.notes && (
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs space-y-2">
                <p className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-pink-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  Pirâmide Olfativa Exclusiva
                </p>
                <div className="space-y-1 text-neutral-600">
                  <p><strong>Topo:</strong> {selectedProduct.notes.topo}</p>
                  <p><strong>Coração:</strong> {selectedProduct.notes.coracao}</p>
                  <p><strong>Fundo:</strong> {selectedProduct.notes.fundo}</p>
                </div>
              </div>
            )}

            {selectedProduct.actives && (
              <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs space-y-2">
                <p className="font-bold text-pink-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                  Ativos Dermatológicos de Alta Performance
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedProduct.actives.map((act, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-white text-pink-800 font-semibold border border-pink-200 text-[11px]">
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Actions */}
          <div className="md:col-span-6 space-y-5 flex flex-col justify-between">
            <div>
              {/* Category & Volume */}
              <div className="flex items-center justify-between text-xs text-neutral-500 font-bold uppercase tracking-wider">
                <span className="text-pink-600">{selectedProduct.category}</span>
                <span>Conteúdo: {selectedProduct.volume}</span>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 font-display mt-1">
                {selectedProduct.name}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">{selectedProduct.subtitle}</p>

              {/* Rating header */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(selectedProduct.rating)
                          ? 'fill-amber-400 stroke-amber-400'
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-neutral-800 font-extrabold">{selectedProduct.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs text-neutral-500 underline cursor-pointer">
                  {selectedProduct.reviewCount} avaliações verificadas
                </span>
              </div>

              {/* Pricing Box */}
              <div className="mt-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-neutral-900 font-display">
                    {formatBRL(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-sm text-neutral-400 line-through">
                      {formatBRL(selectedProduct.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-pink-700 mt-1">
                  ou {formatInstallment(selectedProduct.price, 10)}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  5% de desconto extra pagando via PIX à vista
                </p>
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Descrição
                </h4>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Benefits Checklist */}
              {selectedProduct.benefits && (
                <div className="mt-4 space-y-1.5">
                  {selectedProduct.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-neutral-700">
                      <div className="w-4 h-4 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity & Buy Button */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center border border-neutral-300 rounded-full px-3 py-1.5 bg-neutral-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-pink-600 font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-pink-600 font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedProduct, quantity);
                    setIsProductModalOpen(false);
                  }}
                  className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-neutral-900 to-black hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Adicionar à Sacola</span>
                </button>

                <button
                  onClick={() => toggleWishlist(selectedProduct.id)}
                  className={`p-3.5 rounded-full border transition ${
                    isFavorited
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'border-neutral-300 text-neutral-600 hover:text-pink-600 bg-white'
                  }`}
                  aria-label="Favoritar"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
                </button>
              </div>

              {/* Real-time CEP Shipping simulation inside product view */}
              <div className="mt-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                <form onSubmit={handleSimulateShipping} className="space-y-2">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-pink-600" />
                    Calcular frete e prazo de entrega
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="00000-000"
                      maxLength={9}
                      value={cepInput}
                      onChange={(e) => setCepInput(e.target.value)}
                      className="flex-1 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:border-pink-500"
                    />
                    <button
                      type="submit"
                      disabled={shippingLoading}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                    >
                      {shippingLoading ? 'Calculando...' : 'Calcular'}
                    </button>
                  </div>
                </form>

                {shippingError && (
                  <p className="text-xs text-red-600 mt-2 font-medium">{shippingError}</p>
                )}

                {shippingResults && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-neutral-200">
                    {shippingResults.map((quote) => (
                      <div key={quote.id} className="flex items-center justify-between text-xs py-1">
                        <div>
                          <span className="font-semibold text-neutral-800">{quote.name}</span>
                          <span className="block text-[10px] text-neutral-500">
                            Prazo estimado: {quote.deliveryDays} {quote.deliveryDays === 1 ? 'dia útil' : 'dias úteis'}
                          </span>
                        </div>
                        <span className="font-bold text-neutral-900">
                          {quote.price === 0 ? (
                            <strong className="text-emerald-600">GRÁTIS</strong>
                          ) : (
                            formatBRL(quote.price)
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="mt-8 pt-6 border-t border-neutral-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-pink-600" />
                  Avaliações de Clientes ({reviews.length})
                </h3>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="text-xs font-bold text-pink-600 hover:underline"
                >
                  {showReviewForm ? 'Cancelar' : 'Avaliar este Produto'}
                </button>
              </div>

              {/* Review Submission Form */}
              {showReviewForm && (
                <form onSubmit={handleAddReview} className="bg-pink-50/50 border border-pink-200 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-neutral-900">Deixe sua opinião sincera</h4>
                  
                  {/* Rating Selector */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition"
                      >
                        <Star className={`w-5 h-5 ${star <= newReviewRating ? 'fill-amber-400' : 'text-neutral-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-neutral-700 ml-2">{newReviewRating} estrelas</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    required
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Título da avaliação (ex: Fixação surpreendente!)"
                    required
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs"
                  />
                  <textarea
                    rows={3}
                    placeholder="Conte como foi sua experiência com o produto..."
                    required
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs"
                  />

                  {reviewSuccess ? (
                    <div className="p-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg text-center">
                      Avaliação enviada com sucesso! Obrigado pelo carinho.
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      Publicar Avaliação
                    </button>
                  )}
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">Seja a primeira pessoa a avaliar este produto!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-[10px]">
                            {rev.userName.charAt(0)}
                          </div>
                          <span className="font-bold text-neutral-900">{rev.userName}</span>
                          {rev.verifiedPurchase && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              <UserCheck className="w-3 h-3" />
                              Compra Verificada
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400">{rev.date}</span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 stroke-amber-400' : 'text-neutral-300'
                            }`}
                          />
                        ))}
                        <span className="text-[11px] font-bold text-neutral-800 ml-1">{rev.title}</span>
                      </div>

                      <p className="text-neutral-600 leading-relaxed text-xs">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
