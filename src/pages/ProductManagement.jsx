import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  Loader2,
  Search,
  ChevronRight,
  Box,
  DollarSign,
  Layers,
  AlertCircle
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct, updateProductStatus } from '@/api/product';
import { getCategories } from '@/api/category';
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
import { Progress } from '@/components/ui/progress';
import useAuthStore from '@/store/authStore';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

const ProductManagement = () => {
  const { user: currentUser } = useAuthStore();
  const canCreateOrEdit = currentUser?.role === 'ROLE_COMPANY_ADMIN' || currentUser?.role === 'ROLE_ADMINISTRATOR';
  const canDelete = currentUser?.role === 'ROLE_COMPANY_ADMIN';
  const hasActions = canCreateOrEdit || canDelete;

  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    description: '',
    price: '',
    alertThreshold: '10',
    categoryId: '',
    active: true
  });

  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', page, size],
    queryFn: () => getProducts({ page, size }),
    placeholderData: keepPreviousData
  });

  const products = productsData?.content || [];

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', 100],
    queryFn: () => getCategories({ size: 100 })
  });

  const categories = categoriesData?.content || [];

  const loading = productsLoading || categoriesLoading;

  useEffect(() => {
    if (productsData?.hasNext) {
      queryClient.prefetchQuery({
        queryKey: ['products', page + 1, size],
        queryFn: () => getProducts({ page: page + 1, size })
      });
    }
  }, [productsData, page, size, queryClient]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowAddForm(false);
      setEditingProduct(null);
      setFormData({ name: '', reference: '', description: '', price: '', alertThreshold: '10', categoryId: '', active: true });
    },
    onError: (err) => {
      setError(getErrorMessage(err, 'Failed to save product'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (err) => {
      console.error('Failed to delete product:', err);
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, active }) => updateProductStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      alert(getErrorMessage(err, 'Failed to update product status'));
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    saveMutation.mutate(formData);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      reference: product.reference,
      description: product.description || '',
      price: product.price.toString(),
      alertThreshold: product.alertThreshold.toString(),
      categoryId: product.categoryId?.toString() || '',
      active: product.active ?? true
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

  const toggleStatus = (product) => {
    statusMutation.mutate({ id: product.id, active: !product.active });
  };

  const isSaving = saveMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  if (showAddForm) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h1>
            <p className="text-slate-400 font-bold text-[13px] mt-1">Fill in the details for your new inventory item</p>
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
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Product Name</label>
                    <Input
                      placeholder="e.g. Wireless Mouse"
                      className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Product Reference (SKU)</label>
                    <Input
                      placeholder="e.g. MOUSE-001"
                      className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                    <Select
                      onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                      value={formData.categoryId}
                    >
                      <SelectTrigger className="h-14 bg-white border-slate-200 rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Price ($)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Min Alert Level</label>
                      <Input
                        type="number"
                        placeholder="10"
                        className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500"
                        value={formData.alertThreshold}
                        onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
                    <Select
                      onValueChange={(val) => setFormData({ ...formData, active: val === 'true' })}
                      value={formData.active ? 'true' : 'false'}
                    >
                      <SelectTrigger className="h-14 bg-white border-slate-200 rounded-xl focus:ring-blue-500">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        <SelectItem value="true">Active (Đang hoạt động)</SelectItem>
                        <SelectItem value="false">Inactive (Ngừng hoạt động)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                    <Textarea
                      placeholder="Product details..."
                      className="bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500 min-h-[120px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-8 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-70"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check size={18} className="mr-2" />}
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 text-slate-500 font-bold h-12 px-8 rounded-xl"
                  onClick={() => { setShowAddForm(false); setEditingProduct(null); }}
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
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Products</h1>
            <p className="text-slate-400 font-bold text-[13px] mt-1">Manage your inventory items and stock levels</p>
          </div>
        </div>
        {canCreateOrEdit && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-6 rounded-xl shadow-lg shadow-blue-500/20"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={18} className="mr-2" /> Add Product
          </Button>
        )}
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60 overflow-hidden bg-white">
        <CardContent className="p-0 bg-white">
          <Table>
            <TableHeader className="bg-white border-b border-slate-100">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-6 pl-10">Product Info</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-6">Category</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-6">Price</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-6">Stock</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-6">Status</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-6">Stock Status</TableHead>
                {hasActions && <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pr-10">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-slate-50">
                    <TableCell colSpan={hasActions ? 7 : 6} className="py-10"><div className="h-6 bg-slate-50 rounded-xl mx-8"></div></TableCell>
                  </TableRow>
                ))
              ) : products.length > 0 ? (
                products.map((prod) => (
                  <TableRow key={prod.id} className="border-slate-50 hover:bg-slate-50/30 transition-all group">
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                          <Box size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[15px]">{prod.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{prod.reference}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">
                        {prod.categoryName || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-black text-slate-900 text-[14px] px-6">
                      ${prod.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-black text-slate-600 px-6">
                      {prod.availableQuantity}
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex flex-col gap-1.5 w-fit">
                        {prod.active ? (
                          <button 
                            disabled={!canCreateOrEdit || statusMutation.isPending}
                            onClick={() => canCreateOrEdit && toggleStatus(prod)}
                            className={`inline-flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 min-w-[90px] ${canCreateOrEdit ? 'hover:bg-emerald-100 hover:border-emerald-200 cursor-pointer transition-colors active:scale-95' : 'cursor-default'}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </button>
                        ) : (
                          <button 
                            disabled={!canCreateOrEdit || statusMutation.isPending}
                            onClick={() => canCreateOrEdit && toggleStatus(prod)}
                            className={`inline-flex items-center justify-center gap-1.5 text-slate-500 font-bold text-[10px] bg-slate-50 px-3 py-1 rounded-full border border-slate-200 min-w-[90px] ${canCreateOrEdit ? 'hover:bg-slate-200 hover:border-slate-300 cursor-pointer transition-colors active:scale-95' : 'cursor-default'}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactive
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex flex-col gap-1.5 w-fit">
                        {prod.availableQuantity <= prod.alertThreshold ? (
                          <div className="inline-flex items-center justify-center gap-1.5 text-amber-600 font-bold text-[10px] bg-amber-50 px-3 py-1 rounded-full border border-amber-100 min-w-[90px]">
                            <AlertCircle size={12} /> Low Stock
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-1.5 text-blue-600 font-bold text-[10px] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 min-w-[90px]">
                            <Check size={12} /> In Stock
                          </div>
                        )}
                      </div>
                    </TableCell>
                    {hasActions && (
                      <TableCell className="text-right pr-10">
                        <div className="flex justify-end gap-2">
                          {canCreateOrEdit && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl border-blue-50 bg-blue-50 text-blue-500 hover:bg-blue-100 shadow-sm transition-transform active:scale-95"
                              onClick={() => handleEdit(prod)}
                            >
                              <Edit2 size={16} strokeWidth={3} />
                            </Button>
                          )}
                          {canDelete && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl border-red-50 bg-red-50 text-red-400 hover:bg-red-100 shadow-sm transition-transform active:scale-95"
                              onClick={() => handleDeleteClick(prod.id)}
                            >
                              <Trash2 size={18} strokeWidth={2.5} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={hasActions ? 7 : 6} className="h-48 text-center text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            totalPages={productsData?.totalPages || 0}
            totalElements={productsData?.totalElements || 0}
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
        title="Delete Product?"
        description="This will permanently remove the product from your inventory. This action cannot be undone."
      />
    </div>
  );
};

export default ProductManagement;
