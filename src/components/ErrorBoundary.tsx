import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let displayMessage = "Something went wrong with the neural link. Please restart the protocol.";
      
      try {
        if (this.state.error?.message) {
          const parsedError = JSON.parse(this.state.error.message);
          if (parsedError.error && parsedError.operationType) {
            displayMessage = `Communication Error [${parsedError.operationType}]: The system could not sync with the database at path '${parsedError.path}'. Check your connection or permissions.`;
          }
        }
      } catch (e) {
        // Fallback to default message if not a JSON firestore error
      }

      return (
        <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full bg-bg-card border border-red-500/20 rounded-[48px] p-12 text-center space-y-8 shadow-[0_32px_128px_-16px_rgba(239,68,68,0.1)] relative z-10"
          >
            <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto shadow-xl">
              <AlertTriangle size={48} />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white tracking-tight uppercase italic underline decoration-red-500 underline-offset-8">Critical Abort</h2>
              <p className="text-text-secondary leading-relaxed font-medium">
                {displayMessage}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={this.handleReset}
                className="flex-1 px-8 py-5 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <RefreshCw size={18} />
                Restart Protocol
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-8 py-5 bg-bg-surface border border-border-dim text-text-muted rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <Home size={18} />
                Return Home
              </button>
            </div>

            <div className="pt-8 text-[9px] font-black text-text-muted uppercase tracking-[0.4em] opacity-50">
              System Error Code: {this.state.error?.name || 'GENERIC_PROTOCOL_FAIL'}
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
