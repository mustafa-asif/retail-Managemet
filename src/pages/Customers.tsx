import React, { useEffect, useState } from 'react';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useApi } from '../hooks/useApi';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customers';

import { DataTable, Column } from '../components/UI/DataTable';
import { Modal } from '../components/UI/Modal';

export function Customers() {
  const { data, loading, execute: fetchCustomers } = useApi(getCustomers, true);
  const { execute: execCreate } = useApi(createCustomer);
  const { execute: execUpdate } = useApi(updateCustomer);
  const { execute: execDelete } = useApi(deleteCustomer);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', city: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers().catch(console.error);
  }, [fetchCustomers]);

  const handleOpenModal = (customer?: any) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({ 
        name: customer.name, 
        email: customer.email || '', 
        phone: customer.phone || '', 
        city: customer.city || '' 
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', city: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCustomer) {
        await execUpdate(editingCustomer.customer_id, formData);
        toast.success('Customer updated successfully');
      } else {
        await execCreate(formData);
        toast.success('Customer added successfully');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch {
      toast.error('Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await execDelete(id);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  const columns: Column<any>[] = [
    { key: 'customer_id', header: 'ID', render: (row) => <span className="font-mono text-xs text-slate-500">#{row.customer_id}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium text-slate-900">{row.name}</span> },
    { key: 'email', header: 'Email', render: (row) => row.email || <span className="text-slate-400 italic">None</span> },
    { key: 'phone', header: 'Phone', render: (row) => row.phone || <span className="text-slate-400 italic">None</span> },
    { key: 'city', header: 'City', render: (row) => row.city || <span className="text-slate-400 italic">None</span> },
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
            onClick={() => handleDelete(row.customer_id)}
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
            <Users className="w-6 h-6 text-slate-400" />
            Customers
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage customer base and contact details</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <DataTable columns={columns} data={data || []} loading={loading} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="e.g. john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input 
              type="text"
              pattern="[0-9]{4}-[0-9]{7}"
              title="Format: 0300-1234567"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Format: 0300-1234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="e.g. Karachi"
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
              {submitting ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
