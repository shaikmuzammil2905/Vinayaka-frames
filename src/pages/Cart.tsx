import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag } from 'lucide-react';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container-custom py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="bg-primary-light/50 p-6 rounded-full mb-6">
          <ShoppingBag className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-text-main mb-3">Your Cart is Empty</h2>
        <p className="text-text-muted mb-8 max-w-md">Looks like you haven't added any beautiful frames or gifts to your cart yet.</p>
        <Link to="/categories" className="bg-primary text-white font-medium px-8 py-3 rounded-full hover:bg-primary-hover transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 pb-24">
      <div className="container-custom">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-2xl card-shadow overflow-hidden border border-gray-100">
              <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center text-sm font-medium text-text-muted">
                <span>Products</span>
                <span className="hidden md:block">Price</span>
              </div>
              
              <ul className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <li key={item.id} className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
                    <Link to={`/product/${item.productId}`} className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden block">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </Link>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <Link to={`/product/${item.productId}`} className="font-medium text-text-main hover:text-primary transition-colors text-base md:text-lg">
                          {item.product.name}
                        </Link>
                        <span className="font-bold text-lg md:hidden">₹{(item.itemPrice * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div className="text-sm text-text-muted mb-3 space-y-1">
                        {item.size && <p>Size: <span className="font-medium text-text-main">{item.size.size}</span></p>}
                        {item.finishType && <p>Finish: <span className="font-medium text-text-main">{item.finishType}</span></p>}
                        {item.personalizationDetails?.customName && <p>Name: "{item.personalizationDetails.customName}"</p>}
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded-lg h-9 w-28 bg-white">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex-1 flex justify-center text-text-muted hover:text-primary">-</button>
                          <span className="font-medium text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex-1 flex justify-center text-text-muted hover:text-primary">+</button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-text-muted hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="hidden md:block w-32 text-right">
                      <span className="font-bold text-lg">₹{(item.itemPrice * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-primary-light/40 border border-primary/20 rounded-xl p-4 mt-6 flex flex-col sm:flex-row items-center gap-4 text-primary font-medium justify-center sm:justify-start">
              <span>🎁 Free Gift Packing Included</span>
              <span className="hidden sm:block">•</span>
              <span>🚚 All Over India Delivery Available</span>
            </div>
          </div>
          
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100 sticky top-24">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-text-main">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Delivery</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Gift Packing</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-text-main text-lg">Total</span>
                  <span className="font-bold text-primary text-2xl">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary text-white font-medium h-12 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 mb-4"
              >
                Proceed to Checkout
              </button>
              <Link to="/categories" className="block text-center text-sm text-primary hover:underline font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
