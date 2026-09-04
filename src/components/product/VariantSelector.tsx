import { cn } from '@/utils'
import type { Database } from '@/types/database'

type Variant = Database['public']['Tables']['product_variants']['Row']

interface VariantSelectorProps {
  variants: Variant[]
  selectedVariantId: string | null
  onSelect: (variant: Variant) => void
}

/** Get unique sizes from variants */
function getUniqueSizes(variants: Variant[]): string[] {
  return [...new Set(variants.filter((v) => v.size).map((v) => v.size!))]
}

/** Get unique colors (with hex) from variants */
function getUniqueColors(
  variants: Variant[]
): { color: string; hex: string | null }[] {
  const seen = new Set<string>()
  return variants
    .filter((v) => v.color)
    .reduce<{ color: string; hex: string | null }[]>((acc, v) => {
      if (!seen.has(v.color!)) {
        seen.add(v.color!)
        acc.push({ color: v.color!, hex: v.color_hex })
      }
      return acc
    }, [])
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
}: VariantSelectorProps) {
  const selectedVariant = variants.find((v) => v.id === selectedVariantId)
  const sizes = getUniqueSizes(variants)
  const colors = getUniqueColors(variants)

  const hasMultipleSizes = sizes.length > 1
  const hasMultipleColors = colors.length > 1
  const hasSingleVariant = variants.length === 1 && !sizes.length && !colors.length

  /** Check if a size is available */
  function isSizeAvailable(size: string): boolean {
    return variants.some(
      (v) => v.size === size && v.is_active && v.stock_quantity > 0
    )
  }

  /** Check if a color is available */
  function isColorAvailable(color: string): boolean {
    return variants.some(
      (v) => v.color === color && v.is_active && v.stock_quantity > 0
    )
  }

  /** Get the variant matching selected size and/or color */
  function findVariant(size?: string, color?: string): Variant | undefined {
    return variants.find(
      (v) =>
        (!size || v.size === size) &&
        (!color || v.color === color) &&
        v.is_active
    )
  }

  function handleSizeSelect(size: string) {
    const color = selectedVariant?.color ?? undefined
    const variant = findVariant(size, color) ?? findVariant(size)
    if (variant) onSelect(variant)
  }

  function handleColorSelect(color: string) {
    const size = selectedVariant?.size ?? undefined
    const variant = findVariant(size, color) ?? findVariant(undefined, color)
    if (variant) onSelect(variant)
  }

  // Auto-select if only one variant
  if (hasSingleVariant && !selectedVariantId && variants[0]) {
    onSelect(variants[0])
  }

  return (
    <div className="space-y-5">
      {/* Color selector */}
      {hasMultipleColors && (
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-sm font-medium text-text-primary">
              Colour
            </span>
            {selectedVariant?.color && (
              <span className="text-sm text-text-muted">{selectedVariant.color}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Select colour">
            {colors.map(({ color, hex }) => {
              const isSelected = selectedVariant?.color === color
              const available = isColorAvailable(color)

              return (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  disabled={!available}
                  title={color}
                  aria-label={`${color}${!available ? ' — unavailable' : ''}`}
                  aria-pressed={isSelected}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all duration-150',
                    isSelected
                      ? 'border-brand-black scale-110'
                      : 'border-transparent hover:border-brand-mist',
                    !available && 'opacity-30 cursor-not-allowed'
                  )}
                  style={{
                    backgroundColor: hex ?? '#CCCCCC',
                    boxShadow: isSelected
                      ? '0 0 0 1px white, 0 0 0 3px #0E0E0E'
                      : undefined,
                  }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      {hasMultipleSizes && (
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-sm font-medium text-text-primary">Size</span>
            <button className="text-xs text-text-muted hover:text-text-primary underline underline-offset-2">
              Size guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Select size">
            {sizes.map((size) => {
              const isSelected = selectedVariant?.size === size
              const available = isSizeAvailable(size)

              return (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  disabled={!available}
                  aria-label={`Size ${size}${!available ? ' — sold out' : ''}`}
                  aria-pressed={isSelected}
                  className={cn(
                    'min-w-[44px] h-10 px-3 text-sm font-medium',
                    'border rounded transition-all duration-150',
                    isSelected
                      ? 'border-brand-black bg-brand-black text-white'
                      : 'border-border text-text-secondary hover:border-brand-black hover:text-text-primary bg-surface-raised',
                    !available &&
                      'opacity-40 cursor-not-allowed line-through decoration-brand-slate'
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
