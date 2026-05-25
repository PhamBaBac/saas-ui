import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  Tags,
  Activity,
  AlertTriangle,
  TrendingUp,
  Plus,
  Users,
  ClipboardList,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { getProducts } from '@/api/product';
import { getCategories } from '@/api/category';
import { getStockMovements } from '@/api/stock';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 100],
    queryFn: () => getProducts({ size: 100 })
  });

  const products = productsData?.content || [];

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', 100],
    queryFn: () => getCategories({ size: 100 })
  });

  const categories = categoriesData?.content || [];

  const { data: movementsData, isLoading: movementsLoading } = useQuery({
    queryKey: ['stocks', 100],
    queryFn: () => getStockMovements({ size: 100 })
  });

  const movements = movementsData?.content || [];

  const loading = productsLoading || categoriesLoading || movementsLoading;

  // Real calculations
  const stats = useMemo(() => {
    const lowStockCount = products.filter(p => p.availableQuantity <= (p.alertThreshold || 10)).length;

    // Real trend calculation
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const getCountByMonth = (list, month, year) => {
      return list.filter(item => {
        const d = new Date(item.createdAt || item.dateMvt);
        return !isNaN(d.getTime()) && d.getMonth() === month && d.getFullYear() === year;
      }).length;
    };

    const calculateTrend = (list) => {
      const current = getCountByMonth(list, currentMonth, currentYear);
      const previous = getCountByMonth(list, lastMonth, lastMonthYear);
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const diff = ((current - previous) / previous) * 100;
      return `${diff > 0 ? '+' : ''}${diff.toFixed(0)}%`;
    };

    return [
      { label: 'Total Products', value: products.length, trend: calculateTrend(products), color: 'bg-[#6366f1]', icon: <Package size={20} /> },
      { label: 'Categories', value: categories.length, trend: calculateTrend(categories), color: 'bg-[#a855f7]', icon: <Tags size={20} /> },
      { label: 'Stock Movements', value: movements.length, trend: calculateTrend(movements), color: 'bg-[#10b981]', icon: <Activity size={20} /> },
      { label: 'Low Stock Alerts', value: lowStockCount, trend: lowStockCount > 0 ? `+${lowStockCount}` : '0', color: 'bg-[#ef4444]', icon: <AlertTriangle size={20} />, negative: true },
    ];
  }, [products, categories, movements]);

  const topCategories = useMemo(() => {
    const counts = {};
    products.forEach(p => {
      const catName = p.categoryName || 'Uncategorized';
      counts[catName] = (counts[catName] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return sorted;
  }, [products]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      last6Months.push({ month: months[idx], in: 0, out: 0, monthNum: idx });
    }

    movements.forEach(m => {
      const dateStr = m.dateMvt || m.createdAt;
      const type = m.typeMvt || m.type;
      const quantity = Number(m.quantity) || 1;

      if (dateStr) {
        const date = new Date(dateStr);
        const monthIdx = date.getMonth();
        const chartItem = last6Months.find(item => item.monthNum === monthIdx);
        if (chartItem) {
          if (type === 'IN') chartItem.in += quantity;
          else if (type === 'OUT') chartItem.out += quantity;
        }
      }
    });

    const maxVal = Math.max(...last6Months.map(m => Math.max(m.in, m.out)), 1);
    return last6Months.map(m => ({
      ...m,
      inHeight: `${(m.in / maxVal) * 85 + 5}%`,
      outHeight: `${(m.out / maxVal) * 85 + 5}%`
    }));
  }, [movements]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">Synchronizing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 font-bold text-[13px] mt-1">Welcome back — here's your inventory overview</p>
        </div>
        <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 shadow-sm">
          <Calendar size={16} className="text-slate-400" />
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200/60 overflow-hidden group hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-7">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-xl shadow-${stat.color.split('[')[1].split(']')[0]}/20 group-hover:rotate-6 transition-transform`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-[12px] font-black ${stat.negative && stat.value > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {stat.value > 0 ? <TrendingUp size={14} /> : null}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-6">
                <div className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-2">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-slate-200/60">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Stock Movement Trend</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 mt-1">Inbound vs outbound — last 6 months</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#6366f1]"></div> IN</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f97316]"></div> OUT</div>
            </div>
          </CardHeader>
          <CardContent className="pt-10">
            <div className="flex items-end justify-between h-56 gap-4 md:gap-8 px-4">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-5">
                  <div className="flex items-end gap-1 w-full h-4/5">
                    <div
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-[#4f46e5] to-[#6366f1] transition-all duration-1000"
                      style={{ height: d.inHeight }}
                    ></div>
                    <div
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-[#ea580c] to-[#f97316] transition-all duration-1000"
                      style={{ height: d.outHeight }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{d.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Top Categories */}
          <Card className="border-none shadow-sm ring-1 ring-slate-200/60">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Top Categories</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 mt-1">By product count</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {topCategories.length > 0 ? topCategories.map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-bold text-slate-600">{cat.name}</span>
                    <span className="font-black text-slate-900">{cat.count}</span>
                  </div>
                  <Progress
                    value={(cat.count / products.length) * 100}
                    className="h-1.5"
                    indicatorClassName={['bg-[#6366f1]', 'bg-[#a855f7]', 'bg-[#10b981]', 'bg-[#f59e0b]', 'bg-slate-300'][i % 5]}
                  />
                </div>
              )) : (
                <p className="text-center text-slate-400 text-xs py-8">No category data available</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-none shadow-sm ring-1 ring-slate-200/60">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Product', icon: <Plus size={18} />, color: 'bg-blue-600', path: '/products' },
                { label: 'Manage Categories', icon: <Tags size={18} />, color: 'bg-purple-600', path: '/categories' },
                { label: 'Record Movement', icon: <Activity size={18} />, color: 'bg-emerald-600', path: '/stock' },
                { label: 'Add User', icon: <Users size={18} />, color: 'bg-orange-600', path: '/users' },
              ].map((action, i) => (
                <button 
                  key={i} 
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all gap-2 group"
                >
                  <div className={`w-10 h-10 ${action.color} text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">{action.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
