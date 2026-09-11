import { useState } from 'react'
import { Mail, Copy, Check, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react'

// Supabase project ID derived dynamically from env
const SUPABASE_PROJECT_ID =
  import.meta.env.VITE_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'gfodfostfihtvkkezfoq'
const SUPABASE_EMAIL_TEMPLATES_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/auth/templates`
const SUPABASE_SECRETS_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/functions`

interface AuthTemplateInfo {
  id: string
  name: string
  subject: string
  description: string
  file: string
  supabaseTabName: string
}

const AUTH_TEMPLATES: AuthTemplateInfo[] = [
  {
    id: 'confirm_signup',
    name: 'Confirm Signup',
    subject: 'Confirm Your Email — AK QIMAASH',
    description: 'Sent when a new customer registers on your store. Contains activation link & 6-digit code.',
    file: 'supabase/auth-templates/1_confirm_signup.html',
    supabaseTabName: 'Confirm signup',
  },
  {
    id: 'reset_password',
    name: 'Reset Password',
    subject: 'Reset Your Password — AK QIMAASH',
    description: 'Sent when a user requests password recovery. Contains a 1-hour secure reset token link.',
    file: 'supabase/auth-templates/2_reset_password.html',
    supabaseTabName: 'Reset password',
  },
  {
    id: 'magic_link',
    name: 'Magic Link',
    subject: 'Your Magic Sign-In Link — AK QIMAASH',
    description: 'Sent when a user requests passwordless sign-in with a one-click magic link.',
    file: 'supabase/auth-templates/3_magic_link.html',
    supabaseTabName: 'Magic Link',
  },
  {
    id: 'invite_user',
    name: 'Invite User',
    subject: "You're Invited to AK QIMAASH",
    description: 'Sent when an administrator invites a new team member or VIP client.',
    file: 'supabase/auth-templates/4_invite_user.html',
    supabaseTabName: 'Invite user',
  },
  {
    id: 'change_email',
    name: 'Change Email Address',
    subject: 'Confirm Email Change — AK QIMAASH',
    description: 'Sent when an existing user updates their primary login email address.',
    file: 'supabase/auth-templates/5_change_email.html',
    supabaseTabName: 'Change email address',
  },
]

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'store' | 'emails'>('emails')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyTemplate = async (template: AuthTemplateInfo) => {
    try {
      // Fetch the raw template file from public/dev server or fallback notice
      const res = await fetch(`/${template.file.replace('supabase/auth-templates/', 'auth-templates/')}`)
      if (res.ok) {
        const html = await res.text()
        await navigator.clipboard.writeText(html)
      } else {
        // Direct fallback instructions
        await navigator.clipboard.writeText(`See file: ${template.file}`)
      }
      setCopiedId(template.id)
      setTimeout(() => setCopiedId(null), 2500)
    } catch {
      setCopiedId(template.id)
      setTimeout(() => setCopiedId(null), 2500)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Settings</h1>
        <p className="text-sm text-text-muted mt-0.5">
          Store configuration, payment options, and transactional email setup.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab('emails')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'emails'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email System & Auth Templates
        </button>
        <button
          onClick={() => setActiveTab('store')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'store'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Commerce & Delivery
        </button>
      </div>

      {activeTab === 'emails' ? (
        <div className="space-y-6">
          {/* Important Explanation Card */}
          <div className="p-5 rounded-xl bg-surface-raised border border-border shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-sm font-semibold text-text-primary">
                Why Are Users Seeing Default Supabase Emails?
              </h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Supabase Auth emails (Signup Confirmation, Password Reset, Magic Links) are delivered directly by Supabase’s built-in authentication server. Supabase uses its own default plain-text email templates unless you paste your custom HTML templates into your <strong>Supabase Dashboard</strong>.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={SUPABASE_EMAIL_TEMPLATES_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-sm btn-primary inline-flex items-center gap-1.5"
              >
                Open Supabase Email Templates <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="file:///C:/Users/hello/Downloads/AK/supabase/functions/_shared/email-preview.html"
                target="_blank"
                rel="noreferrer"
                className="btn-sm btn-secondary inline-flex items-center gap-1.5"
              >
                Preview All Email Templates <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Step-by-Step Setup */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-semibold text-text-primary tracking-tight">
              1. Supabase Auth Templates (Signup & Password Reset)
            </h3>
            <p className="text-xs text-text-muted">
              Copy each template file below from your project directory{' '}
              <code className="bg-surface-sunken px-1.5 py-0.5 rounded font-mono text-text-primary">
                supabase/auth-templates/
              </code>{' '}
              and paste it into the matching slot in the Supabase Dashboard:
            </p>

            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {AUTH_TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface hover:bg-surface-sunken/30 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{tmpl.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-surface-sunken text-text-muted font-mono">
                        {tmpl.supabaseTabName}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">{tmpl.description}</p>
                    <p className="text-xs text-accent font-medium">Subject: {tmpl.subject}</p>
                    <p className="text-[11px] font-mono text-text-muted">File: {tmpl.file}</p>
                  </div>

                  <a
                    href={SUPABASE_EMAIL_TEMPLATES_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-xs btn-secondary shrink-0 inline-flex items-center gap-1"
                  >
                    Configure in Supabase <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Brevo SMTP & API Configuration Section */}
          <div className="card p-6 space-y-5 border-l-4 border-l-accent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📫</span>
                <div>
                  <h3 className="text-base font-semibold text-text-primary tracking-tight">
                    Brevo Setup (SMTP & Transactional API)
                  </h3>
                  <p className="text-xs text-text-muted">
                    Use Brevo for both Supabase Auth emails (Signup/Password Reset) and Store Order emails.
                  </p>
                </div>
              </div>
              <a
                href="https://app.brevo.com/settings/keys/smtp"
                target="_blank"
                rel="noreferrer"
                className="btn-xs btn-primary inline-flex items-center gap-1"
              >
                Get Brevo SMTP Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Part A: Supabase Auth SMTP */}
            <div className="p-4 rounded-lg bg-surface-sunken border border-border space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-caps text-text-primary">
                  A. Configure Brevo for Supabase Auth (Sign Up & Password Reset)
                </p>
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/auth`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                >
                  Open Supabase SMTP Settings <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-text-secondary">
                In Supabase Dashboard ➔ <strong>Settings</strong> ➔ <strong>Authentication</strong> ➔ scroll to <strong>SMTP Settings</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-surface p-2.5 rounded border border-border">
                  <span className="text-text-muted block text-[10px] uppercase">Enable Custom SMTP</span>
                  <span className="font-mono text-emerald-600 font-semibold">Enabled (Turn ON)</span>
                </div>
                <div className="bg-surface p-2.5 rounded border border-border">
                  <span className="text-text-muted block text-[10px] uppercase">Sender Email</span>
                  <span className="font-mono text-text-primary">Your Brevo verified email (e.g. orders@akqimaash.sg)</span>
                </div>
                <div className="bg-surface p-2.5 rounded border border-border">
                  <span className="text-text-muted block text-[10px] uppercase">SMTP Host</span>
                  <span className="font-mono text-text-primary">smtp-relay.brevo.com</span>
                </div>
                <div className="bg-surface p-2.5 rounded border border-border">
                  <span className="text-text-muted block text-[10px] uppercase">Port</span>
                  <span className="font-mono text-text-primary">587</span>
                </div>
                <div className="bg-surface p-2.5 rounded border border-border">
                  <span className="text-text-muted block text-[10px] uppercase">User</span>
                  <span className="font-mono text-text-primary">Your Brevo account login email</span>
                </div>
                <div className="bg-surface p-2.5 rounded border border-border">
                  <span className="text-text-muted block text-[10px] uppercase">Password</span>
                  <span className="font-mono text-text-primary">Your Brevo SMTP key (from app.brevo.com)</span>
                </div>
              </div>
            </div>

            {/* Part B: Order Confirmation via Edge Function */}
            <div className="p-4 rounded-lg bg-surface-sunken border border-border space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-caps text-text-primary">
                  B. Configure Brevo for Order Emails (send-order-email Edge Function)
                </p>
                <a
                  href={SUPABASE_SECRETS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                >
                  Open Supabase Function Secrets <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-text-secondary">
                To send automatic order confirmation & tracking emails via Brevo:
              </p>
              <div className="space-y-1.5 text-xs text-text-secondary">
                <p>1. In <a href={SUPABASE_SECRETS_URL} target="_blank" rel="noreferrer" className="text-accent underline">Supabase Edge Function Secrets</a>, add secret name: <code className="font-mono bg-surface px-1 py-0.5 rounded border border-border text-text-primary">BREVO_API_KEY</code>.</p>
                <p>2. Optionally set <code className="font-mono bg-surface px-1 py-0.5 rounded border border-border text-text-primary">EMAIL_FROM_ADDRESS</code> to your verified Brevo sender email.</p>
                <p>3. Deploy the edge function: <code className="font-mono bg-surface px-1.5 py-0.5 rounded border border-border text-text-primary">supabase functions deploy send-order-email</code></p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Commerce</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-caps">GST Rate</p>
                <p className="text-sm font-medium text-text-primary mt-1">
                  {(parseFloat(import.meta.env.VITE_GST_RATE || '0.09') * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-text-muted mt-0.5">Set via VITE_GST_RATE env var</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-caps">Delivery Fee</p>
                <p className="text-sm font-medium text-text-primary mt-1">
                  S${(parseInt(import.meta.env.VITE_DELIVERY_FEE_CENTS || '500') / 100).toFixed(2)}
                </p>
                <p className="text-xs text-text-muted mt-0.5">Set via VITE_DELIVERY_FEE_CENTS env var</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-caps">Free Delivery Threshold</p>
                <p className="text-sm font-medium text-text-primary mt-1">
                  S${(parseInt(import.meta.env.VITE_FREE_DELIVERY_THRESHOLD_CENTS || '10000') / 100).toFixed(2)}
                </p>
                <p className="text-xs text-text-muted mt-0.5">Set via VITE_FREE_DELIVERY_THRESHOLD_CENTS env var</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-caps">Currency</p>
                <p className="text-sm font-medium text-text-primary mt-1">SGD</p>
                <p className="text-xs text-text-muted mt-0.5">Singapore Dollar</p>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="text-sm font-semibold text-text-primary">Payment</h2>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-caps">Active methods</p>
              <p className="text-sm font-medium text-text-primary mt-1">Cash on Delivery</p>
            </div>
            <p className="text-xs text-text-muted">Stripe / PayNow integration is prepared in the schema and can be activated without schema changes.</p>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="text-sm font-semibold text-text-primary">Delivery</h2>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-caps">Coverage</p>
              <p className="text-sm font-medium text-text-primary mt-1">Singapore</p>
            </div>
            <p className="text-xs text-text-muted">Ninja Van and SingPost courier integrations are prepared in the schema.</p>
          </div>
        </div>
      )}
    </div>
  )
}
