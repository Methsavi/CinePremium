import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import logo from '@/assets/logo.png';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, logout, isLoading, error: authError, clearError } = useAuth();
  const { addNotification } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      const authUser = await login({ email: email.trim(), password });

      // Check role authorization
      if (authUser.role === 'admin') {
        setSuccessMsg('Administrator authentication verified! Redirecting to Super Admin Dashboard...');
        addNotification({
          type: 'success',
          message: 'Welcome, Super Admin!',
        });
        setTimeout(() => {
          navigate('/super-admin');
        }, 800);
      } else if (authUser.role === 'cinema_manager') {
        setSuccessMsg('Cinema Manager authentication verified! Redirecting to Manager Dashboard...');
        addNotification({
          type: 'success',
          message: 'Welcome, Cinema Manager!',
        });
        setTimeout(() => {
          navigate('/admin');
        }, 800);
      } else {
        // Customer trying to log into Admin Portal
        await logout();
        setLocalError('Access Denied: This portal is strictly restricted to Administrators and Cinema Managers. Please use the Customer Login.');
        addNotification({
          type: 'delete',
          message: 'Unauthorized Access Denied',
        });
      }
    } catch (err: any) {
      // Handled by AuthContext or error state
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col justify-between font-sans antialiased relative overflow-hidden selection:bg-red-600 selection:text-white">
      {/* Dark Ambient Security Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between z-10 max-w-[1280px] w-full mx-auto">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer select-none">
          <img
            src={logo}
            alt="CinePremium"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold text-white tracking-tighter">
              Cine<span className="text-red-500">Premium</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
              Staff Portal
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          Back to Home
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#0d0d12]/95 backdrop-blur-2xl border border-red-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-red-950/30 space-y-6 relative overflow-hidden">
            
            {/* Top Accent Line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

            {/* Title Header */}
            <div className="text-center space-y-2 pt-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
                Staff & Admin Login
              </h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Sign in to manage cinema halls, movies, showtimes, user accounts, and booking operations.
              </p>
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="flex items-start gap-3 bg-red-950/60 border border-red-500/40 text-red-300 px-4 py-3 rounded-2xl text-xs sm:text-sm animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">{displayError}</div>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl text-xs sm:text-sm animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 font-medium">{successMsg}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Staff Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com / manager@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-zinc-950/90 border border-white/15 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-red-400 hover:text-red-300 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-zinc-950/90 border border-white/15 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="admin-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-zinc-950 text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
                />
                <label htmlFor="admin-remember" className="text-xs text-zinc-400 cursor-pointer select-none">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Portal Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Portal Switching Notice */}
            <div className="pt-2 text-center text-xs text-zinc-500 border-t border-white/10 space-y-2">
              <div>
                Are you a CinePremium Movie Goer?{' '}
                <Link to="/login" className="font-semibold text-red-400 hover:text-red-300 hover:underline">
                  Customer Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 text-center text-xs text-zinc-600 z-10">
        &copy; {new Date().getFullYear()} CinePremium Administrative Infrastructure. Protected by End-to-End JWT Encryption.
      </footer>
    </div>
  );
}

export default AdminLoginPage;
