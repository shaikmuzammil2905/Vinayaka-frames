import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { MOCK_DATA, Product } from '../data/mockData';
import { api } from '../lib/api';

interface ProductListingProps {
  isDealsPage?: boolean;
}

export const ProductListing: React.FC<ProductListingProps> = ({ isDealsPage = false }) => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  const [allProducts, setAllProducts] = useState<Product[]>(MOCK_DATA.products);
  const [allCategories, setAllCategories] = useState(MOCK_DATA.categories);
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    api.getProducts().then(data => {
      if (active && data && data.length > 0) setAllProducts(data);
    }).catch(console.error);

    api.getCategories().then(cats => {
      if (active && cats && cats.length > 0) setAllCategories(cats);
    }).catch(console.error);

    return () => { active = false; };
  }, []);

  const activeCategory = useMemo(() => {
    if (!categoryId) return null;
    return allCategories.find(c => c.id === categoryId || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === categoryId);
  }, [categoryId, allCategories]);

  let title = "All Products";
  if (isDealsPage) {
    title = "Today's Deals";
  } else if (activeCategory) {
    title = activeCategory.name;
  } else if (search) {
    title = `Search Results for "${search}"`;
  }

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (isDealsPage) {
      list = list.filter(p => p.discount !== undefined && p.discount > 0);
    } else if (activeCategory) {
      list = list.filter(p => p.category.toLowerCase() === activeCategory.name.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategories.length > 0) {
      list = list.filter(p => selectedCategories.includes(p.category));
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return list;
  }, [allProducts, isDealsPage, activeCategory, search, selectedCategories, sortBy]);

  const toggleCategory = (catName: string) => {
    setSelectedCategories(prev =>
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 pb-24">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="text-sm text-text-muted mb-2">Home / {title}</div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main">{title}</h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="text-sm text-text-muted">{filteredProducts.length} products</span>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 text-sm rounded-lg px-4 py-2 ml-auto md:ml-0 outline-none focus:border-primary"
            >
              <option value="featured">Sort By: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 card-shadow sticky top-24">
              <h3 className="font-serif font-semibold text-lg mb-4">Filters</h3>
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3">Categories</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {allCategories.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-sm text-text-muted cursor-pointer hover:text-primary">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(c.name)}
                        onChange={() => toggleCategory(c.name)}
                        className="rounded text-primary focus:ring-primary" 
                      /> 
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              {selectedCategories.length > 0 && (
                <button 
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Clear Category Filters
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <p className="text-gray-500 text-base mb-4">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
