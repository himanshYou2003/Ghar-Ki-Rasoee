const admin = require("../config/firebase.config");
const { v4: uuidv4 } = require("uuid");
const db = admin.firestore();

class SubscriptionModel {
  static collection = db.collection("subscriptions");

  static async createSubscription(uid, planData) {
    const subscriptionId = uuidv4();
    const startDate = new Date();
    const duration = planData.duration || 30; // Default 30 days
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + duration);

    const newSubscription = {
      subscriptionId,
      userId: uid,
      plan: planData.plan || "Custom Plan",
      planDetails: planData.planDetails || {},
      status: "Active",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      remainingDays: duration,
      skippedDates: [],
      preferences: {
        defaultMeal: "Veg", // Default preference
      },
      deliveryAddress: planData.deliveryAddress || "",
      paymentMethod: planData.paymentMethod || "Online",
      paymentStatus: planData.paymentStatus || "Paid",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.collection.doc(subscriptionId).set(newSubscription);
    return newSubscription;
  }

  static async getUserSubscription(uid) {
    const snapshot = await this.collection
      .where("userId", "==", uid)
      .where("status", "==", "Active")
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  }

  static async skipDate(subscriptionId, date, currentEndDate) {
    if (!subscriptionId) throw new Error("Subscription ID is required");

    const updates = {
      skippedDates: admin.firestore.FieldValue.arrayUnion(date),
      updatedAt: new Date().toISOString(),
    };

    // If endDate is provided, extend it by 1 day
    if (currentEndDate) {
      const endDate = new Date(currentEndDate);
      if (!isNaN(endDate.getTime())) {
        endDate.setDate(endDate.getDate() + 1);
        updates.endDate = endDate.toISOString();
      }
    }

    // Also increment remainingDays if it exists
    updates.remainingDays = admin.firestore.FieldValue.increment(1);

    await this.collection.doc(subscriptionId).update(updates);

    return { subscriptionId, skippedDate: date, newEndDate: updates.endDate };
  }
  static async getAllSubscriptions() {
    const snapshot = await this.collection.orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => doc.data());
  }
}

module.exports = SubscriptionModel;
