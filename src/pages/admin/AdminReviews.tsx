import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Star, Check, X, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to load reviews');
    else setReviews(data || []);
    setLoading(false);
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

  const filtered = filter === 'all' ? reviews
    : filter === 'pending' ? reviews.filter(r => !r.approved)
    : reviews.filter(r => r.approved);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-serif font-bold text-gray-800">Reviews & Ratings</h1>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f} {f === 'pending' ? `(${reviews.filter(r => !r.approved).length})` : ''}
            </button>
          ))}
        </div>
      </div>

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
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-gray-800">{review.customer_name}</span>
                    <div className="flex items-center gap-0.5 text-yellow-400">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${review.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
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
