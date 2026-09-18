import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Menu, User, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import logo from '../assets/logo.jpg';

const TopAnnouncement = () => (
  <div className="bg-primary text-primary-light text-sm font-medium py-2 overflow-hidden whitespace-nowrap">
    <div className="animate-marquee inline-block">
      <span className="mx-4">🎁 FREE Gift Packing on Every Order</span>
      <span className="mx-4">🚚 All Over India Delivery Available</span>
      <span className="mx-4">✨ Custom Frames Available</span>
      <span className="mx-4">🛍️ Retail & Wholesale Orders Welcome</span>
      <span className="mx-4">📞 Call / WhatsApp: 9398277441</span>
    </div>
  </div>
);

export const Header = () => {
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-border">
      <TopAnnouncement />
      
      <div className="container-custom py-4">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between gap-6">
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Vinayak Frames" className="h-16 object-contain" />
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
            <input 
              type="text" 
              placeholder="Search for frames, gifts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary-hover transition-colors">
              Search
            </button>
          </form>

          <div className="flex items-center gap-6">
            <Link to="/contact" className="flex flex-col items-center text-text-muted hover:text-primary transition-colors">
              <User className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">Login</span>
            </Link>
            
            <Link to="/wishlist" className="flex flex-col items-center text-text-muted hover:text-primary transition-colors relative">
              <Heart className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            
            <Link to="/cart" className="flex flex-col items-center text-text-muted hover:text-primary transition-colors relative">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 text-text-main">
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex justify-start">
              <img src={logo} alt="Vinayak Frames" className="h-10 object-contain" />
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 text-text-main">
              <Search className="h-6 w-6" />
            </button>
            <Link to="/cart" className="p-2 -mr-2 text-text-main relative">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:block border-t border-gray-100">
        <div className="container-custom">
          <ul className="flex items-center justify-center gap-6 py-3 text-sm font-medium">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link to="/category/god-frames" className="hover:text-primary transition-colors">God Frames</Link></li>
            <li><Link to="/category/no-edit-frames" className="hover:text-primary transition-colors">No-Edit Frames</Link></li>
            <li><Link to="/category/birthday-frames" className="hover:text-primary transition-colors">Birthday Frames</Link></li>
            <li><Link to="/category/wedding-frames" className="hover:text-primary transition-colors">Wedding Frames</Link></li>
            <li><Link to="/category/personalized-gifts" className="hover:text-primary transition-colors">Gifts</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-4/5 max-w-sm bg-white h-full flex flex-col shadow-2xl animate-slideInLeft">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <img src={logo} alt="Vinayak Frames" className="h-10 object-contain" />
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 hover:text-text-main">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100">
              <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </form>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="flex flex-col text-base font-medium">
                <li><Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 hover:bg-gray-50 hover:text-primary text-text-main">Home</Link></li>
                <li><Link to="/category/god-frames" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 hover:bg-gray-50 hover:text-primary text-text-main">God Frames</Link></li>
                <li><Link to="/category/no-edit-frames" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 hover:bg-gray-50 hover:text-primary text-text-main">No-Edit Frames</Link></li>
                <li><Link to="/category/birthday-frames" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 hover:bg-gray-50 hover:text-primary text-text-main">Birthday Frames</Link></li>
                <li><Link to="/category/wedding-frames" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 hover:bg-gray-50 hover:text-primary text-text-main">Wedding Frames</Link></li>
                <li><Link to="/category/personalized-gifts" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 hover:bg-gray-50 hover:text-primary text-text-main">Gifts</Link></li>
                <li><Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 hover:bg-gray-50 hover:text-primary text-text-main">Contact Us</Link></li>
              </ul>
            </nav>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="text-sm font-medium text-text-main flex flex-col gap-2">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> My Account</span>
                <span className="flex items-center gap-2 mt-2">📞 9398277441</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
