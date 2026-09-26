import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    image: string;
    slug?: string;
  };
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link to={`/category/${category.slug || category.id}`} className="group flex flex-col items-center gap-3">
      <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300 shadow-sm group-hover:shadow-md bg-white p-1">
        <div className="w-full h-full rounded-full overflow-hidden">
          <img 
            src={category.image} 
            alt={category.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </div>
      <span className="text-xs md:text-sm font-medium text-center text-text-main group-hover:text-primary transition-colors line-clamp-2 w-full px-1">
        {category.name}
      </span>
    </Link>
  );
};

export default CategoryCard;
