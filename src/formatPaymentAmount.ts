const ISO_CURRENCY_CODE = /^[A-Za-z]{3}$/;

/**
 * Formats a payment amount for display.
 *
 * `amount` is in major currency units (for example, `12.5` is twelve dollars
 * and fifty cents when `currency` is `USD`).
 */
export function formatPaymentAmount(
  amount: number,
  currency: string,
  locale?: string,
): string {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new TypeError('Payment amount must be a finite number.');
  }

  if (amount < 0) {
    throw new RangeError(
      'Payment amount must be greater than or equal to zero.',
    );
  }

  if (typeof currency !== 'string' || !ISO_CURRENCY_CODE.test(currency)) {
    throw new RangeError(
      `Payment currency must be a 3-letter ISO 4217 code. Received "${String(currency)}".`,
    );
  }

  const normalizedCurrency = currency.toUpperCase();

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: normalizedCurrency,
    }).format(amount);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new RangeError(
      `Unable to format ${normalizedCurrency} payment amount: ${message}`,
    );
  }
}
