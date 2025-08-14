import { create } from "zustand";

const initialState = {
  isValidationRunning: false,
  validationProgress: 0,
  totalItems: 0,
  processedItems: 0,
  contentItems: [],
  contentTypes: [],
  validationResults: [],
  errors: [],
  warnings: [],
  selectedContentType: null,
  selectedContentItem: null,
  showOnlyErrors: false,
  showOnlyWarnings: false,
  searchTerm: "",
  statusFilter: "all",
  currentPage: 1,
  itemsPerPage: 20,
};

export const useValidationStore = create((set, get) => ({
  ...initialState,
  
  startValidation: () => set({ 
    isValidationRunning: true, 
    validationProgress: 0,
    processedItems: 0,
    validationResults: [],
    errors: [],
    warnings: []
  }),
  
  stopValidation: () => set({ 
    isValidationRunning: false,
    validationProgress: 0
  }),
  
  updateProgress: (processed, total) => {
    const progress = total > 0 ? Math.round((processed / total) * 100) : 0;
    set({ 
      processedItems: processed,
      totalItems: total,
      validationProgress: progress
    });
  },
  
  addValidationResult: (result) => {
    const { validationResults, errors, warnings } = get();
    
    const newValidationResults = [...validationResults, result];
    const newErrors = result.errors ? [...errors, ...result.errors] : errors;
    const newWarnings = result.warnings ? [...warnings, ...result.warnings] : warnings;
    
    set({
      validationResults: newValidationResults,
      errors: newErrors,
      warnings: newWarnings
    });
  },
  
  setContentItems: (items) => set({ contentItems: items }),
  setContentTypes: (types) => set({ contentTypes: types }),
  
  clearResults: () => set({
    validationResults: [],
    errors: [],
    warnings: [],
    validationProgress: 0,
    processedItems: 0,
    totalItems: 0
  }),
}));
