/**
 * Standardized error class for API responses
 */
export class ApiError extends Error {
  constructor(statusCode, message, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Format error response for client
 */
export const formatErrorResponse = (error) => {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        timestamp: error.timestamp
      }
    };
  }

  // Handle Stripe errors
  if (error.type === "StripeInvalidRequestError") {
    return {
      success: false,
      error: {
        code: "STRIPE_ERROR",
        message: error.message,
        statusCode: 400,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Handle PayPal errors
  if (error.name === "PayPalHttpClientError") {
    return {
      success: false,
      error: {
        code: "PAYPAL_ERROR",
        message: error.message,
        statusCode: 400,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Generic error fallback
  return {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    }
  };
};
