import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Product } from '../data/mockData';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden card-shadow h-full border border-gray-100">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discount && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={toggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-text-muted hover:text-red-500 transition-colors shadow-sm"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-text-muted">{product.rating} ({product.reviews})</span>
        </div>
        
        <h3 className="font-medium text-sm text-text-main line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-base text-text-main">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-text-muted line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          
          <button className="bg-primary-light text-primary hover:bg-primary hover:text-white transition-colors h-8 w-8 rounded-full flex items-center justify-center font-bold pb-1 text-xl">
            +
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
