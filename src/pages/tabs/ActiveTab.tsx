import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Input, Button, Modal, Form, Select, AutoComplete,
  Empty, Row, Tooltip, message, Table, Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
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

/* ── Elapsed display ─────────────────────────────────────────── */
function ElapsedBadge({ entryTime, now }: { entryTime: string; now: number }) {
  const mins = elapsedMinutes(entryTime, now);
  const color = mins > 240 ? '#DC2626' : mins > 60 ? '#D97706' : '#64748B';
  const bg    = mins > 240 ? 'rgba(220,38,38,0.07)' : mins > 60 ? 'rgba(217,119,6,0.07)' : 'transparent';
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12, fontWeight: 600, color,
      background: bg, borderRadius: 5, padding: bg !== 'transparent' ? '2px 6px' : 0,
    }}>
      {mins > 240 && <WarningOutlined style={{ marginRight: 4, fontSize: 10 }} />}
      {fmtDuration(mins)}
    </span>
  );
}

/* ── Vehicle chip ────────────────────────────────────────────── */
function VehicleChip({ label, active, count, onClick }:
  { label: string; active: boolean; count: number; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20, cursor: 'pointer', border: 'none',
      background: active ? '#1D4ED8' : '#FFFFFF',
      color: active ? '#FFFFFF' : '#475569',
      fontSize: 12, fontWeight: active ? 600 : 400,
      boxShadow: active ? '0 2px 6px rgba(29,78,216,0.25)' : '0 1px 3px rgba(0,0,0,0.08)',
      transition: 'all 0.15s ease', outline: 'none',
    }}>
      {label}
      <span style={{
        background: active ? 'rgba(255,255,255,0.25)' : '#EEF2FF',
        color: active ? '#fff' : '#6366F1',
        borderRadius: 10, padding: '0 5px',
        fontSize: 11, fontWeight: 700, lineHeight: '16px', minWidth: 18, textAlign: 'center',
      }}>{count}</span>
    </button>
  );
}

/* ── Row action buttons ──────────────────────────────────────── */
function RowActions({ record, onCheckout, onEdit, onCancel }:
  { record: ParkingRecord; onCheckout: () => void; onEdit: () => void; onCancel: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
      <Tooltip title="บันทึกเวลาออก">
        <Button
          size="small" type="primary"
          icon={<LogoutOutlined />}
          onClick={onCheckout}
          style={{ background: '#16A34A', borderColor: '#16A34A', minWidth: 28, height: 28 }}
        />
      </Tooltip>
      <Tooltip title="แก้ไข">
        <Button
          size="small" icon={<EditOutlined />}
          onClick={onEdit}
          style={{ minWidth: 28, height: 28 }}
        />
      </Tooltip>
      <Tooltip title="ยกเลิก">
        <Button
          size="small" danger icon={<CloseCircleOutlined />}
          onClick={onCancel}
          style={{ minWidth: 28, height: 28 }}
        />
      </Tooltip>
    </div>
  );
}

/* ── Mobile compact card ─────────────────────────────────────── */
function CompactCard({ record, now, onCheckout, onEdit, onCancel }:
  { record: ParkingRecord; now: number; onCheckout: () => void; onEdit: () => void; onCancel: () => void }) {
  const mins = elapsedMinutes(record.entryTime, now);
  const isUrgent = mins > 240;
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${isUrgent ? 'rgba(220,38,38,0.25)' : '#E2E8F0'}`,
      borderLeft: `3px solid ${isUrgent ? '#DC2626' : '#2563EB'}`,
      borderRadius: 10, padding: '12px 14px', marginBottom: 8,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <PlateTag plate={record.plate} province={record.province} size="sm" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <StatusBadge status={record.status} />
          <ElapsedBadge entryTime={record.entryTime} now={now} />
        </div>
      </div>
      {/* Info */}
      <div style={{ fontSize: 12, color: '#374151', marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <UserOutlined style={{ color: '#94A3B8', fontSize: 11 }} />
          <span style={{ fontWeight: 600 }}>{record.driverName}</span>
          <Tag style={{ fontSize: 10, padding: '0 5px', lineHeight: '16px', margin: 0, borderRadius: 4 }}>
            {vehicleLabel(record.vehicleType)}
          </Tag>
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <EnvironmentOutlined style={{ color: '#94A3B8', fontSize: 11 }} />
          <span style={{ color: '#475569' }}>{record.destination}</span>
          {record.purpose && <span style={{ color: '#94A3B8' }}>· {record.purpose}</span>}
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <ClockCircleOutlined style={{ color: '#94A3B8', fontSize: 11 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontSize: 11 }}>
            เข้า {fmtTime(record.entryTime)}
          </span>
        </div>
      </div>
      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <Button
          type="primary" size="small" icon={<LogoutOutlined />}
          onClick={onCheckout}
          style={{ background: '#16A34A', borderColor: '#16A34A', flex: 1, height: 30, fontSize: 12 }}
        >
          บันทึกเวลาออก
        </Button>
        <Button size="small" icon={<EditOutlined />} onClick={onEdit} style={{ height: 30, width: 52, fontSize: 11 }}>แก้ไข</Button>
        <Button size="small" danger icon={<CloseCircleOutlined />} onClick={onCancel} style={{ height: 30, width: 52, fontSize: 11 }}>ยกเลิก</Button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export function ActiveTab({ onRefresh }: Props) {
  const [query, setQuery]               = useState('');
  const [sortKey, setSortKey]           = useState<SortKey>('elapsed_desc');
  const [vehicleFilter, setVehicleFilter] = useState<VehicleType | 'all'>('all');
  const [refreshKey, setRefreshKey]     = useState(0);
  const [now, setNow]                   = useState(Date.now());
  const [isMobile, setIsMobile]         = useState(window.innerWidth < 768);

  const [checkoutRecord, setCheckoutRecord] = useState<ParkingRecord | null>(null);
  const [editRecord, setEditRecord]         = useState<ParkingRecord | null>(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => { clearInterval(id); window.removeEventListener('resize', onResize); };
  }, []);

  const refresh = useCallback(() => { setRefreshKey(k => k + 1); onRefresh(); }, [onRefresh]);

  const allActive = useMemo(() => Store.active(), [refreshKey]);

  const typeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allActive.forEach(r => { map[r.vehicleType] = (map[r.vehicleType] ?? 0) + 1; });
    return map;
  }, [allActive]);

  const records = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = allActive.filter(r => {
      const matchQ = !q || r.plate.toLowerCase().includes(q)
        || r.driverName.toLowerCase().includes(q) || r.destination.toLowerCase().includes(q);
      const matchV = vehicleFilter === 'all' || r.vehicleType === vehicleFilter;
      return matchQ && matchV;
    });
    return [...list].sort((a, b) => {
      if (sortKey === 'elapsed_desc') return elapsedMinutes(b.entryTime, now) - elapsedMinutes(a.entryTime, now);
      if (sortKey === 'entry_desc')   return new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime();
      return a.plate.localeCompare(b.plate);
    });
  }, [allActive, query, vehicleFilter, sortKey, now]);

  /* ── Checkout ── */
  const confirmCheckout = () => {
    if (!checkoutRecord) return;
    const exitTime = new Date().toISOString();
    Store.update(checkoutRecord.id, {
      status: 'exited', exitTime,
      duration: calcDuration(checkoutRecord.entryTime, exitTime),
    });
    message.success(`บันทึกเวลาออก ${checkoutRecord.plate} สำเร็จ`);
    setCheckoutRecord(null); refresh();
  };

  /* ── Cancel ── */
  const handleCancel = (record: ParkingRecord) => {
    Modal.confirm({
      title: `ยืนยันยกเลิกรายการ ${record.plate}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'รายการจะเปลี่ยนสถานะเป็น "ยกเลิก"',
      okText: 'ยืนยัน', cancelText: 'ไม่ยกเลิก',
      okButtonProps: { danger: true },
      onOk: () => { Store.update(record.id, { status: 'cancelled' }); message.success('ยกเลิกรายการแล้ว'); refresh(); },
    });
  };

  /* ── Edit ── */
  const openEdit = (record: ParkingRecord) => {
    setEditRecord(record);
    editForm.setFieldsValue({
      driverName: record.driverName, phone: record.phone,
      destination: record.destination, province: record.province, purpose: record.purpose,
    });
  };
  const confirmEdit = () => {
    editForm.validateFields().then(values => {
      Store.update(editRecord!.id, values);
      message.success('แก้ไขข้อมูลสำเร็จ');
      setEditRecord(null); refresh();
    });
  };

  /* ── Table columns (desktop) ── */
  const columns: ColumnsType<ParkingRecord> = [
    {
      title: 'ทะเบียน',
      key: 'plate',
      width: 130,
      render: (_, r) => <PlateTag plate={r.plate} province={r.province} size="sm" />,
    },
    {
      title: 'ผู้ขับ',
      key: 'driver',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A', lineHeight: 1.3 }}>{r.driverName}</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CarOutlined style={{ fontSize: 10 }} />
            {vehicleLabel(r.vehicleType)}
            {r.phone && (
              <span style={{ marginLeft: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                <PhoneOutlined style={{ fontSize: 10 }} />{r.phone}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'สถานที่ / วัตถุประสงค์',
      key: 'destination',
      render: (_, r) => (
        <div>
          <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{r.destination}</div>
          {r.purpose && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{r.purpose}</div>}
        </div>
      ),
    },
    {
      title: 'เวลาเข้า',
      key: 'entryTime',
      width: 80,
      render: (_, r) => (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#475569' }}>
          {fmtTime(r.entryTime)}
        </span>
      ),
    },
    {
      title: 'จอดมาแล้ว',
      key: 'elapsed',
      width: 110,
      render: (_, r) => <ElapsedBadge entryTime={r.entryTime} now={now} />,
    },
    {
      title: '',
      key: 'actions',
      width: 110,
      render: (_, r) => (
        <RowActions
          record={r}
          onCheckout={() => setCheckoutRecord(r)}
          onEdit={() => openEdit(r)}
          onCancel={() => handleCancel(r)}
        />
      ),
    },
  ];

  /* ── Row styling ── */
  const rowClassName = (r: ParkingRecord) => {
    const mins = elapsedMinutes(r.entryTime, now);
    if (mins > 240) return 'row-urgent';
    if (mins > 60)  return 'row-warn';
    return '';
  };

  /* ── Toolbar ── */
  const toolbar = (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          placeholder="ค้นหาทะเบียน / ชื่อ / สถานที่"
          value={query} onChange={e => setQuery(e.target.value)}
          allowClear style={{ flex: 1 }}
        />
        <Tooltip title="รีเฟรช">
          <Button icon={<ReloadOutlined />} onClick={refresh} />
        </Tooltip>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          <VehicleChip label="ทั้งหมด" active={vehicleFilter === 'all'}
            count={allActive.length} onClick={() => setVehicleFilter('all')} />
          {VEHICLE_TYPES.filter(t => (typeCounts[t.value] ?? 0) > 0).map(t => (
            <VehicleChip key={t.value} label={t.label}
              active={vehicleFilter === t.value}
              count={typeCounts[t.value] ?? 0}
              onClick={() => setVehicleFilter(vehicleFilter === t.value ? 'all' : t.value as VehicleType)}
            />
          ))}
        </div>
        <Select value={sortKey} onChange={v => setSortKey(v)} size="small"
          suffixIcon={<SortAscendingOutlined />} style={{ width: 152, flexShrink: 0 }}
          options={SORT_OPTIONS}
        />
      </div>
      {(query || vehicleFilter !== 'all') && (
        <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>
          แสดง <span style={{ color: '#0284C7', fontWeight: 600 }}>{records.length}</span> จาก {allActive.length} รายการ
          <button onClick={() => { setVehicleFilter('all'); setQuery(''); }}
            style={{ marginLeft: 8, fontSize: 11, color: '#64748B', background: '#F1F5F9',
              border: 'none', borderRadius: 4, padding: '1px 7px', cursor: 'pointer' }}>
            ล้าง ×
          </button>
        </div>
      )}
    </>
  );

  return (
    <div>
      {toolbar}

      {records.length === 0 ? (
        <Empty
          description={<span style={{ color: '#94A3B8' }}>
            {query || vehicleFilter !== 'all' ? 'ไม่พบรายการที่ตรงกัน' : 'ไม่มีรถในลานจอด'}
          </span>}
          style={{ marginTop: 60 }}
        />
      ) : isMobile ? (
        /* ── Mobile: compact cards ── */
        <div>
          {records.map(r => (
            <CompactCard key={r.id} record={r} now={now}
              onCheckout={() => setCheckoutRecord(r)}
              onEdit={() => openEdit(r)}
              onCancel={() => handleCancel(r)}
            />
          ))}
        </div>
      ) : (
        /* ── Desktop: table ── */
        <div style={{
          background: '#FFFFFF', borderRadius: 12,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <style>{`
            .parking-table .ant-table-thead > tr > th {
              background: #F8FAFC !important;
              color: #64748B !important;
              font-size: 11px !important;
              font-weight: 700 !important;
              letter-spacing: 0.05em !important;
              text-transform: uppercase !important;
              border-bottom: 1px solid #E2E8F0 !important;
              padding: 10px 12px !important;
            }
            .parking-table .ant-table-tbody > tr > td {
              padding: 10px 12px !important;
              border-bottom: 1px solid #F1F5F9 !important;
            }
            .parking-table .ant-table-tbody > tr:last-child > td { border-bottom: none !important; }
            .parking-table .ant-table-tbody > tr:hover > td { background: #F8FAFC !important; }
            .parking-table .row-urgent > td { background: rgba(220,38,38,0.03) !important; }
            .parking-table .row-urgent:hover > td { background: rgba(220,38,38,0.06) !important; }
            .parking-table .row-warn > td { background: rgba(217,119,6,0.02) !important; }
          `}</style>
          <Table
            className="parking-table"
            dataSource={records}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={records.length > 15 ? { pageSize: 15, size: 'small', showTotal: (t) => `${t} รายการ` } : false}
            rowClassName={rowClassName}
            locale={{ emptyText: <Empty description="ไม่มีรถในลานจอด" /> }}
          />
        </div>
      )}

      {/* ── Checkout Modal ── */}
      <Modal
        title="บันทึกเวลาออก" open={!!checkoutRecord}
        onOk={confirmCheckout} onCancel={() => setCheckoutRecord(null)}
        okText="ยืนยันออก" cancelText="ยกเลิก"
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
        title="แก้ไขข้อมูล" open={!!editRecord}
        onOk={confirmEdit} onCancel={() => setEditRecord(null)}
        okText="บันทึก" cancelText="ยกเลิก"
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
              <AutoComplete options={DESTINATIONS.map(d => ({ value: d }))}><Input /></AutoComplete>
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
