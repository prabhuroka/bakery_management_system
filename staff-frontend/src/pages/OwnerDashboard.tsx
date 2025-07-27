import React, { useState, useEffect } from 'react';
import {
  Space,
  Tag, 
  Modal, 
  Tabs, 
  Button, 
  Table, 
  Form,
  Select, 
  notification, 
  DatePicker
} from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import api from '../services/api';
import '../styles/pos.css';
import EditEmployeeForm from '../components/EditEmployeeForm';
import EditProductForm from '../components/EditProductForm';
import CreateEmployeeForm from '../components/CreateEmployeeForm';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface OwnerDashboardProps {
  visible: boolean;
  onClose: () => void;
}

interface Product {
  Product_ID: number;
  Product_Name: string;
  Description?: string;
  Category_ID: number;
  Category_Name?: string;
  Price: number;
  Product_Stock_Level: number;
  Active: boolean;
  Image_URL?: string;
  Stock_Level?: number;
}

interface Category {
  Category_ID: number;
  Category_Name: string;
  Description?: string;
}

interface Employee {
  Employee_ID: number;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone?: string;
  Active: boolean;
  roles?: string[];
}

interface Role {
  Role_ID: number;
  Role_Name: string;
  Description?: string;
}

interface SalesReportItem {
  period: string;
  order_count: number;
  total_sales: number;
  cash_sales: number;
  credit_sales: number;
  unique_customers?: number;
  employees_worked?: number;
}

interface CancelledOrder {
  Order_ID: number;
  Order_Date: string;
  Total_Amount: number;
  Payment_Method: string;
  employee_name: string;
  Customer_ID?: number;
  customer_name?: string;
  items_count: number;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('1');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [salesReport, setSalesReport] = useState<SalesReportItem[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<CancelledOrder[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>();
  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'cancelled'>('sales');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [showEmployeeDetailsModal, setShowEmployeeDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAllProductsModal, setShowAllProductsModal] = useState(false);

  useEffect(() => {
    if (visible) {
      loadInitialData();
      // Set default date range to last 7 days
      const today = dayjs();
      setDateRange([today.subtract(7, 'day'), today]);
    }
  }, [visible]);

  useEffect(() => {
  }, [editingProduct]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, employeesRes, rolesRes] = await Promise.all([
        api.get('/products/admin/all'),
        api.get('/products/categories'),
        api.get('/employees'),
        api.get('/roles')
      ]);
      
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setEmployees(employeesRes.data);
      setRoles(rolesRes.data.filter((role: any) => role.Role_Name !== 'owner'));
    } catch (err) {
      notification.error({ message: 'Failed to load initial data' });
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesReport = async () => {
    if (!dateRange) {
      notification.warning({ message: 'Please select a date range' });
      return;
    }
    
    try {
      setReportLoading(true);
      const [startDate, endDate] = dateRange;
      const response = await api.get('/reports/sales', {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          groupBy
        }
      });

      // Format numeric values
      const formattedData = response.data.map((item: any) => ({
        ...item,
        total_sales: Number(item.total_sales) || 0,
        cash_sales: Number(item.cash_sales) || 0,
        credit_sales: Number(item.credit_sales) || 0,
        unique_customers: Number(item.unique_customers) || 0,
        employees_worked: Number(item.employees_worked) || 0
      }));

      setSalesReport(formattedData || []);
    } catch (err) {
      notification.error({ 
        message: 'Failed to load sales report',
      });
      setSalesReport([]);
    } finally {
      setReportLoading(false);
    }
  };

  const loadCancelledOrders = async () => {
    if (!dateRange) {
      notification.warning({ message: 'Please select a date range' });
      return;
    }
    
    try {
      setReportLoading(true);
      const [startDate, endDate] = dateRange;
      const response = await api.get('/reports/cancelled-orders', {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        }
      });

      setCancelledOrders(response.data || []);
    } catch (err) {
      notification.error({ 
        message: 'Failed to load cancelled orders',
      });
      setCancelledOrders([]);
    } finally {
      setReportLoading(false);
    }
  };

  const handleReportTabChange = (tab: 'sales' | 'cancelled') => {
    setActiveReportTab(tab);
    if (tab === 'sales') {
      loadSalesReport();
    } else {
      loadCancelledOrders();
    }
  };

  const exportToExcel = async () => {
    if (!dateRange) {
      notification.warning({ message: 'Please select a date range' });
      return;
    }

    try {
      const [startDate, endDate] = dateRange;
      const endpoint = activeReportTab === 'sales' 
        ? '/reports/sales' 
        : '/reports/cancelled-orders';
      
      const response = await api.get(endpoint, {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          groupBy: activeReportTab === 'sales' ? groupBy : undefined,
          format: 'excel'
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeReportTab}-report-${startDate.format('YYYY-MM-DD')}-to-${endDate.format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      notification.error({
        message: 'Export failed',
        description: 'Could not generate Excel file'
      });
    }
  };


  const handleCreateEmployee = async (values: any) => {
    try {
      await api.post('/employees', values);
      notification.success({ 
        message: 'Employee created successfully',
        description: `${values.First_Name} ${values.Last_Name} has been added to the system`
      });
      loadInitialData();
      setShowEmployeeForm(false);
    } catch (err) {
      notification.error({ 
        message: 'Failed to create employee'
      });
    }
  };

  const handleSaveProduct = async (values: any) => {
  try {
    if (values.Product_ID) {
      // Editing existing product - use bulk update endpoint
      await api.put(`/products/${values.Product_ID}`, {
        Product_Name: values.Product_Name,
        Category_ID: values.Category_ID,
        Price: values.Price,
        Product_Stock_Level: values.Product_Stock_Level,
        Image_URL: values.Image_URL,
        Active: values.Active !== undefined ? values.Active : true
      });
    } else {
      // Creating new product
      await api.post('/products', {
        Product_Name: values.Product_Name,
        Category_ID: values.Category_ID,
        Price: values.Price,
        Product_Stock_Level: values.Product_Stock_Level,
        Image_URL: values.Image_URL,
        Active: true
      });
    }
    
    notification.success({
      message: values.Product_ID ? 'Product Updated' : 'Product Created',
      description: 'Operation completed successfully'
    });
    
    setShowProductForm(false);
    setSelectedProductId(null);
    loadInitialData();
  } catch (err) {
    notification.error({
      message: 'Operation Failed',
      description: values.Product_ID ? 'Could not update product' : 'Could not create product'
    });
  }
};

  const handleSaveEmployee = async (values: any) => {
    try {
      // Update employee status if changed
      if (values.Active !== undefined) {
        await api.put(`/employees/${values.Employee_ID}/status`, {
          active: values.Active
        });
      }
      
      // Update roles if changed
      if (values.roles !== undefined) {
        await api.put(`/employees/${values.Employee_ID}/roles`, {
          roles: values.roles
        });
      }
      
      notification.success({
        message: 'Employee Updated',
        description: 'Employee has been updated successfully'
      });
      
      setShowEmployeeForm(false);
      setSelectedEmployeeId(null);
      loadInitialData();
    } catch (err) {
      notification.error({
        message: 'Update Failed',
        description: 'Could not update employee'
      });
    }
  };



  const productColumns = [
    {
      title: 'Name',
      dataIndex: 'Product_Name',
      key: 'Product_Name',
    },
    {
      title: 'Price',
      dataIndex: 'Price',
      key: 'Price',
      render: (price: number) => `$${(Number(price) || 0).toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'Product_Stock_Level',
      key: 'Product_Stock_Level',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Button onClick={() => handleEditProduct(record.Product_ID)}>
          Edit
        </Button>
      ),
    }
  ];

  const employeeColumns = [
  {
    title: 'Name',
    key: 'name',
    render: (record: Employee) => `${record.First_Name} ${record.Last_Name}`,
  },
  {
    title: 'Email',
    dataIndex: 'Email',
    key: 'Email',
  },
  {
    title: 'Status',
    dataIndex: 'Active',
    key: 'Active',
    render: (active: boolean) => (
      <Tag color={active ? 'green' : 'red'}>
        {active ? 'Active' : 'Inactive'}
      </Tag>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: Employee) => (
      <Space>
        <Button onClick={() => handleEditEmployee(record.Employee_ID)}>
          Edit
        </Button>
        <Button onClick={() => {
          setSelectedEmployee(record);
          setShowEmployeeDetailsModal(true);
        }}>
          Details
        </Button>
      </Space>
    ),
  }
];

  const handleRangePickerChange: RangePickerProps['onChange'] = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(undefined);
    }
  };

  const handleEditProduct = (productId: number) => {
    setSelectedProductId(productId);
    setShowProductForm(true);
  };

  const handleEditEmployee = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setShowEmployeeForm(true);
  };

  const formatCurrency = (value: any) => `$${(Number(value) || 0).toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
  const formatCustomerName = (name: string) => name || 'Walk-in';
  const formatPaymentMethod = (method: string) => method.toUpperCase();

  return (
    <Modal
      title="Owner Dashboard"
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Products" key="1">
    <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
      <Button 
        type="primary" 
        onClick={() => {
          setSelectedProductId(null);
          setShowProductForm(true);
        }}
      >
        Add Product
      </Button>
      <Button 
        type="primary" 
        onClick={() => {
          if (products.length > 0) {
            setSelectedProductId(products[0].Product_ID);
            setShowProductForm(true);
          }
        }}
      >
        Edit Product
      </Button>
      <Button 
        type="primary" 
        onClick={() => setShowAllProductsModal(true)}
      >
        Show All Products
      </Button>
    </div>

    {showProductForm && (
      <EditProductForm
        productId={selectedProductId}
        visible={showProductForm}
        onSave={handleSaveProduct}
        onCancel={() => {
          setShowProductForm(false);
          setSelectedProductId(null);
        }}
      />
    )}

    {showAllProductsModal && (
      <Modal
        title="All Products"
        open={showAllProductsModal}
        onCancel={() => setShowAllProductsModal(false)}
        footer={null}
        width={1000}
      >
        <Table
          columns={[
            {
              title: 'ID',
              dataIndex: 'Product_ID',
              key: 'Product_ID',
            },
            {
              title: 'Name',
              dataIndex: 'Product_Name',
              key: 'Product_Name',
            },
            {
              title: 'Category',
              dataIndex: 'Category_Name',
              key: 'Category_Name',
              render: (text, record) => text || categories.find(c => c.Category_ID === record.Category_ID)?.Category_Name || 'N/A',
            },
            {
              title: 'Price',
              dataIndex: 'Price',
              key: 'Price',
              render: (price: number) => `$${(Number(price) || 0).toFixed(2)}`,
            },
            {
              title: 'Stock',
              dataIndex: 'Product_Stock_Level',
              key: 'Product_Stock_Level',
            },
            {
              title: 'Status',
              dataIndex: 'Active',
              key: 'Active',
              render: (active: boolean) => (
                <Tag color={active ? 'green' : 'red'}>
                  {active ? 'Active' : 'Inactive'}
                </Tag>
              ),
            },
          {
          title: 'Actions',
          key: 'actions',
          render: (_, record) => (
            <Space>
              <Button onClick={() => {
                setSelectedProductId(record.Product_ID);
                setShowProductForm(true);
                setShowAllProductsModal(false);
              }}>
                Edit
              </Button>
            </Space>
          ),
        }

          ]}
          dataSource={products}
          rowKey="Product_ID"
        />
      </Modal>
    )}
  </TabPane>

        <TabPane tab="Employees" key="2">
    <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
      <Button 
        type="primary" 
        onClick={() => setShowCreateEmployeeModal(true)}
      >
        Create New Employee
      </Button>
      <Button 
        type="primary" 
        onClick={() => {
          if (employees.length > 0) {
            setSelectedEmployeeId(employees[0].Employee_ID);
            setShowEmployeeForm(true);
          }
        }}
      >
        Edit Employee
      </Button>
      <Button 
        type="primary" 
        onClick={() => {
          if (employees.length > 0) {
            setSelectedEmployee(employees[0]);
            setShowEmployeeDetailsModal(true);
          }
        }}
      >
        View All Employees
      </Button>
    </div>

    {showCreateEmployeeModal && (
      <CreateEmployeeForm
        visible={showCreateEmployeeModal}
        onSave={(values) => {
          handleCreateEmployee(values);
          setShowCreateEmployeeModal(false);
        }}
        onCancel={() => setShowCreateEmployeeModal(false)}
      />
    )}

    {showEmployeeForm && selectedEmployeeId !== null && (
      <EditEmployeeForm
        employeeId={selectedEmployeeId}
        visible={showEmployeeForm}
        onSave={handleSaveEmployee}
        onCancel={() => {
          setShowEmployeeForm(false);
          setSelectedEmployeeId(null);
        }}
      />
    )}

    {showEmployeeDetailsModal && (
      <Modal
        title="All Employees"
        open={showEmployeeDetailsModal}
        onCancel={() => setShowEmployeeDetailsModal(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={[
            {
              title: 'ID',
              dataIndex: 'Employee_ID',
              key: 'Employee_ID',
            },
            {
              title: 'Name',
              key: 'name',
              render: (record: Employee) => `${record.First_Name} ${record.Last_Name}`,
            },
            {
              title: 'Email',
              dataIndex: 'Email',
              key: 'Email',
            },
            {
              title: 'Status',
              dataIndex: 'Active',
              key: 'Active',
              render: (active: boolean) => (
                <Tag color={active ? 'green' : 'red'}>
                  {active ? 'Active' : 'Inactive'}
                </Tag>
              ),
            },
            {
              title: 'Roles',
              key: 'roles',
              render: (record: Employee) => record.roles?.join(', ') || 'employee',
            }
          ]}
          dataSource={employees}
          rowKey="Employee_ID"
        />
      </Modal>
    )}
  </TabPane>

        <TabPane tab="Reports" key="3">
          <div style={{ marginBottom: 16 }}>
            <RangePicker 
              onChange={handleRangePickerChange}
              value={dateRange}
            />
            <Select
              value={groupBy}
              onChange={(value: 'day' | 'week' | 'month' | 'year') => setGroupBy(value)}
              style={{ width: 120, marginLeft: 8 }}
              disabled={activeReportTab !== 'sales'}
            >
              <Option value="day">Daily</Option>
              <Option value="week">Weekly</Option>
              <Option value="month">Monthly</Option>
              <Option value="year">Yearly</Option>
            </Select>
            <Button 
              onClick={() => activeReportTab === 'sales' ? loadSalesReport() : loadCancelledOrders()}
              loading={reportLoading}
              style={{ marginLeft: 8 }}
              disabled={!dateRange}
            >
              Generate Report
            </Button>
            <Button 
              onClick={exportToExcel}
              style={{ marginLeft: 8 }}
              disabled={(activeReportTab === 'sales' ? salesReport.length === 0 : cancelledOrders.length === 0) || !dateRange}
            >
              Export to Excel
            </Button>
          </div>

          <Tabs
            activeKey={activeReportTab}
            onChange={handleReportTabChange}
            type="card"
          >
            <Tabs.TabPane tab="Sales Report" key="sales">
              <Table
                columns={[
                  { title: 'Period', dataIndex: 'period', key: 'period' },
                  { title: 'Orders', dataIndex: 'order_count', key: 'orders' },
                  { 
                    title: 'Total Sales', 
                    dataIndex: 'total_sales', 
                    key: 'sales',
                    render: formatCurrency
                  },
                  { 
                    title: 'Cash Sales', 
                    dataIndex: 'cash_sales', 
                    key: 'cash',
                    render: formatCurrency
                  },
                  { 
                    title: 'Credit Sales', 
                    dataIndex: 'credit_sales', 
                    key: 'credit',
                    render: formatCurrency
                  },
                  { 
                    title: 'Unique Customers', 
                    dataIndex: 'unique_customers', 
                    key: 'customers',
                    render: (value) => value || 0
                  },
                  { 
                    title: 'Employees', 
                    dataIndex: 'employees_worked', 
                    key: 'employees',
                    render: (value) => value || 0
                  }
                ]}
                dataSource={salesReport}
                rowKey="period"
                loading={reportLoading}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Cancelled Orders" key="cancelled">
              <Table
                columns={[
                  { title: 'Order ID', dataIndex: 'Order_ID', key: 'id' },
                  { 
                    title: 'Date', 
                    dataIndex: 'Order_Date', 
                    key: 'date',
                    render: formatDate
                  },
                  { 
                    title: 'Amount', 
                    dataIndex: 'Total_Amount', 
                    key: 'amount',
                    render: formatCurrency
                  },
                  { 
                    title: 'Payment', 
                    dataIndex: 'Payment_Method', 
                    key: 'payment',
                    render: formatPaymentMethod
                  },
                  { title: 'Employee', dataIndex: 'employee_name', key: 'employee' },
                  { 
                    title: 'Customer', 
                    dataIndex: 'customer_name', 
                    key: 'customer',
                    render: formatCustomerName
                  },
                  { title: 'Items', dataIndex: 'items_count', key: 'items' }
                ]}
                dataSource={cancelledOrders}
                rowKey="Order_ID"
                loading={reportLoading}
              />
            </Tabs.TabPane>
          </Tabs>
        </TabPane>
      </Tabs>
      <EditProductForm
        productId={selectedProductId}
        visible={showProductForm}
        onSave={handleSaveProduct}
        onCancel={() => {
          setShowProductForm(false);
          setSelectedProductId(null);
        }}
      />

      {selectedEmployeeId !== null && (
  <EditEmployeeForm
    employeeId={selectedEmployeeId}
    visible={showEmployeeForm}
    onSave={handleSaveEmployee}
    onCancel={() => {
      setShowEmployeeForm(false);
      setSelectedEmployeeId(null);
    }}
  />
)}
    </Modal>
  );
};

export default OwnerDashboard;