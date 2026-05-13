import { useState, useEffect } from 'react';
import { Input, Button, message, Tooltip, Row, Col } from 'antd';
import {
  DownloadOutlined, PrinterOutlined, ReloadOutlined,
  CopyOutlined, QrcodeOutlined, CarOutlined, CheckOutlined,
} from '@ant-design/icons';
import QRCode from 'qrcode';

function getDefaultUrl(): string {
  const base = window.location.href.replace(/#.*$/, '');
  return base + '#/checkin';
}

export function QRTab() {
  const [url, setUrl]           = useState(getDefaultUrl);
  const [dataUrl, setDataUrl]   = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied]     = useState(false);

  const generate = async (target: string) => {
    if (!target.trim()) return;
    setGenerating(true);
    try {
      const du = await QRCode.toDataURL(target.trim(), {
        width: 320,
        margin: 2,
        color: { dark: '#0F172A', light: '#FFFFFF' },
        errorCorrectionLevel: 'M',
      });
      setDataUrl(du);
    } catch {
      message.error('ไม่สามารถสร้าง QR Code ได้');
    }
    setGenerating(false);
  };

  useEffect(() => { generate(url); }, []);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'parking-qr.png';
    a.click();
    message.success('ดาวน์โหลด QR Code สำเร็จ');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error('ไม่สามารถคัดลอกได้');
    }
  };

  const handlePrint = () => {
    if (!dataUrl) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>QR Code — ระบบจอดรถ</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { display: flex; align-items: center; justify-content: center;
         min-height: 100vh; background: #F8FAFC; font-family: 'IBM Plex Sans', sans-serif; }
  .card { background: #fff; border-radius: 16px; overflow: hidden;
          width: 320px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
  .header { background: linear-gradient(135deg, #1D4ED8, #2563EB);
            padding: 20px 24px 16px; text-align: center; }
  .header-icon { font-size: 28px; margin-bottom: 8px; }
  .header h1 { color: #fff; font-size: 18px; font-weight: 700; margin-bottom: 4px; }
  .header p  { color: rgba(255,255,255,0.75); font-size: 12px; }
  .qr-area   { padding: 24px; text-align: center; background: #fff; }
  .qr-area img { width: 220px; height: 220px; border-radius: 8px; }
  .label     { padding: 0 24px 20px; text-align: center; }
  .label h2  { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 6px; }
  .label p   { font-size: 11px; color: #64748B; line-height: 1.5; }
  .footer    { background: #F8FAFC; border-top: 1px solid #E2E8F0;
               padding: 10px 16px; font-size: 10px; color: #94A3B8;
               text-align: center; word-break: break-all; }
</style>
</head><body>
<div class="card">
  <div class="header">
    <div class="header-icon">🚗</div>
    <h1>ระบบบันทึกที่จอดรถ</h1>
    <p>Parking Management System</p>
  </div>
  <div class="qr-area">
    <img src="${dataUrl}" alt="QR Code" />
  </div>
  <div class="label">
    <h2>สแกนเพื่อบันทึกรถเข้า</h2>
    <p>ใช้กล้องมือถือสแกน QR Code<br>เพื่อเปิดหน้ากรอกข้อมูลรถเข้า</p>
  </div>
  <div class="footer">${url}</div>
</div>
<script>window.onload = () => window.print();<\/script>
</body></html>`);
    w.document.close();
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <Row gutter={[20, 20]} align="top">

        {/* ── Left: QR Poster preview ── */}
        <Col xs={24} md={11}>
          <div style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            {/* Poster header */}
            <div style={{
              background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
              padding: '22px 24px 18px', textAlign: 'center',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <CarOutlined style={{ color: '#fff', fontSize: 24 }} />
              </div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
                ระบบบันทึกที่จอดรถ
              </div>
              <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12 }}>
                Parking Management System
              </div>
            </div>

            {/* QR code area */}
            <div style={{ padding: '28px 24px 20px', textAlign: 'center', background: '#fff' }}>
              {dataUrl ? (
                <div style={{
                  display: 'inline-block',
                  padding: 12, borderRadius: 12,
                  background: '#fff',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
                }}>
                  <img src={dataUrl} alt="QR Code" style={{ width: 200, height: 200, display: 'block', borderRadius: 4 }} />
                </div>
              ) : (
                <div style={{
                  width: 224, height: 224, borderRadius: 12,
                  background: '#F8FAFC', border: '2px dashed #CBD5E1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  <QrcodeOutlined style={{ fontSize: 48, color: '#CBD5E1' }} />
                </div>
              )}

              <div style={{ marginTop: 18, marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                  สแกนเพื่อบันทึกรถเข้า
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 5, lineHeight: 1.6 }}>
                  ใช้กล้องมือถือสแกน QR Code<br />เพื่อเปิดหน้ากรอกข้อมูลรถเข้า
                </div>
              </div>
            </div>

            {/* URL strip */}
            <div style={{
              background: '#F8FAFC', borderTop: '1px solid #E2E8F0',
              padding: '10px 20px', textAlign: 'center',
            }}>
              <div style={{
                fontSize: 10, color: '#94A3B8',
                fontFamily: "'JetBrains Mono', monospace",
                wordBreak: 'break-all', lineHeight: 1.5,
              }}>
                {url}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{
              padding: '16px 20px', borderTop: '1px solid #F1F5F9',
              display: 'flex', gap: 10,
            }}>
              <Button
                type="primary" icon={<DownloadOutlined />}
                onClick={handleDownload}
                disabled={!dataUrl}
                style={{ flex: 1, borderRadius: 8 }}
              >
                ดาวน์โหลด PNG
              </Button>
              <Tooltip title="พิมพ์ QR Card">
                <Button
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                  disabled={!dataUrl}
                  style={{ borderRadius: 8, minWidth: 48 }}
                />
              </Tooltip>
            </div>
          </div>
        </Col>

        {/* ── Right: Settings + Instructions ── */}
        <Col xs={24} md={13}>
          {/* URL Config */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 12, padding: '20px', marginBottom: 16,
          }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#0F172A',
              marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 4, height: 16, borderRadius: 2,
                background: 'linear-gradient(180deg, #0EA5E9, #0284C7)',
                flexShrink: 0,
              }} />
              URL หน้าบันทึกรถเข้า
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onPressEnter={() => generate(url)}
                placeholder="https://example.com/#/checkin"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, flex: 1 }}
              />
              <Tooltip title="สร้าง QR ใหม่">
                <Button icon={<ReloadOutlined />} loading={generating} onClick={() => generate(url)} />
              </Tooltip>
              <Tooltip title={copied ? 'คัดลอกแล้ว!' : 'คัดลอก URL'}>
                <Button
                  icon={copied ? <CheckOutlined style={{ color: '#16A34A' }} /> : <CopyOutlined />}
                  onClick={handleCopy}
                />
              </Tooltip>
            </div>

            <div style={{
              fontSize: 11, color: '#94A3B8', lineHeight: 1.6,
              padding: '8px 10px', background: '#F8FAFC',
              borderRadius: 7, border: '1px solid #F1F5F9',
            }}>
              URL นี้จะถูกฝังใน QR Code — เมื่อผู้มาติดต่อสแกนจะเปิดหน้าบันทึกรถเข้าโดยตรง
            </div>
          </div>

          {/* Instructions */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 12, padding: '20px', marginBottom: 16,
          }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#0F172A',
              marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 4, height: 16, borderRadius: 2,
                background: 'linear-gradient(180deg, #7C3AED, #A855F7)',
                flexShrink: 0,
              }} />
              วิธีใช้งาน
            </div>
            {[
              { step: '1', text: 'ดาวน์โหลดหรือพิมพ์ QR Card ด้านซ้าย', color: '#0284C7' },
              { step: '2', text: 'ติดไว้ที่จุดเข้าที่จอดรถหรือส่งให้ผู้มาติดต่อล่วงหน้า', color: '#7C3AED' },
              { step: '3', text: 'ผู้มาสแกน QR เพื่อเปิดฟอร์มกรอกข้อมูลรถเข้า', color: '#16A34A' },
              { step: '4', text: 'ข้อมูลจะถูกบันทึกและแสดงในหน้ากำลังจอดทันที', color: '#D97706' },
            ].map(({ step, text, color }) => (
              <div key={step} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                marginBottom: 12, padding: '10px 12px',
                background: '#F8FAFC', borderRadius: 8,
                border: '1px solid #F1F5F9',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: color, color: '#fff',
                  fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  {step}
                </div>
                <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div style={{
            background: 'rgba(2,132,199,0.05)', border: '1px solid rgba(2,132,199,0.15)',
            borderRadius: 10, padding: '12px 14px',
            fontSize: 12, color: '#475569', lineHeight: 1.7,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>💡</span>
            <span>
              หากระบบ deploy บน server จริง URL จะเปลี่ยนเป็น domain ของคุณโดยอัตโนมัติ
              สามารถแก้ไข URL ด้านบนก่อนพิมพ์ได้
            </span>
          </div>
        </Col>
      </Row>
    </div>
  );
}
