import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, AlertCircle, Trash2, Ticket, PlusCircle, 
  XCircle, Bell, Info, X, ExternalLink, Clock
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
  actionUrl?: string;
  actionLabel?: string;
}

interface ToastItem extends AppNotification {
  progress: number;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (params: {
    title: string;
    message: string;
    type?: NotificationType;
    actionUrl?: string;
    actionLabel?: string;
  }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'cinepremium_notifications_v1';

const INITIAL_DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    title: 'Welcome to CinePremium',
    message: 'Browse live blockbuster movies, select auditorium halls, and reserve your VIP seats in real time.',
    type: 'info',
    timestamp: Date.now() - 1000 * 60 * 5,
    read: false,
    actionUrl: '/movies',
    actionLabel: 'Explore Movies'
  }
];

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
    return INITIAL_DEFAULT_NOTIFICATIONS;
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const navigate = useNavigate();

  // Save notifications to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to persist notifications:', e);
    }
  }, [notifications]);

  // Unread count computation
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Add a new notification and trigger a top-right popup toast
  const addNotification = useCallback((params: {
    title: string;
    message: string;
    type?: NotificationType;
    actionUrl?: string;
    actionLabel?: string;
  }) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: params.title,
      message: params.message,
      type: params.type || 'info',
      timestamp: Date.now(),
      read: false,
      actionUrl: params.actionUrl,
      actionLabel: params.actionLabel
    };

    // Prepend to persistent history
    setNotifications((prev) => [newNotif, ...prev]);

    // Add to active toast popup list
    const newToast: ToastItem = { ...newNotif, progress: 100 };
    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible toasts
  }, []);

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

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Timer for active toast popups
  useEffect(() => {
    if (toasts.length === 0) return;

    const interval = setInterval(() => {
      setToasts((prev) =>
        prev
          .map((toast) => ({
            ...toast,
            progress: toast.progress - 2.5 // Decrement progress
          }))
          .filter((toast) => toast.progress > 0)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [toasts.length]);

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

      {/* ── TOP-RIGHT CORNER TOAST POPUP CONTAINER ── */}
      <div 
        className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-full"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const config = getToastConfig(toast.type);
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              onClick={() => {
                markAsRead(toast.id);
                if (toast.actionUrl) {
                  dismissToast(toast.id);
                  navigate(toast.actionUrl);
                }
              }}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl p-4 border ${config.border} ${config.bg} backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] animate-in slide-in-from-right-8 fade-in duration-300 transition-all hover:scale-[1.02] cursor-pointer group`}
            >
              {/* Glowing accent ambient blur */}
              <div className={`absolute -top-6 -right-6 w-20 h-20 ${config.glow} rounded-full blur-2xl pointer-events-none opacity-40`} />

              <div className="flex items-start gap-3.5 relative z-10">
                {/* Icon Badge */}
                <div className={`w-9 h-9 rounded-xl ${config.iconBg} ${config.iconText} border ${config.iconBorder} flex items-center justify-center shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Body Details */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-bold text-white text-xs sm:text-sm truncate">
                      {toast.title}
                    </h5>
                    <span className="text-[10px] text-[#908fa0] flex items-center gap-1 shrink-0 font-medium">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Just now</span>
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-[#dce1fb] mt-1 leading-relaxed line-clamp-2">
                    {toast.message}
                  </p>

                  {toast.actionUrl && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary group-hover:underline">
                      <span>{toast.actionLabel || 'View Details'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissToast(toast.id);
                  }}
                  className="p-1 text-[#908fa0] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Countdown Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                <div
                  className={`h-full ${config.barColor} transition-all ease-linear`}
                  style={{ width: `${Math.max(0, toast.progress)}%` }}
                />
              </div>
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

// Helper configuration for Toast UI styling
function getToastConfig(type: NotificationType) {
  switch (type) {
    case 'booking':
      return {
        bg: 'bg-[#0f1d1f]/95',
        border: 'border-emerald-500/40',
        glow: 'bg-emerald-500',
        iconBg: 'bg-emerald-500/20',
        iconText: 'text-emerald-400',
        iconBorder: 'border-emerald-500/30',
        barColor: 'bg-emerald-400',
        icon: Ticket
      };
    case 'add':
      return {
        bg: 'bg-[#0f172a]/95',
        border: 'border-blue-500/40',
        glow: 'bg-blue-500',
        iconBg: 'bg-blue-500/20',
        iconText: 'text-blue-400',
        iconBorder: 'border-blue-500/30',
        barColor: 'bg-blue-400',
        icon: PlusCircle
      };
    case 'delete':
      return {
        bg: 'bg-[#1f0f15]/95',
        border: 'border-rose-500/40',
        glow: 'bg-rose-500',
        iconBg: 'bg-rose-500/20',
        iconText: 'text-rose-400',
        iconBorder: 'border-rose-500/30',
        barColor: 'bg-rose-400',
        icon: Trash2
      };
    case 'cancel':
      return {
        bg: 'bg-[#21130d]/95',
        border: 'border-amber-500/40',
        glow: 'bg-amber-500',
        iconBg: 'bg-amber-500/20',
        iconText: 'text-amber-400',
        iconBorder: 'border-amber-500/30',
        barColor: 'bg-amber-400',
        icon: XCircle
      };
    case 'success':
      return {
        bg: 'bg-[#0e1e17]/95',
        border: 'border-emerald-500/40',
        glow: 'bg-emerald-500',
        iconBg: 'bg-emerald-500/20',
        iconText: 'text-emerald-400',
        iconBorder: 'border-emerald-500/30',
        barColor: 'bg-emerald-400',
        icon: CheckCircle2
      };
    case 'error':
      return {
        bg: 'bg-[#220d13]/95',
        border: 'border-red-500/40',
        glow: 'bg-red-500',
        iconBg: 'bg-red-500/20',
        iconText: 'text-red-400',
        iconBorder: 'border-red-500/30',
        barColor: 'bg-red-500',
        icon: AlertCircle
      };
    case 'info':
    default:
      return {
        bg: 'bg-[#0c1324]/95',
        border: 'border-indigo-500/40',
        glow: 'bg-indigo-500',
        iconBg: 'bg-indigo-500/20',
        iconText: 'text-indigo-400',
        iconBorder: 'border-indigo-500/30',
        barColor: 'bg-indigo-400',
        icon: Bell
      };
  }
}
