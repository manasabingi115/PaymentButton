import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PaymentButton } from './PaymentButton';
import './demo.css';

function Demo() {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const pay = () => {
    setLoading(true);
    setPaid(false);
    window.setTimeout(() => {
      setLoading(false);
      setPaid(true);
    }, 1200);
  };

  return (
    <main className="demo">
      <h1>PaymentButton</h1>
      <section>
        <h2>Ready</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            pay();
          }}
        >
          <PaymentButton
            amount={49}
            currency="USD"
            locale="en-US"
            type="submit"
            loading={loading}
          />
        </form>
        <p role="status">
          {paid ? 'Payment sent.' : 'Ready to charge $49.00.'}
        </p>
      </section>
      <section>
        <h2>Loading</h2>
        <PaymentButton amount={49} currency="USD" locale="en-US" loading />
      </section>
      <section>
        <h2>Disabled</h2>
        <PaymentButton amount={49} currency="USD" locale="en-US" disabled />
      </section>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('Demo root was not found.');
}

createRoot(root).render(<Demo />);
