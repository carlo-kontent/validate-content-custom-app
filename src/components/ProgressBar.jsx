const ProgressBar = ({
  progress,
  processed,
  total,
  currentItem,
  currentElement,
  currentValidationStep,
  validationStepProgress,
  totalValidationSteps,
  validationStartTime,
}) => {
  const getValidationDuration = () => {
    if (!validationStartTime) return '';

    const startTime = new Date(validationStartTime);
    const now = new Date();
    const duration = Math.floor((now - startTime) / 1000); // seconds

    if (duration < 60) {
      return `${duration}s`;
    } else if (duration < 3600) {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const getProgressText = () => {
    if (!currentItem) {
      return 'Initializing validation...';
    }

    const itemName = currentItem.name || 'Unknown item';
    const elementName = currentElement?.name || '';
    const elementType = currentElement?.type || '';

    if (currentElement) {
      return `Validating ${itemName}: ${elementName} (${elementType})`;
    } else {
      return `Validating ${itemName}`;
    }
  };

  const getProgressSubtext = () => {
    if (!currentItem) {
      return 'Preparing validation process...';
    }

    const stepProgress = validationStepProgress || 0;
    const totalSteps = totalValidationSteps || 1;

    if (totalSteps > 1) {
      return `Step ${stepProgress} of ${totalSteps}`;
    } else {
      return 'Processing...';
    }
  };

  return (
    <div className='card mb-8'>
      <div className='mb-4'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='text-sm font-medium text-gray-900'>
            Validation Progress
          </h3>
          <div className='flex items-center gap-4'>
            <span className='text-sm text-gray-500'>
              {total} item{total !== 1 ? 's' : ''} total
            </span>
            {validationStartTime && (
              <span className='text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded'>
                {getValidationDuration()}
              </span>
            )}
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className='w-full bg-gray-200 rounded-full h-3 mb-3'>
          <div
            className='bg-primary-600 h-3 rounded-full transition-all duration-300 ease-out'
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Progress Bar (if available) */}
        {totalValidationSteps > 1 && (
          <div className='w-full bg-gray-100 rounded-full h-2 mb-3'>
            <div
              className='bg-blue-500 h-2 rounded-full transition-all duration-200 ease-out'
              style={{
                width: `${
                  (validationStepProgress / totalValidationSteps) * 100
                }%`,
              }}
            />
          </div>
        )}

        {/* Progress Text */}
        <div className='text-sm text-gray-700 mb-2'>
          <p className='font-medium'>{getProgressText()}</p>
          <p className='text-gray-600 text-xs mt-1'>{getProgressSubtext()}</p>
        </div>

        {/* Progress Summary */}
        <div className='text-xs text-gray-500 text-center bg-gray-50 py-2 px-3 rounded-md'>
          <span className='font-medium'>{processed}</span> of{' '}
          <span className='font-medium'>{total}</span> items
          {currentElement && (
            <div className='mt-1 text-gray-600'>
              <span className='font-medium'>Current:</span>{' '}
              {currentElement.name} ({currentElement.type})
            </div>
          )}
        </div>
      </div>

      <div className='text-sm text-gray-600'>
        <p>
          Validating content for errors and warnings. This process checks each
          item systematically.
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
