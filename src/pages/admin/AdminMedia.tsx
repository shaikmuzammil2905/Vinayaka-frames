import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Upload, Trash2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminMedia = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('product_images')
      .select('*, products(name)')
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to load media');
    else setImages(data || []);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const file = e.target.files[0];
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', preset);
    fd.append('folder', 'vinayaka-frames/media');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) {
        toast.success('Image uploaded to Cloudinary!');
        // Optionally save to DB (unattached media)
        fetchImages();
      }
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this image reference?')) return;
    const { error } = await supabase.from('product_images').delete().eq('id', id);
    if (error) toast.error('Delete failed');
    else { toast.success('Image removed'); fetchImages(); }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-800">Media Library</h1>
        <label className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-hover cursor-pointer">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-100">
          No images found. Upload images through the Products page.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map(img => (
            <div key={img.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm group">
              <div className="aspect-square relative">
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(img.image_url, img.id)} className="p-2 bg-white rounded-lg" title="Copy URL">
                    {copiedId === img.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                  </button>
                  <button onClick={() => handleDelete(img.id)} className="p-2 bg-white rounded-lg" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-500 truncate">{img.products?.name || 'Unlinked'}</p>
                {img.is_main && <span className="text-[10px] bg-primary-light text-primary px-1 rounded">Main</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
