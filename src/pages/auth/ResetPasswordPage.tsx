import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { SEOHead } from '@/components/seo/SEOHead'
import { Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react'

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetFormData = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetFormData) => {
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (updateError) {
      setError(updateError.message || 'Failed to update password. Link may have expired.')
    } else {
      setSuccess(true)
      setTimeout(() => {
        navigate('/auth/login', { replace: true })
      }, 2500)
    }
  }

  return (
    <>
      <SEOHead title="Set New Password — AK QIMAASH" description="Create a new password for your AK QIMAASH account." />
      <div className="min-h-[calc(100vh-5rem)] flex flex-col lg:flex-row bg-[#FAF9F7]">
        {/* Visual section */}
        <div className="relative w-full lg:w-1/2 min-h-[300px] sm:min-h-[380px] lg:min-h-[calc(100vh-5rem)] bg-brand-charcoal overflow-hidden flex flex-col justify-end p-8 sm:p-12 lg:p-16">
          <img
            src="/images/hero-banner.jpg"
            alt="AK QIMAASH Editorial"
            className="absolute inset-0 w-full h-full object-cover object-[75%_center] lg:object-[68%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 pointer-events-none" />
          <div className="relative z-10 max-w-lg text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-accent stroke-[1.5]" />
              <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-white/85">
                Security & Verification
              </p>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl uppercase font-light tracking-tight leading-[1.08] mb-4 text-white">
              Restore Your Private Access.
            </h2>
            <p className="font-sans text-xs sm:text-sm text-white/90 font-light leading-relaxed max-w-md">
              Secure your account credentials to continue managing your bespoke orders.
            </p>
          </div>
        </div>

        {/* Form section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FAF9F7] my-auto">
          <div className="w-full max-w-md my-auto">
            <div className="mb-4">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-sans font-medium text-brand-stone mb-1">
                AK QIMAASH Security
              </p>
              <h1 className="font-editorial text-2xl sm:text-3xl text-brand-black uppercase font-medium tracking-tight">
                Create New Password
              </h1>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xs border border-border/80 shadow-xs">
              {success ? (
                <div className="text-center py-6 space-y-4 animate-fade-in">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-editorial text-2xl uppercase tracking-tight text-brand-black">
                    Password Updated
                  </h3>
                  <p className="text-xs font-sans text-brand-stone leading-relaxed">
                    Your password has been changed successfully. Redirecting you to sign in...
                  </p>
                  <Link
                    to="/auth/login"
                    className="inline-block mt-4 text-xs font-sans uppercase tracking-widest text-brand-black underline underline-offset-4 font-semibold"
                  >
                    Go to Sign In Now
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  {error && (
                    <div role="alert" className="p-3 bg-error-light border border-error/20 rounded text-xs text-error-dark font-sans leading-relaxed">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="new-password" className="block text-[11px] font-sans uppercase tracking-[0.15em] text-[#4A4641] font-medium mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        {...register('password')}
                        placeholder="••••••••"
                        className="w-full bg-[#FAF9F7]/80 border border-border focus:border-brand-black focus:outline-none rounded-xs px-3.5 pr-10 py-3 text-sm font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-black"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-[11px] font-sans uppercase tracking-[0.15em] text-[#4A4641] font-medium mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        {...register('confirmPassword')}
                        placeholder="••••••••"
                        className="w-full bg-[#FAF9F7]/80 border border-border focus:border-brand-black focus:outline-none rounded-xs px-3.5 pr-10 py-3 text-sm font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-black"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-error mt-1">{errors.confirmPassword.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#1a1a1a] text-white text-xs uppercase tracking-[0.2em] font-sans font-semibold hover:bg-black transition-all rounded-xs mt-4 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
