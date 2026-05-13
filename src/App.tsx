import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import thTH from 'antd/locale/th_TH';
import { CheckinPage } from './pages/CheckinPage';
import { LoginPage } from './pages/LoginPage';
import { StaffLayout } from './pages/StaffLayout';

const FONT = "'IBM Plex Sans Thai', 'IBM Plex Sans', sans-serif";

const appTheme = {
  token: {
    colorPrimary: '#0284C7',
    colorBgBase: '#F8FAFC',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBorder: '#E2E8F0',
    colorText: '#0F172A',
    colorTextSecondary: '#64748B',
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily: FONT,
    fontSize: 14,
  },
};

export default function App() {
  return (
    <ConfigProvider theme={appTheme} locale={thTH}>
      <HashRouter>
        <Routes>
          <Route path="/checkin" element={<CheckinPage />} />
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/staff/*" element={<StaffLayout />} />
          <Route path="*" element={<Navigate to="/checkin" replace />} />
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
}
