import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Loader2, Save, ArrowLeft, Eye, EyeOff, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadVideoHelper, deleteStorageMedia } from '../../lib/videoUtils';
import { uploadImageHelper } from '../../lib/imageUtils';

interface Reel {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  product_id: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  products?: { name: string };
}

const emptyForm = {
  title: '',
  description: '',
  video_url: '',
  thumbnail_url: '',
  product_id: '',
  is_active: true,
  display_order: 0,
};

export const AdminReels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
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
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReels();
    fetchProducts();
  }, []);

  const fetchReels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reels')
      .select('*, products(name)')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to load reels');
    else setReels(data || []);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name').eq('active', true).order('name');
    setProducts(data || []);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: reels.length });
    setShowForm(true);
  };

  const openEdit = (reel: Reel) => {
    setEditingId(reel.id);
    setForm({
      title: reel.title || '',
      description: reel.description || '',
      video_url: reel.video_url,
      thumbnail_url: reel.thumbnail_url || '',
      product_id: reel.product_id || '',
      is_active: reel.is_active,
      display_order: reel.display_order,
    });
    setShowForm(true);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploadingVideo(true);
    setUploadProgress(0);
    setUploadStatusText('Starting video upload...');
    try {
      const result = await uploadVideoHelper(file, 'reels', (percent, text) => {
        setUploadProgress(percent);
        setUploadStatusText(text);
      });
      if (form.video_url && form.video_url !== result.url) {
        deleteStorageMedia(form.video_url, 'reels').catch(console.warn);
      }
      setForm(prev => ({
        ...prev,
        video_url: result.url,
        thumbnail_url: prev.thumbnail_url || result.thumbnailUrl || '',
      }));
      toast.success('Reel uploaded successfully!');
    } catch (err: any) {
      toast.error('Upload failed: ' + (err.message || ''));
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
    if (!form.video_url.trim()) { toast.error('Reel video URL or upload is required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim() || null,
        description: form.description.trim() || null,
        video_url: form.video_url.trim(),
        thumbnail_url: form.thumbnail_url.trim() || null,
        product_id: form.product_id || null,
        is_active: form.is_active,
        display_order: Number(form.display_order) || 0,
      };
      if (editingId) {
        const { error } = await supabase.from('reels').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Reel updated! Live on website.');
      } else {
        const { error } = await supabase.from('reels').insert(payload);
        if (error) throw error;
        toast.success('Reel added! Live on website.');
      }
      setShowForm(false);
      fetchReels();
    } catch (err: any) {
      toast.error('Error saving reel: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reel: Reel) => {
    if (!window.confirm('Delete this reel permanently?')) return;
    try {
      await deleteStorageMedia(reel.video_url, 'reels');
      if (reel.thumbnail_url) await deleteStorageMedia(reel.thumbnail_url, 'product-images');
      const { error } = await supabase.from('reels').delete().eq('id', reel.id);
      if (error) throw error;
      toast.success('Reel deleted');
      fetchReels();
    } catch (err: any) {
      toast.error('Error deleting reel: ' + (err.message || ''));
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('reels').update({ is_active: !current }).eq('id', id);
    if (error) toast.error('Error updating');
    else { toast.success(current ? 'Reel hidden from website' : 'Reel now live!'); fetchReels(); }
  };

  if (showForm) {
    return (
      <div className="max-w-2xl">
        <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Reels
        </button>
        <h1 className="text-2xl font-serif font-bold text-gray-800 mb-6">{editingId ? 'Edit Reel' : 'Add Reel'}</h1>

        <div className="space-y-5">
          {/* Reel Info */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Reel Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Wedding Frame Unboxing"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description (Optional)</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Brief description of the reel..."
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

          {/* Upload Reel */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Upload Reel *</h2>
            <p className="text-xs text-gray-500">Vertical (9:16) MP4 videos work best for the Reels section.</p>
            <div>
              <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/*" onChange={handleVideoUpload} className="hidden" />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingVideo}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
              >
                {uploadingVideo ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Film className="w-5 h-5" />}
                {uploadingVideo ? (uploadStatusText || 'Uploading Reel...') : 'Click to Upload Reel Video'}
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
                  <p className="text-xs text-green-600 font-medium mb-1">✓ Reel video ready</p>
                  <video src={form.video_url} controls preload="metadata" className="w-full max-h-48 rounded-xl bg-black object-contain" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reel URL (optional alternative)</label>
              <input
                type="url"
                value={form.video_url}
                onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </section>

          {/* Thumbnail */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Thumbnail Image</h2>
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
                <img src={form.thumbnail_url} alt="Thumbnail" className="mt-2 w-full max-h-48 object-contain rounded-xl border border-gray-200" />
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
            <div className="flex gap-4 flex-wrap items-center">
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
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} {editingId ? 'Update Reel' : 'Save Reel'}
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
          <h1 className="text-2xl font-serif font-bold text-gray-800">Reels</h1>
          <p className="text-sm text-gray-500 mt-1">Manage short video reels shown on the website</p>
        </div>
        <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-hover whitespace-nowrap shadow-sm shadow-primary/20">
          <Plus className="w-4 h-4" /> Add Reel
        </button>
      </div>

      {reels.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No reels yet. Add your first reel!</p>
          <button onClick={openCreate} className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-hover font-medium">
            Add First Reel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reels.map(reel => (
            <div key={reel.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
              {/* Thumbnail */}
              <div className="relative bg-gray-900" style={{ aspectRatio: '9/16' }}>
                {reel.thumbnail_url ? (
                  <img src={reel.thumbnail_url} alt={reel.title || 'Reel'} className="w-full h-full object-cover" />
                ) : reel.video_url ? (
                  <video src={reel.video_url} preload="metadata" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-12 h-12 text-white/20" />
                  </div>
                )}
                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${reel.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {reel.is_active ? 'Live' : 'Hidden'}
                </div>
              </div>
              {/* Info + Actions */}
              <div className="p-3">
                {reel.title && <p className="font-semibold text-gray-800 text-sm truncate mb-1">{reel.title}</p>}
                {reel.products && <p className="text-xs text-gray-500 mb-2">{reel.products.name}</p>}
                <div className="flex gap-1 justify-end">
                  <button onClick={() => openEdit(reel)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => toggleActive(reel.id, reel.is_active)} className={`p-1.5 rounded-lg ${reel.is_active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`} title={reel.is_active ? 'Hide' : 'Show'}>
                    {reel.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleDelete(reel)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
