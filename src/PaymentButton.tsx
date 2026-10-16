import {
  forwardRef,
  useId,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from 'react';
import { formatPaymentAmount } from './formatPaymentAmount';
import styles from './PaymentButton.module.css';

export const DEFAULT_PAYMENT_LABEL = 'Pay';
export const DEFAULT_LOADING_LABEL = 'Processing payment';

export type PaymentButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'children'
  | 'aria-busy'
  | 'aria-disabled'
  | 'aria-describedby'
  | 'aria-label'
  | 'aria-labelledby'
> & {
  /**
   * Charge amount in major currency units. `12.5` with `currency="USD"` is
   * shown as $12.50.
   */
  amount: number;
  /** ISO 4217 currency code, for example `"USD"` or `"EUR"`. */
  currency: string;
  /** BCP 47 locale used to format `amount`. Defaults to the runtime locale. */
  locale?: string;
  /** Action text shown before the amount. Defaults to `"Pay"`. */
  label?: string;
  /** Shows a progress indicator and blocks a second submission. */
  loading?: boolean;
  /** Text announced while `loading` is true. Defaults to `"Processing payment"`. */
  loadingLabel?: string;
};

function joinClasses(
  ...classes: Array<string | false | undefined>
): string | undefined {
  const value = classes.filter(Boolean).join(' ');
  return value.length > 0 ? value : undefined;
}

function visibleText(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/**
 * Payment action button that always exposes the amount, and that stays
 * understandable while a charge is in progress.
 *
 * Loading keeps the button focusable (`aria-disabled` + `aria-busy`) so
 * assistive technology can report the in-progress charge. `disabled` uses the
 * native disabled state and removes the button from the tab order.
 */
export const PaymentButton = forwardRef<HTMLButtonElement, PaymentButtonProps>(
  function PaymentButton(
    {
      amount,
      currency,
      locale,
      label,
      loading = false,
      loadingLabel,
      disabled = false,
      className,
      type = 'button',
      onClick,
      ...rest
    },
    ref,
  ) {
    const statusId = useId();
    const isDisabled = Boolean(disabled);
    const isLoading = Boolean(loading);
    const isInactive = isDisabled || isLoading;
    const actionLabel = visibleText(label, DEFAULT_PAYMENT_LABEL);
    const statusLabel = visibleText(loadingLabel, DEFAULT_LOADING_LABEL);
    const formattedAmount = formatPaymentAmount(amount, currency, locale);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (isInactive) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };

    return (
      <>
        <button
          {...rest}
          ref={ref}
          type={type}
          className={joinClasses(styles.root, className)}
          disabled={isDisabled || undefined}
          aria-disabled={isInactive ? true : undefined}
          aria-busy={isLoading ? true : undefined}
          aria-describedby={isLoading ? statusId : undefined}
          data-loading={isLoading ? '' : undefined}
          data-disabled={isDisabled ? '' : undefined}
          onClick={handleClick}
        >
          <span className={styles.content}>
            {isLoading ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : null}
            <span className={styles.label}>{actionLabel} </span>
            <span className={styles.amount}>{formattedAmount}</span>
          </span>
        </button>
        <span id={statusId} role="status" className={styles.srOnly}>
          {isLoading ? statusLabel : ''}
        </span>
      </>
    );
  },
);
