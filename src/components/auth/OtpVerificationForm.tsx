import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { CheckCircle2, AlertCircle, Loader2, RefreshCw, Mail, ShieldCheck } from 'lucide-react'

interface OtpVerificationFormProps {
  email: string
  onSuccess: () => void
  onCancel?: () => void
}

export function OtpVerificationForm({ email, onSuccess, onCancel }: OtpVerificationFormProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(60)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-focus first input box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Cooldown countdown timer for Resend button
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Handle single digit input
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    const cleanVal = value.replace(/\D/g, '')
    if (!cleanVal) {
      const newDigits = [...digits]
      newDigits[index] = ''
      setDigits(newDigits)
      return
    }

    const char = cleanVal.slice(-1)
    const newDigits = [...digits]
    newDigits[index] = char
    setDigits(newDigits)
    setError(null)

    // Move to next input if available
    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit if all 6 digits entered
    const fullCode = newDigits.join('')
    if (fullCode.length === 6) {
      handleVerify(fullCode)
    }
  }

  // Handle backspace key
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  // Handle pasting 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pastedData) return

    const newDigits = [...digits]
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i]
    }
    setDigits(newDigits)
    setError(null)

    // Focus on the next empty box or the last box
    const focusIndex = Math.min(pastedData.length, 5)
    inputRefs.current[focusIndex]?.focus()

    if (pastedData.length === 6) {
      handleVerify(pastedData)
    }
  }

  // Submit verification to Supabase
  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join('')
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // 1. Try verifyOtp with type 'signup'
      let { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
      })

      // 2. If signup type fails, fallback to 'email' type
      if (verifyError) {
        const fallback = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'email',
        })
        if (!fallback.error) {
          data = fallback.data
          verifyError = null
        }
      }

      if (verifyError) {
        setError(verifyError.message || 'The verification code is invalid or has expired.')
        setIsVerifying(false)
        return
      }

      if (data?.session) {
        useAuthStore.getState().setAuth(data.session.user, data.session)
      }

      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1200)
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  // Resend code via Supabase
  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    setError(null)
    setResendSuccess(false)

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (resendError) {
        setError(resendError.message)
      } else {
        setResendSuccess(true)
        setCooldown(60) // 60s cooldown matching Supabase rate limit
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Icon & Title */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-700 shadow-2xs">
          {isSuccess ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-scale-in" />
          ) : (
            <ShieldCheck className="w-7 h-7 text-amber-700" />
          )}
        </div>
        <h2 className="font-editorial text-2xl uppercase tracking-tight text-brand-black">
          {isSuccess ? 'Account Verified' : 'Enter Verification Code'}
        </h2>
        <p className="text-xs font-sans text-brand-stone leading-relaxed max-w-sm mx-auto">
          We sent a 6-digit confirmation code to:
        </p>
        <p className="text-xs font-mono font-semibold text-brand-black bg-[#FAF9F7] px-3 py-1 rounded inline-block border border-border">
          {email}
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div role="alert" className="p-3 bg-error-light border border-error/20 rounded text-xs text-error-dark font-sans leading-relaxed flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-error" />
          <span>{error}</span>
        </div>
      )}

      {/* Resend success notice */}
      {resendSuccess && !error && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-sans leading-relaxed flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>A fresh 6-digit code has been dispatched to your inbox.</span>
        </div>
      )}

      {/* 6 Digit Input Boxes */}
      <div className="flex justify-center items-center gap-2 sm:gap-3 py-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isVerifying || isSuccess}
            aria-label={`Digit ${index + 1}`}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-xs border transition-all duration-200 focus:outline-none ${
              digit
                ? 'border-brand-black bg-white text-brand-black shadow-xs'
                : 'border-border bg-[#FAF9F7] text-text-muted focus:border-brand-black focus:bg-white'
            } ${isSuccess ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700' : ''}`}
          />
        ))}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={() => handleVerify()}
        disabled={isVerifying || isSuccess || digits.join('').length !== 6}
        className="w-full py-3.5 bg-[#1a1a1a] text-white text-xs uppercase tracking-[0.2em] font-sans font-semibold hover:bg-black hover:-translate-y-0.5 shadow-md hover:shadow-xl transition-all duration-300 rounded-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Code...</span>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Access Granted! Redirecting...</span>
          </>
        ) : (
          <span>Verify & Activate Account</span>
        )}
      </button>

      {/* Resend & Secondary Actions */}
      <div className="pt-2 border-t border-border flex flex-col items-center gap-3 text-xs font-sans">
        <div className="flex items-center gap-2 text-brand-stone">
          <span>Didn't receive the code?</span>
          {cooldown > 0 ? (
            <span className="font-mono text-brand-charcoal text-[11px]">
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-brand-black underline font-semibold hover:text-accent uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" /> Sending...
                </>
              ) : (
                'Resend Code'
              )}
            </button>
          )}
        </div>

        <p className="text-[11px] text-text-muted text-center leading-relaxed">
          💡 You can also click the activation button in the email sent to your inbox.
        </p>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] text-brand-stone hover:text-brand-black underline uppercase tracking-wider pt-1 cursor-pointer"
          >
            Use a different email address
          </button>
        )}
      </div>
    </div>
  )
}
