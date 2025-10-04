import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { database } from "/src/firebase-config";
import { ref, onValue } from "firebase/database";
import { Card } from "@/components/ui/card";
import { FaBolt } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Monitor = () => {
  const { idPerangkat } = useParams();
  const navigate = useNavigate();
  const [tegangan, setTegangan] = useState({});
  const [history, setHistory] = useState({
    tegangan1: [],
    tegangan2: [],
    tegangan3: [],
  });

  useEffect(() => {
    if (!idPerangkat) return;

    const voltRef = ref(database, `/Volt_Meter/${idPerangkat}`);
    const unsubscribe = onValue(voltRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTegangan(data);
        const timestamp = new Date().toLocaleTimeString().slice(0, 5);

        setHistory((prev) => {
          const updated = {
            tegangan1: [...prev.tegangan1, { time: timestamp, value: data.tegangan1 }],
            tegangan2: [...prev.tegangan2, { time: timestamp, value: data.tegangan2 }],
            tegangan3: [...prev.tegangan3, { time: timestamp, value: data.tegangan3 }],
          };

          // Batasi hanya 10 data terakhir
          Object.keys(updated).forEach((key) => {
            if (updated[key].length > 10) {
              updated[key] = updated[key].slice(-10);
            }
          });

          return updated;
        });
      }
    });

    return () => unsubscribe();
  }, [idPerangkat]);

  const renderChart = (data, label, color) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">📈 Grafik {label}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="time" stroke="#999" />
          <YAxis stroke="#999" domain={[0, "auto"]} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderHistory = (data, label) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-semibold mb-2 text-gray-700">📋 Histori {label}</h3>
      <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
        {data.map((item, index) => (
          <li key={index}>
            {item.time} - {typeof item.value === "number" ? item.value.toFixed(2) : "N/A"} V
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f6f9ff] to-[#eaf0ff] text-gray-900">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-start mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-800 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 text-center">
            ⚡ Monitoring Tegangan - {idPerangkat}
          </h2>
        </div>

        {/* Kartu Tegangan */}
        <div className="flex space-x-4 overflow-x-auto mb-8">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="min-w-[150px] p-4 bg-white rounded-xl shadow-md text-center flex-shrink-0"
            >
              <FaBolt className="text-yellow-400 text-3xl mb-1 mx-auto" />
              <h3 className="text-md font-semibold text-gray-700">Tegangan {i}</h3>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {typeof tegangan[`tegangan${i}`] === "number"
                  ? `${tegangan[`tegangan${i}`].toFixed(2)} V`
                  : "N/A"}
              </p>
            </Card>
          ))}
        </div>

        {/* Grafik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {renderChart(history.tegangan1, "Tegangan 1", "#facc15")}
          {renderChart(history.tegangan2, "Tegangan 2", "#4ade80")}
          {renderChart(history.tegangan3, "Tegangan 3", "#60a5fa")}
        </div>

        {/* Histori */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderHistory(history.tegangan1, "Tegangan 1")}
          {renderHistory(history.tegangan2, "Tegangan 2")}
          {renderHistory(history.tegangan3, "Tegangan 3")}
        </div>
      </div>
    </div>
  );
};

export default Monitor;
