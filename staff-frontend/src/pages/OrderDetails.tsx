import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface OrderDetails {
  Order_ID: number;
  Order_Date: string;
  Total_Amount: number;
  Payment_Method: string;
  Status: string;
  employee_name: string;
  customer_first_name?: string;
  customer_last_name?: string;
  products: Array<{
    Product_ID: number;
    Product_Name: string;
    Price: number;
    Quantity: number;
    Image_URL?: string;
    item_total: number;
  }>;
  payments: Array<{
    Payment_ID: number;
    Amount: number;
    Payment_Method: string;
    Payment_Date: string;
  }>;
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (err) {
        setError('Failed to load order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="not-found">Order not found</div>;

  return (
    <div className="order-details">
      <button 
        onClick={() => navigate(-1)}
        className="back-button"
      >
        ← Back to Orders
      </button>

      <div className="order-header">
        <h1>Order #{order.Order_ID}</h1>
        <div className="order-meta">
          <span className="order-date">{formatDate(order.Order_Date)}</span>
          <span className={`order-status ${order.Status}`}>{order.Status}</span>
        </div>
      </div>

      <div className="order-sections">
        <div className="order-section">
          <h2>Customer</h2>
          <p>
            {order.customer_first_name 
              ? `${order.customer_first_name} ${order.customer_last_name}`
              : 'Walk-in Customer'
            }
          </p>
        </div>

        <div className="order-section">
          <h2>Employee</h2>
          <p>{order.employee_name}</p>
        </div>

        <div className="order-section">
          <h2>Payment</h2>
          <p className={`payment-method ${order.Payment_Method}`}>
            {order.Payment_Method.toUpperCase()}
          </p>
          <p>Total: ${order.Total_Amount.toFixed(2)}</p>
        </div>
      </div>

      <div className="order-items">
        <h2>Items ({order.products.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.products.map(item => (
              <tr key={item.Product_ID}>
                <td className="product-info">
                  {item.Image_URL && (
                    <img 
                      src={`${process.env.REACT_APP_API_URL}${item.Image_URL}`} 
                      alt={item.Product_Name}
                      className="product-image"
                    />
                  )}
                  <span>{item.Product_Name}</span>
                </td>
                <td>${item.Price.toFixed(2)}</td>
                <td>{item.Quantity}</td>
                <td>${item.item_total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="total-label">Total</td>
              <td className="total-amount">${order.Total_Amount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default OrderDetails;