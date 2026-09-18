import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNavigation } from './components/BottomNavigation';
import { Home } from './pages/Home';
import { SearchPage } from './pages/SearchPage';
import { ProductListing } from './pages/ProductListing';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Wishlist } from './pages/Wishlist';
import { Contact } from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <WishlistProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-gray-50">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/deals" element={<ProductListing isDealsPage={true} />} />
                <Route path="/categories" element={<ProductListing />} />
                <Route path="/category/:categoryId" element={<ProductListing />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/contact" element={<Contact />} />
                {/* Fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
            <BottomNavigation />
          </div>
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
