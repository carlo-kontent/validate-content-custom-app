import { create } from 'zustand';

const initialState = {
  // Validation state
  isValidationRunning: false,
  validationProgress: 0,
  totalItems: 0,
  processedItems: 0,

  // Content data
  contentItems: [],
  contentTypes: [],

  // Validation results
  validationResults: [],
  errors: [],
  warnings: [],

  // UI state
  selectedContentType: null,
  selectedContentItem: null,
  showOnlyErrors: false,
  showOnlyWarnings: false,

  // Filters and search
  searchTerm: '',
  statusFilter: 'all', // all, valid, invalid, warning

  // Pagination
  currentPage: 1,
  itemsPerPage: 20,
};

export const useValidationStore = create((set, get) => ({
  ...initialState,

  // Validation actions
  startValidation: () =>
    set({
      isValidationRunning: true,
      validationProgress: 0,
      processedItems: 0,
      validationResults: [],
      errors: [],
      warnings: [],
    }),

  stopValidation: () =>
    set({
      isValidationRunning: false,
      validationProgress: 0,
    }),

  updateProgress: (processed, total) => {
    const progress = total > 0 ? Math.round((processed / total) * 100) : 0;
    set({
      processedItems: processed,
      totalItems: total,
      validationProgress: progress,
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

  setContentItems: (items) => set({ contentItems: items }),
  setContentTypes: (types) => set({ contentTypes: types }),

  // UI actions
  setSelectedContentType: (type) => set({ selectedContentType: type }),
  setSelectedContentItem: (item) => set({ selectedContentItem: item }),
  setShowOnlyErrors: (show) => set({ showOnlyErrors: show }),
  setShowOnlyWarnings: (show) => set({ showOnlyWarnings: show }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setCurrentPage: (page) => set({ currentPage: page }),

  // Computed values
  getFilteredResults: () => {
    const {
      validationResults,
      searchTerm,
      statusFilter,
      showOnlyErrors,
      showOnlyWarnings,
    } = get();

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

    // Apply error/warning filters
    if (showOnlyErrors) {
      filtered = filtered.filter((result) => result.errors.length > 0);
    }

    if (showOnlyWarnings) {
      filtered = filtered.filter((result) => result.warnings.length > 0);
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

  // Reset state
  reset: () => set(initialState),

  // Clear results
  clearResults: () =>
    set({
      validationResults: [],
      errors: [],
      warnings: [],
      validationProgress: 0,
      processedItems: 0,
      totalItems: 0,
    }),
}));
