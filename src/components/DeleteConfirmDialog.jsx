import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const DeleteConfirmDialog = ({ isOpen, onOpenChange, onConfirm, title, description, isLoading }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl rounded-[32px]">
        <div className="bg-red-50 p-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-lg shadow-red-100 ring-1 ring-red-100 animate-in zoom-in duration-300">
            <Trash2 size={32} strokeWidth={2.5} />
          </div>
          <div className="text-center space-y-2">
            <DialogTitle className="text-2xl font-black text-red-900 tracking-tight">
              {title || 'Confirm Deletion'}
            </DialogTitle>
            <DialogDescription className="text-red-700/70 font-bold text-sm">
              {description || 'Are you sure you want to delete this item? This action cannot be undone and will permanently remove the data.'}
            </DialogDescription>
          </div>
        </div>

        <DialogFooter className="p-6 bg-white flex flex-col sm:flex-row gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 text-slate-500 font-bold hover:bg-slate-50 rounded-xl order-2 sm:order-1"
            disabled={isLoading}
          >
            Cancel, keep it
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg shadow-red-200 group transition-all order-1 sm:order-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Trash2 size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                Yes, delete it
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
