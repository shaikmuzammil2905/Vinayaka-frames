import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Loader2, ShieldCheck } from 'lucide-react';

export const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('COD');
  const isSubmitting = useRef(false); // Guard against double submission
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Handle empty cart redirect via useEffect (not during render)
  useEffect(() => {
    if (cart.length === 0 && !shouldRedirect) {
      setShouldRedirect(true);
      navigate('/cart');
    }
  }, [cart.length, navigate, shouldRedirect]);

  if (cart.length === 0) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting.current || isLoading) return;
    isSubmitting.current = true;
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);

    // --- Client-side validation ---
    const fullName = (formData.get('fullName') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const house = (formData.get('house') as string || '').trim();
    const area = (formData.get('area') as string || '').trim();
    const city = (formData.get('city') as string || '').trim();
    const state = (formData.get('state') as string || '').trim();
    const pincode = (formData.get('pincode') as string || '').trim();
    const payment = selectedPayment;

    if (!fullName || !phone || !email || !house || !area || !city || !state || !pincode) {
      toast.error('Please complete all required delivery details.');
      setIsLoading(false);
      isSubmitting.current = false;
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit mobile number.');
      setIsLoading(false);
      isSubmitting.current = false;
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      toast.error('Please enter a valid 6-digit pincode.');
      setIsLoading(false);
      isSubmitting.current = false;
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      setIsLoading(false);
      isSubmitting.current = false;
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      setIsLoading(false);
      isSubmitting.current = false;
      return;
    }

    // Only COD is functional right now
    if (payment !== 'COD') {
      toast.error('Only Cash on Delivery is available at the moment. Other payment methods coming soon!');
      setIsLoading(false);
      isSubmitting.current = false;
      return;
    }

    const addressDetails = [house, area].filter(Boolean).join(', ');

    const orderData = {
      customer_name: fullName,
      customer_phone: phone,
      customer_email: email,
      address: addressDetails,
      city,
      state,
      pincode,
      payment_method: payment,
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
      
      // Only clear cart AFTER confirmed success
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${orderId}`);
    } catch (error: any) {
      console.error('Order placement error:', error);
      // Show only ONE user-friendly toast (error is already mapped in api.ts)
      toast.error(error?.message || 'Unable to place your order right now. Please try again.');
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  const paymentOptions = [
    { value: 'COD', label: 'Cash on Delivery', icon: '💵', available: true },
    { value: 'UPI', label: 'UPI (GPay, PhonePe, Paytm)', icon: '📱', available: false },
    { value: 'Card', label: 'Credit / Debit Card', icon: '💳', available: false },
  ];

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
                  <label className="block text-sm font-medium text-text-main mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input name="fullName" required type="text" placeholder="Enter your full name" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Mobile Number <span className="text-red-500">*</span></label>
                  <input name="phone" required type="tel" pattern="[0-9]{10}" maxLength={10} placeholder="10-digit mobile number" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input name="email" required type="email" placeholder="your@email.com" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">House / Street / Flat No. <span className="text-red-500">*</span></label>
                  <input name="house" required type="text" placeholder="House no., building, street" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">Area / Locality <span className="text-red-500">*</span></label>
                  <input name="area" required type="text" placeholder="Area, colony, locality" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">City <span className="text-red-500">*</span></label>
                  <input name="city" required type="text" placeholder="City" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">State <span className="text-red-500">*</span></label>
                  <input name="state" required type="text" placeholder="State" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Pincode <span className="text-red-500">*</span></label>
                  <input name="pincode" required type="text" pattern="[0-9]{6}" maxLength={6} placeholder="6-digit pincode" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Payment Method</h2>
              <div className="space-y-3">
                {paymentOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedPayment === opt.value
                        ? 'border-primary bg-primary-light/20 shadow-sm shadow-primary/10'
                        : 'border-gray-200 hover:border-primary/50'
                    } ${!opt.available && opt.value !== 'COD' ? 'opacity-60' : ''}`}
                    onClick={() => setSelectedPayment(opt.value)}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={selectedPayment === opt.value}
                      onChange={() => setSelectedPayment(opt.value)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-lg">{opt.icon}</span>
                    <span className="font-medium flex-1">{opt.label}</span>
                    {!opt.available && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Coming Soon</span>
                    )}
                  </label>
                ))}
              </div>
              {selectedPayment === 'COD' && (
                <div className="mt-4 flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                  <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Pay when your order is delivered. No advance payment required.</span>
                </div>
              )}
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
                      <p className="text-text-muted text-xs">Qty: {item.quantity} {item.size && `| ${item.size.size}`} {item.finishType && `| ${item.finishType}`}</p>
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
                className="w-full bg-primary text-white font-bold h-14 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
