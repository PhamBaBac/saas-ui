import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleGoHome = () => {
    if (!user) {
      navigate('/');
    } else if (user.role === 'ROLE_PLATFORM_ADMIN') {
      navigate('/tenants');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-500/10 blur-[128px] animate-pulse duration-4000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[160px] animate-pulse duration-6000"></div>

      {/* Main Glassmorphic Container */}
      <div className="relative max-w-lg w-full bg-slate-950/40 backdrop-blur-2xl ring-1 ring-slate-800/80 rounded-[40px] p-12 text-center shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Floating Animated Icon */}
        <div className="relative mx-auto w-24 h-24 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 transform hover:scale-110 hover:rotate-6 transition-all duration-300 animate-bounce">
          <FileQuestion size={44} strokeWidth={2} />
        </div>

        {/* 404 Text & Description */}
        <div className="space-y-4">
          <h1 className="text-8xl font-black bg-gradient-to-r from-orange-400 via-amber-400 to-indigo-400 bg-clip-text text-transparent tracking-tighter select-none">
            404
          </h1>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Page Not Found
          </h2>
          <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-sm mx-auto">
            We couldn't find the page you were looking for. It might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1 h-13 border-slate-800 text-slate-300 bg-slate-900/50 hover:bg-slate-900 hover:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <ArrowLeft size={16} />
            Go Back
          </Button>
          <Button
            onClick={handleGoHome}
            className="flex-1 h-13 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Home size={16} />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
