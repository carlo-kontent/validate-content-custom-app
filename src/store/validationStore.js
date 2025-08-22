import { create } from 'zustand';

const initialState = {
  // Validation state
  isValidationRunning: false,
  validationProgress: 0,
  totalItems: 0,
  processedItems: 0,

  // Detailed progress tracking
  currentItem: null,
  currentElement: null,
  currentValidationStep: '',
  validationStepProgress: 0,
  totalValidationSteps: 0,
  validationStartTime: null,

  // Content data
  contentItems: [],
  contentTypes: [],

  // Validation results
  validationResults: [],
  errors: [],
  warnings: [],

  // Filters and search
  searchTerm: '',
  statusFilter: 'all', // all, valid, invalid, warning
  collectionFilter: 'all', // all, or specific collection ID

  // Pagination
  currentPage: 1,
  itemsPerPage: 20,
};

export const useValidationStore = create((set, get) => ({
  ...initialState,

  // Validation actions
  startValidation: () =>
    set((state) => ({
      isValidationRunning: true,
      validationProgress: 0,
      processedItems: 0,
      currentItem: null,
      currentElement: null,
      currentValidationStep: '',
      validationStepProgress: 0,
      totalValidationSteps: 0,
      validationResults: [],
      errors: [],
      warnings: [],
      // Ensure totalItems is set from contentItems if available
      totalItems: state.contentItems.length || 0,
      // Add timestamp for tracking how long validation has been running
      validationStartTime: new Date().toISOString(),
    })),

  stopValidation: () =>
    set({
      isValidationRunning: false,
      validationProgress: 0,
      currentItem: null,
      currentElement: null,
      currentValidationStep: '',
      validationStepProgress: 0,
      totalValidationSteps: 0,
    }),

  updateProgress: (processed, total) => {
    // Calculate percentage from processed/total
    const calculatedProgress =
      total > 0 ? Math.round((processed / total) * 100) : 0;
    set({
      processedItems: processed,
      totalItems: total,
      validationProgress: calculatedProgress,
    });
  },

  updateDetailedProgress: (item, element, step, stepProgress, totalSteps) => {
    set({
      currentItem: item,
      currentElement: element,
      currentValidationStep: step,
      validationStepProgress: stepProgress,
      totalValidationSteps: totalSteps,
    });
  },

  addValidationResult: (result) => {
    const { validationResults, errors, warnings } = get();

    const newValidationResults = [...validationResults, result];
    const newErrors = result.errors ? [...errors, ...result.errors] : errors;
    const newWarnings = result.warnings
      ? [...warnings, ...result.warnings]
      : warnings;

    set({
      validationResults: newValidationResults,
      errors: newErrors,
      warnings: newWarnings,
    });
  },

  setContentItems: (items) =>
    set({
      contentItems: items,
      totalItems: items.length,
    }),
  setContentTypes: (types) => set({ contentTypes: types }),

  // UI actions
  setSearchTerm: (term) => set({ searchTerm: term }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setCollectionFilter: (collectionId) => set({ collectionFilter: collectionId }),
  setCurrentPage: (page) => set({ currentPage: page }),

  // Computed values
  getFilteredResults: () => {
    const { validationResults, searchTerm, statusFilter, collectionFilter } = get();

    let filtered = validationResults;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (result) =>
          result.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.contentTypeName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((result) => {
        if (statusFilter === 'valid')
          return result.errors.length === 0 && result.warnings.length === 0;
        if (statusFilter === 'invalid') return result.errors.length > 0;
        if (statusFilter === 'warning')
          return result.warnings.length > 0 && result.errors.length === 0;
        return true;
      });
    }

    // Apply collection filter
    if (collectionFilter !== 'all') {
      filtered = filtered.filter((result) => {
        return result.collectionId === collectionFilter;
      });
    }

    return filtered;
  },

  getPaginatedResults: () => {
    const { currentPage, itemsPerPage } = get();
    const filtered = get().getFilteredResults();

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      results: filtered.slice(startIndex, endIndex),
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      currentPage,
      totalItems: filtered.length,
    };
  },

  // Clear results
  clearResults: () =>
    set((state) => ({
      validationResults: [],
      errors: [],
      warnings: [],
      validationProgress: 0,
      processedItems: 0,
      // Keep the total items count from contentItems
      totalItems: state.contentItems.length || 0,
    })),
}));
