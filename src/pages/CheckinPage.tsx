import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, AutoComplete, Row, Col } from 'antd';
import {
  UserOutlined, PhoneOutlined, CarOutlined,
  EnvironmentOutlined, CheckCircleFilled,
  BankOutlined, HomeOutlined, TeamOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { Store, Auth, genId, VEHICLE_TYPES, PROVINCES, DESTINATIONS, fmtTime } from '../lib/data';
import type { ParkingRecord, VehicleType } from '../lib/data';
import { PlateTag } from '../components/PlateTag';

interface FormValues {
  driverName: string;
  phone?: string;
  vehicleType: VehicleType;
  plate: string;
  province?: string;
  destination: string;
  building?: string;
  contactPerson?: string;
  purpose: string;
}

/* ── Section header ─────────────────────────────────────────── */
function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
      <div style={{ width: 3, height: 18, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  );
}

/* ── Success screen ─────────────────────────────────────────── */
function SuccessScreen({ done, onReset }: { done: ParkingRecord; onReset: () => void }) {
  return (
    <div className="checkin-bg" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
    }}>
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.85) translateY(20px); }
          70%  { transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .success-card { animation: popIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      <div className="success-card" style={{
        background: '#fff', borderRadius: 24, padding: '40px 28px 32px',
        maxWidth: 400, width: '100%', textAlign: 'center',
        boxShadow: '0 24px 64px rgba(22,163,74,0.13), 0 4px 16px rgba(0,0,0,0.06)',
        border: '1px solid rgba(22,163,74,0.12)',
      }}>
        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 40,
          background: 'linear-gradient(135deg, rgba(22,163,74,0.12), rgba(34,197,94,0.08))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, border: '1px solid rgba(22,163,74,0.2)',
        }}>
          <CheckCircleFilled style={{ fontSize: 44, color: '#16A34A' }} />
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
          บันทึกสำเร็จ!
        </div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>
          ระบบบันทึกข้อมูลรถของคุณเรียบร้อยแล้ว
        </div>

        <div style={{ marginBottom: 20 }}>
          <PlateTag plate={done.plate} province={done.province} size="lg" />
        </div>

        {/* Summary */}
        <div style={{
          background: '#F8FAFF', borderRadius: 12, padding: '16px 18px',
          fontSize: 13, color: '#374151', textAlign: 'left', marginBottom: 24,
          border: '1px solid #EEF2FF',
        }}>
          {[
            { label: 'ผู้ขับ',         value: done.driverName },
            ...(done.destination ? [{ label: 'หน่วยงาน', value: done.destination }] : []),
            ...(done.building    ? [{ label: 'สถานที่',  value: done.building }] : []),
            ...(done.contactPerson ? [{ label: 'ผู้นัดหมาย', value: done.contactPerson }] : []),
            { label: 'เวลาเข้า', value: fmtTime(done.entryTime), mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'baseline', paddingBottom: 7, marginBottom: 7,
              borderBottom: '1px solid #EEF2FF',
            }}>
              <span style={{ color: '#94A3B8', fontSize: 12 }}>{label}</span>
              <span style={{
                fontWeight: 600,
                fontFamily: mono ? "'JetBrains Mono', monospace" : undefined,
                fontSize: mono ? 13 : 13,
                color: '#0F172A',
                textAlign: 'right', maxWidth: '60%',
              }}>
                {value}
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>สถานะ</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#0284C7',
              background: 'rgba(2,132,199,0.08)', border: '1px solid rgba(2,132,199,0.2)',
              borderRadius: 20, padding: '2px 10px',
            }}>กำลังจอด</span>
          </div>
        </div>

        <Button
          type="primary" block size="large"
          onClick={onReset}
          style={{
            height: 50, borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: 'linear-gradient(135deg, #16A34A, #22C55E)',
            border: 'none', boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
          }}
        >
          บันทึกรถคันอื่น
        </Button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export function CheckinPage() {
  const [form] = Form.useForm<FormValues>();
  const [done, setDone] = useState<ParkingRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => form.getFieldInstance?.('driverName')?.focus?.(), 200);
  }, [form]);

  const onFinish = (values: FormValues) => {
    setLoading(true);
    const plate = values.plate.trim().toUpperCase();
    const dup = Store.findActivePlate(plate);
    if (dup) {
      import('antd').then(({ message }) =>
        message.warning({ content: `ทะเบียน ${plate} ยังอยู่ในระบบ ยังไม่ได้บันทึกเวลาออก`, duration: 4 })
      );
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
      building: values.building?.trim() ?? '',
      contactPerson: values.contactPerson?.trim() ?? '',
      purpose: values.purpose.trim(),
      entryTime: now,
      status: 'parking',
      recordedBy: Auth.get()?.id ?? 'visitor',
    };
    Store.add(record);
    setDone(record);
    setLoading(false);
  };

  if (done) return <SuccessScreen done={done} onReset={() => { setDone(null); form.resetFields(); }} />;

  return (
    <div className="checkin-bg" style={{ minHeight: '100vh', paddingBottom: 60 }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ci-hero   { animation: fadeSlideUp 0.38s ease both; }
        .ci-card   { animation: fadeSlideUp 0.42s 0.06s ease both; }
        .ci-s1     { animation: fadeSlideUp 0.36s 0.10s ease both; }
        .ci-s2     { animation: fadeSlideUp 0.36s 0.18s ease both; }
        .ci-submit { animation: fadeSlideUp 0.36s 0.24s ease both; }

        .ant-form-item-label > label {
          font-weight: 600 !important;
          font-size: 13px !important;
          color: #374151 !important;
        }
        .ci-input .ant-input,
        .ci-input .ant-select-selector,
        .ci-input .ant-input-affix-wrapper {
          border-radius: 10px !important;
          border-color: #E2E8F0 !important;
          background: #FAFBFE !important;
          font-size: 14px !important;
        }
        .ci-input .ant-input:focus,
        .ci-input .ant-select-focused .ant-select-selector,
        .ci-input .ant-input-affix-wrapper-focused {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08) !important;
          background: #fff !important;
        }
      `}</style>

      <div style={{ padding: '36px 16px 0', maxWidth: 500, margin: '0 auto' }}>
        {/* ── Hero branding ── */}
        <div className="ci-hero" style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14, boxShadow: '0 10px 28px rgba(29,78,216,0.28)',
          }}>
            <CarOutlined style={{ color: '#fff', fontSize: 28 }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1.2, marginBottom: 6 }}>
            บันทึกรถเข้าที่จอด
          </div>
          <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
            กรุณากรอกข้อมูลให้ครบก่อนนำรถเข้าจอด
          </div>
        </div>

        {/* ── Form card ── */}
        <div className="ci-card" style={{
          background: '#fff', borderRadius: 20,
          boxShadow: '0 8px 40px rgba(29,78,216,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid #E8EEFA', overflow: 'hidden',
        }}>
          <Form
            form={form} layout="vertical"
            onFinish={onFinish} requiredMark={false} size="large"
            className="ci-input"
          >
            {/* ─── Section 1: ข้อมูลรถและผู้ขับ ─── */}
            <div className="ci-s1" style={{ padding: '24px 22px 20px' }}>
              <SectionHeader label="ข้อมูลรถและผู้ขับ" color="#2563EB" />

              <Form.Item
                name="driverName"
                label="ชื่อ-นามสกุลผู้ขับ"
                rules={[{ required: true, message: 'กรุณากรอกชื่อ-นามสกุล' }]}
                style={{ marginBottom: 14 }}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#94A3B8' }} />}
                  placeholder="เช่น สมชาย ใจดี"
                />
              </Form.Item>

              <Form.Item name="phone" label="เบอร์โทรศัพท์" style={{ marginBottom: 14 }}>
                <Input
                  prefix={<PhoneOutlined style={{ color: '#94A3B8' }} />}
                  placeholder="081-234-5678"
                  inputMode="tel"
                />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="vehicleType" label="ประเภทรถ"
                    rules={[{ required: true, message: 'กรุณาเลือก' }]}
                    style={{ marginBottom: 14 }}
                  >
                    <Select placeholder="เลือกประเภท">
                      {VEHICLE_TYPES.map(t => (
                        <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="plate" label="ทะเบียนรถ"
                    rules={[{ required: true, message: 'กรุณากรอก' }]}
                    style={{ marginBottom: 14 }}
                  >
                    <Input
                      placeholder="กข-1234"
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.05em' }}
                      onChange={e => form.setFieldValue('plate', e.target.value.toUpperCase())}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="province" label="จังหวัดของทะเบียน" style={{ marginBottom: 0 }}>
                <Select placeholder="เลือกจังหวัด" showSearch allowClear>
                  {PROVINCES.map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
                </Select>
              </Form.Item>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px dashed #E2E8F0', margin: '0 22px' }} />

            {/* ─── Section 2: รายละเอียดการติดต่อ ─── */}
            <div className="ci-s2" style={{ padding: '20px 22px' }}>
              <SectionHeader label="รายละเอียดการติดต่อ" color="#7C3AED" />

              <Form.Item
                name="destination"
                label="ชื่อบริษัท / หน่วยงานที่ติดต่อ"
                rules={[{ required: true, message: 'กรุณาระบุหน่วยงาน' }]}
                style={{ marginBottom: 14 }}
              >
                <AutoComplete
                  options={DESTINATIONS.map(d => ({ value: d }))}
                  filterOption={(input, opt) => (opt?.value ?? '').includes(input)}
                  placeholder="เช่น ฝ่ายบุคคล, ห้องประชุม A"
                >
                  <Input prefix={<BankOutlined style={{ color: '#94A3B8' }} />} />
                </AutoComplete>
              </Form.Item>

              <Form.Item
                name="building"
                label="สถานที่ / อาคาร / สำนักงาน"
                style={{ marginBottom: 14 }}
              >
                <Input
                  prefix={<HomeOutlined style={{ color: '#94A3B8' }} />}
                  placeholder="เช่น อาคาร A ชั้น 3 ห้อง 301"
                />
              </Form.Item>

              <Form.Item
                name="contactPerson"
                label="ชื่อผู้ที่นัดหมาย / ผู้มาติดต่อ"
                style={{ marginBottom: 14 }}
              >
                <Input
                  prefix={<TeamOutlined style={{ color: '#94A3B8' }} />}
                  placeholder="เช่น คุณวิภา รักดี"
                />
              </Form.Item>

              <Form.Item
                name="purpose"
                label="วัตถุประสงค์การติดต่อ"
                rules={[{ required: true, message: 'กรุณาระบุวัตถุประสงค์' }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  prefix={<FileTextOutlined style={{ color: '#94A3B8' }} />}
                  placeholder="เช่น ประชุม, ส่งพัสดุ, สัมภาษณ์งาน"
                />
              </Form.Item>
            </div>

            {/* ─── Submit ─── */}
            <div className="ci-submit" style={{
              padding: '16px 22px 24px',
              borderTop: '1px solid #F1F5F9',
              background: 'linear-gradient(180deg, #fff 0%, #F8FAFF 100%)',
            }}>
              <Button
                type="primary" htmlType="submit" block loading={loading}
                style={{
                  height: 54, borderRadius: 13, fontSize: 16, fontWeight: 700,
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
                  border: 'none', letterSpacing: '0.02em',
                  boxShadow: '0 6px 20px rgba(29,78,216,0.35)',
                }}
              >
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                บันทึกเวลาเข้า
              </Button>
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#94A3B8' }}>
                เวลาเข้าจะถูกบันทึกโดยอัตโนมัติ
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
