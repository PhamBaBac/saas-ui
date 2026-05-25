import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Handshake,
  Plus,
  Edit2,
  Trash2,
  Check,
  Loader2,
  Search,
  Mail,
  Phone,
  MapPin,
  FileText,
  Building2,
  UserCheck
} from 'lucide-react';
import { getPartners, createPartner, updatePartner, deletePartner } from '@/api/partner';
import { getErrorMessage } from '@/utils/error';
import useAuthStore from '@/store/authStore';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '@/components/ConfirmDialog';

const PartnerManagement = () => {
  const { user: currentUser } = useAuthStore();
  const canCreateOrEdit = currentUser?.role === 'ROLE_COMPANY_ADMIN' || currentUser?.role === 'ROLE_ADMINISTRATOR';
  const canDelete = currentUser?.role === 'ROLE_COMPANY_ADMIN';
  const hasActions = canCreateOrEdit || canDelete;

  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'SUPPLIER' | 'CUSTOMER'

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'SUPPLIER',
    email: '',
    phoneNumber: '',
    taxId: '',
    address: ''
  });

  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const { data: partnersData, isLoading: loading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => getPartners({ size: 1000 }),
    placeholderData: keepPreviousData
  });

  const partners = partnersData?.content || [];

  useEffect(() => {
    setPage(0);
  }, [activeTab, searchTerm]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingPartner) {
        await updatePartner(editingPartner.id, payload);
      } else {
        await createPartner(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setShowAddForm(false);
      setEditingPartner(null);
      setFormData({
        name: '',
        type: 'SUPPLIER',
        email: '',
        phoneNumber: '',
        taxId: '',
        address: ''
      });
    },
    onError: (err) => {
      setError(getErrorMessage(err, 'Failed to save partner'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setDeleteDialogOpen(false);
      setPartnerToDelete(null);
    },
    onError: (err) => {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete partner.');
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    saveMutation.mutate(formData);
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name || '',
      type: partner.type || 'SUPPLIER',
      email: partner.email || '',
      phoneNumber: partner.phoneNumber || '',
      taxId: partner.taxId || '',
      address: partner.address || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteClick = (partner) => {
    setPartnerToDelete(partner);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!partnerToDelete) return;
    deleteMutation.mutate(partnerToDelete.id);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = partners.length;
    const suppliers = partners.filter(p => p.type === 'SUPPLIER').length;
    const customers = partners.filter(p => p.type === 'CUSTOMER').length;
    return { total, suppliers, customers };
  }, [partners]);

  // Filtered partners list
  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const matchesTab = activeTab === 'ALL' || partner.type === activeTab;
      const matchesSearch = 
        partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.taxId?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [partners, activeTab, searchTerm]);

  // Paginated partners list (client-side)
  const paginatedPartners = useMemo(() => {
    const start = page * size;
    return filteredPartners.slice(start, start + size);
  }, [filteredPartners, page, size]);

  const isSaving = saveMutation.isPending;

  if (showAddForm) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Handshake size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {editingPartner ? 'Edit Partner' : 'New Partner'}
            </h1>
            <p className="text-slate-400 font-bold text-[13px] mt-1">
              {editingPartner ? 'Update partner profile details' : 'Register a new supplier or customer'}
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
                <div className="space-y-2">
                  <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Partner Name</label>
                  <Input
                    placeholder="e.g. ABC Trading Co."
                    className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-indigo-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Partner Type</label>
                  <Select
                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                    value={formData.type}
                  >
                    <SelectTrigger className="h-14 bg-white border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                      <SelectItem value="SUPPLIER">Supplier (Nhà cung cấp)</SelectItem>
                      <SelectItem value="CUSTOMER">Customer (Khách hàng)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                  <Input
                    type="email"
                    placeholder="e.g. contact@domain.com"
                    className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-indigo-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <Input
                    placeholder="e.g. +84 901234567"
                    className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-indigo-500"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Tax ID</label>
                  <Input
                    placeholder="e.g. 0102030405"
                    className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-indigo-500"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Address</label>
                <Textarea
                  placeholder="Street name, City, Country..."
                  className="bg-white border-slate-200 rounded-xl focus-visible:ring-indigo-500 min-h-[100px]"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-12 px-8 rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-70 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={18} className="mr-2" /> {editingPartner ? 'Update Partner' : 'Create Partner'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 text-slate-500 font-bold h-12 px-8 rounded-xl"
                  onClick={() => { setShowAddForm(false); setEditingPartner(null); }}
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Handshake size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Partners</h1>
            <p className="text-slate-400 font-bold text-[13px] mt-1">Manage organization suppliers and customers</p>
          </div>
        </div>
        {canCreateOrEdit && (
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-12 px-6 rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={18} className="mr-2" /> Add Partner
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Partners', value: stats.total, color: 'text-indigo-600', icon: <Handshake size={22} />, bg: 'bg-indigo-500/10' },
          { label: 'Suppliers (Nhà cung cấp)', value: stats.suppliers, color: 'text-blue-600', icon: <Building2 size={22} />, bg: 'bg-blue-500/10' },
          { label: 'Customers (Khách hàng)', value: stats.customers, color: 'text-emerald-600', icon: <UserCheck size={22} />, bg: 'bg-emerald-500/10' },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200/60 overflow-hidden hover:ring-indigo-500/10 transition-all duration-300">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                <div className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{item.value}</div>
              </div>
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center`}>
                {item.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Tabs */}
        <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Partners' },
            { id: 'SUPPLIER', label: 'Suppliers' },
            { id: 'CUSTOMER', label: 'Customers' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none px-4 py-2 text-[12px] font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search partners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-slate-200 rounded-xl focus-visible:ring-indigo-500 w-full"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/40">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-6 pl-10">Name</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Type</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Contact</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Tax ID</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Address</TableHead>
                {hasActions && <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pr-10">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-slate-50">
                    <TableCell colSpan={hasActions ? 6 : 5} className="py-10"><div className="h-6 bg-slate-50 rounded-xl mx-8"></div></TableCell>
                  </TableRow>
                ))
              ) : paginatedPartners.length > 0 ? (
                paginatedPartners.map((partner, idx) => (
                  <TableRow key={partner.id} className="border-slate-50 hover:bg-slate-50/30 transition-all group">
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl ${partner.type === 'SUPPLIER' ? 'bg-blue-50 text-blue-600 shadow-blue-500/10' : 'bg-emerald-50 text-emerald-600 shadow-emerald-500/10'} flex items-center justify-center shadow-sm`}>
                          {partner.type === 'SUPPLIER' ? <Building2 size={18} /> : <UserCheck size={18} />}
                        </div>
                        <span className="font-bold text-slate-800 text-[15px]">{partner.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {partner.type === 'SUPPLIER' ? (
                        <Badge className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          Supplier
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          Customer
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-[13px] text-slate-500">
                        {partner.email && (
                          <div className="flex items-center gap-1.5 font-medium">
                            <Mail size={13} className="text-slate-400 shrink-0" />
                            <span>{partner.email}</span>
                          </div>
                        )}
                        {partner.phoneNumber && (
                          <div className="flex items-center gap-1.5 font-medium">
                            <Phone size={13} className="text-slate-400 shrink-0" />
                            <span>{partner.phoneNumber}</span>
                          </div>
                        )}
                        {!partner.email && !partner.phoneNumber && <span className="italic text-slate-400">No contact info</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-[12px] font-bold text-slate-400">
                      {partner.taxId ? (
                        <span className="bg-slate-100/60 px-3 py-1 rounded-lg">
                          {partner.taxId}
                        </span>
                      ) : (
                        <span className="italic text-slate-300 font-medium">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[13px] text-slate-500 max-w-xs truncate font-medium">
                      {partner.address ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{partner.address}</span>
                        </div>
                      ) : (
                        <span className="italic text-slate-300 font-medium">No address</span>
                      )}
                    </TableCell>
                    {hasActions && (
                      <TableCell className="text-right pr-10">
                        <div className="flex justify-end gap-2">
                          {canCreateOrEdit && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-xl border-indigo-50 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 shadow-sm transition-transform active:scale-95"
                              onClick={() => handleEdit(partner)}
                            >
                              <Edit2 size={16} />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-xl border-red-50 bg-red-50 text-red-400 hover:bg-red-100 shadow-sm transition-transform active:scale-95"
                              onClick={() => handleDeleteClick(partner)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={hasActions ? 6 : 5} className="h-48 text-center text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
                    No partners found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            totalPages={Math.ceil(filteredPartners.length / size)}
            totalElements={filteredPartners.length}
            size={size}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Partner?"
        description={`Are you sure you want to permanently delete partner "${partnerToDelete?.name || ''}"? This action cannot be undone.`}
        confirmText="Yes, delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default PartnerManagement;
