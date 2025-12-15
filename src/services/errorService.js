/**
 * Centralized error service for consistent error handling
 */

export class PaymentError extends Error {
  constructor(message, code = "UNKNOWN_ERROR", details = null) {
    super(message);
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Parse API error response
 */
export const parseApiError = (response) => {
  if (response?.error) {
    const { code, message, statusCode } = response.error;
    return new PaymentError(message || "Payment failed", code, { statusCode });
  }

  return new PaymentError("Unknown error occurred", "UNKNOWN_ERROR");
};

/**
 * Format error message for display
 */
export const getErrorMessage = (error) => {
  if (error instanceof PaymentError) {
    const errorMessages = {
      STRIPE_ERROR: "Stripe payment failed. Please check your card details.",
      PAYPAL_ERROR: "PayPal payment failed. Please try again.",
      WAYFORPAY_ERROR: "WayForPay payment failed. Please try again.",
      INVALID_ITEMS: "Your cart is empty. Please add items before paying.",
      INVALID_REQUEST: "Invalid payment request. Please try again.",
      CONFIG_ERROR: "Payment service is not configured. Please contact support.",
      NETWORK_ERROR: "Network error. Please check your connection.",
      UNKNOWN_ERROR: "An unexpected error occurred. Please try again."
    };

    return errorMessages[error.code] || error.message;
  }

  if (error instanceof TypeError) {
    return "Network error. Please check your connection.";
  }

  return error?.message || "An error occurred";
};

/**
 * Log error for debugging
 */
export const logError = (error, context = "") => {
  const errorInfo = {
    message: error.message,
    code: error.code || "UNKNOWN",
    timestamp: new Date().toISOString(),
    context,
    details: error.details || null
  };

  console.error(`[PaymentError] ${context}:`, errorInfo);
};
