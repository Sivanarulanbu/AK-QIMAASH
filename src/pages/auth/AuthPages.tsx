import { useState } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '@/schemas'
import { SEOHead } from '@/components/seo/SEOHead'

// ─── Login Page ───────────────────────────────────────────────────────────────

export function LoginPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/account'

  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
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
      <SEOHead title="Private Client Access — AK QIMAASH" description="Sign in to your AK QIMAASH client account." canonical="/auth/login" />
      <AuthLayout
        title="Private Client Access"
        subtitle="Welcome back to AK QIMAASH. Enter your credentials to manage orders, personal sizing, and curated wishlists."
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 sm:space-y-6">
          {error && (
            <div role="alert" className="p-3 bg-error-light border border-error/20 rounded text-xs text-error-dark font-sans leading-relaxed">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-[11px] font-sans uppercase tracking-[0.15em] text-[#4A4641] font-medium mb-1.5">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              {...register('email')}
              placeholder="client@example.com"
              className="w-full bg-[#FAF9F7]/80 border border-border focus:border-brand-black focus-visible:ring-1 focus-visible:ring-brand-black focus:outline-none rounded-xs px-3.5 py-2.5 sm:py-3 text-sm font-sans text-brand-black placeholder:text-text-muted/60 transition-colors"
            />
            {errors.email && (
              <p className="text-xs text-error mt-1 font-sans">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="login-password" className="text-[11px] font-sans uppercase tracking-[0.15em] text-[#4A4641] font-medium">
                Password
              </label>
              <Link to="/auth/forgot-password" className="text-xs font-sans text-[#4A4641] hover:text-brand-black underline underline-offset-4 py-0.5">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full bg-[#FAF9F7]/80 border border-border focus:border-brand-black focus-visible:ring-1 focus-visible:ring-brand-black focus:outline-none rounded-xs px-3.5 pr-10 py-2.5 sm:py-3 text-sm font-sans text-brand-black placeholder:text-text-muted/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-black transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4 stroke-[1.5]" /> : <Eye className="h-4 w-4 stroke-[1.5]" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-error mt-1 font-sans">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 sm:py-3.5 bg-[#1a1a1a] text-white text-xs uppercase tracking-[0.2em] font-sans font-semibold hover:bg-black hover:-translate-y-0.5 shadow-md hover:shadow-xl transition-all duration-300 rounded-xs flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 sm:mt-5 text-center text-xs font-sans text-brand-stone">
          New to AK QIMAASH?{' '}
          <Link to="/auth/register" className="text-brand-black font-semibold hover:underline uppercase tracking-wider ml-1">
            Create an Account
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  if (user) return <Navigate to="/account" replace />

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    const { error: authError } = await supabase.auth.signUp({
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
      <AuthLayout title="Private Access Requested" subtitle="We have dispatched a verification link to your email.">
        <div className="text-center py-4">
          <p className="text-xs sm:text-sm font-sans text-brand-stone mb-6 leading-relaxed">
            Please check your inbox to activate your client privileges and begin browsing curated editions.
          </p>
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-black text-white text-xs uppercase tracking-[0.2em] font-sans font-medium hover:bg-brand-charcoal transition-colors rounded-xs"
          >
            Return to Sign In
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <>
      <SEOHead title="Create Account — AK QIMAASH" description="Create your AK QIMAASH account." canonical="/auth/register" />
      <AuthLayout
        title="Become a Client"
        subtitle="Join our private membership to enjoy seasonal preview access, order archives, and Singapore concierge delivery."
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 sm:space-y-6">
          {error && (
            <div role="alert" className="p-3 bg-error-light border border-error/20 rounded text-xs text-error-dark font-sans leading-relaxed">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="reg-name" className="block text-xs font-sans uppercase tracking-[0.15em] text-[#4A4641] font-medium mb-1.5">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              {...register('full_name')}
              placeholder="e.g. Eleanor Vance"
              className="w-full bg-[#FAF9F7]/80 border border-border focus:border-brand-black focus-visible:ring-1 focus-visible:ring-brand-black focus:outline-none rounded-xs px-4 py-3 text-sm font-sans text-brand-black placeholder:text-text-muted/60 transition-colors"
            />
            {errors.full_name && (
              <p className="text-xs text-error mt-1 font-sans">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-sans uppercase tracking-[0.15em] text-[#4A4641] font-medium mb-1.5">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              {...register('email')}
              placeholder="client@example.com"
              className="w-full bg-[#FAF9F7]/80 border border-border focus:border-brand-black focus-visible:ring-1 focus-visible:ring-brand-black focus:outline-none rounded-xs px-4 py-3 text-sm font-sans text-brand-black placeholder:text-text-muted/60 transition-colors"
            />
            {errors.email && (
              <p className="text-xs text-error mt-1 font-sans">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-sans uppercase tracking-[0.15em] text-[#4A4641] font-medium mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password')}
                placeholder="Min. 8 characters"
                className="w-full bg-[#FAF9F7]/80 border border-border focus:border-brand-black focus-visible:ring-1 focus-visible:ring-brand-black focus:outline-none rounded-xs px-4 pr-11 py-3 text-sm font-sans text-brand-black placeholder:text-text-muted/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-black transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4 stroke-[1.5]" /> : <Eye className="h-4 w-4 stroke-[1.5]" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-error mt-1 font-sans">{errors.password.message}</p>
            )}
            <p className="text-[11px] text-brand-stone/80 mt-1 font-sans">Min. 8 characters, one uppercase, one number</p>
          </div>

          <div>
            <label htmlFor="reg-confirm" className="block text-xs font-sans uppercase tracking-[0.15em] text-brand-stone font-medium mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="reg-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('confirm_password')}
                placeholder="Re-enter password"
                style={{ outline: 'none' }}
                className="w-full bg-[#FAF9F7]/80 border border-border focus:border-brand-black focus:outline-none focus:ring-0 rounded-xs px-4 pr-11 py-3 text-sm font-sans text-brand-black placeholder:text-text-muted/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-black transition-colors p-1"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 stroke-[1.5]" /> : <Eye className="h-4 w-4 stroke-[1.5]" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-xs text-error mt-1 font-sans">{errors.confirm_password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 sm:py-4 bg-[#1a1a1a] text-white text-xs uppercase tracking-[0.2em] font-sans font-semibold hover:bg-black hover:-translate-y-0.5 shadow-md hover:shadow-xl transition-all duration-300 rounded-xs flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <span>Creating Account...</span> : <span>Join Private Client Program</span>}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-sans text-brand-stone">
          Already a client?{' '}
          <Link to="/auth/login" className="text-brand-black font-semibold hover:underline uppercase tracking-wider ml-1">
            Sign In
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>()

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
      <AuthLayout
        title="Account Recovery"
        subtitle="Enter your email address and we will dispatch a secure link to reset your credentials."
      >
        {sent ? (
          <div className="text-center py-4">
            <p className="text-xs sm:text-sm font-sans text-brand-stone mb-6 leading-relaxed">
              If an account exists for that email, you will receive a password reset link shortly.
            </p>
            <Link
              to="/auth/login"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-black text-white text-xs uppercase tracking-[0.2em] font-sans font-medium hover:bg-brand-charcoal transition-colors rounded-xs"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 sm:space-y-6">
            {error && (
              <div role="alert" className="p-3 bg-error-light border border-error/20 rounded text-xs text-error-dark font-sans leading-relaxed">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="reset-email" className="block text-xs font-sans uppercase tracking-[0.15em] text-[#4A4641] font-medium mb-1.5">
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="client@example.com"
                className="w-full bg-[#FAF9F7]/80 border border-border focus:border-brand-black focus-visible:ring-1 focus-visible:ring-brand-black focus:outline-none rounded-xs px-4 py-3 text-sm font-sans text-brand-black placeholder:text-text-muted/60 transition-colors"
              />
              {errors.email && (
                <p className="text-xs text-error mt-1 font-sans">{errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 sm:py-4 bg-[#1a1a1a] text-white text-xs uppercase tracking-[0.2em] font-sans font-semibold hover:bg-black hover:-translate-y-0.5 shadow-md hover:shadow-xl transition-all duration-300 rounded-xs flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <span>Dispatching Link...</span> : <span>Send Reset Link</span>}
            </button>
            <div className="text-center pt-2">
              <Link to="/auth/login" className="text-xs font-sans text-brand-stone hover:text-brand-black uppercase tracking-wider underline underline-offset-2">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </AuthLayout>
    </>
  )
}

// ─── Prototype V1 Split-Screen Auth Layout ────────────────────────────────────

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
    <div className="min-h-[calc(100vh-5rem)] flex flex-col lg:flex-row bg-[#FAF9F7]">
      {/* Left 50%: Editorial Visual Section */}
      <div className="relative w-full lg:w-1/2 min-h-[300px] sm:min-h-[380px] lg:min-h-[calc(100vh-5rem)] bg-brand-charcoal overflow-hidden flex flex-col justify-end p-8 sm:p-12 lg:p-16">
        <img
          src="/images/hero-banner.jpg"
          alt="AK QIMAASH Editorial New Season"
          className="absolute inset-0 w-full h-full object-cover object-[75%_center] lg:object-[68%_center]"
        />
        {/* Subtle luxury gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 pointer-events-none"
          aria-hidden="true"
        />

        {/* Editorial Content Overlay */}
        <div className="relative z-10 max-w-lg text-white animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-accent stroke-[1.5]" />
            <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-white/85">
              Private Client Access
            </p>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl uppercase font-light tracking-tight leading-[1.08] mb-4 text-white">
            A Private World of Modest Luxury.
          </h2>
          <p className="font-sans text-xs sm:text-sm text-white/90 font-light leading-relaxed max-w-md">
            Access seasonal previews, personalized wardrobe sizing archives, and complimentary Singapore concierge delivery.
          </p>
        </div>
      </div>

      {/* Right 50%: Client Access Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FAF9F7] my-auto">
        <div className="w-full max-w-md my-auto">
          {/* Header */}
          <div className="mb-3.5 sm:mb-4">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-sans font-medium text-brand-stone mb-1">
              AK QIMAASH Atelier
            </p>
            <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-brand-black uppercase font-medium tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="font-sans text-xs text-brand-stone font-light mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-white p-5 sm:p-7 rounded-xs border border-border/80 shadow-xs">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
