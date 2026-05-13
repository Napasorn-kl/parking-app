import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import thTH from 'antd/locale/th_TH';
import { CheckinPage } from './pages/CheckinPage';
import { LoginPage } from './pages/LoginPage';
import { StaffLayout } from './pages/StaffLayout';

const FONT = "'IBM Plex Sans Thai', 'IBM Plex Sans', sans-serif";

const adminTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#38BDF8',
    colorBgBase: '#0B1120',
    colorBgContainer: '#111B2E',
    colorBgElevated: '#162340',
    colorBorder: '#1E3552',
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily: FONT,
    fontSize: 14,
  },
};

const visitorTheme = {
  token: {
    colorPrimary: '#0284C7',
    borderRadius: 10,
    borderRadiusLG: 14,
    fontFamily: FONT,
    fontSize: 15,
  },
};

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/checkin"
          element={
            <ConfigProvider theme={visitorTheme} locale={thTH}>
              <CheckinPage />
            </ConfigProvider>
          }
        />
        <Route
          path="/login"
          element={
            <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: adminTheme.token }} locale={thTH}>
              <LoginPage />
            </ConfigProvider>
          }
        />
        <Route
          path="/staff/*"
          element={
            <ConfigProvider theme={adminTheme} locale={thTH}>
              <StaffLayout />
            </ConfigProvider>
          }
        />
        <Route path="*" element={<Navigate to="/checkin" replace />} />
      </Routes>
    </HashRouter>
  );
}
