const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/admin.controller");
const AuthMiddleware = require("../middlewares/auth.middleware");

// All routes here should be protected by verifyToken AND verifyAdmin
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.verifyAdmin);

router.get("/stats", AdminController.getDashboardStats);
router.get("/subscriptions", AdminController.getAllSubscriptions);
router.get(
  "/subscriptions/:subscriptionId",
  AdminController.getSubscriptionDetails,
);
router.get("/deliveries/today", AdminController.getTodayDeliveries);
router.post("/deliveries/trigger-scheduler", AdminController.triggerScheduler);
router.patch("/deliveries/status", AdminController.updateDeliveryStatus);
router.delete(
  "/subscriptions/:subscriptionId",
  AdminController.deleteSubscription,
);

module.exports = router;
