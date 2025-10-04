import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronLeft } from "lucide-react";

const User = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;
    const token = localStorage.getItem("token");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/user`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "X-Tenant-Token": TENANT_TOKEN
                }
            });

            if (!res.ok) throw new Error("Gagal mengambil data user");

            const json = await res.json();
            const activeUsers = (json.result || []).filter(user => user.status === true || user.status === 1);
            setUsers(activeUsers);
        } catch (err) {
            console.error(err);
            alert("Gagal mengambil data user");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteUser = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/user/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "X-Tenant-Token": TENANT_TOKEN
                }
            });

            if (!res.ok) throw new Error("Gagal menghapus user");

            alert("User berhasil dihapus");
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Gagal menghapus user");
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-b from-[#f6f9ff] to-[#eaf0ff] text-gray-900">
            <Sidebar />
            <main className="flex-1 p-4 md:mt-16 pb-20">
                {/* Header Section - Enhanced */}
                <div className="">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 lg:mb-8 gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            {/* Desktop Title */}
                            <div className="hidden md:flex items-center gap-3">
                                <h1 className="text-2xl lg:text-2xl font-bold text-gray-800">
                                    👥 Pengguna Aktif
                                </h1>
                            </div>

                            {/* Mobile Title */}
                            <div className="flex md:hidden items-center gap-3">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <h1 className="text-xl font-bold text-gray-800">
                                    👥 Pengguna Aktif
                                </h1>
                            </div>

                            {/* Status Button */}
                            <button
                                onClick={() => navigate("/user/nonaktif")}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                🔒 Lihat Pengguna Tidak Aktif
                            </button>
                        </div>

                        {/* Desktop Add Button */}
                        <div className="hidden md:block">
                            <button
                                onClick={() => navigate("/user/tambah")}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="font-medium">Tambah Pengguna</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Section - Enhanced */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-600 font-medium">Memuat data pengguna...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                <svg
                                    className="w-20 h-20 text-gray-300 mb-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                                    Belum ada pengguna aktif
                                </h3>
                                <p className="text-gray-500 text-center mb-8">
                                    Silakan tambah pengguna baru untuk memulai
                                </p>
                                <button
                                    onClick={() => navigate("/user/tambah")}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="font-medium">Tambah Pengguna Baru</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table - Enhanced */}
                            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full border-collapse text-sm lg:text-base">
                                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-medium border-b border-gray-200">No</th>
                                            <th className="px-6 py-4 text-left font-medium border-b border-gray-200">Nama</th>
                                            <th className="px-6 py-4 text-left font-medium border-b border-gray-200">Username</th>
                                            <th className="px-6 py-4 text-left font-medium border-b border-gray-200">Role</th>
                                            <th className="px-6 py-4 text-left font-medium border-b border-gray-200">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {users.map((user, index) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4  border-gray-200">{index + 1}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900  border-gray-200">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600  border-gray-200">
                                                    @{user.username}
                                                </td>
                                                <td className="px-6 py-4  border-gray-200">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => navigate(`/user/edit/${user.id}`)}
                                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm("Yakin hapus user ini?")) {
                                                                    deleteUser(user.id);
                                                                }
                                                            }}
                                                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards - Enhanced */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                                {users.map((user, index) => (
                                    <div
                                        key={user.id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {user.role}
                                            </span>
                                            <span className="text-sm text-gray-500">#{index + 1}</span>
                                        </div>
                                        <h3 className="font-medium text-gray-900 mb-1">{user.name}</h3>
                                        <p className="text-sm text-gray-500 mb-4">@{user.username}</p>
                                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                                            <button
                                                onClick={() => navigate(`/user/edit/${user.id}`)}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Yakin hapus user ini?")) {
                                                        deleteUser(user.id);
                                                    }
                                                }}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Mobile Add Button - Enhanced */}
                <div className="fixed bottom-20 right-6 md:hidden">
                    <button
                        onClick={() => navigate("/user/tambah")}
                        className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default User;
