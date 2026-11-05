import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Heart,
  MapPin,
  LogOut,
  Truck,
  Copy,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBRL, formatDate } from '../utils/formatters';
import { generateOrderConditionsPdf } from '../utils/pdfGenerator';

function formatReceiptDateBr(dateStr: string): string {
  if (!dateStr) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
  return dateStr;
}

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

  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  const myOrders = orders.filter(
    (o) =>
      o.customer.email.toLowerCase() === currentUser.email.toLowerCase() ||
      o.customer.name.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])
  );

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(code);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-neutral-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#111111] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <img
              src={
                currentUser.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
              }
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover border border-white/25"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">{currentUser.name}</h2>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Cliente Validado
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {currentUser.phone ? `${currentUser.phone} • ` : ''}
                {currentUser.email}
              </p>
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
        <div className="flex border-b border-neutral-200 text-xs font-bold uppercase tracking-wider bg-[#F7F6F2] px-4 sm:px-6 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'pedidos'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Meus Pedidos & Saldo ({myOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favoritos')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 ml-5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'favoritos'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Favoritos ({favoriteProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('enderecos')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 ml-5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'enderecos'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Entrega</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: MEUS PEDIDOS & RESUMO DE SALDO */}
          {activeTab === 'pedidos' && (
            <div className="space-y-4">
              {myOrders.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs">
                  Você ainda não realizou nenhum pedido.
                </div>
              ) : (
                myOrders.map((order) => {
                  const receipts = order.paymentReceipts || [];
                  const totalPaid =
                    receipts.length > 0
                      ? receipts.reduce((s, r) => s + Number(r.amount || 0), 0)
                      : order.paymentStatus === 'paid'
                        ? order.total
                        : 0;
                  const remainingBalance = Math.max(0, order.total - totalPaid);
                  const isPaidOff = remainingBalance <= 0.01 && totalPaid > 0;

                  return (
                    <div
                      key={order.id}
                      className="p-4 sm:p-5 rounded-2xl border border-neutral-200 bg-[#F7F6F2] space-y-3.5"
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-neutral-900 text-sm">
                              {order.orderNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isPaidOff
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-neutral-200 text-neutral-800'
                              }`}
                            >
                              {isPaidOff ? 'Quitado' : order.orderStatus}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold text-neutral-950">
                            {formatBRL(order.total)}
                          </span>
                          <span className="block text-[10px] text-emerald-700 font-bold">
                            VasconcelosExpress (Grátis)
                          </span>
                        </div>
                      </div>

                      {/* Resumo Claro de Saldo da Compra para o Cliente */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
                          <span className="text-[9px] font-bold uppercase text-neutral-500 block">
                            Valor Total
                          </span>
                          <p className="text-xs font-extrabold text-neutral-950 mt-0.5">
                            {formatBRL(order.total)}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="text-[9px] font-bold uppercase text-emerald-800 block">
                            Já Pago
                          </span>
                          <p className="text-xs font-extrabold text-emerald-700 mt-0.5">
                            {formatBRL(totalPaid)}
                          </p>
                        </div>

                        <div
                          className={`p-2.5 rounded-xl border ${
                            isPaidOff
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-amber-50 border-amber-300'
                          }`}
                        >
                          <span
                            className={`text-[9px] font-bold uppercase block ${
                              isPaidOff ? 'text-emerald-800' : 'text-amber-900'
                            }`}
                          >
                            Saldo a Pagar
                          </span>
                          <p
                            className={`text-xs font-extrabold mt-0.5 ${
                              isPaidOff ? 'text-emerald-700' : 'text-[#8B1E3F]'
                            }`}
                          >
                            {isPaidOff ? 'R$ 0,00 ✅' : formatBRL(remainingBalance)}
                          </p>
                        </div>
                      </div>

                      {/* Datas e Valores Recebidos pelo ADM */}
                      {receipts.length > 0 && (
                        <div className="bg-white rounded-xl p-2.5 border border-emerald-200 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Pagamentos Confirmados pela Administração:
                          </span>
                          {receipts.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center justify-between text-xs text-neutral-800"
                            >
                              <span>
                                📅 Data: <strong>{formatReceiptDateBr(r.date)}</strong> (
                                {r.method || 'PIX'})
                              </span>
                              <span className="font-extrabold text-emerald-700">
                                {formatBRL(r.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

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
                              <p className="text-neutral-500">
                                {item.quantity} un. x {formatBRL(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tracking timeline */}
                      {order.trackingCode && (
                        <div className="pt-2.5 border-t border-neutral-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-neutral-700">
                            <Truck className="w-4 h-4 text-neutral-900" />
                            <span>Protocolo:</span>
                            <strong className="font-mono bg-white px-2 py-0.5 rounded border border-neutral-300">
                              {order.trackingCode}
                            </strong>
                          </div>

                          <button
                            onClick={() => handleCopyTracking(order.trackingCode!)}
                            className="text-neutral-900 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>
                              {copiedTracking === order.trackingCode ? 'Copiado!' : 'Copiar'}
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Condições do ADM & Botão de PDF */}
                      <div className="pt-2.5 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] text-neutral-600">
                          Entrega: <strong className="text-emerald-700">VasconcelosExpress (Grátis)</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            generateOrderConditionsPdf({
                              order,
                              customTermsNote: order.adminPaymentTerms,
                              firstDueDate: order.adminFirstDueDate,
                              paymentReceipts: order.paymentReceipts
                            })
                          }
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#8B1E3F] text-white text-xs font-bold transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Baixar PDF de Condições & Saldo</span>
                        </button>
                      </div>
                    </div>
                  );
                })
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
                  <div
                    key={p.id}
                    className="p-3 bg-[#F7F6F2] rounded-xl border border-neutral-200 flex items-center gap-3"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded-lg border border-neutral-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">{p.name}</h4>
                      <p className="text-xs font-extrabold text-neutral-950">
                        {formatBRL(p.price)}
                      </p>

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
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">🚚 Modalidade Padrão: VasconcelosExpress (Grátis)</p>
                <p className="text-[11px] text-emerald-800">
                  Todos os pedidos contam com entrega personalizada gratuita combinada diretamente pelo seu WhatsApp cadastrado.
                </p>
              </div>
              {currentUser.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-xl border border-neutral-200 bg-[#F7F6F2] flex items-start justify-between"
                >
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
                      {addr.logradouro}, {addr.numero}{' '}
                      {addr.complemento ? `(${addr.complemento})` : ''}
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
