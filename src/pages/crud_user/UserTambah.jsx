import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useNavigate } from "react-router-dom";

let isSubmitting = false;

const UserTambah = () => {
    const [form, setForm] = useState({
        name: "",
        username: "",
        password: "",
        role: "Karyawan",
        status: true,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;
    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });

        // Hapus error ketika input diubah
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ⛔ Cegah spam klik sinkron
        if (isSubmitting || loading) return;
        isSubmitting = true;

        setLoading(true);
        setErrors({});

        try {
            const res = await fetch(`${API_BASE_URL}/user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "X-Tenant-Token": TENANT_TOKEN,
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Respon error:", data);

                if (data.errors) {
                    setErrors(data.errors);
                    return;
                }

                throw new Error(data.message || "Gagal menambahkan user");
            }

            alert("User berhasil ditambahkan!");
            navigate("/user");
        } catch (err) {
            alert(err.message || "Terjadi kesalahan saat menyimpan data");
            console.error(err);
        } finally {
            isSubmitting = false;
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-b from-[#f6f9ff] to-[#eaf0ff]">
            <Sidebar />
            <main className="flex-1 p-4 md:mt-16 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate("/user")}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors md:hidden"
                    >
                        <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <h1 className="text-xl md:text-xl font-medium text-gray-800">
                        👥 Tambah Pengguna Baru
                    </h1>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl shadow-sm border border-gray-100"
                >
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 text-black gap-6">
                            {/* Nama */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Masukkan nama lengkap"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Username */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="Masukkan username"
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        errors.username
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-200 focus:ring-blue-500"
                                    } focus:border-transparent transition-all`}
                                />
                                {errors.username && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Masukkan password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Role Pengguna
                                </label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="Owner">Owner</option>
                                    <option value="Karyawan">Karyawan</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div className="flex items-center">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        name="status"
                                        checked={form.status}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Pengguna Aktif
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/user")}
                            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium focus:ring-2 focus:ring-gray-200"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg transition-colors font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center justify-center gap-2 ${
                                loading
                                    ? "bg-blue-400 pointer-events-none cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-4 w-4"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    Simpan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default UserTambah;
