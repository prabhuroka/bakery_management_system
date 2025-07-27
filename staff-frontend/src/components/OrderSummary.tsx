import React from 'react';
import { OrderItem, Customer } from '../types/types';

interface OrderSummaryProps {
  items: OrderItem[];
  customer: Customer | null;
  notes: string;
  onRemoveItem: (productId: number) => void;
  onQuantityChange: (productId: number, quantity: number) => void;
  onNotesChange: (notes: string) => void;
  onCheckout: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  customer,
  notes,
  onRemoveItem,
  onQuantityChange,
  onNotesChange,
  onCheckout
}) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="order-summary">
      <h2>Current Order</h2>
      
      {customer && (
        <div className="customer-info">
          <h4>Customer:</h4>
          <p>{customer.First_Name} {customer.Last_Name}</p>
          {customer.Loyalty_Points > 0 && (
            <p>Loyalty Points: {customer.Loyalty_Points}</p>
          )}
        </div>
      )}

      <div className="order-items">
        {items.length === 0 ? (
          <p className="empty-message">No items in order</p>
        ) : (
          items.map(item => (
            <div key={item.product_id} className="order-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-price">${item.price.toFixed(2)}</span>
              </div>
              <div className="item-controls">
                <button 
                  onClick={() => onQuantityChange(item.product_id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => onQuantityChange(item.product_id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
                <button 
                  onClick={() => onRemoveItem(item.product_id)}
                  className="remove-btn"
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
              <div className="item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="order-total">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <div className="order-notes">
        <label htmlFor="order-notes">Order Notes:</label>
        <textarea
          id="order-notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Special instructions..."
        />
      </div>

      <button
        className="checkout-btn"
        onClick={onCheckout}
        disabled={items.length === 0}
      >
        Process Payment
      </button>
    </div>
  );
};

export default OrderSummary;