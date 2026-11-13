import React from 'react';
import { Hammer, ShieldAlert, Sparkles } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { FlashOffers } from './components/FlashOffers';
import { ProductCatalog } from './components/ProductCatalog';
import { AdminPanel } from './components/AdminPanel';
import { BlogSection } from './components/BlogSection';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SocialAuthModal } from './components/SocialAuthModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { LiveChatWidget } from './components/LiveChatWidget';
import { PushNotificationManager } from './components/PushNotificationManager';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';

const MainContent: React.FC = () => {
  const { viewMode, setViewMode, products } = useStore();
  const isSiteUnderConstruction = products.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2]">
      {/* Global Header */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        {viewMode === 'admin' && <AdminPanel />}
        {viewMode === 'blog' && <BlogSection />}
        {viewMode === 'store' && (
          isSiteUnderConstruction ? (
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
              <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#111111] text-white flex items-center justify-center shadow-md">
                  <Hammer className="w-8 h-8 text-amber-400" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-[0.16em]">
                    <Sparkles className="w-3.5 h-3.5" />
                    VASCONCELOS • Cosméticos & Perfumaria
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight pt-1">
                    Site em Construção
                  </h1>
                  <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
                    Estamos preparando nossa vitrine oficial com fragrâncias exclusivas e produtos reais selecionados especialmente para você. Em breve, nosso catálogo completo estará disponível!
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('admin')}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#111111] hover:bg-[#8B1E3F] text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Acessar Painel ADM para Cadastrar Produtos</span>
                  </button>
                </div>

                <p className="text-[11px] text-neutral-400">
                  Assim que o primeiro produto for cadastrado no Painel ADM, este aviso desaparecerá automaticamente.
                </p>
              </div>
            </section>
          ) : (
            <>
              <HeroBanner />
              <CategoryNav />
              <FlashOffers />
              <ProductCatalog />
            </>
          )
        )}
      </main>

      {/* Global Footer (shown on store and blog) */}
      {viewMode !== 'admin' && <Footer />}

      {/* Mobile Dock Navigation */}
      {viewMode !== 'admin' && <MobileBottomNav />}

      {/* Global Overlays & Modals */}
      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
      <SocialAuthModal />
      <CustomerAccountModal />
      <LiveChatWidget />
      <PushNotificationManager />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
