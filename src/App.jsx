import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Import semua halaman
import Dashboard from "./pages/Dashboard";
import Tegangan from "./pages/Tegangan";
import Arus_air from "./pages/Arus_air";
import Monitoring_Tegangan from "./pages/Monitor_Tegangan";
import Control from "./pages/Control";
import Air from "./pages/MonitorAir";
import LoginPage from "./pages/LoginPage";
import Profil from "./pages/Profil";
import Perangkat from "./pages/Perangkat";
import Pengaturan from "./pages/Pengaturan";
import TambahPerangkat from "./pages/crud_perangkat/tambah_perangkat";
import EditDevice from "./pages/crud_perangkat/edit_perangkat";
import DetailPerangkat from "@/pages/crud_perangkat/detail_perangkat";
import User from "./pages/user";
import UserTambah from "./pages/crud_user/UserTambah";
import UserEdit from "./pages/crud_user/UserEdit";
import UserNonaktif from "./pages/crud_user/UserNonaktif";
import NotFound from "./pages/NotFound";
import KalibrasiPerangkat from "./pages/KalibrasiPerangkat";
import HistoryPage from "./pages/HistoryPerangakat";
import Riwayat from "./pages/Riwayat";
import DetailRiwayat from "./pages/DetailRiwayat";
import RiwayatNotifikasi from "./pages/RiwayatNotifikasi";
import NotificationWatcher from "@/components/NotificationWatcher";

// ✅ Definisikan route di luar komponen App
const publicRoutes = [
  { path: "/login", element: <LoginPage /> },
];

const protectedRoutes = [
  { path: "/", element: <Dashboard /> },
  { path: "/perangkat_tegangan/:idPerangkat", element: <Tegangan /> },
  { path: "/perangkat_air/:idPerangkat", element: <Arus_air /> },
  { path: "/monitoring_tegangan", element: <Monitoring_Tegangan /> },
  { path: "/control", element: <Control /> },
  { path: "/air", element: <Air /> },
  { path: "/profil", element: <Profil /> },
  { path: "/Perangkat", element: <Perangkat /> },
  { path: "/Pengaturan", element: <Pengaturan /> },
  { path: "/detail-perangkat/:id", element: <DetailPerangkat /> },
  { path: "/perangkat/:id/history", element: <HistoryPage /> },
  { path: "/riwayat", element: <Riwayat /> },
  { path: "/detail-riwayat/:id", element: <DetailRiwayat /> },
  { path: "/riwayat-notifikasi", element: <RiwayatNotifikasi /> },
];

function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const tenantToken = import.meta.env.VITE_TENANT_TOKEN;

  return (
    <Router>
      {/* 🔔 Komponen notifikasi global, selalu aktif */}
      <NotificationWatcher apiBaseUrl={apiBaseUrl} tenantToken={tenantToken} />

      <Routes>
        {/* Public routes */}
        {publicRoutes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}

        {/* Protected routes */}
        {protectedRoutes.map(({ path, element }, index) => (
          <Route
            key={index}
            path={path}
            element={<ProtectedRoute>{element}</ProtectedRoute>}
          />
        ))}

        {/* Admin/Owner only */}
        <Route
          path="/kalibrasi-perangkat/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "owner"]}>
              <KalibrasiPerangkat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tambah-perangkat"
          element={
            <ProtectedRoute allowedRoles={["admin", "owner"]}>
              <TambahPerangkat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-perangkat/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "owner"]}>
              <EditDevice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["admin", "owner"]}>
              <User />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/tambah"
          element={
            <ProtectedRoute allowedRoles={["admin", "owner"]}>
              <UserTambah />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "owner"]}>
              <UserEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/nonaktif"
          element={
            <ProtectedRoute allowedRoles={["admin", "owner"]}>
              <UserNonaktif />
            </ProtectedRoute>
          }
        />

        {/* Not Found */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
