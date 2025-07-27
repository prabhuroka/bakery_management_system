import React, { useState } from 'react';

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onSubmit: (paymentMethod: 'cash' | 'credit') => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ total, onClose, onSubmit }) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [amountReceived, setAmountReceived] = useState('');

  const handleSubmit = () => {
    onSubmit(paymentMethod);
  };

  const calculateChange = () => {
    const received = parseFloat(amountReceived) || 0;
    return (received - total).toFixed(2);
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <h2>Process Payment</h2>
        <div className="payment-total">
          Total: ${total.toFixed(2)}
        </div>

        <div className="payment-methods">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
            />
            Cash
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === 'credit'}
              onChange={() => setPaymentMethod('credit')}
            />
            Credit Card
          </label>
        </div>

        {paymentMethod === 'cash' && (
          <div className="cash-payment">
            <label>
              Amount Received:
              <input
                type="number"
                min={total}
                step="0.01"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
              />
            </label>
            {amountReceived && (
              <div className="change-due">
                Change Due: ${calculateChange()}
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < total)}
            className="submit-btn"
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;