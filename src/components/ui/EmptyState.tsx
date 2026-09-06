import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Heart, Search } from 'lucide-react'
import { cn } from '@/utils'

interface EmptyStateProps {
  type: 'wishlist' | 'bag' | 'search' | 'generic'
  title?: string
  description?: string
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
  query?: string
  className?: string
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  query,
  className,
}: EmptyStateProps) {
  // Defaults per type matching the design guidelines
  let defaultTitle = title
  let defaultDescription = description
  let defaultActionLabel = actionLabel
  let defaultActionTo = actionTo || '/shop'
  let Icon = ShoppingBag

  if (type === 'wishlist') {
    Icon = Heart
    defaultTitle = defaultTitle || 'YOUR WISHLIST'
    defaultDescription = defaultDescription || 'Your saved pieces will appear here.'
    defaultActionLabel = defaultActionLabel || 'EXPLORE COLLECTION'
  } else if (type === 'bag') {
    Icon = ShoppingBag
    defaultTitle = defaultTitle || 'YOUR BAG IS EMPTY'
    defaultDescription =
      defaultDescription || 'Discover pieces selected for your everyday elegance.'
    defaultActionLabel = defaultActionLabel || 'SHOP NEW ARRIVALS'
    defaultActionTo = '/shop?sort=newest'
  } else if (type === 'search') {
    Icon = Search
    defaultTitle = defaultTitle || 'NO RESULTS'
    defaultDescription =
      defaultDescription ||
      (query
        ? `We couldn't find anything matching "${query}".`
        : "We couldn't find anything matching your search criteria.")
    defaultActionLabel = defaultActionLabel || 'CLEAR SEARCH'
  }

  return (
    <div className={cn('py-16 sm:py-24 text-center max-w-md mx-auto px-4', className)}>
      <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center rounded-full bg-brand-ivory text-brand-black/70">
        <Icon className="h-5 w-5 stroke-[1.5]" />
      </div>

      <h3 className="font-editorial text-2xl sm:text-3xl tracking-tight text-brand-black font-medium mb-3 uppercase">
        {defaultTitle}
      </h3>

      <p className="text-sm font-sans text-text-secondary leading-relaxed mb-8 max-w-xs mx-auto">
        {defaultDescription}
      </p>

      {onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-black text-brand-white text-xs uppercase tracking-widest font-sans font-medium hover:bg-brand-charcoal transition-colors duration-200"
        >
          {defaultActionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      ) : defaultActionTo ? (
        <Link
          to={defaultActionTo}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-black text-brand-white text-xs uppercase tracking-widest font-sans font-medium hover:bg-brand-charcoal transition-colors duration-200"
        >
          {defaultActionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  )
}
