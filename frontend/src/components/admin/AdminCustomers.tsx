'use client';

import React, { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/telegram';
import api from '@/lib/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params: any = { page, limit: 20 };
    if (search) params.search = search;

    api.get('/admin/customers', { params })
      .then(({ data }) => {
        setCustomers(data.customers);
        setTotalPages(data.pagination.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, page]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Customers</h2>

      <input
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search customers..."
        className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-left font-medium">Customer</th>
                <th className="px-5 py-3 text-left font-medium">Username</th>
                <th className="px-5 py-3 text-center font-medium">Orders</th>
                <th className="px-5 py-3 text-right font-medium">Total Spent</th>
                <th className="px-5 py-3 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-8 skeleton rounded" /></td></tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No customers found</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {c.firstName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium">{c.firstName} {c.lastName || ''}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {c.username ? `@${c.username}` : '-'}
                    </td>
                    <td className="px-5 py-3 text-center">{c._count?.orders || 0}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatPrice(c.totalSpent || 0)}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded disabled:opacity-30">← Previous</button>
            <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded disabled:opacity-30">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
