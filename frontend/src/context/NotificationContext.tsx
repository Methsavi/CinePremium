import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, AlertCircle, Trash2, Ticket, PlusCircle, 
  XCircle, Bell, X, Check
} from 'lucide-react';

export type NotificationType = 
  | 'success' 
  | 'booking' 
  | 'add' 
  | 'delete' 
  | 'cancel' 
  | 'error' 
  | 'info';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
}

interface ToastItem {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (params: {
    title?: string;
    message?: string;
    type?: NotificationType;
    actionUrl?: string;
    actionLabel?: string;
  } | string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'cinepremium_notifications_v1';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load notifications from localStorage:', e);
    }
    return [];
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Save persistent history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to persist notifications:', e);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Add notification function
  const addNotification = useCallback((params: {
    title?: string;
    message?: string;
    type?: NotificationType;
    actionUrl?: string;
    actionLabel?: string;
  } | string) => {
    let text = '';
    let notifType: NotificationType = 'success';

    if (typeof params === 'string') {
      text = params;
    } else {
      text = params.message || params.title || 'Action Completed';
      notifType = params.type || 'success';
    }

    // Keep notification text simple & concise
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const newNotif: AppNotification = {
      id,
      title: text,
      message: text,
      type: notifType,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev].slice(0, 30));

    // Add toast to top right
    const newToast: ToastItem = {
      id,
      message: text,
      type: notifType
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 4));

    // Auto dismiss toast after 2.8 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 2800);
  }, [dismissToast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll
      }}
    >
      {children}

      {/* ── SIMPLE TOP-RIGHT CORNER TOAST CONTAINER ── */}
      <div 
        className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-xs sm:max-w-sm w-full"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const config = getToastConfig(toast.type);
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border ${config.border} ${config.bg} backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-6 fade-in duration-200 transition-all`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-xl ${config.iconBg} ${config.iconText} border ${config.iconBorder} flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-white truncate">
                  {toast.message}
                </span>
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 text-[#908fa0] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
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

// Simple icon and theme mapping
function getToastConfig(type: NotificationType) {
  switch (type) {
    case 'booking':
      return {
        bg: 'bg-[#0a1b18]/95',
        border: 'border-emerald-500/40',
        iconBg: 'bg-emerald-500/20',
        iconText: 'text-emerald-400',
        iconBorder: 'border-emerald-500/30',
        icon: Ticket
      };
    case 'add':
      return {
        bg: 'bg-[#1a080c]/95',
        border: 'border-red-500/40',
        iconBg: 'bg-red-500/20',
        iconText: 'text-red-400',
        iconBorder: 'border-red-500/30',
        icon: CheckCircle2
      };
    case 'delete':
      return {
        bg: 'bg-[#1f0d14]/95',
        border: 'border-rose-500/40',
        iconBg: 'bg-rose-500/20',
        iconText: 'text-rose-400',
        iconBorder: 'border-rose-500/30',
        icon: Trash2
      };
    case 'cancel':
      return {
        bg: 'bg-[#1f130b]/95',
        border: 'border-amber-500/40',
        iconBg: 'bg-amber-500/20',
        iconText: 'text-amber-400',
        iconBorder: 'border-amber-500/30',
        icon: XCircle
      };
    case 'error':
      return {
        bg: 'bg-[#200c12]/95',
        border: 'border-red-500/40',
        iconBg: 'bg-red-500/20',
        iconText: 'text-red-400',
        iconBorder: 'border-red-500/30',
        icon: AlertCircle
      };
    case 'success':
    default:
      return {
        bg: 'bg-[#0a1a15]/95',
        border: 'border-emerald-500/40',
        iconBg: 'bg-emerald-500/20',
        iconText: 'text-emerald-400',
        iconBorder: 'border-emerald-500/30',
        icon: CheckCircle2
      };
  }
}
