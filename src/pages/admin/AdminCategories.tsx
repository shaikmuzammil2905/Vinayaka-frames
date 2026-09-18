import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, X, Save, RefreshCw, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImageHelper } from '../../lib/imageUtils';

export const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', image_url: '', active: true });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) toast.error('Failed to load categories');
    else setCategories(data || []);
    setLoading(false);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const generateUniqueSlug = (name: string, currentId: string | null) => {
    let baseSlug = generateSlug(name);
    if (!baseSlug) baseSlug = 'category';
    
    // Check if baseSlug already exists in categories list
    const exists = categories.some(c => c.slug === baseSlug && c.id !== currentId);
    if (!exists) return baseSlug;

    // Append counter
    let counter = 2;
    while (categories.some(c => c.slug === `${baseSlug}-${counter}` && c.id !== currentId)) {
      counter++;
    }
    return `${baseSlug}-${counter}`;
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', slug: '', image_url: '', active: true });
    setShowUrlModal(false);
    setUrlInput('');
    setShowForm(true);
  };

  const openEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, image_url: cat.image_url || '', active: cat.active });
    setShowUrlModal(false);
    setUrlInput('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);

    let finalSlug = form.slug ? generateSlug(form.slug) : generateUniqueSlug(form.name, editingId);
    
    // Check if customized slug collides
    const collision = categories.some(c => c.slug === finalSlug && c.id !== editingId);
    if (collision) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const payload = { name: form.name, slug: finalSlug, image_url: form.image_url || null, active: form.active };

    try {
      if (editingId) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Category updated! Changes live on website.');
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
        toast.success('Category created! Changes live on website.');
      }

      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      toast.error('Error saving category: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category? Products in this category will become uncategorized.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error('Error deleting category');
    else { toast.success('Category deleted! Live on website.'); fetchCategories(); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    try {
      const url = await uploadImageHelper(file);
      setForm(prev => ({ ...prev, image_url: url }));
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error('Upload failed: ' + (err.message || ''));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setForm(prev => ({ ...prev, image_url: urlInput.trim() }));
    setUrlInput('');
    setShowUrlModal(false);
    toast.success('Image URL set!');
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-800">Categories</h1>
        <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-hover transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-serif font-bold">{editingId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name*</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: generateUniqueSlug(e.target.value, editingId) }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Wedding Frames" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL Path)</label>
                <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-500" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Category Image</label>
                  <button
                    type="button"
                    onClick={() => setShowUrlModal(!showUrlModal)}
                    className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                  >
                    <Link2 className="w-3 h-3" /> {showUrlModal ? 'Cancel URL' : '+ Image URL'}
                  </button>
                </div>

                {showUrlModal && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded-lg flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image URL..."
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-blue-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      className="px-3 py-1.5 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary-hover"
                    >
                      Set
                    </button>
                  </div>
                )}

                {form.image_url ? (
                  <div className="relative w-28 h-28 rounded-xl border border-gray-200 overflow-hidden group mb-2 bg-gray-50">
                    <img src={form.image_url} alt="Category" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="p-1.5 bg-white text-gray-800 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-primary" />
                        <span>Change</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, image_url: '' }))}
                        className="p-1.5 bg-red-600 text-white rounded-lg text-xs"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 font-medium">Click to upload category image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="rounded text-primary" />
                <span className="text-sm font-medium text-gray-700">Active (Visible on website)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 font-medium">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {categories.length === 0 ? (
          <p className="text-gray-500 p-8 text-center">No categories found. Create your first category.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                      {cat.image_url ? <img src={cat.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-gray-400" />}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{cat.name}</td>
                  <td className="p-4 text-gray-500 text-sm">{cat.slug}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${cat.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {cat.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
