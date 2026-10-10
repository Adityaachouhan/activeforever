import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Phone, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Login() {
  const { signInWithOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    const { error: otpError } = await signInWithOtp(mobile);
    setLoading(false);
    if (otpError) {
      setError(otpError);
    } else {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{4,6}$/.test(otp)) {
      setError('Please enter a valid 4-6 digit OTP');
      return;
    }
    setLoading(true);
    const { error: verifyError } = await verifyOtp(mobile, otp, name);
    setLoading(false);
    if (verifyError) {
      setError(verifyError);
    } else {
      navigate('/events');
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

        <div className="card p-8">
          {/* Dev mode notice */}
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3 mb-6">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <span className="font-bold">DEV MODE:</span> OTP verification is bypassed. Enter any 4-6 digits to sign in.
            </p>
          </div>

          {step === 'mobile' ? (
            <>
              <h1 className="text-2xl font-display font-bold text-ink-900 mb-2">Sign In / Register</h1>
              <p className="text-sm text-ink-500 mb-6">Enter your mobile number to continue</p>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="label-field">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
                    <div className="absolute left-12 top-1/2 -translate-y-1/2 text-ink-600 font-medium text-sm">+91</div>
                    <input
                      required
                      type="tel"
                      value={mobile}
                      onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="input-field pl-20"
                      placeholder="98765 43210"
                    />
                  </div>
                </div>
                <div>
                  <label className="label-field">Your Name (optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>
                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending OTP...' : 'Send OTP'} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-ink-900 mb-2">Verify OTP</h1>
              <p className="text-sm text-ink-500 mb-6">
                Enter the OTP sent to <span className="font-semibold text-ink-700">+91 {mobile}</span>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="label-field">Enter OTP *</label>
                  <input
                    required
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field text-center text-2xl tracking-widest"
                    placeholder="••••"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Verifying...' : 'Verify & Continue'} <ShieldCheck className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('mobile'); setOtp(''); setError(''); }}
                  className="btn-ghost w-full"
                >
                  ← Change Mobile Number
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-ink-500 mt-6">
          By signing in, you agree to our Terms & Conditions and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
