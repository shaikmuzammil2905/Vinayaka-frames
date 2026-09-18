import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const addressDetails = [
      formData.get('house'),
      formData.get('area')
    ].filter(Boolean).join(', ');

    const orderData = {
      customer_name: formData.get('fullName'),
      customer_phone: formData.get('phone'),
      customer_email: formData.get('email'),
      address: addressDetails,
      city: formData.get('city'),
      state: formData.get('state'),
      pincode: formData.get('pincode'),
      payment_method: formData.get('payment'),
    };

    const items = cart.map(item => ({
      product_id: item.productId,
      size: item.size?.size || null,
      finish: item.finishType || null,
      quantity: item.quantity,
      image: item.product.images[0] || null,
      personalization: item.personalizationDetails || null
    }));

    try {
      const orderId = await api.placeOrder(orderData, items);
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                  <input name="fullName" required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Mobile Number</label>
                  <input name="phone" required type="tel" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">Email Address</label>
                  <input name="email" required type="email" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">House / Street / Flat No.</label>
                  <input name="house" required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">Area / Locality</label>
                  <input name="area" required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">City</label>
                  <input name="city" required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">State</label>
                  <input name="state" required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Pincode</label>
                  <input name="pincode" required type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-primary bg-primary-light/20 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" value="UPI" defaultChecked className="w-4 h-4 text-primary focus:ring-primary" />
                  <span className="font-medium">UPI (GPay, PhonePe, Paytm)</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 hover:border-primary rounded-xl cursor-pointer transition-colors">
                  <input type="radio" name="payment" value="Card" className="w-4 h-4 text-primary focus:ring-primary" />
                  <span className="font-medium">Credit / Debit Card</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 hover:border-primary rounded-xl cursor-pointer transition-colors">
                  <input type="radio" name="payment" value="COD" className="w-4 h-4 text-primary focus:ring-primary" />
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
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold h-14 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 text-lg flex items-center justify-center disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
