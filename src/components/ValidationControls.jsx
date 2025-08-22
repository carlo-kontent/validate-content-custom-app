import { Play, Square, Trash2, RefreshCw, Filter } from 'lucide-react';

const ValidationControls = ({
  isRunning,
  onStart,
  onStop,
  onClear,
  hasResults,
  environmentId,
  validateByCollection,
  selectedCollectionIds,
  collections,
  collectionCounts,
  onFilterChange,
  appConfig,
}) => {
  // Helper function to check if filter is enabled
  const isFilterEnabled = (configKey) => {
    const isLocalDev = window.location.hostname.includes('localhost');

    // In localhost, allow all filters to be enabled for testing
    if (isLocalDev) {
      return true;
    }

    // In production, check the config value
    if (appConfig && appConfig.hasOwnProperty(configKey)) {
      return appConfig[configKey] === 'true';
    }

    // If no config is set, default to disabled
    return false;
  };

  // Helper function to check if filter should show "not configured" message
  const shouldShowNotConfigured = (configKey) => {
    const isLocalDev = window.location.hostname.includes('localhost');

    // Don't show message in localhost
    if (isLocalDev) {
      return false;
    }

    // Show message if config is not set to 'true'
    return !appConfig || appConfig[configKey] !== 'true';
  };

  // Helper function to check if filter is explicitly disabled
  const isFilterExplicitlyDisabled = (configKey) => {
    const isLocalDev = window.location.hostname.includes('localhost');

    // In localhost, nothing is explicitly disabled
    if (isLocalDev) {
      return false;
    }

    // Check if config explicitly sets it to false
    return appConfig && appConfig[configKey] === 'false';
  };

  return (
    <div className='card mb-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-2'>
            Content Validation
          </h2>
          {environmentId && (
            <div className='text-sm text-gray-600'>
              <strong>Environment ID:</strong> {environmentId}
            </div>
          )}
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

      {/* Filtering Options */}
      {!isRunning && (
        <div className='mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center'>
              <Filter className='h-4 w-4 mr-2 text-gray-600' />
              <h3 className='text-sm font-medium text-gray-700'>
                Validation Filters
              </h3>
            </div>
            <div className='text-xs text-gray-500'>
              Total items:{' '}
              {(collectionCounts || []).reduce((sum, c) => sum + c.count, 0)}
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Collection Filter Toggle - All Users (but only their assigned collections) */}
            <div className='p-3 bg-white rounded-lg border border-gray-200'>
              <div className='flex items-start justify-between mb-3'>
                <div className='flex-1'>
                  <div className='text-sm font-medium text-gray-700'>
                    Validate by Collection
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    Filter by specific collections
                  </div>
                  {isFilterExplicitlyDisabled('validateByCollection') && (
                    <div className='text-xs text-red-500 mt-1'>
                      🚫 Disabled in app settings
                    </div>
                  )}
                  {shouldShowNotConfigured('validateByCollection') &&
                    !isFilterExplicitlyDisabled('validateByCollection') && (
                      <div className='text-xs text-red-500 mt-1'>
                        Not configured in app settings
                      </div>
                    )}
                </div>
                <div className='ml-3'>
                  <button
                    type='button'
                    disabled={
                      !isFilterEnabled('validateByCollection') || isRunning
                    }
                    onClick={() =>
                      onFilterChange(
                        'validateByCollection',
                        !validateByCollection
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      !isFilterEnabled('validateByCollection')
                        ? 'bg-gray-200 cursor-not-allowed'
                        : validateByCollection
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        validateByCollection &&
                        isFilterEnabled('validateByCollection')
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              {validateByCollection &&
                isFilterEnabled('validateByCollection') && (
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-2'>
                      Select Collections (multiple)
                    </label>
                    <div className='max-h-32 overflow-y-auto border border-gray-300 rounded-md bg-white'>
                      {(collections || []).map((collection) => {
                        const count =
                          (collectionCounts || []).find(
                            (c) => c.id === collection.id
                          )?.count || 0;
                        const isSelected = selectedCollectionIds.includes(
                          collection.id
                        );
                        return (
                          <label
                            key={collection.id}
                            className='flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                          >
                            <input
                              type='checkbox'
                              checked={isSelected}
                              onChange={(e) => {
                                const newSelectedIds = e.target.checked
                                  ? [...selectedCollectionIds, collection.id]
                                  : selectedCollectionIds.filter(
                                      (id) => id !== collection.id
                                    );
                                onFilterChange(
                                  'selectedCollectionIds',
                                  newSelectedIds
                                );
                              }}
                              disabled={isRunning}
                              className='mr-2 text-blue-600 focus:ring-blue-500'
                            />
                            <span className='text-sm flex-1'>
                              {collection.name}
                              <span className='text-gray-500 ml-1'>
                                ({count} items)
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {selectedCollectionIds.length > 0 && (
                      <div className='text-xs text-blue-600 mt-2'>
                        📊 {selectedCollectionIds.length} collection(s)
                        selected,{' '}
                        {selectedCollectionIds.reduce((total, id) => {
                          const count =
                            (collectionCounts || []).find((c) => c.id === id)
                              ?.count || 0;
                          return total + count;
                        }, 0)}{' '}
                        total items
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

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
                  for validation errors and warnings.
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
