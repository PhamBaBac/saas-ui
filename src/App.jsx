import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import LandingPage from '@/pages/LandingPage';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import TenantManagement from '@/pages/TenantManagement';
import UserManagement from '@/pages/UserManagement';
import CategoryManagement from '@/pages/CategoryManagement';
import ProductManagement from '@/pages/ProductManagement';
import StockMovementManagement from '@/pages/StockMovementManagement';
import PartnerManagement from '@/pages/PartnerManagement';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
const RoleBasedRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  const fallback = user.role === 'ROLE_PLATFORM_ADMIN' ? '/tenants' : '/dashboard';
  return <Navigate to={fallback} replace />;
};


const App = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleBasedRedirect />} path="/home" />

          <Route element={<ProtectedRoute allowedRoles={['ROLE_COMPANY_ADMIN', 'ROLE_ADMINISTRATOR', 'ROLE_SALES_OPERATOR', 'ROLE_USER']} />}>
            <Route
              path="/dashboard"
              element={<DashboardLayout><Dashboard /></DashboardLayout>}
            />
          </Route>

          {/* Admin only routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_PLATFORM_ADMIN']} />}>
            <Route
              path="/tenants"
              element={<DashboardLayout><TenantManagement /></DashboardLayout>}
            />
          </Route>

          {/* Company Admin and Administrator routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_COMPANY_ADMIN', 'ROLE_ADMINISTRATOR']} />}>
            <Route
              path="/users"
              element={<DashboardLayout><UserManagement /></DashboardLayout>}
            />
          </Route>

          {/* Common shared routes with RBAC inside the page or layout */}
          <Route
            path="/products"
            element={<DashboardLayout><ProductManagement /></DashboardLayout>}
          />
          <Route
            path="/categories"
            element={<DashboardLayout><CategoryManagement /></DashboardLayout>}
          />
          <Route
            path="/stock"
            element={<DashboardLayout><StockMovementManagement /></DashboardLayout>}
          />
          <Route
            path="/partners"
            element={<DashboardLayout><PartnerManagement /></DashboardLayout>}
          />
        </Route>

        {/* Fallback for 404 Page Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
