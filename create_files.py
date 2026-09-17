import os

files = {
    "src/App.tsx": """import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNavigation } from './components/BottomNavigation';
import { Home } from './pages/Home';
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
""",
    "src/main.tsx": """import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
""",
    "src/pages/Home.tsx": """import React from 'react';
import { Link } from 'react-router-dom';
import { HeroSlider } from '../components/HeroSlider';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCarousel } from '../components/ProductCarousel';
import { MOCK_DATA } from '../data/mockData';

export const Home = () => {
  const newArrivals = MOCK_DATA.products.filter(p => p.isNew).slice(0, 8);
  const bestSellers = MOCK_DATA.products.filter(p => p.isBestSeller).slice(0, 8);
  const trending = MOCK_DATA.products.filter(p => p.isTrending).slice(0, 8);

  return (
    <div className="pb-16 md:pb-0">
      <HeroSlider />
      
      {/* Shop By Category */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-text-main mb-10">
            Shop By Category
          </h2>
          <div className="flex overflow-x-auto gap-4 md:gap-8 pb-4 hide-scrollbar justify-start md:justify-center px-4 md:px-0 -mx-4 md:mx-0 snap-x">
            {MOCK_DATA.categories.map(category => (
              <div key={category.id} className="snap-start flex-shrink-0">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-8 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/category/birthday-frames" className="group relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-auto md:h-48 card-shadow">
              <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Birthday" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-serif font-bold text-white mb-2">Birthday Special</h3>
                <p className="text-white/90 text-sm mb-4">Make their day more special</p>
                <span className="bg-white text-text-main text-xs font-bold px-4 py-2 rounded-full self-start group-hover:bg-primary group-hover:text-white transition-colors">Shop Now</span>
              </div>
            </Link>
            
            <Link to="/category/wedding-frames" className="group relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-auto md:h-48 card-shadow">
              <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Wedding" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-serif font-bold text-white mb-2">Wedding Frames</h3>
                <p className="text-white/90 text-sm mb-4">Celebrate Love With Beautiful Frames</p>
                <span className="bg-white text-text-main text-xs font-bold px-4 py-2 rounded-full self-start group-hover:bg-primary group-hover:text-white transition-colors">Shop Now</span>
              </div>
            </Link>

            <Link to="/category/personalized-gifts" className="group relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-auto md:h-48 card-shadow hidden lg:block">
              <img src="https://images.unsplash.com/photo-1512909006721-3d6018887383?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gifts" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-serif font-bold text-white mb-2">Personalized Gifts</h3>
                <p className="text-white/90 text-sm mb-4">Thoughtful Gifts for Your Loved Ones</p>
                <span className="bg-white text-text-main text-xs font-bold px-4 py-2 rounded-full self-start group-hover:bg-primary group-hover:text-white transition-colors">Shop Now</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {newArrivals.length > 0 && (
        <ProductCarousel title="New Arrivals" products={newArrivals} viewAllLink="/categories" />
      )}
      
      {bestSellers.length > 0 && (
        <ProductCarousel title="Best Sellers" products={bestSellers} viewAllLink="/categories" />
      )}

      {/* Deal of the Day */}
      <section className="py-12 bg-background-alt">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-8 items-center bg-white rounded-3xl p-6 md:p-10 card-shadow">
            <div className="w-full md:w-1/2">
              <div className="bg-red-100 text-red-600 text-sm font-bold px-4 py-1.5 rounded-full inline-block mb-4">Deal of the Day 🔥</div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-main mb-4">Save 30% on LED Heart Lamps</h2>
              <p className="text-text-muted mb-6">A glowing LED lamp in a beautiful heart shape. Personalize it with a special message. Offer valid today only.</p>
              
              <div className="flex gap-4 mb-8">
                <div className="bg-gray-100 rounded-lg p-3 text-center min-w-[70px]">
                  <span className="block text-xl font-bold text-primary">12</span>
                  <span className="text-xs text-text-muted">Hours</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 text-center min-w-[70px]">
                  <span className="block text-xl font-bold text-primary">45</span>
                  <span className="text-xs text-text-muted">Mins</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 text-center min-w-[70px]">
                  <span className="block text-xl font-bold text-primary">30</span>
                  <span className="text-xs text-text-muted">Secs</span>
                </div>
              </div>
              
              <Link to="/product/p3" className="inline-block bg-primary text-white font-medium px-8 py-3.5 rounded-full hover:bg-primary-hover transition-colors">
                Shop Deal Now
              </Link>
            </div>
            <div className="w-full md:w-1/2 relative rounded-2xl overflow-hidden aspect-square md:aspect-auto md:h-[400px]">
              <img src="https://images.unsplash.com/photo-1543881478-f71694f71a93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Deal of the day" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {trending.length > 0 && (
        <ProductCarousel title="Trending Gifts" products={trending} />
      )}

      {/* Personalized CTA */}
      <section className="py-16 bg-text-main text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Background" className="w-full h-full object-cover" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Create Your Own Personalized Frame</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Upload your photo • Choose your size • Select your finish • Make it special
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm font-medium">
            <span className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">✓ Custom Sizes</span>
            <span className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">✓ Multiple Finishes</span>
            <span className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">✓ FREE Gift Packing</span>
          </div>
          <Link to="/categories" className="inline-block bg-primary text-white font-medium px-10 py-4 rounded-full hover:bg-primary-hover transition-colors text-lg shadow-lg">
            Customize Now
          </Link>
        </div>
      </section>
    </div>
  );
};
""",
    "src/pages/ProductDetail.tsx": """import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_DATA, FinishType, SizeOption } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { Star, ShieldCheck, Truck, Gift, Image as ImageIcon } from 'lucide-react';

export const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = MOCK_DATA.products.find(p => p.id === productId);
  
  const [selectedSize, setSelectedSize] = useState<SizeOption | undefined>(product?.sizes?.[0]);
  const [selectedFinish, setSelectedFinish] = useState<FinishType | undefined>(product?.finishTypes?.[0]);
  const [quantity, setQuantity] = useState(1);
  
  const [customName, setCustomName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  
  useEffect(() => {
    if (product) {
      if (product.sizes?.length) setSelectedSize(product.sizes[0]);
      if (product.finishTypes?.length) setSelectedFinish(product.finishTypes[0]);
    }
  }, [product]);

  if (!product) {
    return <div className="container-custom py-20 text-center">Product not found</div>;
  }

  const currentPrice = selectedSize ? selectedSize.price : product.price;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      product,
      quantity,
      size: selectedSize,
      finishType: selectedFinish,
      personalizationDetails: {
        photoUrl: photoUploaded ? 'uploaded-temp-url' : undefined,
        customName: customName || undefined,
        customMessage: customMessage || undefined,
      },
      itemPrice: currentPrice,
    });
    // Optional: show a toast or feedback
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="container-custom text-sm text-text-muted">
          Home / {product.category} / <span className="text-text-main">{product.name}</span>
        </div>
      </div>
      
      <div className="container-custom py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
          {/* Left: Images */}
          <div className="w-full md:w-1/2">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 card-shadow sticky top-24">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>
          
          {/* Right: Details */}
          <div className="w-full md:w-1/2 flex flex-col">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-2">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`h-4 w-4 ${i <= Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-text-muted">{product.reviews} Reviews</span>
            </div>
            
            <div className="mb-6 flex items-end gap-3">
              <span className="text-3xl font-bold text-text-main">₹{currentPrice.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="text-lg text-text-muted line-through mb-1">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
            </div>

            <div className="bg-primary-light/50 border border-primary/20 rounded-xl p-4 mb-8 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <Gift className="h-5 w-5" /> 🎁 FREE Gift Packing Included
              </div>
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <Truck className="h-5 w-5" /> 🚚 All Over India Delivery Available
              </div>
            </div>

            {/* Selectors */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-main mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                        selectedSize?.size === s.size 
                          ? 'border-primary bg-primary text-white font-medium' 
                          : 'border-gray-200 text-text-main hover:border-primary'
                      }`}
                    >
                      {s.size} — ₹{s.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.finishTypes && product.finishTypes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-text-main mb-3">Finish Type</h3>
                <div className="flex flex-wrap gap-3">
                  {product.finishTypes.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFinish(f)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                        selectedFinish === f 
                          ? 'border-primary bg-primary-light text-primary font-medium' 
                          : 'border-gray-200 text-text-main hover:border-primary'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personalization */}
            {product.customizable && product.personalization && (
              <div className="bg-gray-50 p-5 rounded-2xl mb-8 border border-gray-100">
                <h3 className="font-serif font-semibold text-lg mb-4">Personalization Details</h3>
                
                {product.personalization.photoUpload && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-main mb-2">Upload Photo (JPG/PNG)</label>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${photoUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary bg-white'}`}
                      onClick={() => setPhotoUploaded(true)}
                    >
                      <ImageIcon className={`h-8 w-8 mx-auto mb-2 ${photoUploaded ? 'text-green-500' : 'text-gray-400'}`} />
                      <p className="text-sm font-medium">{photoUploaded ? 'Photo Uploaded Successfully!' : 'Click to Upload Photo'}</p>
                    </div>
                  </div>
                )}
                
                {product.personalization.customName && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-main mb-2">Custom Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter name to be printed" 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>
                )}
                
                {product.personalization.customMessage && (
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Custom Message</label>
                    <textarea 
                      placeholder="Enter your special message" 
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                    ></textarea>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-xl h-12 w-32 bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 flex justify-center text-text-muted hover:text-primary">-</button>
                <span className="font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="flex-1 flex justify-center text-text-muted hover:text-primary">+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-white border-2 border-primary text-primary font-medium h-12 rounded-xl hover:bg-primary hover:text-white transition-colors"
              >
                Add to Cart
              </button>
              
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-primary text-white font-medium h-12 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
              >
                Buy Now
              </button>
            </div>
            
            <a 
              href="https://wa.me/919398277441" 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-[#25D366] text-white font-medium h-12 rounded-xl hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2 mb-8 shadow-sm"
            >
              Order / Enquire on WhatsApp
            </a>

            {/* Description */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="font-serif font-semibold text-lg mb-4">Product Description</h3>
              <p className="text-text-muted leading-relaxed mb-6">
                {product.description}
              </p>
              
              <ul className="space-y-3 text-sm text-text-muted">
                <li className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Premium Quality Guarantee</li>
                <li className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Secure Packaging</li>
                <li className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" /> Free Gift Wrapping Included</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
""",
    "src/pages/ProductListing.tsx": """import React from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { MOCK_DATA } from '../data/mockData';

export const ProductListing = () => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  
  let products = MOCK_DATA.products;
  let title = "All Products";
  
  if (categoryId) {
    const category = MOCK_DATA.categories.find(c => c.id === categoryId);
    if (category) {
      title = category.name;
      products = MOCK_DATA.products.filter(p => p.category === category.name);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 pb-24">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="text-sm text-text-muted mb-2">Home / {title}</div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main">{title}</h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="text-sm text-text-muted">{products.length} products</span>
            <select className="bg-white border border-gray-200 text-sm rounded-lg px-4 py-2 ml-auto md:ml-0 outline-none focus:border-primary">
              <option>Sort By: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar placeholder */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 card-shadow">
              <h3 className="font-serif font-semibold text-lg mb-4">Filters</h3>
              {/* Dummy filters */}
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3">Categories</h4>
                <div className="space-y-2">
                  {MOCK_DATA.categories.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-sm text-text-muted cursor-pointer hover:text-primary">
                      <input type="checkbox" className="rounded text-primary focus:ring-primary" /> {c.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
""",
    "src/pages/Cart.tsx": """import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag } from 'lucide-react';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container-custom py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="bg-primary-light/50 p-6 rounded-full mb-6">
          <ShoppingBag className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-text-main mb-3">Your Cart is Empty</h2>
        <p className="text-text-muted mb-8 max-w-md">Looks like you haven't added any beautiful frames or gifts to your cart yet.</p>
        <Link to="/categories" className="bg-primary text-white font-medium px-8 py-3 rounded-full hover:bg-primary-hover transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 pb-24">
      <div className="container-custom">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-2xl card-shadow overflow-hidden border border-gray-100">
              <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center text-sm font-medium text-text-muted">
                <span>Products</span>
                <span className="hidden md:block">Price</span>
              </div>
              
              <ul className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <li key={item.id} className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
                    <Link to={`/product/${item.productId}`} className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden block">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </Link>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <Link to={`/product/${item.productId}`} className="font-medium text-text-main hover:text-primary transition-colors text-base md:text-lg">
                          {item.product.name}
                        </Link>
                        <span className="font-bold text-lg md:hidden">₹{(item.itemPrice * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div className="text-sm text-text-muted mb-3 space-y-1">
                        {item.size && <p>Size: <span className="font-medium text-text-main">{item.size.size}</span></p>}
                        {item.finishType && <p>Finish: <span className="font-medium text-text-main">{item.finishType}</span></p>}
                        {item.personalizationDetails?.customName && <p>Name: "{item.personalizationDetails.customName}"</p>}
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded-lg h-9 w-28 bg-white">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex-1 flex justify-center text-text-muted hover:text-primary">-</button>
                          <span className="font-medium text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex-1 flex justify-center text-text-muted hover:text-primary">+</button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-text-muted hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="hidden md:block w-32 text-right">
                      <span className="font-bold text-lg">₹{(item.itemPrice * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-primary-light/40 border border-primary/20 rounded-xl p-4 mt-6 flex flex-col sm:flex-row items-center gap-4 text-primary font-medium justify-center sm:justify-start">
              <span>🎁 Free Gift Packing Included</span>
              <span className="hidden sm:block">•</span>
              <span>🚚 All Over India Delivery Available</span>
            </div>
          </div>
          
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100 sticky top-24">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-text-main">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Delivery</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Gift Packing</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-text-main text-lg">Total</span>
                  <span className="font-bold text-primary text-2xl">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary text-white font-medium h-12 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 mb-4"
              >
                Proceed to Checkout
              </button>
              <Link to="/categories" className="block text-center text-sm text-primary hover:underline font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
""",
    "src/pages/Checkout.tsx": """import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const Checkout = () => {
  const { cart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('This is a frontend demo. Order placement logic would go here.');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 pb-24">
      <div className="container-custom">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* Customer Details */}
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Customer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Full Name</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Mobile Number</label>
                  <input required type="tel" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">Email Address</label>
                  <input required type="email" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">House / Street / Flat No.</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">Area / Locality</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">City</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">State</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Pincode</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-primary bg-primary-light/20 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-primary focus:ring-primary" />
                  <span className="font-medium">UPI (GPay, PhonePe, Paytm)</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 hover:border-primary rounded-xl cursor-pointer transition-colors">
                  <input type="radio" name="payment" className="w-4 h-4 text-primary focus:ring-primary" />
                  <span className="font-medium">Credit / Debit Card</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 hover:border-primary rounded-xl cursor-pointer transition-colors">
                  <input type="radio" name="payment" className="w-4 h-4 text-primary focus:ring-primary" />
                  <span className="font-medium">Cash on Delivery</span>
                </label>
              </div>
            </div>

          </div>
          
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100 sticky top-24">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded-md bg-gray-100" />
                    <div className="flex-1">
                      <p className="font-medium text-text-main line-clamp-1">{item.product.name}</p>
                      <p className="text-text-muted text-xs">Qty: {item.quantity} {item.size && `| ${item.size.size}`}</p>
                    </div>
                    <div className="font-medium">₹{(item.itemPrice * item.quantity).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 text-sm mb-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-text-main">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Delivery (All India)</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Gift Packing</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-text-main text-lg">Total</span>
                  <span className="font-bold text-primary text-2xl">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-primary text-white font-bold h-14 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 text-lg"
              >
                Place Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
""",
    "src/pages/Wishlist.tsx": """import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';

export const Wishlist = () => {
  const { wishlist } = useWishlist();

  return (
    <div className="bg-gray-50 min-h-screen py-8 pb-24">
      <div className="container-custom">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-8">My Wishlist</h1>
        
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl card-shadow p-10 text-center border border-gray-100">
            <p className="text-text-muted mb-4">Your wishlist is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
""",
    "src/pages/Contact.tsx": """import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-8 pb-24">
      <div className="container-custom">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-8">Contact Us</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100">
              <h2 className="text-xl font-serif font-bold text-text-main mb-6">Store Information</h2>
              
              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-light p-3 rounded-full text-primary shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-1">Vinayak Frames Shop</h3>
                    <p className="text-text-muted leading-relaxed">
                      13-2-248, Beside Saifullah Flyover Bridge,<br/>
                      Near Vishal Mart, Ramachandra Nagar,<br/>
                      Anantapur – 515001, Andhra Pradesh
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary-light p-3 rounded-full text-primary shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-1">Contact</h3>
                    <p className="text-text-muted mb-1">Phone: 9398277441</p>
                    <p className="text-text-muted">WhatsApp: 9398277441</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary-light p-3 rounded-full text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-1">Email</h3>
                    <p className="text-text-muted">vinayakframes123@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary-light p-3 rounded-full text-primary shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-1">Business Hours</h3>
                    <p className="text-text-muted">Mon - Sun: 9:00 AM - 9:00 PM</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex gap-4">
                <a href="tel:9398277441" className="flex-1 bg-white border border-primary text-primary font-medium py-2.5 rounded-lg text-center hover:bg-primary-light transition-colors text-sm">Call Now</a>
                <a href="https://wa.me/919398277441" target="_blank" rel="noreferrer" className="flex-1 bg-[#25D366] text-white font-medium py-2.5 rounded-lg text-center hover:bg-[#128C7E] transition-colors text-sm">WhatsApp</a>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100 mb-6">
              <h2 className="text-xl font-serif font-bold text-text-main mb-6">Send us a Message</h2>
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Name</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Phone</label>
                    <input type="tel" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Message</label>
                  <textarea rows={5} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary resize-none"></textarea>
                </div>
                <button className="bg-primary text-white font-medium px-8 py-3 rounded-lg hover:bg-primary-hover transition-colors">Send Message</button>
              </form>
            </div>
            
            <div className="bg-gray-200 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center">
              <span className="text-gray-500 font-medium">Google Maps Embed Placeholder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
"""
}

def main():
    for filepath, content in files.items():
        # Make sure directory exists
        os.makedirs(os.path.dirname(os.path.join(r"c:\\Users\\muzam\\Desktop\\Vinayaka Frames\\vinayak-frames", filepath)), exist_ok=True)
        with open(os.path.join(r"c:\\Users\\muzam\\Desktop\\Vinayaka Frames\\vinayak-frames", filepath), "w", encoding="utf-8") as f:
            f.write(content)
    print("Files created successfully.")

if __name__ == "__main__":
    main()
