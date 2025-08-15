import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Edit3,
  Calendar,
  FileText,
} from 'lucide-react';

const ValidationResultItem = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    itemName,
    contentTypeName,
    isValid,
    errors,
    warnings,
    validationDate,
    itemUrl,
    editUrl,
  } = result;

  const hasIssues = errors.length > 0 || warnings.length > 0;
  const totalIssues = errors.length + warnings.length;

  const getStatusIcon = () => {
    if (errors.length > 0) {
      return <XCircle className='h-5 w-5 text-error-500' />;
    } else if (warnings.length > 0) {
      return <AlertTriangle className='h-5 w-5 text-warning-500' />;
    } else {
      return <CheckCircle className='h-5 w-5 text-success-500' />;
    }
  };

  const getStatusText = () => {
    if (errors.length > 0) {
      return 'Has Errors';
    } else if (warnings.length > 0) {
      return 'Has Warnings';
    } else {
      return 'Valid';
    }
  };

  const getStatusColor = () => {
    if (errors.length > 0) {
      return 'text-error-600 bg-error-50 border-error-200';
    } else if (warnings.length > 0) {
      return 'text-warning-600 bg-warning-50 border-warning-200';
    } else {
      return 'text-success-600 bg-success-50 border-success-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className='border border-gray-200 rounded-lg bg-white'>
      {/* Header */}
      <div
        className='p-4 cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            {getStatusIcon()}

            <div className='flex-1 min-w-0'>
              <h3 className='text-sm font-medium text-gray-900 truncate'>
                {itemName}
              </h3>
              <div className='flex items-center space-x-4 mt-1 text-sm text-gray-500'>
                <span className='flex items-center'>
                  <Calendar className='h-4 w-4 mr-1' />
                  {formatDate(validationDate)}
                </span>
              </div>
            </div>
          </div>

          <div className='flex items-center space-x-3'>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor()}`}
            >
              {getStatusText()}
            </span>

            {hasIssues && (
              <span className='px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full'>
                {totalIssues} issue{totalIssues !== 1 ? 's' : ''}
              </span>
            )}

            {isExpanded ? (
              <ChevronDown className='h-5 w-5 text-gray-400' />
            ) : (
              <ChevronRight className='h-5 w-5 text-gray-400' />
            )}
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className='border-t border-gray-200 p-4 bg-gray-50'>
          {/* Action Buttons */}
          <div className='flex items-center space-x-3 mb-4'>
            {itemUrl && (
              <a
                href={itemUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='btn-secondary flex items-center text-sm'
              >
                <ExternalLink className='h-4 w-4 mr-2' />
                View Item
              </a>
            )}

            {editUrl && (
              <a
                href={editUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='btn-primary flex items-center text-sm'
              >
                <Edit3 className='h-4 w-4 mr-2' />
                Edit Item
              </a>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className='mb-4'>
              <h4 className='text-sm font-medium text-error-700 mb-2 flex items-center'>
                <XCircle className='h-4 w-4 mr-2' />
                Errors ({errors.length})
              </h4>
              <div className='space-y-2'>
                {errors.map((error, index) => (
                  <div
                    key={index}
                    className='bg-error-50 border border-error-200 rounded-lg p-3'
                  >
                    <div className='flex items-start'>
                      <XCircle className='h-4 w-4 text-error-500 mt-0.5 mr-2 flex-shrink-0' />
                      <div className='flex-1'>
                        <p className='text-sm text-error-800'>
                          {error.message}
                        </p>
                        {error.code && (
                          <p className='text-xs text-error-600 mt-1'>
                            Error Code: {error.code}
                          </p>
                        )}
                        {error.elementId && (
                          <p className='text-xs text-error-600 mt-1'>
                            Element ID: {error.elementId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div>
              <h4 className='text-sm font-medium text-warning-700 mb-2 flex items-center'>
                <AlertTriangle className='h-4 w-4 mr-2' />
                Warnings ({warnings.length})
              </h4>
              <div className='space-y-2'>
                {warnings.map((warning, index) => (
                  <div
                    key={index}
                    className='bg-warning-50 border border-warning-200 rounded-lg p-3'
                  >
                    <div className='flex items-start'>
                      <AlertTriangle className='h-4 w-4 text-warning-500 mt-0.5 mr-2 flex-shrink-0' />
                      <div className='flex-1'>
                        <p className='text-sm text-warning-800'>
                          {warning.message}
                        </p>
                        {warning.code && (
                          <p className='text-xs text-warning-600 mt-1'>
                            Warning Code: {warning.code}
                          </p>
                        )}
                        {warning.elementId && (
                          <p className='text-xs text-warning-600 mt-1'>
                            Element ID: {warning.elementId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Issues */}
          {!hasIssues && (
            <div className='text-center py-4'>
              <CheckCircle className='h-8 w-8 text-success-500 mx-auto mb-2' />
              <p className='text-sm text-success-700 font-medium'>
                This content item is valid with no errors or warnings.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidationResultItem;
