import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Search, Store, ShoppingCart, Phone, Home } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const BottomNavigation = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: LayoutGrid, label: 'Categories', path: '/categories' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Store, label: 'Shop', path: '/', isPrimary: true },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: cartCount },
    { icon: Phone, label: 'Contact', path: '/contact' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 px-2 pb-safe">
      <div className="flex items-center justify-around h-16 relative">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          if (item.isPrimary) {
            return (
              <Link 
                key={index} 
                to={item.path}
                className="flex flex-col items-center justify-center w-16 -mt-6"
              >
                <div className="bg-primary text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white mb-1">
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                  {item.label}
                </span>
              </Link>
            );
          }
          
          return (
            <Link 
              key={index} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-full relative ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute top-1 right-2 bg-primary text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
