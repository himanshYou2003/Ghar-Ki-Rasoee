const stripe = require("../config/stripe.config");
const env = require("../config/env.config");

class StripeService {
  static async createCustomer(email, name) {
    try {
      const customer = await stripe.customers.create({ email, name });
      return customer;
    } catch (error) {
      console.error("Stripe createCustomer error:", error);
      throw error;
    }
  }

  static async createCheckoutSession(
    customerId,
    priceId,
    successUrl,
    cancelUrl,
  ) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      return session;
    } catch (error) {
      console.error("Stripe createCheckoutSession error:", error);
      throw error;
    }
  }

  static constructEvent(payload, signature) {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE.WEBHOOK_SECRET,
      );
    } catch (error) {
      console.error("Webhook signature verification failed.", error.message);
      throw error;
    }
  }
}

module.exports = StripeService;
