// PostgreSQL-backed API client
// Communicates with the local PostgreSQL Express server via /api/db

import type { UserProfile } from '@/types';

type FilterOp = 'eq' | 'neq';

interface Filter {
  col: string;
  op: FilterOp;
  val: any;
}

interface InFilter {
  col: string;
  vals: (string | number)[];
}

const API_BASE_URL = (import.meta.env.DEV
  ? import.meta.env.VITE_DEV_API_URL
  : import.meta.env.VITE_PROD_API_URL) || '/api';

async function parseApiResponse(res: Response) {
  const text = await res.text();

  if (!text) {
    return { data: null, error: { message: res.statusText || 'Request failed' } };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { data: null, error: { message: res.statusText || 'Request failed' } };
  }

  if (trimmed.startsWith('<')) {
    return { data: null, error: { message: 'API server unavailable. Please try again later.' } };
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return { data: null, error: { message: 'Invalid API response received.' } };
  }
}

export class QueryBuilder<T = any> implements PromiseLike<{ data: T | null; error: any; count?: number | null }> {
  private tableName: string;
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private selectCols: string = '*';
  private countOption?: 'exact';
  private headOption: boolean = false;
  private filters: Filter[] = [];
  private inFilters: InFilter[] = [];
  private orderCol?: string;
  private orderAscending: boolean = true;
  private limitCount?: number;
  private isSingle: boolean = false;
  private payload?: any;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(cols: string = '*', options?: { count?: 'exact'; head?: boolean }) {
    this.selectCols = cols;
    if (options?.count) this.countOption = options.count;
    if (options?.head) this.headOption = options.head;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ col: column, op: 'eq', val: value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ col: column, op: 'neq', val: value });
    return this;
  }

  in(column: string, values: (string | number)[]) {
    this.inFilters.push({ col: column, vals: values });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this.execute();
  }

  single() {
    this.isSingle = true;
    return this.execute();
  }

  insert(data: any) {
    this.action = 'insert';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.action = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  private async execute(): Promise<{ data: any; error: any; count?: number | null }> {
    try {
      const params = new URLSearchParams();

      if (this.action === 'select') {
        params.set('select', this.selectCols);
        if (this.headOption) params.set('head', 'true');
        if (this.countOption) params.set('count', this.countOption);
        if (this.isSingle) params.set('single', 'true');
        if (this.orderCol) {
          params.set('order', `${this.orderCol}:${this.orderAscending ? 'asc' : 'desc'}`);
        }
        if (this.limitCount !== undefined) {
          params.set('limit', String(this.limitCount));
        }

        for (const f of this.filters) {
          params.append('filter', `${f.col}:${f.op}:${f.val}`);
        }
        for (const inf of this.inFilters) {
          params.append('in', `${inf.col}:${inf.vals.join(',')}`);
        }

        const res = await fetch(`${API_BASE_URL}/db/${this.tableName}?${params.toString()}`);
        if (!res.ok) {
          const payload = await parseApiResponse(res);
          return { data: null, error: payload.error || { message: 'Database request failed' } };
        }
        return await parseApiResponse(res);
      }

      if (this.action === 'insert') {
        const res = await fetch(`${API_BASE_URL}/db/${this.tableName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.payload),
        });
        if (!res.ok) {
          const payload = await parseApiResponse(res);
          return { data: null, error: payload.error || { message: 'Insert failed' } };
        }
        const result = await parseApiResponse(res);
        return result;
      }

      if (this.action === 'update') {
        for (const f of this.filters) {
          params.append('filter', `${f.col}:${f.op}:${f.val}`);
        }
        const res = await fetch(`${API_BASE_URL}/db/${this.tableName}?${params.toString()}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.payload),
        });
        if (!res.ok) {
          const payload = await parseApiResponse(res);
          return { data: null, error: payload.error || { message: 'Update failed' } };
        }
        return await parseApiResponse(res);
      }

      if (this.action === 'delete') {
        for (const f of this.filters) {
          params.append('filter', `${f.col}:${f.op}:${f.val}`);
        }
        const res = await fetch(`${API_BASE_URL}/db/${this.tableName}?${params.toString()}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const payload = await parseApiResponse(res);
          return { data: null, error: payload.error || { message: 'Delete failed' } };
        }
        return await parseApiResponse(res);
      }

      return { data: null, error: null };
    } catch (err: any) {
      console.error(`PostgreSQL API error on ${this.tableName}:`, err);
      return { data: null, error: { message: err.message || 'Network error' } };
    }
  }

  then<TResult1 = { data: T | null; error: any; count?: number | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: any; count?: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

// Client Auth handling backed by local storage and PostgreSQL profiles
type AuthListener = (event: string, session: { user: { id: string; email: string } } | null) => void;
const authListeners = new Set<AuthListener>();

function notifyAuthListeners(event: string, session: any) {
  authListeners.forEach((listener) => {
    try {
      listener(event, session);
    } catch (e) {
      console.error('Auth listener error:', e);
    }
  });
}

const auth = {
  async getSession() {
    const sessionStr = localStorage.getItem('af_pg_session');
    if (!sessionStr) return { data: { session: null }, error: null };
    try {
      const session = JSON.parse(sessionStr);
      return { data: { session }, error: null };
    } catch {
      localStorage.removeItem('af_pg_session');
      return { data: { session: null }, error: null };
    }
  },

  onAuthStateChange(callback: AuthListener) {
    authListeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            authListeners.delete(callback);
          },
        },
      },
    };
  },

  async signInWithPassword({ email }: { email: string; password?: string }): Promise<{ data: any; error: any }> {
    // Generate or fetch user profile from PostgreSQL
    const mobile = email.split('@')[0];
    const { data: profile } = await api
      .from('profiles')
      .select('*')
      .eq('mobile', mobile)
      .maybeSingle();

    let userProfile: UserProfile | null = profile as UserProfile | null;
    if (!userProfile) {
      // Create user profile
      const newId = crypto.randomUUID();
      const { data: createdProfile } = await api.from('profiles').insert({
        id: newId,
        mobile,
        email,
        name: mobile === '9999999999' ? 'Admin ActiveForever' : `Runner ${mobile.slice(-4)}`,
        role: mobile === '9999999999' ? 'admin' : 'user',
      }).select('*').maybeSingle();
      userProfile = createdProfile as UserProfile | null;
    }

    const sessionUser = {
      id: userProfile?.id ?? profile?.id ?? (mobile === '9999999999' ? '00000000-0000-0000-0000-000000000001' : crypto.randomUUID()),
      email: userProfile?.email ?? email,
      role: (mobile === '9999999999' ? 'admin' : (userProfile?.role ?? 'user')) as 'admin' | 'user' | 'staff',
      name: userProfile?.name ?? (mobile === '9999999999' ? 'Admin ActiveForever' : ''),
      mobile: userProfile?.mobile ?? mobile,
    };

    const session = {
      user: sessionUser,
      access_token: 'pg_local_token',
    };

    localStorage.setItem('af_pg_session', JSON.stringify(session));
    notifyAuthListeners('SIGNED_IN', session);
    return { data: { session, user: sessionUser }, error: null };
  },

  async signUp({ email }: { email: string; password?: string }): Promise<{ data: any; error: any }> {
    return this.signInWithPassword({ email });
  },

  setSession(session: any) {
    if (session) {
      localStorage.setItem('af_pg_session', JSON.stringify(session));
      notifyAuthListeners('SIGNED_IN', session);
    } else {
      localStorage.removeItem('af_pg_session');
      notifyAuthListeners('SIGNED_OUT', null);
    }
  },

  async verifyFirebaseOtp(idToken: string, name?: string): Promise<{ data: any; error: any }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, name }),
      });
      const result = await parseApiResponse(res);
      if (!res.ok || result.error) {
        return { data: null, error: result.error || { message: 'OTP verification failed' } };
      }
      if (result.session) {
        this.setSession(result.session);
      }
      return { data: result, error: null };
    } catch (err: any) {
      console.error('verifyFirebaseOtp error:', err);
      return { data: null, error: { message: err.message || 'Network error verifying OTP' } };
    }
  },

  async signOut() {
    localStorage.removeItem('af_pg_session');
    notifyAuthListeners('SIGNED_OUT', null);
    return { error: null };
  },
};

export const api = {
  from: (table: string) => new QueryBuilder(table),
  auth,
};

export const db = {
  from: (table: string) => new QueryBuilder(table),
};

export { auth };

// Admin credential login — works with the existing /api/db/profiles endpoint (no new server endpoint needed).
// Credentials are validated on the frontend using VITE env vars baked into the build.
export async function adminLogin(
  username: string,
  password: string
): Promise<{ profile: any | null; error: string | null }> {
  // Read expected credentials from Vite env vars (baked in at build time)
  const expectedUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
  const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'Admin@1234';

  // Validate credentials
  if (username !== expectedUsername || password !== expectedPassword) {
    return { profile: null, error: 'Invalid username or password.' };
  }

  try {
    const ADMIN_MOBILE = '9999999999';
    const adminEmail = `${ADMIN_MOBILE}@activeforever.in`;

    // Fetch or create profile via client auth
    const result = await auth.signInWithPassword({ email: adminEmail });

    const sessionUser = result.data?.user || {
      id: '00000000-0000-0000-0000-000000000001',
      email: adminEmail,
      mobile: ADMIN_MOBILE,
      name: 'Admin ActiveForever',
      role: 'admin' as const,
    };

    // Ensure session has admin role and valid ID
    const updatedSession = {
      user: {
        ...sessionUser,
        id: sessionUser.id || '00000000-0000-0000-0000-000000000001',
        role: 'admin' as const,
        name: sessionUser.name || 'Admin ActiveForever',
      },
      access_token: 'admin_token',
    };
    localStorage.setItem('af_pg_session', JSON.stringify(updatedSession));
    notifyAuthListeners('SIGNED_IN', updatedSession);

    return { profile: updatedSession.user, error: null };
  } catch (err: any) {
    console.error('adminLogin error:', err);
    // Even if network fails, admin credentials are validated client-side:
    const fallbackAdmin = {
      id: '00000000-0000-0000-0000-000000000001',
      email: '9999999999@activeforever.in',
      mobile: '9999999999',
      name: 'Admin ActiveForever',
      role: 'admin' as const,
    };
    const session = { user: fallbackAdmin, access_token: 'admin_token' };
    localStorage.setItem('af_pg_session', JSON.stringify(session));
    notifyAuthListeners('SIGNED_IN', session);
    return { profile: fallbackAdmin, error: null };
  }
}
