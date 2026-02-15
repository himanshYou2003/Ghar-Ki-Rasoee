const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Protect all auth routes
router.use(verifyToken);

router.post("/sync", AuthController.syncUser);
router.post("/save-address", AuthController.saveAddress);
router.get("/profile", AuthController.getProfile);

// Auth routes protected by verifyToken
router.get("/profile", AuthController.getProfile);

module.exports = router;
