import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const DetailRiwayat = () => {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterType, setFilterType] = useState("today");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");
  const [filterTimeStart, setFilterTimeStart] = useState("");
  const [filterTimeEnd, setFilterTimeEnd] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rawData, setRawData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [pendingDateStart, setPendingDateStart] = useState("");
  const [pendingDateEnd, setPendingDateEnd] = useState("");
  const [pendingTimeStart, setPendingTimeStart] = useState("");
  const [pendingTimeEnd, setPendingTimeEnd] = useState("");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  // Tambahkan state untuk report yang sudah terfilter
  const [filteredReport, setFilteredReport] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;
  const navigate = useNavigate();
  const limit = 5;

  const fetchTokenAndHistory = async (page = 1) => {
    try {
      const token = localStorage.getItem("token");

      const historyRes = await fetch(
        `${API_BASE_URL}/volt_device/History/${id}?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Token": TENANT_TOKEN,
          },
        }
      );

      if (!historyRes.ok) throw new Error("Gagal mengambil riwayat");

      const historyData = await historyRes.json();
      const data = historyData?.data?.result || [];

      const total = historyData.data?.metadata?.total || 1;
      setTotalPages(Math.ceil(total / limit));

      if (data.length > 0 && data[0].name) {
        setDeviceName(data[0].name);
      } else {
        setDeviceName(`Perangkat ${id}`);
      }

      const formatted = data.map(item => ({
        ...item,
        timestamp: new Date(item.createdAt).toLocaleString(),
      }));
      setRawData(formatted);
      setHistory(formatted);
      setFiltered(formatted);
    } catch (err) {
      console.error("❌ Gagal mengambil riwayat:", err);
      navigate("/404");
    }
  };

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/volt_device/Report/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Token": TENANT_TOKEN,
          },
        }
      );
      if (!res.ok) throw new Error("Gagal mengambil report");
      const json = await res.json();
      setReportData(json?.data?.result || []);
    } catch (err) {
      setReportData([]);
      console.error("❌ Gagal mengambil report:", err);
    }
  };

  useEffect(() => {
    fetchTokenAndHistory(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (!rawData.length) return;

    const now = new Date();
    let result = rawData;

    switch (filterType) {
      case "today":
        result = history.filter(h => {
          const created = new Date(h.createdAt);
          return created.toDateString() === now.toDateString();
        });
        break;

      case "week":
        result = history.filter(
          h => new Date(h.createdAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        );
        break;

      case "hour":
        if (filterDateStart && filterTimeStart && filterTimeEnd) {
          const from = new Date(`${filterDateStart}T${filterTimeStart}`);
          const to = new Date(`${filterDateStart}T${filterTimeEnd}`);
          to.setSeconds(59, 999);

          result = history.filter(h => {
            const created = new Date(h.createdAt);
            return created >= from && created <= to;
          });
        }
        break;

      case "month":
        if (filterDateStart) {
          result = history.filter(h =>
            h.createdAt.startsWith(filterDateStart)
          );
        }
        break;

      default:
        break;
    }

    setFiltered(result);
  }, [filterType, filterDateStart, filterDateEnd, filterTimeStart, filterTimeEnd, history]);

  useEffect(() => {
    if (filterType !== "today") {
      fetchReportData();
    }
  }, [filterType, id]);

  // Filter reportData saat filterType bukan "today"
  useEffect(() => {
    if (filterType === "today") return;

    let result = reportData;

    if (filterType === "month" && filterDateStart) {
      // filterDateStart format: "2025-08"
      result = reportData.filter(item =>
        item.createdAt.startsWith(filterDateStart)
      );
    }

    if (filterType === "hour" && filterDateStart && filterTimeStart && filterTimeEnd) {
      // filterDateStart format: "2025-08-07"
      // filterTimeStart format: "15:00"
      // filterTimeEnd format: "16:00"
      const from = new Date(`${filterDateStart}T${filterTimeStart}`);
      const to = new Date(`${filterDateStart}T${filterTimeEnd}`);
      to.setSeconds(59, 999);

      result = reportData.filter(item => {
        const created = new Date(item.createdAt);
        return created >= from && created <= to;
      });
    }

    if (filterType === "week") {
      const now = new Date();
      result = reportData.filter(
        item => new Date(item.createdAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      );
    }

    setFilteredReport(result);
  }, [filterType, filterDateStart, filterTimeStart, filterTimeEnd, reportData]);

  const handleApplyFilter = () => {
    setFilterDateStart(pendingDateStart);
    setFilterDateEnd(pendingDateEnd);
    setFilterTimeStart(pendingTimeStart);
    setFilterTimeEnd(pendingTimeEnd);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 text-gray-900">
      <Sidebar />
      <main className="flex-1 p-4 lg:mt-14">
        <div className="flex items-center gap-2 mb-4">
          <button
            className="md:hidden p-1 rounded hover:bg-gray-200"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 flex-1">
            📊 Riwayat {deviceName}
          </h1>
          {/* MOBILE FILTER BUTTON */}
          <div className="block sm:hidden">
            <button
              className="bg-blue-500 text-white p-2 rounded"
              onClick={() => setShowMobileFilter(v => !v)}
              aria-label="Filter"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FILTER INPUTS */}
        <div className={`mb-6 ${showMobileFilter ? "block" : "hidden"} sm:flex  sm:flex-row sm:flex-wrap sm:gap-4 sm:items-center`}>
          <select
            value={filterType}
            onChange={e => {
              setFilterType(e.target.value);
              setPendingDateStart("");
              setPendingDateEnd("");
              setPendingTimeStart("");
              setPendingTimeEnd("");
            }}
            className="border px-3 py-2 rounded w-full sm:w-auto mb-2 sm:mb-0"
          >
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="hour">Tanggal & Jam</option>
            <option value="month">Bulan</option>
          </select>

          {filterType === "hour" && (
            <>
              <input
                type="date"
                value={pendingDateStart}
                onChange={e => setPendingDateStart(e.target.value)}
                className="border px-3 py-2 rounded w-full sm:w-auto mb-2 sm:mb-0"
              />

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mb-2 sm:mb-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="time"
                    value={pendingTimeStart}
                    onChange={e => setPendingTimeStart(e.target.value)}
                    className="border px-3 py-2 rounded w-full sm:w-auto"
                  />
                  <span className="text-sm">sampai</span>
                  <input
                    type="time"
                    value={pendingTimeEnd}
                    onChange={e => setPendingTimeEnd(e.target.value)}
                    className="border px-3 py-2 rounded w-full sm:w-auto"
                  />
                </div>

                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto"
                  onClick={handleApplyFilter}
                >
                  Filter
                </button>
              </div>
            </>
          )}

          {filterType === "month" && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:items-center">
              <input
                type="month"
                value={pendingDateStart}
                onChange={e => setPendingDateStart(e.target.value)}
                className="border px-3 py-2 rounded w-full sm:w-auto"
              />
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto"
                onClick={() => {
                  setFilterDateStart(pendingDateStart);
                }}
              >
                Filter
              </button>
            </div>
          )}
        </div>

        {filterType === "today" ? (
          <>
            {/* TABEL BERSEBELAHAN */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* Tegangan Input */}
              <div className="bg-white p-4 border rounded shadow flex-1">
                <h2 className="text-lg font-semibold mb-3 text-gray-600">Tegangan Input</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead className="bg-blue-100 text-left">
                      <tr>
                        <th className="px-4 py-2 border">Tanggal</th>
                        <th className="px-4 py-2 border">Jam</th>
                        <th className="px-4 py-2 border">Tegangan RS</th>
                        <th className="px-4 py-2 border">Tegangan ST</th>
                        <th className="px-4 py-2 border">Tegangan RT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                              <svg
                                className="w-12 h-12 text-gray-300 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              <p className="text-gray-500 mb-1">Tidak ada data</p>
                              <p className="text-sm text-gray-400">Belum ada riwayat untuk ditampilkan</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-2 border">{new Date(item.createdAt).toLocaleTimeString()}</td>
                            <td className="px-4 py-2 border">{item.tegangan1} V</td>
                            <td className="px-4 py-2 border">{item.tegangan2} V</td>
                            <td className="px-4 py-2 border">{item.tegangan3} V</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Tegangan Output */}
              <div className="bg-white p-4 border rounded shadow flex-1">
                <h2 className="text-lg font-semibold mb-3 text-gray-600">Tegangan Output</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead className="bg-blue-100 text-left">
                      <tr>
                        <th className="px-4 py-2 border">Tanggal</th>
                        <th className="px-4 py-2 border">Jam</th>
                        <th className="px-4 py-2 border">RS (Tegangan 4)</th>
                        <th className="px-4 py-2 border">ST (Tegangan 5)</th>
                        <th className="px-4 py-2 border">RT (Tegangan 6)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                              <svg
                                className="w-12 h-12 text-gray-300 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              <p className="text-gray-500 mb-1">Tidak ada data</p>
                              <p className="text-sm text-gray-400">Belum ada riwayat untuk ditampilkan</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-2 border">{new Date(item.createdAt).toLocaleTimeString()}</td>
                            <td className="px-4 py-2 border">{item.tegangan4} V</td>
                            <td className="px-4 py-2 border">{item.tegangan5} V</td>
                            <td className="px-4 py-2 border">{item.tegangan6} V</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Flow Rate */}
              <div className="bg-white p-4 border rounded shadow flex-1">
                <h2 className="text-lg font-semibold mb-3 text-gray-600">Flow Rate</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead className="bg-blue-100 text-left">
                      <tr>
                        <th className="px-4 py-2 border">Tanggal</th>
                        <th className="px-4 py-2 border">Jam</th>
                        <th className="px-4 py-2 border">Kecepatan Air</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                              <svg
                                className="w-12 h-12 text-gray-300 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              <p className="text-gray-500 mb-1">Tidak ada data</p>
                              <p className="text-sm text-gray-400">Belum ada riwayat untuk ditampilkan</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-2 border">{new Date(item.createdAt).toLocaleTimeString()}</td>
                            <td className="px-4 py-2 border">{item.flow_rate} L/menit</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-blue-50 font-semibold">
                        <td className="px-4 py-2 border text-right" colSpan={2}>Total</td>
                        <td className="px-4 py-2 border">
                          {filtered.reduce((sum, item) => sum + (parseFloat(item.flow_rate) || 0), 0)} L/menit
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* GRAFIK BERSEBELAHAN */}
            <div className="flex flex-col lg:flex-row gap-6 mb-14">
              {/* Grafik Tegangan */}
              <div className="bg-white p-4 border rounded shadow flex-1">
                <h2 className="font-semibold mb-3 text-gray-800">📈 Grafik Tegangan</h2>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <svg
                      className="w-16 h-16 text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500 text-lg mb-1">Tidak ada data grafik</p>
                    <p className="text-sm text-gray-400 text-center">
                      Data akan ditampilkan ketika tersedia
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={filtered.map(item => ({
                        time: new Date(item.createdAt).toLocaleTimeString(),
                        t1: item.tegangan1,
                        t2: item.tegangan2,
                        t3: item.tegangan3,
                        t4: item.tegangan4,
                        t5: item.tegangan5,
                        t6: item.tegangan6,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="t1" stroke="#8884d8" name="Tegangan 1" />
                      <Line type="monotone" dataKey="t2" stroke="#82ca9d" name="Tegangan 2" />
                      <Line type="monotone" dataKey="t3" stroke="#ffc658" name="Tegangan 3" />
                      <Line type="monotone" dataKey="t4" stroke="#58bcff" name="Tegangan 4" />
                      <Line type="monotone" dataKey="t5" stroke="#f158ff" name="Tegangan 5" />
                      <Line type="monotone" dataKey="t6" stroke="#9bff58" name="Tegangan 6" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              {/* Grafik Flow Rate */}
              <div className="bg-white p-4 border rounded shadow flex-1">
                <h2 className="font-semibold mb-3 text-gray-800">💧 Grafik Flow Rate</h2>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <svg
                      className="w-16 h-16 text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500 text-lg mb-1">Tidak ada data grafik</p>
                    <p className="text-sm text-gray-400 text-center">
                      Data akan ditampilkan ketika tersedia
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={filtered.map(item => ({
                        time: new Date(item.createdAt).toLocaleTimeString(),
                        flow: item.total_flow_today,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="flow" stroke="#ff8042" name="Flow Rate" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Tabel Report */}
            <div className="bg-white p-2 sm:p-4 border rounded shadow mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-600">Report Daya & Flow</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-xs sm:text-sm">
                  <thead className="bg-blue-100 text-left">
                    <tr>
                      <th className="px-2 sm:px-4 py-1 sm:py-2 border">Tanggal</th>
                      <th className="px-2 sm:px-4 py-1 sm:py-2 border">Jam</th>
                      <th className="px-2 sm:px-4 py-1 sm:py-2 border">Total Daya</th>
                      <th className="px-2 sm:px-4 py-1 sm:py-2 border">Total Flow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReport.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-gray-500">Tidak ada data</td>
                      </tr>
                    ) : (
                      filteredReport.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-4 py-1 sm:py-2 border">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 border">{new Date(item.createdAt).toLocaleTimeString()}</td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 border">{item.Factor1}</td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 border">{item.Factor2}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grafik Report */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8 sm:mb-14">
              {/* Grafik Daya */}
              <div className="bg-white p-2 sm:p-4 border rounded shadow flex-1">
                <h2 className="font-semibold mb-2 sm:mb-3 text-gray-800 text-base sm:text-lg">📈 Grafik Daya</h2>
                {filteredReport.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <svg
                      className="w-16 h-16 text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500 text-lg mb-1">Data belum tersedia</p>
                    <p className="text-sm text-gray-400 text-center">
                      Silakan pilih rentang waktu yang berbeda
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : 300}>
                    <LineChart
                      data={filteredReport.map(item => ({
                        time: new Date(item.createdAt).toLocaleString(),
                        total: item.Factor1,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Daya" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              {/* Grafik Flow */}
              <div className={`bg-white p-2 sm:p-4 border rounded shadow flex-1 ${totalPages <= 1 ? "mb-8 lg:mb-0" : ""}`}>
                <h2 className="font-semibold mb-2 sm:mb-3 text-gray-800 text-base sm:text-lg">💧 Grafik Flow</h2>
                {filteredReport.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <svg
                      className="w-16 h-16 text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500 text-lg mb-1">Data belum tersedia</p>
                    <p className="text-sm text-gray-400 text-center">
                      Silakan pilih rentang waktu yang berbeda
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : 300}>
                    <LineChart
                      data={filteredReport.map(item => ({
                        time: new Date(item.createdAt).toLocaleString(),
                        flow: item.Factor2,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="flow" stroke="#ff8042" name="Total Flow" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 my-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-full bg-blue-500 text-white ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                }`}
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <span className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full bg-blue-500 text-white ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                }`}
            >
              <FiArrowRight className="text-xl" />
            </button>
          </div>
        )}

        {/* Tambahkan margin bawah pada mobile jika paginate tidak tampil */}
        {totalPages <= 1 && (
          <div className="block lg:hidden mb-10" />
        )}
      </main>
    </div>
  );
};

export default DetailRiwayat;
