import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { Package, Tag, Star, Eye, TrendingUp, Clock, Loader2, ShoppingCart, IndianRupee, CheckCircle, AlertCircle, XCircle, Banknote, Settings } from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    totalReviews: 0,
    pendingReviews: 0,
    featuredProducts: 0,
  });
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: totalProducts },
        { count: activeProducts },
        { count: totalCategories },
        { count: totalReviews },
        { count: pendingReviews },
        { count: featuredProducts },
        { data: recent },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('approved', false),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_best_seller', true),
        supabase.from('products').select('id, name, price, active, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        totalCategories: totalCategories || 0,
        totalReviews: totalReviews || 0,
        pendingReviews: pendingReviews || 0,
        featuredProducts: featuredProducts || 0,
      });
      setRecentProducts(recent || []);

      // Fetch order stats
      const dashStats = await api.getDashboardStats();
      if (dashStats) {
        setOrderStats(dashStats);
      }

      // Fetch recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, total_amount, order_status, payment_status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentOrders(orders || []);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    Processing: 'bg-indigo-100 text-indigo-800',
    Shipped: 'bg-purple-100 text-purple-800',
    Delivered: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
    Paid: 'bg-green-100 text-green-800',
    Failed: 'bg-red-100 text-red-800',
    Refunded: 'bg-gray-100 text-gray-800',
  };

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-50 text-blue-600', link: '/admin/products' },
    { label: 'Active Products', value: stats.activeProducts, icon: Eye, color: 'bg-green-50 text-green-600', link: '/admin/products' },
    { label: 'Categories', value: stats.totalCategories, icon: Tag, color: 'bg-purple-50 text-purple-600', link: '/admin/categories' },
    { label: 'Total Reviews', value: stats.totalReviews, icon: Star, color: 'bg-yellow-50 text-yellow-600', link: '/admin/reviews' },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'bg-red-50 text-red-600', link: '/admin/reviews' },
    { label: 'Featured / Best Sellers', value: stats.featuredProducts, icon: TrendingUp, color: 'bg-orange-50 text-orange-600', link: '/admin/products' },
  ];

  const orderCards = [
    { label: 'Total Orders', value: orderStats.totalOrders, icon: ShoppingCart, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Pending Orders', value: orderStats.pendingOrders, icon: AlertCircle, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Processing', value: orderStats.processingOrders, icon: Settings, color: 'bg-blue-50 text-blue-600' },
    { label: 'Delivered', value: orderStats.completedOrders, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Cancelled', value: orderStats.cancelledOrders, icon: XCircle, color: 'bg-red-50 text-red-600' },
    { label: 'Pending Payments', value: orderStats.pendingPayments, icon: Banknote, color: 'bg-orange-50 text-orange-600' },
    { label: 'Total Revenue', value: `₹${orderStats.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Order Statistics */}
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Order Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {orderCards.map((card) => (
          <div
            key={card.label}
            onClick={() => navigate('/admin/orders')}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Product & Content Statistics */}
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Products & Content</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={() => navigate(card.link)}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout for recent items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-serif font-semibold text-lg text-gray-800">Recent Orders</h2>
            <button onClick={() => navigate('/admin/orders')} className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm p-5">No orders yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate('/admin/orders')}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-medium text-primary text-sm">{order.order_number}</p>
                    <p className="text-sm text-gray-800">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.order_status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.order_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-serif font-semibold text-lg text-gray-800">Recently Added Products</h2>
            <button onClick={() => navigate('/admin/products')} className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          {recentProducts.length === 0 ? (
            <p className="text-gray-500 text-sm p-5">No products yet. Add your first product!</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentProducts.map((p) => (
                  <tr key={p.id} onClick={() => navigate('/admin/products')} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="p-4 font-medium text-gray-800">{p.name}</td>
                    <td className="p-4">₹{p.price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
