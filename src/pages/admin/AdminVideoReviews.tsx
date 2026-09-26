import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Loader2, X, Save, ArrowLeft, Star, Eye, EyeOff, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadVideoHelper, deleteStorageMedia } from '../../lib/videoUtils';
import { uploadImageHelper } from '../../lib/imageUtils';

interface VideoReview {
  id: string;
  customer_name: string;
  review_text: string;
  rating: number;
  video_url: string;
  thumbnail_url: string;
  product_id: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  products?: { name: string };
}

const emptyForm = {
  customer_name: '',
  review_text: '',
  rating: 5,
  video_url: '',
  thumbnail_url: '',
  product_id: '',
  is_active: true,
  display_order: 0,
};

export const AdminVideoReviews = () => {
  const [reviews, setReviews] = useState<VideoReview[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customer_video_reviews')
      .select('*, products(name)')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to load video reviews');
    else setReviews(data || []);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name').eq('active', true).order('name');
    setProducts(data || []);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: reviews.length });
    setHoverRating(0);
    setShowForm(true);
  };

  const openEdit = (review: VideoReview) => {
    setEditingId(review.id);
    setForm({
      customer_name: review.customer_name,
      review_text: review.review_text || '',
      rating: review.rating,
      video_url: review.video_url,
      thumbnail_url: review.thumbnail_url || '',
      product_id: review.product_id || '',
      is_active: review.is_active,
      display_order: review.display_order,
    });
    setHoverRating(0);
    setShowForm(true);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploadingVideo(true);
    setUploadProgress(0);
    setUploadStatusText('Starting video upload...');
    try {
      const result = await uploadVideoHelper(file, 'videos', (percent, text) => {
        setUploadProgress(percent);
        setUploadStatusText(text);
      });
      if (form.video_url && form.video_url !== result.url) {
        deleteStorageMedia(form.video_url, 'videos').catch(console.warn);
      }
      setForm(prev => ({
        ...prev,
        video_url: result.url,
        thumbnail_url: prev.thumbnail_url || result.thumbnailUrl || '',
      }));
      toast.success('Video uploaded successfully!');
    } catch (err: any) {
      toast.error('Video upload failed: ' + (err.message || ''));
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingThumb(true);
    try {
      const result = await uploadImageHelper(e.target.files[0]);
      setForm(prev => ({ ...prev, thumbnail_url: result.url }));
      toast.success('Thumbnail uploaded!');
    } catch (err: any) {
      toast.error('Thumbnail upload failed: ' + (err.message || ''));
    } finally {
      setUploadingThumb(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.customer_name.trim()) { toast.error('Customer name is required'); return; }
    if (!form.video_url.trim()) { toast.error('Video URL or upload is required'); return; }
    setSaving(true);
    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        review_text: form.review_text.trim() || null,
        rating: form.rating,
        video_url: form.video_url.trim(),
        thumbnail_url: form.thumbnail_url.trim() || null,
        product_id: form.product_id || null,
        is_active: form.is_active,
        display_order: Number(form.display_order) || 0,
      };
      if (editingId) {
        const { error } = await supabase.from('customer_video_reviews').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Video review updated! Live on website.');
      } else {
        const { error } = await supabase.from('customer_video_reviews').insert(payload);
        if (error) throw error;
        toast.success('Video review added! Live on website.');
      }
      setShowForm(false);
      fetchReviews();
    } catch (err: any) {
      toast.error('Error saving: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (review: VideoReview) => {
    if (!window.confirm('Delete this video review permanently?')) return;
    try {
      await deleteStorageMedia(review.video_url, 'videos');
      if (review.thumbnail_url) await deleteStorageMedia(review.thumbnail_url, 'product-images');
      const { error } = await supabase.from('customer_video_reviews').delete().eq('id', review.id);
      if (error) throw error;
      toast.success('Video review deleted');
      fetchReviews();
    } catch (err: any) {
      toast.error('Error deleting: ' + (err.message || ''));
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('customer_video_reviews').update({ is_active: !current }).eq('id', id);
    if (error) toast.error('Error updating status');
    else { toast.success(current ? 'Review hidden from website' : 'Review now live on website'); fetchReviews(); }
  };

  if (showForm) {
    return (
      <div className="max-w-2xl">
        <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Video Reviews
        </button>
        <h1 className="text-2xl font-serif font-bold text-gray-800 mb-6">{editingId ? 'Edit Video Review' : 'Add Video Review'}</h1>

        <div className="space-y-5">
          {/* Customer Info */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Customer Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                value={form.customer_name}
                onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))}
                placeholder="e.g. Rahul S."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating *</label>
              <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-200 w-fit">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setForm(p => ({ ...p, rating: star }))}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star className={`w-6 h-6 ${(hoverRating || form.rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-gray-600">{form.rating}/5 Stars</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
              <textarea
                rows={3}
                value={form.review_text}
                onChange={e => setForm(p => ({ ...p, review_text: e.target.value }))}
                placeholder="Write what the customer said about their experience..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product (Optional)</label>
              <select
                value={form.product_id}
                onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">-- No specific product --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </section>

          {/* Video Upload */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Customer Video *</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Customer Video</label>
              <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/*" onChange={handleVideoUpload} className="hidden" />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingVideo}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
              >
                {uploadingVideo ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : null}
                {uploadingVideo ? (uploadStatusText || 'Uploading Video...') : 'Click to Upload Customer Video (MP4, MOV, WebM)'}
              </button>

              {uploadingVideo && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>{uploadStatusText || 'Uploading...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-200 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {form.video_url && (
                <div className="mt-2">
                  <p className="text-xs text-green-600 font-medium mb-1">✓ Video ready</p>
                  <video src={form.video_url} controls preload="metadata" className="w-full rounded-xl max-h-40 bg-black" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (optional alternative to upload)</label>
              <input
                type="url"
                value={form.video_url}
                onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))}
                placeholder="https://... (optional fallback)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </section>

          {/* Thumbnail */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Thumbnail / Preview Image</h2>
            <div>
              <input ref={thumbInputRef} type="file" accept="image/*" onChange={handleThumbUpload} className="hidden" />
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                disabled={uploadingThumb}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary hover:text-primary transition-colors"
              >
                {uploadingThumb ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {uploadingThumb ? 'Uploading...' : 'Upload Thumbnail Image'}
              </button>
              {form.thumbnail_url && (
                <img src={form.thumbnail_url} alt="Thumbnail" className="mt-2 w-full max-h-32 object-cover rounded-xl" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (alternative)</label>
              <input
                type="url"
                value={form.thumbnail_url}
                onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </section>

          {/* Settings */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Settings</h2>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer bg-gray-50 rounded-lg px-3 py-2">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded text-primary" />
                <span className="text-sm font-medium">Active (visible on website)</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Display Order:</label>
                <input type="number" value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: Number(e.target.value) }))}
                  className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </section>

          <div className="flex gap-4">
            <button onClick={() => setShowForm(false)} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-hover font-medium flex items-center justify-center gap-2 shadow-md shadow-primary/20">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} {editingId ? 'Update Review' : 'Save Review'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">Customer Video Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Manage video testimonials that appear on the website</p>
        </div>
        <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-hover whitespace-nowrap shadow-sm shadow-primary/20">
          <Plus className="w-4 h-4" /> Add Video Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No video reviews yet.</p>
          <button onClick={openCreate} className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-hover font-medium">
            Add First Video Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Video Preview */}
              <div className="relative aspect-video bg-gray-900">
                {review.thumbnail_url ? (
                  <img src={review.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : review.video_url ? (
                  <video src={review.video_url} preload="metadata" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Star className="w-12 h-12 text-white/20" />
                  </div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${review.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {review.is_active ? 'Live' : 'Hidden'}
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800">{review.customer_name}</p>
                    <div className="flex gap-0.5 my-1">
                      {[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
                    </div>
                    {review.products && <p className="text-xs text-gray-500 mb-1">Product: {review.products.name}</p>}
                    {review.review_text && <p className="text-sm text-gray-600 line-clamp-2">{review.review_text}</p>}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => openEdit(review)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleActive(review.id, review.is_active)} className={`p-2 rounded-lg transition-colors ${review.is_active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`} title={review.is_active ? 'Hide' : 'Show'}>
                      {review.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(review)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
