import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Order } from '../types/types';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'today'>('today');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let response;
        
        if (filter === 'today') {
          const today = new Date().toISOString().split('T')[0];
          response = await api.get(`/orders?date=${today}`);
        } else {
          response = await api.get('/orders');
        }
        
        setOrders(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load orders');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Order History</h1>
        <div className="order-filters">
          <button
            className={filter === 'today' ? 'active' : ''}
            onClick={() => setFilter('today')}
          >
            Today's Orders
          </button>
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Orders
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="no-orders">No orders found</div>
      ) : (
        <div className="orders-list">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr 
                  key={order.order_id}
                  onClick={() => navigate(`/orders/${order.order_id}`)}
                  className="order-row"
                >
                  <td>#{order.order_id}</td>
                  <td>{formatDate(order.Order_Date)}</td>
                  <td>
                    {order.customer_first_name 
                      ? `${order.customer_first_name} ${order.customer_last_name}`
                      : 'Walk-in'
                    }
                  </td>
                  <td>{order.products?.length || 0}</td>
                  <td>${order.Total_Amount?.toFixed(2)}</td>
                  <td className={`payment-method ${order.Payment_Method}`}>
                    {order.Payment_Method}
                  </td>
                  <td className={`status ${order.Status}`}>
                    {order.Status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;