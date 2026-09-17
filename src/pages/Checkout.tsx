import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const Checkout = () => {
  const { cart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('This is a frontend demo. Order placement logic would go here.');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 pb-24">
      <div className="container-custom">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* Customer Details */}
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Customer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Full Name</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Mobile Number</label>
                  <input required type="tel" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">Email Address</label>
                  <input required type="email" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">House / Street / Flat No.</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">Area / Locality</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">City</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">State</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Pincode</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-primary bg-primary-light/20 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-primary focus:ring-primary" />
                  <span className="font-medium">UPI (GPay, PhonePe, Paytm)</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 hover:border-primary rounded-xl cursor-pointer transition-colors">
                  <input type="radio" name="payment" className="w-4 h-4 text-primary focus:ring-primary" />
                  <span className="font-medium">Credit / Debit Card</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 hover:border-primary rounded-xl cursor-pointer transition-colors">
                  <input type="radio" name="payment" className="w-4 h-4 text-primary focus:ring-primary" />
                  <span className="font-medium">Cash on Delivery</span>
                </label>
              </div>
            </div>

          </div>
          
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100 sticky top-24">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded-md bg-gray-100" />
                    <div className="flex-1">
                      <p className="font-medium text-text-main line-clamp-1">{item.product.name}</p>
                      <p className="text-text-muted text-xs">Qty: {item.quantity} {item.size && `| ${item.size.size}`}</p>
                    </div>
                    <div className="font-medium">₹{(item.itemPrice * item.quantity).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 text-sm mb-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-text-main">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Delivery (All India)</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Gift Packing</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-text-main text-lg">Total</span>
                  <span className="font-bold text-primary text-2xl">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-primary text-white font-bold h-14 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 text-lg"
              >
                Place Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
