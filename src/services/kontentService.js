import { ManagementClient } from '@kontent-ai/management-sdk';
import { DeliveryClient } from '@kontent-ai/delivery-sdk';
import { kontentConfig, validateKontentConfig } from '../config/kontent';

class KontentService {
  constructor() {
    try {
      validateKontentConfig();

      this.managementClient = new ManagementClient({
        environmentId: kontentConfig.environmentId,
        apiKey: kontentConfig.managementApiKey,
      });

      this.deliveryClient = new DeliveryClient({
        environmentId: kontentConfig.environmentId,
        apiKey: kontentConfig.deliveryApiKey,
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Kontent.ai service:', error);
      this.isInitialized = false;
    }
  }

  // Get all content types
  async getContentTypes() {
    if (!this.isInitialized) {
      throw new Error('Kontent.ai service not initialized');
    }

    try {
      const response = await this.managementClient
        .listContentTypes()
        .toPromise();
      return response.data.items;
    } catch (error) {
      console.error('Error fetching content types:', error);
      throw error;
    }
  }

  // Get all content items
  async getContentItems() {
    if (!this.isInitialized) {
      throw new Error('Kontent.ai service not initialized');
    }

    try {
      const response = await this.managementClient
        .listContentItems()
        .toPromise();
      return response.data.items;
    } catch (error) {
      console.error('Error fetching content items:', error);
      throw error;
    }
  }

  // Get content items by type
  async getContentItemsByType(contentTypeId) {
    if (!this.isInitialized) {
      throw new Error('Kontent.ai service not initialized');
    }

    try {
      const response = await this.managementClient
        .listContentItems()
        .byType(contentTypeId)
        .toPromise();
      return response.data.items;
    } catch (error) {
      console.error('Error fetching content items by type:', error);
      throw error;
    }
  }

  // Validate a single content item
  async validateContentItem(
    itemId,
    languageId = '00000000-0000-0000-0000-000000000000'
  ) {
    if (!this.isInitialized) {
      throw new Error('Kontent.ai service not initialized');
    }

    try {
      // Get the content item first to get its details
      const itemResponse = await this.managementClient
        .getContentItem(itemId)
        .toPromise();

      const item = itemResponse.data;

      // Validate the content item using the MAPI validate endpoint
      const validationResponse = await this.managementClient
        .validateContentItem()
        .byItemId(itemId)
        .byLanguageId(languageId)
        .toPromise();

      const validation = validationResponse.data;

      return {
        itemId: item.id,
        itemName: item.name,
        contentTypeId: item.type.id,
        contentTypeName: item.type.name,
        languageId: languageId,
        isValid: validation.isValid,
        errors: validation.errors || [],
        warnings: validation.warnings || [],
        validationDate: new Date().toISOString(),
        itemUrl: this.getItemUrl(item.id, item.codename),
        editUrl: this.getEditUrl(item.id, languageId),
      };
    } catch (error) {
      console.error('Error validating content item:', error);

      // Return error result
      return {
        itemId: itemId,
        itemName: 'Unknown',
        contentTypeId: 'unknown',
        contentTypeName: 'Unknown',
        languageId: languageId,
        isValid: false,
        errors: [
          {
            message: error.message || 'Failed to validate content item',
            code: 'VALIDATION_ERROR',
            elementId: null,
          },
        ],
        warnings: [],
        validationDate: new Date().toISOString(),
        itemUrl: null,
        editUrl: null,
      };
    }
  }

  // Validate multiple content items
  async validateContentItems(
    itemIds,
    languageId = '00000000-0000-0000-0000-000000000000',
    onProgress
  ) {
    if (!this.isInitialized) {
      throw new Error('Kontent.ai service not initialized');
    }

    const results = [];
    const total = itemIds.length;

    for (let i = 0; i < total; i++) {
      const itemId = itemIds[i];

      try {
        const result = await this.validateContentItem(itemId, languageId);
        results.push(result);

        // Call progress callback
        if (onProgress) {
          onProgress(i + 1, total);
        }

        // Add small delay to avoid overwhelming the API
        if (i < total - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error validating item ${itemId}:`, error);

        // Add error result
        results.push({
          itemId: itemId,
          itemName: 'Unknown',
          contentTypeId: 'unknown',
          contentTypeName: 'Unknown',
          languageId: languageId,
          isValid: false,
          errors: [
            {
              message: error.message || 'Failed to validate content item',
              code: 'VALIDATION_ERROR',
              elementId: null,
            },
          ],
          warnings: [],
          validationDate: new Date().toISOString(),
          itemUrl: null,
          editUrl: null,
        });
      }
    }

    return results;
  }

  // Validate all content items
  async validateAllContentItems(
    languageId = '00000000-0000-0000-0000-000000000000',
    onProgress
  ) {
    if (!this.isInitialized) {
      throw new Error('Kontent.ai service not initialized');
    }

    try {
      // Get all content items
      const items = await this.getContentItems();
      const itemIds = items.map((item) => item.id);

      return await this.validateContentItems(itemIds, languageId, onProgress);
    } catch (error) {
      console.error('Error validating all content items:', error);
      throw error;
    }
  }

  // Get item URL for viewing
  getItemUrl(itemId, codename) {
    if (!kontentConfig.isCustomApp) {
      return null; // Only available in Custom App environment
    }

    return `https://app.kontent.ai/content/${itemId}`;
  }

  // Get edit URL for the item
  getEditUrl(itemId, languageId) {
    if (!kontentConfig.isCustomApp) {
      return null; // Only available in Custom App environment
    }

    return `https://app.kontent.ai/content/${itemId}/edit/${languageId}`;
  }

  // Get project information
  async getProjectInfo() {
    if (!this.isInitialized) {
      throw new Error('Kontent.ai service not initialized');
    }

    try {
      const response = await this.managementClient.getProject().toPromise();
      return response.data;
    } catch (error) {
      console.error('Error fetching project info:', error);
      throw error;
    }
  }

  // Check if service is ready
  isReady() {
    return this.isInitialized;
  }
}

// Create singleton instance
const kontentService = new KontentService();

export default kontentService;
