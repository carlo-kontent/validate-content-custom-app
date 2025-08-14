import { useState } from 'react';
import { useValidationStore } from '../store/validationStore';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import ValidationResultItem from './ValidationResultItem';

const ValidationResults = () => {
  const [showFilters, setShowFilters] = useState(false);

  const {
    searchTerm,
    statusFilter,
    showOnlyErrors,
    showOnlyWarnings,
    setSearchTerm,
    setStatusFilter,
    setShowOnlyErrors,
    setShowOnlyWarnings,
    getPaginatedResults,
    setCurrentPage,
  } = useValidationStore();

  const { results, totalPages, currentPage, totalItems } =
    getPaginatedResults();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className='card'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
        <div>
          <h2 className='text-lg font-semibold text-gray-900'>
            Validation Results
          </h2>
          <p className='text-sm text-gray-600'>
            {totalItems} item{totalItems !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='btn-secondary flex items-center'
          >
            <Filter className='h-4 w-4 mr-2' />
            Filters
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='mb-6'>
        <div className='flex flex-col sm:flex-row gap-4 mb-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search by item name or content type...'
                value={searchTerm}
                onChange={handleSearchChange}
                className='input pl-10'
              />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className='input'
              >
                <option value='all'>All Items</option>
                <option value='valid'>Valid Only</option>
                <option value='invalid'>With Errors</option>
                <option value='warning'>With Warnings</option>
              </select>
            </div>

            <div className='flex items-center'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  checked={showOnlyErrors}
                  onChange={(e) => setShowOnlyErrors(e.target.checked)}
                  className='h-4 w-4 text-error-600 focus:ring-error-500 border-gray-300 rounded'
                />
                <span className='ml-2 text-sm text-gray-700'>
                  Show only errors
                </span>
              </label>
            </div>

            <div className='flex items-center'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  checked={showOnlyWarnings}
                  onChange={(e) => setShowOnlyWarnings(e.target.checked)}
                  className='h-4 w-4 text-warning-600 focus:ring-warning-500 border-gray-300 rounded'
                />
                <span className='ml-2 text-sm text-gray-700'>
                  Show only warnings
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results List */}
      {results.length > 0 ? (
        <div className='space-y-4'>
          {results.map((result) => (
            <ValidationResultItem key={result.itemId} result={result} />
          ))}
        </div>
      ) : (
        <div className='text-center py-8'>
          <p className='text-gray-500'>
            No results match your current filters.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between mt-6 pt-6 border-t border-gray-200'>
          <div className='text-sm text-gray-700'>
            Page {currentPage} of {totalPages}
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className='btn-secondary px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <ChevronLeft className='h-4 w-4' />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page =
                Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    page === currentPage
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className='btn-secondary px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationResults;
