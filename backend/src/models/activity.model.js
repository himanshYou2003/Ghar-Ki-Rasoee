const admin = require("../config/firebase.config");
const db = admin.firestore();

class ActivityModel {
  static collection = db.collection("activities");

  /**
   * Log an activity
   * @param {string} userId - User ID
   * @param {Object} activityData - Activity data
   * @returns {Promise<Object>} Created activity
   */
  static async logActivity(userId, activityData) {
    console.log("Logging activity for user:", userId, activityData.type);
    const activityRef = this.collection.doc();
    const activity = {
      activityId: activityRef.id,
      userId,
      type: activityData.type, // 'order', 'subscription', 'skip', 'customization', 'cancel'
      action: activityData.action, // 'created', 'updated', 'cancelled', 'skipped', etc.
      description: activityData.description,
      metadata: activityData.metadata || {},
      createdAt: new Date().toISOString(),
    };

    await activityRef.set(activity);
    console.log("Activity saved successfully:", activity.activityId);
    return activity;
  }

  /**
   * Get user activities
   * @param {string} userId - User ID
   * @param {number} limit - Number of activities to fetch
   * @returns {Promise<Array>} User activities
   */
  static async getUserActivities(userId, limit = 50) {
    console.log("Fetching activities for user:", userId);
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .limit(limit)
      .get();

    if (snapshot.empty) {
      console.log("No activities found for user:", userId);
      return [];
    }

    const activities = snapshot.docs.map((doc) => doc.data());
    console.log(`Fetched ${activities.length} activities`);
    return activities;
  }

  /**
   * Get activities by type
   * @param {string} userId - User ID
   * @param {string} type - Activity type
   * @param {number} limit - Number of activities to fetch
   * @returns {Promise<Array>} Filtered activities
   */
  static async getUserActivitiesByType(userId, type, limit = 20) {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .where("type", "==", type)
      .limit(limit)
      .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => doc.data());
  }
}

module.exports = ActivityModel;
