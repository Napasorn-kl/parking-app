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
      background: '#0B1120',
      backgroundImage: `
        linear-gradient(rgba(30,53,82,0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(30,53,82,0.3) 1px, transparent 1px)
      `,
      backgroundSize: '32px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#111B2E',
        border: '1px solid #1E3552',
        borderRadius: 18,
        padding: '44px 36px',
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 32px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.05)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', width: 60, height: 60,
            background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
            borderRadius: 18, alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 32px rgba(14,165,233,0.5)',
          }}>
            <CarOutlined style={{ color: '#fff', fontSize: 28 }} />
          </div>
          <Title level={4} style={{ color: '#E2E8F0', margin: '0 0 4px' }}>ระบบจอดรถ</Title>
          <Text style={{ color: '#4B6280', fontSize: 13 }}>สำหรับเจ้าหน้าที่และผู้ดูแลระบบ</Text>
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
              prefix={<UserOutlined style={{ color: '#4B6280' }} />}
              placeholder="ชื่อผู้ใช้"
              size="large"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#4B6280' }} />}
              placeholder="รหัสผ่าน"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary" htmlType="submit" block size="large" loading={loading}
              style={{ height: 50, borderRadius: 10, fontWeight: 700, fontSize: 15 }}
            >
              เข้าสู่ระบบ
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="#/checkin" style={{ color: '#4B6280', fontSize: 13 }}>
            ← กลับหน้าบันทึกรถเข้า
          </a>
        </div>

        <div style={{
          marginTop: 24, background: '#0B1120', border: '1px solid #1E3552',
          borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#4B6280',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: '#64748B' }}>บัญชีทดสอบ:</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>staff / staff123</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>admin / admin123</div>
        </div>
      </div>
    </div>
  );
}
