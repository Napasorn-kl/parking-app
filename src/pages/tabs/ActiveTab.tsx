import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Input, Button, Modal, Form, Select, AutoComplete,
  Empty, Row, Tooltip, message,
} from 'antd';
import {
  SearchOutlined, LogoutOutlined, EditOutlined,
  CloseCircleOutlined, ExclamationCircleOutlined, ReloadOutlined,
  SortAscendingOutlined, WarningOutlined,
  EnvironmentOutlined, UserOutlined, CarOutlined, ClockCircleOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import {
  Store, DESTINATIONS, PROVINCES, VEHICLE_TYPES, vehicleLabel,
  fmtTime, fmtDateTime, calcDuration, fmtDuration, elapsedMinutes,
} from '../../lib/data';
import type { ParkingRecord, VehicleType } from '../../lib/data';
import { PlateTag } from '../../components/PlateTag';
import { StatusBadge } from '../../components/StatusBadge';

interface Props { onRefresh: () => void }

type SortKey = 'elapsed_desc' | 'entry_desc' | 'plate_asc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'elapsed_desc', label: 'จอดนานสุดก่อน' },
  { value: 'entry_desc',   label: 'เข้าล่าสุดก่อน' },
  { value: 'plate_asc',    label: 'ทะเบียน A–Z' },
];

/* ── Elapsed tag ─────────────────────────────────────────────────────── */
function ElapsedTag({ entryTime, now }: { entryTime: string; now: number }) {
  const mins = elapsedMinutes(entryTime, now);
  const cls = mins > 240 ? 'elapsed-danger' : mins > 60 ? 'elapsed-warn' : 'elapsed-normal';
  return (
    <span className={cls} style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
      {fmtDuration(mins)}
    </span>
  );
}

/* ── Vehicle filter chip ─────────────────────────────────────────────── */
function VehicleChip({
  label, active, count, onClick,
}: { label: string; active: boolean; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 11px', borderRadius: 20, cursor: 'pointer', border: 'none',
        background: active ? '#1D4ED8' : '#FFFFFF',
        color: active ? '#FFFFFF' : '#475569',
        fontSize: 12, fontWeight: active ? 600 : 400,
        boxShadow: active
          ? '0 2px 6px rgba(29,78,216,0.25)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'all 0.15s ease',
        outline: 'none',
      }}
    >
      {label}
      <span style={{
        background: active ? 'rgba(255,255,255,0.25)' : '#EEF2FF',
        color: active ? '#fff' : '#6366F1',
        borderRadius: 10, padding: '0 5px',
        fontSize: 11, fontWeight: 700, lineHeight: '16px',
        minWidth: 18, textAlign: 'center',
      }}>
        {count}
      </span>
    </button>
  );
}

/* ── Section divider ─────────────────────────────────────────────────── */
function SectionDivider({ label, color, icon }: { label: string; color: string; icon?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 8, marginTop: 4,
    }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {icon} {label}
      </span>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export function ActiveTab({ onRefresh }: Props) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('elapsed_desc');
  const [vehicleFilter, setVehicleFilter] = useState<VehicleType | 'all'>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [now, setNow] = useState(Date.now());

  const [checkoutRecord, setCheckoutRecord] = useState<ParkingRecord | null>(null);
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

  /* ── All active records ── */
  const allActive = useMemo(() => Store.active(), [refreshKey]);

  /* ── Per-type counts (for filter chips) ── */
  const typeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allActive.forEach(r => { map[r.vehicleType] = (map[r.vehicleType] ?? 0) + 1; });
    return map;
  }, [allActive]);

  /* ── Filtered + sorted records ── */
  const records = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = allActive.filter(r => {
      const matchQ = !q
        || r.plate.toLowerCase().includes(q)
        || r.driverName.toLowerCase().includes(q)
        || r.destination.toLowerCase().includes(q);
      const matchV = vehicleFilter === 'all' || r.vehicleType === vehicleFilter;
      return matchQ && matchV;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === 'elapsed_desc') return elapsedMinutes(b.entryTime, now) - elapsedMinutes(a.entryTime, now);
      if (sortKey === 'entry_desc')   return new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime();
      if (sortKey === 'plate_asc')    return a.plate.localeCompare(b.plate);
      return 0;
    });

    return list;
  }, [allActive, query, vehicleFilter, sortKey, now]);

  /* ── Urgency split (only when sorted by elapsed) ── */
  const urgentRecords   = sortKey === 'elapsed_desc' ? records.filter(r => elapsedMinutes(r.entryTime, now) > 240) : [];
  const normalRecords   = sortKey === 'elapsed_desc' ? records.filter(r => elapsedMinutes(r.entryTime, now) <= 240) : records;

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

  /* ── Card renderer ── */
  const renderCard = (record: ParkingRecord) => (
    <div key={record.id} className={`record-card ${record.status}`}>
      {/* Zone A: Plate + Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
        <PlateTag plate={record.plate} province={record.province} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <StatusBadge status={record.status} />
          <ElapsedTag entryTime={record.entryTime} now={now} />
        </div>
      </div>

      {/* Zone B: Info rows */}
      <div style={{
        background: '#F8FAFC', border: '1px solid #EEF2F7',
        borderRadius: 8, padding: '10px 12px',
        display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <UserOutlined style={{ fontSize: 12, color: '#94A3B8', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#1E293B', fontWeight: 600, lineHeight: 1.3 }}>
            {record.driverName}
          </span>
          <span style={{ fontSize: 11, color: '#6366F1', background: '#EEF2FF', borderRadius: 4, padding: '1px 6px', marginLeft: 2 }}>
            <CarOutlined style={{ marginRight: 3, fontSize: 10 }} />
            {vehicleLabel(record.vehicleType)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
          <EnvironmentOutlined style={{ fontSize: 12, color: '#94A3B8', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>
            {record.destination}
            {record.purpose && <span style={{ color: '#94A3B8' }}> · {record.purpose}</span>}
          </span>
        </div>
        {record.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <PhoneOutlined style={{ fontSize: 12, color: '#94A3B8', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>
              {record.phone}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <ClockCircleOutlined style={{ fontSize: 12, color: '#94A3B8', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>
            เข้า {fmtTime(record.entryTime)}
          </span>
        </div>
      </div>

      {/* Zone C: Actions */}
      <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
        <Button
          type="primary" size="small" icon={<LogoutOutlined />}
          onClick={() => setCheckoutRecord(record)}
          style={{
            background: 'linear-gradient(135deg, #16A34A, #22C55E)',
            borderColor: '#16A34A', fontWeight: 600,
            flex: 1, height: 32,
          }}
        >
          บันทึกเวลาออก
        </Button>
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} style={{ height: 32, minWidth: 72 }}>
          แก้ไข
        </Button>
        <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleCancel(record)} style={{ height: 32, minWidth: 64 }}>
          ยกเลิก
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      {/* ── Search bar ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          placeholder="ค้นหาทะเบียน / ชื่อ / สถานที่"
          value={query}
          onChange={e => setQuery(e.target.value)}
          allowClear
          style={{ flex: 1 }}
        />
        <Tooltip title="รีเฟรช">
          <Button icon={<ReloadOutlined />} onClick={refresh} style={{ flexShrink: 0 }} />
        </Tooltip>
      </div>

      {/* ── Toolbar: filter chips + sort ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 14, flexWrap: 'wrap',
      }}>
        {/* Vehicle filter chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          <VehicleChip
            label="ทั้งหมด"
            active={vehicleFilter === 'all'}
            count={allActive.length}
            onClick={() => setVehicleFilter('all')}
          />
          {VEHICLE_TYPES.filter(t => (typeCounts[t.value] ?? 0) > 0).map(t => (
            <VehicleChip
              key={t.value}
              label={t.label}
              active={vehicleFilter === t.value}
              count={typeCounts[t.value] ?? 0}
              onClick={() => setVehicleFilter(vehicleFilter === t.value ? 'all' : t.value as VehicleType)}
            />
          ))}
        </div>

        {/* Sort selector */}
        <Select
          value={sortKey}
          onChange={v => setSortKey(v)}
          size="small"
          suffixIcon={<SortAscendingOutlined />}
          style={{ width: 160, flexShrink: 0 }}
          options={SORT_OPTIONS}
        />
      </div>

      {/* ── Result count ── */}
      {(query || vehicleFilter !== 'all') && (
        <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>
          แสดง <span style={{ color: '#0284C7', fontWeight: 600 }}>{records.length}</span> จาก {allActive.length} รายการ
          {vehicleFilter !== 'all' && (
            <button
              onClick={() => setVehicleFilter('all')}
              style={{
                marginLeft: 8, fontSize: 11, color: '#64748B',
                background: '#F1F5F9', border: 'none', borderRadius: 4,
                padding: '1px 7px', cursor: 'pointer',
              }}
            >
              ล้างตัวกรอง ×
            </button>
          )}
        </div>
      )}

      {/* ── Record list ── */}
      {records.length === 0 ? (
        <Empty
          description={
            <span style={{ color: '#94A3B8' }}>
              {query || vehicleFilter !== 'all'
                ? 'ไม่พบรายการที่ตรงกัน'
                : 'ไม่มีรถในลานจอด'}
            </span>
          }
          style={{ marginTop: 60 }}
        />
      ) : (
        <>
          {/* Urgent group (>4hr) */}
          {urgentRecords.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <SectionDivider
                label={`เกิน 4 ชั่วโมง (${urgentRecords.length} คัน)`}
                color="#DC2626"
                icon={<WarningOutlined />}
              />
              {urgentRecords.map(renderCard)}
            </div>
          )}

          {/* Normal group */}
          {normalRecords.length > 0 && (
            <div>
              {urgentRecords.length > 0 && normalRecords.length > 0 && (
                <SectionDivider
                  label={`ปกติ (${normalRecords.length} คัน)`}
                  color="#0284C7"
                />
              )}
              {normalRecords.map(renderCard)}
            </div>
          )}
        </>
      )}

      {/* ── Checkout Modal ── */}
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
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                    {fmtDateTime(checkoutRecord.entryTime)}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748B', fontSize: 12, marginBottom: 2 }}>เวลาออก</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                    {fmtDateTime(exitNow)}
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: 16, background: 'rgba(22,163,74,0.07)',
                border: '1px solid rgba(22,163,74,0.2)', borderRadius: 8,
                padding: '10px 16px', textAlign: 'center',
              }}>
                <span style={{ color: '#64748B', fontSize: 12 }}>ระยะเวลาจอด </span>
                <span style={{ color: '#16A34A', fontWeight: 700, fontSize: 18 }}>{fmtDuration(dur)}</span>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── Edit Modal ── */}
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
