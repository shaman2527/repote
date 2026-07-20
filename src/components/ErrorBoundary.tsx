import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Repote Error]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-6">
          <div className="text-center max-w-sm space-y-4">
            <div className="size-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="size-7 text-destructive" />
            </div>
            <h1 className="text-xl font-bold">Algo salió mal</h1>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || 'Error inesperado en la aplicación'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="rounded-xl"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
