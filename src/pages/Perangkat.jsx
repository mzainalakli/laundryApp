import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { fetchDevicesAPI, deleteDeviceAPI } from "@/components/deviceService";
import { Plus, Pencil, Trash2, Wrench, KeyRound, PlugZap } from "lucide-react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

const Riwayat = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await fetchDevicesAPI(currentPage, 5); // Ambil dari backend

      const role = localStorage.getItem("role");
      const userId = parseInt(localStorage.getItem("user_id"), 10);
      let filtered = data.result;

      if (role === "karyawan") {
        filtered = filtered.filter(device => device.user_id === userId);
      }

      setDevices(filtered);
      setTotalPages(Math.ceil(data.metadata.total / 5)); // dari metadata
    } catch (err) {
      console.error("Gagal mengambil perangkat:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;

      const response = await fetch(`${API_BASE_URL}/Volt_device/scan/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-Token": TENANT_TOKEN,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.message || "Token tidak ditemukan");
      }

      await navigator.clipboard.writeText(data.token);
      alert("Token berhasil disalin ke clipboard!");
    } catch (err) {
      console.error("Gagal salin token:", err);
      alert("Gagal menyalin token perangkat.");
    }
  };

  const handleDelete = async (id) => {
    const konfirmasi = window.confirm("Yakin ingin menghapus perangkat ini?");
    if (!konfirmasi) return;

    try {
      await deleteDeviceAPI(id);
      alert("Perangkat berhasil dihapus.");
      fetchDevices(currentPage); // refresh current page
    } catch (err) {
      console.error("Gagal menghapus perangkat:", err);
      alert("Gagal menghapus perangkat.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("user_id");

    if (!token) {
      console.warn("Token login tidak ditemukan. Redirect ke login.");
      navigate("/login");
      return;
    }

    setRole(storedRole);
    setUserId(Number(storedUserId));
  }, []);

  useEffect(() => {
    fetchDevices(currentPage);
  }, [currentPage]);

  return (
    <div className="flex min-h-screen text-gray-900">
      <Sidebar />
      <main className=" md:p-6 lg:p-1 md:mt-10 pb-24 flex-1 h-screen relative overflow-y-auto lg:mt-14">
        <section className="bg-gradient-to-r from-blue-500 to-blue-700 w-full md:hidden relative overflow-hidden mb-3 rounded-b-3xl pb-5">
          <div className="relative flex justify-between items-center p-5">
            <div className="flex items-center space-x-2"></div>
          </div>
        </section>
        <section className="flex md:mt-14 items-center justify-center px-5">
          <div className="-mt-10 bg-white text-center font-bold w-full shadow rounded-2xl p-6 text-gray-700 z-20">
            Daftar Perangkat
          </div>
        </section>
        <section className="p-5">
          {loading ? (
            <p className="text-gray-500 italic">Memuat data perangkat...</p>
          ) : devices.length === 0 ? (
            <p className="text-gray-500 italic">Tidak ada perangkat ditemukan.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {devices.map((device, i) => (
                <div
                  key={device.id || `${device.name}-${i}`}
                  className="bg-white shadow border border-gray-300 rounded-xl p-4 hover:bg-blue-50 transition"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => navigate(`/detail-perangkat/${device.id}`)}
                  >
                    <h2 className="text-gray-700 font-semibold text-base flex items-center gap-2">
                      <PlugZap className="w-5 h-5" /> {device.name || device.nama || "Tanpa Nama"}
                    </h2>
                    <p className="text-gray-500 text-sm">Perangkat #{i + 1}</p>
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    {role !== "karyawan" && (
                      <>
                        <button
                          onClick={() => navigate(`/edit-perangkat/${device.id}`)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition"
                          title="Edit"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDelete(device.id)}
                          className="text-red-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/kalibrasi-perangkat/${device.id}`)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition"
                          title="Kalibrasi Perangkat"
                        >
                          <Wrench className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleCopyToken(device.id)}
                      className="text-gray-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition"
                      title="Salin Token"
                    >
                      <KeyRound className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 🔽 PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-full text-white bg-blue-500 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                  }`}
              >
                <FiArrowLeft className="text-xl" />
              </button>
              <span className="self-center text-sm font-medium text-gray-600">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full text-white bg-blue-500 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                  }`}
              >
                <FiArrowRight className="text-xl" />
              </button>
            </div>
          )}
        </section>

        {/* 🔘 Floating Add Button */}
        {role !== "karyawan" && (
          <div className="fixed bottom-20 right-6 lg:right-10 lg:pl-64 z-50">
            <button
              onClick={() => navigate("/tambah-perangkat")}
              className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition hover:scale-105"
              title="Tambah Perangkat"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Riwayat;
