import CommunityService from '../services/community';

// Initialize sample data for the app
export const initializeAppData = async () => {
  try {
    console.log('Initializing app data...');

    // Check if communities already exist
    const existingCommunities = await CommunityService.getCommunities();

    if (existingCommunities.length === 0) {
      console.log('No communities found, creating initial data...');
      await CommunityService.createInitialCommunities();
      console.log('Initial communities created successfully');
    } else {
      console.log(`Found ${existingCommunities.length} existing communities`);
    }

    return true;
  } catch (error) {
    console.error('Error initializing app data:', error);
    return false;
  }
};

// Initialize data on app startup (call this in App.js or _layout.jsx)
export const setupAppData = async () => {
  try {
    const success = await initializeAppData();
    if (success) {
      console.log('App data setup completed');
    } else {
      console.log('App data setup failed, but app can continue');
    }
  } catch (error) {
    console.error('Error in app data setup:', error);
    // Don't throw error to prevent app crash
  }
};

export default {
  initializeAppData,
  setupAppData
};
