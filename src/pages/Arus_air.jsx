import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import { database } from "/src/firebase-config";
import { ref, onValue } from "firebase/database";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Monitor = () => {
  const [totalAirLastHour, setTotalAirLastHour] = useState(0);
  const [totalAirToday, setTotalAirToday] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const idPerangkat = "perangkat1";

  useEffect(() => {
    const historyRef = ref(database, `/history_air/${idPerangkat}`);
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      let totalLastHour = 0;
      let totalToday = 0;
      const chart = [];

      Object.entries(data).forEach(([timestamp, entry]) => {
        const entryDate = new Date(timestamp);

        if (entryDate >= oneHourAgo) {
          totalLastHour += entry.total_air || 0;
        }

        if (entryDate >= midnight) {
          totalToday += entry.total_air || 0;
        }

        // Filter by date
        if (selectedDate) {
          const [entryDay] = timestamp.split("T");
          if (entryDay !== selectedDate) return;
        }

        // Filter by time (if date also selected)
        if (selectedTime && selectedDate) {
          const entryTime = timestamp.split("T")[1].slice(0, 5); // HH:mm
          if (entryTime !== selectedTime) return;
        }

        chart.push({
          name: timestamp.replace("T", "\n"), // show date + time
          value: entry.total_air,
        });
      });

      setTotalAirLastHour(totalLastHour.toFixed(3));
      setTotalAirToday(totalToday.toFixed(3));
      setChartData(chart);
    });
  }, [selectedDate, selectedTime]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl text-black font-bold">Monitoring Air</h1>

        {/* Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Tanggal</label>
            <input
              type="date"
              className="p-2 border rounded"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime(""); // Reset jam jika ganti tanggal
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Jam (opsional)</label>
            <input
              type="time"
              className="p-2 border rounded"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={!selectedDate}
            />
          </div>
        </div>

        {/* Kartu Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card className="p-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-700">Total Air 1 Jam Terakhir</h2>
            <p className="text-2xl text-blue-600 mt-2">{totalAirLastHour} L</p>
          </Card>
          <Card className="p-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-700">Total Air Hari Ini</h2>
            <p className="text-2xl text-green-600 mt-2">{totalAirToday} L</p>
          </Card>
        </div>

        {/* Grafik */}
        <div className="bg-white p-3 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Grafik Total Air</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickFormatter={(str) => {
                  const [date] = str.split("\n");
                  const dateObj = new Date(date);
                  if (isNaN(dateObj)) return str;
                  return `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
                }}
              />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* History Table */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Riwayat Penggunaan Air</h2>
          <div className="overflow-auto rounded-lg shadow">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200 text-gray-700 text-left">
                <tr>
                  <th className="px-4 py-2">No</th>
                  <th className="px-4 py-2">Waktu</th>
                  <th className="px-4 py-2">Total Air (L)</th>
                </tr>
              </thead>
              <tbody>
                {chartData.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-center text-gray-500" colSpan="3">
                      Tidak ada data.
                    </td>
                  </tr>
                ) : (
                  chartData.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2 whitespace-pre-line">{item.name}</td>
                      <td className="px-4 py-2">{item.value?.toFixed(3)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Monitor;
