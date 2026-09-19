import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FinishType, Product, SizeOption } from '../data/mockData';

export interface CartItem {
  id: string; // unique ID for cart item
  productId: string;
  product: Product;
  quantity: number;
  size?: SizeOption;
  finishType?: FinishType;
  personalizationDetails?: {
    photoUrl?: string;
    customName?: string;
    customMessage?: string;
    frameStyle?: string;
  };
  itemPrice: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('vf_cart');
      if (!savedCart) return [];
      const parsed: CartItem[] = JSON.parse(savedCart);
      const LEGACY_MAP: Record<string, string> = {
        p1: '5c06c350-f02d-4b01-a6eb-ea65cc87e278',
        p2: '1c4788a4-b8d0-422c-a5e8-6d64ea4f0492',
        p3: '25f39418-8148-49f9-9b49-f12bea38266d',
        p4: '907a5662-ef0a-4541-ae11-d8696cbd246f',
      };
      return parsed.map(item => {
        const mappedId = LEGACY_MAP[item.productId];
        if (mappedId) {
          return {
            ...item,
            productId: mappedId,
            product: { ...item.product, id: mappedId }
          };
        }
        return item;
      });
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('vf_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    setCart(prev => {
      // Create a unique ID based on product ID and selected options
      const cartItemId = `${newItem.productId}-${newItem.size?.size || 'none'}-${newItem.finishType || 'none'}`;
      
      const existingItemIndex = prev.findIndex(item => 
        item.productId === newItem.productId && 
        item.size?.size === newItem.size?.size && 
        item.finishType === newItem.finishType
      );

      if (existingItemIndex > -1) {
        // If identical item exists, increase quantity
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += newItem.quantity;
        return newCart;
      }
      
      return [...prev, { ...newItem, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('vf_cart');
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartTotal = cart.reduce((total, item) => total + (item.itemPrice * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
