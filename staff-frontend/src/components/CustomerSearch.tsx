import React, { useState, useEffect } from 'react';
import { Customer } from '../types/types';
import api from '../services/api';
import { Modal, Form, Input, Button, message } from 'antd';

interface CustomerSearchProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer | null) => void;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({ selectedCustomer, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get('/customers/search', { params: { query } });
        setResults(response.data);
      } catch (err) {
        console.error('Customer search failed:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleCreateNew = () => {
    const nameParts = query.split(' ');
    form.setFieldsValue({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: '',
      phone: ''
    });
    setShowCreateModal(true);
  };

  const handleCreateCustomer = async (values: any) => {
    try {
      const response = await api.post('/customers', values);
      onSelect(response.data);
      setQuery('');
      setResults([]);
      setShowCreateModal(false);
      message.success('Customer created successfully');
    } catch (err) {
      console.error('Failed to create customer:', err);
      message.error('Failed to create customer');
    }
  };

  return (
    <div className="customer-search">
      <input
        type="text"
        value={selectedCustomer 
          ? `${selectedCustomer.First_Name} ${selectedCustomer.Last_Name}`
          : query
        }
        onChange={(e) => {
          if (!selectedCustomer) {
            setQuery(e.target.value);
          }
        }}
        placeholder="Search customer..."
        disabled={!!selectedCustomer}
      />

      {selectedCustomer ? (
        <button 
          onClick={() => {
            onSelect(null);
            setQuery('');
          }}
          className="clear-customer"
        >
          ×
        </button>
      ) : null}

      {query && !selectedCustomer && (
        <div className="search-results">
          {isSearching ? (
            <div className="loading">Searching...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map(customer => (
                <li 
                  key={customer.Customer_ID}
                  onClick={() => {
                    onSelect(customer);
                    setQuery('');
                  }}
                >
                  {customer.First_Name} {customer.Last_Name}
                  {customer.Phone && ` • ${customer.Phone}`}
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">
              No customers found
              <button 
                onClick={handleCreateNew}
                className="create-new"
              >
                Create new customer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Customer Creation Modal */}
      <Modal
        title="Create New Customer"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCustomer}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please input first name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please input last name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Customer
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerSearch;