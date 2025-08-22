// Browser Storage Utility for Kontent.ai Environment ID

const STORAGE_KEY = 'kontent_environment_id';
const USER_STORAGE_KEY = 'kontent_user_info';

export const storage = {
  getEnvironmentId: () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error reading environment ID from storage:', error);
      return null;
    }
  },

  setEnvironmentId: (environmentId) => {
    try {
      localStorage.setItem(STORAGE_KEY, environmentId);
    } catch (error) {
      console.error('Error saving environment ID to storage:', error);
    }
  },

  clearEnvironmentId: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing environment data from storage:', error);
    }
  },

  hasEnvironmentId: () => {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error checking environment ID in storage:', error);
      return false;
    }
  },

  // User info storage methods
  getUserInfo: () => {
    try {
      const userInfo = localStorage.getItem(USER_STORAGE_KEY);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error reading user info from storage:', error);
      return null;
    }
  },

  setUserInfo: (userInfo) => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error saving user info to storage:', error);
    }
  },

  clearUserInfo: () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing user info from storage:', error);
    }
  },

  // Clear all storage
  clearAll: () => {
    storage.clearEnvironmentId();
    storage.clearUserInfo();
  },
};

export default storage;
