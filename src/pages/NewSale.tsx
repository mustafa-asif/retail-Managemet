import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, CheckCircle2, ArrowLeft, Store, User, Package } from 'lucide-react';
import toast from 'react-hot-toast';

import { useApi } from '../hooks/useApi';
import { getStores } from '../api/stores';
import { getCustomers } from '../api/customers';
import { getProducts } from '../api/products';
import { getInventory } from '../api/inventory';
import { processSale } from '../api/sales';

export function NewSale() {
  const navigate = useNavigate();

  const { data: stores, execute: fetchStores } = useApi(getStores, true);
  const { data: customers, execute: fetchCustomers } = useApi(getCustomers, true);
  const { data: products, execute: fetchProducts } = useApi(getProducts, true);
  const { data: inventory, execute: fetchInventory } = useApi(getInventory, true);
  const { execute: execProcessSale, loading: processing } = useApi(processSale);

  const [formData, setFormData] = useState({
    store_id: '',
    customer_id: '',
    product_id: '',
    quantity: 1
  });

  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    fetchStores().catch(console.error);
    fetchCustomers().catch(console.error);
    fetchProducts().catch(console.error);
    fetchInventory().catch(console.error);
  }, [fetchStores, fetchCustomers, fetchProducts, fetchInventory]);

  const selectedProduct = useMemo(() => {
    if (!products || !formData.product_id) return null;
    return products.find((p: any) => p.product_id.toString() === formData.product_id);
  }, [products, formData.product_id]);

  const availableStock = useMemo(() => {
    if (!inventory || !formData.store_id || !formData.product_id) return null;
    
    // First try finding an exact match using IDs if available in inventory view
    // Or relying on the materialized view matching logic
    const store = stores?.find((s: any) => s.store_id.toString() === formData.store_id);
    const product = products?.find((p: any) => p.product_id.toString() === formData.product_id);
    
    if (!store || !product) return null;

    const stockItem = inventory.find(
      (inv: any) => inv.store_name === store.name && inv.product_name === product.name
    );

    return stockItem ? stockItem.quantity : 0;
  }, [inventory, formData.store_id, formData.product_id, stores, products]);

  const estimatedTotal = useMemo(() => {
    if (!selectedProduct || !formData.quantity) return 0;
    return selectedProduct.price * formData.quantity;
  }, [selectedProduct, formData.quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.store_id || !formData.product_id || formData.quantity < 1) {
      toast.error('Please fill all required fields correctly.');
      return;
    }

    if (availableStock !== null && formData.quantity > availableStock) {
      toast.error(`Insufficient stock — only ${availableStock} units available.`);
      return;
    }

    try {
      const payload: any = {
        store_id: parseInt(formData.store_id),
        product_id: parseInt(formData.product_id),
        quantity: formData.quantity
      };
      
      if (formData.customer_id) {
        payload.customer_id = parseInt(formData.customer_id);
      }

      const res = await execProcessSale(payload);
      
      setSuccessData(res);
      toast.success('Sale processed successfully!');
      
      setTimeout(() => {
        navigate('/sales');
      }, 3000);

    } catch (err: any) {
      // Handled by useApi, but we can add specific ones
      if (err instanceof Error) {
         if (err.message.includes('Insufficient stock')) {
             toast.error('Insufficient stock available.');
         }
      }
    }
  };

  if (successData) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Success!</h2>
        <p className="text-slate-500 mb-8">The transaction has been processed successfully.</p>
        
        <div className="bg-slate-50 rounded-xl p-6 text-left space-y-3 mb-8">
          <div className="flex justify-between">
            <span className="text-slate-500">Sale ID</span>
            <span className="font-mono font-medium text-slate-900">#{(successData.sale_id || successData.data?.sale_id) ?? 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount Paid</span>
            <span className="font-medium text-emerald-600">PKR {estimatedTotal.toLocaleString('en-PK')}</span>
          </div>
        </div>

        <p className="text-sm text-slate-400">Redirecting to sales list in 3 seconds...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/sales')}
          className="p-2 hover:bg-slate-200 rounded-full bg-slate-100 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Process New Sale</h1>
          <p className="text-slate-500 text-sm mt-1">Record a point-of-sale transaction</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                  <Store className="w-4 h-4 text-emerald-500" />
                  Select Store *
                </label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors appearance-none"
                  value={formData.store_id}
                  onChange={(e) => setFormData({...formData, store_id: e.target.value})}
                >
                  <option value="" disabled>Choose a branch...</option>
                  {stores?.map((s: any) => <option key={s.store_id} value={s.store_id}>{s.name} ({s.location})</option>)}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Select Customer
                </label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors appearance-none"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                >
                  <option value="">Walk-in Customer (Guest)</option>
                  {customers?.map((c: any) => <option key={c.customer_id} value={c.customer_id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                  <Package className="w-4 h-4 text-purple-500" />
                  Select Product *
                </label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors appearance-none"
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                >
                  <option value="" disabled>Choose a product...</option>
                  {products?.map((p: any) => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
                </select>
                
                {availableStock !== null && (
                  <div className={`mt-2 text-xs font-medium ${availableStock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    Available Stock: {availableStock} units
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Quantity *</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors font-mono"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Unit Price</label>
                  <input 
                    type="text"
                    disabled
                    className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 font-mono"
                    value={selectedProduct ? `PKR ${selectedProduct.price}` : '-'}
                  />
                </div>
              </div>
            </div>

          </div>

          <hr className="border-slate-100" />

          {/* Totals & Submit */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-200">
                <Calculator className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Estimated Total</p>
                <p className="text-3xl font-bold text-slate-900 font-mono tracking-tight text-emerald-600">
                  PKR {estimatedTotal.toLocaleString('en-PK')}
                </p>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={processing || !formData.store_id || !formData.product_id || (availableStock !== null && availableStock < formData.quantity)}
              className="w-full md:w-auto px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {processing && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Confirm Checkout
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
