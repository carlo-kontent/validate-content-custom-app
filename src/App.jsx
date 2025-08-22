import { useEffect, useState } from 'react';
import { useValidationStore } from './store/validationStore';
import kontentService from './services/kontentService';
import { kontentConfig } from './config/kontent';
import { storage } from './utils/storage';
import Header from './components/Header';
import ValidationControls from './components/ValidationControls';
import ValidationResults from './components/ValidationResults';
import ProgressBar from './components/ProgressBar';
import ErrorBoundary from './components/ErrorBoundary';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
// Dynamic import for Custom App SDK to avoid build issues
let getCustomAppContext = null;
if (typeof window !== 'undefined' && window.kontent) {
  try {
    getCustomAppContext = window.kontent.getCustomAppContext;
  } catch (error) {
    console.log('Custom App SDK not available');
  }
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [showErrorInfo, setShowErrorInfo] = useState(false);
  const [showWarningInfo, setShowWarningInfo] = useState(false);
  const [validateByCollection, setValidateByCollection] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionCounts, setCollectionCounts] = useState([]);
  const [appConfig, setAppConfig] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const {
    isValidationRunning,
    validationProgress,
    totalItems,
    processedItems,
    currentItem,
    currentElement,
    currentValidationStep,
    validationStepProgress,
    totalValidationSteps,
    validationStartTime,
    validationResults,
    errors,
    warnings,
    startValidation,
    stopValidation,
    updateProgress,
    updateDetailedProgress,
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

  // Load Custom App configuration and user info
  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        if (getCustomAppContext) {
          const response = await getCustomAppContext();
          if (!response.isError && response.config) {
            setAppConfig(response.config);

            // Set default filtering based on config
            if (response.config.validateByCollection === 'true') {
              setValidateByCollection(true);
            }
          }
        }
      } catch (error) {
        console.log(
          'Running in local development mode or failed to load config'
        );
      }
    };

    // Load user info from storage
    const loadUserInfo = () => {
      const storedUserInfo = storage.getUserInfo();
      if (storedUserInfo) {
        setUserInfo(storedUserInfo);
      }
    };

    loadAppConfig();
    loadUserInfo();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load content types, items, collections, and counts in parallel
      const [contentTypes, contentItemsResult, collections, collectionCounts] =
        await Promise.all([
          kontentService.getContentTypes(),
          kontentService.getContentItems({
            validateByCollection,
            selectedCollectionIds,
            userId: userInfo?.userId,
          }),
          kontentService.getCollections(),
          kontentService.getCollectionItemCounts(),
        ]);

      // Handle both old and new data formats
      let contentItems;
      if (
        contentItemsResult &&
        typeof contentItemsResult === 'object' &&
        contentItemsResult.items
      ) {
        contentItems = contentItemsResult.items;
      } else {
        contentItems = contentItemsResult || [];
      }

      useValidationStore.getState().setContentTypes(contentTypes);
      useValidationStore.getState().setContentItems(contentItems);
      setCollections(collections || []);
      setCollectionCounts(collectionCounts || []);

      console.log('Loaded collections:', (collections || []).length);
      console.log('Collection counts:', collectionCounts || []);
    } catch (err) {
      console.error('Error loading initial data:', err);

      // Provide more specific error messaging
      let errorMessage = 'Failed to load content data. ';
      if (err.message && err.message.includes('permissions')) {
        errorMessage +=
          'Please check your Management API permissions for content types and items.';
      } else if (err.message && err.message.includes('unauthorized')) {
        errorMessage += 'Please check your Management API key and permissions.';
      } else {
        errorMessage += 'Please check your configuration and try again.';
      }

      setError(errorMessage);
    }
  };

  const handleStartValidation = async () => {
    try {
      setError(null);
      startValidation();

      // Get filtered items based on current filter settings
      const filteredItemsResult = await kontentService.getContentItems({
        validateByCollection,
        selectedCollectionIds,
        userId: userInfo?.userId,
      });

      // Update progress with filtered items count
      const filteredCount = filteredItemsResult.items.length;
      const totalItems = filteredItemsResult.counts.total;

      console.log(
        `🔍 Filter applied: ${filteredCount} items selected from ${totalItems} total items`
      );
      if (validateByCollection && selectedCollectionIds.length > 0) {
        console.log(
          `📁 Collection filter: ${selectedCollectionIds.length} collection(s) selected`
        );
      }

      updateProgress(0, filteredCount);

      // Start validation process with filtered items
      const results = await kontentService.validateAllContentItems(
        '00000000-0000-0000-0000-000000000000', // Default language
        (processed, total) => {
          // processed is now the count of processed items
          updateProgress(processed, total);
        },
        (item, element, step, stepProgress, totalSteps) => {
          updateDetailedProgress(item, element, step, stepProgress, totalSteps);
        },
        filteredItemsResult.items // Pass the filtered items
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

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'validateByCollection') {
      setValidateByCollection(value);
    } else if (filterType === 'selectedCollectionIds') {
      setSelectedCollectionIds(value);
    }
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

            <div className='card relative'>
              <div className='flex items-center'>
                <div className='p-2 bg-red-100 rounded-lg'>
                  <XCircle className='h-6 w-6 text-red-600' />
                </div>
                <div className='ml-4 flex-1'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium text-gray-600'>Errors</p>
                    <button
                      onMouseEnter={() => setShowErrorInfo(true)}
                      onMouseLeave={() => setShowErrorInfo(false)}
                      className='text-gray-400 hover:text-gray-600'
                    >
                      <Info className='h-4 w-4' />
                    </button>
                  </div>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {errors.length}
                  </p>
                </div>
              </div>
              {showErrorInfo && (
                <div className='absolute top-full mt-2 left-0 right-0 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10'>
                  <p className='font-semibold mb-1'>Validation Errors:</p>
                  <ul className='text-xs space-y-1'>
                    <li>• Required fields that are empty</li>
                    <li>• Text length exceeding limits</li>
                    <li>• Invalid data formats</li>
                    <li>• Missing category selections</li>
                    <li>• Date/time field validation failures</li>
                  </ul>
                </div>
              )}
            </div>

            <div className='card relative'>
              <div className='flex items-center'>
                <div className='p-2 bg-yellow-100 rounded-lg'>
                  <AlertTriangle className='h-6 w-6 text-yellow-600' />
                </div>
                <div className='ml-4 flex-1'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium text-gray-600'>
                      Warnings
                    </p>
                    <button
                      onMouseEnter={() => setShowWarningInfo(true)}
                      onMouseLeave={() => setShowWarningInfo(false)}
                      className='text-gray-400 hover:text-gray-600'
                    >
                      <Info className='h-4 w-4' />
                    </button>
                  </div>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {warnings.length}
                  </p>
                </div>
              </div>
              {showWarningInfo && (
                <div className='absolute top-full mt-2 left-0 right-0 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10'>
                  <p className='font-semibold mb-1'>
                    Content Quality Warnings:
                  </p>
                  <ul className='text-xs space-y-1'>
                    <li>• Very short item names (less than 5 characters)</li>
                    <li>• Placeholder text in content names</li>
                    <li>• Demo or test items in production</li>
                    <li>• Missing optional but recommended fields</li>
                    <li>• Content structure inconsistencies</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Validation Controls */}
          <ValidationControls
            isRunning={isValidationRunning}
            onStart={handleStartValidation}
            onStop={handleStopValidation}
            onClear={handleClearResults}
            hasResults={validationResults.length > 0}
            environmentId={kontentConfig.environmentId}
            validateByCollection={validateByCollection}
            selectedCollectionIds={selectedCollectionIds}
            collections={collections}
            collectionCounts={collectionCounts}
            onFilterChange={handleFilterChange}
            appConfig={appConfig}
          />

          {/* Progress Bar */}
          {isValidationRunning && (
            <ProgressBar
              progress={validationProgress}
              processed={processedItems}
              total={totalItems}
              currentItem={currentItem}
              currentElement={currentElement}
              currentValidationStep={currentValidationStep}
              validationStepProgress={validationStepProgress}
              totalValidationSteps={totalValidationSteps}
              validationStartTime={validationStartTime}
            />
          )}

          {/* Validation Results */}
          {validationResults.length > 0 && (
            <ValidationResults
              selectedCollectionIds={selectedCollectionIds}
              collections={collections}
              collectionCounts={collectionCounts}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
