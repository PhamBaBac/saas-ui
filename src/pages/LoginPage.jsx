import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useMutation } from '@tanstack/react-query';
import { 
  Package, 
  CheckCircle2, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { login } from '@/api/auth';
import { getErrorMessage } from '@/utils/error';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const { accessToken } = data;
      setAuth(accessToken);
      const decoded = jwtDecode(accessToken);
      if (decoded.role === 'ROLE_PLATFORM_ADMIN') {
        navigate('/tenants');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (err) => {
      console.error(err);
      setError(getErrorMessage(err, 'Invalid username or password'));
    }
  });

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    setError('');
    loginMutation.mutate({ username, password });
  };

  const isLoading = loginMutation.isPending;


  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans">
      {/* Left Side - Dark Branding */}
      <div className="w-full md:w-[45%] bg-[#1a1635] text-white p-8 sm:p-12 md:p-24 flex flex-col justify-between relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8 md:mb-16">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Package size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">StockFlow</span>
          </div>

          <div className="space-y-6 max-w-sm">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-slate-400 text-base sm:text-lg">
              Sign in to your account to continue managing your inventory.
            </p>

            <ul className="space-y-4 pt-4 md:pt-8 hidden sm:block">
              {[
                'Real-time stock tracking',
                'Multi-tenant isolation',
                'Role-based access control'
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 size={18} className="text-primary/70 shrink-0" />
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-sm mt-8 md:mt-0">
          &copy; 2026 StockFlow Systems. All rights reserved.
        </div>
      </div>

      {/* Right Side - Light Sign In Form */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-700">
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl p-4 md:p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign in</h2>
              <p className="text-slate-500 mt-2">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in shake duration-500">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Input 
                  id="username"
                  name="username"
                  type="text" 
                  placeholder="Username" 
                  className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input 
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all placeholder:text-slate-400 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight size={20} />
                  </span>
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="text-slate-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
