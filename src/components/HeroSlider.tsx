import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import heroImage1 from '../assets/hero-slide-1.png';
import heroBg from '../assets/hero-bg.png';
import heroBg2 from '../assets/hero-bg-2.png';

const slides = [
  {
    id: 1,
    title: "Turn Your Memories Into Beautiful Frames",
    subtitle: "Personalized frames, thoughtful gifts and heartfelt moments — all in one place.",
    cta: "Shop Now",
    link: "/categories",
    image: heroBg2,
  },
  {
    id: 3,
    title: "Beautiful Frames Made For Every Occasion",
    subtitle: "Birthday • Wedding • Baby • Family • Memories",
    cta: "Explore Collection",
    link: "/categories",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    textColor: "text-gray-900",
    gradient: "from-white/80 via-white/50",
  },
  {
    id: 4,
    title: "Elegance in Every Detail",
    subtitle: "Discover our premium collection of handcrafted frames designed to give your spaces a grand look.",
    cta: "Shop Premium",
    link: "/categories",
    image: heroBg,
  }
];

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroData, setHeroData] = useState<any>(null);

  useEffect(() => {
    let active = true;
    api.getSiteSettings().then(data => {
      if (active && data?.hero) {
        setHeroData(data.hero);
      }
    });
    return () => { active = false; };
  }, []);

  const currentSlides = [...slides];
  if (heroData) {
    currentSlides[0] = {
      ...currentSlides[0],
      title: heroData.heading || currentSlides[0].title,
      subtitle: heroData.subtitle || currentSlides[0].subtitle,
      cta: heroData.button_text || currentSlides[0].cta,
      image: heroData.hero_image || currentSlides[0].image,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[450px] md:h-[600px] bg-background-alt overflow-hidden slider-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img 
            src={currentSlides[currentSlide].image} 
            alt={currentSlides[currentSlide].title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${currentSlides[currentSlide].gradient || 'from-black/70 via-black/40'} to-transparent`}></div>
          
          <div className="absolute inset-0 flex items-center">
            <div className="container-custom w-full">
              <div className={`max-w-xl ${currentSlides[currentSlide].textColor || 'text-white'}`}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-4 flex flex-wrap gap-2"
                >
                  <span className={`bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-sm`}>
                    🎁 FREE Gift Packing
                  </span>
                  <span className={`bg-white/20 border border-white/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-sm ${currentSlides[currentSlide].textColor || 'text-white'}`}>
                    🚚 All India Delivery
                  </span>
                </motion.div>
                
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-4"
                >
                  {currentSlides[currentSlide].title}
                </motion.h1>
                
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-base md:text-lg opacity-90 mb-8 max-w-lg"
                >
                  {currentSlides[currentSlide].subtitle}
                </motion.p>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Link 
                    to={currentSlides[currentSlide].link}
                    className="inline-block bg-primary text-white font-bold px-10 py-4 text-lg rounded-full hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30"
                  >
                    {currentSlides[currentSlide].cta}
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
        {currentSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
