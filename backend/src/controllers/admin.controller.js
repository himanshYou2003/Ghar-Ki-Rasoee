const admin = require("../config/firebase.config");
const db = admin.firestore();
const ResponseUtil = require("../utils/response.util");
const SubscriptionModel = require("../models/subscription.model");
const cache = require("../utils/cache.util");

class AdminController {
  static async getDashboardStats(req, res) {
    try {
      const cachedStats = cache.get("admin_dashboard_stats");
      if (cachedStats) {
        return ResponseUtil.send(
          res,
          200,
          "Dashboard stats fetched (cached)",
          cachedStats,
        );
      }

      const ordersSnapshot = await db.collection("orders").get();
      const usersSnapshot = await db.collection("users").get();

      const totalOrders = ordersSnapshot.size;
      const totalUsers = usersSnapshot.size;

      let totalRevenue = 0;
      const paymentMethodsMap = {
        "Credit/Debit": 0,
        UPI: 0,
        "Digital Wallet": 0,
      };

      const friendlyNames = {
        card: "Credit/Debit",
        upi: "UPI",
        apple_pay: "Digital Wallet",
        google_pay: "Digital Wallet",
        wallet: "Digital Wallet",
        "Cash on Delivery": "Cash",
      };

      const subscriptionsSnapshot = await db.collection("subscriptions").get();
      const subMap = {};
      subscriptionsSnapshot.forEach((doc) => {
        const sub = doc.data();
        subMap[doc.id] = sub;
        if (sub.paymentStatus === "Paid") {
          const price = sub.planDetails?.price || sub.price || 0;
          totalRevenue += Number(price);
        }
      });

      const recentOrders = [];
      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        totalRevenue += Number(data.price || 0);
        let rawMethod = data.paymentMethod || "Online";

        if (rawMethod === "Prepaid (Subscription)") {
          const sub = subMap[data.subscriptionId];
          if (sub) {
            rawMethod = sub.paymentMethod;
          } else {
            const userSub = Object.values(subMap).find(
              (s) => s.userId === data.userId && s.status === "Active",
            );
            rawMethod = userSub?.paymentMethod || "card";
          }
        }

        const method = friendlyNames[rawMethod] || rawMethod;
        if (paymentMethodsMap[method] !== undefined) {
          paymentMethodsMap[method]++;
        } else if (method !== "Prepaid (Subscription)") {
          paymentMethodsMap[method] = (paymentMethodsMap[method] || 0) + 1;
        }

        if (recentOrders.length < 5) {
          recentOrders.push({
            orderId: doc.id,
            user: data.userId,
            amount: data.price,
            status: data.status,
            date: data.createdAt,
          });
        }
      });

      const paymentMethodsStats = Object.keys(paymentMethodsMap).map(
        (name) => ({ name, value: paymentMethodsMap[name] }),
      );

      recentOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
      const top5Recent = recentOrders.slice(0, 5);

      const stats = {
        totalOrders,
        totalUsers,
        totalRevenue,
        paymentMethods: paymentMethodsStats,
        recentOrders: top5Recent,
      };

      cache.set("admin_dashboard_stats", stats, 60);
      ResponseUtil.send(res, 200, "Dashboard stats fetched", stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      ResponseUtil.error(res, 500, "Failed to fetch stats", error);
    }
  }

  static async getAllSubscriptions(req, res) {
    try {
      const cachedSubs = cache.get("admin_all_subscriptions");
      if (cachedSubs) {
        return ResponseUtil.send(
          res,
          200,
          "Subscriptions fetched (cached)",
          cachedSubs,
        );
      }

      const subscriptions = await SubscriptionModel.getAllSubscriptions();
      const enrichedSubscriptions = await Promise.all(
        subscriptions.map(async (sub) => {
          try {
            const userDoc = await db.collection("users").doc(sub.userId).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              let userName = userData.name || userData.displayName;
              if (!userName && userData.email) {
                userName = userData.email.split("@")[0];
                userName = userName.charAt(0).toUpperCase() + userName.slice(1);
              }
              return {
                ...sub,
                userName: userName || "Customer",
                userEmail: userData.email || "",
              };
            }
          } catch (e) {
            console.error(
              `Error fetching user for sub ${sub.subscriptionId}:`,
              e,
            );
          }
          return { ...sub, userName: "Unknown User", userEmail: "" };
        }),
      );

      cache.set("admin_all_subscriptions", enrichedSubscriptions, 120); // 2 min cache
      ResponseUtil.send(
        res,
        200,
        "Subscriptions fetched",
        enrichedSubscriptions,
      );
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      ResponseUtil.error(res, 500, "Failed to fetch subscriptions", error);
    }
  }

  static async deleteSubscription(req, res) {
    try {
      const { subscriptionId } = req.params;
      if (!subscriptionId)
        return ResponseUtil.error(res, 400, "Subscription ID is required");

      await SubscriptionModel.collection.doc(subscriptionId).delete();

      cache.delete("admin_dashboard_stats");
      cache.delete("admin_all_subscriptions");
      cache.delete("admin_today_deliveries");

      ResponseUtil.send(res, 200, "Subscription deleted successfully", {
        subscriptionId,
      });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      ResponseUtil.error(res, 500, "Failed to delete subscription", error);
    }
  }

  static async getTodayDeliveries(req, res) {
    try {
      const cachedDeliveries = cache.get("admin_today_deliveries");
      if (cachedDeliveries) {
        return ResponseUtil.send(
          res,
          200,
          "Today's deliveries fetched (cached)",
          cachedDeliveries,
        );
      }

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" })
        .format(now)
        .toLowerCase();

      const subscriptionsSnapshot = await db
        .collection("subscriptions")
        .where("status", "==", "Active")
        .get();
      const deliveries = [];

      for (const doc of subscriptionsSnapshot.docs) {
        const sub = doc.data();
        if (sub.skippedDates && sub.skippedDates.includes(todayStr)) continue;

        const userDoc = await db.collection("users").doc(sub.userId).get();
        const userData = userDoc.exists
          ? userDoc.data()
          : { name: "Unknown User" };

        let customerName = userData.name || userData.displayName;
        if (!customerName && userData.email) {
          customerName = userData.email.split("@")[0];
          customerName =
            customerName.charAt(0).toUpperCase() + customerName.slice(1);
        }
        customerName = customerName || "Customer";

        const CustomizationModel = require("../models/customization.model");
        const customization = await CustomizationModel.getBySubscription(
          sub.subscriptionId,
        );
        const todayPreference = customization?.preferences
          ? customization.preferences[dayName]
          : null;

        const orderSnapshot = await db
          .collection("orders")
          .where("userId", "==", sub.userId)
          .where("deliveryDate", "==", todayStr)
          .where("generatedByScheduler", "==", true)
          .limit(1)
          .get();

        const todayOrder = !orderSnapshot.empty
          ? orderSnapshot.docs[0].data()
          : null;
        const orderId = !orderSnapshot.empty ? orderSnapshot.docs[0].id : null;

        deliveries.push({
          subscriptionId: sub.subscriptionId,
          orderId,
          userId: sub.userId,
          customerName,
          email: userData.email,
          phone: userData.phone || "N/A",
          address:
            sub.deliveryAddress || userData.address || "No address provided",
          plan: sub.plan,
          mealPreference: sub.preferences?.defaultMeal || "Veg",
          todayCustomization: todayPreference,
          deliveryStatus: todayOrder ? todayOrder.status : "Pending",
          day: dayName,
        });
      }

      const result = { deliveries, date: todayStr, day: dayName };
      cache.set("admin_today_deliveries", result, 60); // 1 min cache
      ResponseUtil.send(res, 200, "Today's deliveries fetched", result);
    } catch (error) {
      console.error("Error fetching today's deliveries:", error);
      ResponseUtil.error(res, 500, "Failed to fetch today's deliveries", error);
    }
  }

  static async getSubscriptionDetails(req, res) {
    try {
      const { subscriptionId } = req.params;
      const subDoc = await db
        .collection("subscriptions")
        .doc(subscriptionId)
        .get();
      if (!subDoc.exists)
        return ResponseUtil.error(res, 404, "Subscription not found");

      const sub = subDoc.data();
      const userDoc = await db.collection("users").doc(sub.userId).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      let customerName = userData.name || userData.displayName;
      if (!customerName && userData.email) {
        customerName = userData.email.split("@")[0];
        customerName =
          customerName.charAt(0).toUpperCase() + customerName.slice(1);
      }

      const CustomizationModel = require("../models/customization.model");
      const customization =
        await CustomizationModel.getBySubscription(subscriptionId);

      const combinedData = {
        ...sub,
        customerName: customerName || "Customer",
        userName: customerName || "Customer",
        userEmail: userData.email || "",
        phone: userData.phone || "N/A",
        customization: customization || null,
      };

      ResponseUtil.send(res, 200, "Subscription details fetched", combinedData);
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      ResponseUtil.error(res, 500, "Failed to fetch details", error);
    }
  }

  static async updateDeliveryStatus(req, res) {
    try {
      const { orderId, status } = req.body;
      if (!orderId || !status)
        return ResponseUtil.error(res, 400, "OrderId and status are required");

      await db.collection("orders").doc(orderId).update({
        status,
        updatedAt: new Date().toISOString(),
      });

      cache.delete("admin_dashboard_stats");
      cache.delete("admin_today_deliveries");

      ResponseUtil.send(res, 200, "Delivery status updated", {
        orderId,
        status,
      });
    } catch (error) {
      console.error("Error updating delivery status:", error);
      ResponseUtil.error(res, 500, "Failed to update delivery status", error);
    }
  }

  static async triggerScheduler(req, res) {
    try {
      const SchedulerService = require("../services/scheduler.service");
      await SchedulerService.generateDailyOrders();

      cache.delete("admin_dashboard_stats");
      cache.delete("admin_today_deliveries");

      ResponseUtil.send(res, 200, "Daily orders generated successfully");
    } catch (error) {
      console.error("Error triggering scheduler:", error);
      ResponseUtil.error(res, 500, "Failed to trigger scheduler", error);
    }
  }
}

module.exports = AdminController;
