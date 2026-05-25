import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ConfirmDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'warning', // 'warning' | 'success' | 'danger' | 'info'
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return {
          headerBg: 'bg-emerald-50',
          iconColor: 'text-emerald-500',
          titleColor: 'text-emerald-900',
          descriptionColor: 'text-emerald-700/70',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100',
          icon: <CheckCircle2 size={32} strokeWidth={2.5} />,
        };
      case 'danger':
        return {
          headerBg: 'bg-red-50',
          iconColor: 'text-red-500',
          titleColor: 'text-red-900',
          descriptionColor: 'text-red-700/70',
          confirmBtn: 'bg-red-600 hover:bg-red-700 shadow-red-100',
          icon: <AlertTriangle size={32} strokeWidth={2.5} />,
        };
      case 'info':
        return {
          headerBg: 'bg-blue-50',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-900',
          descriptionColor: 'text-blue-700/70',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
          icon: <HelpCircle size={32} strokeWidth={2.5} />,
        };
      case 'warning':
      default:
        return {
          headerBg: 'bg-amber-50',
          iconColor: 'text-amber-500',
          titleColor: 'text-amber-900',
          descriptionColor: 'text-amber-700/70',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
          icon: <AlertTriangle size={32} strokeWidth={2.5} />,
        };
    }
  };

  const styles = getStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl rounded-[32px]">
        <div className={`${styles.headerBg} p-8 flex flex-col items-center justify-center space-y-4`}>
          <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center ${styles.iconColor} shadow-lg shadow-slate-100 ring-1 ring-slate-100/50 animate-in zoom-in duration-300`}>
            {styles.icon}
          </div>
          <div className="text-center space-y-2">
            <DialogTitle className={`text-2xl font-black ${styles.titleColor} tracking-tight`}>
              {title}
            </DialogTitle>
            <DialogDescription className={`${styles.descriptionColor} font-bold text-sm px-4`}>
              {description}
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
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 h-12 ${styles.confirmBtn} text-white font-black rounded-xl shadow-lg transition-all order-1 sm:order-2`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
