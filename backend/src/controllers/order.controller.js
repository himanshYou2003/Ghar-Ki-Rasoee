const OrderModel = require("../models/order.model");
const PriceUtil = require("../utils/price.util");
const ResponseUtil = require("../utils/response.util");

class OrderController {
  static async createOrder(req, res) {
    try {
      const { uid } = req.user;
      const { orderType, plan, items, deliveryDate } = req.body;

      // Basic validation
      if (!orderType || !deliveryDate) {
        return ResponseUtil.error(
          res,
          400,
          "Order type and delivery date are required",
        );
      }

      // Calculate Price
      const price = PriceUtil.calculateTotal(orderType, plan, items);

      // Handle Subscription Creation
      if (orderType === "Subscription" && plan) {
        const SubscriptionModel = require("../models/subscription.model");
        // If it's a subscription, we create a subscription record INSTEAD of just a single order?
        // OR we create a "Payment Order" to record the transaction, AND a subscription.
        // Let's do both: Create Order (for payment record) + Create Subscription

        await SubscriptionModel.createSubscription(uid, plan);
      }

      // Fetch User details for address and name
      const db = admin.firestore();
      const userDoc = await db.collection("users").doc(uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      const orderData = {
        userId: uid,
        customerName:
          userData.displayName || userData.email || "Unknown Customer",
        deliveryAddress:
          req.body.deliveryAddress || userData.address || "No Address Provided",
        orderType,
        plan: plan || null,
        items: items || {},
        price,
        deliveryDate,
        paymentMethod: req.body.paymentMethod || "Online",
        paymentStatus:
          req.body.paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
      };

      const newOrder = await OrderModel.createOrder(orderData);

      // Also update user profile with this address for future reference
      await db
        .collection("users")
        .doc(uid)
        .update({
          address: orderData.deliveryAddress,
          updatedAt: new Date().toISOString(),
        })
        .catch((err) =>
          console.error("Error updating user address during order:", err),
        );

      // Log activity
      const ActivityModel = require("../models/activity.model");
      await ActivityModel.logActivity(uid, {
        type: "order",
        action: "placed",
        description: `Placed ${orderType} order${plan ? ` (${plan.name || plan})` : ""}`,
        metadata: {
          orderId: newOrder.orderId,
          orderType,
          plan: plan?.name || plan,
          totalItems: items ? Object.keys(items).length : 0,
        },
      });

      ResponseUtil.send(res, 201, "Order created successfully", newOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      ResponseUtil.error(res, 500, "Failed to create order", error);
    }
  }

  static async getMyOrders(req, res) {
    try {
      const { uid } = req.user;
      const orders = await OrderModel.getUserOrders(uid);
      ResponseUtil.send(res, 200, "Orders fetched successfully", orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      ResponseUtil.error(res, 500, "Failed to fetch orders", error);
    }
  }

  static async getAllOrders(req, res) {
    try {
      // Admin check is done in middleware
      const orders = await OrderModel.getAllOrders();
      ResponseUtil.send(res, 200, "All orders fetched successfully", orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      ResponseUtil.error(res, 500, "Failed to fetch all orders", error);
    }
  }

  static async updateStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) return ResponseUtil.error(res, 400, "Status is required");

      const validStatuses = [
        "Confirmed",
        "Cooking",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return ResponseUtil.error(res, 400, "Invalid status");
      }

      const updated = await OrderModel.updateStatus(orderId, status);
      ResponseUtil.send(res, 200, "Order status updated", updated);
    } catch (error) {
      console.error("Error updating order status:", error);
      ResponseUtil.error(res, 500, "Failed to update order status", error);
    }
  }

  static async deleteOrder(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId) return ResponseUtil.error(res, 400, "Order ID is required");

      await OrderModel.collection.doc(orderId).delete();
      ResponseUtil.send(res, 200, "Order deleted successfully", { orderId });
    } catch (error) {
      console.error("Error deleting order:", error);
      ResponseUtil.error(res, 500, "Failed to delete order", error);
    }
  }
}

module.exports = OrderController;
