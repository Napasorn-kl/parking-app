import type { RecordStatus } from '../lib/data';

const CONFIG: Record<RecordStatus, { label: string; dot?: boolean }> = {
  parking:   { label: 'กำลังจอด', dot: true },
  exited:    { label: 'ออกแล้ว' },
  cancelled: { label: 'ยกเลิก' },
};

export function StatusBadge({ status }: { status: RecordStatus }) {
  const cfg = CONFIG[status];
  return (
    <span className={`status-badge ${status}`}>
      {cfg.dot && <span className="pulse-dot" />}
      {cfg.label}
    </span>
  );
}
