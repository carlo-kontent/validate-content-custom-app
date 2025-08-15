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

  // Validate all content items using async validation flow
  async validateAllContentItems(
    languageId = '00000000-0000-0000-0000-000000000000',
    onProgress
  ) {
    if (!this.isInitialized) {
      throw new Error('Kontent.ai service not initialized');
    }

    try {
      const items = await this.getContentItems();
      console.log(
        `Found ${items.length} content items. Sending for validation...`
      );

      const payload = {
        items: items.map((item) => ({
          id: item.id,
          language: { id: languageId },
        })),
      };

      const baseUrl = `https://manage.kontent.ai/v2/projects/${kontentConfig.environmentId}/validate-async`;

      // Step 1: Start validation
      const startResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kontentConfig.managementApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!startResponse.ok) {
        throw new Error(`Validation start failed: ${startResponse.status}`);
      }

      const startData = await startResponse.json();
      const taskId = startData.id;

      // Step 2: Poll for progress
      const taskUrl = `${baseUrl}/tasks/${taskId}`;
      let status = 'queued';
      let attempts = 0;

      while (status !== 'finished' && attempts < 20) {
        const progressResponse = await fetch(taskUrl, {
          headers: {
            Authorization: `Bearer ${kontentConfig.managementApiKey}`,
          },
        });

        const progressData = await progressResponse.json();
        status = progressData.status;

        if (onProgress) {
          onProgress(attempts + 1, 20);
        }

        if (status !== 'finished') {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempts++;
        }
      }

      if (status !== 'finished') {
        throw new Error('Validation task did not finish in time');
      }

      // Step 3: Fetch validation issues
      const issuesUrl = `${taskUrl}/issues`;
      const issuesResponse = await fetch(issuesUrl, {
        headers: {
          Authorization: `Bearer ${kontentConfig.managementApiKey}`,
        },
      });

      const issuesData = await issuesResponse.json();
      const results = items.map((item) => {
        const issue = issuesData.issues.find((i) => i.item.id === item.id);
        return {
          itemId: item.id,
          itemName: item.name,
          contentTypeId: item.type?.id || 'unknown',
          languageId,
          isValid: !issue?.issues?.length,
          errors:
            issue?.issues?.map((i) => ({
              message: i.messages.join('\n'),
              elementId: i.element?.id || null,
            })) || [],
          warnings: [],
          validationDate: new Date().toISOString(),
          itemUrl: this.getItemUrl(item.id, item.codename),
          editUrl: this.getEditUrl(item.id, languageId),
          rawResponse: issue || null,
        };
      });

      return results;
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
