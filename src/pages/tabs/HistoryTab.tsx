import { useState, useMemo } from 'react';
import {
  Input, Select, Button, Table, DatePicker, Space, Tag,
  Tooltip, Typography,
} from 'antd';
import { SearchOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  Store, Auth, vehicleLabel, fmtDateTime, fmtDuration, exportCSV,
} from '../../lib/data';
import type { ParkingRecord, RecordStatus } from '../../lib/data';
import { PlateTag } from '../../components/PlateTag';
import { StatusBadge } from '../../components/StatusBadge';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'parking', label: 'กำลังจอด' },
  { value: 'exited', label: 'ออกแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
];

interface Props { refreshKey: number }

export function HistoryTab({ refreshKey }: Props) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const filtered = useMemo(() => {
    let records = Store.all();
    const q = query.trim().toLowerCase();

    if (q) {
      records = records.filter(r =>
        r.plate.toLowerCase().includes(q) ||
        r.driverName.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        r.purpose.toLowerCase().includes(q)
      );
    }
    if (status) {
      records = records.filter(r => r.status === status);
    }
    if (dateRange?.[0] && dateRange?.[1]) {
      const from = dateRange[0].format('YYYY-MM-DD');
      const to   = dateRange[1].format('YYYY-MM-DD');
      records = records.filter(r => r.date >= from && r.date <= to);
    }
    return [...records].sort(
      (a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
    );
  }, [query, status, dateRange, refreshKey]);

  const columns: ColumnsType<ParkingRecord> = [
    {
      title: 'ทะเบียน',
      key: 'plate',
      width: 130,
      fixed: 'left',
      render: (_: unknown, r: ParkingRecord) => (
        <PlateTag plate={r.plate} province={r.province} size="sm" />
      ),
    },
    {
      title: 'ชื่อผู้ขับ',
      dataIndex: 'driverName',
      key: 'driverName',
      width: 140,
      ellipsis: true,
    },
    {
      title: 'ประเภท',
      key: 'vehicleType',
      width: 130,
      render: (_: unknown, r: ParkingRecord) => vehicleLabel(r.vehicleType),
    },
    {
      title: 'สถานที่ติดต่อ',
      dataIndex: 'destination',
      key: 'destination',
      width: 140,
      ellipsis: true,
    },
    {
      title: 'เวลาเข้า',
      key: 'entryTime',
      width: 150,
      render: (_: unknown, r: ParkingRecord) => (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
          {fmtDateTime(r.entryTime)}
        </span>
      ),
      sorter: (a: ParkingRecord, b: ParkingRecord) =>
        new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'เวลาออก',
      key: 'exitTime',
      width: 150,
      render: (_: unknown, r: ParkingRecord) =>
        r.exitTime ? (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
            {fmtDateTime(r.exitTime)}
          </span>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'ระยะเวลา',
      key: 'duration',
      width: 110,
      render: (_: unknown, r: ParkingRecord) =>
        r.duration ? (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
            {fmtDuration(r.duration)}
          </span>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'สถานะ',
      key: 'status',
      width: 110,
      render: (_: unknown, r: ParkingRecord) => <StatusBadge status={r.status as RecordStatus} />,
      filters: [
        { text: 'กำลังจอด', value: 'parking' },
        { text: 'ออกแล้ว', value: 'exited' },
        { text: 'ยกเลิก', value: 'cancelled' },
      ],
      onFilter: (value: unknown, record: ParkingRecord) => record.status === value,
    },
  ];

  return (
    <div>
      {/* Filters */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 10, padding: '14px 16px', marginBottom: 16,
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end',
      }}>
        <div style={{ flex: '1 1 200px', minWidth: 180 }}>
          <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>
            <FilterOutlined style={{ marginRight: 4 }} />ค้นหา
          </div>
          <Input
            prefix={<SearchOutlined style={{ color: '#4B6280' }} />}
            placeholder="ทะเบียน / ชื่อ / สถานที่"
            value={query}
            onChange={e => setQuery(e.target.value)}
            allowClear
          />
        </div>
        <div style={{ flex: '0 1 180px', minWidth: 160 }}>
          <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>วันที่</div>
          <RangePicker
            style={{ width: '100%' }}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
            placeholder={['เริ่มต้น', 'สิ้นสุด']}
          />
        </div>
        <div style={{ flex: '0 1 140px', minWidth: 120 }}>
          <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>สถานะ</div>
          <Select
            value={status}
            onChange={setStatus}
            style={{ width: '100%' }}
            options={STATUS_OPTIONS}
          />
        </div>
        {Auth.isAdmin() && (
          <Tooltip title="Export ข้อมูลที่แสดงอยู่เป็น CSV">
            <Button icon={<DownloadOutlined />} onClick={() => exportCSV(filtered)}>
              Export CSV
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Result count */}
      <div style={{ color: '#4B6280', fontSize: 13, marginBottom: 10 }}>
        พบ <span style={{ color: '#0284C7', fontWeight: 600 }}>{filtered.length}</span> รายการ
      </div>

      {/* Table */}
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        size="small"
        scroll={{ x: 900 }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total: number) => `ทั้งหมด ${total} รายการ`,
        }}
        style={{ borderRadius: 10, overflow: 'hidden' }}
      />
    </div>
  );
}
