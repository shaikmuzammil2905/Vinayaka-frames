import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { Plus, Edit, Trash2, Search, Loader2, Save, X, Maximize2, DollarSign, CheckCircle, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
}

interface SizeItem {
  id: string;
  product_id: string;
  size: string;
  price: number;
  is_led: boolean;
  created_at?: string;
}

export const AdminSizesPrices = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [sizes, setSizes] = useState<SizeItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSizes, setLoadingSizes] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<SizeItem | null>(null);
  const [formSize, setFormSize] = useState('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formIsLed, setFormIsLed] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sizeToDelete, setSizeToDelete] = useState<SizeItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch active products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug')
          .eq('active', true)
          .order('name');
        
        if (!error && data) {
          setProducts(data);
          // Default to Baby Birth Frame if present, otherwise first product
          const babyProd = data.find(p => p.slug === 'personalized-baby-birth-frame' || p.name.toLowerCase().includes('baby'));
          if (babyProd) {
            setSelectedProductId(babyProd.id);
          } else if (data.length > 0) {
            setSelectedProductId(data[0].id);
          }
        }
      } catch (e) {
        console.error('Error fetching products:', e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch sizes when selected product changes
  const fetchSizes = async (prodId: string) => {
    if (!prodId) return;
    setLoadingSizes(true);
    try {
      const data = await api.getProductSizes(prodId);
      setSizes(data || []);
    } catch (e) {
      console.error('Error loading product sizes:', e);
      toast.error('Failed to load sizes');
    } finally {
      setLoadingSizes(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      fetchSizes(selectedProductId);
    }
  }, [selectedProductId]);

  const openAdd = () => {
    setEditingSize(null);
    setFormSize('');
    setFormPrice('');
    setFormIsLed(false);
    setModalOpen(true);
  };

  const openEdit = (sizeItem: SizeItem) => {
    setEditingSize(sizeItem);
    setFormSize(sizeItem.size);
    setFormPrice(sizeItem.price);
    setFormIsLed(!!sizeItem.is_led);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSize.trim()) {
      toast.error('Please enter a size label (e.g. 8 × 12)');
      return;
    }
    if (formPrice === '' || Number(formPrice) < 0) {
      toast.error('Please enter a valid price in INR');
      return;
    }

    setSaving(true);
    try {
      await api.saveProductSize({
        id: editingSize?.id,
        product_id: selectedProductId,
        size: formSize.trim(),
        price: Number(formPrice),
        is_led: formIsLed,
      });

      toast.success(editingSize ? 'Size and price updated!' : 'New size added to product!');
      setModalOpen(false);
      fetchSizes(selectedProductId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save size');
    } finally {
      setSaving(false);
    }
  };

  const promptDelete = (sizeItem: SizeItem) => {
    setSizeToDelete(sizeItem);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!sizeToDelete?.id) return;
    setDeleting(true);
    try {
      await api.deleteProductSize(sizeToDelete.id);
      toast.success(`Size "${sizeToDelete.size}" deleted`);
      setDeleteConfirmOpen(false);
      setSizeToDelete(null);
      fetchSizes(selectedProductId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete size');
    } finally {
      setDeleting(false);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
            <span>Product Customization</span>
            <span>/</span>
            <span className="text-primary font-medium">Size & Price Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main flex items-center gap-2">
            <Maximize2 className="w-7 h-7 text-primary" />
            Product Size & Price Management
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Configure sizes and selling prices (INR) per product. Updates reflect instantly in "Select Size" on the live product page.
          </p>
        </div>

        <button
          onClick={openAdd}
          disabled={!selectedProductId}
          className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-primary/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" /> Add New Size
        </button>
      </div>

      {/* Product Selector Bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-auto flex-1">
          <label className="block text-xs uppercase font-bold text-gray-500 mb-1.5 tracking-wider">
            Select Product to Manage Sizes & Prices
          </label>
          {loadingProducts ? (
            <div className="h-10 bg-gray-100 animate-pulse rounded-xl w-72" />
          ) : (
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full md:max-w-md px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary text-text-main"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedProduct && (
          <div className="bg-primary-light/40 border border-primary/20 rounded-xl px-4 py-2.5 text-xs text-primary font-medium flex items-center gap-2 shrink-0">
            <Tag className="w-4 h-4" />
            Managing sizes for: <span className="font-bold">{selectedProduct.name}</span>
          </div>
        )}
      </div>

      {/* Sizes List / Table */}
      {loadingSizes ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : sizes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 card-shadow">
          <Maximize2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-text-main mb-1">No Sizes Configured</h3>
          <p className="text-sm text-text-muted mb-4">
            This product doesn't have any specific size options yet. Click below to add size options like 8 × 12, 12 × 18, etc.
          </p>
          <button
            onClick={openAdd}
            className="bg-primary text-white font-medium px-4 py-2 rounded-xl hover:bg-primary-hover text-sm"
          >
            Add First Size
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs text-text-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Size Label</th>
                  <th className="px-6 py-4">Selling Price (INR)</th>
                  <th className="px-6 py-4">Type / Lighting</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sizes.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-text-main flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary-light/50 text-primary flex items-center justify-center text-xs font-bold">
                        📐
                      </span>
                      {s.size}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-base font-bold text-primary">
                        ₹{Number(s.price).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {s.is_led ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                          ⚡ LED Lighting
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100">
                          Standard Frame
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Size / Price"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => promptDelete(s)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Size"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <h2 className="text-xl font-serif font-bold text-text-main">
                {editingSize ? 'Edit Size & Price' : 'Add New Size'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">
                  Size Label (e.g. 8 × 12, 12 × 18, 16 × 24) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8 × 12, 12 × 18, 30 × 40"
                  value={formSize}
                  onChange={e => setFormSize(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">
                  Selling Price (₹ INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 549, 999, 1749"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formIsLed}
                    onChange={e => setFormIsLed(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-main">LED Lighting Option</p>
                    <p className="text-[11px] text-text-muted">Applies to LED variant if product supports lighting</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-200 text-text-main font-semibold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Size'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmOpen && sizeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-serif font-bold text-text-main mb-1">
                Delete Size "{sizeToDelete.size}"?
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Customers will no longer be able to select {sizeToDelete.size} for this product. Existing orders with this size will remain unaffected.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 border border-gray-200 text-text-main font-semibold rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
