import React, { Component, type ReactNode } from 'react'
import { logger } from '@/utils/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Unhandled React rendering error caught by ErrorBoundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] px-4 py-16">
          <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-xs border border-border/80 shadow-sm">
            <p className="text-[11px] font-sans uppercase tracking-[0.25em] text-accent font-medium">
              AK QIMAASH Atelier
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl text-brand-black uppercase tracking-tight font-medium">
              An Unexpected Interruption
            </h1>
            <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed font-light">
              We encountered a temporary disruption loading this section. Our technical team has been notified.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-6 py-3 bg-brand-black text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors rounded-xs"
              >
                Return to Store
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-6 py-3 border border-border text-brand-black text-xs uppercase tracking-widest font-medium hover:bg-brand-smoke transition-colors rounded-xs"
              >
                Reload View
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
