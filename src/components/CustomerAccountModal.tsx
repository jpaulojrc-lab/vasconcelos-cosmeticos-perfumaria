import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  LogOut, 
  Truck, 
  Copy
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBRL, formatDate } from '../utils/formatters';

export const CustomerAccountModal: React.FC = () => {
  const { 
    isAccountOpen, 
    setIsAccountOpen, 
    currentUser, 
    logout, 
    orders, 
    wishlist, 
    products, 
    addToCart
  } = useStore();

  const [activeTab, setActiveTab] = useState<'pedidos' | 'favoritos' | 'enderecos'>('pedidos');
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  if (!isAccountOpen || !currentUser) return null;

  const favoriteProducts = products.filter(p => wishlist.includes(p.id));

  const myOrders = orders.filter(o => 
    o.customer.email.toLowerCase() === currentUser.email.toLowerCase() ||
    o.customer.name.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])
  );

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(code);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-neutral-200 my-8">
        
        {/* Header */}
        <div className="p-6 bg-[#111111] text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.name}
              className="w-13 h-13 rounded-full object-cover border border-white/25"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">{currentUser.name}</h2>
                <span className="text-[9px] bg-white/15 border border-white/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Insider
                </span>
              </div>
              <p className="text-xs text-neutral-400">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                setIsAccountOpen(false);
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 transition cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsAccountOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 text-xs font-bold uppercase tracking-wider bg-[#F7F6F2] px-6">
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'pedidos'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Meus Pedidos ({myOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favoritos')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 ml-6 transition cursor-pointer ${
              activeTab === 'favoritos'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Lista de Desejos ({favoriteProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('enderecos')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 ml-6 transition cursor-pointer ${
              activeTab === 'enderecos'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Endereços</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          
          {/* TAB 1: MEUS PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div className="space-y-4">
              {myOrders.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs">
                  Você ainda não realizou nenhum pedido.
                </div>
              ) : (
                myOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-[#F7F6F2] space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-900 text-sm">
                            {order.orderNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.orderStatus === 'entregue'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.orderStatus === 'enviado'
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-200 text-neutral-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500">{formatDate(order.createdAt)}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-neutral-950">{formatBRL(order.total)}</span>
                        <span className="block text-[10px] text-neutral-500">
                          {order.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : order.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded border border-neutral-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-neutral-900 truncate">{item.name}</p>
                            <p className="text-neutral-500">{item.quantity} un. x {formatBRL(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tracking timeline */}
                    {order.trackingCode && (
                      <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-neutral-700">
                          <Truck className="w-4 h-4 text-neutral-900" />
                          <span>Código de Rastreamento:</span>
                          <strong className="font-mono bg-white px-2 py-0.5 rounded border border-neutral-300">
                            {order.trackingCode}
                          </strong>
                        </div>

                        <button
                          onClick={() => handleCopyTracking(order.trackingCode!)}
                          className="text-neutral-900 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedTracking === order.trackingCode ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: FAVORITOS */}
          {activeTab === 'favoritos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteProducts.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-neutral-400 text-xs">
                  Sua lista de desejos está vazia.
                </div>
              ) : (
                favoriteProducts.map((p) => (
                  <div key={p.id} className="p-3 bg-[#F7F6F2] rounded-xl border border-neutral-200 flex items-center gap-3">
                    <img src={p.images[0]} alt={p.name} className="w-16 h-16 object-cover rounded-lg border border-neutral-200" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">{p.name}</h4>
                      <p className="text-xs font-extrabold text-neutral-950">{formatBRL(p.price)}</p>
                      
                      <button
                        onClick={() => addToCart(p, 1)}
                        className="mt-2 px-3 py-1.5 bg-[#111111] hover:bg-[#8B1E3F] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Mover para Sacola</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: ENDEREÇOS */}
          {activeTab === 'enderecos' && (
            <div className="space-y-3">
              {currentUser.addresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-xl border border-neutral-200 bg-[#F7F6F2] flex items-start justify-between">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">{addr.name}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-600">
                      {addr.logradouro}, {addr.numero} {addr.complemento ? `(${addr.complemento})` : ''}
                    </p>
                    <p className="text-neutral-600">
                      {addr.bairro} • {addr.localidade} - {addr.uf}
                    </p>
                    <p className="font-mono text-neutral-500">CEP: {addr.cep}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
