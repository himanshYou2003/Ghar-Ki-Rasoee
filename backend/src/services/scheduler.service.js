const SubscriptionModel = require("../models/subscription.model");
const OrderModel = require("../models/order.model");
const admin = require("../config/firebase.config");

class SchedulerService {
  static async generateDailyOrders() {
    console.log("Starting Daily Order Generation...");
    const today = new Date();
    // Normalize today to YYYY-MM-DD for comparison
    const todayString = today.toISOString().split("T")[0];

    try {
      // 1. Get all Active Subscriptions
      const subscriptionsSnapshot = await SubscriptionModel.collection
        .where("status", "==", "Active")
        .get();

      if (subscriptionsSnapshot.empty) {
        console.log("No active subscriptions found.");
        return;
      }

      console.log(`Found ${subscriptionsSnapshot.size} active subscriptions.`);

      // 2. Process each subscription
      const batchPromises = subscriptionsSnapshot.docs.map(async (doc) => {
        const sub = doc.data();

        // Fetch User details for address
        const userDoc = await db.collection("users").doc(sub.userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        // Check if today is skipped
        if (sub.skippedDates && sub.skippedDates.includes(todayString)) {
          console.log(`Skipping order for user ${sub.userId} (Date Skipped)`);
          return;
        }

        // Check if remaining days > 0
        if (sub.remainingDays <= 0) {
          console.log(`Subscription expired for user ${sub.userId}`);
          // Optionally auto-expire here
          await SubscriptionModel.collection
            .doc(sub.subscriptionId)
            .update({ status: "Expired" });
          return;
        }

        // Create the Daily Order
        const orderData = {
          userId: sub.userId,
          customerName:
            userData.displayName || userData.email || "Unknown Customer",
          deliveryAddress:
            sub.deliveryAddress || userData.address || "No Address Provided",
          orderType: "Subscription",
          plan: sub.plan, // e.g. "Weekly Plan"
          items: [{ name: "Daily Meal", quantity: 1, price: 0 }],
          price: 0, // Already paid via subscription
          deliveryDate: todayString,
          paymentMethod: "Prepaid (Subscription)",
          paymentStatus: "Paid",
          status: "Cooking", // Auto-set to cooking for the day
          generatedByScheduler: true,
        };

        await OrderModel.createOrder(orderData);

        // Decrement remaining days
        await SubscriptionModel.collection.doc(sub.subscriptionId).update({
          remainingDays: admin.firestore.FieldValue.increment(-1),
        });

        console.log(`Generated order for user ${sub.userId}`);
      });

      await Promise.all(batchPromises);
      console.log("Daily Order Generation Completed.");
    } catch (error) {
      console.error("Error in generateDailyOrders:", error);
    }
  }
}

module.exports = SchedulerService;
