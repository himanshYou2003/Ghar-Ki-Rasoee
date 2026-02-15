const admin = require("../src/config/firebase.config");

async function testFirestore() {
  console.log("Testing Firestore Connection...");
  try {
    const db = admin.firestore();
    const testDoc = db.collection("test").doc("connection-check");
    await testDoc.set({
      connected: true,
      timestamp: new Date().toISOString(),
    });
    console.log("✅ Successfully wrote to Firestore!");

    const doc = await testDoc.get();
    console.log("✅ Successfully read from Firestore:", doc.data());
  } catch (error) {
    console.error("❌ Firestore Error:", error);
  }
}

testFirestore();
