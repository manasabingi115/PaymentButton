import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { createRef, type ComponentProps, type FormEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PaymentButton } from './PaymentButton';

afterEach(() => {
  cleanup();
});

function renderButton(
  props: Partial<ComponentProps<typeof PaymentButton>> = {},
) {
  return render(
    <PaymentButton amount={49} currency="USD" locale="en-US" {...props} />,
  );
}

describe('PaymentButton', () => {
  it('exposes the action and the formatted amount as its accessible name', () => {
    renderButton();

    expect(
      screen.getByRole('button', { name: 'Pay $49.00' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button')).toBeEnabled();
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });

  it('uses a custom label and forwards the ref', () => {
    const ref = createRef<HTMLButtonElement>();
    renderButton({ label: 'Subscribe', ref });

    expect(
      screen.getByRole('button', { name: 'Subscribe $49.00' }),
    ).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('calls onClick for pointer and keyboard activation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderButton({ onClick });

    const button = screen.getByRole('button', { name: 'Pay $49.00' });
    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not activate when disabled and removes itself from the tab order', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <>
        <button type="button">Before</button>
        <PaymentButton
          amount={49}
          currency="USD"
          locale="en-US"
          disabled
          onClick={onClick}
        />
      </>,
    );

    const button = screen.getByRole('button', { name: 'Pay $49.00' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');

    await user.click(button);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    await user.tab();
    expect(button).not.toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('blocks a second charge while loading and announces the status', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = renderButton({ onClick });

    rerender(
      <PaymentButton
        amount={49}
        currency="USD"
        locale="en-US"
        loading
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button', { name: 'Pay $49.00' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeEnabled();
    expect(button).toHaveAccessibleDescription('Processing payment');
    expect(screen.getByRole('status')).toHaveTextContent('Processing payment');
    expect(button.querySelector('[aria-hidden="true"]')).toBeInTheDocument();

    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(button).toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('uses a custom loading announcement', () => {
    renderButton({ loading: true, loadingLabel: 'Contacting your bank' });

    expect(screen.getByRole('button')).toHaveAccessibleDescription(
      'Contacting your bank',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Contacting your bank',
    );
  });

  it('does not submit the surrounding form while a payment is processing', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );
    render(
      <form onSubmit={onSubmit}>
        <PaymentButton
          amount={10}
          currency="USD"
          locale="en-US"
          type="submit"
          loading
        />
      </form>,
    );

    await user.click(screen.getByRole('button', { name: 'Pay $10.00' }));
    await user.keyboard('{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the surrounding form from an idle submit button', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );
    render(
      <form onSubmit={onSubmit}>
        <PaymentButton
          amount={10}
          currency="EUR"
          locale="en-IE"
          type="submit"
          label="Pay now"
        />
      </form>,
    );

    await user.click(screen.getByRole('button', { name: 'Pay now €10.00' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('rejects an unusable amount', () => {
    expect(() => renderButton({ amount: -5 })).toThrow(RangeError);
  });

  it('has no accessibility violations when idle, loading, or disabled', async () => {
    const cases = [
      { loading: false, disabled: false },
      { loading: true, disabled: false },
      { loading: false, disabled: true },
    ];

    for (const state of cases) {
      const { container, unmount } = renderButton(state);
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });
});
