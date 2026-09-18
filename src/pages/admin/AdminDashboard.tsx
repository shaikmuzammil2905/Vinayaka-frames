import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Tag, Star, Eye, TrendingUp, Clock, Loader2 } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    totalReviews: 0,
    pendingReviews: 0,
    featuredProducts: 0,
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
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

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Products', value: stats.activeProducts, icon: Eye, color: 'bg-green-50 text-green-600' },
    { label: 'Categories', value: stats.totalCategories, icon: Tag, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Reviews', value: stats.totalReviews, icon: Star, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'bg-red-50 text-red-600' },
    { label: 'Featured / Best Sellers', value: stats.featuredProducts, icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
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

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-serif font-semibold text-lg text-gray-800">Recently Added Products</h2>
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
                <tr key={p.id}>
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
  );
};
