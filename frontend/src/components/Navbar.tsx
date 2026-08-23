import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, LogIn, UserPlus, LogOut, Ticket, Shield, 
  User as UserIcon, ChevronDown, Film, Info,
  Menu, X, Home, CreditCard, Bell,
  Sparkles, Clock
} from 'lucide-react';
import { USER_AVATAR } from '../data/movies';
import logo from '../assets/logo.png';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification, NotificationType } from '../context/NotificationContext';

interface NavbarProps {
  onBookNowClick?: () => void;
  onSearchClick?: () => void;
  onOpenMyTickets?: () => void;
}

function formatNotificationTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export const Navbar: React.FC<NavbarProps> = ({
  onBookNowClick,
  onSearchClick,
  onOpenMyTickets
}) => {
  const [activeTab, setActiveTab] = useState<'Home' | 'Movies' | 'About Us' | 'My bookings'>('Home');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotification();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Scroll listener to toggle compact/high-refraction liquid glass style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setIsNotificationOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        const el = event.target as HTMLElement;
        if (!el.closest('#mobile-menu-toggle')) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync tab active state with current location path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/about' || path === '/about-us') {
      setActiveTab('About Us');
    } else if (path === '/movies') {
      setActiveTab('Movies');
    } else if (path === '/my-bookings' || path === '/my-tickets') {
      setActiveTab('My bookings');
    } else if (path === '/') {
      setActiveTab('Home');
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
  };

  const handleHomeClick = () => {
    setActiveTab('Home');
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMoviesClick = () => {
    setActiveTab('Movies');
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/movies') {
      navigate('/movies');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAboutClick = () => {
    setActiveTab('About Us');
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/about' && location.pathname !== '/about-us') {
      navigate('/about');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMyBookingsClick = () => {
    setActiveTab('My bookings');
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/my-bookings') {
      navigate('/my-bookings');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchAction = () => {
    setIsMobileMenuOpen(false);
    if (onSearchClick) {
      onSearchClick();
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('search-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="fixed top-3 sm:top-5 inset-x-0 z-50 px-2 sm:px-6 pointer-events-none transition-all duration-300">
      <header
        className={`pointer-events-auto max-w-7xl mx-auto w-full relative transition-all duration-300 ease-out ${
          isScrolled
            ? 'liquid-glass-scrolled py-2 sm:py-2.5 px-3 sm:px-6 rounded-2xl md:rounded-full'
            : 'liquid-glass py-2.5 sm:py-3 px-3 sm:px-6 rounded-2xl md:rounded-full'
        }`}
      >
        {/* Specular Ambient Glow Overlay */}
        <div className="absolute -inset-[1px] rounded-2xl md:rounded-full bg-gradient-to-r from-primary/20 via-red-500/10 to-primary/20 blur-lg -z-10 opacity-70 pointer-events-none" />

        <div className="flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* ── 1. LOGO & NAME ── */}
          <div
            onClick={handleHomeClick}
            className="flex min-w-0 items-center gap-1.5 sm:gap-2.5 group cursor-pointer select-none"
          >
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl from-primary/25 to-inverse-primary/30 border border-primary/40 shadow-[0_0_15px_rgba(229,9,20,0.25)] transition-all duration-200">
              <img src={logo} alt="CinePremium" className="w-full h-full rounded-xl object-contain" />
              <div className="absolute inset-0 rounded-xl bg-primary/10 blur-sm pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-2xl font-black tracking-tight text-white group-hover:text-primary transition-colors truncate">
                Cine<span className="text-primary">Premium</span>
              </span>
            </div>
          </div>

          {/* ── 2. CENTRAL NAV LINKS (Home, Movies, About Us, My bookings, My Payments) ── */}
          <nav className="hidden lg:flex items-center liquid-glass-pill p-1 rounded-full border border-white/10 shadow-inner">
            {/* Home */}
            <button
              onClick={handleHomeClick}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === 'Home' && location.pathname === '/'
                  ? 'bg-white/15 text-white font-extrabold shadow-sm scale-105'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {/* Movies */}
            <button
              onClick={handleMoviesClick}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === 'Movies'
                  ? 'bg-white/15 text-white font-extrabold shadow-sm scale-105'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>

            {/* About Us */}
            <button
              onClick={handleAboutClick}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === 'About Us' || location.pathname === '/about' || location.pathname === '/about-us'
                  ? 'bg-white/15 text-white font-extrabold shadow-sm scale-105'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>About Us</span>
            </button>

            {/* My bookings */}
            <button
              onClick={handleMyBookingsClick}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === 'My bookings' || location.pathname === '/my-bookings' || location.pathname === '/my-tickets'
                  ? 'bg-white/15 text-white font-extrabold shadow-sm scale-105'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>My bookings</span>
            </button>
          </nav>

          {/* ── 3. RIGHT SECTION: Search, Notification, Profile/Login ── */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2.5">
            
            {/* Search Icon */}
            <button
              onClick={handleSearchAction}
              title="Search Movies & Showtimes"
              className="liquid-glass-btn p-2 sm:p-2.5 rounded-full text-on-surface-variant hover:text-white cursor-pointer relative group transition-all"
            >
              <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>

            {/* Notification Icon */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                title="Notifications"
                className="liquid-glass-btn p-2 sm:p-2.5 rounded-full text-on-surface-variant hover:text-white cursor-pointer relative group transition-all"
              >
                <Bell className="w-4 h-4 transition-transform group-hover:scale-110" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-primary text-[9px] font-black text-white px-0.5 shadow-[0_0_8px_rgba(229,9,20,0.8)] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationOpen && (
                <div className="liquid-glass-dropdown absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 border border-white/20 shadow-2xl bg-[#0c1324]/95 backdrop-blur-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <span>Live Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black border border-primary/30 animate-pulse">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[#c0c1ff] hover:text-white font-medium hover:underline cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAll}
                          className="text-[#908fa0] hover:text-rose-400 font-medium hover:underline cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-[#908fa0] space-y-1.5">
                      <Bell className="w-8 h-8 mx-auto text-[#464554] opacity-50" />
                      <p className="text-xs font-semibold text-white">No notifications yet</p>
                      <p className="text-[10px]">Booking confirmations and activity updates will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.actionUrl) {
                              setIsNotificationOpen(false);
                              navigate(n.actionUrl);
                            }
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
                            n.read
                              ? 'bg-white/[0.02] border-white/5 opacity-70 hover:opacity-100 hover:bg-white/[0.04]'
                              : 'bg-primary/10 border-primary/25 shadow-md hover:bg-primary/15'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {!n.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-ping" />
                              )}
                              <span className="font-bold text-xs text-white truncate">
                                {n.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#908fa0] flex items-center gap-0.5 shrink-0 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              {formatNotificationTime(n.timestamp)}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#dce1fb] mt-1 leading-snug">
                            {n.message}
                          </p>

                          {n.actionUrl && (
                            <div className="mt-2 text-[10px] font-bold text-primary group-hover:underline flex items-center gap-1">
                              <span>{n.actionLabel || 'View Details'}</span>
                              <ChevronDown className="w-3 h-3 -rotate-90" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile / Login Area */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="liquid-glass-btn flex items-center gap-2 p-1 sm:pr-2.5 rounded-full cursor-pointer transition-all border border-white/15 hover:border-primary/40"
                >
                  <img
                    src={USER_AVATAR}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-primary/50"
                  />
                  <span className="hidden sm:inline font-medium text-xs text-white max-w-[80px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="liquid-glass-dropdown absolute right-0 mt-3 w-64 rounded-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 border border-white/20 bg-[#0c1324]/95 backdrop-blur-2xl shadow-2xl">
                    {/* User Info Card */}
                    <div className="px-3 py-2.5 border-b border-white/10 mb-1.5 rounded-xl bg-white/[0.03]">
                      <div className="font-bold text-sm text-white truncate">{user.name}</div>
                      <div className="text-[11px] text-on-surface-variant truncate">{user.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-bold uppercase text-primary tracking-wider">
                        {user.role === 'admin' ? (
                          <Shield className="w-3 h-3 text-purple-400" />
                        ) : user.role === 'cinema_manager' ? (
                          <Shield className="w-3 h-3 text-indigo-400" />
                        ) : (
                          <UserIcon className="w-3 h-3" />
                        )}
                        {user.role === 'admin' ? 'Site Admin' : user.role === 'cinema_manager' ? 'Cinema Manager' : 'Member'}
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleMyBookingsClick();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-on-surface-variant hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <Ticket className="w-4 h-4 text-primary" />
                        <span>My Tickets & Bookings</span>
                      </button>

                      {user.role === 'cinema_manager' && (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/admin');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-on-surface-variant hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-indigo-400" />
                          <span>Cinema Manager Panel</span>
                        </button>
                      )}

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/super-admin');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-on-surface-variant hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-purple-400" />
                          <span>Super Admin Panel</span>
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/15 hover:text-red-300 rounded-xl transition-colors text-left cursor-pointer mt-1 border-t border-white/5 pt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="liquid-glass-btn text-xs font-semibold px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-on-surface-variant hover:text-white transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary hover:text-white text-xs font-semibold px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full transition-all hidden sm:flex items-center gap-1.5 shadow-[0_0_12px_rgba(229,9,20,0.15)]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden liquid-glass-btn p-2 rounded-xl text-on-surface hover:text-white cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── MOBILE EXPANDABLE DRAWER ── */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden mt-3 pt-3 border-t border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {/* 5 Main Nav Buttons in Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={handleHomeClick}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'Home' && location.pathname === '/'
                    ? 'liquid-glass-pill-active text-white bg-white/15'
                    : 'liquid-glass-pill text-on-surface-variant hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 text-primary" />
                <span>Home</span>
              </button>

              <button
                onClick={handleMoviesClick}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'Movies'
                    ? 'liquid-glass-pill-active text-white bg-white/15'
                    : 'liquid-glass-pill text-on-surface-variant hover:text-white'
                }`}
              >
                <Film className="w-4 h-4 text-primary" />
                <span>Movies</span>
              </button>

              <button
                onClick={handleAboutClick}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'About Us' || location.pathname === '/about' || location.pathname === '/about-us'
                    ? 'liquid-glass-pill-active text-white bg-white/15'
                    : 'liquid-glass-pill text-on-surface-variant hover:text-white'
                }`}
              >
                <Info className="w-4 h-4 text-primary" />
                <span>About Us</span>
              </button>

              <button
                onClick={handleMyBookingsClick}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'My bookings'
                    ? 'liquid-glass-pill-active text-white bg-white/15'
                    : 'liquid-glass-pill text-on-surface-variant hover:text-white'
                }`}
              >
                <Ticket className="w-4 h-4 text-primary" />
                <span>My bookings</span>
              </button>

            </div>

            {onBookNowClick && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onBookNowClick();
                }}
                className="liquid-glow-btn w-full text-surface-container-lowest font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Book Tickets Now</span>
              </button>
            )}

            {/* Mobile Auth Links when logged out */}
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="liquid-glass-btn text-xs font-semibold py-2.5 rounded-xl text-center text-on-surface hover:text-white flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-white text-xs font-semibold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
};

export default Navbar;
