'use client';

import React, { useState, useEffect } from 'react';
import { branding } from '@/config/branding';
import { formatPrice } from '@/lib/telegram';
import { useCart } from '@/providers/CartProvider';
import { useTelegram } from '@/providers/TelegramProvider';
import { useToast } from '@/providers/ToastProvider';
import api from '@/lib/api';
import type { Address } from '@/types';
import type { Screen } from './ShopApp';

interface CheckoutPageProps {
  navigate: (screen: Screen) => void;
  goBack: () => void;
}

export default function CheckoutPage({ navigate, goBack }: CheckoutPageProps) {
  const { items, subtotal, total, clearCart } = useCart();
  const { user } = useTelegram();
  const { showToast } = useToast();
  const [step, setStep] = useState(1); // 1: info, 2: shipping, 3: payment, 4: confirm
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [formData, setFormData] = useState({
    name: user?.first_name || '',
    phone: '',
    email: '',
    address: '',
    city: 'Addis Ababa',
    note: '',
    paymentMethod: 'cod',
    receiptUrl: '',
    senderName: '',
    transactionCode: '',
    paymentPhone: '',
  });

  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  useEffect(() => {
    api.get('/users/addresses').then(({ data }) => {
      setAddresses(data.addresses || []);
      const defaultAddr = data.addresses?.find((a: Address) => a.isDefault);
      if (defaultAddr) {
        setFormData(prev => ({
          ...prev,
          name: defaultAddr.name || prev.name,
          phone: defaultAddr.phone || prev.phone,
          address: defaultAddr.address || prev.address,
          city: defaultAddr.city || prev.city,
        }));
      }
    }).catch(() => {});
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File size exceeds 5MB limit');
      return;
    }

    try {
      setUploadingReceipt(true);
      const uploadData = new FormData();
      uploadData.append('receipt', file);

      const { data } = await api.post('/orders/receipt-upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData(prev => ({ ...prev, receiptUrl: data.url }));
      showToast('success', 'Receipt uploaded successfully');
    } catch {
      showToast('error', 'Failed to upload receipt image');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    const isManualPay = formData.paymentMethod === 'bank_transfer' || formData.paymentMethod === 'telebirr';
    if (isManualPay && !formData.receiptUrl) {
      showToast('error', 'Please upload a receipt screenshot to complete order');
      return;
    }

    if (isManualPay && (!formData.senderName || !formData.transactionCode || !formData.paymentPhone)) {
      showToast('error', 'Please fill in all depositor receipt details');
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await api.post('/orders', {
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          note: formData.note,
        },
        paymentMethod: formData.paymentMethod,
        receiptUrl: formData.receiptUrl,
        senderName: formData.senderName,
        transactionCode: formData.transactionCode,
        paymentPhone: formData.paymentPhone,
      });
      clearCart();
      navigate({ name: 'checkout-success', orderNumber: data.order.orderNumber });
    } catch (error: any) {
      showToast('error', error.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: branding.colors.surface,
    borderColor: branding.colors.border,
    color: branding.colors.text,
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center gap-3"
        style={{ borderColor: branding.colors.border }}>
        <button onClick={step > 1 ? () => setStep(step - 1) : goBack} className="tap-active p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={branding.colors.text} strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-bold" style={{ color: branding.colors.text }}>Checkout</h2>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-center gap-1 py-4 px-4">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                backgroundColor: step >= s ? branding.colors.primary : branding.colors.surface,
                color: step >= s ? branding.colors.primaryText : branding.colors.textMuted,
              }}
            >
              {s}
            </div>
            {s < 3 && (
              <div className="flex-1 h-0.5 mx-1" style={{
                backgroundColor: step > s ? branding.colors.primary : branding.colors.border,
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="px-4">
        {/* Step 1: Customer Info */}
        {step === 1 && (
          <div className="animate-fade-in space-y-4">
            <h3 className="text-base font-bold mb-4" style={{ color: branding.colors.text }}>
              Customer Information
            </h3>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: branding.colors.textSecondary }}>Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2"
                style={{ ...inputStyle, '--tw-ring-color': branding.colors.primary } as any}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: branding.colors.textSecondary }}>Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2"
                style={{ ...inputStyle, '--tw-ring-color': branding.colors.primary } as any}
                placeholder="+251..."
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: branding.colors.textSecondary }}>Email (optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2"
                style={{ ...inputStyle, '--tw-ring-color': branding.colors.primary } as any}
                placeholder="your@email.com"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.name || !formData.phone}
              className="w-full py-3.5 rounded-xl text-sm font-bold mt-4 tap-active disabled:opacity-50"
              style={{ backgroundColor: branding.colors.primary, color: branding.colors.primaryText }}
            >
              Continue to Shipping
            </button>
          </div>
        )}

        {/* Step 2: Shipping */}
        {step === 2 && (
          <div className="animate-fade-in space-y-4">
            <h3 className="text-base font-bold mb-4" style={{ color: branding.colors.text }}>
              Shipping Address
            </h3>

            {addresses.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-medium mb-2 block" style={{ color: branding.colors.textSecondary }}>
                  Saved Addresses
                </label>
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        name: addr.name,
                        phone: addr.phone,
                        address: addr.address,
                        city: addr.city,
                      }))}
                      className="w-full text-left px-4 py-3 rounded-xl border text-sm tap-active"
                      style={{ borderColor: branding.colors.border }}
                    >
                      <p className="font-medium">{addr.label || addr.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: branding.colors.textSecondary }}>
                        {addr.address}, {addr.city}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: branding.colors.textSecondary }}>Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2"
                style={{ ...inputStyle, '--tw-ring-color': branding.colors.primary } as any}
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: branding.colors.textSecondary }}>City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2"
                style={{ ...inputStyle, '--tw-ring-color': branding.colors.primary } as any}
                placeholder="City"
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: branding.colors.textSecondary }}>Note (optional)</label>
              <textarea
                value={formData.note}
                onChange={(e) => updateField('note', e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 resize-none"
                style={{ ...inputStyle, '--tw-ring-color': branding.colors.primary } as any}
                placeholder="Delivery instructions..."
                rows={3}
              />
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!formData.address || !formData.city}
              className="w-full py-3.5 rounded-xl text-sm font-bold mt-4 tap-active disabled:opacity-50"
              style={{ backgroundColor: branding.colors.primary, color: branding.colors.primaryText }}
            >
              Continue to Payment
            </button>
          </div>
        )}

        {/* Step 3: Review & Pay */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h3 className="text-base font-bold mb-4" style={{ color: branding.colors.text }}>
              Review & Payment
            </h3>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="text-xs font-medium mb-2 block" style={{ color: branding.colors.textSecondary }}>
                Payment Method
              </label>
              <div className="space-y-2">
                {[
                  { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
                  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
                  { id: 'telebirr', name: 'Telebirr', icon: '📱' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => updateField('paymentMethod', method.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm tap-active transition-all"
                    style={{
                      borderColor: formData.paymentMethod === method.id ? branding.colors.primary : branding.colors.border,
                      backgroundColor: formData.paymentMethod === method.id ? `${branding.colors.primary}10` : 'transparent',
                    }}
                  >
                    <span className="text-lg">{method.icon}</span>
                    <span className="font-medium">{method.name}</span>
                    {formData.paymentMethod === method.id && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={branding.colors.primary} className="ml-auto">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method instructions */}
            {(formData.paymentMethod === 'bank_transfer' || formData.paymentMethod === 'telebirr') && (
              <div className="mb-6 rounded-2xl border p-4 bg-[#FFD02B]/5 border-[#FFD02B]/20 animate-scale-in">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <span>🏦</span> Transfer Instructions
                </h4>
                {formData.paymentMethod === 'bank_transfer' ? (
                  <div className="space-y-1.5 text-xs text-neutral-600">
                    <p>Please transfer the total order amount to our bank account:</p>
                    <div className="bg-white p-2.5 rounded-xl border border-neutral-200 font-mono leading-normal text-black mt-2">
                      <p><b>Bank:</b> Commercial Bank of Ethiopia (CBE)</p>
                      <p><b>Name:</b> Summitet Glorious Peak</p>
                      <p><b>Account:</b> <span className="font-bold select-all bg-neutral-100 px-1 rounded">1000543210987</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs text-neutral-600">
                    <p>Please send the total order amount via Telebirr:</p>
                    <div className="bg-white p-2.5 rounded-xl border border-neutral-200 font-mono leading-normal text-black mt-2">
                      <p><b>Merchant Name:</b> Summitet Peak Store</p>
                      <p><b>Phone / ID:</b> <span className="font-bold select-all bg-neutral-100 px-1 rounded">+251987654321</span></p>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-500 mb-1 block">Depositor / Sender Full Name *</label>
                    <input
                      type="text"
                      value={formData.senderName}
                      onChange={(e) => updateField('senderName', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs border outline-none bg-white focus:ring-1"
                      style={{ borderColor: branding.colors.border, '--tw-ring-color': branding.colors.primary } as any}
                      placeholder="Name used for transfer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-500 mb-1 block">Transaction Reference / Code *</label>
                    <input
                      type="text"
                      value={formData.transactionCode}
                      onChange={(e) => updateField('transactionCode', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs border outline-none bg-white focus:ring-1"
                      style={{ borderColor: branding.colors.border, '--tw-ring-color': branding.colors.primary } as any}
                      placeholder="e.g. FT26..."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-500 mb-1 block">Payment Mobile Number *</label>
                    <input
                      type="tel"
                      value={formData.paymentPhone}
                      onChange={(e) => updateField('paymentPhone', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs border outline-none bg-white focus:ring-1"
                      style={{ borderColor: branding.colors.border, '--tw-ring-color': branding.colors.primary } as any}
                      placeholder="+251..."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-500 mb-2 block">Upload Payment Screenshot / Receipt *</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="hidden"
                        id="receipt-file-input"
                        disabled={uploadingReceipt}
                      />
                      <label
                        htmlFor="receipt-file-input"
                        className="flex flex-col items-center justify-center border border-dashed rounded-xl p-4 cursor-pointer hover:bg-neutral-50/50 transition-all text-center gap-1.5 bg-white"
                        style={{ borderColor: branding.colors.border }}
                      >
                        {uploadingReceipt ? (
                          <>
                            <div className="w-5 h-5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-neutral-500">Uploading receipt screenshot...</span>
                          </>
                        ) : formData.receiptUrl ? (
                          <>
                            <span className="text-green-500 text-lg">✅</span>
                            <span className="text-xs font-semibold text-green-600">Receipt Screenshot Uploaded</span>
                            <span className="text-[10px] text-neutral-400 truncate max-w-[200px]">Click to replace file</span>
                          </>
                        ) : (
                          <>
                            <span className="text-lg">📸</span>
                            <span className="text-xs font-medium text-neutral-600">Select Receipt Image</span>
                            <span className="text-[10px] text-neutral-400">PNG, JPG up to 5MB</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="rounded-xl border p-4 mb-6" style={{ borderColor: branding.colors.border }}>
              <h4 className="text-sm font-bold mb-3">Order Summary</h4>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate mr-2" style={{ color: branding.colors.textSecondary }}>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium flex-shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between" style={{ borderColor: branding.colors.border }}>
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping info summary */}
            <div className="rounded-xl border p-4 mb-6" style={{ borderColor: branding.colors.border }}>
              <h4 className="text-sm font-bold mb-2">Shipping To</h4>
              <p className="text-sm" style={{ color: branding.colors.textSecondary }}>
                {formData.name} · {formData.phone}
              </p>
              <p className="text-sm" style={{ color: branding.colors.textSecondary }}>
                {formData.address}, {formData.city}
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-[15px] font-bold tap-active disabled:opacity-50"
              style={{ backgroundColor: branding.colors.primary, color: branding.colors.primaryText }}
            >
              {submitting ? 'Placing Order...' : `Place Order — ${formatPrice(total)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
