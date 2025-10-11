import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

let isSubmitting = false;

export default function TambahPerangkat() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        user_id: "",
        max_flow_daily: "",
        start_time: "",
        end_time: "",
        daya: "",
    });
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE_URL}/user`, {
                    headers: {
                        "X-Tenant-Token": TENANT_TOKEN,
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data.result);
            } catch (error) {
                console.error("Gagal mengambil data user", error);
            }
        };

        fetchUsers();
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
  e.preventDefault();

  // Cegah spam klik secara sinkron
  if (isSubmitting || isLoading) return;
  isSubmitting = true;

  if (!form.name.trim() || !form.user_id) {
    alert("Nama perangkat dan user harus diisi!");
    isSubmitting = false;
    return;
  }

  setIsLoading(true);

  try {
    await axios.post(`${API_BASE_URL}/Volt_device`, {
      name: form.name,
      user_id: parseInt(form.user_id),
      max_flow_daily: parseFloat(form.max_flow_daily),
      start_time: form.start_time,
      end_time: form.end_time,
      tegangan1: 0,
      tegangan2: 0,
      tegangan3: 0,
      tegangan4: 0,
      tegangan5: 0,
      tegangan6: 0,
      flow_rate: 0,
      Daya: parseFloat(form.daya),
    }, {
      headers: {
        "X-Tenant-Token": TENANT_TOKEN,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    navigate("/Perangkat");
  } catch (error) {
    console.error("Gagal menambahkan perangkat", error);
    alert("Gagal menambahkan perangkat.");
  } finally {
    isSubmitting = false; // reset agar bisa digunakan lagi nanti
    setIsLoading(false);
  }
};

    return (
        <div className="flex min-h-screen bg-gradient-to-b from-[#f6f9ff] to-[#eaf0ff]">
            <Sidebar />
            <main className="flex-1 p-4 lg:p-6 pb-20">
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate("/Perangkat")}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors md:hidden"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                        ➕ Tambah Perangkat Baru
                    </h1>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 space-y-6">
                        {/* Form Fields */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Nama Perangkat */}
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Nama Perangkat
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 bg-white/50"
                                    required
                                    placeholder="Masukkan nama perangkat"
                                />
                            </div>

                            {/* Pilih User */}
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Pilih Pengguna
                                </label>
                                <select
                                    name="user_id"
                                    value={form.user_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 bg-white/50"
                                >
                                    <option value="">-- Pilih Pengguna --</option>
                                    {users?.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.username}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Max Flow Rate & Daya */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Max Flow Rate Harian (L)
                                </label>
                                <input
                                    type="number"
                                    name="max_flow_daily"
                                    value={form.max_flow_daily}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 bg-white/50"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Daya (Watt)
                                </label>
                                <input
                                    type="number"
                                    name="daya"
                                    value={form.daya}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 bg-white/50"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Jam Operasional */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Jam Mulai
                                </label>
                                <input
                                    type="time"
                                    name="start_time"
                                    value={form.start_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 bg-white/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Jam Selesai
                                </label>
                                <input
                                    type="time"
                                    name="end_time"
                                    value={form.end_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 bg-white/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/Perangkat")}
                            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium focus:ring-2 focus:ring-gray-200"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg transition-colors font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center justify-center gap-2 ${
                                isLoading 
                                    ? 'bg-blue-400 text-white cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    Simpan Perangkat
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
