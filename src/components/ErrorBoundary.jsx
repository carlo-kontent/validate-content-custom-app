import React from 'react';
import { XCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
          <div className='max-w-md w-full'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center mb-4'>
                <XCircle className='h-8 w-8 text-error-500 mr-3' />
                <h1 className='text-xl font-semibold text-gray-900'>
                  Something went wrong
                </h1>
              </div>

              <p className='text-gray-600 mb-4'>
                An unexpected error occurred in the Validate Content App. Please
                try refreshing the page.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className='mb-4'>
                  <summary className='cursor-pointer text-sm font-medium text-gray-700 mb-2'>
                    Error Details (Development)
                  </summary>
                  <div className='bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto'>
                    <div className='mb-2'>
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className='whitespace-pre-wrap mt-1'>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className='flex space-x-3'>
                <button
                  onClick={() => window.location.reload()}
                  className='btn-primary flex-1 flex items-center justify-center'
                >
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
