import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, X, Save, ArrowLeft, RefreshCw, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImageHelper } from '../../lib/imageUtils';

const FINISH_OPTIONS = ['Glitter', 'Glossy', 'Matte', 'Fiber Glass / Acrylic', 'LED Lighting'];

const DEFAULT_SIZES = [
  { size: '8 × 12', price: 349, is_led: false },
  { size: '12 × 18', price: 549, is_led: false },
  { size: '16 × 24', price: 1299, is_led: false },
  { size: '20 × 30', price: 1699, is_led: false },
  { size: '24 × 36', price: 2449, is_led: false },
];

const DEFAULT_LED_SIZES = [
  { size: '8 × 12', price: 549, is_led: true },
  { size: '12 × 18', price: 999, is_led: true },
  { size: '16 × 24', price: 1749, is_led: true },
  { size: '20 × 30', price: 2749, is_led: true },
  { size: '24 × 36', price: 3749, is_led: true },
];

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  discount: number | null;
  category_id: string;
  customizable: boolean;
  photo_upload: boolean;
  custom_name: boolean;
  custom_message: boolean;
  stock: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_trending: boolean;
  active: boolean;
}

const emptyForm: ProductForm = {
  name: '', slug: '', description: '', price: 349, original_price: null, discount: null,
  category_id: '', customizable: true, photo_upload: true, custom_name: true, custom_message: true,
  stock: true, is_new: false, is_best_seller: false, is_trending: false, active: true,
};

export const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [sizes, setSizes] = useState<{ size: string; price: number; is_led: boolean }[]>([]);
  const [finishes, setFinishes] = useState<string[]>([]);
  const [images, setImages] = useState<{ url: string; public_id: string; is_main: boolean }[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), product_images(id, image_url, cloudinary_public_id, is_main)')
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to load products');
    else setProducts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name').order('name');
    setCategories(data || []);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSizes([...DEFAULT_SIZES]);
    setFinishes([...FINISH_OPTIONS]);
    setImages([]);
    setShowForm(true);
  };

  const openEdit = async (product: any) => {
    setEditingId(product.id);
    setForm({
      name: product.name, slug: product.slug, description: product.description || '',
      price: product.price, original_price: product.original_price, discount: product.discount,
      category_id: product.category_id || '', customizable: product.customizable,
      photo_upload: product.photo_upload, custom_name: product.custom_name, custom_message: product.custom_message,
      stock: product.stock, is_new: product.is_new, is_best_seller: product.is_best_seller,
      is_trending: product.is_trending, active: product.active,
    });

    // Fetch sizes
    const { data: sizesData } = await supabase.from('product_sizes').select('*').eq('product_id', product.id);
    setSizes(sizesData?.map(s => ({ size: s.size, price: Number(s.price), is_led: s.is_led })) || []);

    // Fetch finishes
    const { data: finishData } = await supabase.from('product_finishes').select('*').eq('product_id', product.id);
    setFinishes(finishData?.map(f => f.finish_type) || []);

    // Set images
    setImages(product.product_images?.map((img: any) => ({
      url: img.image_url, public_id: img.cloudinary_public_id || '', is_main: img.is_main
    })) || []);

    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const file = e.target.files[0];

    try {
      const url = await uploadImageHelper(file);
      setImages(prev => [...prev, { url, public_id: '', is_main: prev.length === 0 }]);
      toast.success('Image added successfully!');
    } catch (err: any) {
      toast.error('Upload failed: ' + (err.message || ''));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleReplaceImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const file = e.target.files[0];

    try {
      const newUrl = await uploadImageHelper(file);
      setImages(prev => prev.map((img, i) => i === index ? { ...img, url: newUrl } : img));
      toast.success('Image updated!');
    } catch (err: any) {
      toast.error('Failed to change image: ' + (err.message || ''));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    setImages(prev => [...prev, { url: urlInput.trim(), public_id: '', is_main: prev.length === 0 }]);
    setUrlInput('');
    setShowUrlModal(false);
    toast.success('Image URL added!');
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some(img => img.is_main)) {
        updated[0].is_main = true;
      }
      return updated;
    });
  };

  const setMainImage = (index: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, is_main: i === index })));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (images.length === 0) { toast.error('At least one image is required'); return; }
    setSaving(true);

    try {
      const slug = form.slug || generateSlug(form.name);
      const productPayload = { ...form, slug };

      let productId = editingId;

      if (editingId) {
        const { error } = await supabase.from('products').update(productPayload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert(productPayload).select('id').single();
        if (error) throw error;
        productId = data.id;
      }

      // Sync images
      await supabase.from('product_images').delete().eq('product_id', productId!);
      if (images.length > 0) {
        await supabase.from('product_images').insert(
          images.map(img => ({ product_id: productId!, image_url: img.url, cloudinary_public_id: img.public_id, is_main: img.is_main }))
        );
      }

      // Sync sizes
      await supabase.from('product_sizes').delete().eq('product_id', productId!);
      if (sizes.length > 0) {
        await supabase.from('product_sizes').insert(
          sizes.map(s => ({ product_id: productId!, size: s.size, price: s.price, is_led: s.is_led }))
        );
      }

      // Sync finishes
      await supabase.from('product_finishes').delete().eq('product_id', productId!);
      if (finishes.length > 0) {
        await supabase.from('product_finishes').insert(
          finishes.map(f => ({ product_id: productId!, finish_type: f }))
        );
      }

      toast.success(editingId ? 'Product updated! Changes live on website.' : 'Product created! Live on website.');
      setShowForm(false);
      fetchProducts();
    } catch (err: any) {
      toast.error('Error saving product: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product and all its images, sizes, and finishes?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error('Error deleting product');
    else { toast.success('Product deleted'); fetchProducts(); }
  };

  const addSizeRow = () => setSizes(prev => [...prev, { size: '', price: 0, is_led: false }]);
  const removeSizeRow = (i: number) => setSizes(prev => prev.filter((_, idx) => idx !== i));
  const updateSizeRow = (i: number, field: string, value: any) => {
    setSizes(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const toggleFinish = (f: string) => {
    setFinishes(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const loadDefaultSizes = () => setSizes([...DEFAULT_SIZES]);
  const loadLedSizes = () => setSizes(prev => [...prev.filter(s => !s.is_led), ...DEFAULT_LED_SIZES]);

  const filteredProducts = search.trim()
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  // Product Form View
  if (showForm) {
    return (
      <div className="max-w-3xl">
        <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>

        <h1 className="text-2xl font-serif font-bold text-gray-800 mb-6">
          {editingId ? 'Edit Product' : 'Add Product'}
        </h1>

        <div className="space-y-6">
          {/* Basic Info */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: generateSlug(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)*</label>
                <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                <input type="number" value={form.original_price || ''} onChange={e => setForm(p => ({ ...p, original_price: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input type="number" value={form.discount || ''} onChange={e => setForm(p => ({ ...p, discount: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <div>
                <h2 className="font-semibold text-gray-800">Product Pictures</h2>
                <p className="text-xs text-gray-500">Upload or change product photos. Changes update live on the site.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowUrlModal(true)}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg flex items-center gap-1.5 transition-colors font-medium"
              >
                <Link2 className="w-3.5 h-3.5 text-primary" /> + Add via Image URL
              </button>
            </div>

            {/* URL Modal / Inline Input */}
            {showUrlModal && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="url"
                  placeholder="Paste image URL (e.g. https://...)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 w-full px-3 py-1.5 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="flex-1 sm:flex-initial px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover"
                  >
                    Add URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlModal(false)}
                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-2">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`relative w-28 h-28 rounded-2xl border-2 overflow-hidden group shadow-sm bg-gray-50 flex flex-col justify-between ${
                    img.is_main ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                  }`}
                >
                  <img src={img.url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                  
                  {/* Badge */}
                  {img.is_main && (
                    <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs z-10">
                      Main Cover
                    </span>
                  )}

                  {/* Hover Overlay Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-2 z-20">
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setMainImage(i)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          img.is_main ? 'bg-primary text-white' : 'bg-white/90 text-gray-800 hover:bg-white'
                        }`}
                        title="Set as Main Cover"
                      >
                        {img.is_main ? '★ Main' : 'Set Main'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        title="Remove Image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Change Pic Button */}
                    <label className="w-full py-1 bg-white/90 hover:bg-white text-gray-800 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs">
                      <RefreshCw className="w-3 h-3 text-primary" />
                      <span>Change Pic</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleReplaceImage(i, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ))}

              {/* Upload Box */}
              <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary-light/10 transition-all text-center p-2">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-[11px] font-medium text-gray-500">Upload Pic</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </section>

          {/* Sizes */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Sizes & Pricing</h2>
              <div className="flex gap-2">
                <button onClick={loadDefaultSizes} className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200">Load Standard</button>
                <button onClick={loadLedSizes} className="text-xs px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200">+ LED Sizes</button>
                <button onClick={addSizeRow} className="text-xs px-3 py-1.5 bg-primary-light text-primary rounded-lg hover:bg-primary/20">+ Add Row</button>
              </div>
            </div>
            {sizes.length === 0 ? (
              <p className="text-gray-500 text-sm">No sizes configured. This product will not show size options.</p>
            ) : (
              <div className="space-y-2">
                {sizes.map((s, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <input value={s.size} onChange={e => updateSizeRow(i, 'size', e.target.value)} placeholder="e.g. 8 × 12"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="number" value={s.price} onChange={e => updateSizeRow(i, 'price', Number(e.target.value))} placeholder="Price"
                      className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                      <input type="checkbox" checked={s.is_led} onChange={e => updateSizeRow(i, 'is_led', e.target.checked)} className="rounded text-primary" /> LED
                    </label>
                    <button onClick={() => removeSizeRow(i)} className="p-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Finishes */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Finish Types</h2>
            <div className="flex flex-wrap gap-2">
              {FINISH_OPTIONS.map(f => (
                <button key={f} onClick={() => toggleFinish(f)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${finishes.includes(f) ? 'border-primary bg-primary-light text-primary font-medium' : 'border-gray-200 text-gray-600 hover:border-primary'}`}>
                  {f}
                </button>
              ))}
            </div>
          </section>

          {/* Flags */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Options & Flags</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'customizable', label: 'Customizable' },
                { key: 'photo_upload', label: 'Photo Upload' },
                { key: 'custom_name', label: 'Custom Name' },
                { key: 'custom_message', label: 'Custom Message' },
                { key: 'stock', label: 'In Stock' },
                { key: 'is_new', label: 'New Arrival' },
                { key: 'is_best_seller', label: 'Best Seller' },
                { key: 'is_trending', label: 'Trending' },
                { key: 'active', label: 'Active' },
              ].map(flag => (
                <label key={flag.key} className="flex items-center gap-2 cursor-pointer bg-gray-50 rounded-lg px-3 py-2">
                  <input type="checkbox" checked={(form as any)[flag.key]} onChange={e => setForm(p => ({ ...p, [flag.key]: e.target.checked }))} className="rounded text-primary" />
                  <span className="text-sm">{flag.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-4">
            <button onClick={() => setShowForm(false)} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-hover font-medium flex items-center justify-center gap-2 shadow-md shadow-primary/20">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} {editingId ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Product List View
  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-serif font-bold text-gray-800">Products</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="flex-1 sm:w-48 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-hover whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {filteredProducts.length === 0 ? (
          <p className="text-gray-500 p-8 text-center">No products found.</p>
        ) : (
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => {
                const mainImg = product.product_images?.find((i: any) => i.is_main) || product.product_images?.[0];
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {mainImg ? <img src={mainImg.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate">{product.slug}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{product.categories?.name || '-'}</td>
                    <td className="p-4 font-medium">₹{product.price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-1"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
