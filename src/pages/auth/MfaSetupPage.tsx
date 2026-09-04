import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/FormFields'
import { SEOHead } from '@/components/seo/SEOHead'
import { ShieldCheck, Copy, Check, AlertTriangle } from 'lucide-react'

type EnrollStep = 'intro' | 'scan' | 'verify' | 'success'

export function MfaSetupPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setMfaEnrolled = useAuthStore((s) => s.setMfaEnrolled)

  const [step, setStep] = useState<EnrollStep>('intro')
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [factorId, setFactorId] = useState<string>('')
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!user) {
    navigate('/auth/login')
    return null
  }

  const handleEnroll = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'AK QIMAASH Admin',
      })
      if (enrollError) throw enrollError
      if (!data) throw new Error('No enrollment data received')

      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setFactorId(data.id)
      setStep('scan')
    } catch (err: any) {
      setError(err.message || 'Failed to start enrollment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (verifyCode.length !== 6) return

    setIsLoading(true)
    setError(null)
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      })
      if (verifyError) throw verifyError

      setMfaEnrolled(true)
      setStep('success')
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.')
      setVerifyCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <SEOHead title="Set Up MFA — AK QIMAASH" description="Enable two-factor authentication for your admin account." />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-accent-subtle flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-accent" />
            </div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              {step === 'success' ? 'MFA Enabled!' : 'Two-Factor Authentication'}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {step === 'intro' && 'Add an extra layer of security to your admin account.'}
              {step === 'scan' && 'Scan the QR code with your authenticator app.'}
              {step === 'verify' && 'Enter the 6-digit code from your app.'}
              {step === 'success' && 'Your account is now protected with MFA.'}
            </p>
          </div>

          <div className="card p-6 shadow-sm">
            {/* ── Intro Step ── */}
            {step === 'intro' && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <Feature icon="🔒" title="Stronger Security" desc="Prevent unauthorized access even if your password is compromised." />
                  <Feature icon="📱" title="Authenticator App" desc="Works with Google Authenticator, Authy, 1Password, and more." />
                  <Feature icon="⚡" title="Quick Setup" desc="Takes less than 2 minutes to configure." />
                </div>

                {error && <ErrorAlert message={error} />}

                <Button variant="primary" size="lg" className="w-full" onClick={handleEnroll} isLoading={isLoading}>
                  Set Up MFA
                </Button>
              </div>
            )}

            {/* ── Scan Step ── */}
            {step === 'scan' && (
              <div className="space-y-5">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-xl border border-border shadow-xs">
                    <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                  </div>
                </div>

                {/* Manual entry */}
                <div className="bg-surface-sunken rounded-lg p-3">
                  <p className="text-xs text-text-muted mb-1.5">Can't scan? Enter this key manually:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-text-secondary bg-surface-raised px-2 py-1.5 rounded border border-border truncate select-all">
                      {secret}
                    </code>
                    <button
                      onClick={copySecret}
                      className="btn-icon btn-ghost flex-shrink-0"
                      aria-label="Copy secret"
                    >
                      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button variant="primary" size="lg" className="w-full" onClick={() => setStep('verify')}>
                  I've Scanned the Code
                </Button>
              </div>
            )}

            {/* ── Verify Step ── */}
            {step === 'verify' && (
              <form onSubmit={handleVerify} className="space-y-5">
                {error && <ErrorAlert message={error} />}

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    autoFocus
                    className="input-base text-center text-2xl font-mono tracking-[0.3em] py-3"
                    autoComplete="one-time-code"
                  />
                  <p className="text-xs text-text-muted mt-1.5">
                    Enter the 6-digit code from your authenticator app.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={verifyCode.length !== 6}
                >
                  Verify & Enable MFA
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep('scan'); setError(null) }}
                  className="block text-center text-sm text-text-muted hover:text-text-primary w-full"
                >
                  ← Back to QR Code
                </button>
              </form>
            )}

            {/* ── Success Step ── */}
            {step === 'success' && (
              <div className="space-y-5 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-success-light flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-success" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Two-factor authentication is now active. You'll be asked for a code from your
                    authenticator app each time you sign in to the admin portal.
                  </p>
                </div>

                <div className="bg-warning-light/50 border border-warning/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-warning-dark leading-relaxed">
                      <strong>Important:</strong> If you lose access to your authenticator app,
                      you'll need to contact support to regain access to your account.
                    </p>
                  </div>
                </div>

                <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/admin')}>
                  Go to Admin Portal
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-surface-sunken rounded-lg">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-muted mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="p-3 bg-error-light border border-error/20 rounded text-sm text-error-dark">
      {message}
    </div>
  )
}
