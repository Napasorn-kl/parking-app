import { useState, useEffect } from 'react';
import {
  Form, Input, Select, Button, AutoComplete, Row, Col,
  message, Typography, Card,
} from 'antd';
import {
  UserOutlined, PhoneOutlined, CarOutlined,
  EnvironmentOutlined, CheckCircleFilled,
} from '@ant-design/icons';
import { Store, Auth, genId, VEHICLE_TYPES, PROVINCES, DESTINATIONS, fmtTime } from '../lib/data';
import type { ParkingRecord, VehicleType } from '../lib/data';
import { PlateTag } from '../components/PlateTag';

const { Title, Text } = Typography;

interface FormValues {
  driverName: string;
  phone?: string;
  vehicleType: VehicleType;
  plate: string;
  province?: string;
  destination: string;
  purpose: string;
}

export function CheckinPage() {
  const [form] = Form.useForm<FormValues>();
  const [done, setDone] = useState<ParkingRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => form.getFieldInstance?.('driverName')?.focus?.(), 150);
  }, [form]);

  const onFinish = (values: FormValues) => {
    setLoading(true);
    const plate = values.plate.trim().toUpperCase();
    const dup = Store.findActivePlate(plate);
    if (dup) {
      message.warning({ content: `ทะเบียน ${plate} ยังอยู่ในระบบ ยังไม่ได้บันทึกเวลาออก`, duration: 4 });
      setLoading(false);
      return;
    }
    const now = new Date().toISOString();
    const record: ParkingRecord = {
      id: genId(),
      date: now.slice(0, 10),
      driverName: values.driverName.trim(),
      phone: values.phone?.trim() ?? '',
      vehicleType: values.vehicleType,
      plate,
      province: values.province ?? '',
      destination: values.destination,
      purpose: values.purpose.trim(),
      entryTime: now,
      status: 'parking',
      recordedBy: Auth.get()?.id ?? 'visitor',
    };
    Store.add(record);
    setDone(record);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="checkin-bg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '40px 28px',
          maxWidth: 400, width: '100%', textAlign: 'center',
          boxShadow: '0 20px 60px rgba(14,165,233,0.15), 0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ marginBottom: 20 }}>
            <CheckCircleFilled style={{ fontSize: 68, color: '#22C55E' }} />
          </div>
          <Title level={3} style={{ margin: '0 0 6px', color: '#0F172A' }}>บันทึกสำเร็จ!</Title>
          <Text style={{ color: '#64748B', display: 'block', marginBottom: 28 }}>
            ระบบบันทึกรถของคุณเรียบร้อยแล้ว
          </Text>

          <div style={{ marginBottom: 24 }}>
            <PlateTag plate={done.plate} province={done.province} size="lg" />
          </div>

          <div style={{
            background: '#F8FAFF', borderRadius: 10, padding: '14px 18px',
            fontSize: 14, color: '#374151', textAlign: 'left', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#64748B' }}>ผู้ขับ</span>
              <span style={{ fontWeight: 600 }}>{done.driverName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#64748B' }}>สถานที่ติดต่อ</span>
              <span style={{ fontWeight: 600 }}>{done.destination}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>เวลาเข้า</span>
              <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{fmtTime(done.entryTime)}</span>
            </div>
          </div>

          <Button
            type="primary" block size="large"
            onClick={() => { setDone(null); form.resetFields(); }}
            style={{ height: 50, borderRadius: 12, fontSize: 16, fontWeight: 600 }}
          >
            บันทึกรถคันอื่น
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-bg">
      <div className="checkin-header">
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #0284C7, #0EA5E9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <CarOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', lineHeight: 1.2 }}>ระบบจอดรถ</div>
          <div style={{ fontSize: 11, color: '#64748B' }}>Parking Management</div>
        </div>
      </div>

      <div style={{ padding: '20px 16px 40px', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <Title level={4} style={{ margin: 0, color: '#0F172A' }}>บันทึกรถเข้าที่จอด</Title>
          <Text style={{ color: '#64748B' }}>กรุณากรอกข้อมูลก่อนนำรถเข้าจอด</Text>
        </div>

        <Card
          bordered={false}
          style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(14,165,233,0.1)', border: '1px solid #E2E8F0' }}
          bodyStyle={{ padding: '24px 20px' }}
        >
          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} size="large">

            <Form.Item name="driverName" label={<b>ชื่อ-นามสกุลผู้ขับ <span style={{ color: '#EF4444' }}>*</span></b>}
              rules={[{ required: true, message: 'กรุณากรอกชื่อ-นามสกุล' }]}>
              <Input prefix={<UserOutlined style={{ color: '#CBD5E1' }} />} placeholder="เช่น สมชาย ใจดี" />
            </Form.Item>

            <Form.Item name="phone" label={<b>เบอร์โทรศัพท์</b>}>
              <Input prefix={<PhoneOutlined style={{ color: '#CBD5E1' }} />} placeholder="081-234-5678" inputMode="tel" />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="vehicleType" label={<b>ประเภทรถ <span style={{ color: '#EF4444' }}>*</span></b>}
                  rules={[{ required: true, message: 'กรุณาเลือก' }]}>
                  <Select placeholder="เลือกประเภท">
                    {VEHICLE_TYPES.map(t => (
                      <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="plate" label={<b>ทะเบียนรถ <span style={{ color: '#EF4444' }}>*</span></b>}
                  rules={[{ required: true, message: 'กรุณากรอก' }]}>
                  <Input
                    placeholder="กข-1234"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textTransform: 'uppercase' }}
                    onChange={e => form.setFieldValue('plate', e.target.value.toUpperCase())}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="province" label={<b>จังหวัดของทะเบียน</b>}>
              <Select placeholder="เลือกจังหวัด" showSearch allowClear>
                {PROVINCES.map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="destination" label={<b>สถานที่/หน่วยงานที่มาติดต่อ <span style={{ color: '#EF4444' }}>*</span></b>}
              rules={[{ required: true, message: 'กรุณาระบุสถานที่' }]}>
              <AutoComplete
                options={DESTINATIONS.map(d => ({ value: d }))}
                filterOption={(input, opt) => (opt?.value ?? '').includes(input)}
                placeholder="เลือกหรือพิมพ์สถานที่"
              >
                <Input prefix={<EnvironmentOutlined style={{ color: '#CBD5E1' }} />} />
              </AutoComplete>
            </Form.Item>

            <Form.Item name="purpose" label={<b>วัตถุประสงค์การติดต่อ <span style={{ color: '#EF4444' }}>*</span></b>}
              rules={[{ required: true, message: 'กรุณาระบุวัตถุประสงค์' }]}
              style={{ marginBottom: 20 }}>
              <Input.TextArea placeholder="เช่น ประชุม, ส่งพัสดุ, สัมภาษณ์งาน" rows={2} />
            </Form.Item>

            <Button
              type="primary" htmlType="submit" block loading={loading}
              style={{
                height: 52, borderRadius: 12, fontSize: 16, fontWeight: 700,
                background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
                border: 'none',
              }}
            >
              บันทึกเวลาเข้า
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
