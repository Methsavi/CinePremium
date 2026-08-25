import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Film, ArrowRight, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logo.png';
import logo2 from '@/assets/logo2.png';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error: authError, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live Password Strength Calculator
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 33, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' };
    if (score <= 4) return { score: 66, label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-400' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  }, [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setLocalError('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (!agreedTerms) {
      setLocalError('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'user',
      });

      setSuccessMsg('Account created! Redirecting to email verification...');
      setTimeout(() => {
        navigate('/verify-email', {
          state: {
            email: email.trim(),
          },
        });
      }, 1000);
    } catch (err: any) {
      // Error handled by AuthContext
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between font-sans antialiased relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-inverse-primary/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Top Header */}
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

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] items-center gap-8 lg:gap-16">
          {/* Brand panel */}
          <section className="flex flex-col items-center justify-center text-center lg:text-left lg:items-start">
            <img
              src={logo2}
              alt="CinePremium"
              className="w-full max-w-md lg:max-w-lg object-contain drop-shadow-[0_0_40px_rgba(229,9,20,0.2)]"
            />
          </section>

          {/* Registration form */}
          <div className="w-full max-w-lg justify-self-center lg:justify-self-end">
          <div className="bg-surface-container/80 backdrop-blur-xl border border-outline-variant/60 rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Title Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-on-background">
                Create Your Account
              </h2>
              <p className="text-sm text-on-surface-variant">
                Join CinePremium to book instant tickets, select VIP seats, and unlock exclusive rewards.
              </p>
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl text-sm animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">{displayError}</div>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-sm animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>{successMsg}</div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-on-background placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                </div>
              </div>

              {/* Email Address */}
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
                    placeholder="jane@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-on-background placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-11 pr-11 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-on-background placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant">Password Strength</span>
                      <span className={`font-semibold ${passwordStrength.textColor}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full pl-11 pr-4 py-3 bg-surface-container-low border rounded-2xl text-on-background placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 transition-all text-sm ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-outline-variant focus:border-primary focus:ring-primary'
                    }`}
                  />
                  {confirmPassword && confirmPassword === password && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-400">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-outline-variant bg-surface-container-low text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-on-surface-variant leading-relaxed cursor-pointer select-none">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-primary hover:bg-inverse-primary text-on-primary font-semibold rounded-2xl transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Navigation Link */}
            <div className="pt-2 text-center text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </div>
          </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-on-surface-variant/60 z-10">
        &copy; {new Date().getFullYear()} CinePremium Inc. All rights reserved.
      </footer>
    </div>
  );
}

export default RegisterPage;