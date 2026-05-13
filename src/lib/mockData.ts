import { Store, genId } from './data';
import type { ParkingRecord } from './data';

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString();
}
function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
function yesterday(): string {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

const MOCK: ParkingRecord[] = [
  // Active records
  {
    id: genId(), date: todayDate(),
    driverName: 'สมชาย ใจดี', phone: '081-234-5678',
    vehicleType: 'car', plate: 'กข-1234', province: 'กรุงเทพมหานคร',
    destination: 'ฝ่ายบุคคล', purpose: 'สัมภาษณ์งาน',
    entryTime: hoursAgo(1.6), status: 'parking', recordedBy: 'visitor',
  },
  {
    id: genId(), date: todayDate(),
    driverName: 'วิไล รักษ์ดี', phone: '089-876-5432',
    vehicleType: 'motorcycle', plate: 'ขค-5678', province: 'นนทบุรี',
    destination: 'ฝ่ายการเงิน', purpose: 'ชำระเงิน',
    entryTime: hoursAgo(0.9), status: 'parking', recordedBy: 'visitor',
  },
  {
    id: genId(), date: todayDate(),
    driverName: 'อารีย์ สมบัติ', phone: '',
    vehicleType: 'car', plate: 'กง-3456', province: 'สมุทรปราการ',
    destination: 'ฝ่ายขาย', purpose: 'ประชุม',
    entryTime: hoursAgo(2.4), status: 'parking', recordedBy: 'visitor',
  },
  {
    id: genId(), date: todayDate(),
    driverName: 'ธนกร พงษ์ศิริ', phone: '092-111-2233',
    vehicleType: 'van', plate: 'บต-7890', province: 'ปทุมธานี',
    destination: 'คลังสินค้า', purpose: 'รับสินค้า',
    entryTime: hoursAgo(4.2), status: 'parking', recordedBy: 'staff1',
  },
  // Exited records today
  {
    id: genId(), date: todayDate(),
    driverName: 'มณี แสงทอง', phone: '083-555-7777',
    vehicleType: 'car', plate: 'จด-1111', province: 'ชลบุรี',
    destination: 'สำนักงานใหญ่', purpose: 'ติดต่อธุรกิจ',
    entryTime: hoursAgo(5), exitTime: hoursAgo(3), duration: 120,
    status: 'exited', recordedBy: 'visitor',
  },
  {
    id: genId(), date: todayDate(),
    driverName: 'ประสิทธิ์ ดวงดี', phone: '',
    vehicleType: 'truck', plate: 'พร-2222', province: 'นครราชสีมา',
    destination: 'คลังสินค้า', purpose: 'ส่งสินค้า',
    entryTime: hoursAgo(6), exitTime: hoursAgo(4.5), duration: 90,
    status: 'exited', recordedBy: 'staff1',
  },
  // Yesterday
  {
    id: genId(), date: yesterday(),
    driverName: 'สุดา วงศ์ไพร', phone: '086-333-4444',
    vehicleType: 'car', plate: 'กข-9999', province: 'กรุงเทพมหานคร',
    destination: 'ฝ่ายบุคคล', purpose: 'ส่งเอกสาร',
    entryTime: new Date(Date.now() - 25 * 3600000).toISOString(),
    exitTime: new Date(Date.now() - 24 * 3600000).toISOString(),
    duration: 60, status: 'exited', recordedBy: 'visitor',
  },
  {
    id: genId(), date: yesterday(),
    driverName: 'ชาญวิทย์ เกียรติมงคล', phone: '094-666-8888',
    vehicleType: 'car', plate: 'ชม-5555', province: 'เชียงใหม่',
    destination: 'ห้องประชุม', purpose: 'ประชุมกรรมการ',
    entryTime: new Date(Date.now() - 26 * 3600000).toISOString(),
    exitTime: new Date(Date.now() - 22 * 3600000).toISOString(),
    duration: 240, status: 'exited', recordedBy: 'visitor',
  },
];

export function seedIfEmpty() {
  if (Store.all().length === 0) {
    Store.save(MOCK);
  }
}
