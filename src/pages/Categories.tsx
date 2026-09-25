import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getCategories().then(data => {
      if (active) {
        setCategories(data);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12 min-h-[60vh] pb-32">
      <h1 className="text-3xl font-serif font-bold text-text-main mb-8 text-center">All Categories</h1>
      
      {categories.length === 0 ? (
        <div className="text-center text-text-muted py-12">
          <p>No categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link 
              key={cat.id || idx} 
              to={`/category/${cat.id}`}
              className="group block rounded-2xl overflow-hidden bg-white card-shadow hover:shadow-lg transition-all"
            >
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                {cat.image ? (
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                    <span className="font-serif text-lg">{cat.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <h3 className="text-white font-serif font-medium text-lg">{cat.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
