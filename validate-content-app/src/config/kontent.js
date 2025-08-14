const getKontentConfig = () => {
  if (typeof window !== "undefined" && window.kontent) {
    const customAppConfig = window.kontent.getCustomElementConfig();
    return {
      projectId: customAppConfig.projectId,
      environmentId: customAppConfig.environmentId,
      managementApiKey: customAppConfig.managementApiKey,
      deliveryApiKey: customAppConfig.deliveryApiKey,
      isCustomApp: true,
    };
  }

  return {
    projectId: import.meta.env.VITE_KONTENT_PROJECT_ID,
    environmentId: import.meta.env.VITE_KONTENT_ENVIRONMENT_ID,
    managementApiKey: import.meta.env.VITE_KONTENT_MANAGEMENT_API_KEY,
    deliveryApiKey: import.meta.env.VITE_KONTENT_DELIVERY_API_KEY,
    isCustomApp: false,
  };
};

export const kontentConfig = getKontentConfig();

export const validateKontentConfig = () => {
  const config = kontentConfig;
  const requiredFields = [
    "projectId",
    "environmentId",
    "managementApiKey",
    "deliveryApiKey",
  ];

  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Kontent.ai configuration: ${missingFields.join(", ")}`
    );
  }

  return true;
};

export default kontentConfig;
