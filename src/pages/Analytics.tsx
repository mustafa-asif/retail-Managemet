import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, PackageSearch, AlertTriangle } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getStoreSummary, getBestSellingProducts, getMonthlySales, getProductSets } from '../api/analytics';

import { DataTable, Column } from '../components/UI/DataTable';

const TABS = ['Store Summary', 'Best Sellers', 'Monthly Sales', 'Product Sets'];

export function Analytics() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const { data: storesData, loading: storesLoading, execute: fetchStores } = useApi(getStoreSummary, true);
  const { data: productsData, loading: productsLoading, execute: fetchProducts } = useApi(getBestSellingProducts, true);
  const { data: monthlyData, loading: monthlyLoading, execute: fetchMonthly } = useApi(getMonthlySales, true);
  
  const { data: setUnion, loading: lU, execute: execU } = useApi(() => getProductSets('union'));
  const { data: setIntersect, loading: lI, execute: execI } = useApi(() => getProductSets('intersect'));
  const { data: setMinus, loading: lM, execute: execM } = useApi(() => getProductSets('minus'));

  useEffect(() => {
    fetchStores().catch(console.error);
    fetchProducts().catch(console.error);
    fetchMonthly().catch(console.error);
    execU().catch(console.error);
    execI().catch(console.error);
    execM().catch(console.error);
  }, []);

  const storeColumns: Column<any>[] = [
    { key: 'store_name', header: 'Store', render: row => <span className="font-medium">{row.store_name}</span> },
    { key: 'total_transactions', header: 'Transactions', render: row => row.total_transactions },
    { key: 'total_revenue', header: 'Revenue', render: row => <span className="text-emerald-600 font-medium">PKR {Number(row.total_revenue).toLocaleString('en-PK')}</span> },
    { key: 'avg_sale', header: 'Avg Sale', render: row => `PKR ${Number(row.avg_sale).toLocaleString('en-PK')}` },
  ];

  const productColumns: Column<any>[] = [
    { key: 'rank', header: 'Rank', render: (_, index) => <span className="text-slate-400 font-medium">#{index + 1}</span> },
    { key: 'product_name', header: 'Product', render: row => <span className="font-medium text-slate-800">{row.product_name}</span> },
    { key: 'category', header: 'Category' },
    { key: 'total_units_sold', header: 'Units Sold', render: row => <span className="font-mono text-purple-600 font-medium">{row.total_units_sold}</span> },
    { key: 'total_revenue', header: 'Revenue', render: row => <span className="text-emerald-600 font-medium">PKR {Number(row.total_revenue).toLocaleString('en-PK')}</span> },
  ];

  const monthlyColumns: Column<any>[] = [
    { key: 'month', header: 'Month', render: row => <span className="font-medium">{row.month}</span> },
    { key: 'total_transactions', header: 'Transactions', render: row => row.total_transactions },
    { key: 'total_revenue', header: 'Revenue', render: row => <span className="text-emerald-600 font-medium">PKR {Number(row.total_revenue).toLocaleString('en-PK')}</span> },
    { key: 'avg_sale', header: 'Avg Sale', render: row => `PKR ${Number(row.avg_sale).toLocaleString('en-PK')}` },
  ];

  const setColumns: Column<any>[] = [
    { key: 'product_id', header: 'ID', render: row => <span className="text-slate-500 font-mono text-xs">#{row.product_id}</span> },
    { key: 'name', header: 'Product Name', render: row => <span className="font-medium text-slate-800">{row.name}</span> },
    { key: 'category', header: 'Category' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            Analytics Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">Detailed breakdown of store performance and products</p>
        </div>
      </div>

      <div className="bg-white border text-sm font-medium border-slate-200 rounded-xl p-2 inline-flex gap-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {activeTab === 'Store Summary' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Store Sales Summary
            </h2>
            <DataTable columns={storeColumns} data={storesData} loading={storesLoading} />
          </div>
        )}

        {activeTab === 'Best Sellers' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-purple-500" /> Best Selling Products
            </h2>
            <DataTable columns={productColumns} data={productsData} loading={productsLoading} />
          </div>
        )}

        {activeTab === 'Monthly Sales' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" /> Monthly Sales Data
            </h2>
            <DataTable columns={monthlyColumns} data={monthlyData} loading={monthlyLoading} />
          </div>
        )}

        {activeTab === 'Product Sets' && (
          <div className="p-6 space-y-8 text-black">
            <div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">Active Products (Union)</h3>
              <p className="text-sm text-slate-500 mb-4">Products that are either in inventory OR have been sold.</p>
              <DataTable columns={setColumns} data={setUnion?.data || setUnion || []} loading={lU} />
            </div>
            
            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-base font-semibold text-slate-800 mb-2">Sold & Stocked (Intersect)</h3>
              <p className="text-sm text-slate-500 mb-4">Products that are BOTH currently in inventory AND have historical sales.</p>
              <DataTable columns={setColumns} data={setIntersect?.data || setIntersect || []} loading={lI} />
            </div>

            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Unsold Products (Minus)
              </h3>
              <p className="text-sm text-slate-500 mb-4">Products currently in inventory but NEVER sold.</p>
              <DataTable columns={setColumns} data={setMinus?.data || setMinus || []} loading={lM} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
