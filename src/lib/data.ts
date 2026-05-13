// ── Types ──────────────────────────────────────────────────────────────
export type VehicleType = 'car' | 'motorcycle' | 'van' | 'truck' | 'other';
export type RecordStatus = 'parking' | 'exited' | 'cancelled';
export type UserRole = 'staff' | 'admin';

export interface ParkingRecord {
  id: string;
  date: string;
  driverName: string;
  phone: string;
  vehicleType: VehicleType;
  plate: string;
  province: string;
  destination: string;
  purpose: string;
  entryTime: string;
  exitTime?: string;
  duration?: number;
  status: RecordStatus;
  recordedBy: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
}

// ── Constants ──────────────────────────────────────────────────────────
export const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'car',        label: 'รถยนต์ส่วนบุคคล' },
  { value: 'motorcycle', label: 'รถจักรยานยนต์' },
  { value: 'van',        label: 'รถตู้' },
  { value: 'truck',      label: 'รถส่งของ/บรรทุก' },
  { value: 'other',      label: 'อื่นๆ' },
];

export const DESTINATIONS = [
  'ฝ่ายบุคคล', 'ฝ่ายการเงิน', 'ฝ่ายขาย', 'ฝ่ายเทคนิค', 'ฝ่ายบัญชี',
  'สำนักงานใหญ่', 'ห้องประชุม', 'คลังสินค้า', 'ฝ่ายบริหาร', 'อื่นๆ',
];

export const PROVINCES = [
  'กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร',
  'ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท','ชัยภูมิ',
  'ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก',
  'นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์',
  'นนทบุรี','นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี',
  'ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา',
  'พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์',
  'แพร่','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร',
  'ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี','ลพบุรี','ลำปาง',
  'ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล','สมุทรปราการ',
  'สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี',
  'สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย',
  'หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี','อุตรดิตถ์',
  'อุทัยธานี','อุบลราชธานี',
];

// ── Storage ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'parking_records_v3';
const AUTH_KEY = 'parking_user_v3';

export const Store = {
  all(): ParkingRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },
  save(records: ParkingRecord[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  },
  add(record: ParkingRecord) {
    const records = this.all();
    records.push(record);
    this.save(records);
  },
  update(id: string, patch: Partial<ParkingRecord>) {
    const records = this.all().map(r => r.id === id ? { ...r, ...patch } : r);
    this.save(records);
  },
  byId(id: string): ParkingRecord | undefined {
    return this.all().find(r => r.id === id);
  },
  active(): ParkingRecord[] {
    return this.all()
      .filter(r => r.status === 'parking')
      .sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());
  },
  findActivePlate(plate: string): ParkingRecord | undefined {
    return this.active().find(r => r.plate.toUpperCase() === plate.toUpperCase());
  },
  todayStats() {
    const today = new Date().toISOString().slice(0, 10);
    const records = this.all().filter(r => r.date === today);
    const active = records.filter(r => r.status === 'parking');
    const exited = records.filter(r => r.status === 'exited');
    const durations = exited.map(r => r.duration ?? 0).filter(d => d > 0);
    const avgDur = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    const byType: Record<string, number> = {};
    records.forEach(r => { byType[r.vehicleType] = (byType[r.vehicleType] ?? 0) + 1; });
    return { total: records.length, active: active.length, exited: exited.length, avgDur, byType };
  },
};

// ── Auth ────────────────────────────────────────────────────────────────
const ACCOUNTS = [
  { id: 's1', username: 'staff', password: 'staff123', name: 'เจ้าหน้าที่', role: 'staff' as UserRole },
  { id: 'a1', username: 'admin', password: 'admin123', name: 'ผู้ดูแลระบบ', role: 'admin' as UserRole },
];

export const Auth = {
  login(username: string, password: string): AppUser | null {
    const acc = ACCOUNTS.find(a => a.username === username && a.password === password);
    if (!acc) return null;
    const user: AppUser = { id: acc.id, name: acc.name, role: acc.role };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  },
  logout() { sessionStorage.removeItem(AUTH_KEY); },
  get(): AppUser | null {
    try {
      const raw = sessionStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  isStaff(): boolean {
    const u = this.get();
    return u?.role === 'staff' || u?.role === 'admin';
  },
  isAdmin(): boolean { return this.get()?.role === 'admin'; },
};

// ── Utils ───────────────────────────────────────────────────────────────
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

export function fmtDateTime(iso: string): string {
  return `${fmtDate(iso)} ${fmtTime(iso)}`;
}

export function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} นาที`;
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return m > 0 ? `${h} ชม. ${m} นาที` : `${h} ชม.`;
}

export function calcDuration(entry: string, exit: string): number {
  return Math.max(1, Math.round((new Date(exit).getTime() - new Date(entry).getTime()) / 60000));
}

export function elapsedMinutes(entryTime: string, now = Date.now()): number {
  return Math.floor((now - new Date(entryTime).getTime()) / 60000);
}

export function vehicleLabel(v: VehicleType): string {
  return VEHICLE_TYPES.find(t => t.value === v)?.label ?? v;
}

export function exportCSV(records: ParkingRecord[]) {
  const header = [
    'ID','วันที่','ชื่อผู้ขับ','เบอร์โทร','ประเภทรถ','ทะเบียน',
    'จังหวัด','สถานที่ติดต่อ','วัตถุประสงค์','เวลาเข้า','เวลาออก',
    'ระยะเวลา(นาที)','สถานะ',
  ];
  const rows = records.map(r => [
    r.id, r.date, r.driverName, r.phone,
    vehicleLabel(r.vehicleType), r.plate, r.province,
    r.destination, r.purpose,
    r.entryTime ? fmtDateTime(r.entryTime) : '',
    r.exitTime  ? fmtDateTime(r.exitTime)  : '',
    r.duration ?? '',
    r.status === 'parking' ? 'กำลังจอด' : r.status === 'exited' ? 'ออกแล้ว' : 'ยกเลิก',
  ]);
  const csv = '﻿' + [header, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `parking-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
