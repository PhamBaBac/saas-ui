import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  CheckCircle2,
  Package,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { register } from '@/api/auth';
import { getErrorMessage } from '@/utils/error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const RegisterPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 5000);
    },
    onError: (err) => {
      console.error(err);
      setError(getErrorMessage(err, 'Failed to register. Please check your information.'));
    }
  });

  const handleRegister = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    setError('');
    registerMutation.mutate({
      companyName: data.companyName,
      companyCode: data.companyCode,
      email: data.companyEmail,
      adminFullName: data.adminFullName,
      adminEmail: data.adminEmail,
      adminUsername: data.adminUsername,
      adminPassword: data.adminPassword,
    });
  };

  const isLoading = registerMutation.isPending;


  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#1a1635] p-4 relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>

        <Card className="w-full max-w-lg border-none bg-white shadow-2xl rounded-[40px] text-center p-12 relative z-10 animate-in zoom-in-95 duration-500">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
              <CheckCircle2 size={56} strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Registration Submitted!</h2>
          <p className="text-slate-500 text-lg leading-relaxed px-4">
            Your tenant workspace has been created successfully. Please wait for an administrator to approve your account.
          </p>
          <div className="mt-10 space-y-4">
            <Button asChild className="w-full h-14 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-[1.02]">
              <Link to="/login">Proceed to Login</Link>
            </Button>
            <p className="text-slate-400 text-sm font-medium animate-pulse">
              Redirecting you to login in 5 seconds...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#1a1635] flex flex-col items-center py-12 px-4 relative overflow-hidden font-sans">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>

      {/* Logo Header */}
      <div className="w-full max-w-4xl flex justify-start mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Package size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">StockFlow</span>
        </div>
      </div>

      <div className="w-full max-w-4xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="border-none shadow-2xl shadow-black/40 bg-white rounded-[32px] overflow-hidden">
          <div className="p-10 md:p-14">
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Create your account</h1>
              <p className="text-slate-500 text-lg">Set up your company workspace and admin credentials</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-12">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-medium animate-in shake duration-500 whitespace-pre-line">
                  {error}
                </div>
              )}

              {/* Section 1: Company Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Company Information</h3>
                    <p className="text-sm text-slate-500">Details about your organization</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input 
                      name="companyName"
                      placeholder="Company name" 
                      className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all px-4"
                      required 
                    />
                  </div>
                  <div className="relative">
                    <Input 
                      name="companyCode"
                      placeholder="Company code" 
                      className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all px-4"
                      required 
                    />
                  </div>
                </div>
                <Input 
                  name="companyEmail"
                  type="email"
                  placeholder="Company email" 
                  className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all px-4"
                  required 
                />
              </div>

              <div className="h-[1px] bg-slate-100 w-full"></div>

              {/* Section 2: Admin Account */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Admin Account</h3>
                    <p className="text-sm text-slate-500">Set up your administrator credentials</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Input 
                      name="adminFullName"
                      placeholder="Full name" 
                      className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all px-4"
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Input 
                      name="adminUsername"
                      placeholder="Username" 
                      className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all px-4"
                      required 
                    />
                    <p className="text-[11px] font-bold text-emerald-600 ml-1 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Dùng tài khoản này để đăng nhập vào hệ thống
                    </p>
                  </div>
                </div>
                <Input 
                  name="adminEmail"
                  type="email"
                  placeholder="Admin email" 
                  className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all px-4"
                  required 
                />
                <div className="relative">
                  <Input 
                    name="adminPassword"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all px-4 pr-10"
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

              <div className="pt-6 space-y-6">
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-lg rounded-xl shadow-xl shadow-emerald-500/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account <Check size={20} />
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-slate-500 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-bold">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
