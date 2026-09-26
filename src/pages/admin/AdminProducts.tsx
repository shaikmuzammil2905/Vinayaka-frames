import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, X, Save, ArrowLeft, RefreshCw, Link2, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImageHelper, uploadMultipleImagesHelper } from '../../lib/imageUtils';
import { getUniqueSlug, slugify } from '../../lib/slugUtils';

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Multi-line Text' },
  { value: 'date', label: 'Date Picker' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'number', label: 'Number Input' },
  { value: 'single_image', label: 'Single Image Upload' },
  { value: 'multiple_image', label: 'Multiple Image Upload' },
  { value: 'dropdown', label: 'Dropdown / Select' },
  { value: 'checkbox', label: 'Checkbox (Yes/No)' },
];

interface PersonalizationField {
  id?: string;
  field_label: string;
  field_type: string;
  placeholder: string;
  help_text: string;
  options: string;
  is_required: boolean;
  display_order: number;
  is_active: boolean;
}

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
  const [variants, setVariants] = useState<{ id?: string; name: string; image_url: string; price_adjustment: number; active: boolean }[]>([]);
  const [personalizationFields, setPersonalizationFields] = useState<PersonalizationField[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);

  const emptyField = (): PersonalizationField => ({
    field_label: '',
    field_type: 'text',
    placeholder: '',
    help_text: '',
    options: '',
    is_required: false,
    display_order: personalizationFields.length,
    is_active: true,
  });

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
    setVariants([]);
    setPersonalizationFields([]);
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

    // Fetch variants
    const { data: variantData } = await supabase.from('product_variants').select('*').eq('product_id', product.id).order('created_at', { ascending: true });
    setVariants(variantData?.map(v => ({ id: v.id, name: v.name, image_url: v.image_url, price_adjustment: Number(v.price_adjustment), active: v.active })) || []);

    // Fetch personalization fields
    const { data: pfData } = await supabase.from('personalization_fields').select('*').eq('product_id', product.id).order('display_order', { ascending: true });
    setPersonalizationFields(pfData?.map(f => ({
      id: f.id,
      field_label: f.field_label,
      field_type: f.field_type,
      placeholder: f.placeholder || '',
      help_text: f.help_text || '',
      options: f.options || '',
      is_required: f.is_required,
      display_order: f.display_order,
      is_active: f.is_active,
    })) || []);

    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const files = Array.from(e.target.files);

    try {
      const results = await uploadMultipleImagesHelper(files, (completed, total) => {
        if (total > 1) {
          toast.loading(`Uploading image ${completed} of ${total}...`, { id: 'upload-progress' });
        }
      });

      toast.dismiss('upload-progress');

      if (results.length > 0) {
        setImages(prev => {
          const newImages = results.map(res => ({
            url: res.url,
            public_id: res.public_id,
            is_main: false
          }));

          const combined = [...prev, ...newImages];
          if (combined.length > 0 && !combined.some(img => img.is_main)) {
            combined[0].is_main = true;
          }
          return combined;
        });

        toast.success(`Successfully uploaded ${results.length} image${results.length > 1 ? 's' : ''}!`);
      }
    } catch (err: any) {
      toast.dismiss('upload-progress');
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
      const res = await uploadImageHelper(file);
      setImages(prev => {
        const newImages = [...prev];
        // If index is beyond current length, pad with empty/placeholder if needed, but since we map 5 slots it's fine
        while (newImages.length <= index) {
          newImages.push({ url: '', public_id: '', is_main: newImages.length === 0 });
        }
        newImages[index] = { url: res.url, public_id: res.public_id, is_main: index === 0 };
        return newImages;
      });
      toast.success(images[index] ? 'Image replaced successfully!' : 'Image uploaded successfully!');
    } catch (err: any) {
      toast.error('Failed to replace image: ' + (err.message || ''));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    setImages(prev => {
      const combined = [...prev, { url: urlInput.trim(), public_id: '', is_main: prev.length === 0 }];
      if (combined.length > 0 && !combined.some(img => img.is_main)) {
        combined[0].is_main = true;
      }
      return combined;
    });
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
    const trimmedName = form.name.trim();
    if (!trimmedName) { toast.error('Product name is required'); return; }
    if (images.length === 0) { toast.error('At least one image is required'); return; }
    setSaving(true);

    try {
      const chosenSlug = form.slug.trim() || trimmedName;
      const finalSlug = await getUniqueSlug('products', chosenSlug, editingId);
      const productPayload = { ...form, name: trimmedName, slug: finalSlug };

      let productId = editingId;

      if (editingId) {
        let { error } = await supabase.from('products').update(productPayload).eq('id', editingId);
        if (error && (error.code === '23505' || error.message?.includes('products_slug_key') || error.message?.includes('duplicate key'))) {
          productPayload.slug = `${slugify(chosenSlug)}-${Date.now().toString(36).slice(-4)}`;
          const retry = await supabase.from('products').update(productPayload).eq('id', editingId);
          error = retry.error;
        }
        if (error) throw error;
      } else {
        let { data, error } = await supabase.from('products').insert(productPayload).select('id').single();
        if (error && (error.code === '23505' || error.message?.includes('products_slug_key') || error.message?.includes('duplicate key'))) {
          productPayload.slug = `${slugify(chosenSlug)}-${Date.now().toString(36).slice(-4)}`;
          const retry = await supabase.from('products').insert(productPayload).select('id').single();
          data = retry.data;
          error = retry.error;
        }
        if (error) throw error;
        if (!data) throw new Error('Failed to create product record');
        productId = data.id;
      }

      // Sync images
      await supabase.from('product_images').delete().eq('product_id', productId!);
      if (images.length > 0) {
        const sortedImages = [...images].sort((a, b) => (a.is_main === b.is_main ? 0 : a.is_main ? -1 : 1));
        await supabase.from('product_images').insert(
          sortedImages.map((img, idx) => ({
            product_id: productId!,
            image_url: img.url,
            cloudinary_public_id: img.public_id || '',
            is_main: idx === 0
          }))
        );
      }

      // Sync variants
      await supabase.from('product_variants').delete().eq('product_id', productId!);
      if (variants.length > 0) {
        await supabase.from('product_variants').insert(
          variants.map(v => ({
            product_id: productId!,
            name: v.name,
            image_url: v.image_url,
            price_adjustment: v.price_adjustment,
            active: v.active
          }))
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

      // Sync personalization fields
      await supabase.from('personalization_fields').delete().eq('product_id', productId!);
      if (personalizationFields.length > 0) {
        const activeFields = personalizationFields.filter(f => f.field_label.trim());
        if (activeFields.length > 0) {
          await supabase.from('personalization_fields').insert(
            activeFields.map((f, idx) => ({
              product_id: productId!,
              field_label: f.field_label.trim(),
              field_type: f.field_type,
              placeholder: f.placeholder || null,
              help_text: f.help_text || null,
              options: f.options || null,
              is_required: f.is_required,
              display_order: idx,
              is_active: f.is_active,
            }))
          );
        }
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
                  <input 
                    value={form.name} 
                    onChange={e => {
                      const newName = e.target.value;
                      setForm(p => ({ 
                        ...p, 
                        name: newName, 
                        slug: p.slug && p.slug !== slugify(p.name) ? p.slug : slugify(newName) 
                      }));
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="e.g. Premium God Frame"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL Path)</label>
                  <input 
                    value={form.slug} 
                    onChange={e => setForm(p => ({ ...p, slug: slugify(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-700" 
                    placeholder="e.g. premium-god-frame"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Unique product URL. If duplicate, a number will be added automatically.
                  </p>
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

            <div className="flex flex-col gap-4 mb-2">
              {[
                { label: 'MAIN PRODUCT IMAGE', desc: 'Primary image shown in the main product gallery.' },
                { label: 'GALLERY IMAGE 2', desc: 'Second product gallery image.' },
                { label: 'GALLERY IMAGE 3', desc: 'Third product gallery image.' },
                { label: 'GALLERY IMAGE 4', desc: 'Fourth product gallery image.' },
                { label: 'GALLERY IMAGE 5', desc: 'Optional additional gallery image.' },
              ].map((slot, i) => {
                const img = images[i];
                return (
                  <div key={i} className="flex gap-4 items-center p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="w-24 h-24 shrink-0 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-white overflow-hidden relative group">
                      {img ? (
                        <>
                          <img src={img.url} alt={`Slot ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <label className="text-white cursor-pointer hover:text-primary transition-colors p-1" title="Replace">
                              <RefreshCw className="w-5 h-5" />
                              <input type="file" accept="image/*" onChange={(e) => handleReplaceImage(i, e)} className="hidden" />
                            </label>
                            <button type="button" onClick={() => removeImage(i)} className="text-white hover:text-red-500 transition-colors p-1" title="Delete">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400 hover:text-primary transition-colors">
                          {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6 mb-1" />}
                          <span className="text-[10px] font-medium text-center px-1">Upload</span>
                          <input type="file" accept="image/*" onChange={(e) => {
                            // Temporary direct upload handler for empty slots
                            if (!e.target.files?.[0]) return;
                            handleReplaceImage(i, e); 
                            // Note: if i >= images.length, handleReplaceImage might need adjusting to append, 
                            // but our upload helper might just push to array.
                          }} className="hidden" />
                        </label>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-800">{slot.label}</h3>
                      <p className="text-xs text-gray-500">{slot.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Design Variants */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-gray-800">Design / Model Variants</h2>
                <p className="text-xs text-gray-500">Add up to 4 selectable design models for this product.</p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  if (variants.length >= 4) {
                    toast.error("You can add up to 4 design variants per product.");
                    return;
                  }
                  setVariants([...variants, { name: '', image_url: '', price_adjustment: 0, active: true }]);
                }} 
                className="text-xs px-3 py-1.5 bg-primary-light text-primary rounded-lg hover:bg-primary/20 font-medium"
              >
                + Add Variant
              </button>
            </div>
            
            {variants.length === 0 ? (
              <p className="text-gray-500 text-sm">No variants configured.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {variants.map((v, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex gap-4">
                    <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-gray-400 text-xs">
                      {v.image_url ? (
                        <img src={v.image_url} className="w-full h-full object-cover" alt="Variant" />
                      ) : (
                        "No Image"
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-xs text-gray-700">DESIGN / MODEL {i + 1}</span>
                        <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                      </div>
                      <input 
                        placeholder="Variant Name (e.g. Classic Gold)" 
                        value={v.name} 
                        onChange={e => { const newV = [...variants]; newV[i].name = e.target.value; setVariants(newV); }}
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-primary outline-none"
                      />
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          placeholder="Image URL" 
                          value={v.image_url} 
                          onChange={e => { const newV = [...variants]; newV[i].image_url = e.target.value; setVariants(newV); }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-primary outline-none"
                        />
                        <input 
                          type="number" 
                          placeholder="+ ₹ Price" 
                          value={v.price_adjustment} 
                          onChange={e => { const newV = [...variants]; newV[i].price_adjustment = Number(e.target.value); setVariants(newV); }}
                          className="w-24 px-2 py-1 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-gray-600 mt-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={v.active} 
                          onChange={e => { const newV = [...variants]; newV[i].active = e.target.checked; setVariants(newV); }}
                          className="rounded text-primary focus:ring-primary"
                        /> Active
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

          {/* Personalization Fields */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-gray-800">Personalization Fields</h2>
                <p className="text-xs text-gray-500 mt-0.5">Configure what customers must fill when ordering this product.</p>
              </div>
              <button
                type="button"
                onClick={() => setPersonalizationFields(prev => [...prev, emptyField()])}
                className="text-xs px-3 py-1.5 bg-primary-light text-primary rounded-lg hover:bg-primary/20 font-medium"
              >
                + Add Field
              </button>
            </div>
            {personalizationFields.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400 text-sm mb-2">No personalization fields configured.</p>
                <p className="text-gray-400 text-xs">The old photo/name/message checkboxes in Flags still work as fallback.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {personalizationFields.map((field, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-0.5">
                          <button type="button" onClick={() => {
                            if (i === 0) return;
                            const newF = [...personalizationFields];
                            [newF[i - 1], newF[i]] = [newF[i], newF[i - 1]];
                            setPersonalizationFields(newF);
                          }} className="text-gray-400 hover:text-gray-600 p-0.5 disabled:opacity-30" disabled={i === 0}>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => {
                            if (i === personalizationFields.length - 1) return;
                            const newF = [...personalizationFields];
                            [newF[i], newF[i + 1]] = [newF[i + 1], newF[i]];
                            setPersonalizationFields(newF);
                          }} className="text-gray-400 hover:text-gray-600 p-0.5 disabled:opacity-30" disabled={i === personalizationFields.length - 1}>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Field {i + 1}</span>
                      </div>
                      <button type="button" onClick={() => setPersonalizationFields(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Field Label *</label>
                        <input
                          type="text"
                          value={field.field_label}
                          onChange={e => {
                            const newF = [...personalizationFields];
                            newF[i] = { ...newF[i], field_label: e.target.value };
                            setPersonalizationFields(newF);
                          }}
                          placeholder="e.g. Enter Couple Names"
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Field Type</label>
                        <select
                          value={field.field_type}
                          onChange={e => {
                            const newF = [...personalizationFields];
                            newF[i] = { ...newF[i], field_type: e.target.value };
                            setPersonalizationFields(newF);
                          }}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        >
                          {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
                        <input
                          type="text"
                          value={field.placeholder}
                          onChange={e => {
                            const newF = [...personalizationFields];
                            newF[i] = { ...newF[i], placeholder: e.target.value };
                            setPersonalizationFields(newF);
                          }}
                          placeholder="e.g. Example: Rahul & Priya"
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Help Text</label>
                        <input
                          type="text"
                          value={field.help_text}
                          onChange={e => {
                            const newF = [...personalizationFields];
                            newF[i] = { ...newF[i], help_text: e.target.value };
                            setPersonalizationFields(newF);
                          }}
                          placeholder="e.g. Will be printed on frame"
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      {field.field_type === 'dropdown' && (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Dropdown Options (JSON array)</label>
                          <input
                            type="text"
                            value={field.options}
                            onChange={e => {
                              const newF = [...personalizationFields];
                              newF[i] = { ...newF[i], options: e.target.value };
                              setPersonalizationFields(newF);
                            }}
                            placeholder='["Option 1", "Option 2", "Option 3"]'
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4 mt-3 flex-wrap">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input type="checkbox" checked={field.is_required} onChange={e => {
                          const newF = [...personalizationFields];
                          newF[i] = { ...newF[i], is_required: e.target.checked };
                          setPersonalizationFields(newF);
                        }} className="rounded text-primary" />
                        <span className="font-medium text-red-600">Required</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input type="checkbox" checked={field.is_active} onChange={e => {
                          const newF = [...personalizationFields];
                          newF[i] = { ...newF[i], is_active: e.target.checked };
                          setPersonalizationFields(newF);
                        }} className="rounded text-primary" />
                        <span className="font-medium text-gray-600">Active</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
