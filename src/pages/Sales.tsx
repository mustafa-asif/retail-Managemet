import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Filter, ChevronDown, ChevronRight, PackageOpen } from 'lucide-react';

import { useApi } from '../hooks/useApi';
import { getSales, getSaleDetails } from '../api/sales';
import { getStores } from '../api/stores';

import { DataTable, Column } from '../components/UI/DataTable';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

export function Sales() {
  const navigate = useNavigate();
  const { data, loading, execute: fetchSales } = useApi(getSales, true);
  const { data: stores, execute: fetchStores } = useApi(getStores, true);
  
  const [storeFilter, setStoreFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [expandedSale, setExpandedSale] = useState<number | null>(null);
  const { data: saleDetails, loading: detailsLoading, execute: fetchDetails } = useApi(getSaleDetails);

  useEffect(() => {
    fetchSales().catch(console.error);
    fetchStores().catch(console.error);
  }, [fetchSales, fetchStores]);

  const handleRowClick = async (row: any) => {
    if (expandedSale === row.sale_id) {
      setExpandedSale(null);
    } else {
      setExpandedSale(row.sale_id);
      await fetchDetails(row.sale_id).catch(console.error);
    }
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = Array.isArray(data.data) ? data.data : data;

    if (storeFilter) {
      result = result.filter((s: any) => s.store_id?.toString() === storeFilter);
    }
    if (dateFrom) {
      result = result.filter((s: any) => new Date(s.sale_date) >= new Date(dateFrom));
    }
    if (dateTo) {
      // Add one day to include the whole selected date
      const toDate = new Date(dateTo);
      toDate.setDate(toDate.getDate() + 1);
      result = result.filter((s: any) => new Date(s.sale_date) <= toDate);
    }

    return result;
  }, [data, storeFilter, dateFrom, dateTo]);

  const columns: Column<any>[] = [
    { 
      key: 'expand', 
      header: '', 
      render: (row) => (
        <button className="p-1 text-slate-400 hover:text-emerald-600 transition-colors">
          {expandedSale === row.sale_id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      ) 
    },
    { key: 'sale_id', header: 'Sale ID', render: (row) => <span className="font-mono text-xs text-slate-500">#{row.sale_id}</span> },
    { key: 'store', header: 'Store', render: (row) => <span className="font-medium text-slate-800">{row.store?.name || '-'}</span> },
    { key: 'customer', header: 'Customer', render: (row) => <span className="text-slate-700">{row.customer?.name || <span className="text-slate-400 italic">Walk-in</span>}</span> },
    { key: 'date', header: 'Date/Time', render: (row) => new Date(row.sale_date).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }) },
    { key: 'total', header: 'Total Amount', render: (row) => <span className="font-medium text-emerald-600">PKR {Number(row.total_amount).toLocaleString('en-PK')}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-slate-400" />
            Transactions
          </h1>
          <p className="text-slate-500 text-sm mt-1">View and filter historical sales</p>
        </div>
        <button 
          onClick={() => navigate('/sales/new')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Process New Sale
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <Filter className="w-5 h-5 text-slate-400" />
        
        <select 
          className="px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
        >
          <option value="">All Stores</option>
          {stores?.map((s: any) => <option key={s.store_id} value={s.store_id}>{s.name}</option>)}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">From:</span>
          <input 
            type="date"
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">To:</span>
          <input 
            type="date"
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {(storeFilter || dateFrom || dateTo) && (
          <button 
            onClick={() => { setStoreFilter(''); setDateFrom(''); setDateTo(''); }}
            className="text-sm text-slate-500 hover:text-slate-900 underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
        {loading ? (
          <LoadingSpinner />
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            No sales found matching your criteria.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                {columns.map((col, idx) => (
                  <th key={col.key || idx} className={`px-6 py-3 whitespace-nowrap ${col.key === 'expand' ? 'w-10 px-2 text-center' : ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row: any, rowIdx: number) => (
                <React.Fragment key={rowIdx}>
                  <tr 
                    onClick={() => handleRowClick(row)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedSale === row.sale_id ? 'bg-slate-50' : ''}`}
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-6 py-4 whitespace-nowrap text-slate-700 ${col.key === 'expand' ? 'w-10 px-2' : ''}`}>
                        {col.render ? col.render(row, rowIdx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                  
                  {expandedSale === row.sale_id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={columns.length} className="p-0 border-b-2 border-emerald-100">
                        <div className="p-6">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Line Items</h4>
                          
                          {detailsLoading ? (
                            <LoadingSpinner className="py-4" />
                          ) : (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-slate-500 text-left">
                                  <th className="pb-2 font-medium">Product</th>
                                  <th className="pb-2 font-medium text-right">Unit Price</th>
                                  <th className="pb-2 font-medium text-right">Quantity</th>
                                  <th className="pb-2 font-medium text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(saleDetails?.items || []).map((item: any, i: number) => (
                                  <tr key={i} className="border-t border-slate-200">
                                    <td className="py-2 text-slate-800">{item.product_name || `Product #${item.product_id}`}</td>
                                    <td className="py-2 text-right text-slate-600">PKR {Number(item.unit_price).toLocaleString('en-PK')}</td>
                                    <td className="py-2 text-right font-mono">{item.quantity}</td>
                                    <td className="py-2 text-right font-medium text-slate-800">PKR {(item.quantity * item.unit_price).toLocaleString('en-PK')}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
