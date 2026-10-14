import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Phone, ArrowRight, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { useAuth } from '@/lib/auth-context';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function Login() {
  const { verifyFirebaseOtp, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Clean up reCAPTCHA verifier on component unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          // ignore cleanup errors
        }
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  // Cooldown countdown timer for Resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Setup / reset invisible reCAPTCHA verifier
  const getRecaptchaVerifier = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {
        // ignore
      }
      window.recaptchaVerifier = undefined;
    }

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - allow signInWithPhoneNumber
      },
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please try sending OTP again.');
      },
    });

    window.recaptchaVerifier = verifier;
    return verifier;
  };

  // Step 1: Send OTP to mobile with +91 validation
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    // +91 Indian mobile number validation (10 digits starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      const verifier = getRecaptchaVerifier();
      const formattedPhoneNumber = `+91${mobile}`;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, verifier);
      setConfirmationResult(confirmation);
      window.confirmationResult = confirmation;
      setStep('otp');
      setCountdown(60);
    } catch (err: any) {
      console.error('Firebase signInWithPhoneNumber error:', err);
      let userMsg = 'Failed to send OTP. Please check the mobile number and try again.';
      if (err.code === 'auth/invalid-phone-number') {
        userMsg = 'Invalid phone number format.';
      } else if (err.code === 'auth/too-many-requests') {
        userMsg = 'Too many requests. Please wait a few minutes before trying again.';
      } else if (err.code === 'auth/quota-exceeded') {
        userMsg = 'SMS quota exceeded for today. Please try again later or contact support.';
      } else if (err.code === 'auth/captcha-check-failed') {
        userMsg = 'reCAPTCHA verification failed. Please refresh the page and try again.';
      } else if (err.message) {
        userMsg = err.message;
      }
      setError(userMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and extract Firebase ID token
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const activeConfirmation = confirmationResult || window.confirmationResult;
    if (!activeConfirmation) {
      setError('Session expired. Please request a new OTP.');
      setStep('mobile');
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP with Firebase
      const userCredential = await activeConfirmation.confirm(otp.trim());

      // 2. Extract Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // 3. Send idToken to Express backend route (/api/auth/verify-otp)
      const { data, error: backendError } = await verifyFirebaseOtp(idToken, name.trim());
      if (backendError) {
        setError(backendError.message || 'Backend verification failed.');
        setLoading(false);
        return;
      }

      // Complete session and navigate
      await refreshProfile();
      navigate('/events');
    } catch (err: any) {
      console.error('Firebase confirm OTP error:', err);
      let userMsg = 'Invalid or expired OTP. Please check and try again.';
      if (err.code === 'auth/invalid-verification-code') {
        userMsg = 'Incorrect OTP entered. Please check the code and re-enter.';
      } else if (err.code === 'auth/code-expired') {
        userMsg = 'This OTP has expired. Please click Resend OTP to get a new code.';
      } else if (err.message) {
        userMsg = err.message;
      }
      setError(userMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-ink-950">
            <Activity className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-extrabold text-white">Active Forever</span>
        </Link>

        {/* Card */}
        <div className="card p-8">
          {/* Invisible reCAPTCHA container required by Firebase */}
          <div id="recaptcha-container"></div>

          {step === 'mobile' ? (
            <>
              <h1 className="text-2xl font-display font-bold text-ink-900 mb-2">Sign In / Register</h1>
              <p className="text-sm text-ink-500 mb-6">
                Enter your mobile number to receive a secure OTP via SMS
              </p>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="label-field">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
                    <div className="absolute left-12 top-1/2 -translate-y-1/2 text-ink-600 font-semibold text-sm">
                      +91
                    </div>
                    <input
                      required
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="input-field pl-20"
                      placeholder="98765 43210"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-ink-400 mt-1.5">
                    10-digit Indian mobile number (without 0 or +91)
                  </p>
                </div>

                <div>
                  <label className="label-field">Your Name (optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Rahul Sharma"
                  />
                  <p className="text-xs text-ink-400 mt-1.5">
                    If you are new, this name will be saved to your runner profile
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || mobile.length !== 10}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">OTP Sent Successfully</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-ink-900 mb-2">Verify OTP</h1>
              <p className="text-sm text-ink-500 mb-6">
                Enter the 6-digit OTP sent to <span className="font-semibold text-ink-700">+91 {mobile}</span>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="label-field">Enter 6-Digit OTP *</label>
                  <input
                    required
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field text-center text-3xl font-mono tracking-widest py-3"
                    placeholder="••••••"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Verifying with Firebase...
                    </>
                  ) : (
                    <>
                      Verify & Continue <ShieldCheck className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('mobile');
                      setOtp('');
                      setError('');
                    }}
                    className="text-xs font-medium text-ink-600 hover:text-ink-900 transition-colors"
                  >
                    ← Change Mobile Number
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={countdown > 0 || loading}
                    className="text-xs font-medium text-amber-600 hover:text-amber-700 disabled:text-ink-400 transition-colors"
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-ink-500 mt-6">
          By signing in, you agree to our Terms &amp; Conditions and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
