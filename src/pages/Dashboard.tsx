import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingCart, AlertTriangle, TrendingUp, RefreshCw, Package } from 'lucide-react';
import toast from 'react-hot-toast';

import { useApi } from '../hooks/useApi';
import { getDashboardAnalytics, getMonthlySales, getStoreSummary, getBestSellingProducts } from '../api/analytics';
import { refreshMV } from '../api/inventory';
import { getSales } from '../api/sales';

import { StatCard } from '../components/UI/StatCard';
import { RevenueChart } from '../components/Charts/RevenueChart';
import { StoreComparisonChart } from '../components/Charts/StoreComparisonChart';
import { ProductsChart } from '../components/Charts/ProductsChart';
import { DataTable, Column } from '../components/UI/DataTable';

export function Dashboard() {
  const navigate = useNavigate();

  const dashRes = useApi(getDashboardAnalytics, true);
  const monthlyRes = useApi(getMonthlySales, true);
  const storesRes = useApi(getStoreSummary, true);
  const productsRes = useApi(getBestSellingProducts, true);
  const salesRes = useApi(() => getSales({ limit: 10 }), true);
  const refreshRes = useApi(refreshMV);

  useEffect(() => {
    dashRes.execute().catch(console.error);
    monthlyRes.execute().catch(console.error);
    storesRes.execute().catch(console.error);
    productsRes.execute().catch(console.error);
    salesRes.execute().catch(console.error);
  }, []);

  const handleRefreshInventory = async () => {
    try {
      await refreshRes.execute();
      toast.success('Inventory materialized view refreshed');
    } catch {
      toast.error('Failed to refresh inventory');
    }
  };

  const salesColumns: Column<any>[] = [
    { key: 'sale_id', header: 'Sale ID', render: (row) => <span className="font-mono text-xs">#{row.sale_id}</span> },
    { key: 'store_name', header: 'Store', render: (row) => row.store?.name || '-' },
    { key: 'customer_name', header: 'Customer', render: (row) => row.customer?.name || 'Walk-in' },
    { key: 'total_amount', header: 'Amount', render: (row) => <span className="font-medium text-emerald-600">PKR {Number(row.total_amount).toLocaleString('en-PK')}</span> },
    { key: 'sale_date', header: 'Date', render: (row) => new Date(row.sale_date).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }) },
  ];

  const d = dashRes.data || {};
  const topProduct = productsRes.data?.[0]?.product_name || 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of your retail operations</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRefreshInventory}
            disabled={refreshRes.loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${refreshRes.loading ? 'animate-spin' : ''}`} />
            Refresh Inventory MV
          </button>
          <button 
            onClick={() => navigate('/sales/new')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            Process New Sale
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`PKR ${Number(d.total_revenue || 0).toLocaleString('en-PK')}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard 
          title="Total Transactions" 
          value={(d.total_transactions || 0).toLocaleString('en-PK')}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="Low Stock Items" 
          value={d.low_stock_items || 0}
          icon={<AlertTriangle className="w-6 h-6" />}
          color={d.low_stock_items > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600"}
        />
        <StatCard 
          title="Top Selling Product" 
          value={topProduct}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-purple-100 text-purple-600"
          className="truncate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Monthly Revenue
          </h2>
          <RevenueChart data={monthlyRes.data || []} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-blue-500" />
            Store Comparison
          </h2>
          <StoreComparisonChart data={storesRes.data || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-800">Recent Sales</h2>
            <button onClick={() => navigate('/sales')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All</button>
          </div>
          <div className="flex-1 p-0">
            <DataTable 
              columns={salesColumns} 
              data={salesRes.data?.data || salesRes.data || []} 
              loading={salesRes.loading} 
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-500" />
            Top Products (Units)
          </h2>
          <ProductsChart data={productsRes.data?.slice(0, 5) || []} />
        </div>
      </div>
    </div>
  );
}
