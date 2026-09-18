import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeroSlider } from '../components/HeroSlider';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCarousel } from '../components/ProductCarousel';
import { MOCK_DATA } from '../data/mockData';

import dealImage from '../assets/deal-image-16.png';
import grandLookImage from '../assets/grand-look.png';
export const Home = () => {
  const newArrivals = MOCK_DATA.products.filter(p => p.isNew).slice(0, 8);
  const bestSellers = MOCK_DATA.products.filter(p => p.isBestSeller).slice(0, 8);
  const trending = MOCK_DATA.products.filter(p => p.isTrending).slice(0, 8);

  // Countdown timer logic for Deal of the Day
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      <section className="py-12">
        <div className="container-custom">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row items-stretch w-full min-h-[400px]">
            
            {/* Left Content */}
            <div className="w-full md:w-[55%] p-8 md:p-12 lg:p-16 flex flex-col items-start justify-center relative z-10">
              <div className="bg-red-100 text-red-600 text-sm font-bold px-4 py-1.5 rounded-full inline-block mb-4">Deal of the Day 🔥</div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">Save 30% on LED Heart Lamps</h2>
              <p className="text-gray-600 mb-8 text-base md:text-lg max-w-md">A glowing LED lamp in a beautiful heart shape. Personalize it with a special message. Offer valid today only.</p>
              
              {/* Countdown */}
              <div className="flex flex-row gap-3 md:gap-4 mb-8">
                <div className="bg-orange-50 rounded-xl p-3 md:p-4 w-[75px] md:w-[90px] flex flex-col items-center justify-center border border-orange-100">
                  <span className="block text-3xl md:text-4xl font-bold text-primary leading-none mb-1">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">HOURS</span>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 md:p-4 w-[75px] md:w-[90px] flex flex-col items-center justify-center border border-orange-100">
                  <span className="block text-3xl md:text-4xl font-bold text-primary leading-none mb-1">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">MINS</span>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 md:p-4 w-[75px] md:w-[90px] flex flex-col items-center justify-center border border-orange-100">
                  <span className="block text-3xl md:text-4xl font-bold text-primary leading-none mb-1">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">SECS</span>
                </div>
              </div>
              
              {/* CTA */}
              <Link to="/deals" className="inline-block bg-primary text-white font-bold px-8 py-3.5 md:px-10 md:py-4 rounded-full hover:bg-primary-hover transition-all shadow-md text-base md:text-lg">
                Shop Deal Now →
              </Link>
            </div>

            {/* Right Image */}
            <div className="w-full md:w-[45%] h-[300px] md:h-auto relative bg-gradient-to-br from-orange-50/50 to-white flex items-center justify-center p-4 md:p-8">
               <img src={dealImage} alt="Deal Image" className="w-full h-full object-contain" />
            </div>

          </div>
        </div>
      </section>

      {/* Grand Look Section */}
      <section className="py-16 md:py-24 bg-gray-50 overflow-hidden">
        <div className="container-custom">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10 hidden md:block"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 md:hidden"></div>
            
            <img src={grandLookImage} alt="Premium Frames" className="absolute inset-0 w-full h-full object-cover" />
            
            <div className="relative z-20 w-full md:w-1/2 p-10 md:p-16 lg:p-24 flex flex-col items-center md:items-start text-center md:text-left min-h-[400px] md:min-h-[500px] justify-end md:justify-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                Elegance in Every Detail
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-lg">
                Discover our premium collection of handcrafted frames designed to give your spaces a grand look.
              </p>
              <Link to="/categories" className="inline-block bg-white text-text-main font-bold px-10 py-4 md:px-12 md:py-5 rounded-full hover:bg-primary hover:text-white transition-all shadow-xl text-lg tracking-wide uppercase">
                Explore Premium
              </Link>
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
