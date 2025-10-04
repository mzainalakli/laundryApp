import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChevronLeft } from "lucide-react";

export default function DetailPerangkat() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [voltageHistory, setVoltageHistory] = useState([]);
  const [flowRateHistory, setFlowRateHistory] = useState([]);
  const [deviceToken, setDeviceToken] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchDevice = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/Volt_device/${id}`, {
          headers: {
            "X-Tenant-Token": TENANT_TOKEN,
            Authorization: `Bearer ${token}`,
          },
        });
        const newData = response.data;
        setDevice(newData);

        const timestamp = new Date().toLocaleTimeString();

        setVoltageHistory(prev => [
          ...prev.slice(-19),
          {
            time: timestamp,
            t1: parseFloat(newData.tegangan1),
            t2: parseFloat(newData.tegangan2),
            t3: parseFloat(newData.tegangan3),
            t4: parseFloat(newData.tegangan4),
            t5: parseFloat(newData.tegangan5),
            t6: parseFloat(newData.tegangan6),
          }
        ]);

        setFlowRateHistory(prev => [
          ...prev.slice(-19),
          {
            time: timestamp,
            flow: parseFloat(newData.flow_rate),
          }
        ]);
      } catch (error) {
        console.error("Gagal mengambil detail perangkat", error);
      } finally {
        setLoading(false);
      }
    };

    const intervalId = setInterval(fetchDevice, 300);

    return () => clearInterval(intervalId);
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchDeviceToken = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/Volt_device/scan/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Token": TENANT_TOKEN,
          },
        });

        setDeviceToken(res.data.token);
      } catch (err) {
        console.error("❌ Gagal mengambil token perangkat dari /scan/:id", err);
      }
    };

    fetchDeviceToken();
  }, [id]);

  if (loading) return <p className="p-6 text-gray-600">⏳ Memuat detail perangkat...</p>;
  if (!device) return <p className="p-6 text-red-600">🚫 Perangkat tidak ditemukan.</p>;

  const allVoltages = voltageHistory.flatMap(item => [
    item.t1, item.t2, item.t3, item.t4, item.t5, item.t6
  ]).filter(v => !isNaN(v));

  const handleRefreshRealtime = async () => {
    const token = localStorage.getItem("token");

    if (!deviceToken) {
      alert("Token perangkat belum tersedia.");
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/volt_device/mode/${deviceToken}`, {
        refresh: true,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-Token": TENANT_TOKEN,
        },
      });

      alert("✅ Data realtime diperbarui. Silakan tunggu sebentar...");
    } catch (err) {
      console.error("❌ Gagal memperbarui data realtime:", err);
      alert("Gagal memperbarui data realtime.");
    }
  };

  const minVoltage = allVoltages.length ? Math.min(...allVoltages) : 0;
  const maxVoltage = allVoltages.length ? Math.max(...allVoltages) : 0;

  // Tambahkan padding 10 volt
  const paddedMin = Math.floor(minVoltage - 10);
  const paddedMax = Math.ceil(maxVoltage + 10);
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f6f9ff] to-[#eaf0ff] text-gray-900">
      <Sidebar />
      <main className="flex-1 h-screen md:mt-10 overflow-y-auto bg-[#f6f9ff]">

        {/* Header Gradient untuk Mobile */}

        <div className="relative flex md:hidden items-center p-4">
          <button
            onClick={() => navigate(-1)}
            className="text-black mr-2 hover:text-gray-200 transition"
            title="Kembali"
          >
            <ChevronLeft className="text-xl" />
          </button>
          <h2 className="font-medium text-xl text-black">
            Detail Perangkat {device?.name || "Tidak diketahui"}
          </h2>
          <div></div>
        </div>

        <section className="flex hidden md:block md:mt-20 md:mb-4 items-center justify-center px-5">
          <div className="-mt-10 bg-white text-center font-medium w-full shadow rounded-2xl p-6 text-black z-20">
            📋 Detail Perangkat {device?.name || "Tidak diketahui"}
          </div>
        </section>

        {/* Konten Utama */}
        <div className="px-5 mt-2">

          {/* Kartu Status Tegangan & Air */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input Voltage */}
            <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-5 text-gray-800">
              <h2 className="text-lg font-semibold text-black mb-3">🔌 Input Tegangan</h2>
              <p>Tegangan RS: {device.tegangan1} V</p>
              <p>Tegangan ST: {device.tegangan2} V</p>
              <p>Tegangan RT: {device.tegangan3} V</p>
            </div>

            {/* Output Voltage */}
            <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-5 text-gray-800">
              <h2 className="text-lg font-semibold text-black mb-3">🔋 Output Tegangan</h2>
              <p>Tegangan RS: {device.tegangan4} V</p>
              <p>Tegangan ST: {device.tegangan5} V</p>
              <p>Tegangan RT: {device.tegangan6} V</p>
            </div>

            {/* Penggunaan Air */}
            <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-5 text-gray-800">
              <h2 className="text-lg font-semibold text-black mb-3">💧 Penggunaan Air</h2>
              <p><>Kecepatan Air:</> {device.flow_rate} L/menit</p>
              <p><>Total Hari Ini:</> {device.total_flow_today || 0} Liter</p>
            </div>
          </div>

          {/* Grafik Tegangan */}
          <div className="mt-6 bg-white p-5 rounded-xl shadow-sm border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-black">📈 Grafik Realtime Tegangan</h2>
              <button
                onClick={handleRefreshRealtime}
                className="text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md shadow transition"
                title="Perbarui data realtime"
              >
                🔄 Perbarui
              </button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={voltageHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis unit=" V" tick={{ fontSize: 10 }} domain={[paddedMin, paddedMax]} />
                <Tooltip contentStyle={{ fontSize: "10px" }} />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                {["t1", "t2", "t3", "t4", "t5", "t6"].map((key, idx) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"][idx]}
                    name={`Tegangan ${idx + 1}`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Grafik Flow Rate */}
          <div className="mt-6 mb-20 bg-white p-5 rounded-xl shadow-sm border border-blue-100">
            <h2 className="text-base font-semibold text-black mb-3">
              💧 Grafik Realtime Flow Rate
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={flowRateHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis unit=" L/m" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: "10px" }} />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="flow"
                  stroke="#8884d8"
                  name="Flow Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
