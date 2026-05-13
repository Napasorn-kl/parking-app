import { useState } from 'react';
import { Form, Input, Select, Button, AutoComplete, Row, Col, message } from 'antd';
import {
  UserOutlined, PhoneOutlined, CarOutlined, EnvironmentOutlined,
  CheckCircleFilled, BankOutlined, HomeOutlined, TeamOutlined,
} from '@ant-design/icons';
import { Store, Auth, genId, VEHICLE_TYPES, PROVINCES, DESTINATIONS, fmtTime } from '../lib/data';
import type { ParkingRecord, VehicleType } from '../lib/data';
import { PlateTag } from '../components/PlateTag';

interface FormValues {
  driverName: string; phone?: string; vehicleType: VehicleType;
  plate: string; province?: string; destination: string;
  building?: string; contactPerson?: string; purpose: string;
}

/* ── Success screen ─────────────────────────────────── */
function SuccessScreen({ done, onReset }: { done: ParkingRecord; onReset: () => void }) {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(145deg,#EFF6FF 0%,#F0F9FF 50%,#E0F2FE 100%)',
      padding: '24px 20px',
    }}>
      <style>{`
        @keyframes popIn {
          0%   { opacity:0; transform:scale(0.82) translateY(24px); }
          65%  { transform:scale(1.04) translateY(-3px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        .sc { animation: popIn .5s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>
      <div className="sc" style={{
        background:'#fff', borderRadius:28, padding:'36px 24px 28px',
        maxWidth:420, width:'100%', textAlign:'center',
        boxShadow:'0 24px 72px rgba(22,163,74,.14),0 4px 16px rgba(0,0,0,.06)',
        border:'1px solid rgba(22,163,74,.1)',
      }}>
        <div style={{
          width:88, height:88, borderRadius:44,
          background:'linear-gradient(135deg,rgba(22,163,74,.12),rgba(34,197,94,.06))',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          marginBottom:18, border:'1.5px solid rgba(22,163,74,.18)',
        }}>
          <CheckCircleFilled style={{ fontSize:48, color:'#16A34A' }} />
        </div>
        <div style={{ fontSize:24, fontWeight:800, color:'#0F172A', marginBottom:4 }}>บันทึกสำเร็จ!</div>
        <div style={{ fontSize:13, color:'#64748B', marginBottom:22 }}>ระบบบันทึกข้อมูลรถของคุณเรียบร้อยแล้ว</div>
        <div style={{ marginBottom:20 }}>
          <PlateTag plate={done.plate} province={done.province} size="lg" />
        </div>
        <div style={{
          background:'#F8FAFF', borderRadius:14, padding:'14px 16px',
          fontSize:13, textAlign:'left', marginBottom:16, border:'1px solid #EEF2FF',
        }}>
          {[
            { label:'ผู้ขับ',      value: done.driverName },
            ...(done.destination   ? [{ label:'หน่วยงาน',  value: done.destination }]   : []),
            ...(done.building      ? [{ label:'สถานที่',   value: done.building }]      : []),
            ...(done.contactPerson ? [{ label:'ผู้นัดหมาย', value: done.contactPerson }] : []),
            { label:'เวลาเข้า', value: fmtTime(done.entryTime), mono: true },
          ].map(({ label, value, mono }, i, arr) => (
            <div key={label} style={{
              display:'flex', justifyContent:'space-between', alignItems:'baseline',
              paddingBottom: i < arr.length-1 ? 8 : 0,
              marginBottom:  i < arr.length-1 ? 8 : 0,
              borderBottom:  i < arr.length-1 ? '1px solid #EEF2FF' : 'none',
            }}>
              <span style={{ color:'#94A3B8', fontSize:12 }}>{label}</span>
              <span style={{
                fontWeight:600, color:'#0F172A', textAlign:'right', maxWidth:'65%', fontSize:13,
                fontFamily: mono ? "'JetBrains Mono',monospace" : undefined,
              }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          <div style={{
            flex:1, background:'rgba(2,132,199,.07)', border:'1px solid rgba(2,132,199,.18)',
            borderRadius:10, padding:'8px 12px', textAlign:'center',
          }}>
            <div style={{ fontSize:10, color:'#94A3B8', marginBottom:2 }}>สถานะ</div>
            <div style={{ fontSize:12, fontWeight:700, color:'#0284C7' }}>กำลังจอด</div>
          </div>
          <div style={{
            flex:1, background:'rgba(22,163,74,.07)', border:'1px solid rgba(22,163,74,.18)',
            borderRadius:10, padding:'8px 12px', textAlign:'center',
          }}>
            <div style={{ fontSize:10, color:'#94A3B8', marginBottom:2 }}>เวลาเข้า</div>
            <div style={{ fontSize:12, fontWeight:700, color:'#16A34A', fontFamily:"'JetBrains Mono',monospace" }}>
              {fmtTime(done.entryTime)}
            </div>
          </div>
        </div>
        <Button type="primary" block size="large" onClick={onReset} style={{
          height:54, borderRadius:14, fontSize:16, fontWeight:700,
          background:'linear-gradient(135deg,#16A34A,#22C55E)',
          border:'none', boxShadow:'0 6px 20px rgba(22,163,74,.3)',
        }}>
          บันทึกรถคันอื่น
        </Button>
      </div>
    </div>
  );
}

/* ── Section label ──────────────────────────────────── */
function Section({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, marginTop:4 }}>
      <div style={{ width:3, height:16, borderRadius:2, background:color, flexShrink:0 }} />
      <span style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.07em', textTransform:'uppercase' }}>
        {label}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export function CheckinPage() {
  const [form]  = Form.useForm<FormValues>();
  const [done, setDone]       = useState<ParkingRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = (values: FormValues) => {
    setLoading(true);
    const plate = values.plate.trim().toUpperCase();
    const dup   = Store.findActivePlate(plate);
    if (dup) {
      message.warning({ content:`ทะเบียน ${plate} ยังอยู่ในระบบ ยังไม่ได้บันทึกเวลาออก`, duration:4 });
      setLoading(false); return;
    }
    const now = new Date().toISOString();
    const record: ParkingRecord = {
      id: genId(), date: now.slice(0,10),
      driverName: values.driverName.trim(), phone: values.phone?.trim() ?? '',
      vehicleType: values.vehicleType, plate,
      province: values.province ?? '',
      destination: values.destination,
      building: values.building?.trim() ?? '',
      contactPerson: values.contactPerson?.trim() ?? '',
      purpose: values.purpose.trim(),
      entryTime: now, status:'parking',
      recordedBy: Auth.get()?.id ?? 'visitor',
    };
    Store.add(record); setDone(record); setLoading(false);
  };

  if (done) return <SuccessScreen done={done} onReset={() => { setDone(null); form.resetFields(); }} />;

  return (
    <div className="checkin-bg" style={{ minHeight:'100dvh', paddingBottom:40 }}>
      <style>{`
        @keyframes ciUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .ci-page { animation: ciUp .35s ease both; }

        .ci-form .ant-form-item { margin-bottom: 0; }
        .ci-form .ant-form-item-label { padding-bottom: 5px; }
        .ci-form .ant-form-item-label > label {
          font-size: 13px !important; font-weight: 600 !important;
          color: #374151 !important; height: auto !important;
        }

        /* ── Standalone input (ไม่มี prefix) ── */
        .ci-form .ant-input:not(.ant-input-affix-wrapper .ant-input):not(textarea) {
          min-height: 50px !important; border-radius: 12px !important;
          border-color: #E2E8F0 !important; background: #F8FAFF !important;
          font-size: 15px !important; padding: 0 14px !important;
        }
        .ci-form .ant-input:not(.ant-input-affix-wrapper .ant-input):not(textarea):focus {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,.10) !important;
          background: #fff !important;
        }

        /* ── Affix wrapper (มี prefix icon) ── */
        .ci-form .ant-input-affix-wrapper {
          min-height: 50px !important; border-radius: 12px !important;
          border-color: #E2E8F0 !important; background: #F8FAFF !important;
          font-size: 15px !important; padding: 0 14px !important;
          display: flex !important; align-items: center !important;
        }
        .ci-form .ant-input-affix-wrapper-focused {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,.10) !important;
          background: #fff !important;
        }
        /* inner input — reset ทั้งหมด */
        .ci-form .ant-input-affix-wrapper .ant-input {
          background: transparent !important; border: none !important;
          box-shadow: none !important; min-height: unset !important;
          padding: 0 8px !important; font-size: 15px !important; flex: 1;
        }

        /* ── Select ── */
        .ci-form .ant-select-selector {
          min-height: 50px !important; border-radius: 12px !important;
          border-color: #E2E8F0 !important; background: #F8FAFF !important;
          font-size: 15px !important; align-items: center !important;
          padding: 0 14px !important;
        }
        .ci-form .ant-select-focused .ant-select-selector {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,.10) !important;
          background: #fff !important;
        }

        /* ── TextArea ── */
        .ci-form textarea.ant-input {
          min-height: 90px !important; border-radius: 12px !important;
          border-color: #E2E8F0 !important; background: #F8FAFF !important;
          font-size: 15px !important; padding: 14px !important;
          resize: none !important; line-height: 1.6 !important;
        }
        .ci-form textarea.ant-input:focus {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,.10) !important;
          background: #fff !important;
        }

        .ci-form .ant-form-item-explain-error { font-size: 12px; margin-top: 4px; }
      `}</style>

      <div className="ci-page" style={{ maxWidth:500, margin:'0 auto', padding:'28px 16px 0' }}>

        {/* ── Hero ── */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{
            width:56, height:56, borderRadius:16,
            background:'linear-gradient(135deg,#1D4ED8,#2563EB)',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            marginBottom:12, boxShadow:'0 8px 24px rgba(29,78,216,.28)',
          }}>
            <CarOutlined style={{ color:'#fff', fontSize:26 }} />
          </div>
          <div style={{ fontSize:21, fontWeight:800, color:'#0F172A', lineHeight:1.2, marginBottom:5 }}>
            บันทึกรถเข้าที่จอด
          </div>
          <div style={{ fontSize:13, color:'#64748B' }}>กรุณากรอกข้อมูลก่อนนำรถเข้าจอด</div>
        </div>

        {/* ── Card ── */}
        <div style={{
          background:'#fff', borderRadius:20,
          boxShadow:'0 6px 32px rgba(29,78,216,.08),0 1px 4px rgba(0,0,0,.04)',
          border:'1px solid #E8EEFA', overflow:'hidden',
        }}>
          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} className="ci-form">

            {/* ── ข้อมูลรถและผู้ขับ ── */}
            <div style={{ padding:'22px 18px 20px' }}>
              <Section label="ข้อมูลรถและผู้ขับ" color="#2563EB" />
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

                <Form.Item name="driverName" label="ชื่อ-นามสกุลผู้ขับ"
                  rules={[{ required:true, message:'กรุณากรอกชื่อ-นามสกุล' }]}>
                  <Input prefix={<UserOutlined style={{ color:'#94A3B8' }} />} placeholder="เช่น สมชาย ใจดี" />
                </Form.Item>

                <Form.Item name="phone" label="เบอร์โทรศัพท์ (ไม่บังคับ)">
                  <Input prefix={<PhoneOutlined style={{ color:'#94A3B8' }} />}
                    placeholder="081-234-5678" inputMode="tel" />
                </Form.Item>

                <Form.Item name="vehicleType" label="ประเภทรถ"
                  rules={[{ required:true, message:'กรุณาเลือกประเภทรถ' }]}>
                  <Select placeholder="เลือกประเภทรถ" size="large">
                    {VEHICLE_TYPES.map(t => <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>)}
                  </Select>
                </Form.Item>

                <Row gutter={10}>
                  <Col span={14}>
                    <Form.Item name="plate" label="ทะเบียนรถ"
                      rules={[{ required:true, message:'กรุณากรอกทะเบียน' }]}>
                      <Input placeholder="กข-1234"
                        style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:'0.06em' }}
                        onChange={e => form.setFieldValue('plate', e.target.value.toUpperCase())} />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item name="province" label="จังหวัด">
                      <Select placeholder="เลือก" showSearch allowClear size="large">
                        {PROVINCES.map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop:'1px dashed #E8EEFA', margin:'0 18px' }} />

            {/* ── รายละเอียดการติดต่อ ── */}
            <div style={{ padding:'20px 18px' }}>
              <Section label="รายละเอียดการติดต่อ" color="#7C3AED" />
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

                <Form.Item name="destination" label="ชื่อบริษัท / หน่วยงานที่ติดต่อ"
                  rules={[{ required:true, message:'กรุณาระบุหน่วยงาน' }]}>
                  <AutoComplete options={DESTINATIONS.map(d => ({ value:d }))}
                    filterOption={(i,o) => (o?.value ?? '').includes(i)}
                    placeholder="เช่น ฝ่ายบุคคล, ห้องประชุม A">
                    <Input prefix={<BankOutlined style={{ color:'#94A3B8' }} />} />
                  </AutoComplete>
                </Form.Item>

                <Form.Item name="building" label="สถานที่ / อาคาร / สำนักงาน (ไม่บังคับ)">
                  <Input prefix={<HomeOutlined style={{ color:'#94A3B8' }} />}
                    placeholder="เช่น อาคาร A ชั้น 3 ห้อง 301" />
                </Form.Item>

                <Form.Item name="contactPerson" label="ชื่อผู้ที่นัดหมาย (ไม่บังคับ)">
                  <Input prefix={<TeamOutlined style={{ color:'#94A3B8' }} />}
                    placeholder="เช่น คุณวิภา รักดี" />
                </Form.Item>

                <Form.Item name="purpose" label="วัตถุประสงค์การติดต่อ"
                  rules={[{ required:true, message:'กรุณาระบุวัตถุประสงค์' }]}>
                  <Input.TextArea rows={3} placeholder="เช่น ประชุม, ส่งพัสดุ, สัมภาษณ์งาน" />
                </Form.Item>

              </div>
            </div>

            {/* ── Submit ── */}
            <div style={{
              padding:'14px 18px 22px',
              borderTop:'1px solid #F1F5F9',
              background:'linear-gradient(180deg,#fff 0%,#F8FAFF 100%)',
            }}>
              <Button type="primary" htmlType="submit" block loading={loading} style={{
                height:54, borderRadius:14, fontSize:16, fontWeight:700,
                background:'linear-gradient(135deg,#1D4ED8,#2563EB)',
                border:'none', boxShadow:'0 6px 20px rgba(29,78,216,.32)',
              }}>
                <EnvironmentOutlined style={{ marginRight:8 }} />
                บันทึกเวลาเข้า
              </Button>
              <div style={{ textAlign:'center', marginTop:9, fontSize:11, color:'#CBD5E1' }}>
                เวลาเข้าจะถูกบันทึกโดยอัตโนมัติ
              </div>
            </div>

          </Form>
        </div>
      </div>
    </div>
  );
}
