import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { sgAddressSchema, type SGAddressFormData } from '@/schemas'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils'

interface Props {
  onSubmit: (data: SGAddressFormData) => void
  defaultValues?: Partial<SGAddressFormData> | null
}

export function AtelierAddressStep({ onSubmit, defaultValues }: Props) {
  const [showInstructions, setShowInstructions] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SGAddressFormData>({
    resolver: zodResolver(sgAddressSchema) as any,
    defaultValues: {
      is_default: false,
      ...defaultValues,
    },
  })

  return (
    <div className="space-y-6">
      {/* Simple, Neat Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
          Delivery Address
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Please enter your delivery details in Singapore.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Recipient Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans font-medium text-text-primary mb-1.5">
              Recipient name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sivan Arul"
              {...register('recipient_name')}
              className={cn(
                'input-base text-sm',
                errors.recipient_name && 'border-error bg-error-light/10'
              )}
            />
            {errors.recipient_name && (
              <p className="mt-1 text-xs text-error">{errors.recipient_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-sans font-medium text-text-primary mb-1.5">
              Phone number <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-sans font-medium text-text-secondary">
                +65
              </span>
              <input
                type="tel"
                placeholder="9123 4567"
                {...register('phone')}
                className={cn(
                  'input-base pl-12 text-sm',
                  errors.phone && 'border-error bg-error-light/10'
                )}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-error">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Building / Estate name (Optional) */}
        <div>
          <label className="block text-xs font-sans font-medium text-text-primary mb-1.5">
            Block / Building name <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Marina Bay Residences"
            {...register('block_building')}
            className="input-base text-sm"
          />
        </div>

        {/* Street Address */}
        <div>
          <label className="block text-xs font-sans font-medium text-text-primary mb-1.5">
            Street address <span className="text-error">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 18 Marina Boulevard"
            {...register('street')}
            className={cn(
              'input-base text-sm',
              errors.street && 'border-error bg-error-light/10'
            )}
          />
          {errors.street && (
            <p className="mt-1 text-xs text-error">{errors.street.message}</p>
          )}
        </div>

        {/* Unit & Postal Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans font-medium text-text-primary mb-1.5">
              Unit number <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="#01-01"
              {...register('unit_number')}
              className="input-base text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-sans font-medium text-text-primary mb-1.5">
              Postal code <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="6-digit code"
              maxLength={6}
              {...register('postal_code')}
              className={cn(
                'input-base text-sm',
                errors.postal_code && 'border-error bg-error-light/10'
              )}
            />
            {errors.postal_code && (
              <p className="mt-1 text-xs text-error">{errors.postal_code.message}</p>
            )}
          </div>
        </div>

        {/* Delivery instructions toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-xs font-sans text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{showInstructions ? 'Hide' : '+ Add'} delivery instructions (optional)</span>
            {showInstructions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showInstructions && (
            <div className="mt-2">
              <textarea
                rows={2}
                placeholder="Any special instructions for courier (e.g. leave at door, gate code)"
                {...register('additional_info')}
                className="w-full p-3 text-sm bg-surface-raised border border-border rounded focus:border-accent focus:outline-none resize-none"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-11 text-sm font-medium flex items-center justify-center gap-2"
          >
            <span>Continue to Review</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  )
}
