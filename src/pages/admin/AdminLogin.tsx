import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Shield, Eye, EyeOff, AlertCircle, Lock, Phone, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminLogin() {
  const { user, loading, signInWithOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin', { replace: true });
      } else {
        setError('Access denied. This portal is for administrators only.');
      }
    }
  }, [user, loading, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await signInWithOtp(mobile);
    setSubmitting(false);
    if (err) { setError(err); return; }
    setStep('otp');
  };

  const handleOtpDigitChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[idx] = digit;
    setOtpDigits(next);
    setOtp(next.join(''));
    if (digit && idx < 5) {
      const nextInput = document.getElementById(`otp-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      const prev = document.getElementById(`otp-${idx - 1}`);
      prev?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = otpDigits.join('');
    if (code.length < 4) {
      setError('Enter at least 4 digits.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await verifyOtp(mobile, code);
    setSubmitting(false);
    if (err) { setError(err); return; }

    // After verifyOtp, user state updates via auth listener.
    // AdminLayout will handle redirect if role is valid.
    // We do a direct check here too.
    navigate('/admin', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-ink-50 flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-4">
            <Activity className="h-7 w-7" strokeWidth={2.5} />
          </div>
          <p className="eyebrow justify-center mb-3">
            <Shield className="h-4 w-4" /> Admin Portal
          </p>
          <h1 className="text-3xl font-display font-extrabold text-ink-900">
            {step === 'mobile' ? 'Admin Sign In' : 'Verify Identity'}
          </h1>
          <p className="text-ink-500 text-sm mt-2">
            {step === 'mobile'
              ? 'Enter your registered admin mobile number'
              : `OTP sent to +91 ${mobile}. Enter it below.`
            }
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {step === 'mobile' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label htmlFor="admin-mobile" className="label-field">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-ink-600 text-sm font-medium">+91</span>
                  <input
                    id="admin-mobile"
                    required
                    type="tel"
                    inputMode="numeric"
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    className="input-field pl-[4.5rem]"
                  />
                </div>
              </div>

              <button type="submit" disabled={submitting} id="admin-send-otp-btn" className="btn-primary w-full">
                {submitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Sending OTP…
                  </>
                ) : (
                  <>Send OTP <ChevronRight className="h-4 w-4" /></>
                )}
              </button>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-amber-700 mb-1">
                  <Lock className="h-3.5 w-3.5" /> Development mode
                </div>
                Admin credentials: Mobile <span className="font-mono font-bold">9999999999</span> → any 4–6 digit OTP
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="label-field mb-4">Enter 6-digit OTP</label>
                <div className="flex gap-2 sm:gap-3 justify-between">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type={showOtp ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      aria-label={`OTP digit ${idx + 1}`}
                      className={`flex-1 min-w-0 h-12 sm:h-14 rounded-xl border text-center text-xl font-bold text-ink-900 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all ${
                        digit ? 'border-amber-400 bg-amber-50' : 'border-ink-200 bg-white'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowOtp(v => !v)}
                  className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-800 mt-3 transition-colors"
                >
                  {showOtp ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showOtp ? 'Hide' : 'Show'} OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || otpDigits.join('').length < 4}
                id="admin-verify-otp-btn"
                className="btn-primary w-full"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" /> Verify & Access Admin
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep('mobile'); setOtpDigits(['','','','','','']); setOtp(''); setError(''); }}
                className="btn-ghost w-full"
              >
                ← Change mobile number
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-ink-500 mt-6">
          Not an admin? <Link to="/" className="font-semibold text-amber-600 hover:text-amber-700">Return to website</Link>
        </p>
      </div>
    </div>
  );
}
