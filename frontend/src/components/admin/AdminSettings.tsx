'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    storeName: '',
    storeTagline: '',
    contactEmail: '',
    contactPhone: '',
    currencySymbol: 'Br',
    currencyCode: 'ETB',
  });

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => {
        const s = data.settings || {};
        setSettings(s);
        setForm({
          storeName: s.storeName || '',
          storeTagline: s.storeTagline || '',
          contactEmail: s.contactEmail || '',
          contactPhone: s.contactPhone || '',
          currencySymbol: s.currency?.symbol || 'Br',
          currencyCode: s.currency?.code || 'ETB',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings', {
        settings: {
          storeName: form.storeName,
          storeTagline: form.storeTagline,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          currency: { symbol: form.currencySymbol, code: form.currencyCode },
        },
      });
      alert('Settings saved!');
    } catch {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500';

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>;
  }

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Store Settings</h2>

      {/* General */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">General</h3>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Store Name</label>
          <input type="text" value={form.storeName} onChange={(e) => setForm(f => ({ ...f, storeName: e.target.value }))}
            className={inputClass} placeholder="Store name" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Tagline</label>
          <input type="text" value={form.storeTagline} onChange={(e) => setForm(f => ({ ...f, storeTagline: e.target.value }))}
            className={inputClass} placeholder="Store tagline" />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h3>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
          <input type="email" value={form.contactEmail} onChange={(e) => setForm(f => ({ ...f, contactEmail: e.target.value }))}
            className={inputClass} placeholder="info@store.com" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
          <input type="tel" value={form.contactPhone} onChange={(e) => setForm(f => ({ ...f, contactPhone: e.target.value }))}
            className={inputClass} placeholder="+251..." />
        </div>
      </div>

      {/* Currency */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Currency</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Symbol</label>
            <input type="text" value={form.currencySymbol} onChange={(e) => setForm(f => ({ ...f, currencySymbol: e.target.value }))}
              className={inputClass} placeholder="Br" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Code</label>
            <input type="text" value={form.currencyCode} onChange={(e) => setForm(f => ({ ...f, currencyCode: e.target.value }))}
              className={inputClass} placeholder="ETB" />
          </div>
        </div>
      </div>

      {/* Admin Credentials Info */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
        <p className="text-sm text-yellow-800">
          <strong>Default Admin:</strong> admin@bekollo.com / admin123
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          Change these credentials after first login for security.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
