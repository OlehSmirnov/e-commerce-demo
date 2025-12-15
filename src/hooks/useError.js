import { useState, useCallback } from "react";
import { logError } from "../services/errorService";

/**
 * Custom hook for error handling and display
 * Provides error state, toast display, and error clearing
 */
export const useError = () => {
  const [error, setError] = useState(null);

  const showError = useCallback((errorOrMessage, code = "ERROR") => {
    if (typeof errorOrMessage === "string") {
      setError({
        message: errorOrMessage,
        code,
        timestamp: new Date().toISOString()
      });
    } else {
      logError(errorOrMessage, "useError");
      setError({
        message: errorOrMessage.message,
        code: errorOrMessage.code || code,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    showError,
    clearError,
    hasError: !!error
  };
};
