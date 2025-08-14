// Kontent.ai Configuration
// This configuration automatically detects the environment when running as a Custom App
// and falls back to environment variables for local development

const getKontentConfig = () => {
  // Check if running as a Custom App within Kontent.ai platform
  if (typeof window !== 'undefined' && window.kontent) {
    // Custom App environment - get config from platform
    const customAppConfig = window.kontent.getCustomElementConfig();
    return {
      environmentId: customAppConfig.environmentId,
      managementApiKey: customAppConfig.managementApiKey,
      deliveryApiKey: customAppConfig.deliveryApiKey,
      isCustomApp: true,
    };
  }

  // Local development environment - use environment variables
  return {
    environmentId: import.meta.env.VITE_KONTENT_ENVIRONMENT_ID,
    managementApiKey: import.meta.env.VITE_KONTENT_MANAGEMENT_API_KEY,
    deliveryApiKey: import.meta.env.VITE_KONTENT_DELIVERY_API_KEY,
    isCustomApp: false,
  };
};

export const kontentConfig = getKontentConfig();

// Validation function to ensure all required config is present
export const validateKontentConfig = () => {
  const config = kontentConfig;
  const requiredFields = [
    'environmentId',
    'managementApiKey',
    'deliveryApiKey',
  ];

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
  DELIVERY: 'https://deliver.kontent.ai',
  PREVIEW: 'https://preview-deliver.kontent.ai',
};

export default kontentConfig;
