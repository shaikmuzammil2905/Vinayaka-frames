import React from 'react';
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
