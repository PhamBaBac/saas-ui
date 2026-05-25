import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { 
  Tags, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Loader2,
  Search,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/category';
import { getErrorMessage } from '@/utils/error';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/Pagination';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
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

const CategoryManagement = () => {
  const { user: currentUser } = useAuthStore();
  const canCreateOrEdit = currentUser?.role === 'ROLE_COMPANY_ADMIN' || currentUser?.role === 'ROLE_ADMINISTRATOR';
  const canDelete = currentUser?.role === 'ROLE_COMPANY_ADMIN';
  const hasActions = canCreateOrEdit || canDelete;

  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const { data: categoriesData, isLoading: loading } = useQuery({
    queryKey: ['categories', page, size],
    queryFn: () => getCategories({ page, size }),
    placeholderData: keepPreviousData
  });

  const categories = categoriesData?.content || [];

  useEffect(() => {
    if (categoriesData?.hasNext) {
      queryClient.prefetchQuery({
        queryKey: ['categories', page + 1, size],
        queryFn: () => getCategories({ page: page + 1, size })
      });
    }
  }, [categoriesData, page, size, queryClient]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowAddForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    },
    onError: (err) => {
      setError(getErrorMessage(err, 'Failed to save category'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: () => {
      alert('Failed to delete category. It might be linked to products.');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    saveMutation.mutate(formData);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
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
          <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Tags size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h1>
            <p className="text-slate-400 font-bold text-[13px] mt-1">Organize your inventory with categories</p>
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
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Category Name</label>
                  <Input 
                    placeholder="e.g. Electronics, Furniture" 
                    className="h-14 bg-white border-slate-200 rounded-xl focus-visible:ring-purple-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                  <Textarea 
                    placeholder="Short description of this category..." 
                    className="bg-white border-slate-200 rounded-xl focus-visible:ring-purple-500 min-h-[120px]"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="bg-[#a855f7] hover:bg-[#9333ea] text-white font-black h-12 px-8 rounded-xl shadow-lg shadow-purple-500/20 disabled:opacity-70"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check size={18} className="mr-2" />}
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-slate-200 text-slate-500 font-bold h-12 px-8 rounded-xl"
                  onClick={() => { setShowAddForm(false); setEditingCategory(null); }}
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
          <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Tags size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Categories</h1>
            <p className="text-slate-400 font-bold text-[13px] mt-1">Manage your product classifications</p>
          </div>
        </div>
        {canCreateOrEdit && (
          <Button 
            className="bg-[#a855f7] hover:bg-[#9333ea] text-white font-black h-12 px-6 rounded-xl shadow-lg shadow-purple-500/20"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={18} className="mr-2" /> Add Category
          </Button>
        )}
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/40">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-6 pl-10">Category</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Description</TableHead>
                {hasActions && <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pr-10">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-slate-50">
                    <TableCell colSpan={hasActions ? 3 : 2} className="py-10"><div className="h-6 bg-slate-50 rounded-xl mx-8"></div></TableCell>
                  </TableRow>
                ))
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <TableRow key={cat.id} className="border-slate-50 hover:bg-slate-50/30 transition-all group">
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                          <FolderOpen size={18} />
                        </div>
                        <span className="font-bold text-slate-800 text-[15px]">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-slate-500 max-w-md truncate">
                      {cat.description || 'No description provided'}
                    </TableCell>
                    {hasActions && (
                      <TableCell className="text-right pr-10">
                        <div className="flex justify-end gap-2">
                          {canCreateOrEdit && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-9 w-9 rounded-xl border-purple-50 bg-purple-50 text-purple-500 hover:bg-purple-100 shadow-sm"
                              onClick={() => handleEdit(cat)}
                            >
                              <Edit2 size={16} />
                            </Button>
                          )}
                          {canDelete && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-9 w-9 rounded-xl border-red-50 bg-red-50 text-red-400 hover:bg-red-100 shadow-sm"
                              onClick={() => handleDeleteClick(cat.id)}
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
                  <TableCell colSpan={hasActions ? 3 : 2} className="h-48 text-center text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            totalPages={categoriesData?.totalPages || 0}
            totalElements={categoriesData?.totalElements || 0}
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
        title="Delete Category?"
        description="This will permanently remove the category. Any products currently linked to this category may become uncategorized."
      />
    </div>
  );
};

export default CategoryManagement;
