import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import logo from "@/assets/logo.jpg";
import { FiBell, FiUser, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiActivity, FiZap, FiDroplet } from "react-icons/fi";

const Dashboard = () => {
  const [devices, setDevices] = useState([]);
  const [username, setUsername] = useState("Pengguna");
  const [hasNewNotif, setHasNewNotif] = useState(false);
  const [deviceHistories, setDeviceHistories] = useState({});
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;
  const token = localStorage.getItem("token");
  const userId = parseInt(localStorage.getItem("user_id"));
  const role = localStorage.getItem("role");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Volt_device?page=${currentPage}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Token": TENANT_TOKEN,
          },
        });

        if (!response.ok) throw new Error("Gagal memuat perangkat");

        const json = await response.json();
        const allDevices = json.result || [];

        const filteredDevices =
          role === "karyawan"
            ? allDevices.filter((device) => Number(device.user_id) === userId)
            : allDevices;

        const deviceDetails = await Promise.all(
          filteredDevices.map(async (device) => {
            try {
              const res = await fetch(`${API_BASE_URL}/Volt_device/${device.id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "X-Tenant-Token": TENANT_TOKEN,
                },
              });

              const detail = await res.json();
              const now = new Date();
              const lastSeen = new Date(device.updatedAt);
              const isConnected = now - lastSeen < 30 * 1000;

              return {
                ...device,
                ...detail,
                statusKoneksi: isConnected ? "✅ Terhubung" : "❌ Tidak Terhubung",
              };
            } catch (err) {
              console.error("Gagal ambil detail perangkat:", err);
              return device;
            }
          })
        );

        setDevices(deviceDetails);
        const total = json.metadata?.total || 1;
        setTotalPages(Math.ceil(total / limit));
      } catch (err) {
        console.error("🔥 Gagal ambil perangkat:", err);
        setDevices([]);
      }
    };

    fetchDevices();

    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUsername(parsedUser?.name || username || "Pengguna");
    const interval = setInterval(() => {
      fetchDevices();
    }, 30000);
    return () => clearInterval(interval);
  }, [currentPage]);

  useEffect(() => {
    const fetchDeviceHistories = async () => {
      const histories = {};
      for (const device of devices) {
        try {
          const historyRes = await fetch(`${API_BASE_URL}/Volt_device/History/${device.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Tenant-Token": TENANT_TOKEN,
            },
          });

          if (!historyRes.ok) throw new Error("Gagal ambil histori");

          const historyData = await historyRes.json();
          histories[device.id] = historyData.data?.result || [];
        } catch (err) {
          console.error(`Gagal ambil histori perangkat ${device.id}:`, err);
          histories[device.id] = [];
        }
      }
      setDeviceHistories(histories);
    };

    if (devices.length > 0) fetchDeviceHistories();
  }, [devices]);

  useEffect(() => {
    const fetchNotif = async () => {
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

        const lastSeenId = parseInt(localStorage.getItem("lastSeenNotifId") || "0", 10);

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

            return log.id > lastSeenId ? log : null;
          })
        );

        const filteredLogs = relevantLogs.filter(Boolean);
        setHasNewNotif(filteredLogs.length > 0);
      } catch (err) {
        console.error("Gagal cek notifikasi:", err);
      }
    };

    fetchNotif();
    const interval = setInterval(fetchNotif, 30000); // refresh tiap 30 detik
    return () => clearInterval(interval);
  }, []);

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

  const formatLabel = (key) => {
    const map = {
      tegangan1: "Tegangan rs",
      tegangan2: "Tegangan st",
      tegangan3: "Tegangan rt",
      tegangan4: "Tegangan rs",
      tegangan5: "Tegangan st",
      tegangan6: "Tegangan rt",
      flow_rate: "Flow Rate",
      total_flow_today: "Total Air/Hari",
      totalKwH: "Total kWh",
      Daya: "Konsumsi Daya (Watt)"
    };
    return map[key] || key;
  };

  const formatValue = (key, value) => {
    if (key.includes("tegangan")) return `${parseFloat(value).toFixed(2)} V`;
    if (key.includes("flow_rate")) return `${parseFloat(value).toFixed(2)} L/m`;
    if (key === "totalKwH") return `${parseFloat(value).toFixed(2)} kWh`;
    if (key === "Daya") return `${parseFloat(value).toFixed(2)} W`;
    return value;
  };

  // Fungsi status tegangan
  const getVoltageStatus = (value) => {
    const v = parseFloat(value);
    if (v < 342) return " ⚠di bawah normal";
    if (v > 400) return " ⚠di atas normal";
    return "Normal";
  };

  // Fungsi status flow rate
  const getFlowStatus = (device) => {
    const flow = parseFloat(device.total_flow_today);
    const max = parseFloat(device.max_flow_daily);
    const now = new Date();
    const [startHour, startMinute] = (device.start_time || "00:00").split(":").map(Number);
    const [endHour, endMinute] = (device.end_time || "23:59").split(":").map(Number);

    const start = new Date();
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    if (now < start || now > end) return "Pemakaian air di luar jam operasional";
    if (flow > max) return "Pemakaian air di luar batas";
    return "Normal";
  };

  const renderDeviceCard = (device, i) => {
    if (!device || typeof device !== "object") return null;

    return (
      <div key={device.id} className="p-4 rounded-xl w-full">
        {/* input */}
        <div className="mb-2">
          <p className="font-semibold text-gray-700 mb-1">Input</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            {["tegangan1", "tegangan2", "tegangan3"].map((key) => (
              <div key={key} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded shadow-sm">
                <div className="">
                  <span className="text-gray-600">{formatLabel(key)}</span>
                  <p className="font-medium">{formatValue(key, device[key])}</p>
                </div>
                <p className={`text-xs ${getVoltageStatus(device[key]) === "Normal" ? "text-green-500" : "text-red-500"}`}>
                  {getVoltageStatus(device[key])}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* output */}
        <div className="mb-2">
          <p className="font-semibold text-gray-700 mb-1">Output</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            {["tegangan4", "tegangan5", "tegangan6"].map((key) => (
              <div key={key} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded shadow-sm">
                <div className="">
                  <span className="text-gray-600 text-xs">{formatLabel(key)}</span>
                  <p className="font-medium">{formatValue(key, device[key])}</p>
                </div>
                <p className={`text-xs ${getVoltageStatus(device[key]) === "Normal" ? "text-green-500" : "text-red-500"}`}>
                  {getVoltageStatus(device[key])}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Konsumsi Energi */}
        <div className="mb-2">
          <p className="font-semibold text-gray-700 mb-1">Konsumsi Energi</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded shadow-sm">
              <div className="">
                <span className="text-gray-600 text-xs">{formatLabel("totalKwH")}</span>
                <p className="font-medium">{formatValue("totalKwH", device.totalKwH || 0)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded shadow-sm">
              <div className="">
                <span className="text-gray-600 text-xs">{formatLabel("Daya")}</span>
                <p className="font-medium">{formatValue("Daya", device.Daya || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Flow Rate */}
        <div>
          <p className="font-semibold text-gray-700 mb-1">Flow Rate</p>
          <div className="flex items-center justify-between grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded shadow-sm text-sm">
              <div className="">
                <span className="text-gray-600 text-xs">{formatLabel("flow_rate")}</span>
                <p className="font-medium">{formatValue("flow_rate", device["flow_rate"])}</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded shadow-sm text-sm">
              <div className="">
                <span className="text-gray-600 text-xs">{formatLabel("total_flow_today")}</span>
                <p className="font-medium">{formatValue("total_flow_today", device["total_flow_today"])}</p>
              </div>
              <p className={`text-xs ${getFlowStatus(device) === "Normal" ? "text-green-500" : "text-red-500"}`}>
                {getFlowStatus(device)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const VoltageChart = ({ data }) => {
    // Filter data untuk hari ini
    const todayData = data?.filter(item => {
      const itemDate = new Date(item.createdAt);
      const today = new Date();
      return (
        itemDate.getDate() === today.getDate() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    }) || [];

    const formatTime = (ts) => new Date(ts).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short"
    });

    // Jika tidak ada data hari ini
    if (todayData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="text-gray-500 text-lg mb-2">📊</div>
          <p className="text-gray-500">Tidak ada data tegangan hari ini</p>
          <p className="text-sm text-gray-400">Data akan muncul saat perangkat mengirim pembacaan</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={todayData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="createdAt"
            tickFormatter={formatTime}
            tick={{ fontSize: 12 }}
          />
          <YAxis domain={[300, 450]} />
          <Tooltip
            labelFormatter={(value) => `Waktu: ${formatTime(value)}`}
            formatter={(value, name) => [`${value} V`, name]}
          />
          <Line type="monotone" dataKey="tegangan1" stroke="#8884d8" name="Tegangan rs" dot={false} />
          <Line type="monotone" dataKey="tegangan2" stroke="#82ca9d" name="Tegangan st" dot={false} />
          <Line type="monotone" dataKey="tegangan3" stroke="#ffc658" name="Tegangan rt" dot={false} />
          <Line type="monotone" dataKey="tegangan4" stroke="#58e6ff" name="Tegangan rs" dot={false} />
          <Line type="monotone" dataKey="tegangan5" stroke="#ff5858" name="Tegangan st" dot={false} />
          <Line type="monotone" dataKey="tegangan6" stroke="#ff58f1" name="Tegangan rt" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const FlowChart = ({ data }) => {
    // Filter data untuk hari ini
    const todayData = data?.filter(item => {
      const itemDate = new Date(item.createdAt);
      const today = new Date();
      return (
        itemDate.getDate() === today.getDate() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    }) || [];

    const formatTime = (ts) => new Date(ts).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short"
    });

    // Jika tidak ada data hari ini
    if (todayData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="text-gray-500 text-lg mb-2">💧</div>
          <p className="text-gray-500">Tidak ada data air hari ini</p>
          <p className="text-sm text-gray-400">Data akan muncul saat perangkat mengirim pembacaan</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={todayData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="createdAt"
            tickFormatter={formatTime}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(value) => `Waktu: ${formatTime(value)}`}
            formatter={(value, name) => {
              if (name === "Total Air Hari Ini") {
                return [`${value} L`, name];
              }
              return [`${value} L/m`, name];
            }}
          />
          <Line
            type="monotone"
            dataKey="total_flow_today"
            stroke="#00c49f"
            name="Total Air Hari Ini"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="flow_rate"
            stroke="#0088FE"
            name="Flow Rate"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="flex-1 ml-0 pb-12 min-h-screen bg-gradient-to-b from-[#f6f9ff] to-[#eaf0ff] text-gray-900">
      <Sidebar />
      <main className="flex-1 lg:mt-8">
        {/* Header */}
        <header className="block md:hidden flex justify-between items-center px-6 py-4 border-b border-gray-300 bg-white bg-opacity-60 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-xl font-bold text-blue-500">Arba Laundry</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-2xl">
              <FiUser className="text-2xl text-white-400" />
            </div>
            <span className="text-sm font-medium">{username}</span>

            <button onClick={handleBellClick} className="relative ml-2">
              <FiBell className="text-2xl text-gray-900" />
              {hasNewNotif && (
                <>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </>
              )}
            </button>
          </div>
        </header>
              
        {/* Card Perangkat */}
        <div className="mb-12">
          {devices.length === 0 ? (
            <p className="text-center text-gray-500 italic col-span-full">
              Tidak ada perangkat ditemukan.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-1 px-6">
              {devices.map((device, i) => (
                <div key={device.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Header Card */}
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-blue-100">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      <span className="bg-blue-100 p-2 rounded-full">
                        <FiActivity className="text-blue-500" />
                      </span>
                      {device.name || `Perangkat ${i + 1}`}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${device.statusKoneksi?.includes("❌")
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                      }`}>
                      {device.statusKoneksi || "Memuat..."}
                    </span>
                  </div>

                  {/* Konten Card */}
                  <div className="grid grid-cols-1 lg:grid-cols-10 gap-0">
                    {/* Card Perangkat */}
                    <div className="lg:col-span-4 p-4 border-r border-gray-200">
                      <Link to={`/detail-perangkat/${device.id}`} className="block">
                        {renderDeviceCard(device, i)}
                      </Link>
                    </div>

                    {/* Grafik Tegangan */}
                    <div className="lg:col-span-3 p-4 border-r border-gray-200 h-full">
                      <Link to={`/detail-riwayat/${device.id}`} className="block h-full flex flex-col">
                        <h4 className="font-bold mb-3 text-gray-800 flex items-center gap-2">
                          <FiZap className="text-yellow-500" />
                          Grafik Tegangan Hari Ini
                        </h4>
                        <div className="flex-1 min-h-[300px] lg:min-h-[450px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <VoltageChart data={deviceHistories[device.id] || []} />
                          </ResponsiveContainer>
                        </div>
                      </Link>
                    </div>

                    {/* Grafik Air */}
                    <div className="lg:col-span-3 p-4 h-full">
                      <Link to={`/detail-riwayat/${device.id}`} className="block h-full flex flex-col">
                        <h4 className="font-bold mb-3 text-gray-800 flex items-center gap-2">
                          <FiDroplet className="text-blue-400" />
                          Grafik Air Hari Ini
                        </h4>
                        <div className="flex-1 min-h-[300px] lg:min-h-[450px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <FlowChart data={deviceHistories[device.id] || []} />
                          </ResponsiveContainer>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-4 pb-16">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`rounded-full p-2 bg-blue-500 text-white shadow ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-blue-600"
                }`}
              title="Sebelumnya"
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <span className="self-center text-sm font-medium text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`rounded-full p-2 bg-blue-500 text-white shadow ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-blue-600"
                }`}
              title="Berikutnya"
            >
              <FiArrowRight className="text-xl" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
