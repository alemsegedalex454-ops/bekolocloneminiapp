'use client';

import React, { useState } from 'react';
import { branding } from '@/config/branding';
import api from '@/lib/api';

interface AdminLoginProps {
  onLogin: (token: string, name: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSetup) {
        const { data } = await api.post('/admin/auth/setup', { email, password, name });
        onLogin(data.token, data.admin.name);
      } else {
        const { data } = await api.post('/admin/auth/login', { email, password });
        onLogin(data.token, data.admin.name);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg);
      // If no admin exists, show setup form
      if (msg.includes('Invalid credentials') || err.response?.status === 401) {
        // User might need setup
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {branding.storeName} Admin
          </h1>
          <p className="text-sm text-gray-500">
            {isSetup ? 'Create your admin account' : 'Sign in to manage your store'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSetup && (
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Store Admin"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isSetup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => setIsSetup(!isSetup)}
            className="w-full text-center text-xs text-blue-600 mt-4 hover:underline"
          >
            {isSetup ? 'Already have an account? Sign in' : 'First time? Create admin account'}
          </button>
        </div>
      </div>
    </div>
  );
}
