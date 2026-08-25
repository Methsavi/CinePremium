import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, ShieldCheck, Film } from 'lucide-react';
import { authApi } from '@/services/authApi';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logo.png';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotification();
  const { setSession } = useAuth();

  const stateEmail = location.state?.email || searchParams.get('email') || '';
  const initialCode = searchParams.get('code') || '';

  const [email, setEmail] = useState(stateEmail);
  const [otp, setOtp] = useState<string[]>(() => {
    if (initialCode && initialCode.length === 6) {
      return initialCode.split('');
    }
    return ['', '', '', '', '', ''];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle individual digit input
  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);
    setErrorMsg(null);

    // Auto-advance to next box
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste full 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasteData[i] || '';
      }
      setOtp(newOtp);
      const nextFocus = Math.min(pasteData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const fullCode = otp.join('').trim();
    if (!email.trim()) {
      setErrorMsg('Please provide your account email address.');
      return;
    }

    if (fullCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authApi.verifyEmail({
        email: email.trim(),
        code: fullCode,
      });

      setSuccessMsg(response.message || 'Email verified successfully! Access granted.');
      addNotification({
        type: 'success',
        message: 'Email Verified Successfully',
      });

      if (response.data?.user && response.data?.token) {
        setSession(response.data.user, response.data.token);
      }

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    if (!email.trim()) {
      setErrorMsg('Please enter your email to receive a new code.');
      return;
    }

    try {
      setIsResending(true);
      setErrorMsg(null);
      await authApi.resendVerification(email.trim());
      setSuccessMsg('A fresh verification code has been dispatched to your email.');
      setResendCooldown(45);
      addNotification({
        type: 'success',
        message: 'New Code Dispatched',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
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

      {/* Main Verification Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          <div className="bg-[#0d0d12]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Icon Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-600/10">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
                Verify Your Email
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
                We sent a 6-digit verification code to{' '}
                <strong className="text-white">{email || 'your email'}</strong>. Enter it below to activate your account.
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

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="space-y-6">
              {/* If email was empty, show email input */}
              {!stateEmail && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Confirm Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-white/15 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              )}

              {/* 6-Digit OTP Boxes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block text-center">
                  Enter 6-Digit Code
                </label>
                <div className="flex items-center justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-11 h-13 sm:w-12 sm:h-14 bg-zinc-950 border border-white/20 rounded-xl text-center text-xl font-bold font-mono text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isSubmitting || otp.join('').length < 6}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </form>

            {/* Resend Code Footer */}
            <div className="pt-2 text-center border-t border-white/10 space-y-2">
              <p className="text-xs text-zinc-400">
                Didn't receive the code or expired?
              </p>
              <button
                type="button"
                disabled={resendCooldown > 0 || isResending}
                onClick={handleResend}
                className="text-xs font-bold text-red-400 hover:text-red-300 disabled:opacity-40 disabled:hover:text-red-400 transition-colors cursor-pointer"
              >
                {resendCooldown > 0 ? (
                  `Resend code in ${resendCooldown}s`
                ) : isResending ? (
                  'Dispatching new code...'
                ) : (
                  'Click to Resend Verification Code'
                )}
              </button>
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

export default VerifyEmailPage;
