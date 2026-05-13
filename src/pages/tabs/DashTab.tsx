import { useMemo } from 'react';
import { Row, Col, Button, Tooltip } from 'antd';
import {
  DownloadOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { Store, VEHICLE_TYPES, fmtDuration, exportCSV } from '../../lib/data';

interface Props { refreshKey: number }

/* ── KPI Card ──────────────────────────────────────────────────────────── */
function KpiCard({
  icon, iconBg, value, label, sub, borderColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: React.ReactNode;
  label: string;
  sub?: string;
  borderColor: string;
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderTop: `3px solid ${borderColor}`,
      borderRadius: 12,
      padding: '18px 20px 16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
      <div style={{
        fontSize: 30, fontWeight: 800, lineHeight: 1.1,
        fontFamily: "'JetBrains Mono', monospace",
        color: '#0F172A', marginBottom: 4,
        wordBreak: 'break-word',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: '#475569', fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

/* ── Vehicle Bar ─────────────────────────────────────────────────────── */
function VehicleBar({ label, count, pct, maxPct }: { label: string; count: number; pct: number; maxPct: number }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#1E293B', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {pct > 0 && (
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{pct.toFixed(0)}%</span>
          )}
          <span style={{
            minWidth: 24, textAlign: 'right',
            color: count > 0 ? '#0284C7' : '#CBD5E1',
            fontWeight: 700, fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {count}
          </span>
        </div>
      </div>
      <div style={{ height: 7, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4,
          width: maxPct > 0 ? `${(count / maxPct) * 100}%` : '0%',
          background: count > 0
            ? 'linear-gradient(90deg, #0EA5E9 0%, #0284C7 100%)'
            : 'transparent',
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          minWidth: count > 0 ? 7 : 0,
        }} />
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────── */
export function DashTab({ refreshKey }: Props) {
  const stats = useMemo(() => Store.todayStats(), [refreshKey]);
  const today = new Date().toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const maxCount = Math.max(...VEHICLE_TYPES.map(t => stats.byType[t.value] ?? 0), 1);
  const activePct = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
  const exitedPct = stats.total > 0 ? Math.round((stats.exited / stats.total) * 100) : 0;

  // Format average duration compactly
  const avgLabel = stats.avgDur > 0 ? fmtDuration(stats.avgDur) : '—';

  return (
    <div>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>สรุปวันนี้</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{today}</div>
        </div>
        <Tooltip title="Export ข้อมูลทั้งหมดเป็น CSV">
          <Button
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => exportCSV(Store.all())}
            style={{ borderRadius: 8 }}
          >
            Export ทั้งหมด
          </Button>
        </Tooltip>
      </div>

      {/* ── KPI Cards ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            icon={<CarOutlined style={{ fontSize: 16, color: '#0284C7' }} />}
            iconBg="rgba(2,132,199,0.1)"
            value={stats.total}
            label="รถเข้าทั้งหมด"
            sub="วันนี้"
            borderColor="#0284C7"
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            icon={
              <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CarOutlined style={{ fontSize: 16, color: '#7C3AED' }} />
              </span>
            }
            iconBg="rgba(124,58,237,0.1)"
            value={
              <span style={{ color: '#7C3AED' }}>
                {stats.active}
              </span>
            }
            label="กำลังจอดอยู่"
            sub="คันในลาน"
            borderColor="#7C3AED"
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            icon={<CheckCircleOutlined style={{ fontSize: 16, color: '#16A34A' }} />}
            iconBg="rgba(22,163,74,0.1)"
            value={<span style={{ color: '#16A34A' }}>{stats.exited}</span>}
            label="ออกแล้ว"
            sub="วันนี้"
            borderColor="#16A34A"
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            icon={<FieldTimeOutlined style={{ fontSize: 16, color: '#D97706' }} />}
            iconBg="rgba(217,119,6,0.1)"
            value={
              <span style={{
                fontSize: avgLabel.length > 8 ? 18 : 30,
                color: '#D97706',
                lineHeight: 1.2,
                display: 'block',
              }}>
                {avgLabel}
              </span>
            }
            label="เวลาจอดเฉลี่ย"
            sub="ต่อคัน"
            borderColor="#D97706"
          />
        </Col>
      </Row>

      {/* ── Bottom row: vehicle breakdown + status ── */}
      <Row gutter={[12, 12]}>
        {/* Vehicle type breakdown */}
        <Col xs={24} md={14}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '20px',
            height: '100%',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18,
            }}>
              <div style={{
                width: 4, height: 16, borderRadius: 2,
                background: 'linear-gradient(180deg, #0EA5E9, #0284C7)',
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                แยกตามประเภทรถ — วันนี้
              </span>
            </div>

            {VEHICLE_TYPES.map(t => {
              const count = stats.byType[t.value] ?? 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <VehicleBar
                  key={t.value}
                  label={t.label}
                  count={count}
                  pct={pct}
                  maxPct={maxCount}
                />
              );
            })}

            {stats.total === 0 && (
              <div style={{
                color: '#CBD5E1', textAlign: 'center',
                padding: '28px 0', fontSize: 13,
              }}>
                <CarOutlined style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
                ยังไม่มีข้อมูลสำหรับวันนี้
              </div>
            )}
          </div>
        </Col>

        {/* Status summary */}
        <Col xs={24} md={10}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '20px',
            height: '100%',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18,
            }}>
              <div style={{
                width: 4, height: 16, borderRadius: 2,
                background: 'linear-gradient(180deg, #7C3AED, #16A34A)',
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                สัดส่วนสถานะ
              </span>
            </div>

            {stats.total > 0 ? (
              <>
                {/* Stacked bar */}
                <div style={{
                  display: 'flex', height: 14, borderRadius: 7,
                  overflow: 'hidden', marginBottom: 16, gap: 2,
                }}>
                  {stats.active > 0 && (
                    <div style={{
                      flex: stats.active,
                      background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
                      borderRadius: '7px 0 0 7px',
                      transition: 'flex 0.4s ease',
                    }} />
                  )}
                  {stats.exited > 0 && (
                    <div style={{
                      flex: stats.exited,
                      background: 'linear-gradient(90deg, #16A34A, #22C55E)',
                      borderRadius: stats.active > 0 ? '0 7px 7px 0' : 7,
                      transition: 'flex 0.4s ease',
                    }} />
                  )}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(124,58,237,0.05)',
                    border: '1px solid rgba(124,58,237,0.12)',
                    borderRadius: 8, padding: '8px 12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: '#7C3AED', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#475569' }}>กำลังจอด</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700, fontSize: 18, color: '#7C3AED',
                      }}>{stats.active}</span>
                      <span style={{
                        fontSize: 11, color: '#94A3B8',
                        background: '#F1F5F9', borderRadius: 4,
                        padding: '1px 5px',
                      }}>{activePct}%</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(22,163,74,0.05)',
                    border: '1px solid rgba(22,163,74,0.12)',
                    borderRadius: 8, padding: '8px 12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: '#16A34A', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#475569' }}>ออกแล้ว</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700, fontSize: 18, color: '#16A34A',
                      }}>{stats.exited}</span>
                      <span style={{
                        fontSize: 11, color: '#94A3B8',
                        background: '#F1F5F9', borderRadius: 4,
                        padding: '1px 5px',
                      }}>{exitedPct}%</span>
                    </div>
                  </div>
                </div>

                {/* Summary line */}
                <div style={{
                  marginTop: 14, paddingTop: 14,
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <ClockCircleOutlined style={{ color: '#94A3B8', fontSize: 12 }} />
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>
                    รวม {stats.total} คัน — อัตราออก {exitedPct}%
                  </span>
                </div>
              </>
            ) : (
              <div style={{
                color: '#CBD5E1', textAlign: 'center',
                padding: '28px 0', fontSize: 13,
              }}>
                <ClockCircleOutlined style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
                ยังไม่มีรถเข้าวันนี้
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
