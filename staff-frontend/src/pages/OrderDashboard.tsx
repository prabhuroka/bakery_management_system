import React, { useState, useEffect } from 'react';
import { Tabs, Button, Table, Space, notification, Tag, Spin } from 'antd';
import api from '../services/api';

const { TabPane } = Tabs;

interface Order {
  Order_ID: number;
  Order_Date: string;
  Total_Amount: number;
  Payment_Method: string;
  Status: string;
  employee_name: string;
  customer_first_name?: string;
  customer_last_name?: string;
}

interface OrderDashboardProps {
  onUpdatePendingCount?: (count: number) => void;
  onClose?: () => void;
}

const OrderDashboard: React.FC<OrderDashboardProps> = ({ 
  onUpdatePendingCount, 
  onClose 
}) => {
  const [orders, setOrders] = useState<Record<string, Order[]>>({
    pending: [],
    completed: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [pending, completed, cancelled] = await Promise.all([
        api.get('/orders/status/pending'),
        api.get('/orders/status/completed'),
        api.get('/orders/status/cancelled')
      ]);
      
      setOrders({
        pending: pending.data,
        completed: completed.data,
        cancelled: cancelled.data
      });

      if (onUpdatePendingCount) {
        onUpdatePendingCount(pending.data.length);
      }
    } catch (err) {
      notification.error({
        message: 'Failed to load orders'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      notification.success({
        message: 'Order status updated'
      });
      fetchOrders();
    } catch (err) {
      notification.error({
        message: 'Failed to update order'
      });
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'Order_ID',
      key: 'Order_ID',
    },
    {
      title: 'Date',
      dataIndex: 'Order_Date',
      key: 'Order_Date',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_: any, record: Order) => (
        record.customer_first_name 
          ? `${record.customer_first_name} ${record.customer_last_name}`
          : 'Walk-in'
      )
    },
    {
      title: 'Amount',
      dataIndex: 'Total_Amount',
      key: 'Total_Amount',
      render: (amount: any) => `$${Number(amount).toFixed(2)}`
    },
    {
      title: 'Payment',
      dataIndex: 'Payment_Method',
      key: 'Payment_Method',
      render: (method: string) => method.toUpperCase()
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      render: (status: string) => (
        <Tag color={
          status === 'completed' ? 'green' : 
          status === 'cancelled' ? 'red' : 'orange'
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Space size="middle">
          {record.Status === 'pending' && (
            <>
              <Button 
                type="primary" 
                onClick={() => updateStatus(record.Order_ID, 'completed')}
              >
                Complete
              </Button>
              <Button 
                danger
                onClick={() => updateStatus(record.Order_ID, 'cancelled')}
              >
                Cancel
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="order-dashboard-container">
      {onClose && (
        <div className="dashboard-controls">
          <Button onClick={onClose}>Close Dashboard</Button>
          <Button onClick={fetchOrders} loading={loading}>
            Refresh
          </Button>
        </div>
      )}
      
      <Spin spinning={loading}>
        <Tabs defaultActiveKey="pending">
          <TabPane tab={`Pending (${orders.pending.length})`} key="pending">
            <Table 
              columns={columns} 
              dataSource={orders.pending} 
              rowKey="Order_ID"
              scroll={{ x: true }}
            />
          </TabPane>
          <TabPane tab={`Completed (${orders.completed.length})`} key="completed">
            <Table 
              columns={columns} 
              dataSource={orders.completed} 
              rowKey="Order_ID"
              scroll={{ x: true }}
            />
          </TabPane>
          <TabPane tab={`Cancelled (${orders.cancelled.length})`} key="cancelled">
            <Table 
              columns={columns} 
              dataSource={orders.cancelled} 
              rowKey="Order_ID"
              scroll={{ x: true }}
            />
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default OrderDashboard;