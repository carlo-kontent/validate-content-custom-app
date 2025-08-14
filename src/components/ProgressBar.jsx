const ProgressBar = ({ progress, processed, total }) => {
  return (
    <div className='card mb-8'>
      <div className='mb-4'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='text-sm font-medium text-gray-900'>
            Validation Progress
          </h3>
          <span className='text-sm text-gray-500'>
            {processed} of {total} items ({progress}%)
          </span>
        </div>

        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className='bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className='text-sm text-gray-600'>
        <p>
          Validating content items... This process checks each item for
          validation errors and warnings.
          {total > 100 && (
            <span className='text-warning-600 font-medium'>
              {' '}
              Note: Large projects may take several minutes to complete.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
