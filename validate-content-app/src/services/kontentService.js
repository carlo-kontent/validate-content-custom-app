import { kontentConfig, validateKontentConfig } from "../config/kontent";

class KontentService {
  constructor() {
    try {
      validateKontentConfig();
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Kontent.ai service:", error);
      this.isInitialized = false;
    }
  }

  isReady() {
    return this.isInitialized;
  }

  async getContentTypes() {
    return [];
  }

  async getContentItems() {
    return [];
  }

  async validateAllContentItems(languageId, onProgress) {
    return [];
  }
}

const kontentService = new KontentService();
export default kontentService;
