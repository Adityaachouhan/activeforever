import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';
import type { UserProfile } from '@/types';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  signInWithOtp: (mobile: string) => Promise<{ error: string | null }>;
  verifyOtp: (mobile: string, otp: string, name?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    // Read the current session so we can preserve an explicitly-set admin role
    // (adminLogin stores role='admin' in localStorage but the DB row might differ)
    const { data: { session } } = await api.auth.getSession();
    const sessionRole = (session?.user as any)?.role as string | undefined;

    const { data } = await api
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (data) {
      // If the session was explicitly granted admin/staff, honour that role
      // even if the DB row hasn't been updated yet.
      const mergedRole =
        sessionRole === 'admin' || sessionRole === 'staff'
          ? sessionRole
          : (data as any).role;
      setUser({ ...(data as UserProfile), role: mergedRole as any });
    } else {
      // Create a profile if it doesn't exist yet
      const { data: newProfile } = await api
        .from('profiles')
        .insert({ id: uid })
        .select('*')
        .maybeSingle();
      if (newProfile) setUser(newProfile as UserProfile);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    api.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = api.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setUser(null);
        }
      })();
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signInWithOtp = async (mobile: string) => {
    // DEV MODE: OTP bypassed — we don't actually send an OTP
    // In production, this would call an edge function to send OTP via MSG91/Twilio
    return { error: null };
  };

  const verifyOtp = async (mobile: string, _otp: string, name?: string) => {
    // DEV MODE: OTP bypassed — accept any 4-6 digit input
    // In production, this would verify the OTP via MSG91/Twilio

    // Check if a profile with this mobile already exists
    const { data: existingProfile } = await api
      .from('profiles')
      .select('*')
      .eq('mobile', mobile)
      .maybeSingle();

    if (existingProfile) {
      // Sign in — deterministic email based on mobile number
      const email = `${mobile}@activeforever.in`;
      const { error: signInError } = await api.auth.signInWithPassword({
        email,
        password: `AF_${mobile}_dev`,
      });

      if (signInError) {
        // Try sign up instead
        const { error: signUpError } = await api.auth.signUp({
          email,
          password: `AF_${mobile}_dev`,
        });
        if (signUpError) return { error: (signUpError as any)?.message || 'Sign in error' };
      }

      // Update mobile if needed
      await api
        .from('profiles')
        .update({ mobile })
        .eq('id', existingProfile.id);

      await loadProfile(existingProfile.id);
      return { error: null };
    }

    // New user — create account
    const email = `${mobile}@activeforever.in`;
    const { data: signUpData, error: signUpError } = await api.auth.signUp({
      email,
      password: `AF_${mobile}_dev`,
    });

    if (signUpError) return { error: (signUpError as any)?.message || 'Sign up error' };

    if (signUpData?.user) {
      const { error: profileError } = await api.from('profiles').insert({
        id: signUpData.user.id,
        mobile,
        name: name || '',
        email,
      });

      if (profileError) return { error: (profileError as any)?.message || 'Profile error' };
      await loadProfile(signUpData.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    await api.auth.signOut();
    setUser(null);
  };

  const refreshProfile = async () => {
    const { data: { session } } = await api.auth.getSession();
    if (session?.user) {
      await loadProfile(session.user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithOtp, verifyOtp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
