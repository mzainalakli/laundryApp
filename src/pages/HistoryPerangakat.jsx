import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const HistoryPerangkat = () => {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filter, setFilter] = useState("week");
  const [search, setSearch] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Volt_device/Log/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Token": TENANT_TOKEN,
          },
        });
        const json = await res.json();
        console.log("RESPON PENUH:", json); // tetap bisa digunakan untuk debug
        setLogs(json); // langsung isi array
      } catch (error) {
        console.error("Gagal memuat log", error);
      }
    };
    fetchLogs();
  }, [id]);

  useEffect(() => {
    const now = new Date();
    let startDate = new Date();
    if (filter === "week") startDate.setDate(now.getDate() - 7);
    else if (filter === "month") startDate.setMonth(now.getMonth() - 1);

    const filtered = logs.filter((log) => {
      const created = new Date(log.createdAt);
      return (
        created >= startDate &&
        JSON.stringify(log).toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredLogs(filtered);
  }, [logs, filter, search]);

  return (
    <div className="flex-1 ml-0 md:ml-64 min-h-screen bg-gradient-to-b from-[#f6f9ff] to-[#eaf0ff] text-gray-900">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 ">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">📜 History Perangkat</h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Cari data..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded w-full sm:w-64"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="week">📅 Minggu Ini</option>
            <option value="month">🗓️ Bulan Ini</option>
          </select>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left">Tanggal</th>
                <th className="px-4 py-2">T1</th>
                <th className="px-4 py-2">T2</th>
                <th className="px-4 py-2">T3</th>
                <th className="px-4 py-2">T4</th>
                <th className="px-4 py-2">T5</th>
                <th className="px-4 py-2">T6</th>
                <th className="px-4 py-2">Flow</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="px-4 py-2 text-gray-700">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">{log.Tegangan1}</td>
                    <td className="px-4 py-2">{log.Tegangan2}</td>
                    <td className="px-4 py-2">{log.Tegangan3}</td>
                    <td className="px-4 py-2">{log.Tegangan4}</td>
                    <td className="px-4 py-2">{log.Tegangan5}</td>
                    <td className="px-4 py-2">{log.Tegangan6}</td>
                    <td className="px-4 py-2">{log.Flow_Rate}</td>
                    <td className="px-4 py-2">{log.StatusMessage}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-4 text-center italic text-gray-500">
                    Tidak ada data log yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="my-10 bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-base font-semibold text-blue-700 mb-3">📈 Grafik Tegangan Mingguan / Bulanan</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredLogs.map(log => ({
              time: new Date(log.createdAt).toLocaleDateString(),
              T1: log.Tegangan1,
              T2: log.Tegangan2,
              T3: log.Tegangan3,
              T4: log.Tegangan4,
              T5: log.Tegangan5,
              T6: log.Tegangan6,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis unit=" V" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="T1" stroke="#8884d8" />
              <Line type="monotone" dataKey="T2" stroke="#82ca9d" />
              <Line type="monotone" dataKey="T3" stroke="#ffc658" />
              <Line type="monotone" dataKey="T4" stroke="#ff8042" />
              <Line type="monotone" dataKey="T5" stroke="#0088FE" />
              <Line type="monotone" dataKey="T6" stroke="#00C49F" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default HistoryPerangkat;
