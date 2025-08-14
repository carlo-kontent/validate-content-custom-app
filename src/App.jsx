import { useEffect, useState } from 'react';
import { useValidationStore } from './store/validationStore';
import kontentService from './services/kontentService';
import Header from './components/Header';
import ValidationControls from './components/ValidationControls';
import ValidationResults from './components/ValidationResults';
import ProgressBar from './components/ProgressBar';
import ErrorBoundary from './components/ErrorBoundary';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  const {
    isValidationRunning,
    validationProgress,
    totalItems,
    processedItems,
    validationResults,
    errors,
    warnings,
    startValidation,
    stopValidation,
    updateProgress,
    addValidationResult,
    clearResults,
  } = useValidationStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if Kontent.ai service is ready
        if (kontentService.isReady()) {
          setIsInitialized(true);

          // Load initial data
          await loadInitialData();
        } else {
          setError(
            'Failed to initialize Kontent.ai service. Please check your configuration.'
          );
        }
      } catch (err) {
        console.error('App initialization error:', err);
        setError(err.message);
      }
    };

    initializeApp();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load content types and items in parallel
      const [contentTypes, contentItems] = await Promise.all([
        kontentService.getContentTypes(),
        kontentService.getContentItems(),
      ]);

      useValidationStore.getState().setContentTypes(contentTypes);
      useValidationStore.getState().setContentItems(contentItems);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(
        'Failed to load content data. Please check your permissions and try again.'
      );
    }
  };

  const handleStartValidation = async () => {
    try {
      setError(null);
      startValidation();

      // Start validation process
      const results = await kontentService.validateAllContentItems(
        '00000000-0000-0000-0000-000000000000', // Default language
        (processed, total) => {
          updateProgress(processed, total);
        }
      );

      // Add all results to store
      results.forEach((result) => {
        addValidationResult(result);
      });

      // Stop validation
      useValidationStore.getState().stopValidation();
    } catch (err) {
      console.error('Validation error:', err);
      setError(err.message);
      useValidationStore.getState().stopValidation();
    }
  };

  const handleStopValidation = () => {
    stopValidation();
  };

  const handleClearResults = () => {
    clearResults();
    setError(null);
  };

  if (!isInitialized) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Initializing Validate Content App...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='max-w-md w-full'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center mb-4'>
              <XCircle className='h-8 w-8 text-error-500 mr-3' />
              <h1 className='text-xl font-semibold text-gray-900'>
                Initialization Error
              </h1>
            </div>
            <p className='text-gray-600 mb-4'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='btn-primary w-full'
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className='min-h-screen bg-gray-50'>
        <Header />

        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='card'>
              <div className='flex items-center'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <CheckCircle className='h-6 w-6 text-blue-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Items
                  </p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {totalItems}
                  </p>
                </div>
              </div>
            </div>

            <div className='card'>
              <div className='flex items-center'>
                <div className='p-2 bg-green-100 rounded-lg'>
                  <CheckCircle className='h-6 w-6 text-green-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Valid Items
                  </p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {validationResults.filter((r) => r.isValid).length}
                  </p>
                </div>
              </div>
            </div>

            <div className='card'>
              <div className='flex items-center'>
                <div className='p-2 bg-red-100 rounded-lg'>
                  <XCircle className='h-6 w-6 text-red-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Errors</p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {errors.length}
                  </p>
                </div>
              </div>
            </div>

            <div className='card'>
              <div className='flex items-center'>
                <div className='p-2 bg-yellow-100 rounded-lg'>
                  <AlertTriangle className='h-6 w-6 text-yellow-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Warnings</p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {warnings.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Controls */}
          <ValidationControls
            isRunning={isValidationRunning}
            onStart={handleStartValidation}
            onStop={handleStopValidation}
            onClear={handleClearResults}
            hasResults={validationResults.length > 0}
          />

          {/* Progress Bar */}
          {isValidationRunning && (
            <ProgressBar
              progress={validationProgress}
              processed={processedItems}
              total={totalItems}
            />
          )}

          {/* Validation Results */}
          {validationResults.length > 0 && <ValidationResults />}

          {/* Empty State */}
          {!isValidationRunning && validationResults.length === 0 && (
            <div className='text-center py-12'>
              <div className='mx-auto h-24 w-24 text-gray-300 mb-4'>
                <AlertCircle className='h-full w-full' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No validation results yet
              </h3>
              <p className='text-gray-500 mb-6'>
                Click "Start Validation" to begin validating your content items.
              </p>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
