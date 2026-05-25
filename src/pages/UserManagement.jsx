import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
  Shield,
  User as UserIcon,
  Mail,
  Lock,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser, disableUser, enableUser } from '@/api/user';
import { getErrorMessage } from '@/utils/error';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import useAuthStore from '@/store/authStore';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import ConfirmDialog from '@/components/ConfirmDialog';

const UserManagement = () => {
  const { user: currentUser } = useAuthStore();
  const isCompanyAdmin = currentUser?.role === 'ROLE_COMPANY_ADMIN';
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    role: 'ROLE_USER',
    enabled: true
  });

  useEffect(() => {
    if (currentUser?.role === 'ROLE_PLATFORM_ADMIN') {
      window.location.href = '/tenants';
    }
  }, [currentUser]);

  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const { data: usersData, isLoading: loading } = useQuery({
    queryKey: ['users', page, size],
    queryFn: () => getUsers({ page, size }),
    enabled: currentUser?.role !== 'ROLE_PLATFORM_ADMIN',
    placeholderData: keepPreviousData
  });

  const users = usersData?.content || [];

  useEffect(() => {
    if (usersData?.hasNext) {
      queryClient.prefetchQuery({
        queryKey: ['users', page + 1, size],
        queryFn: () => getUsers({ page: page + 1, size })
      });
    }
  }, [usersData, page, size, queryClient]);

  const filteredUsers = users.filter(user => String(user.id) !== String(currentUser?.id));

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingUser) {
        const updatePayload = { ...payload };
        if (!updatePayload.password) {
          delete updatePayload.password;
        }
        await updateUser(editingUser.id, updatePayload);
      } else {
        await createUser(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowAddForm(false);
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        role: 'ROLE_USER',
        enabled: true
      });
    },
    onError: (err) => {
      setError(getErrorMessage(err, 'Failed to save user'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (err) => {
      console.error('Failed to delete user:', err);
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, enabled }) => {
      if (enabled) {
        await disableUser(id);
      } else {
        await enableUser(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => {
      console.error('Failed to toggle status:', err);
      alert(err.response?.data?.message || 'Failed to change user status.');
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    saveMutation.mutate(formData);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      username: user.username || '',
      password: '',
      role: user.role || 'ROLE_USER',
      enabled: user.enabled !== undefined ? user.enabled : true
    });
    setShowAddForm(true);
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteMutation.mutate(itemToDelete);
  };

  const handleToggleClick = (user) => {
    setStatusTarget(user);
    setConfirmOpen(true);
  };

  const handleToggleConfirm = () => {
    if (!statusTarget) return;
    toggleStatusMutation.mutate({ id: statusTarget.id, enabled: statusTarget.enabled });
    setConfirmOpen(false);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_COMPANY_ADMIN':
        return <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">Admin</Badge>;
      case 'ROLE_ADMINISTRATOR':
        return <Badge className="bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">Manager</Badge>;
      case 'ROLE_SALES_OPERATOR':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">Sales</Badge>;
      default:
        return <Badge className="bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">User</Badge>;
    }
  };

  const isCreating = saveMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  if (showAddForm) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {editingUser ? 'Edit User' : 'New User'}
            </h1>
            <p className="text-slate-400 font-bold text-[13px] mt-1">
              {editingUser ? 'Update user details' : 'Invite a new team member'}
            </p>
          </div>
        </div>

        <Card className="border-none shadow-sm ring-1 ring-slate-200/60 overflow-hidden rounded-[32px]">
          <CardContent className="p-10">
            <form onSubmit={handleSave} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-bold animate-in shake duration-500 whitespace-pre-line">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Role</label>
                  <Select
                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                    value={formData.role}
                  >
                    <SelectTrigger className="h-14 bg-white border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                      <SelectItem value="ROLE_USER">USER</SelectItem>
                      <SelectItem value="ROLE_SALES_OPERATOR">ROLE_SALES_OPERATOR</SelectItem>
                      <SelectItem value="ROLE_ADMINISTRATOR">ROLE_ADMINISTRATOR</SelectItem>
                      <SelectItem value="ROLE_COMPANY_ADMIN">ROLE_COMPANY_ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
                  <Select
                    onValueChange={(val) => setFormData({ ...formData, enabled: val === 'true' })}
                    value={formData.enabled ? 'true' : 'false'}
                  >
                    <SelectTrigger className="h-14 bg-white border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  placeholder="First Name"
                  className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <Input
                  placeholder="Last Name"
                  className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

              <Input
                type="email"
                placeholder="Email"
                className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  placeholder="Username"
                  className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
                <Input
                  type="password"
                  placeholder={editingUser ? "Password (leave blank to keep current)" : "Password"}
                  className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black h-12 px-8 rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-70 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={18} className="mr-2" /> {editingUser ? 'Update User' : 'Create User'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 text-slate-500 font-bold h-12 px-8 rounded-xl"
                  onClick={() => { setShowAddForm(false); setEditingUser(null); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Users</h1>
            <p className="text-slate-400 font-bold text-[13px] mt-1">Manage team members and roles</p>
          </div>
        </div>
        {isCompanyAdmin && (
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white font-black h-12 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={18} className="mr-2" /> Add User
          </Button>
        )}
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/40">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-6 pl-10">User</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Email</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Username</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Role</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Status</TableHead>
                {isCompanyAdmin && <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pr-10">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-slate-50">
                    <TableCell colSpan={isCompanyAdmin ? 6 : 5} className="py-10"><div className="h-6 bg-slate-50 rounded-xl mx-8"></div></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, idx) => (
                  <TableRow key={user.id} className="border-slate-50 hover:bg-slate-50/30 transition-all group">
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl ${idx % 2 === 0 ? 'bg-orange-500' : 'bg-amber-500'} flex items-center justify-center text-white text-[14px] font-black shadow-lg shadow-orange-500/20`}>
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-[15px]">{user.firstName} {user.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[12px] text-slate-400 font-bold">{user.email}</TableCell>
                    <TableCell>
                      <span className="text-[11px] font-black text-slate-400 bg-slate-100/60 px-3 py-1 rounded-lg">
                        {user.username}
                      </span>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {isCompanyAdmin ? (
                        <button
                          onClick={() => handleToggleClick(user)}
                          disabled={toggleStatusMutation.isPending}
                          className="focus:outline-none disabled:opacity-50"
                          title="Click to toggle status"
                        >
                          {user.enabled ? (
                            <div className="inline-flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-all">
                              Active
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center gap-1.5 text-rose-600 font-bold text-[10px] bg-rose-50 px-3 py-1 rounded-full border border-rose-100 hover:bg-rose-100 transition-all">
                              Disabled
                            </div>
                          )}
                        </button>
                      ) : (
                        user.enabled ? (
                          <div className="inline-flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-[10px] bg-emerald-50/50 px-3 py-1 rounded-full border border-emerald-100/50">
                            Active
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-1.5 text-rose-600 font-bold text-[10px] bg-rose-50/50 px-3 py-1 rounded-full border border-rose-100/50">
                            Disabled
                          </div>
                        )
                      )}
                    </TableCell>
                    {isCompanyAdmin && (
                      <TableCell className="text-right pr-10">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-indigo-50 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 shadow-sm transition-transform active:scale-95"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-red-50 bg-red-50 text-red-400 hover:bg-red-100 shadow-sm transition-transform active:scale-95"
                            onClick={() => handleDeleteClick(user.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isCompanyAdmin ? 6 : 5} className="h-48 text-center text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
                    No members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            totalPages={usersData?.totalPages || 0}
            totalElements={usersData?.totalElements || 0}
            size={size}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete User?"
        description="This will permanently remove the user and revoke all permissions. This action cannot be undone."
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleToggleConfirm}
        title={statusTarget?.enabled ? 'Disable User?' : 'Enable User?'}
        description={
          statusTarget?.enabled
            ? `Are you sure you want to disable user "${statusTarget?.username || ''}"? They will lose access immediately.`
            : `Are you sure you want to enable user "${statusTarget?.username || ''}"?`
        }
        confirmText={statusTarget?.enabled ? 'Yes, disable' : 'Yes, enable'}
        cancelText="Cancel"
        variant={statusTarget?.enabled ? 'warning' : 'success'}
      />
    </div>
  );
};

export default UserManagement;
