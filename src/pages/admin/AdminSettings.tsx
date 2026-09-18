import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) { toast.error('Failed to load settings'); setLoading(false); return; }
    
    const mapped: Record<string, any> = {};
    data?.forEach(row => { mapped[row.setting_key] = { id: row.id, ...row.setting_value }; });
    setSettings(mapped);
    setLoading(false);
  };

  const updateSetting = async (key: string) => {
    setSaving(true);
    const { id, ...value } = settings[key];
    const { error } = await supabase
      .from('site_settings')
      .update({ setting_value: value })
      .eq('setting_key', key);

    if (error) toast.error('Error saving: ' + error.message);
    else toast.success(`${key} settings saved!`);
    setSaving(false);
  };

  const updateField = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-serif font-bold text-gray-800 mb-6">Site Settings</h1>

      {/* Hero Section */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
        <h2 className="font-serif font-semibold text-lg text-gray-800 mb-4">Hero Section</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input value={settings.hero?.heading || ''} onChange={e => updateField('hero', 'heading', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <textarea value={settings.hero?.subtitle || ''} onChange={e => updateField('hero', 'subtitle', e.target.value)} rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input value={settings.hero?.button_text || ''} onChange={e => updateField('hero', 'button_text', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={() => updateSetting('hero')} disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-hover flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Hero
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
        <h2 className="font-serif font-semibold text-lg text-gray-800 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={settings.contact?.phone || ''} onChange={e => updateField('contact', 'phone', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
            <input value={settings.contact?.whatsapp || ''} onChange={e => updateField('contact', 'whatsapp', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={settings.contact?.email || ''} onChange={e => updateField('contact', 'email', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input value={settings.contact?.address || ''} onChange={e => updateField('contact', 'address', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        <button onClick={() => updateSetting('contact')} disabled={saving}
          className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-hover flex items-center gap-2 mt-4">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Contact
        </button>
      </section>

      {/* Social Links */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
        <h2 className="font-serif font-semibold text-lg text-gray-800 mb-4">Social Media Links</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input value={settings.social?.instagram || ''} onChange={e => updateField('social', 'instagram', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
            <input value={settings.social?.facebook || ''} onChange={e => updateField('social', 'facebook', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
            <input value={settings.social?.youtube || ''} onChange={e => updateField('social', 'youtube', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://youtube.com/..." />
          </div>
          <button onClick={() => updateSetting('social')} disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-hover flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Social
          </button>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
        <h2 className="font-serif font-semibold text-lg text-gray-800 mb-4">Footer</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
            <input value={settings.footer?.text || ''} onChange={e => updateField('footer', 'text', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Copyright</label>
            <input value={settings.footer?.copyright || ''} onChange={e => updateField('footer', 'copyright', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={() => updateSetting('footer')} disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-hover flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Footer
          </button>
        </div>
      </section>

      {/* Banner */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
        <h2 className="font-serif font-semibold text-lg text-gray-800 mb-4">Promotional Banner</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.banner?.show || false} onChange={e => updateField('banner', 'show', e.target.checked)} className="rounded text-primary" />
            <span className="text-sm font-medium">Show Banner</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Text</label>
            <input value={settings.banner?.text || ''} onChange={e => updateField('banner', 'text', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={() => updateSetting('banner')} disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-hover flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Banner
          </button>
        </div>
      </section>
    </div>
  );
};
