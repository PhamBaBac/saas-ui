import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';

const AccessDenied = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleGoHome = () => {
    if (user?.role === 'ROLE_PLATFORM_ADMIN') {
      navigate('/tenants');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto text-red-500 shadow-xl shadow-red-100 ring-1 ring-red-100">
            <ShieldAlert size={48} strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-red-50">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Access Denied</h1>
          <p className="text-slate-500 font-bold leading-relaxed">
            Oops! It seems you don't have the required permissions to access this area.
          </p>
        </div>

        <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Your Current Role</p>
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full text-slate-700 font-black text-sm shadow-sm">
            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            {user?.role?.replace('ROLE_', '').replace('_', ' ') || 'Guest'}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleGoHome}
            className="h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-200 group transition-all"
          >
            <Home size={18} className="mr-2 group-hover:-translate-y-0.5 transition-transform" />
            Back to Home
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="h-12 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
          >
            <ArrowLeft size={16} className="mr-2" /> Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
