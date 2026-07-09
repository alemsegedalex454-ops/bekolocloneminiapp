'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Product, Category } from '@/types';

interface AdminProductFormProps {
  productId?: string;
  navigate: (screen: any) => void;
}

export default function AdminProductForm({ productId, navigate }: AdminProductFormProps) {
  const isEditing = !!productId;
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    categoryId: '',
    stock: '0',
    sizes: 'S,M,L,XL',
    colors: '',
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    api.get('/admin/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});

    if (productId) {
      api.get(`/admin/products`).then(({ data }) => {
        const product = data.products.find((p: Product) => p.id === productId);
        if (product) {
          setForm({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            comparePrice: product.comparePrice?.toString() || '',
            categoryId: product.categoryId.toString(),
            stock: product.stock.toString(),
            sizes: Array.isArray(product.sizes) ? product.sizes.join(',') : '',
            colors: Array.isArray(product.colors)
              ? product.colors.map((c: any) => `${c.name}:${c.hex}`).join(',')
              : '',
            isFeatured: product.isFeatured,
            isActive: product.isActive,
          });
          setImageUrls(Array.isArray(product.images) ? product.images : []);
        }
      }).catch(() => {});
    }
  }, [productId]);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const sizes = form.sizes.split(',').map((s) => s.trim()).filter(Boolean);
      const colors = form.colors.split(',').map((c) => {
        const [name, hex] = c.split(':').map((s) => s.trim());
        return name ? { name, hex: hex || '#000000' } : null;
      }).filter(Boolean);

      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        comparePrice: form.comparePrice || undefined,
        categoryId: form.categoryId,
        stock: parseInt(form.stock),
        images: imageUrls,
        sizes,
        colors,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };

      if (isEditing) {
        await api.put(`/admin/products/${productId}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }

      navigate('products');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('products')} className="text-gray-400 hover:text-gray-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing ? 'Edit Product' : 'New Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Basic Information</h3>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Product Name *</label>
            <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)}
              className={inputClass} placeholder="e.g. MG Red T-Shirt" required />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)}
              className={`${inputClass} resize-none`} rows={4} placeholder="Product description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Price *</label>
              <input type="number" value={form.price} onChange={(e) => updateField('price', e.target.value)}
                className={inputClass} placeholder="299" required />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Compare Price</label>
              <input type="number" value={form.comparePrice} onChange={(e) => updateField('comparePrice', e.target.value)}
                className={inputClass} placeholder="399 (original price)" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Category *</label>
              <select value={form.categoryId} onChange={(e) => updateField('categoryId', e.target.value)}
                className={inputClass} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Stock *</label>
              <input type="number" value={form.stock} onChange={(e) => updateField('stock', e.target.value)}
                className={inputClass} placeholder="50" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Images</h3>

          <div className="flex gap-2 flex-wrap mb-3">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className={`${inputClass} flex-1`}
              placeholder="Paste image URL..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
            />
            <button type="button" onClick={addImageUrl}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
              Add
            </button>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Variants</h3>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Sizes (comma-separated)</label>
            <input type="text" value={form.sizes} onChange={(e) => updateField('sizes', e.target.value)}
              className={inputClass} placeholder="S,M,L,XL" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Colors (name:hex, comma-separated)</label>
            <input type="text" value={form.colors} onChange={(e) => updateField('colors', e.target.value)}
              className={inputClass} placeholder="Red:#DC2626,Blue:#3B82F6" />
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Options</h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => updateField('isFeatured', e.target.checked)}
              className="w-4 h-4 rounded text-blue-600" />
            <span className="text-sm text-gray-700">Featured product</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => updateField('isActive', e.target.checked)}
              className="w-4 h-4 rounded text-blue-600" />
            <span className="text-sm text-gray-700">Active (visible to customers)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('products')}
            className="px-6 py-3 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
