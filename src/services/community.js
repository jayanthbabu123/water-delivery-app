import firestore from "@react-native-firebase/firestore";

// Community service for managing community and apartment data
export class CommunityService {
  // Get all communities
  static async getCommunities() {
    try {
      const communitiesRef = firestore().collection("communities");
      const snapshot = await communitiesRef.where("isActive", "==", true).get();

      const communities = [];
      snapshot.forEach((doc) => {
        communities.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return communities;
    } catch (error) {
      console.error("Error getting communities:", error);
      throw new Error("Failed to load communities");
    }
  }

  // Get apartments for a specific community
  static async getApartments(communityId) {
    try {
      const communityRef = firestore()
        .collection("communities")
        .doc(communityId);
      const communityDoc = await communityRef.get();

      if (!communityDoc.exists) {
        throw new Error("Community not found");
      }

      const communityData = communityDoc.data();
      return communityData.apartments || [];
    } catch (error) {
      console.error("Error getting apartments:", error);
      throw new Error("Failed to load apartments");
    }
  }

  // Get community details by ID
  static async getCommunityById(communityId) {
    try {
      const communityDoc = await firestore()
        .collection("communities")
        .doc(communityId)
        .get();

      if (!communityDoc.exists) {
        return null;
      }

      return {
        id: communityDoc.id,
        ...communityDoc.data(),
      };
    } catch (error) {
      console.error("Error getting community:", error);
      throw new Error("Failed to get community details");
    }
  }

  // Format community data for Select component
  static formatCommunitiesForSelect(communities) {
    return communities.map((community) => ({
      label: community.name,
      value: community.id,
    }));
  }

  // Format apartments data for Select component
  static formatApartmentsForSelect(apartments) {
    return apartments.map((apartment) => ({
      label: apartment.toString(),
      value: apartment.toString(),
    }));
  }

  // Create initial communities (for setup)
  static async createInitialCommunities() {
    try {
      const communities = [
        {
          id: "sunset_gardens",
          name: "Sunset Gardens",
          apartments: ["101", "102", "201", "202", "301", "302"],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "ocean_view",
          name: "Ocean View Apartments",
          apartments: ["A101", "A102", "B101", "B102", "C101", "C102"],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "mountain_heights",
          name: "Mountain Heights",
          apartments: ["1A", "1B", "2A", "2B", "3A", "3B"],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "riverside",
          name: "Riverside Residences",
          apartments: ["101", "102", "201", "202", "301", "302"],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];

      const batch = firestore().batch();

      communities.forEach((community) => {
        const communityRef = firestore()
          .collection("communities")
          .doc(community.id);
        batch.set(communityRef, community);
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error creating initial communities:", error);
      throw new Error("Failed to create initial communities");
    }
  }
}

export default CommunityService;
