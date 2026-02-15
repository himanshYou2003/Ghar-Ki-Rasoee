const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Process payment (test mode) - Protected
router.post(
  "/process",
  authMiddleware.verifyToken,
  PaymentController.processPayment,
);

// Validate card - Protected
router.post(
  "/validate-card",
  authMiddleware.verifyToken,
  PaymentController.validateCard,
);

// Validate UPI - Protected
router.post(
  "/validate-upi",
  authMiddleware.verifyToken,
  PaymentController.validateUPI,
);

// Webhook endpoint
// Note: Verification handled inside controller, usually requires raw body
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleWebhook,
);

module.exports = router;
