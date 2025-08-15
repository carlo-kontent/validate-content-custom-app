import { Play, Square, Trash2, RefreshCw } from 'lucide-react';

const ValidationControls = ({
  isRunning,
  onStart,
  onStop,
  onClear,
  hasResults,
}) => {
  return (
    <div className='card mb-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-2'>
            Content Validation 123
          </h2>
          <p className='text-sm text-gray-600'>
            Validate all content items in your Kontent.ai project for errors and
            warnings.
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-3'>
          {!isRunning ? (
            <button
              onClick={onStart}
              disabled={isRunning}
              className='btn-primary flex items-center justify-center min-w-[140px]'
            >
              <Play className='h-4 w-4 mr-2' />
              Start Validation
            </button>
          ) : (
            <button
              onClick={onStop}
              className='btn-error flex items-center justify-center min-w-[140px]'
            >
              <Square className='h-4 w-4 mr-2' />
              Stop Validation
            </button>
          )}

          {hasResults && (
            <button
              onClick={onClear}
              disabled={isRunning}
              className='btn-secondary flex items-center justify-center min-w-[140px]'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Clear Results
            </button>
          )}

          {isRunning && (
            <div className='flex items-center text-sm text-gray-500'>
              <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
              Validating...
            </div>
          )}
        </div>
      </div>

      {!isRunning && !hasResults && (
        <div className='mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <RefreshCw className='h-5 w-5 text-blue-400' />
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-blue-800'>
                Ready to validate
              </h3>
              <div className='mt-2 text-sm text-blue-700'>
                <p>
                  Click "Start Validation" to begin checking all content items
                  for validation errors and warnings. This process will use the
                  Kontent.ai Management API to validate each item.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationControls;
