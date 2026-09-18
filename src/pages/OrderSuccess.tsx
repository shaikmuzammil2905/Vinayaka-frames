import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { CheckCircle, Package, Loader2, Home, ArrowRight } from 'lucide-react';

export const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    api.getOrder(orderId)
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-lg text-text-muted mb-4">Could not load your order details.</p>
        <Link to="/" className="text-primary font-medium hover:underline">Go to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 pb-24">
      <div className="container-custom max-w-2xl">
        {/* Success Header */}
        <div className="bg-white rounded-2xl card-shadow p-8 border border-gray-100 text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-text-muted mb-4">
            Thank you for your order, <span className="font-medium text-text-main">{order.customer_name}</span>!
          </p>
          <div className="inline-block bg-primary-light/30 border border-primary/20 rounded-xl px-6 py-3">
            <p className="text-sm text-text-muted">Order Number</p>
            <p className="text-xl font-bold text-primary">{order.order_number}</p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-serif font-bold text-text-main mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex gap-4 items-center">
                {item.product_image && (
                  <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-text-main">{item.product_name}</p>
                  <p className="text-sm text-text-muted">
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.finish && ' | '}
                    {item.finish && `Finish: ${item.finish}`}
                  </p>
                  <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                </div>
                <div className="font-medium text-text-main">
                  ₹{Number(item.total_price).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span className="font-medium text-text-main">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Shipping</span>
              <span className="font-medium text-green-600">{Number(order.shipping_charge) > 0 ? `₹${Number(order.shipping_charge).toLocaleString('en-IN')}` : 'Free'}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-text-muted">
                <span>Discount</span>
                <span className="font-medium text-green-600">-₹{Number(order.discount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <span className="font-bold text-text-main text-lg">Total</span>
              <span className="font-bold text-primary text-xl">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Status & Info */}
        <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Order Status</h3>
              <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {order.order_status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Payment Method</h3>
              <p className="font-medium text-text-main">{order.payment_method}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Payment Status</h3>
              <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {order.payment_status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-muted mb-1">Delivery Address</h3>
              <p className="text-sm text-text-main">{order.address}, {order.city}, {order.state} - {order.pincode}</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-primary-light/30 border border-primary/20 rounded-2xl p-6 mb-8">
          <h3 className="font-serif font-bold text-text-main mb-3">What's Next?</h3>
          <ul className="space-y-2 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              Our team will review and confirm your order shortly.
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              You will receive a WhatsApp / call confirmation on <strong>{order.customer_phone}</strong>.
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              For any queries, contact us on WhatsApp or email.
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
          >
            <Home className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};
