import { useEffect } from "react";

/**
 * Custom hook to log payment provider performance metrics
 * Retrieves timing data from sessionStorage and logs duration
 */
export const usePaymentPerformanceLogging = (methods) => {
  useEffect(() => {
    if (!methods) return;

    const t1 = performance.now();
    const t0 = sessionStorage.getItem("provider_switch_t0");
    const provider = sessionStorage.getItem("provider_switch_name");

    if (t0 && provider) {
      const duration = t1 - Number(t0);

      console.log(
        `[SWITCH PERFORMANCE] ${provider}: ${duration.toFixed(2)} ms`
      );

      sessionStorage.removeItem("provider_switch_t0");
      sessionStorage.removeItem("provider_switch_name");
    }
  }, [methods]);
};
