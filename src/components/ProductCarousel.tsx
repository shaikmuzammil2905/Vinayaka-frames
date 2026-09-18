import React, { useRef, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../data/mockData';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, products, viewAllLink }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const step = 1;
    const interval = setInterval(() => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += step;
        scrollAmount += step;
        
        if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth)) {
           scrollContainer.scrollLeft = 0;
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-6 md:py-10 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-main relative pb-3">
            {title}
            <span className="absolute bottom-0 left-0 w-12 h-1 bg-primary rounded-full"></span>
          </h2>
          {viewAllLink && (
            <Link to={viewAllLink} className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1 group">
              View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        <div ref={scrollRef} className="flex overflow-x-auto gap-4 md:gap-6 pb-6 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {products.map(product => (
            <div key={product.id} className="min-w-[200px] w-[200px] md:min-w-[250px] md:w-[250px] flex-shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
