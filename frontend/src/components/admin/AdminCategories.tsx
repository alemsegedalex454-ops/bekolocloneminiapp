'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Category } from '@/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/admin/categories');
      setCategories(data.categories);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, { name: formName });
      } else {
        await api.post('/admin/categories', { name: formName });
      }
      setFormName('');
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products in this category must be moved first.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete category');
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Categories</h2>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormName(''); }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3 animate-fade-in">
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoFocus
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            {editingId ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
            className="px-4 py-2 text-gray-500 text-sm hover:bg-gray-50 rounded-lg">
            Cancel
          </button>
        </form>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-4"><div className="h-5 skeleton w-1/3 rounded" /></div>
          ))
        ) : categories.length === 0 ? (
          <p className="px-5 py-8 text-center text-gray-400 text-sm">No categories yet</p>
        ) : (
          categories.map((cat, index) => (
            <div key={cat.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-300">{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400">{(cat as any)._count?.products || 0} products</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(cat)}
                  className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded">
                  Edit
                </button>
                <button onClick={() => handleDelete(cat.id)}
                  className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
