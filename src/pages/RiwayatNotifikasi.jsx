import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import "dayjs/locale/id";
import localizedFormat from "dayjs/plugin/localizedFormat";
import Sidebar from "@/components/Sidebar";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { ChevronLeft } from "lucide-react";

dayjs.extend(localizedFormat);

const RiwayatNotifikasi = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const limit = 10;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/Volt_device/Log?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Token": TENANT_TOKEN,
          },
        }
      );

      if (!res.ok) throw new Error("Gagal mengambil data log");

      const data = await res.json();
      const logsData = Array.isArray(data.result) ? data.result : [];

      const logsWithNames = await Promise.all(
        logsData.map(async (log) => {
          try {
            const resDevice = await fetch(`${API_BASE_URL}/Volt_device/${log.volt_id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "X-Tenant-Token": TENANT_TOKEN,
              },
            });

            if (!resDevice.ok) throw new Error("Gagal ambil nama perangkat");

            const deviceData = await resDevice.json();
            return {
              ...log,
              device_name: deviceData.name || `Perangkat ID ${log.volt_id}`,
            };
          } catch {
            return {
              ...log,
              device_name: `Perangkat ID ${log.volt_id}`,
            };
          }
        })
      );

      setLogs(logsWithNames);
      setCurrentPage(data.metadata?.page || 1);
      setTotalPages(Math.ceil(data.metadata?.total / limit) || 1);
    } catch (error) {
      console.error("❌ Gagal fetch log:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dayjs.locale("id");
    fetchLogs(currentPage);
    const interval = setInterval(() => fetchLogs(currentPage), 30000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      fetchLogs(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      fetchLogs(currentPage + 1);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f6f9ff] to-[#eaf0ff] text-gray-900">
      <Sidebar />
      <div className="p-4 md:p-6 lg:p-8 pb-24 flex-1 relative h-screen overflow-y-auto lg:mt-12 mb-10">

        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 md:hidden hover:text-gray-800 transition"
            title="Kembali"
          >
            <ChevronLeft className="text-xl" />
          </button>
          Riwayat Notifikasi
        </h2>
        {loading ? (
          <p>Memuat data...</p>
        ) : logs.length === 0 ? (
          <p>Tidak ada riwayat notifikasi ditemukan.</p>
        ) : (
          <>
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-red-50 border border-red-300 rounded-lg p-4 shadow-sm"
                >
                  <div className="text-sm text-gray-600">
                    {dayjs(log.createdAt).format("dddd, DD MMMM YYYY [pukul] HH:mm")}
                  </div>
                  <div className="font-medium text-gray-800">🔌 {log.device_name}</div>
                  <div className="text-sm text-red-600 mt-1">{log.StatusMessage}</div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && logs.length > 0 && (
              <div className="flex justify-center items-center mt-6 gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full border bg-blue-500 text-white transition 
        ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}
                  aria-label="Sebelumnya"
                >
                  <FiArrowLeft className="text-xl" />
                </button>

                <span className="text-sm font-medium text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </span>

                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full border bg-blue-500 text-white transition 
        ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}
                  aria-label="Berikutnya"
                >
                  <FiArrowRight className="text-xl" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RiwayatNotifikasi;
