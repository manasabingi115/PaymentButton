import { describe, expect, it } from 'vitest';
import { formatPaymentAmount } from './formatPaymentAmount';

describe('formatPaymentAmount', () => {
  it('formats a major-unit amount with the requested currency and locale', () => {
    expect(formatPaymentAmount(12.5, 'USD', 'en-US')).toBe('$12.50');
    expect(formatPaymentAmount(1200, 'JPY', 'ja-JP')).toBe('￥1,200');
  });

  it('accepts a lowercase currency code', () => {
    expect(formatPaymentAmount(8, 'eur', 'en-IE')).toBe('€8.00');
  });

  it('rejects amounts that cannot be charged', () => {
    expect(() => formatPaymentAmount(Number.NaN, 'USD')).toThrow(TypeError);
    expect(() => formatPaymentAmount(Number.POSITIVE_INFINITY, 'USD')).toThrow(
      TypeError,
    );
    expect(() => formatPaymentAmount(-0.01, 'USD')).toThrow(RangeError);
  });

  it('rejects currency codes that are not 3 letters', () => {
    expect(() => formatPaymentAmount(10, 'US')).toThrow(/ISO 4217/);
    expect(() => formatPaymentAmount(10, 'US1')).toThrow(/ISO 4217/);
    expect(() => formatPaymentAmount(10, '')).toThrow(/ISO 4217/);
  });
});
