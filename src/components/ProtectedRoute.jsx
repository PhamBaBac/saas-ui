import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import AccessDenied from './AccessDenied';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <AccessDenied />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
