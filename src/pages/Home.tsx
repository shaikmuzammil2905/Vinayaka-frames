import React from 'react';
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
