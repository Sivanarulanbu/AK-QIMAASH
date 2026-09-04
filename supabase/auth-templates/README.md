# Supabase Auth Email Templates Setup Guide

Supabase Auth sends emails directly through its authentication engine (GoTrue). To ensure users receive the bespoke **AK QIMAASH** luxury templates instead of the default generic Supabase emails, you must copy and paste each template into your Supabase Project Dashboard.

---

## Where to Configure in Supabase Dashboard

1. Open your Supabase Dashboard:
   👉 **[https://supabase.com/dashboard/project/ysabisrtgnmtiuioljpw/auth/templates](https://supabase.com/dashboard/project/ysabisrtgnmtiuioljpw/auth/templates)**
2. In the left navigation, go to **Authentication** ➔ **Email Templates**.
3. For each template below:
   - Select the template type.
   - Update the **Subject**.
   - Paste the contents of the matching HTML file into the **Body** editor.
   - Click **Save**.

---

## Templates Mapping

| Supabase Template Name | Subject | Source File |
|---|---|---|
| **Confirm signup** | `Confirm Your Email — AK QIMAASH` | [`1_confirm_signup.html`](./1_confirm_signup.html) |
| **Reset password** | `Reset Your Password — AK QIMAASH` | [`2_reset_password.html`](./2_reset_password.html) |
| **Magic Link** | `Your Magic Sign-In Link — AK QIMAASH` | [`3_magic_link.html`](./3_magic_link.html) |
| **Invite user** | `You're Invited to AK QIMAASH` | [`4_invite_user.html`](./4_invite_user.html) |
| **Change email address** | `Confirm Email Change — AK QIMAASH` | [`5_change_email.html`](./5_change_email.html) |

---

## Supported Supabase Template Variables
These templates already include the required GoTrue variables:
- `{{ .ConfirmationURL }}` — Direct magic action link (confirms signup, resets password, etc.)
- `{{ .Token }}` — 6-digit numeric OTP / verification code fallback
- `{{ .SiteURL }}` — Base website URL
