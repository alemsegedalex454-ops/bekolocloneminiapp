'use client';

import React, { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/telegram';
import api from '@/lib/api';
import type { Order } from '@/types';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;

      const { data } = await api.get('/admin/orders', { params });
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter, search, page]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const getShippingVal = (addr: any, key: string) => {
    if (!addr) return '';
    try {
      const parsed = typeof addr === 'string' ? JSON.parse(addr) : addr;
      return parsed[key] || '';
    } catch {
      return '';
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const tabs = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Orders</h2>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setFilter(tab); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
              filter === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search by order number or customer..."
        className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-left font-medium">Order</th>
                <th className="px-5 py-3 text-left font-medium">Customer</th>
                <th className="px-5 py-3 text-left font-medium">Items</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 text-center font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-8 skeleton rounded" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">No orders found</td></tr>
              ) : (
                orders.flatMap((order: any) => [
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedOrderId === order.id ? 'bg-gray-50/60 font-semibold' : ''}`}
                  >
                    <td className="px-5 py-3 font-mono text-xs font-medium">{order.orderNumber}</td>
                    <td className="px-5 py-3">
                      <p className="text-sm">{order.user?.firstName} {order.user?.lastName || ''}</p>
                      {order.user?.username && <p className="text-xs text-gray-400">@{order.user.username}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{order._count?.items || order.items?.length || 0}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-md px-2 py-1 outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>,
                  selectedOrderId === order.id && (
                    <tr key={`${order.id}-detail`} className="bg-gray-50/30">
                      <td colSpan={7} className="px-5 py-4 border-b border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-gray-150 shadow-sm animate-fade-in">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Customer Details</h4>
                              <p className="text-sm text-gray-800"><b>Name:</b> {getShippingVal(order.shippingAddress, 'name')}</p>
                              <p className="text-sm text-gray-800"><b>Phone:</b> {getShippingVal(order.shippingAddress, 'phone')}</p>
                              <p className="text-sm text-gray-800"><b>Address:</b> {getShippingVal(order.shippingAddress, 'address')}, {getShippingVal(order.shippingAddress, 'city')}</p>
                              {getShippingVal(order.shippingAddress, 'note') && (
                                <p className="text-sm text-gray-800"><b>Note:</b> {getShippingVal(order.shippingAddress, 'note')}</p>
                              )}
                            </div>

                            <div className="pt-2">
                              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Payment Details</h4>
                              <p className="text-sm text-gray-800 capitalize"><b>Method:</b> {order.paymentMethod.replace('_', ' ')}</p>
                              {order.senderName && <p className="text-sm text-gray-800"><b>Sender Name:</b> {order.senderName}</p>}
                              {order.transactionCode && <p className="text-sm text-gray-800"><b>Tx Ref Code:</b> {order.transactionCode}</p>}
                              {order.paymentPhone && <p className="text-sm text-gray-800"><b>Payment Phone:</b> {order.paymentPhone}</p>}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Screenshot Receipt</h4>
                              {order.receiptUrl ? (
                                <div className="space-y-2">
                                  <a
                                    href={order.receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block max-w-[280px] border border-gray-200 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all cursor-zoom-in"
                                  >
                                    <img src={order.receiptUrl} alt="Payment Receipt" className="w-full h-auto object-contain max-h-[220px] bg-gray-50" />
                                  </a>
                                  <p className="text-[10px] text-gray-400 italic">Click photo to view in full size</p>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">No receipt file uploaded (Cash on Delivery)</p>
                              )}
                            </div>

                            {order.status === 'pending' && (order.paymentMethod === 'bank_transfer' || order.paymentMethod === 'telebirr') && (
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => updateStatus(order.id, 'confirmed')}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                                >
                                  Approve Payment
                                </button>
                                <button
                                  onClick={() => updateStatus(order.id, 'cancelled')}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                                >
                                  Reject / Cancel Order
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                ])
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
