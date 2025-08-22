import { storage } from '../utils/storage.js';

// Kontent.ai Configuration
// This configuration automatically detects the environment when running as a Custom App
// and falls back to browser storage for local development

export const getKontentConfig = () => {
  // Check if we're in local development
  const isLocalDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (isLocalDev) {
    // Use environment ID from browser storage for local development, with fallback to env variable
    const storedEnvironmentId = storage.getEnvironmentId();
    const envEnvironmentId = import.meta.env.VITE_KONTENT_ENVIRONMENT_ID;

    if (!storedEnvironmentId && !envEnvironmentId) {
      throw new Error(
        'Environment ID not found in browser storage or environment variables. Please set it in the Environment Settings or add VITE_KONTENT_ENVIRONMENT_ID to your .env file.'
      );
    }

    return {
      managementApiKey: import.meta.env.VITE_KONTENT_MANAGEMENT_API_KEY,
      environmentId: storedEnvironmentId || envEnvironmentId,
      isLocalDev: true,
    };
  }

  // Custom app mode - get context from the SDK
  return {
    managementApiKey: import.meta.env.VITE_KONTENT_MANAGEMENT_API_KEY,
    environmentId: import.meta.env.VITE_KONTENT_ENVIRONMENT_ID,
    isLocalDev: false,
  };
};

export const kontentConfig = getKontentConfig();

// Validation function to ensure all required config is present
export const validateKontentConfig = () => {
  const config = kontentConfig;
  const requiredFields = ['environmentId', 'managementApiKey'];

  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Kontent.ai configuration: ${missingFields.join(', ')}`
    );
  }

  return true;
};

// API endpoints
export const API_ENDPOINTS = {
  MANAGEMENT: 'https://manage.kontent.ai/v2',
  PREVIEW: 'https://preview-deliver.kontent.ai',
};

export default kontentConfig;
