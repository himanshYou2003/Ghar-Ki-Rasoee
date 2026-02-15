const ResponseUtil = require("../utils/response.util");

// Test card numbers
const TEST_CARDS = {
  VISA_SUCCESS: "4111111111111111",
  MASTERCARD_SUCCESS: "5555555555554444",
  AMEX_SUCCESS: "378282246310005",
  CARD_DECLINED: "4000000000000002",
};

// Test UPI IDs
const TEST_UPI_IDS = {
  SUCCESS: "test@paytm",
  GPAY: "success@gpay",
  PHONEPE: "test@phonepe",
  DECLINED: "fail@paytm",
};

class PaymentController {
  /**
   * Process payment in test mode
   */
  static async processPayment(req, res) {
    try {
      const { uid } = req.user;
      const { paymentMethod, amount, paymentData } = req.body;

      console.log("Processing test payment:", {
        uid,
        paymentMethod,
        amount,
      });

      // Validate amount
      if (!amount || amount <= 0) {
        return ResponseUtil.error(res, 400, "Invalid amount");
      }

      let paymentResult = {
        success: false,
        transactionId: null,
        message: "",
      };

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      switch (paymentMethod) {
        case "card":
          paymentResult =
            await PaymentController.processCardPayment(paymentData);
          break;

        case "upi":
          paymentResult =
            await PaymentController.processUPIPayment(paymentData);
          break;

        case "wallet":
          paymentResult =
            await PaymentController.processWalletPayment(paymentData);
          break;

        default:
          return ResponseUtil.error(res, 400, "Invalid payment method");
      }

      if (paymentResult.success) {
        ResponseUtil.send(res, 200, "Payment processed successfully", {
          transactionId: paymentResult.transactionId,
          amount,
          paymentMethod,
          status: "success",
          testMode: true,
          message: paymentResult.message,
        });
      } else {
        ResponseUtil.send(res, 200, "Payment failed", {
          status: "failed",
          testMode: true,
          message: paymentResult.message,
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      ResponseUtil.error(res, 500, "Failed to process payment", error);
    }
  }

  /**
   * Process card payment (test mode)
   */
  static async processCardPayment(cardData) {
    const { cardNumber, cardholderName, expiryDate, cvv } = cardData;

    // Check if it's a decline test card
    if (cardNumber === TEST_CARDS.CARD_DECLINED) {
      return {
        success: false,
        transactionId: null,
        message: "Card declined - Insufficient funds (Test Mode)",
      };
    }

    // Check if it's a valid test card
    const isTestCard = Object.values(TEST_CARDS).includes(cardNumber);

    if (!isTestCard) {
      return {
        success: false,
        transactionId: null,
        message: "Invalid test card number",
      };
    }

    // Simulate successful payment
    return {
      success: true,
      transactionId: `TEST_TXN_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      message: `Payment successful using test card ending in ${cardNumber.slice(
        -4,
      )}`,
    };
  }

  /**
   * Process UPI payment (test mode)
   */
  static async processUPIPayment(upiData) {
    const { upiId } = upiData;

    // Check if it's a decline test UPI
    if (upiId.toLowerCase() === TEST_UPI_IDS.DECLINED) {
      return {
        success: false,
        transactionId: null,
        message: "UPI payment declined (Test Mode)",
      };
    }

    // Check if it's a valid test UPI
    const isTestUPI = Object.values(TEST_UPI_IDS)
      .map((id) => id.toLowerCase())
      .includes(upiId.toLowerCase());

    if (!isTestUPI) {
      return {
        success: false,
        transactionId: null,
        message: "Invalid test UPI ID",
      };
    }

    // Simulate successful payment
    return {
      success: true,
      transactionId: `TEST_UPI_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      message: `UPI payment successful from ${upiId}`,
    };
  }

  /**
   * Process digital wallet payment (test mode)
   */
  static async processWalletPayment(walletData) {
    const { walletType } = walletData;

    // Always succeed for wallet payments in test mode
    return {
      success: true,
      transactionId: `TEST_WALLET_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      message: `${walletType} payment successful (Test Mode)`,
    };
  }

  /**
   * Validate card details
   */
  static async validateCard(req, res) {
    try {
      const { cardNumber } = req.body;

      if (!cardNumber) {
        return ResponseUtil.error(res, 400, "Card number is required");
      }

      // Simple Luhn algorithm check
      const isValid = PaymentController.luhnCheck(cardNumber);

      ResponseUtil.send(res, 200, "Card validation complete", {
        valid: isValid,
        testMode: true,
      });
    } catch (error) {
      console.error("Error validating card:", error);
      ResponseUtil.error(res, 500, "Failed to validate card", error);
    }
  }

  /**
   * Validate UPI ID
   */
  static async validateUPI(req, res) {
    try {
      const { upiId } = req.body;

      if (!upiId) {
        return ResponseUtil.error(res, 400, "UPI ID is required");
      }

      // Basic UPI format validation
      const upiRegex = /^[\w\.-]+@[a-zA-Z]{2,}$/;
      const isValid = upiRegex.test(upiId);

      ResponseUtil.send(res, 200, "UPI validation complete", {
        valid: isValid,
        testMode: true,
      });
    } catch (error) {
      console.error("Error validating UPI:", error);
      ResponseUtil.error(res, 500, "Failed to validate UPI", error);
    }
  }

  /**
   * Luhn algorithm for card validation
   */
  static luhnCheck(cardNumber) {
    const digits = cardNumber.replace(/\s/g, "");

    if (!/^\d{13,19}$/.test(digits)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Existing webhook handler
  static async handleWebhook(req, res) {
    const signature = req.headers["stripe-signature"];
    ResponseUtil.send(res, 200, { received: true });
  }
}

module.exports = PaymentController;
