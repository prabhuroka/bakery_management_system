import React, { useState, useEffect } from 'react';
import { Button, Modal, Badge } from 'antd';
import ProductGrid from '../components/ProductGrid';
import OrderSummary from '../components/OrderSummary';
import PaymentModal from '../components/PaymentModal';
import CustomerSearch from '../components/CustomerSearch';
import Notification from '../components/Notification';
import OrderDashboard from './OrderDashboard';
import OwnerDashboard from './OwnerDashboard';
import DashboardButton from '../components/DashboardButton';
import api from '../services/api';
import { Product, Customer, OrderItem, Category } from '../types/types';
import '../styles/pos.css';
import { useNavigate } from 'react-router-dom';
import { hasRole, getCurrentUser, logout } from '../services/auth';

const POS: React.FC = () => {
  const [currentOrder, setCurrentOrder] = useState<{
    items: OrderItem[];
    customer: Customer | null;
    notes: string;
  }>({
    items: [],
    customer: null,
    notes: ''
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOrderDashboard, setShowOrderDashboard] = useState(false);
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  const isOwner = hasRole('owner');
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products'),
          api.get('/products/categories')
        ]);
        
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Data loading error:', err);
        showNotification('error', 'Failed to load products and categories');
      }
    };
    loadData();
  }, []);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddProduct = (product: Product) => {
    setCurrentOrder(prev => {
      const existingItem = prev.items.find(item => item.product_id === product.Product_ID);
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.product_id === product.Product_ID
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            product_id: product.Product_ID,
            name: product.Product_Name,
            price: Number(product.Price) || 0,
            quantity: 1
          }
        ]
      };
    });
  };

  const handleRemoveProduct = (productId: number) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product_id !== productId)
    }));
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.product_id === productId ? { ...item, quantity: newQuantity } : item
      )
    }));
  };

  const handleSubmitOrder = async (paymentMethod: 'cash' | 'credit') => {
    try {
      const orderData = {
        customer_id: currentOrder.customer?.Customer_ID || null,
        products: currentOrder.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        payment_method: paymentMethod,
        notes: currentOrder.notes,
        status: 'pending'
      };

      const response = await api.post('/orders', orderData);
      showNotification('success', `Order #${response.data.order_id} submitted! Status: Pending`);
      
      // Reset order and update pending count
      setCurrentOrder({
        items: [],
        customer: null,
        notes: ''
      });
      setPendingOrderCount(prev => prev + 1);
      
    } catch (err: any) {
      console.error('Order submission error:', err);
      showNotification(
        'error', 
        err.response?.data?.error || 'Failed to process order'
      );
    } finally {
      setShowPaymentModal(false);
    }
  };
  const navigate = useNavigate();

  const calculateTotal = () => {
    return currentOrder.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );
  };

  return (
    <div className="pos-container">
      <div className="pos-header">
        <h1>Bakery POS</h1>
        <div className="header-controls">
          {isOwner && (
        <button 
          onClick={() => setShowOwnerDashboard(true)}
          className="dashboard-btn"
        >
          Owner Dashboard
        </button>
      )}
      <OwnerDashboard 
        visible={showOwnerDashboard}
        onClose={() => setShowOwnerDashboard(false)}
      />

        </div>
        <div className="user-info">
              <span>Welcome, {getCurrentUser()?.name}</span>
              <button 
                onClick={() => {
                  logout();
                  navigate('/login', { replace: true });
                  
                }}
                className="logout-btn"
              >
                Logout
              </button>
            </div>
        <div className="header-controls">
          <Badge count={pendingOrderCount} showZero={false}>
            <Button 
              type="primary" 
              onClick={() => setShowOrderDashboard(true)}
              className="dashboard-btn"
            >
              Order Dashboard
            </Button>
          </Badge>
          <CustomerSearch
            selectedCustomer={currentOrder.customer}
            onSelect={(customer) => 
              setCurrentOrder(prev => ({ ...prev, customer }))
            }
          />
        </div>
      </div>

      <div className="pos-main">
        <ProductGrid 
          products={products}
          categories={categories}
          onAddProduct={handleAddProduct}
        />
        
        <OrderSummary
          items={currentOrder.items}
          customer={currentOrder.customer}
          notes={currentOrder.notes}
          onRemoveItem={handleRemoveProduct}
          onQuantityChange={handleQuantityChange}
          onNotesChange={(notes) => 
            setCurrentOrder(prev => ({ ...prev, notes }))
          }
          onCheckout={() => currentOrder.items.length > 0 && setShowPaymentModal(true)}
        />
      </div>

      {/* Order Dashboard Modal */}
      <Modal
        title={`Orders Dashboard (${pendingOrderCount} pending)`}
        open={showOrderDashboard}
        onCancel={() => setShowOrderDashboard(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{ padding: 0 }}
        destroyOnClose
      >
        <OrderDashboard 
          onUpdatePendingCount={setPendingOrderCount}
          onClose={() => setShowOrderDashboard(false)}
        />
      </Modal>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          total={calculateTotal()}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handleSubmitOrder}
        />
      )}

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default POS;