import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#E4E3E0] p-6">
          <div className="bg-white p-6 rounded-2xl border border-[#141414]/15 shadow-xl max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-serif font-bold text-[#141414]">Visualizer Recovered</h2>
            <p className="text-xs text-[#5A5A58] leading-relaxed">
              A temporary display error occurred in the 3D rendering canvas. Click below to restore the workspace.
            </p>
            {this.state.error && (
              <p className="text-[11px] font-mono text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#141414] hover:bg-[#2D2D2D] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Design View</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
