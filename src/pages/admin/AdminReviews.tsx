import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Star, Check, X, Trash2, Plus, MessageSquare, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // New Review Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({
    customer_name: '',
    rating: 5,
    content: '',
    product_id: '',
    approved: true
  });

  useEffect(() => { 
    fetchReviews();
    fetchProducts();
  }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to load reviews');
    else setReviews(data || []);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name')
      .eq('active', true)
      .order('name');
    setProducts(data || []);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('reviews').update({ approved: true }).eq('id', id);
    if (error) toast.error('Error approving review');
    else { toast.success('Review approved'); fetchReviews(); }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from('reviews').update({ approved: false }).eq('id', id);
    if (error) toast.error('Error rejecting review');
    else { toast.success('Review rejected'); fetchReviews(); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this review permanently?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) toast.error('Error deleting review');
    else { toast.success('Review deleted'); fetchReviews(); }
  };

  const openAddModal = () => {
    setForm({
      customer_name: '',
      rating: 5,
      content: '',
      product_id: '',
      approved: true
    });
    setHoverRating(0);
    setShowAddModal(true);
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (!form.content.trim()) {
      toast.error('Please enter review content');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        rating: form.rating,
        content: form.content.trim(),
        product_id: form.product_id || null,
        approved: form.approved
      };

      const { error } = await supabase.from('reviews').insert(payload);
      if (error) throw error;

      toast.success('New review & rating added successfully!');
      setShowAddModal(false);
      fetchReviews();
    } catch (err: any) {
      toast.error('Failed to add review: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === 'all' ? reviews
    : filter === 'pending' ? reviews.filter(r => !r.approved)
    : reviews.filter(r => r.approved);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-serif font-bold text-gray-800">Reviews & Ratings</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5 bg-gray-200/60 p-1 rounded-xl">
            {(['all', 'pending', 'approved'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}>
                {f} {f === 'pending' ? `(${reviews.filter(r => !r.approved).length})` : ''}
              </button>
            ))}
          </div>

          <button
            onClick={openAddModal}
            className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-hover font-medium text-sm transition-all shadow-sm shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Add Review
          </button>
        </div>
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-gray-800">Add New Review & Rating</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya R."
                  value={form.customer_name}
                  onChange={e => setForm(prev => ({ ...prev, customer_name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product (Optional)</label>
                <select
                  value={form.product_id}
                  onChange={e => setForm(prev => ({ ...prev, product_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
                >
                  <option value="">-- General Store Review --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating*</label>
                <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-200 w-fit">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          (hoverRating || form.rating) >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-gray-600">{form.rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Content / Feedback*</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write customer review content..."
                  value={form.content}
                  onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.approved}
                  onChange={e => setForm(prev => ({ ...prev, approved: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Approve immediately (Visible on live website)</span>
              </label>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 font-medium text-sm shadow-md shadow-primary/20"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100">
          No reviews found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-medium text-gray-800">{review.customer_name}</span>
                    <div className="flex items-center gap-0.5 text-yellow-400">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${review.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {review.approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  {review.products && <p className="text-xs text-gray-500 mb-2">Product: {review.products.name}</p>}
                  <p className="text-gray-600 text-sm">{review.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 items-start">
                  {!review.approved && (
                    <button onClick={() => handleApprove(review.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {review.approved && (
                    <button onClick={() => handleReject(review.id)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Reject">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(review.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
