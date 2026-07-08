import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Captura errores de render en el árbol de componentes hijo.
 * Evita que un error aislado tumbe toda la app.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Aquí se conectará Sentry cuando esté configurado
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100dvh',
            background: '#0b1a0b',
            color: '#f0e4c8',
            padding: '32px',
            textAlign: 'center',
            gap: '16px',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', color: '#c4972a', margin: 0 }}>
            Algo ha ido mal
          </h1>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '14px', color: '#7a9070', margin: 0 }}>
            Reinicia la aplicación para continuar.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              padding: '12px 24px',
              background: '#c4972a',
              border: 'none',
              borderRadius: '10px',
              color: '#0b1a0b',
              fontFamily: "'Cinzel', serif",
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              letterSpacing: '.5px',
            }}
          >
            REINICIAR
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
