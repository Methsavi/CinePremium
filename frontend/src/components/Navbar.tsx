import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, LogIn, UserPlus, LogOut, Ticket, Shield, 
  User as UserIcon, ChevronDown, Film, MapPin, Sparkles, 
  Menu, X
} from 'lucide-react';
import { USER_AVATAR } from '../data/movies';
import logo from '../assets/logo.png';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onBookNowClick: () => void;
  onSearchClick: () => void;
  onOpenMyTickets: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onBookNowClick,
  onSearchClick,
  onOpenMyTickets
}) => {
  const [activeTab, setActiveTab] = useState<'Movies' | 'Cinemas' | 'Offers'>('Movies');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        // Only close if click is not on the hamburger button
        const target = event.target as HTMLElement;
        if (!target.closest('#mobile-menu-toggle')) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync tab active state with current location path
  useEffect(() => {
    if (location.pathname === '/cinemas') {
      setActiveTab('Cinemas');
    } else if (location.pathname === '/') {
      if (location.hash === '#offers') {
        setActiveTab('Offers');
      } else {
        setActiveTab('Movies');
      }
    }
  }, [location.pathname, location.hash]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
  };

  const handleOffersClick = () => {
    setActiveTab('Offers');
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/#offers');
      setTimeout(() => {
        const el = document.getElementById('offers');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('offers');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleMoviesClick = () => {
    setActiveTab('Movies');
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCinemasClick = () => {
    setActiveTab('Cinemas');
    setIsMobileMenuOpen(false);
    navigate('/cinemas');
  };

  return (
    <div className="fixed top-3 sm:top-5 inset-x-0 z-50 px-2 sm:px-6 pointer-events-none transition-all duration-300">
      <header
        className={`pointer-events-auto max-w-7xl mx-auto w-full relative transition-all duration-300 ease-out ${
          isScrolled
            ? 'liquid-glass-scrolled py-2 sm:py-2.5 px-4 sm:px-6 rounded-2xl md:rounded-full'
            : 'liquid-glass py-2.5 sm:py-3 px-4 sm:px-6 rounded-2xl md:rounded-full'
        }`}
      >
        {/* Specular Ambient Glow Overlay */}
        <div className="absolute -inset-[1px] rounded-2xl md:rounded-full bg-gradient-to-r from-primary/20 via-red-500/10 to-primary/20 blur-lg -z-10 opacity-70 pointer-events-none" />

        <div className="flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Brand Logo with Liquid Gem Badge */}
          <div
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex min-w-0 items-center gap-1.5 sm:gap-2.5 group cursor-pointer select-none"
          >
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary/25 to-inverse-primary/30 border border-primary/40 shadow-[0_0_15px_rgba(229,9,20,0.25)]  transition-all duration-200">
              <img src={logo} alt="CinePremium" className="w-full h-full rounded-xl object-contain" />
              <div className="absolute inset-0 rounded-xl bg-primary/10 blur-sm pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg sm:text-2xl font-black tracking-tight text-white group-hover:text-primary transition-colors truncate">
                  Cine<span className="text-primary">Premium</span>
                </span>
                <span className="hidden lg:inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest bg-primary/15 border border-primary/30 text-primary">
                  Cinema
                </span>
              </div>
            </div>
          </div>

          {/* Central Liquid Capsule Navigation Bar (Desktop) */}
          <nav className="hidden md:flex items-center liquid-glass-pill p-1 rounded-full border border-white/10 shadow-inner">
            <button
              onClick={handleMoviesClick}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === 'Movies' && location.pathname === '/' && location.hash !== '#offers'
                  ? ' text-white font-weight-extrabold scale-105'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>

            <button
              onClick={handleCinemasClick}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === 'Cinemas' || location.pathname === '/cinemas'
                  ? ' text-white font-weight-extrabold scale-105'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Cinemas</span>
            </button>

            <button
              onClick={handleOffersClick}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === 'Offers'
                  ? ' text-white font-weight-extrabold scale-105'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Offers</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            {/* Quick Action Icons */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={onSearchClick}
                title="Search Movies & Theaters"
                className="liquid-glass-btn p-2 sm:p-2.5 rounded-full text-on-surface-variant hover:text-white cursor-pointer relative group"
              >
                <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>

              <button
                onClick={onOpenMyTickets}
                title="My Booked Tickets"
                className="hidden min-[375px]:block liquid-glass-btn p-2 sm:p-2.5 rounded-full text-on-surface-variant hover:text-white cursor-pointer relative group"
              >
                <Ticket className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(192,193,255,0.8)]" />
              </button>
            </div>

            {/* Glowing Liquid CTA Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onBookNowClick();
              }}
                className="liquid-glow-btn text-surface-container-lowest font-bold text-xs sm:text-sm px-2 sm:px-5 py-2 sm:py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-md tracking-tight"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Book Now</span>
            </button>

            {/* User Profile / Auth Area */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="liquid-glass-btn flex items-center gap-2 p-1 sm:pr-2.5 rounded-full cursor-pointer transition-all border border-white/15"
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

                {/* Liquid Glass Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="liquid-glass-dropdown absolute right-0 mt-3 w-60 rounded-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 border border-white/20">
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
                          onOpenMyTickets();
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/15 hover:text-red-300 rounded-xl transition-colors text-left cursor-pointer mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="liquid-glass-btn text-xs font-semibold px-3.5 py-2 rounded-full text-on-surface-variant hover:text-white transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary hover:text-on-primary text-xs font-semibold px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(192,193,255,0.15)]"
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
              className="md:hidden liquid-glass-btn p-2 rounded-xl text-on-surface hover:text-white cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Liquid Glass Expandable Drawer */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden mt-3 pt-3 border-t border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleMoviesClick}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'Movies' && location.pathname === '/' && location.hash !== '#offers'
                    ? 'liquid-glass-pill-active text-white'
                    : 'liquid-glass-pill text-on-surface-variant hover:text-white'
                }`}
              >
                <Film className="w-4 h-4 mb-1 text-primary" />
                <span>Movies</span>
              </button>

              <button
                onClick={handleCinemasClick}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'Cinemas' || location.pathname === '/cinemas'
                    ? 'liquid-glass-pill-active text-white'
                    : 'liquid-glass-pill text-on-surface-variant hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4 mb-1 text-primary" />
                <span>Cinemas</span>
              </button>

              <button
                onClick={handleOffersClick}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'Offers'
                    ? 'liquid-glass-pill-active text-white'
                    : 'liquid-glass-pill text-on-surface-variant hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 mb-1 text-amber-300" />
                <span>Offers</span>
              </button>
            </div>

            <button
              onClick={onBookNowClick}
              className="liquid-glow-btn w-full text-surface-container-lowest font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Book Now</span>
            </button>

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
                  className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-on-primary text-xs font-semibold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5"
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

