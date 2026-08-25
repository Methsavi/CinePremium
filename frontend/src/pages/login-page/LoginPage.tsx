import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import logo from '@/assets/logo.png';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError, clearError } = useAuth();
  const { addNotification } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
      setSuccessMsg('Login successful! Redirecting to home...');
      addNotification({
        type: 'success',
        message: 'Logged In Successfully'
      });
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: any) {
      // Error is handled by context or set in state
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between font-sans antialiased relative overflow-hidden">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-inverse-primary/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between z-10 max-w-[1280px] w-full mx-auto">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer select-none">
          <img 
            src={logo} 
            alt="CinePremium" 
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain group-hover:scale-105 transition-transform" 
          />
          <span className="font-display text-2xl font-bold text-white tracking-tighter">
            Cine<span className="text-primary">Premium</span>
          </span>
        </Link>

        <Link
          to="/"
          className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
        >
          Back to Home
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-surface-container/80 backdrop-blur-xl border border-outline-variant/60 rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header Title */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-on-background">
                Welcome Back
              </h2>
              <p className="text-sm text-on-surface-variant">
                Sign in to manage your tickets, seats, and movie watchlist.
              </p>
            </div>

            {/* Notification Messages */}
            {displayError && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl text-sm animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">{displayError}</div>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-sm animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>{successMsg}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-on-background placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-on-background placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant bg-surface-container-low text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer select-none">
                  Keep me logged in
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-primary hover:bg-inverse-primary text-on-primary font-semibold rounded-2xl transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Navigation Link */}
            <div className="pt-2 text-center text-sm text-on-surface-variant space-y-2">
              <div>
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Create an Account
                </Link>
              </div>
              <div className="pt-2 border-t border-outline-variant/30">
                <Link
                  to="/admin-login"
                  className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant/80 hover:text-primary transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin & Manager Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 text-center text-xs text-on-surface-variant/60 z-10">
        &copy; {new Date().getFullYear()} CinePremium Inc. All rights reserved. Secure 256-bit SSL Auth.
      </footer>
    </div>
  );
}

export default LoginPage;