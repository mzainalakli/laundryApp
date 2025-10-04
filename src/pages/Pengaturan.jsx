import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiUser, FiUsers } from "react-icons/fi";

const Pengaturan = () => {
  const [profile, setProfile] = useState({ name: "", username: "" });
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;

  const role = localStorage.getItem("role")?.toLowerCase();
  const isNotKaryawan = role !== "karyawan";

  useEffect(() => {
    // ❗ Cegah akses dari desktop
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) {
      navigate("/404", { replace: true });
      return;
    }

    const storedUserId = localStorage.getItem("user_id");
    const storedToken = localStorage.getItem("token");

    setUserId(storedUserId);
    setToken(storedToken);

    if (!storedUserId || !storedToken) {
      console.warn("user_id atau token tidak ditemukan!");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/${storedUserId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Token": TENANT_TOKEN,
            Authorization: `Bearer ${storedToken}`,
          },
        });

        const json = await res.json();
        const data = json?.data ?? json;

        if (res.ok) {
          setProfile({
            name: data.name,
            username: data.username,
          });
        } else {
          console.error("Gagal mengambil profil:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Error saat fetch profil:", error);
      }
    };

    fetchUserProfile();
  }, [API_BASE_URL, TENANT_TOKEN, navigate]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?");
    if (confirmLogout) {
      localStorage.removeItem("user_id");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f9ff] text-foreground transition-colors text-gray-900">
      <Sidebar />
      <main className="lg:ml-64 p-4 w-full max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow mt-8 p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-white text-3xl">
            <FiUser />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800">
              {profile.name || "Nama tidak ditemukan"}
            </p>
            <p className="text-sm text-gray-600">
              @{profile.username || "username"}
            </p>
          </div>
        </div>

        {/* Tombol ke halaman user - hanya untuk non-karyawan dan mobile */}
        {isNotKaryawan && (
          <button
            onClick={() => navigate("/user")}
            className="flex items-center justify-between bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 px-4 py-3 rounded-xl w-full md:hidden"
          >
            <div className="flex items-center gap-2">
              <FiUsers className="text-xl" />
              <span>Kelola User</span>
            </div>
            <span className="text-xl">›</span>
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center justify-between bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl w-full"
        >
          <div className="flex items-center gap-2">
            <FiLogOut className="text-xl" />
            <span>Logout</span>
          </div>
          <span className="text-xl">›</span>
        </button>
      </main>
    </div>
  );
};

export default Pengaturan;
