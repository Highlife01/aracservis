import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  durationMs?: number;
}

interface NotificationContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showToast = ({ type, title, description, durationMs = 4000 }: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, description, durationMs }]);

    setTimeout(() => {
      removeToast(id);
    }, durationMs);
  };

  const showSuccess = (title: string, description?: string) => showToast({ type: 'SUCCESS', title, description });
  const showError = (title: string, description?: string) => showToast({ type: 'ERROR', title, description });
  const showWarning = (title: string, description?: string) => showToast({ type: 'WARNING', title, description });
  const showInfo = (title: string, description?: string) => showToast({ type: 'INFO', title, description });

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              toast.type === 'SUCCESS'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100'
                : toast.type === 'WARNING'
                ? 'bg-amber-950/90 border-amber-500/30 text-amber-100'
                : toast.type === 'ERROR'
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-100'
                : 'bg-slate-900/90 border-slate-700 text-slate-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'ERROR' && <XCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'INFO' && <Info className="w-5 h-5 text-sky-400" />}
            </div>

            <div className="flex-1">
              <div className="font-semibold text-sm">{toast.title}</div>
              {toast.description && (
                <div className="text-xs mt-0.5 opacity-90 leading-relaxed">{toast.description}</div>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors shrink-0 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
