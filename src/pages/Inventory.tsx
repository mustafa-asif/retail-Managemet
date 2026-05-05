import React, { useEffect, useState, useMemo } from 'react';
import { Boxes, Edit2, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { useApi } from '../hooks/useApi';
import { getInventory, updateInventory, refreshMV } from '../api/inventory';
import { getStores } from '../api/stores';

import { DataTable, Column } from '../components/UI/DataTable';
import { Modal } from '../components/UI/Modal';
import { Badge } from '../components/UI/Badge';

export function Inventory() {
  const { data, loading, execute: fetchInventory } = useApi(getInventory, true);
  const { data: stores, execute: fetchStores } = useApi(getStores, true);
  const { execute: execUpdate } = useApi(updateInventory);
  const { execute: execRefresh, loading: refreshing } = useApi(refreshMV);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [storeFilter, setStoreFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInventory().catch(console.error);
    fetchStores().catch(console.error);
  }, [fetchInventory, fetchStores]);

  const handleOpenModal = (item: any) => {
    setEditingItem(item);
    setQuantity(item.quantity?.toString() || '0');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await execUpdate(editingItem.inventory_id, { quantity: parseInt(quantity, 10) });
      toast.success('Inventory updated successfully');
      setIsModalOpen(false);
      fetchInventory();
    } catch {
      toast.error('Failed to update inventory');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await execRefresh();
      toast.success('Materialized view refreshed');
      fetchInventory();
    } catch {
      toast.error('Failed to refresh view');
    }
  };

  const getStatusBadge = (qty: number) => {
    if (qty === 0) return <Badge label="OUT OF STOCK" type="danger" />;
    if (qty < 10) return <Badge label="LOW STOCK" type="warning" />;
    return <Badge label="IN STOCK" type="success" />;
  };

  const getStatusValue = (qty: number) => {
    if (qty === 0) return 'OOS';
    if (qty < 10) return 'LOW';
    return 'IN';
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item: any) => {
      const matchStore = !storeFilter || item.store_name === storeFilter;
      const matchStatus = !statusFilter || getStatusValue(item.quantity) === statusFilter;
      return matchStore && matchStatus;
    });
  }, [data, storeFilter, statusFilter]);

  const columns: Column<any>[] = [
    { key: 'store_name', header: 'Store', render: (row) => <span className="font-medium text-slate-800">{row.store_name}</span> },
    { key: 'location', header: 'Location', render: (row) => <span className="text-slate-500 text-sm">{row.location}</span> },
    { key: 'product_name', header: 'Product', render: (row) => <span className="font-medium text-slate-900">{row.product_name}</span> },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price', render: (row) => `PKR ${Number(row.price).toLocaleString('en-PK')}` },
    { key: 'quantity', header: 'Current Stock', render: (row) => <span className="font-mono">{row.quantity}</span> },
    { key: 'status', header: 'Status', render: (row) => getStatusBadge(row.quantity) },
    { 
      key: 'actions', 
      header: 'Actions', 
      render: (row) => (
        <button 
          onClick={() => handleOpenModal(row)}
          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
          title="Update Stock"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-slate-400" />
            Inventory Tracking
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time stock levels across all locations</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh MV
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <Filter className="w-5 h-5 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">Filter View:</span>
        
        <select 
          className="px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 min-w-[200px]"
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
        >
          <option value="">All Stores</option>
          {stores?.map((s: any) => <option key={s.store_id} value={s.name}>{s.name}</option>)}
        </select>

        <select 
          className="px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="IN">In Stock</option>
          <option value="LOW">Low Stock</option>
          <option value="OOS">Out of Stock</option>
        </select>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex gap-3 text-sm text-blue-800">
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
        <p>This view displays data from <code>vw_inventory_status</code>. Use the Refresh MV button to update the materialized view if underlying data changes.</p>
      </div>

      <DataTable columns={columns} data={filteredData} loading={loading} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Update Stock Quantity"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {editingItem && (
            <div className="bg-slate-50 p-4 rounded-lg text-sm border border-slate-200 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-slate-500">Store:</span>
                <span className="font-medium text-slate-900">{editingItem.store_name}</span>
                <span className="text-slate-500">Product:</span>
                <span className="font-medium text-slate-900">{editingItem.product_name}</span>
                <span className="text-slate-500">Current Stock:</span>
                <span className="font-mono font-medium text-amber-600">{editingItem.quantity}</span>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Quantity *</label>
            <input 
              type="number"
              min="0"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-lg"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
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
              {submitting ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
