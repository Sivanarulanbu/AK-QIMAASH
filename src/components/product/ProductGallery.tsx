import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/utils'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import type { Database } from '@/types/database'

type ProductImage = Database['public']['Tables']['product_images']['Row']

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }, [images.length])

  const next = useCallback(() => {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }, [images.length])

  if (images.length === 0) {
    return (
      <div className="aspect-product bg-surface-sunken rounded-lg flex items-center justify-center">
        <span className="text-sm text-text-disabled">No images available</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-product bg-surface-sunken rounded-lg overflow-hidden group">
        <ImageWithFallback
          src={images[activeIndex]?.url}
          alt={images[activeIndex]?.alt || `${productName} — image ${activeIndex + 1}`}
          loading={activeIndex === 0 ? 'eager' : 'lazy'}
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                'w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full',
                'flex items-center justify-center shadow-sm',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                'hover:bg-white'
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full',
                'flex items-center justify-center shadow-sm',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                'hover:bg-white'
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 text-xs text-white bg-brand-black/50
                           backdrop-blur-sm px-2 py-0.5 rounded-full">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors duration-150',
                activeIndex === index
                  ? 'border-brand-black'
                  : 'border-transparent hover:border-brand-mist'
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={activeIndex === index}
            >
              <img
                src={image.url}
                alt={image.alt || `${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
