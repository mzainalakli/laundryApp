import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { FaArrowLeft } from "react-icons/fa";
import { ToggleLeft,ChevronLeft, ToggleRight } from "lucide-react";

export default function KalibrasiPerangkat() {
  const { id } = useParams();
  const [voltageData, setVoltageData] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [deviceToken, setDeviceToken] = useState(null);
  const [visibleLines, setVisibleLines] = useState({
    t1: true, t2: true, t3: true, t4: true, t5: true, t6: true,
  });

  const intervalRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;

  // Ambil token perangkat dari /Volt_device/scan/:id
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
        alert("Gagal mengambil token perangkat. Pastikan user Anda punya akses.");
      }
    };

    fetchDeviceToken();
  }, [id]);

  useEffect(() => {
    return () => {
      if (isRunning && deviceToken) {
        const token = localStorage.getItem("token");

        axios.put(`${API_BASE_URL}/volt_device/mode/${deviceToken}`, {
          kalibrasi: false,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Token": TENANT_TOKEN,
          },
        }).catch((err) => {
          console.error("❌ Gagal mematikan kalibrasi saat keluar halaman:", err);
        });

        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, deviceToken]);


  const fetchVoltage = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE_URL}/Volt_device/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-Token": TENANT_TOKEN,
        },
      });

      const newPoint = {
        time: res.data.timestamp || new Date().toLocaleTimeString(),
        t1: parseFloat(res.data.tegangan1),
        t2: parseFloat(res.data.tegangan2),
        t3: parseFloat(res.data.tegangan3),
        t4: parseFloat(res.data.tegangan4),
        t5: parseFloat(res.data.tegangan5),
        t6: parseFloat(res.data.tegangan6),
      };

      setVoltageData(prev => [...prev.slice(-49), newPoint]);
    } catch (err) {
      console.error("❌ Gagal mengambil data tegangan:", err);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(fetchVoltage, 150);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleToggle = async () => {
    const token = localStorage.getItem("token");
    const newStatus = !isRunning;

    if (!deviceToken) {
      alert("Token perangkat belum tersedia. Tidak bisa ubah mode kalibrasi.");
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/volt_device/mode/${deviceToken}`, {
        kalibrasi: newStatus,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-Token": TENANT_TOKEN,
        },
      });

      if (newStatus) {
        fetchVoltage();
        intervalRef.current = setInterval(fetchVoltage, 300);
      } else {
        clearInterval(intervalRef.current);
      }

      setIsRunning(newStatus);
    } catch (error) {
      console.error("❌ Gagal mengubah mode kalibrasi:", error);
      alert("Gagal mengubah mode kalibrasi. Lihat console.");
    }
  };

  const handleCheckboxChange = (key) => {
    setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const lineColors = {
    t1: "#8884d8",
    t2: "#82ca9d",
    t3: "#ffc658",
    t4: "#ff8042",
    t5: "#0088FE",
    t6: "#00C49F",
  };
  const getVoltageRange = () => {
    const allVisibleVoltages = voltageData.flatMap((item) =>
      Object.entries(item)
        .filter(([key]) => key !== "time" && visibleLines[key])
        .map(([_, value]) => value)
    );

    if (allVisibleVoltages.length === 0) return ['auto', 'auto'];

    const min = Math.min(...allVisibleVoltages);
    const max = Math.max(...allVisibleVoltages);

    // Berikan margin 5V di bawah dan atas agar tidak terlalu mepet
    return [Math.floor(min - 5), Math.ceil(max + 5)];
  };
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <Sidebar />
      <main className=" flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => history.back()}
            className="text-gray-600 text-xl hover:text-blue-800"
            title="Kembali"
          >
            <ChevronLeft className="text-2xl" />
          </button>
          <h1 className="font-medium text-xl text-black">Kalibrasi Perangkat</h1>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h2 className="text-base sm:text-lg font-medium text-gray-800">
              ⚙️ Grafik Tegangan Realtime
            </h2>
            <button
              onClick={handleToggle}
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-full text-sm sm:text-base text-blue-700 font-medium"
              title={isRunning ? "Matikan Grafik" : "Nyalakan Grafik"}
            >
              {isRunning ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              {isRunning ? "On" : "Off"}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-4 text-sm sm:text-base">
            {Object.keys(visibleLines).map(key => (
              <label key={key} className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={visibleLines[key]}
                  onChange={() => handleCheckboxChange(key)}
                  className="accent-blue-500"
                />
                Tegangan {key.substring(1)}
              </label>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={voltageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis unit=" V" domain={getVoltageRange()} />
              <Tooltip />
              {Object.keys(visibleLines).map(key =>
                visibleLines[key] && (
                  <Line
                    key={key}
                    type="linear" // Ganti dari "monotone" ke "linear"
                    dataKey={key}
                    stroke={lineColors[key]}
                    dot={false}
                    isAnimationActive={false} // NONaktifkan animasi render antar titik (biar lebih realtime)
                    name={`Tegangan ${key.substring(1)}`}
                  />
                )
              )}
            </LineChart>
          </ResponsiveContainer>

          <p className="mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
            Centang atau hapus centang tegangan untuk menampilkan atau menyembunyikan garis tertentu dalam grafik. Ini memudahkan fokus pada tegangan tertentu saat kalibrasi ZMPT101B.
          </p>
        </div>
      </main>
    </div>
  );
}