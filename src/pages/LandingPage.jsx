import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Package, 
  Tags, 
  Activity, 
  ShieldCheck, 
  Zap,
  BarChart3,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0a051d] text-white selection:bg-primary/30 selection:text-white overflow-hidden font-sans">
      {/* Background Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4f46e5]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#06b6d4]/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-6 transition-transform">
            <Package size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">StockFlow</span>
        </div>
        
        <div className="flex items-center gap-8">
          <Link to="/login" className="hidden md:block text-slate-400 hover:text-white transition-colors font-medium">
            Login
          </Link>
          <Button asChild className="bg-[#10b981] hover:bg-[#059669] text-white rounded-lg px-6 font-semibold group">
            <Link to="/register" className="flex items-center gap-2">
              Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm shadow-xl">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">Multi-Tenant Stock Management Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Manage Inventory <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#818cf8] to-[#c084fc]">at Scale</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl">
              A powerful multi-tenant stock management solution built for modern businesses. Track products, categories, and stock movements — all in one place with role-based access control.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button asChild size="lg" className="h-14 px-8 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-lg rounded-xl shadow-2xl shadow-emerald-500/20 transform hover:scale-[1.05] transition-all">
                <Link to="/register" className="flex items-center gap-2">
                  Start Free Trial <ArrowRight size={20} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl font-bold text-lg">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Dashboard Visual */}
          <div className="relative animate-in fade-in zoom-in duration-1000">
            {/* Main Card */}
            <div className="bg-[#1e1b4b]/40 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
              {/* Card Header with window controls */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="text-xs font-medium text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">Dashboard</div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: <Package size={14} />, label: 'Products', value: '1,234', color: 'bg-blue-500/10 text-blue-400' },
                  { icon: <Tags size={14} />, label: 'Categories', value: '56', color: 'bg-purple-500/10 text-purple-400' },
                  { icon: <Activity size={14} />, label: 'Movements', value: '892', color: 'bg-cyan-500/10 text-cyan-400' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-transform group-hover:-translate-y-1" style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Chart Visualization */}
              <div className="flex items-end justify-between h-32 gap-2 mt-4 px-2">
                {[45, 65, 35, 85, 55, 75, 50, 60].map((height, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-primary/80 to-blue-400/80 rounded-t-lg transition-all duration-1000 group-hover:from-primary"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
              
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
            </div>

            {/* Float Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[60px] animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 border-t border-white/5 pt-16 animate-in fade-in duration-1000 delay-500">
          {[
            { icon: <Globe className="text-cyan-400" />, title: 'Multi-Tenancy', desc: 'Isolate data across multiple organizations with a single infrastructure.' },
            { icon: <ShieldCheck className="text-emerald-400" />, title: 'Secure Access', desc: 'Fine-grained RBAC to control who can view or modify inventory data.' },
            { icon: <Zap className="text-amber-400" />, title: 'Real-time Tracking', desc: 'Instantly monitor stock movements and levels across all locations.' }
          ].map((f, i) => (
            <div key={i} className="space-y-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6 md:px-12 text-center text-slate-500 text-sm">
        <p>&copy; 2026 StockFlow Systems. Built for modern inventory management.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
