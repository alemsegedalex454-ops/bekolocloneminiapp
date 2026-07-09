'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { CartItem, Cart } from '@/types';
import { useToast } from './ToastProvider';
import { hapticFeedback } from '@/lib/telegram';

interface CartContextType {
  items: CartItem[];
  count: number;
  subtotal: number;
  total: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number, size?: string, color?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [count, setCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const refreshCart = useCallback(async () => {
    try {
      const { data } = await api.get<Cart>('/cart');
      setItems(data.items);
      setCount(data.count);
      setSubtotal(data.subtotal);
      setTotal(data.total);
    } catch {
      // Cart fetch may fail if not authenticated yet
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (
    productId: string,
    quantity: number = 1,
    size?: string,
    color?: string
  ) => {
    try {
      setLoading(true);
      await api.post('/cart', { productId, quantity, size, color });
      hapticFeedback('notification');
      showToast('success', 'Added to cart!');
      await refreshCart();
    } catch (error: any) {
      showToast('error', error.response?.data?.error || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  }, [refreshCart, showToast]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      hapticFeedback('selection');
      await refreshCart();
    } catch (error: any) {
      showToast('error', error.response?.data?.error || 'Failed to update');
    }
  }, [refreshCart, showToast]);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`);
      hapticFeedback('impact');
      showToast('info', 'Item removed');
      await refreshCart();
    } catch (error: any) {
      showToast('error', error.response?.data?.error || 'Failed to remove');
    }
  }, [refreshCart, showToast]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCount(0);
    setSubtotal(0);
    setTotal(0);
  }, []);

  return (
    <CartContext.Provider value={{
      items, count, subtotal, total, loading,
      addToCart, updateQuantity, removeFromCart, refreshCart, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}
