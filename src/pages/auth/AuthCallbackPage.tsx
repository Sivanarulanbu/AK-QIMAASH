import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function handleAuthCallback() {
      // 1. Check for error params in URL query or hash
      const errorParam = searchParams.get('error_description') || searchParams.get('error')
      if (errorParam) {
        if (mounted) {
          setStatus('error')
          setErrorMessage(decodeURIComponent(errorParam.replace(/\+/g, ' ')))
        }
        return
      }

      // 2. Check for PKCE auth code
      const code = searchParams.get('code')
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        } catch (err: any) {
          if (mounted) {
            setStatus('error')
            setErrorMessage(err.message || 'Failed to verify authentication code.')
          }
          return
        }
      }

      // 3. Verify session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        if (mounted) {
          setStatus('error')
          setErrorMessage(sessionError.message)
        }
        return
      }

      if (session) {
        if (mounted) {
          setStatus('success')
          setTimeout(() => {
            navigate('/account', { replace: true })
          }, 1500)
        }
      } else {
        // Wait briefly in case onAuthStateChange is processing hash
        const timeout = setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          if (retrySession) {
            if (mounted) {
              setStatus('success')
              navigate('/account', { replace: true })
            }
          } else if (mounted) {
            setStatus('success')
            navigate('/auth/login', { replace: true })
          }
        }, 1200)

        return () => clearTimeout(timeout)
      }
    }

    handleAuthCallback()

    return () => {
      mounted = false
    }
  }, [navigate, searchParams])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#FAF9F7]">
      <div className="max-w-md w-full bg-white p-8 border border-border text-center shadow-sm rounded-xs">
        {status === 'loading' && (
          <div className="py-8 space-y-4">
            <Loader2 className="w-8 h-8 text-brand-black animate-spin mx-auto" />
            <h2 className="font-editorial text-2xl uppercase tracking-tight text-brand-black">
              Verifying Private Access
            </h2>
            <p className="text-xs font-sans text-brand-stone leading-relaxed">
              Confirming your security token with the atelier...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 space-y-4 animate-fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h2 className="font-editorial text-2xl uppercase tracking-tight text-brand-black">
              Access Confirmed
            </h2>
            <p className="text-xs font-sans text-brand-stone leading-relaxed">
              Your email has been verified. Welcome to AK QIMAASH. Redirecting to your account...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 space-y-4 animate-fade-in">
            <AlertCircle className="w-10 h-10 text-error mx-auto" />
            <h2 className="font-editorial text-2xl uppercase tracking-tight text-brand-black">
              Verification Issue
            </h2>
            <p className="text-xs font-sans text-error leading-relaxed">
              {errorMessage || 'The activation link is invalid or has expired.'}
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate('/auth/login', { replace: true })}
                className="px-6 py-2.5 bg-brand-black text-white text-xs uppercase tracking-widest font-sans font-medium hover:bg-brand-charcoal transition-colors"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
