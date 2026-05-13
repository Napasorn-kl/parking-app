import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Drawer, Badge, Tooltip } from 'antd';
import {
  CarOutlined, SearchOutlined, BarChartOutlined,
  QrcodeOutlined, LogoutOutlined, MenuOutlined, CloseOutlined,
} from '@ant-design/icons';
import { Auth, Store } from '../lib/data';
import { ActiveTab } from './tabs/ActiveTab';
import { HistoryTab } from './tabs/HistoryTab';
import { DashTab } from './tabs/DashTab';
import { QRTab } from './tabs/QRTab';

type TabKey = 'active' | 'history' | 'dash' | 'qr';

const TAB_TITLES: Record<TabKey, string> = {
  active:  'รถที่กำลังจอด',
  history: 'ค้นหา / ประวัติ',
  dash:    'สรุปข้อมูล',
  qr:      'QR Code',
};

const SIDEBAR_W = 220;

export function StaffLayout() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('active');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [refreshKey, setRefreshKey] = useState(0);

  const user = Auth.get();
  const isAdmin = Auth.isAdmin();

  useEffect(() => {
    if (!Auth.isStaff()) { navigate('/login', { replace: true }); return; }
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [navigate]);

  const onRefresh = useCallback(() => setRefreshKey(k => k + 1), []);
  const activeCount = useMemo(() => Store.active().length, [refreshKey]);

  const handleLogout = () => { Auth.logout(); navigate('/login', { replace: true }); };
  const switchTab = (key: TabKey) => { setTab(key); setDrawerOpen(false); };

  const menuItems = [
    {
      key: 'active',
      icon: <CarOutlined />,
      label: (
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          กำลังจอด
          {activeCount > 0 && (
            <span style={{
              background: '#0EA5E9', color: '#fff', borderRadius: 10,
              padding: '0 7px', fontSize: 11, fontWeight: 700,
              minWidth: 20, textAlign: 'center', lineHeight: '20px',
            }}>
              {activeCount}
            </span>
          )}
        </span>
      ),
    },
    { key: 'history', icon: <SearchOutlined />, label: 'ค้นหา/ประวัติ' },
    ...(isAdmin ? [
      { key: 'dash', icon: <BarChartOutlined />, label: 'สรุปข้อมูล' },
      { key: 'qr',   icon: <QrcodeOutlined />,   label: 'QR Code' },
    ] : []),
  ];

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #0EA5E9, #38BDF8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(14,165,233,0.45)',
          }}>
            <CarOutlined style={{ color: '#fff', fontSize: 19 }} />
          </div>
          <div>
            <div style={{ color: '#0F172A', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
              ระบบจอดรถ
            </div>
            <div style={{ color: '#64748B', fontSize: 11 }}>Parking Management</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ flex: 1, paddingTop: 8 }}>
        <Menu
          mode="inline"
          selectedKeys={[tab]}
          items={menuItems}
          onClick={({ key }) => switchTab(key as TabKey)}
          style={{ background: 'transparent', border: 'none', fontSize: 14 }}
        />
      </div>

      {/* User / Logout */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Avatar
            size={34}
            style={{
              background: isAdmin
                ? 'linear-gradient(135deg, #0EA5E9, #38BDF8)'
                : 'linear-gradient(135deg, #10B981, #34D399)',
              flexShrink: 0,
              fontSize: 14, fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#1E293B', fontSize: 13, fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <span style={{
              display: 'inline-block', marginTop: 2,
              background: isAdmin ? 'rgba(2,132,199,0.12)' : 'rgba(22,163,74,0.12)',
              color: isAdmin ? '#0284C7' : '#16A34A',
              fontSize: 9, fontWeight: 700, padding: '1px 7px',
              borderRadius: 10, letterSpacing: '0.08em',
            }}>
              {isAdmin ? 'ADMIN' : 'STAFF'}
            </span>
          </div>
        </div>
        <Button
          icon={<LogoutOutlined />}
          block size="small"
          onClick={handleLogout}
          style={{
            background: 'transparent', borderColor: '#E2E8F0',
            color: '#64748B', borderRadius: 8,
          }}
        >
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Layout.Sider
          width={SIDEBAR_W}
          className="sidebar"
          style={{
            position: 'fixed', left: 0, top: 0, bottom: 0,
            height: '100vh', overflow: 'auto', zIndex: 200,
          }}
        >
          <SidebarContent />
        </Layout.Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          width={240}
          styles={{
            body: { background: '#FFFFFF', padding: 0 },
            header: { background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' },
          }}
          title={<span style={{ color: '#0F172A' }}>เมนู</span>}
          closeIcon={<CloseOutlined style={{ color: '#94A3B8' }} />}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* Main */}
      <Layout style={{ marginLeft: isMobile ? 0 : SIDEBAR_W }}>
        {/* Mobile top bar */}
        {isMobile && (
          <Layout.Header style={{
            background: '#FFFFFF', borderBottom: '1px solid #E2E8F0',
            padding: '0 16px', height: 56, lineHeight: '56px',
            position: 'sticky', top: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Button
                type="text"
                icon={<MenuOutlined style={{ color: '#64748B', fontSize: 18 }} />}
                onClick={() => setDrawerOpen(true)}
              />
              <span style={{ color: '#0F172A', fontWeight: 700, fontSize: 15 }}>ระบบจอดรถ</span>
            </div>
            <Tooltip title="ออกจากระบบ">
              <Button type="text" icon={<LogoutOutlined style={{ color: '#64748B' }} />} onClick={handleLogout} />
            </Tooltip>
          </Layout.Header>
        )}

        <Layout.Content
          className="admin-bg"
          style={{ minHeight: isMobile ? 'calc(100vh - 56px)' : '100vh', overflow: 'auto' }}
        >
          {/* Page header */}
          <div style={{
            padding: isMobile ? '16px 16px 0' : '22px 28px 0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 4,
          }}>
            <div>
              <h2 style={{ color: '#0F172A', margin: '0 0 2px', fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
                {TAB_TITLES[tab]}
              </h2>
              <div style={{ color: '#64748B', fontSize: 12 }}>
                {new Date().toLocaleDateString('th-TH', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </div>
            </div>

            {/* Live indicator */}
            {tab === 'active' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(2,132,199,0.07)', border: '1px solid rgba(2,132,199,0.18)',
                borderRadius: 8, padding: '6px 14px',
              }}>
                <span className="pulse-dot" />
                <span style={{ color: '#0284C7', fontSize: 13, fontWeight: 600 }}>
                  {activeCount} คันในลาน
                </span>
              </div>
            )}
          </div>

          {/* Tab content */}
          <div style={{ padding: isMobile ? '12px 16px 24px' : '16px 28px 32px' }}>
            {tab === 'active'  && <ActiveTab onRefresh={onRefresh} />}
            {tab === 'history' && <HistoryTab refreshKey={refreshKey} />}
            {tab === 'dash'    && <DashTab refreshKey={refreshKey} />}
            {tab === 'qr'      && <QRTab />}
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
