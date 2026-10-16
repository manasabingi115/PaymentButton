# PaymentButton

Typed React button for a payment action. It always shows the charge amount, and it stays usable with a keyboard and assistive technology while a charge is in progress.

## Scripts

```bash
npm install
npm test
npm run typecheck
npm run dev
```

`npm run dev` opens a small preview with ready, loading, and disabled examples.

## Usage

```tsx
import { useState } from 'react';
import { PaymentButton } from './src';

export function Checkout() {
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    setLoading(true);
    try {
      await chargeCustomer();
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentButton
      amount={49}
      currency="USD"
      locale="en-US"
      loading={loading}
      onClick={pay}
    />
  );
}
```

`amount` is in major currency units. `49` with `currency="USD"` is shown as **Pay $49.00**. The button's accessible name is that same text.

Pass `type="submit"` when the button should submit a form. The default type is `button`.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `amount` | `number` | — | Charge amount in major units. Must be finite and `>= 0`. |
| `currency` | `string` | — | Three-letter ISO 4217 code, such as `"USD"` or `"EUR"`. |
| `locale` | `string` | Runtime locale | BCP 47 locale used to format the amount. |
| `label` | `string` | `"Pay"` | Action text shown before the amount. |
| `loading` | `boolean` | `false` | Shows a spinner and blocks another activation. |
| `loadingLabel` | `string` | `"Processing payment"` | Text announced while `loading` is true. |
| `disabled` | `boolean` | `false` | Native disabled state. Removes the button from the tab order. |

Other button attributes are forwarded, including `onClick`, `className`, `type`, `name`, and `form`. `children`, `aria-label`, and `aria-labelledby` are omitted so the amount stays in the accessible name. A `ref` is forwarded to the underlying `<button>`.

## Behavior

- **Loading.** The button stays focusable. It sets `aria-busy="true"` and `aria-disabled="true"`, shows a spinner, and exposes `loadingLabel` through a polite status announcement. Clicks, Enter, Space, and form submission are ignored.
- **Disabled.** The button uses the native `disabled` attribute and `aria-disabled="true"`.
- **Invalid amount or currency.** Rendering throws a `TypeError` or `RangeError` for a non-finite amount, a negative amount, or a currency code that is not three letters.

`formatPaymentAmount(amount, currency, locale)` is exported for the same formatting rules outside the button.
