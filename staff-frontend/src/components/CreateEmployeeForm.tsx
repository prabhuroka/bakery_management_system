import React, { useState } from 'react';
import { Form, Input, Select, Modal, notification } from 'antd';
import api from '../services/api';
import { Role } from '../types/types';

interface CreateEmployeeFormProps {
  visible: boolean;
  onSave: (values: any) => void;
  onCancel: () => void;
}

const CreateEmployeeForm: React.FC<CreateEmployeeFormProps> = ({
  visible,
  onSave,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);

  // Fetch roles when modal opens
  React.useEffect(() => {
    if (visible) {
      const fetchRoles = async () => {
        try {
          const response = await api.get('/roles');
          // Filter out owner role
          setRoles(response.data.filter((role: Role) => role.Role_Name !== 'owner'));
        } catch (err) {
          notification.error({
            message: 'Failed to load roles',
            description: 'Could not fetch employee roles'
          });
        }
      };
      fetchRoles();
      form.resetFields();
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Ensure employee role is always included
      const finalRoles = Array.from(
        new Set(['employee', ...(values.roles || [])])
      ).filter(role => role !== 'owner');
      
      onSave({
        ...values,
        roles: finalRoles
      });
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  return (
    <Modal
      title="Create New Employee"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          name="First_Name" 
          label="First Name" 
          rules={[{ required: true, message: 'Please input first name' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item 
          name="Last_Name" 
          label="Last Name" 
          rules={[{ required: true, message: 'Please input last name' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item 
          name="Email" 
          label="Email" 
          rules={[
            { required: true, message: 'Please input email' },
            { type: 'email', message: 'Please input valid email' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item 
          name="Phone" 
          label="Phone"
        >
          <Input />
        </Form.Item>
        
        <Form.Item 
          name="roles" 
          label="Additional Roles"
          tooltip="Employee role is automatically assigned"
        >
          <Select 
            mode="multiple"
            placeholder="Select additional roles"
            options={roles.map(role => ({
              label: role.Role_Name,
              value: role.Role_Name
            }))}
          />
        </Form.Item>

        <Form.Item
          name="Password"
          label="Password"
          rules={[
            { required: true, message: 'Please input password' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateEmployeeForm;