import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { uploadImageHelper } from '../../lib/imageUtils';
import { Plus, Edit, Trash2, Search, Filter, Loader2, Save, X, Image as ImageIcon, CheckCircle, Eye, EyeOff, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export interface FrameStyleItem {
  id?: string;
  name: string;
  imageUrl: string;
  thickness: string;
  additionalPrice: number;
  displayOrder: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
}

const emptyForm: FrameStyleItem = {
  name: '',
  imageUrl: '',
  thickness: '1 Inch',
  additionalPrice: 0,
  displayOrder: 0,
  isActive: true,
  description: '',
};

export const AdminFrameStyles = () => {
  const [frames, setFrames] = useState<FrameStyleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [thicknessFilter, setThicknessFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFrame, setEditingFrame] = useState<FrameStyleItem | null>(null);
  const [form, setForm] = useState<FrameStyleItem>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [frameToDelete, setFrameToDelete] = useState<FrameStyleItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFrames = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminFrameStyles();
      setFrames(data || []);
    } catch (e) {
      console.error('Error fetching frame styles:', e);
      toast.error('Failed to load frame styles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrames();
  }, []);

  const openAdd = () => {
    setEditingFrame(null);
    setForm({
      ...emptyForm,
      displayOrder: (frames.length > 0 ? Math.max(...frames.map(f => f.displayOrder || 0)) + 1 : 1),
    });
    setModalOpen(true);
  };

  const openEdit = (frame: FrameStyleItem) => {
    setEditingFrame(frame);
    setForm({ ...frame });
    setModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    try {
      const result = await uploadImageHelper(file);
      if (result.url) {
        setForm(prev => ({ ...prev, imageUrl: result.url }));
        toast.success('Frame photo uploaded successfully!');
      } else {
        throw new Error('Upload returned empty URL');
      }
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Frame name is required');
      return;
    }
    if (!form.imageUrl.trim()) {
      toast.error('Please upload a frame photo or enter an image URL');
      return;
    }

    setSaving(true);
    try {
      await api.saveFrameStyle({
        ...form,
        name: form.name.trim(),
        thickness: form.thickness.trim() || '1 Inch',
        additionalPrice: Number(form.additionalPrice) || 0,
        displayOrder: Number(form.displayOrder) || 0,
      });
      toast.success(editingFrame ? 'Frame style updated!' : 'New frame style added and live on website!');
      setModalOpen(false);
      fetchFrames();
    } catch (err: any) {
      console.error('Save frame error:', err);
      toast.error(err.message || 'Failed to save frame style');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (frame: FrameStyleItem) => {
    try {
      await api.saveFrameStyle({
        ...frame,
        isActive: !frame.isActive,
      });
      toast.success(frame.isActive ? `"${frame.name}" deactivated` : `"${frame.name}" activated and live on website!`);
      setFrames(prev => prev.map(f => f.id === frame.id ? { ...f, isActive: !frame.isActive } : f));
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const promptDelete = (frame: FrameStyleItem) => {
    setFrameToDelete(frame);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!frameToDelete || !frameToDelete.id) return;
    setDeleting(true);
    try {
      await api.deleteFrameStyle(frameToDelete.id);
      toast.success(`Frame "${frameToDelete.name}" removed from website`);
      setDeleteConfirmOpen(false);
      setFrameToDelete(null);
      fetchFrames();
    } catch (err: any) {
      toast.error('Failed to delete frame style');
    } finally {
      setDeleting(false);
    }
  };

  const filteredFrames = frames.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.thickness && f.thickness.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesThickness = thicknessFilter === 'All' || f.thickness === thicknessFilter;
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && f.isActive) ||
      (statusFilter === 'Inactive' && !f.isActive);
    return matchesSearch && matchesThickness && matchesStatus;
  });

  const uniqueThicknesses = Array.from(new Set(frames.map(f => f.thickness || '1 Inch')));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
            <span>Product Customization</span>
            <span>/</span>
            <span className="text-primary font-medium">Frame Styles</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main flex items-center gap-2">
            <Layers className="w-7 h-7 text-primary" />
            Frame Style Management
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage frame designs shown in "Select Frame Style" across products. Updates reflect on the live website automatically.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-primary/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5" /> Add New Frame
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 card-shadow flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search frame by name or thickness..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={thicknessFilter}
            onChange={e => setThicknessFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Thicknesses</option>
            {uniqueThicknesses.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Frame Styles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredFrames.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 card-shadow">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-text-main mb-1">No Frame Styles Found</h3>
          <p className="text-sm text-text-muted mb-4">
            {searchQuery || thicknessFilter !== 'All' ? 'No frames match your search criteria.' : 'No frame designs currently exist. Click below to add your first frame.'}
          </p>
          <button
            onClick={openAdd}
            className="bg-primary text-white font-medium px-4 py-2 rounded-xl hover:bg-primary-hover text-sm"
          >
            Add New Frame
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFrames.map(frame => (
            <div
              key={frame.id}
              className={`bg-white rounded-2xl border-2 overflow-hidden card-shadow flex flex-col transition-all duration-200 ${
                frame.isActive ? 'border-gray-100 hover:border-primary/40' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              {/* Photo Area with Overlay */}
              <div className="aspect-square relative bg-gray-100 overflow-hidden">
                {frame.imageUrl ? (
                  <img
                    src={frame.imageUrl}
                    alt={frame.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}

                {/* Badge top-left */}
                <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xs">
                  {frame.thickness || '1 Inch'}
                </span>

                {/* Status top-right */}
                <button
                  onClick={() => handleToggleActive(frame)}
                  title={frame.isActive ? 'Click to deactivate' : 'Click to activate'}
                  className={`absolute top-2 right-2 p-1.5 rounded-full shadow-md text-xs font-semibold cursor-pointer transition-transform hover:scale-110 ${
                    frame.isActive ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'
                  }`}
                >
                  {frame.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {/* Bottom title gradient */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 pt-6">
                  <p className="text-white font-semibold text-xs md:text-sm text-center leading-tight truncate">
                    {frame.name}
                  </p>
                </div>
              </div>

              {/* Info and Actions */}
              <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Order: {frame.displayOrder || 0}</span>
                  {frame.additionalPrice > 0 ? (
                    <span className="text-primary font-semibold">+₹{frame.additionalPrice}</span>
                  ) : (
                    <span className="text-green-600 font-medium">Included</span>
                  )}
                </div>

                <div className="flex gap-1.5 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(frame)}
                    className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => promptDelete(frame)}
                    className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete Frame"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Frame Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <h2 className="text-xl font-serif font-bold text-text-main">
                {editingFrame ? `Edit Frame: ${editingFrame.name}` : 'Add New Frame Style'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Frame Name */}
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">
                  Frame Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Royal Gold, Classic Wood"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">
                  Frame Photograph <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="flex gap-4 items-center">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 shrink-0 relative flex items-center justify-center">
                    {uploadingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : form.imageUrl ? (
                      <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-text-main font-semibold px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-primary" />}
                      {uploadingImage ? 'Uploading Image...' : (form.imageUrl ? 'Change Photograph' : 'Upload Photograph')}
                    </button>
                    <p className="text-[11px] text-text-muted">
                      Supports JPG, PNG, WebP. High resolution corner/texture crop recommended.
                    </p>
                  </div>
                </div>

                {/* Optional direct URL input */}
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Or paste public Image URL..."
                    value={form.imageUrl}
                    onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Thickness Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1.5">
                    Frame Thickness
                  </label>
                  <select
                    value={form.thickness}
                    onChange={e => setForm(p => ({ ...p, thickness: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="1 Inch">1 Inch (Standard)</option>
                    <option value="1.5 Inch">1.5 Inch (Heavy)</option>
                    <option value="2 Inch">2 Inch (Grand)</option>
                    <option value="0.75 Inch">0.75 Inch (Slim)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={e => setForm(p => ({ ...p, displayOrder: Number(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Additional Price & Active */}
              <div className="grid grid-cols-2 gap-3 items-center pt-2">
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1.5">
                    Price Adjustment (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.additionalPrice}
                    onChange={e => setForm(p => ({ ...p, additionalPrice: Number(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-[11px] text-text-muted">Extra fee (0 = no extra cost)</span>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                      className="w-4 h-4 text-primary focus:ring-primary rounded"
                    />
                    <div>
                      <p className="text-sm font-semibold text-text-main">Active & Visible</p>
                      <p className="text-[10px] text-text-muted">Live on website selector</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-200 text-text-main font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Frame'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && frameToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-serif font-bold text-text-main mb-1">
                Delete "{frameToDelete.name}"?
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                This frame design will be safely deactivated and removed from new customer selections on the live website. Existing orders will keep their historical record intact.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 border border-gray-200 text-text-main font-semibold rounded-xl hover:bg-gray-50"
              >
                Keep Frame
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {deleting ? 'Removing...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
