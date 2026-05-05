import React, { useEffect, useState, useMemo } from 'react';
import { Package, Plus, Edit2, Trash2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import { useApi } from '../hooks/useApi';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';

import { DataTable, Column } from '../components/UI/DataTable';
import { Modal } from '../components/UI/Modal';
import { Badge } from '../components/UI/Badge';

const CATEGORIES = ['Groceries', 'Household', 'Beverages', 'Snacks'];

export function Products() {
  const { data, loading, execute: fetchProducts } = useApi(getProducts, true);
  const { execute: execCreate } = useApi(createProduct);
  const { execute: execUpdate } = useApi(updateProduct);
  const { execute: execDelete } = useApi(deleteProduct);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', category: CATEGORIES[0], price: '' });
  const [submitting, setSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchProducts().catch(console.error);
  }, [fetchProducts]);

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, 
        category: product.category || CATEGORIES[0], 
        price: product.price?.toString() || '' 
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: CATEGORIES[0], price: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price)
    };

    try {
      if (editingProduct) {
        await execUpdate(editingProduct.product_id, payload);
        toast.success('Product updated successfully');
      } else {
        await execCreate(payload);
        toast.success('Product added successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await execDelete(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!categoryFilter) return data;
    return data.filter((p: any) => p.category === categoryFilter);
  }, [data, categoryFilter]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Groceries': return 'success';
      case 'Beverages': return 'info';
      case 'Household': return 'warning';
      default: return 'default';
    }
  };

  const columns: Column<any>[] = [
    { key: 'product_id', header: 'ID', render: (row) => <span className="font-mono text-xs text-slate-500">#{row.product_id}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium text-slate-900">{row.name}</span> },
    { key: 'category', header: 'Category', render: (row) => <Badge label={row.category} type={getCategoryColor(row.category) as any} /> },
    { key: 'price', header: 'Price', render: (row) => <span className="font-medium text-slate-700">PKR {Number(row.price).toLocaleString('en-PK')}</span> },
    { 
      key: 'actions', 
      header: 'Actions', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenModal(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row.product_id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-slate-400" />
            Products
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage physical products catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              className="pl-9 pr-8 py-2 bg-white border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 appearance-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} loading={loading} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Lipton Yellow Label 500g"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price (PKR) *</label>
            <input 
              type="number"
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              placeholder="1250"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
