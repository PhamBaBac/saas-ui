import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Activity,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Check,
  Loader2,
  Package,
  Calendar,
  FileText,
  Trash2,
  Edit2
} from 'lucide-react';
import { getStockMovements, createStockMovement, updateStockMovement, deleteStockMovement } from '@/api/stock';
import { getProducts } from '@/api/product';
import { getPartners } from '@/api/partner';
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
import { Textarea } from '@/components/ui/textarea';
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

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const StockMovementManagement = () => {
  const { user: currentUser } = useAuthStore();
  const canRecord = currentUser?.role === 'ROLE_COMPANY_ADMIN' || 
                    currentUser?.role === 'ROLE_ADMINISTRATOR' || 
                    currentUser?.role === 'ROLE_SALES_OPERATOR';
  const canDelete = currentUser?.role === 'ROLE_COMPANY_ADMIN';
  const canEdit = currentUser?.role === 'ROLE_COMPANY_ADMIN' || 
                  currentUser?.role === 'ROLE_ADMINISTRATOR';

  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    productId: '',
    partnerId: '',
    quantity: '',
    typeMvt: 'IN',
    comment: '',
    dateMvt: new Date().toISOString().split('T')[0] // Default to today
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const { data: movementsData, isLoading: movementsLoading } = useQuery({
    queryKey: ['stocks', page, size],
    queryFn: () => getStockMovements({ page, size }),
    placeholderData: keepPreviousData
  });

  const movements = movementsData?.content || [];

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 100],
    queryFn: () => getProducts({ size: 100 })
  });

  const products = productsData?.content || [];

  const { data: partnersData, isLoading: partnersLoading } = useQuery({
    queryKey: ['partners', 100],
    queryFn: () => getPartners({ size: 100 })
  });

  const partners = partnersData?.content || [];

  const loading = movementsLoading || productsLoading || partnersLoading;

  useEffect(() => {
    if (movementsData?.hasNext) {
      queryClient.prefetchQuery({
        queryKey: ['stocks', page + 1, size],
        queryFn: () => getStockMovements({ page: page + 1, size })
      });
    }
  }, [movementsData, page, size, queryClient]);

  const filteredPartnersForForm = useMemo(() => {
    return partners.filter(p => p.type === (formData.typeMvt === 'IN' ? 'SUPPLIER' : 'CUSTOMER'));
  }, [partners, formData.typeMvt]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingMovement) {
        await updateStockMovement(editingMovement.id, payload);
      } else {
        await createStockMovement(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowAddForm(false);
      setEditingMovement(null);
      setFormData({
        productId: '',
        partnerId: '',
        quantity: '',
        typeMvt: 'IN',
        comment: '',
        dateMvt: new Date().toISOString().split('T')[0]
      });
    },
    onError: (err) => {
      setError(getErrorMessage(err, 'Failed to record stock movement'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStockMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (err) => {
      console.error('Failed to delete movement:', err);
      alert(err.response?.data?.message || 'Failed to delete movement.');
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    setError('');

    // Clean up payload
    const payload = {
      productId: formData.productId,
      partnerId: formData.partnerId && formData.partnerId !== 'no-partner' ? formData.partnerId : null,
      quantity: parseInt(formData.quantity),
      typeMvt: formData.typeMvt,
      comment: formData.comment || '', // Ensure it's at least an empty string
      dateMvt: formData.dateMvt
    };

    if (!payload.productId || isNaN(payload.quantity)) {
      setError('Please select a product and enter a valid quantity.');
      return;
    }

    // Check for sufficient stock if it's an OUT movement
    if (payload.typeMvt === 'OUT') {
      const selectedProduct = products.find(p => p.id.toString() === payload.productId.toString());
      if (selectedProduct) {
        let simulatedStock = selectedProduct.availableQuantity;
        if (editingMovement && editingMovement.productId?.toString() === payload.productId.toString()) {
          if (editingMovement.typeMvt === 'OUT') {
            simulatedStock += editingMovement.quantity;
          } else if (editingMovement.typeMvt === 'IN') {
            simulatedStock -= editingMovement.quantity;
          }
        }
        if (payload.quantity > simulatedStock) {
          setError(`Insufficient stock! Re-calculating with other transactions leaves ${simulatedStock} units available for this product.`);
          return;
        }
      }
    }

    saveMutation.mutate(payload);
  };

  const handleEdit = (mov) => {
    setEditingMovement(mov);
    setFormData({
      productId: mov.productId?.toString() || '',
      partnerId: mov.partnerId?.toString() || '',
      quantity: mov.quantity.toString(),
      typeMvt: mov.typeMvt || 'IN',
      comment: mov.comment || '',
      dateMvt: mov.dateMvt ? mov.dateMvt.split('T')[0] : new Date().toISOString().split('T')[0]
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

  const isSaving = saveMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  if (showAddForm) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {editingMovement ? 'Edit Movement' : 'Record Movement'}
            </h1>
            <p className="text-slate-400 font-bold text-[13px] mt-1">
              {editingMovement ? 'Modify the details of this stock transaction' : 'Add a new stock inbound or outbound transaction'}
            </p>
          </div>
        </div>

        <Card className="border-none shadow-sm ring-1 ring-slate-200/60 overflow-hidden rounded-[32px]">
          <CardContent className="p-10">
            <form onSubmit={handleSave} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-bold whitespace-pre-line">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest">Product</label>
                      {formData.productId && (
                        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase tracking-tighter">
                          Current Stock: {products.find(p => p.id.toString() === formData.productId.toString())?.availableQuantity || 0}
                        </span>
                      )}
                    </div>
                    <Select
                      onValueChange={(val) => setFormData({ ...formData, productId: val })}
                      value={formData.productId}
                    >
                      <SelectTrigger className="h-14 bg-white border-slate-200 rounded-xl focus:ring-emerald-500">
                        <SelectValue placeholder="Select product to update" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        {products
                          .filter(prod => prod.active || prod.id.toString() === formData.productId.toString())
                          .map(prod => (
                            <SelectItem key={prod.id} value={prod.id.toString()}>
                              {prod.name} ({prod.reference}) - Stock: {prod.availableQuantity}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                      <Select
                        onValueChange={(val) => setFormData({ ...formData, typeMvt: val, partnerId: '' })}
                        value={formData.typeMvt}
                      >
                        <SelectTrigger className="h-14 bg-white border-slate-200 rounded-xl">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                          <SelectItem value="IN">STOCK IN (Nhập)</SelectItem>
                          <SelectItem value="OUT">STOCK OUT (Xuất)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        required
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Movement Date</label>
                      <Input
                        type="date"
                        className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500"
                        value={formData.dateMvt}
                        onChange={(e) => setFormData({ ...formData, dateMvt: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        {formData.typeMvt === 'IN' ? 'Supplier (Nhà CC)' : 'Customer (Khách hàng)'}
                      </label>
                      <Select
                        onValueChange={(val) => setFormData({ ...formData, partnerId: val })}
                        value={formData.partnerId}
                      >
                        <SelectTrigger className="h-14 bg-white border-slate-200 rounded-xl focus:ring-emerald-500">
                          <SelectValue placeholder={formData.typeMvt === 'IN' ? 'Select Supplier' : 'Select Customer'} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                          <SelectItem value="no-partner">-- No Partner --</SelectItem>
                          {filteredPartnersForForm.map(part => (
                            <SelectItem key={part.id} value={part.id.toString()}>
                              {part.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Movement Notes (Comment)</label>
                    <Textarea
                      placeholder="e.g. Restocking from supplier, Sales order #123..."
                      className="bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500 min-h-[120px]"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 px-8 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-70"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check size={18} className="mr-2" />}
                  Submit Transaction
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 text-slate-500 font-bold h-12 px-8 rounded-xl"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMovement(null);
                    setFormData({
                      productId: '',
                      partnerId: '',
                      quantity: '',
                      typeMvt: 'IN',
                      comment: '',
                      dateMvt: new Date().toISOString().split('T')[0]
                    });
                  }}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Stock Movements</h1>
            <p className="text-slate-400 font-bold text-[13px] mt-1">Track every inbound and outbound item in real-time</p>
          </div>
        </div>
        {canRecord && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 px-6 rounded-xl shadow-lg shadow-emerald-500/20"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={18} className="mr-2" /> New Movement
          </Button>
        )}
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60 overflow-hidden bg-white">
        <CardContent className="p-0 bg-white">
          <Table>
            <TableHeader className="bg-white border-b border-slate-100">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-6 pl-10">Product</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Type</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Partner</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Qty</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Comment</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Date</TableHead>
                {(canEdit || canDelete) && <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pr-10">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-slate-50">
                    <TableCell colSpan={(canEdit || canDelete) ? 7 : 6} className="py-10"><div className="h-6 bg-slate-50 rounded-xl mx-8"></div></TableCell>
                  </TableRow>
                ))
              ) : movements.length > 0 ? (
                movements.map((mov) => (
                  <TableRow key={mov.id} className="border-slate-50 hover:bg-slate-50/30 transition-all group">
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center">
                          <Package size={16} />
                        </div>
                        <span className="font-bold text-slate-800 text-[14px]">{mov.productName || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {mov.typeMvt === 'IN' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 w-fit">
                          <ArrowUpCircle size={14} /> IN
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-600 font-bold text-[10px] bg-red-50 px-3 py-1 rounded-full border border-red-100 w-fit">
                          <ArrowDownCircle size={14} /> OUT
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {mov.partnerName ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-bold text-slate-700">{mov.partnerName}</span>
                          <Badge variant="outline" className="text-[8px] px-1 py-0 rounded font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-slate-200">
                            {mov.typeMvt === 'IN' ? 'Supplier' : 'Customer'}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[12px] font-medium">No partner</span>
                      )}
                    </TableCell>
                    <TableCell className={`font-black text-[14px] ${mov.typeMvt === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {mov.typeMvt === 'IN' ? '+' : '-'}{mov.quantity}
                    </TableCell>
                    <TableCell className="text-[12px] text-slate-500 max-w-[200px] truncate">
                      {mov.comment || '-'}
                    </TableCell>
                    <TableCell className="text-[11px] font-bold text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {formatDate(mov.dateMvt)}
                      </div>
                    </TableCell>
                    {(canEdit || canDelete) && (
                      <TableCell className="text-right pr-10">
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl border-blue-50 bg-blue-50 text-blue-500 hover:bg-blue-100 shadow-sm transition-transform active:scale-95"
                              onClick={() => handleEdit(mov)}
                            >
                              <Edit2 size={16} strokeWidth={3} />
                            </Button>
                          )}
                          {canDelete && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl border-red-50 bg-red-50 text-red-400 hover:bg-red-100 shadow-sm transition-transform active:scale-95"
                              onClick={() => handleDeleteClick(mov.id)}
                            >
                              <Trash2 size={16} strokeWidth={3} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={(canEdit || canDelete) ? 7 : 6} className="h-48 text-center text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
                    No movements found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            totalPages={movementsData?.totalPages || 0}
            totalElements={movementsData?.totalElements || 0}
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
        title="Delete Record?"
        description="This will permanently remove the movement record. Note: This will NOT automatically reverse the stock quantity change."
      />
    </div>
  );
};

export default StockMovementManagement;
