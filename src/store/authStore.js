import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  setAuth: (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    // Based on backend logic:
    // user.getRole().name() -> 'role'
    // user.getTenantId() -> 'tenantId'
    // user.getId() -> 'userId'
    
    set({
      token,
      isAuthenticated: true,
      user: {
        id: decoded.sub || decoded.userId,
        tenantId: decoded.tenant_id || decoded.tenantId,
        role: decoded.role,
      },
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  initialize: () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        set({
          token,
          isAuthenticated: true,
          user: {
            id: decoded.sub || decoded.userId,
            tenantId: decoded.tenant_id || decoded.tenantId,
            role: decoded.role,
          },
        });
      } catch (e) {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },
}));

export default useAuthStore;
