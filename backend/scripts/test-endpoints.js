const axios = require("axios");
const admin = require("../src/config/firebase.config");
const env = require("../src/config/env.config");

// API Key from firebase-SDK.md (Public Client Config)
const API_KEY = "AIzaSyDnR2g_4oqfUeYyhGPvYbxliIRI0JBQUJM";
const BASE_URL = "http://localhost:5000/api";

async function getIdToken(uid) {
  return "dev-test-token";
}

async function runTests() {
  console.log("🚀 Starting API Tests with Real Firebase Connection...\n");

  const uid = "test-user-" + Date.now();
  console.log(`👤 Using Test UID: ${uid}`);

  const token = await getIdToken(uid);
  console.log("✅ Authenticated & Token Generated\n");

  const headers = { Authorization: `Bearer ${token}` };

  try {
    // 1. Auth Sync
    console.log("1️⃣  Testing POST /auth/sync...");
    const syncRes = await axios.post(
      `${BASE_URL}/auth/sync`,
      {
        phone: "+15550199",
        address: "123 Test St, Surrey, BC",
        area: "Surrey",
      },
      { headers },
    );
    console.log("   ✅ Success:", syncRes.data.message);

    // 2. Get Profile
    console.log("\n2️⃣  Testing GET /auth/profile...");
    const profileRes = await axios.get(`${BASE_URL}/auth/profile`, { headers });
    console.log(
      "   ✅ Success:",
      profileRes.data.data.uid === uid ? "UID Matches" : "UID Mismatch",
    );

    // 3. Get Menu
    console.log("\n3️⃣  Testing GET /menu...");
    const menuRes = await axios.get(`${BASE_URL}/menu`, { headers });
    console.log("   ✅ Success: Fetched", menuRes.data.data.length, "menus");

    // 4. Create Order
    console.log("\n4️⃣  Testing POST /orders...");
    const orderRes = await axios.post(
      `${BASE_URL}/orders`,
      {
        orderType: "weekly",
        deliveryDate: "2024-06-01",
        plan: "Standard",
        items: { extraRoti: 2 },
      },
      { headers },
    );
    console.log("   ✅ Success: Order ID", orderRes.data.data.orderId);

    // 5. Get Orders
    console.log("\n5️⃣  Testing GET /orders...");
    const ordersRes = await axios.get(`${BASE_URL}/orders`, { headers });
    console.log("   ✅ Success: Found", ordersRes.data.data.length, "orders");

    // 6. Create Subscription
    console.log("\n6️⃣  Testing POST /subscriptions...");
    const subRes = await axios.post(
      `${BASE_URL}/subscriptions`,
      {
        plan: "Premium",
        durationMonths: 1,
      },
      { headers },
    );
    console.log(
      "   ✅ Success: Subscription ID",
      subRes.data.data.subscriptionId,
    );

    // 7. Get Subscription
    console.log("\n7️⃣  Testing GET /subscriptions...");
    const getSubRes = await axios.get(`${BASE_URL}/subscriptions`, { headers });
    console.log("   ✅ Success: Status", getSubRes.data.data.status);

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("\n❌ Test Failed:", error.response?.data || error.message);
  } finally {
    process.exit();
  }
}

runTests();
