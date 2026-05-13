import { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, CarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../lib/data';

const { Title, Text } = Typography;

export function LoginPage() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = ({ username, password }: { username: string; password: string }) => {
    setLoading(true);
    setError(false);
    const user = Auth.login(username.trim(), password);
    if (user) {
      navigate('/staff', { replace: true });
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #EFF6FF 0%, #F0F9FF 50%, #E0F2FE 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 18,
        padding: '44px 36px',
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 8px 40px rgba(14,165,233,0.1), 0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', width: 60, height: 60,
            background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
            borderRadius: 18, alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(2,132,199,0.3)',
          }}>
            <CarOutlined style={{ color: '#fff', fontSize: 28 }} />
          </div>
          <Title level={4} style={{ color: '#0F172A', margin: '0 0 4px' }}>ระบบจอดรถ</Title>
          <Text style={{ color: '#64748B', fontSize: 13 }}>สำหรับเจ้าหน้าที่และผู้ดูแลระบบ</Text>
        </div>

        {error && (
          <Alert
            message="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
            type="error"
            showIcon
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} autoComplete="on">
          <Form.Item name="username" rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}>
            <Input
              prefix={<UserOutlined style={{ color: '#94A3B8' }} />}
              placeholder="ชื่อผู้ใช้"
              size="large"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
              placeholder="รหัสผ่าน"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary" htmlType="submit" block size="large" loading={loading}
              style={{
                height: 50, borderRadius: 10, fontWeight: 700, fontSize: 15,
                background: 'linear-gradient(135deg, #0284C7, #0EA5E9)',
                border: 'none',
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </Form.Item>
        </Form>

        <div style={{
          marginTop: 24, background: '#F8FAFC', border: '1px solid #E2E8F0',
          borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748B',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: '#475569' }}>บัญชีทดสอบ:</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>staff / staff123</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>admin / admin123</div>
        </div>
      </div>
    </div>
  );
}
