import React, { useState, useEffect } from 'react';
import { Table, Tag } from 'antd';
import api from '../services/api';

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'Created_At',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Employee',
      key: 'employee',
      render: (log: any) => `${log.First_Name} ${log.Last_Name}`
    },
    {
      title: 'Action',
      dataIndex: 'Action_Type',
      key: 'action',
      render: (action: string) => (
        <Tag color={
          action.includes('DELETE') ? 'red' : 
          action.includes('UPDATE') ? 'orange' : 'blue'
        }>
          {action}
        </Tag>
      )
    },
    {
      title: 'Details',
      dataIndex: 'Action_Details',
      key: 'details',
      render: (details: string) => (
        <pre style={{ margin: 0 }}>
          {details ? JSON.stringify(JSON.parse(details), null, 2) : 'N/A'}
        </pre>
      )
    },
    {
      title: 'IP Address',
      dataIndex: 'IP_Address',
      key: 'ip'
    }
  ];

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/audit-logs');
        setLogs(response.data);
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="audit-log-container">
      <h2>Audit Logs</h2>
      <Table 
        columns={columns}
        dataSource={logs}
        rowKey="Log_ID"
        loading={loading}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default AuditLog;