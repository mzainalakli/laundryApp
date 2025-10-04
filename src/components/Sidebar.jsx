import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBolt,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaHistory,
} from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo.jpg";
import { useTheme } from "../context/ThemeContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [hasNewNotif, setHasNewNotif] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const userId = Number(localStorage.getItem("user_id"));
  const role = user?.role?.toLowerCase();
  const name = user?.name || "Nama tidak ditemukan";
  const username = user?.username || "username";
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isAdminOrOwner = role === "admin" || role === "owner";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItemsDesktop = [
    { label: "Dashboard", icon: <FaTachometerAlt />, to: "/" },
    { label: "Perangkat", icon: <FaBolt />, to: "/perangkat" },
    isAdminOrOwner && { label: "User", icon: <FaUser />, to: "/user" },
    { label: "Riwayat", icon: <FaHistory />, to: "/riwayat" },
  ].filter(Boolean);

  const menuItemsMobile = [
    { label: "Dashboard", icon: <FaTachometerAlt />, to: "/" },
    { label: "Perangkat", icon: <FaBolt />, to: "/perangkat" },
    { label: "Riwayat", icon: <FaHistory />, to: "/riwayat" },
    { label: "Pengaturan", icon: <FaCog />, to: "/pengaturan" },
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?");
    if (confirmLogout) {
      localStorage.removeItem("user_id");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      navigate("/login");
    }
  };

  const handleBellClick = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Volt_device/Log`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-Token": TENANT_TOKEN,
        },
      });

      if (!response.ok) throw new Error("Gagal ambil log");

      const data = await response.json();
      const logs = data.result || [];

      const relevantLogs = await Promise.all(
        logs.map(async (log) => {
          if (role === "karyawan") {
            const deviceRes = await fetch(`${API_BASE_URL}/Volt_device/${log.volt_id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "X-Tenant-Token": TENANT_TOKEN,
              },
            });
            const deviceData = await deviceRes.json();
            if (Number(deviceData.user_id) !== userId) return null;
          }
          return log;
        })
      );

      const filteredLogs = relevantLogs.filter(Boolean);
      const latestId = filteredLogs.reduce((max, log) => Math.max(max, log.id), 0);

      localStorage.setItem("lastSeenNotifId", `${latestId}`);
      setHasNewNotif(false);
      navigate("/riwayat-notifikasi");
    } catch (err) {
      console.error("Gagal saat klik bell:", err);
    }
  };

  // Cek jika ada notifikasi baru saat load
  useEffect(() => {
    const checkNotif = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Volt_device/Log`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Token": TENANT_TOKEN,
          },
        });
        if (!res.ok) return;

        const data = await res.json();
        const logs = data.result || [];

        const relevantLogs = await Promise.all(
          logs.map(async (log) => {
            if (role === "karyawan") {
              const deviceRes = await fetch(`${API_BASE_URL}/Volt_device/${log.volt_id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "X-Tenant-Token": TENANT_TOKEN,
                },
              });
              const deviceData = await deviceRes.json();
              if (Number(deviceData.user_id) !== userId) return null;
            }
            return log;
          })
        );

        const filteredLogs = relevantLogs.filter(Boolean);
        const latestId = filteredLogs.reduce((max, log) => Math.max(max, log.id), 0);
        const lastSeen = Number(localStorage.getItem("lastSeenNotifId") || 0);

        setHasNewNotif(latestId > lastSeen);
      } catch (err) {
        console.error("Gagal cek notifikasi:", err);
      }
    };

    checkNotif();
  }, []);

  return (
    <>
      {/* Top Nav Desktop - Enhanced UI */}
      <div className="hidden md:flex fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="flex items-center justify-between w-full mx-auto px-6 h-16">
          {/* Logo with enhanced spacing */}
          <div className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="hidden lg:flex">
            <img
              src={logo}
              alt="Logo"
              className="w-10 h-10 rounded-full shadow-sm"
            />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Arba Laundry
            </h1>
          </div>

          {/* Navigation Menu - Enhanced */}
          <nav className="flex items-center gap-2">
            {menuItemsDesktop.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.to}
                className={({ isActive }) => `
    flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
    ${isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
  `}
              >
                {({ isActive }) => (
                  <>
                    <span className={`text-base ${isActive ? "text-blue-500" : "text-gray-400"}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Side Controls - Enhanced */}
          <div className="flex items-center gap-4">
            {/* Notification Bell - Enhanced */}
            <button
              onClick={handleBellClick}
              className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
              title="Notifikasi"
            >
              <FiBell className="text-2xl text-gray-600 hover:text-gray-800 transition-colors" />
              {hasNewNotif && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* User Menu - Enhanced */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all"
              >
                <div className="text-right">
                  <p className="font-medium text-gray-800">{name}</p>
                  <p className="text-xs text-gray-500">@{username}</p>
                </div>
                <FaUserCircle className="text-3xl text-gray-400" />
              </button>

              {/* Dropdown - Enhanced */}
              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform transition-all">
                  <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <p className="font-medium text-gray-800">{name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">@{username}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <FaSignOutAlt className="text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Enhanced */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2 px-4">
          {menuItemsMobile.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-xl transition-all
                ${isActive
                  ? "text-blue-600 "
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`
              }
            >
              <span className="text-xs mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="hidden md:block h-16" />
    </>
  );
};

export default Sidebar;