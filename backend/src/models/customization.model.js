const admin = require("../config/firebase.config");
const db = admin.firestore();

class CustomizationModel {
  static collection = db.collection("customizations");

  /**
   * Save user's meal preferences
   * @param {string} userId - User ID
   * @param {string} subscriptionId - Associated subscription ID
   * @param {object} preferences - Weekly meal customizations
   */
  static async savePreferences(userId, subscriptionId, preferences) {
    const customizationData = {
      userId,
      subscriptionId,
      preferences, // { monday: { sabzi1: "...", sabzi2: "..." }, ... }
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await this.collection.add(customizationData);
    return { customizationId: docRef.id, ...customizationData };
  }

  /**
   * Get user's preferences for a subscription
   */
  static async getBySubscription(subscriptionId) {
    const snapshot = await this.collection
      .where("subscriptionId", "==", subscriptionId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { customizationId: doc.id, ...doc.data() };
  }

  /**
   * Get user's preferences by user ID
   */
  static async getByUserId(userId) {
    const snapshot = await this.collection.where("userId", "==", userId).get();
    return snapshot.docs.map((doc) => ({
      customizationId: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Update day preference
   */
  static async updateDayPreference(customizationId, day, dayPreferences) {
    const updateData = {
      [`preferences.${day}`]: dayPreferences,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await this.collection.doc(customizationId).update(updateData);
    return { customizationId, day, ...dayPreferences };
  }

  /**
   * Update entire preferences
   */
  static async updatePreferences(customizationId, preferences) {
    const updateData = {
      preferences,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await this.collection.doc(customizationId).update(updateData);
    const doc = await this.collection.doc(customizationId).get();
    return { customizationId: doc.id, ...doc.data() };
  }
}

module.exports = CustomizationModel;
