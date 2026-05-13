import { useState, useEffect, useRef } from 'react';
import { Input, Button, message, Tooltip } from 'antd';
import { DownloadOutlined, PrinterOutlined, ReloadOutlined } from '@ant-design/icons';
import QRCode from 'qrcode';

function getDefaultUrl(): string {
  const base = window.location.href.replace(/#.*$/, '');
  return base + '#/checkin';
}

export function QRTab() {
  const [url, setUrl] = useState(getDefaultUrl);
  const [dataUrl, setDataUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const generate = async (target: string) => {
    if (!target.trim()) return;
    setGenerating(true);
    try {
      const du = await QRCode.toDataURL(target.trim(), {
        width: 300,
        margin: 3,
        color: { dark: '#000000', light: '#FFFFFF' },
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

  const handlePrint = () => {
    if (!dataUrl) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>QR Code — ระบบจอดรถ</title>
<style>
  body { margin: 0; display: flex; flex-direction: column; align-items: center;
         justify-content: center; min-height: 100vh; font-family: sans-serif; }
  img { width: 280px; height: 280px; }
  h2 { margin: 16px 0 4px; font-size: 20px; color: #0F172A; }
  p  { margin: 0; color: #64748B; font-size: 13px; }
  .url { margin-top: 10px; font-size: 11px; color: #94A3B8; word-break: break-all; }
</style>
</head><body>
<img src="${dataUrl}" />
<h2>ระบบบันทึกที่จอดรถ</h2>
<p>สแกน QR Code เพื่อบันทึกรถเข้า</p>
<div class="url">${url}</div>
<script>window.onload = () => window.print();<\/script>
</body></html>`);
    w.document.close();
  };

  return (
    <div style={{ maxWidth: 520 }}>
      {/* URL Input */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 12, padding: '20px', marginBottom: 20,
      }}>
        <div style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10, textTransform: 'uppercase' }}>
          URL หน้าบันทึกรถเข้า (สำหรับ QR Code)
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            ref={inputRef as React.Ref<HTMLInputElement>}
            value={url}
            onChange={e => setUrl(e.target.value)}
            onPressEnter={() => generate(url)}
            placeholder="https://example.com/#/checkin"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
          />
          <Tooltip title="สร้าง QR ใหม่">
            <Button icon={<ReloadOutlined />} loading={generating} onClick={() => generate(url)} />
          </Tooltip>
        </div>
        <div style={{ color: '#94A3B8', fontSize: 11, marginTop: 8 }}>
          URL นี้จะถูกฝังใน QR Code เมื่อผู้มาติดต่อสแกนจะถูกส่งไปยังหน้าบันทึกรถเข้า
        </div>
      </div>

      {/* QR Display */}
      {dataUrl && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 12, padding: '28px 24px', textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block', padding: 16,
            background: '#FFFFFF', borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            marginBottom: 20,
          }}>
            <img src={dataUrl} alt="QR Code" style={{ width: 260, height: 260, display: 'block' }} />
          </div>

          <div style={{ color: '#64748B', fontSize: 13, marginBottom: 20 }}>
            สแกนเพื่อบันทึกรถเข้า
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Button
              type="primary" icon={<DownloadOutlined />}
              onClick={handleDownload}
              style={{ minWidth: 160 }}
            >
              ดาวน์โหลด PNG
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              พิมพ์
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: 16, background: 'rgba(2,132,199,0.06)',
        border: '1px solid rgba(2,132,199,0.15)',
        borderRadius: 10, padding: '14px 16px',
        fontSize: 13, color: '#64748B', lineHeight: 1.7,
      }}>
        <div style={{ color: '#0284C7', fontWeight: 600, marginBottom: 6 }}>วิธีใช้งาน</div>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li>ดาวน์โหลดหรือพิมพ์ QR Code ด้านบน</li>
          <li>ติดไว้ที่จุดเข้าที่จอดรถหรือส่งให้ผู้มาติดต่อ</li>
          <li>ผู้ใช้สแกน QR เพื่อเปิดหน้ากรอกข้อมูลรถเข้า</li>
        </ol>
      </div>
    </div>
  );
}
