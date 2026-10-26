import React, { useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Truck, 
  ArrowUpRight, 
  Search, 
  SlidersHorizontal, 
  AlertTriangle,
  Tag,
  Save,
  X,
  ExternalLink,
  LogOut,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  Wand2,
  Info
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, Order, OrderStatus } from '../types';
import { formatBRL, formatDate } from '../utils/formatters';
import { AdminLogin } from './AdminLogin';

export const AdminPanel: React.FC = () => {
  const { 
    products, 
    orders, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateOrderStatus,
    coupons,
    setViewMode,
    isAdminAuthenticated,
    adminLogout 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'relatorios' | 'estoque' | 'pedidos' | 'cupons'>('relatorios');

  // Filters for Stock
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('todos');

  // Filters for Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('todos');

  // Modal for new/edit product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('perfumaria');
  const [formPrice, setFormPrice] = useState('149.90');
  const [formOriginalPrice, setFormOriginalPrice] = useState('199.90');
  const [formStock, setFormStock] = useState('50');
  const [formVolume, setFormVolume] = useState('100ml');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  
  // Link import states
  const [importUrl, setImportUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractFeedback, setExtractFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Additional product feature states
  const [formNotesTopo, setFormNotesTopo] = useState('');
  const [formNotesCoracao, setFormNotesCoracao] = useState('');
  const [formNotesFundo, setFormNotesFundo] = useState('');
  const [formBenefitsText, setFormBenefitsText] = useState('');
  const [formActivesText, setFormActivesText] = useState('');

  // Tracking Code edit state for order
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  // Extract product data from external link (WePink, etc.)
  const handleExtractFromUrl = async (customUrl?: string) => {
    const targetUrl = customUrl || importUrl;
    if (!targetUrl || !targetUrl.trim().startsWith('http')) {
      setExtractFeedback({
        type: 'error',
        message: 'Por favor, insira um link válido iniciado por http:// ou https://'
      });
      return;
    }

    setIsExtracting(true);
    setExtractFeedback(null);

    try {
      const res = await fetch('/api/extract-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl.trim() })
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Não foi possível extrair dados do link.');
      }

      const p = json.data;
      if (p.name) setFormName(p.name);
      if (p.subtitle) setFormSubtitle(p.subtitle);
      if (p.category) setFormCategory(p.category);
      if (p.price) setFormPrice(p.price.toString());
      if (p.originalPrice) setFormOriginalPrice(p.originalPrice.toString());
      if (p.volume) setFormVolume(p.volume);
      if (p.stock) setFormStock(p.stock.toString());
      if (p.description) setFormDescription(p.description);
      if (p.images && p.images.length > 0) setFormImage(p.images[0]);
      
      if (p.notes) {
        setFormNotesTopo(p.notes.topo || '');
        setFormNotesCoracao(p.notes.coracao || '');
        setFormNotesFundo(p.notes.fundo || '');
      }

      if (p.benefits && Array.isArray(p.benefits)) {
        setFormBenefitsText(p.benefits.join('\n'));
      }

      if (p.actives && Array.isArray(p.actives)) {
        setFormActivesText(p.actives.join(', '));
      }

      setExtractFeedback({
        type: 'success',
        message: '✨ Dados do produto, fotos e características extraídos com sucesso! Revise e clique em Salvar.'
      });
    } catch (err: any) {
      setExtractFeedback({
        type: 'error',
        message: err.message || 'Erro ao extrair informações do produto.'
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Open product editor
  const handleOpenProductEdit = (product?: Product) => {
    setImportUrl('');
    setExtractFeedback(null);

    if (product) {
      setEditingProductId(product.id);
      setFormName(product.name);
      setFormSubtitle(product.subtitle);
      setFormCategory(product.category);
      setFormPrice(product.price.toString());
      setFormOriginalPrice(product.originalPrice.toString());
      setFormStock(product.stock.toString());
      setFormVolume(product.volume);
      setFormImage(product.images[0] || '');
      setFormDescription(product.description);
      setFormNotesTopo(product.notes?.topo || '');
      setFormNotesCoracao(product.notes?.coracao || '');
      setFormNotesFundo(product.notes?.fundo || '');
      setFormBenefitsText((product.benefits || []).join('\n'));
      setFormActivesText((product.actives || []).join(', '));
    } else {
      setEditingProductId(null);
      setFormName('');
      setFormSubtitle('');
      setFormCategory('perfumaria');
      setFormPrice('');
      setFormOriginalPrice('');
      setFormStock('50');
      setFormVolume('100ml');
      setFormImage('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80');
      setFormDescription('');
      setFormNotesTopo('');
      setFormNotesCoracao('');
      setFormNotesFundo('');
      setFormBenefitsText('Fixação prolongada e rastro marcante\nFórmula vegana e cruelty-free\nEmbalagem sofisticada com design exclusivo');
      setFormActivesText('');
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formPrice) || 0;
    const originalPriceNum = parseFloat(formOriginalPrice) || priceNum;
    const discount = originalPriceNum > priceNum 
      ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100) 
      : 0;

    const benefitsArray = formBenefitsText.split('\n').map(s => s.trim()).filter(Boolean);
    const activesArray = formActivesText.split(',').map(s => s.trim()).filter(Boolean);
    const notesObj = (formNotesTopo || formNotesCoracao || formNotesFundo)
      ? { topo: formNotesTopo, coracao: formNotesCoracao, fundo: formNotesFundo }
      : undefined;

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: formName,
        subtitle: formSubtitle,
        category: formCategory,
        price: priceNum,
        originalPrice: originalPriceNum,
        discountPercent: discount > 0 ? discount : undefined,
        stock: parseInt(formStock) || 0,
        volume: formVolume,
        description: formDescription,
        images: [formImage || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'],
        benefits: benefitsArray.length > 0 ? benefitsArray : ['Fórmula exclusiva vasconcelos Presente'],
        notes: notesObj,
        actives: activesArray.length > 0 ? activesArray : undefined
      });
    } else {
      addProduct({
        name: formName,
        subtitle: formSubtitle,
        category: formCategory,
        price: priceNum,
        originalPrice: originalPriceNum,
        discountPercent: discount > 0 ? discount : undefined,
        stock: parseInt(formStock) || 0,
        volume: formVolume,
        description: formDescription,
        images: [formImage || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'],
        rating: 5.0,
        reviewCount: 1,
        benefits: benefitsArray.length > 0 ? benefitsArray : ['Fórmula exclusiva vasconcelos Presente', 'Fragrância marcante', 'Testado dermatologicamente'],
        notes: notesObj,
        actives: activesArray.length > 0 ? activesArray : undefined,
        isBestSeller: true
      });
    }

    setIsProductModalOpen(false);
  };

  // Monthly Sales Reports Data
  const monthlySales = [
    { month: 'Jan 2026', revenue: 78500, orders: 340, growth: '+12%' },
    { month: 'Fev 2026', revenue: 92400, orders: 410, growth: '+18%' },
    { month: 'Mar 2026', revenue: 108900, orders: 480, growth: '+17%' },
    { month: 'Abr 2026', revenue: 114200, orders: 512, growth: '+5%' },
    { month: 'Mai 2026', revenue: 132000, orders: 590, growth: '+15%' },
    { month: 'Jun 2026', revenue: 128400, orders: 570, growth: '-2%' },
    { month: 'Jul 2026', revenue: 139800, orders: 620, growth: '+9%' },
    { month: 'Ago 2026', revenue: 144500, orders: 640, growth: '+3%' },
    { month: 'Set 2026', revenue: 156300, orders: 690, growth: '+8%' },
    { month: 'Out 2026', revenue: 168920, orders: 745, growth: '+14%' }
  ];

  const maxRevenue = Math.max(...monthlySales.map(m => m.revenue));

  // Calculated metrics
  const totalStoreRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 168920);
  const totalOrdersCount = orders.length + 745;
  const lowStockCount = products.filter(p => p.stock < 25).length;
  const averageTicket = totalStoreRevenue / totalOrdersCount;

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesCat = productCategoryFilter === 'todos' || p.category === productCategoryFilter;
    const matchesQuery = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'todos' || o.orderStatus === orderStatusFilter;
    const matchesQuery = o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  // Require admin login
  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 pb-20">
      
      {/* Top Admin Header */}
      <div className="bg-neutral-900 text-white border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black font-display tracking-tight text-white">
              vasconcelos <span className="text-pink-500 font-serif-luxury italic font-normal">Presente</span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-pink-600 text-white">
              Admin & Gestão
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sessão Autenticada
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('store')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Loja ao Vivo</span>
            </button>

            <button
              onClick={adminLogout}
              className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5"
              title="Encerrar sessão administrativa"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair do Admin</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 text-xs font-bold uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab('relatorios')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'relatorios'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Relatórios de Vendas</span>
          </button>

          <button
            onClick={() => setActiveTab('estoque')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'estoque'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Estoque & Produtos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pedidos')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'pedidos'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos dos Clientes ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cupons')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'cupons'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Cupons Promocionais</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: RELATÓRIOS DETALHADOS DE VENDAS MENSAIS */}
        {activeTab === 'relatorios' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold mb-2">
                  <span>Receita Total do Mês</span>
                  <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-neutral-900 font-display">
                  {formatBRL(totalStoreRevenue)}
                </p>
                <div className="mt-2 flex items-center text-xs text-emerald-600 font-bold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+14.2% em relação a Setembro</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold mb-2">
                  <span>Total de Pedidos</span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-neutral-900 font-display">
                  {totalOrdersCount}
                </p>
                <div className="mt-2 flex items-center text-xs text-emerald-600 font-bold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>98% de satisfação dos clientes</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold mb-2">
                  <span>Ticket Médio</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-neutral-900 font-display">
                  {formatBRL(averageTicket)}
                </p>
                <p className="mt-2 text-xs text-neutral-400">Impulsionado por Kits & Combos</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold mb-2">
                  <span>Alerta de Reposição</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-neutral-900 font-display">
                  {lowStockCount} produtos
                </p>
                <p className="mt-2 text-xs text-amber-700 font-semibold">Estoque baixo (&lt; 25 unidades)</p>
              </div>
            </div>

            {/* Monthly Sales Bar Graph */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-2">
                <div>
                  <h3 className="text-lg font-black text-neutral-900 font-display">
                    Relatório Detalhado de Vendas Mensais (2026)
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Desempenho financeiro consolidado de faturamento e volume de pedidos
                  </p>
                </div>
                <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                  Faturamento Anual Acumulado: R$ 1.258.020,00
                </span>
              </div>

              {/* Interactive Bar Chart Visualization */}
              <div className="mt-8 space-y-4">
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 items-end h-64 pt-6">
                  {monthlySales.map((m, idx) => {
                    const heightPercent = Math.round((m.revenue / maxRevenue) * 100);
                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition duration-200 bg-neutral-900 text-white text-[10px] p-2 rounded-xl shadow-lg whitespace-nowrap pointer-events-none z-10 text-center">
                          <p className="font-bold">{formatBRL(m.revenue)}</p>
                          <p className="text-neutral-400">{m.orders} pedidos ({m.growth})</p>
                        </div>

                        {/* Bar */}
                        <div
                          className="w-full max-w-[36px] bg-neutral-200 group-hover:bg-gradient-to-t group-hover:from-pink-600 group-hover:to-rose-400 rounded-t-xl transition-all duration-300 relative"
                          style={{
                            height: `${heightPercent}%`,
                            background: idx === monthlySales.length - 1 
                              ? 'linear-gradient(to top, #E91E63, #FF4081)' 
                              : undefined
                          }}
                        >
                          {idx === monthlySales.length - 1 && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-pink-600 bg-pink-50 px-1 rounded">
                              Atual
                            </span>
                          )}
                        </div>

                        {/* Month Label */}
                        <span className="text-[10px] font-bold text-neutral-500 mt-2 truncate w-full text-center">
                          {m.month.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Table of Monthly Metrics */}
              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-y border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Mês</th>
                      <th className="py-3 px-4">Faturamento</th>
                      <th className="py-3 px-4">Pedidos Concluídos</th>
                      <th className="py-3 px-4">Crescimento MoM</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {monthlySales.slice(-5).map((m, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="py-3 px-4 font-bold text-neutral-900">{m.month}</td>
                        <td className="py-3 px-4 font-extrabold text-neutral-900">{formatBRL(m.revenue)}</td>
                        <td className="py-3 px-4 text-neutral-700">{m.orders} pedidos</td>
                        <td className="py-3 px-4 font-semibold text-emerald-600">{m.growth}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Consolidado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GERENCIAMENTO DE ESTOQUE & PRODUTOS */}
        {activeTab === 'estoque' && (
          <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-1 gap-3 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por nome no estoque..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-3 py-2 text-xs"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="todos">Todas Categorias</option>
                  <option value="perfumaria">Perfumaria</option>
                  <option value="bodysplash">Body Splash</option>
                  <option value="skincare">Skincare</option>
                  <option value="maquiagem">Maquiagem</option>
                  <option value="combos">Combos</option>
                </select>
              </div>

              <button
                onClick={() => handleOpenProductEdit()}
                className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Novo Produto</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="py-3.5 px-4">Produto</th>
                      <th className="py-3.5 px-4">Categoria</th>
                      <th className="py-3.5 px-4">Preço Atual</th>
                      <th className="py-3.5 px-4">Estoque</th>
                      <th className="py-3.5 px-4">Vendas / Status</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.map((p) => {
                      const isLowStock = p.stock < 25;
                      return (
                        <tr key={p.id} className="hover:bg-neutral-50 transition">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-xl border border-neutral-200"
                            />
                            <div>
                              <p className="font-bold text-neutral-900">{p.name}</p>
                              <p className="text-[11px] text-neutral-500">{p.volume}</p>
                            </div>
                          </td>

                          <td className="py-3 px-4 uppercase text-[10px] font-bold text-pink-600">
                            {p.category}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-neutral-900">{formatBRL(p.price)}</span>
                            {p.originalPrice > p.price && (
                              <span className="block text-[10px] text-neutral-400 line-through">
                                {formatBRL(p.originalPrice)}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`font-mono font-bold ${
                              isLowStock ? 'text-amber-600' : 'text-neutral-900'
                            }`}>
                              {p.stock} un.
                            </span>
                            {isLowStock && (
                              <span className="block text-[9px] text-red-600 font-bold">
                                Estoque Crítico
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {p.isFlashSale ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                Promo Relâmpago
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                                Ativo na Loja
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenProductEdit(p)}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-pink-600 hover:bg-pink-50 transition"
                              title="Editar Produto"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Deseja remover "${p.name}" do catálogo?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Excluir Produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: GERENCIAMENTO DE PEDIDOS DOS CLIENTES */}
        {activeTab === 'pedidos' && (
          <div className="space-y-6">
            
            {/* Orders Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-1 gap-3 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por número do pedido, cliente..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-3 py-2 text-xs"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="separacao">Em Separação</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregue">Entregue</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="py-3.5 px-4">Pedido / Data</th>
                      <th className="py-3.5 px-4">Cliente</th>
                      <th className="py-3.5 px-4">Itens</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Rastreamento</th>
                      <th className="py-3.5 px-4">Status Atual</th>
                      <th className="py-3.5 px-4 text-right">Alterar Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredOrders.map((order) => {
                      const statusColors: Record<OrderStatus, string> = {
                        pendente: 'bg-amber-100 text-amber-800',
                        pago: 'bg-blue-100 text-blue-800',
                        separacao: 'bg-purple-100 text-purple-800',
                        enviado: 'bg-indigo-100 text-indigo-800',
                        entregue: 'bg-emerald-100 text-emerald-800'
                      };

                      return (
                        <tr key={order.id} className="hover:bg-neutral-50 transition">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-neutral-900 block">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {formatDate(order.createdAt)}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-bold text-neutral-900">{order.customer.name}</p>
                            <p className="text-[11px] text-neutral-500">{order.customer.email}</p>
                            <p className="text-[10px] text-neutral-400">{order.shippingAddress.localidade}/{order.shippingAddress.uf}</p>
                          </td>

                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              {order.items.map((it, i) => (
                                <p key={i} className="text-neutral-700 truncate max-w-xs">
                                  {it.quantity}x {it.name}
                                </p>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-neutral-900 block">{formatBRL(order.total)}</span>
                            <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                              {order.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : order.paymentMethod.toUpperCase()}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {editingOrderId === order.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={trackingInput}
                                  onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                                  placeholder="Código (ex: NL123BR)"
                                  className="w-28 bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs font-mono"
                                />
                                <button
                                  onClick={() => {
                                    updateOrderStatus(order.id, order.orderStatus, trackingInput);
                                    setEditingOrderId(null);
                                  }}
                                  className="p-1 bg-pink-600 text-white rounded-lg"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 font-mono text-neutral-700">
                                <span>{order.trackingCode || 'Sem rastreio'}</span>
                                <button
                                  onClick={() => {
                                    setEditingOrderId(order.id);
                                    setTrackingInput(order.trackingCode || '');
                                  }}
                                  className="text-neutral-400 hover:text-pink-600"
                                  title="Editar código de rastreamento"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[order.orderStatus]}`}>
                              {order.orderStatus}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <select
                              value={order.orderStatus}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden cursor-pointer"
                            >
                              <option value="pendente">Pendente</option>
                              <option value="pago">Pago</option>
                              <option value="separacao">Em Separação</option>
                              <option value="enviado">Enviado</option>
                              <option value="entregue">Entregue</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: GERENCIAMENTO DE CUPONS */}
        {activeTab === 'cupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 font-display">
                  Cupons Promocionais Ativos
                </h3>
                <p className="text-xs text-neutral-500">
                  Configure descontos para alavancar as vendas nas lives e campanhas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div key={c.code} className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black bg-pink-100 text-pink-700 px-3 py-1 rounded-xl">
                      {c.code}
                    </span>
                    <span className="text-xs font-bold text-neutral-500">
                      {c.discountType === 'percentage' ? `${c.value}% OFF` : `${formatBRL(c.value)} OFF`}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600">{c.description}</p>
                  
                  <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-400">
                    Compra mínima: <strong>{formatBRL(c.minOrderValue)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 font-display">
                    {editingProductId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {editingProductId ? 'Atualize as informações do item' : 'vasconcelos Presente — Catálogo'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEÇÃO IMPORTAR VIA LINK (apenas quando adicionando novo produto) */}
            {!editingProductId && (
              <div className="bg-gradient-to-br from-pink-50 via-rose-50/50 to-amber-50/30 rounded-2xl p-4 border border-pink-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-pink-900 font-bold text-xs">
                    <Wand2 className="w-4 h-4 text-pink-600 animate-pulse" />
                    <span>Adicionar Produto via Link (WePink, etc.)</span>
                  </div>
                  <span className="text-[10px] bg-pink-200/70 text-pink-800 font-bold px-2 py-0.5 rounded-full">
                    Extração Inteligente
                  </span>
                </div>

                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Cole o link da página do perfume ou cosmético. Nosso sistema busca a <strong>foto oficial em alta qualidade</strong>, <strong>nome</strong>, <strong>preço</strong>, <strong>volume</strong>, <strong>descrição</strong> e <strong>pirâmide olfativa</strong> automaticamente!
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="url"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder="https://www.wepink.com.br/body-splash-heaven-pink200ml---wepink-569/p"
                      disabled={isExtracting}
                      className="w-full bg-white border border-pink-200 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-pink-500 font-mono disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isExtracting}
                    onClick={() => handleExtractFromUrl()}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Extraindo...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Buscar e Preencher</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Botão de teste rápido com o link solicitado pelo usuário */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="text-neutral-500">Exemplo para teste rápido:</span>
                  <button
                    type="button"
                    disabled={isExtracting}
                    onClick={() => {
                      const testUrl = 'https://www.wepink.com.br/body-splash-heaven-pink200ml---wepink-569/p';
                      setImportUrl(testUrl);
                      handleExtractFromUrl(testUrl);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-pink-100 text-pink-700 font-semibold rounded-lg border border-pink-200 transition-colors shadow-2xs"
                  >
                    <span>🌸 Body Splash Heaven Pink 200ml (WePink)</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Feedback da extração */}
                {extractFeedback && (
                  <div
                    className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                      extractFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {extractFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{extractFeedback.message}</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-neutral-700">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Body Splash Heaven Pink"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700">Subtítulo / Apelo *</label>
                  <input
                    type="text"
                    required
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="Ex: Doce floral encantador com alta fixação"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white"
                  >
                    <option value="perfumaria">Perfumaria Fina</option>
                    <option value="bodysplash">Body Splash</option>
                    <option value="skincare">Skincare Facial</option>
                    <option value="maquiagem">Maquiagem</option>
                    <option value="combos">Kits & Combos</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Volume / Tamanho</label>
                  <input
                    type="text"
                    value={formVolume}
                    onChange={(e) => setFormVolume(e.target.value)}
                    placeholder="Ex: 200ml / 100ml / 30g"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Preço Promocional (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="Ex: 89.90"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Preço 'De' (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="Ex: 129.90"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Estoque Inicial *</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white"
                  />
                </div>
              </div>

              {/* IMAGEM DO PRODUTO COM PREVIEW EM TEMPO REAL */}
              <div>
                <label className="font-bold text-neutral-700 flex items-center justify-between">
                  <span>URL da Imagem do Produto</span>
                  {formImage && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Imagem carregada
                    </span>
                  )}
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-neutral-200 overflow-hidden bg-neutral-100 shrink-0 flex items-center justify-center shadow-2xs">
                    {formImage ? (
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <Package className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:bg-white"
                  />
                </div>
              </div>

              {/* CARACTERÍSTICAS / PIRÂMIDE OLFATIVA (para perfumes e body splashes) */}
              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/70 space-y-2.5">
                <div className="flex items-center gap-2 text-neutral-800 font-bold text-xs">
                  <Tag className="w-3.5 h-3.5 text-pink-600" />
                  <span>Pirâmide Olfativa (Notas do Perfume / Splash)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600">Notas de Topo (Saída)</label>
                    <input
                      type="text"
                      value={formNotesTopo}
                      onChange={(e) => setFormNotesTopo(e.target.value)}
                      placeholder="Ex: Frutas vermelhas, Bergamota"
                      className="w-full mt-1 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600">Notas de Coração (Corpo)</label>
                    <input
                      type="text"
                      value={formNotesCoracao}
                      onChange={(e) => setFormNotesCoracao(e.target.value)}
                      placeholder="Ex: Jasmim, Peônia, Rosa"
                      className="w-full mt-1 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600">Notas de Fundo (Fixação)</label>
                    <input
                      type="text"
                      value={formNotesFundo}
                      onChange={(e) => setFormNotesFundo(e.target.value)}
                      placeholder="Ex: Baunilha, Âmbar, Almíscar"
                      className="w-full mt-1 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* BENEFÍCIOS E ATIVOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Benefícios (um por linha)</label>
                  <textarea
                    rows={2}
                    value={formBenefitsText}
                    onChange={(e) => setFormBenefitsText(e.target.value)}
                    placeholder="Alta fixação de 12 horas&#10;Fórmula vegana&#10;Toque aveludado na pele"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Ativos Principais</label>
                  <textarea
                    rows={2}
                    value={formActivesText}
                    onChange={(e) => setFormActivesText(e.target.value)}
                    placeholder="Vitamina E, Extrato de Baunilha, Ácido Hialurônico"
                    className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700">Descrição do Produto</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detalhes completos sobre a fragrância, modo de uso e diferenciais..."
                  className="w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  vasconcelos Presente
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Produto</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
