import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  Tags,
  BarChart3,
  Settings,
  LogOut,
  Box,
  Power,
  Activity,
  Handshake,
  Menu,
  X
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (user?.role === 'ROLE_PLATFORM_ADMIN') {
      return [
        { icon: <Building2 size={20} />, label: 'Tenants', path: '/tenants' },
      ];
    }
    const items = [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
      { icon: <Package size={20} />, label: 'Products', path: '/products' },
      { icon: <Tags size={20} />, label: 'Categories', path: '/categories' },
      { icon: <Activity size={20} />, label: 'Stock Movements', path: '/stock' },
      { icon: <Handshake size={20} />, label: 'Partners', path: '/partners' },
    ];
    if (user?.role === 'ROLE_COMPANY_ADMIN' || user?.role === 'ROLE_ADMINISTRATOR') {
      items.push({ icon: <Users size={20} />, label: 'Users', path: '/users' });
    }
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-[#e2e8f0] overflow-hidden font-sans relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-[260px] bg-[#1a1635] text-white flex flex-col shrink-0 shadow-2xl
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-8 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#6366f1] rounded-xl flex items-center justify-center shadow-lg shadow-[#6366f1]/40">
              <Box size={20} className="text-white fill-white/20" />
            </div>
            <span className="text-xl font-bold tracking-tight">StockFlow</span>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section Label */}
        <div className="px-8 mb-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] opacity-80">
            {user?.role === 'ROLE_PLATFORM_ADMIN' ? 'Platform' : 'Workspace'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive
                  ? 'bg-[#2d2850] text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-colors duration-300 ${location.pathname === item.path ? 'text-[#6366f1]' : 'text-slate-500 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className="text-[13px] tracking-wide">{item.label}</span>
              </div>
              {item.soon && (
                <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded text-slate-600 uppercase tracking-tighter">Soon</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 bg-[#16122d]/50">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group mb-2">
            <div className="relative">
              <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                <AvatarFallback className="bg-slate-800 text-slate-400 text-xs font-bold">
                  {user?.role === 'ROLE_PLATFORM_ADMIN' ? 'PA' : 
                   user?.role === 'ROLE_COMPANY_ADMIN' ? 'CA' : 
                   user?.role === 'ROLE_ADMINISTRATOR' ? 'AD' : 
                   user?.role === 'ROLE_SALES_OPERATOR' ? 'SO' : 'US'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1a1635] rounded-full shadow-sm"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[13px] font-bold truncate text-slate-200 group-hover:text-white transition-colors">
                {user?.username || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase truncate tracking-tighter opacity-70">
                {user?.role === 'ROLE_PLATFORM_ADMIN' ? 'Super Admin' :
                 user?.role === 'ROLE_COMPANY_ADMIN' ? 'Company Admin' :
                 user?.role === 'ROLE_ADMINISTRATOR' ? 'Manager' :
                 user?.role === 'ROLE_SALES_OPERATOR' ? 'Sales' : 'User'}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-all text-[13px] font-bold group mt-2"
          >
            <Power size={16} className="text-red-500/50 group-hover:text-red-500 group-hover:-translate-x-1 transition-all" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar for Mobile */}
        <header className="lg:hidden bg-[#1a1635] text-white h-16 shrink-0 flex items-center justify-between px-6 shadow-md relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center">
                <Box size={16} className="text-white fill-white/20" />
              </div>
              <span className="font-bold tracking-tight text-[16px]">StockFlow</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarFallback className="bg-slate-800 text-slate-400 text-[10px] font-bold">
                {user?.role === 'ROLE_PLATFORM_ADMIN' ? 'PA' : 
                 user?.role === 'ROLE_COMPANY_ADMIN' ? 'CA' : 
                 user?.role === 'ROLE_ADMINISTRATOR' ? 'AD' : 
                 user?.role === 'ROLE_SALES_OPERATOR' ? 'SO' : 'US'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f1f5f9] p-4 sm:p-8 md:p-12 custom-scrollbar">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
