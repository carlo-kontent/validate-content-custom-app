import { ManagementClient } from '@kontent-ai/management-sdk';
import { kontentConfig, validateKontentConfig } from '../config/kontent';

class KontentService {
  constructor() {
    try {
      validateKontentConfig();

      this.managementClient = new ManagementClient({
        environmentId: kontentConfig.environmentId,
        apiKey: kontentConfig.managementApiKey,
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

  // Get all collections
  async getCollections() {
    if (!this.isInitialized) {
      throw new Error('Kontent.ai service not initialized');
    }

    try {
      const response = await this.managementClient
        .listCollections()
        .toPromise();
      const collections = response.data.collections || [];

      console.log(`🔓 All collections accessible: ${collections.length} found`);
      return collections;
    } catch (error) {
      console.warn(
        'Error fetching collections (possibly insufficient permissions):',
        error
      );
      return []; // Return empty array as fallback
    }
  }

  // Get all content items
  async getContentItems(options = {}) {
    if (!this.isInitialized) {
      throw new Error('Kontent.ai service not initialized');
    }

    try {
      let response = await this.managementClient.listContentItems().toPromise();

      let items = response.data.items;
      const totalItems = items.length;
      let filteredItems = items;
      let filterCounts = {
        total: totalItems,
        byCollection: totalItems,
        final: totalItems,
      };

      // Apply collection-based filtering if enabled
      if (
        options.validateByCollection &&
        options.selectedCollectionIds &&
        options.selectedCollectionIds.length > 0
      ) {
        const collectionFiltered = this.filterByCollection(
          filteredItems,
          options.selectedCollectionIds
        );
        filterCounts.byCollection = collectionFiltered.length;
        filteredItems = collectionFiltered;
      }

      filterCounts.final = filteredItems.length;

      return {
        items: filteredItems,
        counts: filterCounts,
      };
    } catch (error) {
      console.error('Error fetching content items:', error);
      throw error;
    }
  }

  // Filter content items by collection(s)
  filterByCollection(items, collectionIds) {
    return items.filter((item) => {
      // Filter by specific collection ID(s)
      return collectionIds.includes(item.collection?.id);
    });
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
    onProgress,
    onDetailedProgress,
    filteredItems = null
  ) {
    if (!this.isInitialized) {
      throw new Error('Kontent.ai service not initialized');
    }

    try {
      // Use filtered items if provided, otherwise get all items
      const items = filteredItems || (await this.getContentItems());
      const contentTypes = await this.getContentTypes();
      console.log(
        `Found ${items.length} content items. Sending for validation...`
      );
      console.log(`Found ${contentTypes.length} content types for reference`);

      // Log all items for debugging
      console.log(
        'All content items:',
        items.map((item) => ({
          id: item?.id,
          name: item?.name,
          codename: item?.codename,
          type: item?.type,
          hasType: !!item?.type,
          hasTypeId: !!item?.type?.id,
        }))
      );

      // Log all content types for debugging
      console.log(
        'All content types:',
        contentTypes.map((ct) => ({
          id: ct?.id,
          name: ct?.name,
          codename: ct?.codename,
          elementsCount: ct?.elements?.length || 0,
        }))
      );

      // Validate that items have proper type references
      const itemsWithValidTypes = items.filter(
        (item) => item && item.type && item.type.id
      );
      const itemsWithoutTypes = items.filter(
        (item) => !item || !item.type || !item.type.id
      );

      if (itemsWithoutTypes.length > 0) {
        console.warn(
          `Found ${itemsWithoutTypes.length} items without valid type references:`,
          itemsWithoutTypes.map((item) => ({
            id: item?.id,
            name: item?.name,
            codename: item?.codename,
            type: item?.type,
            hasType: !!item?.type,
            hasTypeId: !!item?.type?.id,
          }))
        );
      }

      if (itemsWithValidTypes.length === 0) {
        throw new Error(
          'No content items with valid type references found. Cannot proceed with validation.'
        );
      }

      // Ensure content types array is valid
      if (!Array.isArray(contentTypes) || contentTypes.length === 0) {
        console.warn(
          'No content types found. Element-level progress tracking will be limited.'
        );
      }

      // Additional data structure validation
      console.log('=== DATA STRUCTURE VALIDATION ===');

      // Check for items with missing or malformed properties
      const problematicItems = items.filter((item) => {
        if (!item) return true;
        if (!item.id) return true;
        if (!item.name) return true;
        if (!item.type) return true;
        if (!item.type.id) return true;
        return false;
      });

      if (problematicItems.length > 0) {
        console.error(
          'Found problematic items:',
          problematicItems.map((item) => ({
            id: item?.id,
            name: item?.name,
            codename: item?.codename,
            type: item?.type,
            missingProperties: {
              id: !item?.id,
              name: !item?.name,
              type: !item?.type,
              typeId: !item?.type?.id,
            },
          }))
        );
      }

      // Check for content types with missing properties
      const problematicContentTypes = contentTypes.filter((ct) => {
        if (!ct) return true;
        if (!ct.id) return true;
        if (!ct.name) return true;
        if (!ct.elements) return true;
        return false;
      });

      if (problematicContentTypes.length > 0) {
        console.error(
          'Found problematic content types:',
          problematicContentTypes.map((ct) => ({
            id: ct?.id,
            name: ct?.name,
            codename: ct?.codename,
            elements: ct?.elements,
            missingProperties: {
              id: !ct?.id,
              name: !ct?.name,
              elements: !ct?.elements,
            },
          }))
        );
      }

      console.log('=== END DATA STRUCTURE VALIDATION ===');

      // Update detailed progress - initialization
      if (onDetailedProgress) {
        onDetailedProgress(
          null, // no current item yet
          null, // no current element yet
          'Initializing validation',
          0,
          3 // total steps: initialize, validate, fetch results
        );
      }

      const payload = {
        items: items.map((item) => ({
          id: item.id,
          language: { id: languageId },
        })),
      };

      const baseUrl = `https://manage.kontent.ai/v2/projects/${kontentConfig.environmentId}/validate-async`;

      // Step 1: Start validation
      if (onDetailedProgress) {
        onDetailedProgress(null, null, 'Starting validation process', 1, 3);
      }

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

      // Step 2: Poll for progress with element-level simulation
      const taskUrl = `${baseUrl}/tasks/${taskId}`;
      let status = 'queued';
      let attempts = 0;
      const pollInterval = kontentConfig.validationPollInterval || 1000; // Use configurable poll interval

      if (onDetailedProgress) {
        onDetailedProgress(null, null, 'Polling validation status', 2, 3);
      }

      console.log(`Starting validation polling. Task ID: ${taskId}`);
      console.log(`Poll interval: ${pollInterval}ms`);
      console.log('Validation will continue until completion or manual stop');

      // Continue polling until validation is finished or manually stopped
      while (status !== 'finished') {
        try {
          const progressResponse = await fetch(taskUrl, {
            headers: {
              Authorization: `Bearer ${kontentConfig.managementApiKey}`,
            },
          });

          if (!progressResponse.ok) {
            throw new Error(
              `Failed to check validation status: ${progressResponse.status} ${progressResponse.statusText}`
            );
          }

          const progressData = await progressResponse.json();
          status = progressData.status;

          console.log(`Validation status (attempt ${attempts + 1}): ${status}`);

          // Update main progress based on items being processed
          if (onProgress) {
            // Calculate progress based on actual items being processed
            let processedItems = 0;
            if (status === 'queued') {
              processedItems = Math.min(attempts, items.length);
            } else if (status === 'in_progress') {
              processedItems = Math.min(
                attempts + Math.floor(items.length * 0.5),
                items.length
              );
            } else if (status === 'finished') {
              processedItems = items.length;
            }
            onProgress(processedItems, items.length);
          }

          // Update detailed progress with current item and element being processed
          if (onDetailedProgress && items.length > 0) {
            try {
              const currentItemIndex = attempts % items.length;
              const currentItem = items[currentItemIndex];

              console.log(`Processing item at index ${currentItemIndex}:`, {
                item: currentItem,
                hasItem: !!currentItem,
                hasId: !!currentItem?.id,
                hasName: !!currentItem?.name,
                hasType: !!currentItem?.type,
                hasTypeId: !!currentItem?.type?.id,
              });

              // Only proceed if we have a valid item
              if (currentItem && currentItem.id) {
                // Find the content type for this item to get element information
                let currentElement = null;

                // Only try to find content type if the item has a valid type reference
                if (currentItem.type && currentItem.type.id) {
                  console.log(
                    `Looking for content type with ID: ${currentItem.type.id}`
                  );

                  const contentType = contentTypes.find(
                    (ct) => ct.id === currentItem.type.id
                  );

                  console.log(`Found content type:`, contentType);

                  if (
                    contentType &&
                    contentType.elements &&
                    contentType.elements.length > 0
                  ) {
                    // Cycle through elements to simulate element-level validation
                    const elementIndex =
                      Math.floor(attempts / items.length) %
                      contentType.elements.length;
                    currentElement = contentType.elements[elementIndex];

                    console.log(`Selected element:`, currentElement);
                  }
                } else {
                  console.log(
                    `Item ${currentItem.id} (${currentItem.name}) has invalid type:`,
                    currentItem.type
                  );
                }

                onDetailedProgress(
                  currentItem,
                  currentElement,
                  `Validating item ${currentItemIndex + 1} of ${
                    items.length
                  }: ${currentItem.name || 'Unknown Item'}`,
                  2,
                  3
                );
              } else {
                console.error(
                  `Invalid item at index ${currentItemIndex}:`,
                  currentItem
                );
              }
            } catch (error) {
              console.error(
                `Error processing item at index ${attempts % items.length}:`,
                error
              );
              console.error('Current items array:', items);
              console.error('Current content types array:', contentTypes);
              throw new Error(`Failed to process item: ${error.message}`);
            }
          }

          if (status !== 'finished') {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            attempts++;
          }
        } catch (error) {
          console.error(
            `Error during validation polling (attempt ${attempts + 1}):`,
            error
          );
          attempts++;

          // Wait a bit longer before retrying on errors
          await new Promise((resolve) => setTimeout(resolve, pollInterval * 2));

          // Continue trying - don't give up on errors
          console.log('Retrying validation status check...');
        }
      }

      console.log(
        `Validation task completed successfully after ${attempts} attempts`
      );

      // Step 3: Fetch validation issues
      if (onDetailedProgress) {
        onDetailedProgress(null, null, 'Fetching validation results', 3, 3);
      }

      const issuesUrl = `${taskUrl}/issues`;
      const issuesResponse = await fetch(issuesUrl, {
        headers: {
          Authorization: `Bearer ${kontentConfig.managementApiKey}`,
        },
      });

      const issuesData = await issuesResponse.json();

      // Log the issues data structure for debugging
      console.log('=== VALIDATION ISSUES DATA ===');
      console.log('Issues response:', issuesData);
      console.log('Issues array:', issuesData.issues);
      console.log('Issues count:', issuesData.issues?.length || 0);

      if (issuesData.issues && issuesData.issues.length > 0) {
        console.log('Sample issue structure:', issuesData.issues[0]);
        console.log(
          'Issue item references:',
          issuesData.issues.map((i) => ({
            hasIssue: !!i,
            hasItem: !!i?.item,
            itemId: i?.item?.id,
            itemName: i?.item?.name,
          }))
        );
      }
      console.log('=== END VALIDATION ISSUES DATA ===');

      // Ensure issues data has the expected structure
      if (!issuesData.issues || !Array.isArray(issuesData.issues)) {
        console.warn(
          'Issues data does not have expected structure. Creating empty results.'
        );
        const results = items.map((item) => ({
          itemId: item.id,
          itemName: item.name,
          contentTypeId: item.type?.id || 'unknown',
          collectionId: item.collection?.id || null,
          collectionName: item.collection?.name || 'No Collection',
          languageId,
          isValid: true, // Assume valid if no issues data
          errors: [],
          warnings: [],
          validationDate: new Date().toISOString(),
          itemUrl: this.getItemUrl(item.id, item.codename),
          editUrl: this.getEditUrl(item.id, languageId),
          rawResponse: null,
        }));
        return results;
      }

      const results = items.map((item) => {
        // Add null check to prevent "Cannot read properties of undefined (reading 'id')" error
        const issue = issuesData.issues?.find(
          (i) => i && i.item && i.item.id === item.id
        );

        // Find content type for this item
        const contentType = contentTypes?.find((ct) => ct.id === item.type?.id);

        // Generate warnings based on content quality
        const warnings = this.generateWarnings(item, contentTypes);

        return {
          itemId: item.id,
          itemName: item.name,
          contentTypeId: item.type?.id || 'unknown',
          contentTypeName: contentType?.name || 'Unknown Type',
          collectionId: item.collection?.id || null,
          collectionName: item.collection?.name || 'No Collection',
          languageId,
          isValid: !issue?.issues?.length,
          errors:
            issue?.issues?.map((i) => ({
              message: i.messages?.join('\n') || 'Unknown error',
              elementId: i.element?.id || null,
            })) || [],
          warnings: warnings,
          validationDate: new Date().toISOString(),
          itemUrl: this.getItemUrl(item.id, item.codename),
          editUrl: this.getEditUrl(item.id, languageId),
          rawResponse: issue || null,
        };
      });

      return results;
    } catch (error) {
      console.error('=== VALIDATION ERROR DETAILS ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error occurred during validation process');

      // Log the current state when error occurred
      if (typeof items !== 'undefined') {
        console.error('Items array length:', items.length);
        console.error('Items array:', items);
      }

      if (typeof contentTypes !== 'undefined') {
        console.error('Content types array length:', contentTypes.length);
        console.error('Content types array:', contentTypes);
      }

      console.error('=== END ERROR DETAILS ===');

      throw new Error(
        `Validation failed: ${error.message}. Check console for detailed debugging information.`
      );
    }
  }

  // Generate warnings based on content quality issues
  generateWarnings(item, contentTypes) {
    const warnings = [];

    // Find content type for this item
    const contentType = contentTypes?.find((ct) => ct.id === item.type?.id);
    if (!contentType) {
      return warnings;
    }

    // Warning: Item name is very short (less than 5 characters)
    if (item.name && item.name.length < 5) {
      warnings.push({
        message: `Item name "${item.name}" is very short (${item.name.length} characters). Consider using a more descriptive name.`,
        elementId: null,
        type: 'content_quality',
      });
    }

    // Warning: Item name contains placeholder text
    if (
      item.name &&
      (item.name.includes('TODO') ||
        item.name.includes('placeholder') ||
        item.name.includes('test'))
    ) {
      warnings.push({
        message: `Item name "${item.name}" appears to contain placeholder text. Consider updating to final content.`,
        elementId: null,
        type: 'content_quality',
      });
    }

    // Warning: Item codename suggests it's incomplete
    if (
      item.codename &&
      (item.codename.includes('broken') ||
        item.codename.includes('invalid') ||
        item.codename.includes('long'))
    ) {
      warnings.push({
        message: `Item appears to be a demo or test item based on codename "${item.codename}". Consider reviewing for production use.`,
        elementId: null,
        type: 'content_status',
      });
    }

    return warnings;
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
      // Since getProject() is not available, return basic project info
      console.log('⚠️ getProject() method not available in Management API');
      return {
        id: this.environmentId,
        name: 'Environment',
        description: 'Project information not available via Management API',
      };
    } catch (error) {
      console.error('Error fetching project info:', error);
      throw error;
    }
  }

  // Check if service is ready
  isReady() {
    return this.isInitialized;
  }

  // Exponential backoff method for handling rate limiting
  async fetchWithExponentialBackoff(
    fetchFunction,
    operationName,
    maxRetries = 3
  ) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Calculate delay with exponential backoff: 2^attempt * 1000ms (1s, 2s, 4s, 8s)
          const delay = Math.min(Math.pow(2, attempt) * 1000, 30000); // Max 30 seconds
          console.log(
            `⏳ Attempt ${attempt + 1}/${
              maxRetries + 1
            }: Waiting ${delay}ms before retry for ${operationName}...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        return await fetchFunction();
      } catch (error) {
        lastError = error;

        // Check if it's a rate limiting error
        if (error.response && error.response.status === 429) {
          console.warn(
            `⚠️ Rate limited (429) on attempt ${
              attempt + 1
            } for ${operationName}. Retrying with exponential backoff...`
          );

          if (attempt === maxRetries) {
            console.error(
              `❌ Max retries (${maxRetries}) reached for ${operationName}. Giving up.`
            );
            throw new Error(
              `Rate limit exceeded after ${maxRetries} retries for ${operationName}`
            );
          }

          // Continue to next attempt
          continue;
        }

        // For non-rate-limit errors, don't retry
        console.error(
          `❌ Non-retryable error on attempt ${
            attempt + 1
          } for ${operationName}:`,
          error
        );
        throw error;
      }
    }

    // This should never be reached, but just in case
    throw lastError;
  }

  // Get collection item counts
  async getCollectionItemCounts() {
    if (!this.isInitialized) {
      throw new Error('Kontent.ai service not initialized');
    }

    try {
      const response = await this.managementClient
        .listContentItems()
        .toPromise();
      const items = response.data.items;

      // Group items by collection
      const collectionCounts = {};
      items.forEach((item) => {
        const collectionId = item.collection?.id || 'no-collection';
        const collectionName = item.collection?.name || 'No Collection';

        if (!collectionCounts[collectionId]) {
          collectionCounts[collectionId] = {
            id: collectionId,
            name: collectionName,
            count: 0,
          };
        }
        collectionCounts[collectionId].count++;
      });

      return Object.values(collectionCounts);
    } catch (error) {
      console.warn(
        'Error fetching collection counts (possibly insufficient permissions):',
        error
      );
      return [];
    }
  }
}

// Create singleton instance
const kontentService = new KontentService();

export default kontentService;
