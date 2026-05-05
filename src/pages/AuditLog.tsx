import React, { useEffect, useState, useMemo } from 'react';
import { ClipboardList, Filter } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getAuditLogs } from '../api/audit';
import { getStores } from '../api/stores';

import { DataTable, Column } from '../components/UI/DataTable';
import { Badge } from '../components/UI/Badge';

export function AuditLog() {
  const { data, loading, execute: fetchLogs } = useApi(getAuditLogs, true);
  const { data: stores, execute: fetchStores } = useApi(getStores, true);
  
  const [storeFilter, setStoreFilter] = useState('');

  useEffect(() => {
    fetchLogs().catch(console.error);
    fetchStores().catch(console.error);
  }, [fetchLogs, fetchStores]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    let logs = Array.isArray(data.data) ? data.data : data;
    if (storeFilter) {
      logs = logs.filter((l: any) => l.store_id?.toString() === storeFilter);
    }
    return logs;
  }, [data, storeFilter]);

  const getActionBadge = (action: string) => {
    if (action === 'DELETE') return <Badge label="DELETE" type="danger" />;
    if (action === 'UPDATE') return <Badge label="UPDATE" type="info" />;
    return <Badge label={action} type="default" />;
  };

  const getChangeDisplay = (oldQty: number, newQty: number) => {
    if (oldQty === null || newQty === null) return '-';
    const diff = newQty - oldQty;
    if (diff > 0) return <span className="text-emerald-600 font-medium">+{diff}</span>;
    if (diff < 0) return <span className="text-red-600 font-medium">{diff}</span>;
    return <span className="text-slate-400">0</span>;
  };

  const columns: Column<any>[] = [
    { key: 'log_id', header: 'Log ID', render: row => <span className="font-mono text-xs text-slate-500">#{row.log_id}</span> },
    { key: 'action_type', header: 'Action', render: row => getActionBadge(row.action_type) },
    { key: 'store_id', header: 'Store ID', render: row => <span className="font-mono">{row.store_id}</span> },
    { key: 'product_id', header: 'Product ID', render: row => <span className="font-mono">{row.product_id}</span> },
    { key: 'old_quantity', header: 'Old Qty' },
    { key: 'new_quantity', header: 'New Qty' },
    { key: 'change', header: 'Change', render: row => getChangeDisplay(row.old_quantity, row.new_quantity) },
    { key: 'action_time', header: 'Timestamp', render: row => new Date(row.action_time).toLocaleString('en-PK') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-slate-400" />
            Audit Log
          </h1>
          <p className="text-slate-500 text-sm mt-1">System-generated inventory change logs</p>
        </div>
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

        {storeFilter && (
          <button 
            onClick={() => setStoreFilter('')}
            className="text-sm text-slate-500 hover:text-slate-900 underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      <DataTable columns={columns} data={filteredData} loading={loading} />
    </div>
  );
}
