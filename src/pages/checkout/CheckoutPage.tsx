import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { sgAddressSchema, type SGAddressFormData } from '@/schemas'
import { calculateOrderTotals, formatPrice, COMMERCE_CONFIG } from '@/lib/commerce'
import { Input, Textarea } from '@/components/ui/FormFields'
import { Button } from '@/components/ui/Button'
import { SEOHead } from '@/components/seo/SEOHead'
import { cn } from '@/utils'
import type { Database } from '@/types/database'
import { sendOrderEmail } from '@/services/emailService'

type Step = 'address' | 'review' | 'confirm' | 'placed'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotalCents, clearCart } = useCartStore()
  const user = useAuthStore((s) => s.user)
  const [step, setStep] = useState<Step>('address')
  const [savedAddress, setSavedAddress] = useState<SGAddressFormData | null>(null)
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null)
  const [isPlacing, setIsPlacing] = useState(false)
  const [placeError, setPlaceError] = useState<string | null>(null)

  const subtotal = subtotalCents()
  const { gst, delivery, total } = calculateOrderTotals(subtotal)

  if (!user) {
    navigate('/auth/login', { state: { from: { pathname: '/checkout' } } })
    return null
  }

  if (items.length === 0 && step !== 'placed') {
    navigate('/cart')
    return null
  }

  const handleAddressSubmit = (address: SGAddressFormData) => {
    setSavedAddress(address)
    setStep('review')
  }

const LEGACY_ID_MAP: Record<string, string> = {
  'prod-1': '11111111-1111-4111-a111-111111111111',
  'prod-2': '22222222-2222-4222-a222-222222222222',
  'prod-3': '33333333-3333-4333-a333-333333333333',
  'prod-4': '44444444-4444-4444-a444-444444444444',
  'prod-5': '55555555-5555-4555-a555-555555555555',
  'prod-6': '66666666-6666-4666-a666-666666666666',
  'var-1-s-wh': '11111111-1111-4111-a111-000000000001',
  'var-1-m-wh': '11111111-1111-4111-a111-000000000002',
  'var-1-l-wh': '11111111-1111-4111-a111-000000000003',
  'var-1-s-bk': '11111111-1111-4111-a111-000000000004',
  'var-1-m-bk': '11111111-1111-4111-a111-000000000005',
  'var-1-l-bk': '11111111-1111-4111-a111-000000000006',
  'var-2-xs': '22222222-2222-4222-a222-000000000001',
  'var-2-s': '22222222-2222-4222-a222-000000000002',
  'var-2-m': '22222222-2222-4222-a222-000000000003',
  'var-2-l': '22222222-2222-4222-a222-000000000004',
  'var-3-s-bk': '33333333-3333-4333-a333-000000000001',
  'var-3-m-bk': '33333333-3333-4333-a333-000000000002',
  'var-3-l-bk': '33333333-3333-4333-a333-000000000003',
  'var-4-s': '44444444-4444-4444-a444-000000000001',
  'var-4-m': '44444444-4444-4444-a444-000000000002',
  'var-4-l': '44444444-4444-4444-a444-000000000003',
  'var-5-s': '55555555-5555-4555-a555-000000000001',
  'var-5-m': '55555555-5555-4555-a555-000000000002',
  'var-6-one': '66666666-6666-4666-a666-000000000001',
}

function resolveUUID(id: string): string {
  return LEGACY_ID_MAP[id] || id
}

  const handlePlaceOrder = async () => {
    if (!savedAddress || !user) return
    setIsPlacing(true)
    setPlaceError(null)

    try {
      // Ensure user has profile row
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email ?? '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
        } as any)
      }

      // Create order
      const orderPayload = {
        user_id: user.id,
        address_snapshot: savedAddress as any,
        status: 'PLACED' as const,
        payment_method: 'COD' as const,
        payment_status: 'PENDING' as const,
        subtotal_cents: subtotal,
        gst_cents: gst,
        delivery_cents: delivery,
        total_cents: total,
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload as any)
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items with resolved UUIDs
      const orderItems = items.map((item) => ({
        order_id: (order as any).id,
        variant_id: resolveUUID(item.variantId),
        product_id: resolveUUID(item.productId),
        product_name: item.productName,
        variant_sku: item.variantSku,
        variant_size: item.variantSize ?? null,
        variant_color: item.variantColor ?? null,
        quantity: item.quantity,
        unit_price_cents: item.priceCents,
        total_price_cents: item.priceCents * item.quantity,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems as any)
      if (itemsError) throw itemsError

      // Insert initial status history
      await supabase.from('order_status_history').insert({
        order_id: (order as any).id,
        status: 'PLACED' as const,
        note: 'Order placed by customer',
        created_by: user.id,
      } as any)

      // Trigger Order Confirmation Email (via Edge function or resilient Brevo fallback)
      sendOrderEmail({
        orderId: (order as any).id,
        orderNumber: (order as any).order_number,
        status: 'PLACED',
        customerEmail: user.email,
        customerName: (savedAddress as any)?.recipient_name || user.user_metadata?.full_name || 'Customer',
        totals: {
          subtotal_cents: subtotal,
          gst_cents: gst,
          delivery_cents: delivery,
          total_cents: total,
        },
        address: savedAddress as any,
        paymentMethod: 'COD',
        items: items.map((item) => ({
          product_name: item.productName,
          variant_size: item.variantSize ?? null,
          variant_color: item.variantColor ?? null,
          quantity: item.quantity,
          unit_price_cents: item.priceCents,
          total_price_cents: item.priceCents * item.quantity,
        })),
      }).catch((err) => {
        console.warn('Order email dispatch warning:', err)
      })

      setPlacedOrderNumber((order as any).order_number)
      clearCart()
      setStep('placed')
    } catch (err: any) {
      console.error('Order placement failed:', err)
      setPlaceError(err?.message || 'Failed to place order. Please try again or contact support.')
    } finally {
      setIsPlacing(false)
    }
  }

  return (
    <>
      <SEOHead title="Checkout — AK QIMAASH" description="Complete your order." canonical="/checkout" />
      <div className="container-main py-6 max-w-4xl">
        {step === 'placed' && placedOrderNumber ? (
          <div className="max-w-lg mx-auto py-8">
            <OrderPlacedStep orderNumber={placedOrderNumber} />
          </div>
        ) : (
          <>
            {/* Steps */}
            <CheckoutSteps currentStep={step} />

            {/* Step content */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 mt-8">
              <div>
                {step === 'address' && (
                  <AddressStep onSubmit={handleAddressSubmit} />
                )}
                {step === 'review' && savedAddress && (
                  <ReviewStep
                    address={savedAddress}
                    onBack={() => setStep('address')}
                    onConfirm={() => setStep('confirm')}
                  />
                )}
                {step === 'confirm' && savedAddress && (
                  <ConfirmStep
                    address={savedAddress}
                    onBack={() => setStep('review')}
                    onPlace={handlePlaceOrder}
                    isPlacing={isPlacing}
                    error={placeError}
                  />
                )}
              </div>

              {/* Order summary sidebar */}
              <div>
                <OrderSummary items={items} subtotal={subtotal} gst={gst} delivery={delivery} total={total} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

function CheckoutSteps({ currentStep }: { currentStep: Step }) {
  const steps = [
    { id: 'address', label: 'Address' },
    { id: 'review', label: 'Review' },
    { id: 'confirm', label: 'Confirm' },
  ]
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <nav aria-label="Checkout progress">
      <ol className="flex items-center justify-center gap-0">
        {steps.map((step, i) => (
          <li key={step.id} className="flex items-center">
            <span
              className={cn(
                'text-sm font-medium px-3 py-1 rounded',
                i === currentIndex ? 'text-text-primary' : i < currentIndex ? 'text-text-muted' : 'text-text-disabled'
              )}
              aria-current={i === currentIndex ? 'step' : undefined}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-border-strong mx-1 text-xs">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function AddressStep({ onSubmit }: { onSubmit: (data: SGAddressFormData) => void }) {
  const user = useAuthStore((s) => s.user)
  const { register, handleSubmit, formState: { errors } } = useForm<SGAddressFormData>({ // eslint-disable-line
    resolver: zodResolver(sgAddressSchema) as any,
    defaultValues: { is_default: false },
  })

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-5">Delivery address</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Recipient name" {...register('recipient_name')} error={errors.recipient_name?.message} required />
          <Input label="Phone number" type="tel" placeholder="+65 9123 4567" {...register('phone')} error={errors.phone?.message} required hint="Singapore number" />
        </div>
        <Input label="Block / Building name" {...register('block_building')} error={errors.block_building?.message} />
        <Input label="Street address" {...register('street')} error={errors.street?.message} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Unit number" placeholder="#01-01" {...register('unit_number')} error={errors.unit_number?.message} />
          <Input label="Postal code" placeholder="6-digit code" maxLength={6} {...register('postal_code')} error={errors.postal_code?.message} required />
        </div>
        <Textarea label="Delivery instructions (optional)" placeholder="Any special instructions for our courier" {...register('additional_info')} error={errors.additional_info?.message} />

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Continue to Review
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
    </div>
  )
}

function ReviewStep({
  address,
  onBack,
  onConfirm,
}: {
  address: SGAddressFormData
  onBack: () => void
  onConfirm: () => void
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-5">Delivery details</h2>
      <div className="card p-5 mb-5">
        <p className="text-sm font-medium text-text-primary mb-1">{address.recipient_name}</p>
        <p className="text-sm text-text-secondary">{address.phone}</p>
        <p className="text-sm text-text-secondary mt-1">
          {[address.block_building, address.street].filter(Boolean).join(', ')}
          {address.unit_number && `, ${address.unit_number}`}
        </p>
        <p className="text-sm text-text-secondary">Singapore {address.postal_code}</p>
        {address.additional_info && (
          <p className="text-sm text-text-muted mt-2">{address.additional_info}</p>
        )}
      </div>

      <div className="card p-5 mb-5">
        <h3 className="text-sm font-medium text-text-primary mb-3">Payment method</h3>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-brand-black flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-brand-black rounded-full" />
          </div>
          <span className="text-sm text-text-secondary">Cash on Delivery</span>
        </div>
        <p className="text-xs text-text-muted mt-2 ml-7">
          Pay with cash when your order is delivered.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" size="lg" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        <Button variant="primary" size="lg" onClick={onConfirm} className="flex-1">
          Confirm Order
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

function ConfirmStep({
  address,
  onBack,
  onPlace,
  isPlacing,
  error,
}: {
  address: SGAddressFormData
  onBack: () => void
  onPlace: () => void
  isPlacing: boolean
  error: string | null
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-2">Place your order</h2>
      <p className="text-sm text-text-muted mb-5">
        Review and confirm. Payment is collected on delivery.
      </p>

      <div className="card p-4 bg-accent-subtle border-accent/30 mb-5">
        <p className="text-sm font-medium text-accent-dark mb-1">Cash on Delivery</p>
        <p className="text-sm text-text-secondary">
          Have the exact amount ready when your order arrives. Our delivery partner will collect payment at your door.
        </p>
      </div>

      {error && (
        <div role="alert" className="p-3 bg-error-light border border-error/20 rounded text-sm text-error-dark mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" size="lg" onClick={onBack} className="flex-1" disabled={isPlacing}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onPlace}
          className="flex-1"
          isLoading={isPlacing}
        >
          Place Order
        </Button>
      </div>
    </div>
  )
}

function OrderPlacedStep({ orderNumber }: { orderNumber: string }) {
  const navigate = useNavigate()

  return (
    <div className="card p-8 md:p-12 text-center border border-border shadow-sm">
      <div className="w-16 h-16 rounded-full bg-success-light/30 flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="h-9 w-9 text-success" aria-hidden="true" />
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight mb-3">
        Order placed successfully
      </h2>
      <p className="text-xs text-text-muted uppercase tracking-wider mb-1 font-medium">Order number</p>
      <div className="inline-block bg-surface-sunken px-4 py-1.5 rounded mb-5">
        <p className="text-base md:text-lg font-mono font-semibold text-text-primary tracking-wide">
          {orderNumber}
        </p>
      </div>
      <p className="text-sm text-text-secondary max-w-sm mx-auto mb-8 leading-relaxed">
        You'll receive a confirmation email shortly. Your order will be delivered within 2–4 business days.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="primary" size="lg" onClick={() => navigate('/account/orders')} className="min-w-[160px]">
          View Order
        </Button>
        <Button variant="secondary" size="lg" onClick={() => navigate('/shop')} className="min-w-[160px]">
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}

function OrderSummary({ items, subtotal, gst, delivery, total }: {
  items: ReturnType<typeof useCartStore.getState>['items']
  subtotal: number
  gst: number
  delivery: number
  total: number
}) {
  return (
    <div className="card p-5 h-fit">
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Order summary ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h3>
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-14 h-14 bg-surface-sunken rounded overflow-hidden flex-shrink-0">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" loading="lazy" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary line-clamp-2 leading-snug">{item.productName}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {[item.variantSize, item.variantColor].filter(Boolean).join(' · ')}
                {' '}&times;{item.quantity}
              </p>
              <p className="text-xs font-semibold text-text-primary mt-0.5">
                {formatPrice(item.priceCents * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex justify-between text-sm text-text-secondary">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-text-secondary">
          <span>GST (9%)</span>
          <span>{formatPrice(gst)}</span>
        </div>
        <div className="flex justify-between text-sm text-text-secondary">
          <span>Delivery</span>
          <span>{delivery === 0 ? <span className="text-success">Free</span> : formatPrice(delivery)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-text-primary pt-1.5 border-t border-border">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
