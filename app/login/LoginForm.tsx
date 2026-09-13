'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginSchema } from '@/lib/validations/complaint';

export default function LoginForm() {
  const params = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginSchema) => {
    setServerError(null);
    const supabase = createClient();

    const { error, data: authData } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (error.status === 403) {
        setServerError('Supabase rejected this request (403). Verify that NEXT_PUBLIC_SUPABASE_URL and the publishable key belong to the same project, then restart the dev server.');
      } else {
        setServerError(error.message || 'Invalid email or password. Please try again.');
      }
      return;
    }

    // Role is stored in profiles. The request is best-effort here; middleware
    // still enforces admin access server-side on every protected request.
    if (authData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();
      const redirectTo = params.get('from') ?? (profile?.role === 'ADMIN' ? '/admin' : '/complaints');
      // Mobile browsers on a LAN origin can need a tick to persist the SSR
      // auth cookie before middleware evaluates the next request.
      await supabase.auth.getSession();
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      window.location.assign(redirectTo);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Login form">
      {serverError && (
        <div
          role="alert"
          className="rounded-md p-3 mb-4 text-sm"
          style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
        >
          {serverError}
        </div>
      )}

      {/* Email */}
      <div className="form-group">
        <label htmlFor="login-email" className="form-label">
          Email Address <span className="required" aria-hidden="true">*</span>
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          placeholder="you@example.com"
          {...register('email')}
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p id="email-error" className="form-error" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="form-group">
        <label htmlFor="login-password" className="form-label">
          Password <span className="required" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            className={`form-input pr-10 ${errors.password ? 'error' : ''}`}
            placeholder="Enter your password"
            {...register('password')}
            aria-describedby={errors.password ? 'password-error' : undefined}
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
            style={{ color: 'var(--gray-400)', background: 'none', border: 'none' }}
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="form-error" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex justify-end mb-4">
        <a href="#" className="text-sm" style={{ color: 'var(--gov-blue)' }}>
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span
              className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: 'white', borderTopColor: 'transparent' }}
              aria-hidden="true"
            />
            Signing in…
          </>
        ) : (
          <>
            <LogIn size={18} aria-hidden="true" />
            Sign In
          </>
        )}
      </button>
    </form>
  );
}
