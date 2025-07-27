import React, { useState, useEffect } from 'react';
import { Switch, Form, Input, InputNumber, Select, Modal, notification, Spin } from 'antd';
import api from '../services/api';
import { Product, Category } from '../types/types';

interface EditProductFormProps {
  productId: number | null;
  visible: boolean;
  onSave: (values: any) => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  productId,
  visible,
  onSave,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (visible) {
      fetchCategories();
      if (productId) {
        fetchProduct();
      } else {
        form.resetFields();
        setProduct(null);
      }
    }
  }, [visible, productId]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data);
    } catch (err) {
      notification.error({
        message: 'Failed to load categories',
        description: 'Could not fetch product categories'
      });
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);
      form.setFieldsValue({
        Product_ID: response.data.Product_ID,
        Product_Name: response.data.Product_Name,
        Category_ID: response.data.Category_ID,
        Price: response.data.Price,
        Product_Stock_Level: response.data.Product_Stock_Level,
        Image_URL: response.data.Image_URL 
      });
    } catch (err) {
      notification.error({
        message: 'Failed to load product',
        description: 'Could not fetch product details'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave({
        Product_ID: productId || undefined,
        ...values
      });
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  return (
    <Modal
      title={productId ? `Edit Product` : 'Create New Product'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          <Form.Item 
            name="Product_Name" 
            label="Product Name" 
            rules={[{ required: true, message: 'Please input product name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item 
            name="Category_ID" 
            label="Category" 
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select loading={categories.length === 0}>
              {categories.map(category => (
                <Select.Option key={category.Category_ID} value={category.Category_ID}>
                  {category.Category_Name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item 
            name="Price" 
            label="Price" 
            rules={[{ required: true, message: 'Please input price' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>
          
          <Form.Item 
            name="Product_Stock_Level" 
            label="Stock Level" 
            rules={[{ required: true, message: 'Please input stock level' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item 
            name="Image_URL" 
            label="Image URL"
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
          <Form.Item 
            name="Active" 
            label="Active" 
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default EditProductForm;