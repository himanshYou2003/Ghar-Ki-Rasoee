const UserModel = require("../models/user.model");
const ResponseUtil = require("../utils/response.util");

class AuthController {
  static async syncUser(req, res) {
    try {
      const { uid, email, name, picture } = req.user; // From auth middleware
      const { phone, address, area } = req.body; // Additional details

      const userData = {
        name,
        email,
        picture,
        ...(phone && { phone }),
        ...(address && { address }),
        ...(area && { area }),
        role: email === "admin@gmail.com" ? "admin" : "customer",
        lastLoginAt: new Date().toISOString(),
      };

      // If it's a new user, createdAt might be needed, but merge: true handles updates well.
      // Ideally we check if exists to set createdAt, but for sync idempotent is good.

      const user = await UserModel.createOrUpdateUser(uid, userData);

      ResponseUtil.send(res, 200, "User synced successfully", user);
    } catch (error) {
      console.error("Error syncing user:", error);
      ResponseUtil.error(res, 500, "Failed to sync user", error);
    }
  }

  static async getProfile(req, res) {
    try {
      const { uid } = req.user;
      const user = await UserModel.getUser(uid);

      if (!user) {
        return ResponseUtil.error(res, 404, "User not found");
      }

      // Fetch active subscription
      const SubscriptionModel = require("../models/subscription.model");
      const subscription = await SubscriptionModel.getUserSubscription(uid);

      ResponseUtil.send(res, 200, "User profile fetched", {
        ...user,
        subscription,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      ResponseUtil.error(res, 500, "Failed to fetch profile", error);
    }
  }

  static async saveAddress(req, res) {
    try {
      const { uid } = req.user;
      const { address } = req.body;

      if (!address) {
        return ResponseUtil.error(res, 400, "Address is required");
      }

      const user = await UserModel.addSavedAddress(uid, address);
      ResponseUtil.send(res, 200, "Address saved successfully", user);
    } catch (error) {
      console.error("Error saving address:", error);
      ResponseUtil.error(res, 500, "Failed to save address", error);
    }
  }
}

module.exports = AuthController;
