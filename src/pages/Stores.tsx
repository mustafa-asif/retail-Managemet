import React, { useEffect, useState } from 'react';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useApi } from '../hooks/useApi';
import { getStores, createStore, updateStore, deleteStore } from '../api/stores';

import { DataTable, Column } from '../components/UI/DataTable';
import { Modal } from '../components/UI/Modal';

export function Stores() {
  const { data, loading, loading: listLoading, execute: fetchStores } = useApi(getStores, true);
  const { execute: execCreate } = useApi(createStore);
  const { execute: execUpdate } = useApi(updateStore);
  const { execute: execDelete } = useApi(deleteStore);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStores().catch(console.error);
  }, [fetchStores]);

  const handleOpenModal = (store?: any) => {
    if (store) {
      setEditingStore(store);
      setFormData({ name: store.name, location: store.location });
    } else {
      setEditingStore(null);
      setFormData({ name: '', location: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStore) {
        await execUpdate(editingStore.store_id, formData);
        toast.success('Store updated successfully');
      } else {
        await execCreate(formData);
        toast.success('Store added successfully');
      }
      setIsModalOpen(false);
      fetchStores();
    } catch {
      toast.error('Failed to save store');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this store?')) return;
    try {
      await execDelete(id);
      toast.success('Store deleted successfully');
      fetchStores();
    } catch {
      toast.error('Failed to delete store');
    }
  };

  const columns: Column<any>[] = [
    { key: 'store_id', header: 'Store ID', render: (row) => <span className="font-mono text-xs text-slate-500">#{row.store_id}</span> },
    { key: 'name', header: 'Store Name', render: (row) => <span className="font-medium text-slate-900">{row.name}</span> },
    { key: 'location', header: 'Location' },
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
            onClick={() => handleDelete(row.store_id)}
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
            <Building2 className="w-6 h-6 text-slate-400" />
            Stores
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage Save Mart branch locations</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Store
        </button>
      </div>

      <DataTable columns={columns} data={data || []} loading={listLoading} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingStore ? 'Edit Store' : 'Add New Store'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Store Name *</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Save Mart - Tariq Road"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g. Tariq Road, Karachi"
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
              {submitting ? 'Saving...' : 'Save Store'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
