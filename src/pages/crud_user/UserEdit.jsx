import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const UserEdit = () => {
  const { id } = useParams(); // ambil ID user dari URL
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "Karyawan",
    status: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;
  const token = localStorage.getItem("token");
  const userLogin = JSON.parse(localStorage.getItem("user"));
  const companyId = userLogin?.company_id || userLogin?.companyId || null;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Token": TENANT_TOKEN,
          },
        });
        const capitalizeRole = (role) => {
          const roles = {
            owner: "Owner",
            karyawan: "Karyawan",
            admin: "admin",
            casual: "casual",
          };
          return roles[role.toLowerCase()] || role;
        };
        const data = await res.json();
        if (res.ok) {
          setForm({
            name: data.name || "",
            username: data.username || "",
            password: "", // Kosongkan password
            role: capitalizeRole(data.role || "Karyawan"),
            status: data.status ?? true,
          });
        } else {
          console.error("Gagal ambil user:", data);
          alert("Gagal mengambil data user");
          navigate("/user");
        }
      } catch (err) {
        console.error(err);
        alert("Gagal terhubung ke server");
        navigate("/user");
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const payload = {
      name: form.name,
      username: form.username,
      password: form.password, // kosongkan jika tidak diubah
      role: form.role,
      status: form.status,
      company_id: companyId,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Tenant-Token": TENANT_TOKEN,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("RESPON ERROR DARI BACKEND:", data);
        if (data.errors) {
          setErrors(data.errors);
          return;
        }
        throw new Error(data.message || "Gagal mengupdate user");
      }

      alert("User berhasil diupdate!");
      navigate("/user");
    } catch (err) {
      alert(err.message || "Terjadi kesalahan saat menyimpan data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  console.log("Form value saat submit:", form);

  return (
    <div className="flex min-h-screen bg-[#f6f9ff] text-gray-900">
      <Sidebar />
      <main className="lg:pt-20 w-full px-4 py-6 flex justify-center">
        <div className="w-full">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/user")}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors md:hidden"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              ✏️ Edit Pengguna
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow space-y-5"
          >
            <div className="space-y-1">
              <label className="block text-sm font-medium">Nama</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className={`w-full p-2 border rounded ${errors.username ? "border-red-500" : ""}`}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium">Password (opsional)</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Biarkan kosong jika tidak diubah"
                className="w-full p-2 border rounded"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="Owner">Owner</option>
                <option value="Karyawan">Karyawan</option>
                <option value="admin">admin</option>
                <option value="casual">casual</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="status"
                checked={form.status}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <label className="text-sm">Aktif</label>
            </div>

            <div className="pt-4 flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate("/user")}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserEdit;
