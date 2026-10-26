import React from 'react';
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
  const { viewMode } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Global Header */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1 pb-16 md:pb-0">
        {viewMode === 'admin' && <AdminPanel />}
        {viewMode === 'blog' && <BlogSection />}
        {viewMode === 'store' && (
          <>
            <HeroBanner />
            <CategoryNav />
            <FlashOffers />
            <ProductCatalog />
          </>
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
