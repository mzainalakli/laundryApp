import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from "@/components/Sidebar";
import { ChevronLeft } from 'lucide-react';

const EditDevice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState({
    name: '',
    user_id: '',
    max_flow_daily: '',
    start_time: '',
    end_time: '',
    Daya: '',
    Factor1: '',
    Factor2: '',
    Factor3: '',
    Factor4: '',
    Factor5: '',
    Factor6: '',
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;
  const token = localStorage.getItem("token");

  const headers = {
    'X-Tenant-Token': TENANT_TOKEN,
    'Authorization': `Bearer ${token}`,
  };

  useEffect(() => {
    const fetchDeviceAndUsers = async () => {
      try {
        const deviceRes = await axios.get(`${API_BASE_URL}/volt_device/${id}`, { headers });
        setDevice({
          name: deviceRes.data.name,
          user_id: deviceRes.data.user_id,
          max_flow_daily: deviceRes.data.max_flow_daily || '',
          start_time: deviceRes.data.start_time || '',
          end_time: deviceRes.data.end_time || '',
          Daya: deviceRes.data.Daya || '',
          Factor1: deviceRes.data.Factor1,
          Factor2: deviceRes.data.Factor2,
          Factor3: deviceRes.data.Factor3,
          Factor4: deviceRes.data.Factor4,
          Factor5: deviceRes.data.Factor5,
          Factor6: deviceRes.data.Factor6,
          tegangan1: deviceRes.data.tegangan1,
          tegangan2: deviceRes.data.tegangan2,
          tegangan3: deviceRes.data.tegangan3,
          tegangan4: deviceRes.data.tegangan4,
          tegangan5: deviceRes.data.tegangan5,
          tegangan6: deviceRes.data.tegangan6,
          flow_rate: deviceRes.data.flow_rate,
          total_flow_today: deviceRes.data.total_flow_today,
        });

        const usersRes = await axios.get(`${API_BASE_URL}/user`, { headers });
        setUsers(usersRes.data.result);
        setLoading(false);
      } catch (err) {
        console.error('Gagal mengambil data:', err);
        setLoading(false);
      }
    };

    fetchDeviceAndUsers();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDevice((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Fungsi untuk konversi dari waktu lokal (WIB) ke UTC
    const toUTC = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const localDate = new Date();
      localDate.setHours(hours, minutes, 0, 0);
      const utcHours = localDate.getUTCHours().toString().padStart(2, '0');
      const utcMinutes = localDate.getUTCMinutes().toString().padStart(2, '0');
      return `${utcHours}:${utcMinutes}`;
    };

    try {
      await axios.put(`${API_BASE_URL}/volt_device/${id}`, {
        name: device.name,
        user_id: parseInt(device.user_id),
        max_flow_daily: parseFloat(device.max_flow_daily),
        start_time: device.start_time,
        end_time: device.end_time,
        Daya: parseFloat(device.Daya),
        tegangan1: device.tegangan1,
        tegangan2: device.tegangan2,
        tegangan3: device.tegangan3,
        tegangan4: device.tegangan4,
        tegangan5: device.tegangan5,
        tegangan6: device.tegangan6,
        flow_rate: device.flow_rate,
        total_flow_today: device.total_flow_today,
        Factor1: parseFloat(device.Factor1),
        Factor2: parseFloat(device.Factor2),
        Factor3: parseFloat(device.Factor3),
        Factor4: parseFloat(device.Factor4),
        Factor5: parseFloat(device.Factor5),
        Factor6: parseFloat(device.Factor6),
      }, { headers });

      alert('Perangkat berhasil diperbarui!');
      navigate('/Perangkat');
    } catch (err) {
      console.error('Gagal memperbarui perangkat:', err);
      alert('Gagal memperbarui perangkat.');
    }
  };

  if (loading) return <div className="p-4">Memuat data perangkat...</div>;

  return (
    <div className="flex min-h-screen bg-[#f6f9ff] text-gray-900">
      <Sidebar />

      <div className="flex-1 lg:pt-20 p-4 mb-14">
        <main className="mx-auto w-full">
          <div className="flex items-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-gray-600 md:hidden hover:text-gray-800 transition"
              title="Kembali"
            >
              <ChevronLeft className="text-2xl" />
            </button>
            <h1 className="font-medium text-xl text-black">
              ✏️ Edit Perangkat
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-2xl shadow space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-900">Nama Perangkat</label>
              <input
                name="name"
                type="text"
                value={device.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Pilih User</label>
              <select
                name="user_id"
                value={device.user_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih User --</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Max Flow Rate Harian (L)</label>
              <input
                type="number"
                name="max_flow_daily"
                value={device.max_flow_daily}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Daya (Watt)</label>
              <input
                type="number"
                name="Daya"
                value={device.Daya}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Jam Mulai Operasional</label>
              <input
                type="time"
                name="start_time"
                value={device.start_time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Jam Selesai Operasional</label>
              <input
                type="time"
                name="end_time"
                value={device.end_time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Kalibrasi Tegangan</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Input Tegangan RS (Factor1)</label>
                  <input type="number" name="Factor1" value={device.Factor1} onChange={handleChange} step="0.01"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Output Tegangan RS (Factor4)</label>
                  <input type="number" name="Factor4" value={device.Factor4} onChange={handleChange} step="0.01"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Input Tegangan ST (Factor2)</label>
                  <input type="number" name="Factor2" value={device.Factor2} onChange={handleChange} step="0.01"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Output Tegangan ST (Factor5)</label>
                  <input type="number" name="Factor5" value={device.Factor5} onChange={handleChange} step="0.01"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Input Tegangan RT (Factor3)</label>
                  <input type="number" name="Factor3" value={device.Factor3} onChange={handleChange} step="0.01"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Output Tegangan RT (Factor6)</label>
                  <input type="number" name="Factor6" value={device.Factor6} onChange={handleChange} step="0.01"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/Perangkat")}
                className="px-4 py-2 border border-blue-500 text-blue-600 rounded hover:bg-blue-100 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                💾 Simpan
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default EditDevice;
