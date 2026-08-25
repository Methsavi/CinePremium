import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Mail, Lock, Eye, EyeOff, Film, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { authApi } from '@/services/authApi';
import { useNotification } from '@/context/NotificationContext';
import logo from '@/assets/logo.png';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [step, setStep] = useState<'request_otp' | 'reset_password'>('request_otp');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (step !== 'reset_password' || resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Step 1: Request 6-digit OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your account email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.forgotPassword({ email: email.trim() });
      setSuccessMsg(res.message || 'Password reset OTP sent to your email.');
      addNotification({
        type: 'success',
        message: 'Password Reset OTP Dispatched',
      });
      setStep('reset_password');
      setResendTimer(30);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch reset OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Reset password using OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg('Please enter the valid 6-digit OTP code.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      setSuccessMsg(res.message || 'Password reset successfully! Redirecting to login...');
      addNotification({
        type: 'success',
        message: 'Password Reset Successfully',
      });

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password. Check OTP code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col justify-between font-sans antialiased relative overflow-hidden selection:bg-red-600 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-900/15 rounded-full blur-[128px] pointer-events-none" />

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
          to="/login"
          className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          Back to Login
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          <div className="bg-[#0d0d12]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header Icon */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-600/10">
                <KeyRound className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
                {step === 'request_otp' ? 'Forgot Password?' : 'Reset Password with OTP'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
                {step === 'request_otp'
                  ? 'Enter your email address to receive a 6-digit security OTP code.'
                  : `Enter the 6-digit OTP code sent to ${email} and choose a new password.`}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-3 bg-red-950/50 border border-red-500/40 text-red-300 px-4 py-3 rounded-2xl text-xs sm:text-sm animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="flex items-start gap-3 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl text-xs sm:text-sm animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">{successMsg}</div>
              </div>
            )}

            {/* STEP 1: REQUEST OTP FORM */}
            {step === 'request_otp' && (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Account Email Address
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
                      placeholder="name@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-white/15 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: ENTER OTP & NEW PASSWORD FORM */}
            {step === 'reset_password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* 6-Digit OTP Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || isSubmitting}
                      onClick={handleRequestOTP}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-zinc-950 border border-white/15 rounded-2xl text-center text-xl font-mono font-bold tracking-widest text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-11 pr-11 py-3 bg-zinc-950 border border-white/15 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-white/15 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otp.length < 6 || !newPassword}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Reset Password & Login</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer Back Button */}
            <div className="pt-2 text-center border-t border-white/10">
              <Link
                to="/login"
                className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                ← Remember your password? Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-6 text-center text-xs text-zinc-600 z-10">
        © 2026 CinePremium. Secured with Encrypted OTP Authentication.
      </footer>
    </div>
  );
}

export default ForgotPasswordPage;
