'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { registerSchema, type RegisterSchema } from '@/lib/validations/complaint';

export default function RegisterForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterSchema) => {
    setServerError(null);
    const supabase = createClient();

    // 1. Create auth user
    const { error: authError, data: authData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, phone: data.phone || null }, // Profile is created by the database trigger
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setServerError(authError.message);
      return;
    }

    if (!authData.user) {
      setServerError('Registration failed. Please try again.');
      return;
    }

    router.push(`/register/confirm?email=${encodeURIComponent(data.email)}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Registration form">
      {serverError && (
        <div
          role="alert"
          className="rounded-md p-3 mb-4 text-sm"
          style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
        >
          {serverError}
        </div>
      )}

      {/* Full Name */}
      <div className="form-group">
        <label htmlFor="reg-name" className="form-label">
          Full Name <span className="required" aria-hidden="true">*</span>
        </label>
        <input
          id="reg-name"
          type="text"
          autoComplete="name"
          className={`form-input ${errors.name ? 'error' : ''}`}
          placeholder="Rahul Kumar"
          {...register('name')}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="form-error" role="alert">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="form-group">
        <label htmlFor="reg-email" className="form-label">
          Email Address <span className="required" aria-hidden="true">*</span>
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          placeholder="rahul@example.com"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="form-error" role="alert">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div className="form-group">
        <label htmlFor="reg-phone" className="form-label">
          Mobile Number{' '}
          <span className="text-xs font-normal" style={{ color: 'var(--gray-400)' }}>(Optional)</span>
        </label>
        <input
          id="reg-phone"
          type="tel"
          autoComplete="tel"
          className={`form-input ${errors.phone ? 'error' : ''}`}
          placeholder="9876543210"
          {...register('phone')}
          aria-invalid={!!errors.phone}
        />
        {errors.phone && <p className="form-error" role="alert">{errors.phone.message}</p>}
      </div>

      {/* Password */}
      <div className="form-group">
        <label htmlFor="reg-password" className="form-label">
          Password <span className="required" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password"
            className={`form-input pr-10 ${errors.password ? 'error' : ''}`}
            placeholder="At least 8 characters"
            {...register('password')}
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
        {errors.password && <p className="form-error" role="alert">{errors.password.message}</p>}
        <p className="form-hint">Minimum 8 characters.</p>
      </div>

      {/* Consent note */}
      <p className="text-xs mb-4" style={{ color: 'var(--gray-500)', lineHeight: 1.5 }}>
        By registering, you agree to our{' '}
        <a href="#" style={{ color: 'var(--gov-blue)' }}>Terms of Service</a> and{' '}
        <a href="#" style={{ color: 'var(--gov-blue)' }}>Privacy Policy</a>.
        Your role will be set to <strong>Citizen</strong> by default.
      </p>

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
            Creating account…
          </>
        ) : (
          <>
            <UserPlus size={18} aria-hidden="true" />
            Create Account
          </>
        )}
      </button>
    </form>
  );
}
