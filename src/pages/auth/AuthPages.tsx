import { useState } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '@/schemas'
import { Input } from '@/components/ui/FormFields'
import { Button } from '@/components/ui/Button'
import { SEOHead } from '@/components/seo/SEOHead'

// ─── Login Page ───────────────────────────────────────────────────────────────

export function LoginPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/account'

  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  if (user) return <Navigate to={from} replace />

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (authError) {
      setError('Invalid email or password. Please check your credentials and try again.')
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <>
      <SEOHead title="Sign In — AK QIMAASH" description="Sign in to your AK QIMAASH account." canonical="/auth/login" />
      <AuthLayout title="Sign in" subtitle="Welcome back.">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {error && (
            <div role="alert" className="p-3 bg-error-light border border-error/20 rounded text-sm text-error-dark">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            error={errors.password?.message}
            required
          />

          <div className="flex justify-end">
            <Link to="/auth/forgot-password" className="text-xs text-text-muted hover:text-text-primary underline underline-offset-2">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
            Sign In
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-text-muted">
          New customer?{' '}
          <Link to="/auth/register" className="text-text-primary font-medium hover:text-accent underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </AuthLayout>
    </>
  )
}

// ─── Register Page ────────────────────────────────────────────────────────────

export function RegisterPage() {
  const user = useAuthStore((s) => s.user)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  if (user) return <Navigate to="/account" replace />

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="">
        <div className="text-center">
          <p className="text-sm text-text-secondary mb-4">
            We sent a confirmation link to your email address. Click the link to activate your account.
          </p>
          <Link to="/auth/login" className="btn-md btn-secondary">
            Return to Sign In
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <>
      <SEOHead title="Create Account — AK QIMAASH" description="Create your AK QIMAASH account." canonical="/auth/register" />
      <AuthLayout title="Create account" subtitle="Join to start shopping.">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {error && (
            <div role="alert" className="p-3 bg-error-light border border-error/20 rounded text-sm text-error-dark">
              {error}
            </div>
          )}

          <Input
            label="Full name"
            type="text"
            autoComplete="name"
            {...register('full_name')}
            error={errors.full_name?.message}
            required
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            error={errors.password?.message}
            hint="Min. 8 characters, one uppercase, one number"
            required
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            {...register('confirm_password')}
            error={errors.confirm_password?.message}
            required
          />

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
            Create Account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-text-primary font-medium hover:text-accent underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </AuthLayout>
    </>
  )
}

// ─── Forgot Password Page ─────────────────────────────────────────────────────

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>()

  const onSubmit = async (data: { email: string }) => {
    setError(null)
    const { error: e } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (e) {
      setError('Failed to send reset link. Please try again.')
    } else {
      setSent(true)
    }
  }

  return (
    <>
      <SEOHead title="Reset Password — AK QIMAASH" description="Reset your AK QIMAASH account password." canonical="/auth/forgot-password" />
      <AuthLayout title="Reset password" subtitle="Enter your email to receive a reset link.">
        {sent ? (
          <div className="text-center">
            <p className="text-sm text-text-secondary mb-4">
              If an account exists for that email, you will receive a password reset link shortly.
            </p>
            <Link to="/auth/login" className="btn-md btn-secondary">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {error && (
              <div role="alert" className="p-3 bg-error-light rounded text-sm text-error-dark">
                {error}
              </div>
            )}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message}
              required
            />
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
              Send Reset Link
            </Button>
            <Link to="/auth/login" className="block text-center text-sm text-text-muted hover:text-text-primary">
              Back to Sign In
            </Link>
          </form>
        )}
      </AuthLayout>
    </>
  )
}

// ─── Auth Layout ──────────────────────────────────────────────────────────────

function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6" aria-label="AK QIMAASH">
            <span className="font-editorial text-2xl font-medium tracking-tighter text-brand-black">
              AK QIMAASH
            </span>
          </Link>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
        </div>
        <div className="card p-6 shadow-sm">{children}</div>
      </div>
    </div>
  )
}
