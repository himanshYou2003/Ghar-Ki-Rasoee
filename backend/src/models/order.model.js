const admin = require("../config/firebase.config");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

class OrderModel {
  static collection = db.collection("orders");

  static async createOrder(orderData) {
    const orderId = uuidv4();
    const newOrder = {
      orderId,
      ...orderData,
      paymentMethod: orderData.paymentMethod || "Online", // Default to Online if not provided
      status: "Confirmed", // Default status
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.collection.doc(orderId).set(newOrder);
    return newOrder;
  }

  static async getUserOrders(userId) {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => doc.data());
  }

  static async getAllOrders() {
    const snapshot = await this.collection.orderBy("createdAt", "desc").get();
    const orders = snapshot.docs.map((doc) => ({
      orderId: doc.id,
      ...doc.data(),
    }));

    // Fetch users AND active subscriptions to fill in missing names/addresses for legacy orders
    const userIds = [
      ...new Set(orders.map((o) => o.userId).filter((id) => id)),
    ];
    const [userDocs, subscriptionDocs] = await Promise.all([
      Promise.all(userIds.map((id) => db.collection("users").doc(id).get())),
      Promise.all(
        userIds.map((id) =>
          db
            .collection("subscriptions")
            .where("userId", "==", id)
            .where("status", "==", "Active")
            .limit(1)
            .get(),
        ),
      ),
    ]);

    const userMap = {};
    userDocs.forEach((doc) => {
      if (doc.exists) userMap[doc.id] = doc.data();
    });

    const subAddressMap = {};
    subscriptionDocs.forEach((snapshot, index) => {
      if (!snapshot.empty) {
        subAddressMap[userIds[index]] = snapshot.docs[0].data().deliveryAddress;
      }
    });

    return orders.map((order) => {
      const user = userMap[order.userId] || {};
      const subAddress = subAddressMap[order.userId];
      return {
        ...order,
        customerName:
          order.customerName ||
          user.displayName ||
          user.email ||
          "Unknown Customer",
        deliveryAddress:
          order.deliveryAddress ||
          user.address ||
          subAddress ||
          "No Address Provided",
      };
    });
  }

  static async getOrderById(orderId) {
    const doc = await this.collection.doc(orderId).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  static async updateStatus(orderId, status) {
    await this.collection.doc(orderId).update({
      status,
      updatedAt: new Date().toISOString(),
    });
    return { orderId, status };
  }

  static async updatePaymentStatus(orderId, paymentStatus) {
    await this.collection.doc(orderId).update({
      paymentStatus,
      updatedAt: new Date().toISOString(),
    });
    return { orderId, paymentStatus };
  }
}

module.exports = OrderModel;
