const SubscriptionModel = require("../models/subscription.model");
const ResponseUtil = require("../utils/response.util");
const cache = require("../utils/cache.util");

class SubscriptionController {
  // This meant to be called after payment success or to initiate Standard plan?
  // For now, let's assume it creates a pending subscription record to be activated by payment.
  static async createSubscription(req, res) {
    try {
      const { uid } = req.user;
      const {
        plan,
        planDetails,
        durationMonths,
        deliveryAddress,
        paymentMethod,
        paymentStatus,
      } = req.body;

      if (!plan) return ResponseUtil.error(res, 400, "Plan is required");

      // Check if user already has active subscription
      const existing = await SubscriptionModel.getUserSubscription(uid);

      if (existing) {
        // For simplicity, we can error out or just update/overwrite.
        // Let's allow overwriting for now (or maybe user wants to change plan).
        // If we strictly follow business logic, we should probably ask to cancel first.
        // But for this demo, let's just proceed (maybe cancelling old one if we had logic).
        // console.log("User already has subscription, overwriting/extending...");
      }

      const planData = {
        plan: plan.name || plan,
        planDetails: planDetails || plan,
        duration: (durationMonths || 1) * 30, // Convert months to days approx
        deliveryAddress,
        paymentMethod,
        paymentStatus,
      };

      const newSub = await SubscriptionModel.createSubscription(uid, planData);

      // Also update user profile with this address if they don't have one
      const UserModel = require("../models/user.model");
      await UserModel.collection
        .doc(uid)
        .update({
          address: deliveryAddress,
          updatedAt: new Date().toISOString(),
        })
        .catch((err) =>
          console.error("Error updating user address during sub:", err),
        );

      // Log activity
      const ActivityModel = require("../models/activity.model");
      await ActivityModel.logActivity(uid, {
        type: "subscription",
        action: "created",
        description: `Created ${plan.name || plan} subscription plan`,
        metadata: {
          plan: plan.name || plan,
          subscriptionId: newSub.subscriptionId,
        },
      });

      // Invalidate cache
      cache.delete(`user_subscription_${uid}`);

      ResponseUtil.send(res, 201, "Subscription created", newSub);
    } catch (error) {
      console.error("Error creating subscription:", error);
      ResponseUtil.error(res, 500, "Failed to create subscription", error);
    }
  }

  static async getSubscription(req, res) {
    try {
      const { uid } = req.user;

      const cachedSub = cache.get(`user_subscription_${uid}`);
      if (cachedSub) {
        return ResponseUtil.send(
          res,
          200,
          "Active subscription fetched (cached)",
          cachedSub,
        );
      }

      const sub = await SubscriptionModel.getUserSubscription(uid);
      if (!sub)
        return ResponseUtil.error(res, 404, "No active subscription found");

      cache.set(`user_subscription_${uid}`, sub, 300); // 5 minutes cache

      ResponseUtil.send(res, 200, "Active subscription fetched", sub);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      ResponseUtil.error(res, 500, "Failed to fetch subscription", error);
    }
  }

  static async cancelSubscription(req, res) {
    try {
      const { uid } = req.user;
      const sub = await SubscriptionModel.getUserSubscription(uid);

      if (!sub)
        return ResponseUtil.error(res, 404, "No active subscription to cancel");

      // Logic to call Stripe to cancel would go here

      // Using pauseSubscription as cancel for now, or update status manually
      const { reason } = req.body;
      await SubscriptionModel.collection.doc(sub.subscriptionId).update({
        status: "Cancelled",
        cancellationReason: reason,
        updatedAt: new Date().toISOString(),
      });

      // Log activity
      const ActivityModel = require("../models/activity.model");
      await ActivityModel.logActivity(uid, {
        type: "cancel",
        action: "cancelled",
        description: `Cancelled subscription - Reason: ${reason}`,
        metadata: { reason, subscriptionId: sub.subscriptionId },
      });

      // Invalidate cache
      cache.delete(`user_subscription_${uid}`);

      const updated = { ...sub, status: "Cancelled" };
      ResponseUtil.send(res, 200, "Subscription cancelled", updated);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      ResponseUtil.error(res, 500, "Failed to cancel subscription", error);
    }
  }

  static async skipDate(req, res) {
    try {
      const { uid } = req.user;
      const { date } = req.body;

      if (!date) {
        return ResponseUtil.error(res, 400, "Date is required");
      }

      const sub = await SubscriptionModel.getUserSubscription(uid);
      if (!sub) {
        return ResponseUtil.error(res, 404, "No active subscription found");
      }

      if (sub.status !== "Active") {
        return ResponseUtil.error(
          res,
          400,
          "Can only skip dates for active subscriptions",
        );
      }

      // Get existing skipped dates or initialize empty array
      const skippedDates = sub.skippedDates || [];

      // Check if date is already skipped
      if (skippedDates.includes(date)) {
        return ResponseUtil.error(res, 400, "This date is already skipped");
      }

      // Use Model to handle skipping logic (atomic updates)
      const result = await SubscriptionModel.skipDate(
        sub.subscriptionId,
        date,
        sub.endDate,
      );

      // Log activity
      const ActivityModel = require("../models/activity.model");
      await ActivityModel.logActivity(uid, {
        type: "skip",
        action: "skipped",
        description: `Skipped delivery for ${new Date(date).toLocaleDateString()}`,
        metadata: { date, subscriptionId: sub.subscriptionId },
      });

      // Invalidate cache
      cache.delete(`user_subscription_${uid}`);

      ResponseUtil.send(res, 200, "Date skipped successfully", {
        skippedDate: date,
        newEndDate: result.newEndDate,
        totalSkippedDates: (sub.skippedDates?.length || 0) + 1,
      });
    } catch (error) {
      console.error("Error skipping date:", error);
      ResponseUtil.error(res, 500, "Failed to skip date", error);
    }
  }
}

module.exports = SubscriptionController;
