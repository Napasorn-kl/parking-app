import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Input, Button, Modal, Form, Select, AutoComplete,
  Empty, Row, Tooltip, message,
} from 'antd';
import {
  SearchOutlined, LogoutOutlined, EditOutlined,
  CloseCircleOutlined, ExclamationCircleOutlined, ReloadOutlined,
} from '@ant-design/icons';
import {
  Store, DESTINATIONS, PROVINCES, vehicleLabel,
  fmtTime, fmtDateTime, calcDuration, fmtDuration, elapsedMinutes,
} from '../../lib/data';
import type { ParkingRecord } from '../../lib/data';
import { PlateTag } from '../../components/PlateTag';
import { StatusBadge } from '../../components/StatusBadge';

interface Props { onRefresh: () => void }

function ElapsedTag({ entryTime, now }: { entryTime: string; now: number }) {
  const mins = elapsedMinutes(entryTime, now);
  const cls = mins > 240 ? 'elapsed-danger' : mins > 60 ? 'elapsed-warn' : 'elapsed-normal';
  return <span className={cls} style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
    {fmtDuration(mins)}
  </span>;
}

export function ActiveTab({ onRefresh }: Props) {
  const [query, setQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [now, setNow] = useState(Date.now());

  // Checkout modal
  const [checkoutRecord, setCheckoutRecord] = useState<ParkingRecord | null>(null);

  // Edit modal
  const [editRecord, setEditRecord] = useState<ParkingRecord | null>(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    onRefresh();
  }, [onRefresh]);

  const records = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Store.active().filter(r =>
      !q ||
      r.plate.toLowerCase().includes(q) ||
      r.driverName.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q)
    );
  }, [query, refreshKey]);

  /* ── Checkout ── */
  const confirmCheckout = () => {
    if (!checkoutRecord) return;
    const exitTime = new Date().toISOString();
    const duration = calcDuration(checkoutRecord.entryTime, exitTime);
    Store.update(checkoutRecord.id, { status: 'exited', exitTime, duration });
    message.success(`บันทึกเวลาออก ${checkoutRecord.plate} สำเร็จ`);
    setCheckoutRecord(null);
    refresh();
  };

  /* ── Cancel ── */
  const handleCancel = (record: ParkingRecord) => {
    Modal.confirm({
      title: `ยืนยันยกเลิกรายการ ${record.plate}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'รายการจะเปลี่ยนสถานะเป็น "ยกเลิก"',
      okText: 'ยืนยัน',
      cancelText: 'ไม่ยกเลิก',
      okButtonProps: { danger: true },
      onOk: () => {
        Store.update(record.id, { status: 'cancelled' });
        message.success('ยกเลิกรายการแล้ว');
        refresh();
      },
    });
  };

  /* ── Edit ── */
  const openEdit = (record: ParkingRecord) => {
    setEditRecord(record);
    editForm.setFieldsValue({
      driverName: record.driverName,
      phone: record.phone,
      destination: record.destination,
      province: record.province,
      purpose: record.purpose,
    });
  };

  const confirmEdit = () => {
    editForm.validateFields().then(values => {
      Store.update(editRecord!.id, values);
      message.success('แก้ไขข้อมูลสำเร็จ');
      setEditRecord(null);
      refresh();
    });
  };

  return (
    <div>
      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          placeholder="ค้นหาทะเบียน / ชื่อ / สถานที่"
          value={query}
          onChange={e => setQuery(e.target.value)}
          allowClear
          style={{ flex: 1 }}
        />
        <Tooltip title="รีเฟรช">
          <Button icon={<ReloadOutlined />} onClick={refresh} />
        </Tooltip>
      </div>

      {/* Record list */}
      {records.length === 0 ? (
        <Empty
          description={<span style={{ color: '#94A3B8' }}>
            {query ? 'ไม่พบรายการที่ตรงกัน' : 'ไม่มีรถในลานจอด'}
          </span>}
          style={{ marginTop: 60 }}
        />
      ) : (
        records.map(record => (
          <div key={record.id} className={`record-card ${record.status}`}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
              <PlateTag plate={record.plate} province={record.province} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <StatusBadge status={record.status} />
                <ElapsedTag entryTime={record.entryTime} now={now} />
              </div>
            </div>

            {/* Info */}
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>
              <span style={{ color: '#1E293B', fontWeight: 500 }}>{record.driverName}</span>
              <span style={{ margin: '0 6px', color: '#CBD5E1' }}>·</span>
              {vehicleLabel(record.vehicleType)}
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>
              📍 {record.destination}
              {record.purpose && <><span style={{ margin: '0 6px', color: '#CBD5E1' }}>·</span>{record.purpose}</>}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>
              เข้า {fmtTime(record.entryTime)}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <Button
                type="primary" size="small"
                icon={<LogoutOutlined />}
                onClick={() => setCheckoutRecord(record)}
                style={{ background: '#22C55E', borderColor: '#22C55E' }}
              >
                บันทึกเวลาออก
              </Button>
              <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
                แก้ไข
              </Button>
              <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleCancel(record)}>
                ยกเลิก
              </Button>
            </div>
          </div>
        ))
      )}

      {/* Checkout Modal */}
      <Modal
        title="บันทึกเวลาออก"
        open={!!checkoutRecord}
        onOk={confirmCheckout}
        onCancel={() => setCheckoutRecord(null)}
        okText="ยืนยันออก"
        cancelText="ยกเลิก"
        okButtonProps={{ style: { background: '#22C55E', borderColor: '#22C55E' } }}
      >
        {checkoutRecord && (() => {
          const exitNow = new Date().toISOString();
          const dur = calcDuration(checkoutRecord.entryTime, exitNow);
          return (
            <div style={{ padding: '8px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <PlateTag plate={checkoutRecord.plate} province={checkoutRecord.province} size="lg" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: 14 }}>
                <div>
                  <div style={{ color: '#64748B', fontSize: 12, marginBottom: 2 }}>ผู้ขับ</div>
                  <div style={{ fontWeight: 600 }}>{checkoutRecord.driverName}</div>
                </div>
                <div>
                  <div style={{ color: '#64748B', fontSize: 12, marginBottom: 2 }}>สถานที่</div>
                  <div style={{ fontWeight: 600 }}>{checkoutRecord.destination}</div>
                </div>
                <div>
                  <div style={{ color: '#64748B', fontSize: 12, marginBottom: 2 }}>เวลาเข้า</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmtDateTime(checkoutRecord.entryTime)}</div>
                </div>
                <div>
                  <div style={{ color: '#64748B', fontSize: 12, marginBottom: 2 }}>เวลาออก</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmtDateTime(exitNow)}</div>
                </div>
              </div>
              <div style={{
                marginTop: 16, background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)',
                borderRadius: 8, padding: '10px 16px', textAlign: 'center',
              }}>
                <span style={{ color: '#64748B', fontSize: 12 }}>ระยะเวลาจอด </span>
                <span style={{ color: '#16A34A', fontWeight: 700, fontSize: 18 }}>{fmtDuration(dur)}</span>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="แก้ไขข้อมูล"
        open={!!editRecord}
        onOk={confirmEdit}
        onCancel={() => setEditRecord(null)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="driverName" label="ชื่อ-นามสกุลผู้ขับ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="เบอร์โทรศัพท์">
            <Input inputMode="tel" />
          </Form.Item>
          <Row>
            <Form.Item name="destination" label="สถานที่ติดต่อ" style={{ flex: 1, marginRight: 8 }}>
              <AutoComplete options={DESTINATIONS.map(d => ({ value: d }))}>
                <Input />
              </AutoComplete>
            </Form.Item>
          </Row>
          <Form.Item name="province" label="จังหวัดทะเบียน">
            <Select showSearch allowClear placeholder="เลือกจังหวัด">
              {PROVINCES.map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="purpose" label="วัตถุประสงค์">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

