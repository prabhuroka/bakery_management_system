import React, { useState, useEffect } from 'react';
import { Form, Input, Switch, Select, Modal, notification, Spin } from 'antd';
import api from '../services/api';
import { Employee, Role } from '../types/types';

interface EditEmployeeFormProps {
  employeeId: number | null;
  visible: boolean;
  onSave: (values: any) => void;
  onCancel: () => void;
}

const EditEmployeeForm: React.FC<EditEmployeeFormProps> = ({
  employeeId,
  visible,
  onSave,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (visible && employeeId) {
      fetchRoles();
      fetchEmployee();
    }
  }, [visible, employeeId]);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.filter((role: Role) => role.Role_Name !== 'owner'));
    } catch (err) {
      notification.error({
        message: 'Failed to load roles',
        description: 'Could not fetch employee roles'
      });
    }
  };

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/employees/${employeeId}`);
      setEmployee(response.data);
      form.setFieldsValue({
        Employee_ID: response.data.Employee_ID,
        First_Name: response.data.First_Name,
        Last_Name: response.data.Last_Name,
        Active: response.data.Active,
        roles: Array.isArray(response.data.roles) ? 
          response.data.roles.filter((role: string) => role !== 'employee') : []
      });
    } catch (err) {
      notification.error({
        message: 'Failed to load employee',
        description: 'Could not fetch employee details'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const finalRoles = Array.from(
        new Set(['employee', ...(values.roles || [])])
      ).filter(role => role !== 'owner');
      
      onSave({
        ...values,
        Employee_ID: employeeId,
        roles: finalRoles
      });
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  return (
    <Modal
      title={`Edit Employee #${employeeId}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          <Form.Item 
            name="Employee_ID" 
            label="Employee ID"
          >
            <Input disabled />
          </Form.Item>
          
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
            name="Active" 
            label="Active" 
            valuePropName="checked"
          >
            <Switch />
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
            name="New_Password"
            label="New Password"
            rules={[
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
            extra="Leave blank to keep current password"
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default EditEmployeeForm;