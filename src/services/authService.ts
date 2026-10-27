import { getSupabaseClient, isSupabaseConfigured, ADMIN_EMAIL } from '../lib/supabase';

export interface AdminUser {
  email: string;
  name: string;
  role: 'admin';
  provider: 'supabase' | 'local';
}

export interface AuthStatusResponse {
  isConfigured: boolean;
  adminEmail: string;
  provider: 'supabase' | 'local';
}

export const authService = {
  /**
   * Checks whether the administrator account is configured.
   */
  async checkStatus(): Promise<AuthStatusResponse> {
    if (isSupabaseConfigured()) {
      return {
        isConfigured: true,
        adminEmail: ADMIN_EMAIL,
        provider: 'supabase'
      };
    }

    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await res.json();
        return {
          isConfigured: Boolean(data.isConfigured),
          adminEmail: data.adminEmail || ADMIN_EMAIL,
          provider: 'local'
        };
      }
    } catch {
      // Offline or static environment
    }

    return {
      isConfigured: false,
      adminEmail: ADMIN_EMAIL,
      provider: 'local'
    };
  },

  /**
   * Logs in the administrator using Supabase Auth (or local backend).
   */
  async login(email: string, password: string): Promise<{
    token: string;
    user: AdminUser;
  }> {
    const cleanEmail = email.trim().toLowerCase();

    // Verify authorized admin email
    if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
      throw new Error(`Unauthorized: Only the designated administrator (${ADMIN_EMAIL}) has access.`);
    }

    // 1. Supabase Auth (Live Netlify + Shared Online DB)
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        // If user not found, provide helpful context
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. If you have not created your Supabase admin user yet, use the First-Time Setup tab or create user in Supabase Authentication.');
        }
        throw new Error(error.message);
      }

      if (!data.session || !data.user) {
        throw new Error('Login failed: no active session returned.');
      }

      const adminUser: AdminUser = {
        email: data.user.email || ADMIN_EMAIL,
        name: 'Jacob Friday (Founder & Admin)',
        role: 'admin',
        provider: 'supabase'
      };

      const token = data.session.access_token;
      localStorage.setItem('allgenres_admin_token', token);
      localStorage.setItem('allgenres_auth_provider', 'supabase');

      return { token, user: adminUser };
    }

    // 2. Local Express Backend Fallback (Development environment)
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
    }

    localStorage.setItem('allgenres_admin_token', data.token);
    localStorage.setItem('allgenres_auth_provider', 'local');

    return {
      token: data.token,
      user: {
        ...data.user,
        provider: 'local'
      }
    };
  },

  /**
   * Initial Setup: Sets administrator password.
   */
  async setupAdmin(password: string): Promise<{
    token: string;
    user: AdminUser;
  }> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      // Try signing up master admin user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password,
        options: {
          data: {
            name: 'Jacob Friday (Founder & Admin)',
            role: 'admin'
          }
        }
      });

      if (error) {
        // If user already registered, try sign in with provided password
        if (error.message.toLowerCase().includes('already registered')) {
          return this.login(ADMIN_EMAIL, password);
        }
        throw new Error(error.message);
      }

      // If auto-confirmed or session established
      if (data.session) {
        const token = data.session.access_token;
        localStorage.setItem('allgenres_admin_token', token);
        return {
          token,
          user: {
            email: ADMIN_EMAIL,
            name: 'Jacob Friday (Founder & Admin)',
            role: 'admin',
            provider: 'supabase'
          }
        };
      }

      // If Supabase requires email confirmation
      return {
        token: 'pending_confirmation',
        user: {
          email: ADMIN_EMAIL,
          name: 'Jacob Friday (Founder & Admin)',
          role: 'admin',
          provider: 'supabase'
        }
      };
    }

    // Local Express Backend Fallback
    const res = await fetch('/api/auth/setup-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password,
        confirmPassword: password
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to setup master password.');
    }

    localStorage.setItem('allgenres_admin_token', data.token);
    return {
      token: data.token,
      user: {
        ...data.user,
        provider: 'local'
      }
    };
  },

  /**
   * Sends password reset request for administrator.
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin + '/admin'
      });
      if (error) throw new Error(error.message);
      return {
        success: true,
        message: `Password reset instructions sent to ${cleanEmail}. Check your inbox to set a new password.`
      };
    }

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to initiate password reset.');
    return {
      success: true,
      message: data.message || 'Password reset link sent.'
    };
  },

  /**
   * Validates current session token and returns current user info.
   */
  async getCurrentUser(savedToken: string): Promise<AdminUser | null> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user && session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        return {
          email: session.user.email,
          name: 'Jacob Friday (Founder & Admin)',
          role: 'admin',
          provider: 'supabase'
        };
      }
      // If token in localStorage but session expired, try getUser
      const { data: { user } } = await supabase.auth.getUser(savedToken);
      if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        return {
          email: user.email,
          name: 'Jacob Friday (Founder & Admin)',
          role: 'admin',
          provider: 'supabase'
        };
      }
    }

    // Try local Express /api/auth/me
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.role === 'admin') {
          return {
            ...data.user,
            provider: 'local'
          };
        }
      }
    } catch {}

    return null;
  },

  /**
   * Logs out the administrator.
   */
  async logout(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    localStorage.removeItem('allgenres_admin_token');
    localStorage.removeItem('allgenres_auth_provider');
  }
};
