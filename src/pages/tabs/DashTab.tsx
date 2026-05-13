import { useMemo } from 'react';
import { Row, Col, Button, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Store, VEHICLE_TYPES, vehicleLabel, fmtDuration, exportCSV } from '../../lib/data';

interface Props { refreshKey: number }

function StatCard({
  value, label, sub, accent, highlight,
}: {
  value: string | number;
  label: string;
  sub?: string;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`stat-card${highlight ? ' stat-card-highlight' : ''}`}>
      <div style={{
        fontSize: 36, fontWeight: 800, lineHeight: 1.1, marginBottom: 6,
        fontFamily: "'JetBrains Mono', monospace",
        color: accent ?? '#E2E8F0',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#4B6280', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export function DashTab({ refreshKey }: Props) {
  const stats = useMemo(() => Store.todayStats(), [refreshKey]);
  const today = new Date().toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const maxType = Math.max(...VEHICLE_TYPES.map(t => stats.byType[t.value] ?? 0), 1);

  return (
    <div>
      {/* Date + export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ color: '#64748B', fontSize: 13 }}>{today}</span>
        <Tooltip title="Export ข้อมูลทั้งหมดเป็น CSV">
          <Button icon={<DownloadOutlined />} size="small" onClick={() => exportCSV(Store.all())}>
            Export ทั้งหมด
          </Button>
        </Tooltip>
      </div>

      {/* Stats grid */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <StatCard value={stats.total} label="รถเข้าทั้งหมด" sub="วันนี้" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            value={stats.active}
            label="กำลังจอดอยู่"
            sub="คันในลาน"
            accent="#38BDF8"
            highlight
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard value={stats.exited} label="ออกแล้ว" accent="#4ADE80" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            value={stats.avgDur > 0 ? fmtDuration(stats.avgDur) : '—'}
            label="เวลาจอดเฉลี่ย"
            sub="ต่อคัน"
          />
        </Col>
      </Row>

      {/* Vehicle type breakdown */}
      <div style={{
        background: '#111B2E', border: '1px solid #1E3552',
        borderRadius: 12, padding: '20px',
      }}>
        <div style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' }}>
          แยกตามประเภทรถ — วันนี้
        </div>
        {VEHICLE_TYPES.map(t => {
          const count = stats.byType[t.value] ?? 0;
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={t.value} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ color: '#CBD5E1', fontSize: 13 }}>{t.label}</span>
                <span style={{
                  color: '#38BDF8', fontWeight: 700, fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {count}
                </span>
              </div>
              <div style={{
                height: 6, background: '#0B1120', borderRadius: 3, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${(count / maxType) * 100}%`,
                  background: 'linear-gradient(90deg, #0EA5E9, #38BDF8)',
                  transition: 'width 0.6s ease',
                  minWidth: count > 0 ? 6 : 0,
                }} />
              </div>
              {pct > 0 && (
                <div style={{ color: '#4B6280', fontSize: 11, marginTop: 2, textAlign: 'right' }}>
                  {pct.toFixed(0)}%
                </div>
              )}
            </div>
          );
        })}

        {stats.total === 0 && (
          <div style={{ color: '#4B6280', textAlign: 'center', padding: '20px 0', fontSize: 13 }}>
            ยังไม่มีข้อมูลสำหรับวันนี้
          </div>
        )}
      </div>

      {/* Today's timeline summary */}
      {stats.total > 0 && (
        <div style={{
          marginTop: 16,
          background: '#111B2E', border: '1px solid #1E3552',
          borderRadius: 12, padding: '20px',
        }}>
          <div style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 14, textTransform: 'uppercase' }}>
            สัดส่วนสถานะ
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <div style={{ flex: stats.active, background: '#38BDF8', height: 12, borderRadius: 6, minWidth: 4, transition: 'flex 0.4s' }} />
            <div style={{ flex: stats.exited, background: '#4ADE80', height: 12, borderRadius: 6, minWidth: 4, transition: 'flex 0.4s' }} />
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#38BDF8' }} />
              <span style={{ color: '#64748B' }}>กำลังจอด ({stats.active})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#4ADE80' }} />
              <span style={{ color: '#64748B' }}>ออกแล้ว ({stats.exited})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
