import React from 'react';
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
