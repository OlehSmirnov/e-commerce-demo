/**
 * Unified payment handler for all providers
 * Handles WayForPay widget, Stripe, PayPal, Fondy, Coinbase, etc.
 */
import { parseApiError, logError, getErrorMessage } from "./errorService";

export const handlePayment = async (provider, cartItems, apiUrl, setLoading, onError = null) => {
  if (provider === 'wayforpay') {
    setLoading((prev) => ({ ...prev, wayforpay: true }));
    try {
      const resp = await fetch(`${apiUrl}/pay/wayforpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        const error = parseApiError(errorData);
        logError(error, `WayForPay HTTP ${resp.status}`);
        throw error;
      }

      const response = await resp.json();
      const params = response.data || response;

      // Load WayForPay widget script if not loaded
      if (!window.Wayforpay) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://secure.wayforpay.com/server/pay-widget.js';
          s.onload = resolve;
          s.onerror = () => reject(new Error('Failed to load WayForPay widget'));
          document.head.appendChild(s);
        });
      }

      const wayforpay = new window.Wayforpay();
      wayforpay.run(
        params,
        function onApproved(response) {
          const ref = params.orderReference;
          window.location.href = window.location.origin + '/success' + (ref ? `?orderReference=${encodeURIComponent(ref)}` : '');
        },
        function onDeclined(response) {
          const error = new Error('Оплата відхилена');
          if (onError) onError(error);
          else alert('Оплата відхилена');
        },
        function onPending(response) {
          const error = new Error('Оплата в обробці');
          if (onError) onError(error);
          else alert('Оплата в обробці');
        }
      );
    } catch (err) {
      logError(err, `WayForPay payment`);
      const message = getErrorMessage(err);
      if (onError) onError(err);
      else alert(message);
    } finally {
      setLoading((prev) => ({ ...prev, wayforpay: false }));
    }
    return;
  }

  // Stripe, PayPal, Coinbase, Fondy, etc. — redirect payment handler
  setLoading((prev) => ({ ...prev, [provider]: true }));

  try {
    const res = await fetch(`${apiUrl}/pay/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = parseApiError(errorData);
      logError(error, `${provider} HTTP ${res.status}`);
      throw error;
    }

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else if (!data.success) {
      throw new Error(`${provider} returned no payment URL`);
    }
  } catch (err) {
    logError(err, `${provider} payment`);
    const message = getErrorMessage(err);
    if (onError) onError(err);
    else alert(message);
  } finally {
    setLoading((prev) => ({ ...prev, [provider]: false }));
  }
};
