import { useState, type ImgHTMLAttributes } from 'react'
import { cn } from '@/utils'

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

export function ImageWithFallback({
  src,
  alt = '',
  className,
  fallbackSrc = '/images/products/french-linen-shirt.jpg',
  ...props
}: ImageWithFallbackProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const activeSrc = hasError ? fallbackSrc : src

  return (
    <div className="relative w-full h-full overflow-hidden bg-surface-sunken">
      {/* Skeleton shimmer while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-brand-smoke/70 animate-pulse" />
      )}

      <img
        src={activeSrc}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true)
            setIsLoaded(true)
          }
        }}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  )
}
