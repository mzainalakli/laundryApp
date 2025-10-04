import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronLeft } from "lucide-react";

const UserNonaktif = () => {
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
                    "X-Tenant-Token": TENANT_TOKEN,
                },
            });

            if (!res.ok) throw new Error("Gagal mengambil data user");

            const json = await res.json();
            const nonActiveUsers = (json.result || []).filter(
                (user) => user.status === false || user.status === 0
            );
            setUsers(nonActiveUsers);
        } catch (err) {
            console.error(err);
            alert("Gagal mengambil data user");
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/user/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "X-Tenant-Token": TENANT_TOKEN,
                },
            });

            if (!res.ok) throw new Error("Gagal menghapus user");

            alert("User berhasil dihapus");
            fetchUsers(); // refresh list
        } catch (err) {
            console.error(err);
            alert("Gagal menghapus user");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="flex min-h-screen bg-gradient-to-b from-[#f6f9ff] to-[#eaf0ff] text-gray-900">
            <Sidebar />
            <main className="flex-1 p-4 md:mt-16 pb-20">
                {/* Header Section */}
                <div className=" mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
                        <div className="flex items-center gap-3">
                            {/* Desktop Title */}
                            <h1 className="hidden md:block text-xl lg:text-2xl font-bold text-red-700">
                                🔒 Pengguna Tidak Aktif
                            </h1>

                            {/* Mobile Title */}
                            <div className="flex md:hidden items-center gap-3">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-red-700" />
                                </button>
                                <h1 className="text-xl font-bold text-red-700">
                                    🔒 Pengguna Tidak Aktif
                                </h1>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate("/user")}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            👥 Kembali ke Pengguna Aktif
                        </button>
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
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
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                                    Tidak Ada Pengguna Tidak Aktif
                                </h3>
                                <p className="text-gray-500 text-center">
                                    Semua pengguna sedang dalam status aktif
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full border-collapse text-sm lg:text-base">
                                    <thead className="bg-red-50 text-red-700 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-medium border-r border-gray-200">No</th>
                                            <th className="px-6 py-4 text-left font-medium border-r border-gray-200">Nama</th>
                                            <th className="px-6 py-4 text-left font-medium border-r border-gray-200">Username</th>
                                            <th className="px-6 py-4 text-left font-medium border-r border-gray-200">Role</th>
                                            <th className="px-6 py-4 text-left font-medium">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {users.map((user, index) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 border-r border-gray-200">{index + 1}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 border-r border-gray-200">
                                                    @{user.username}
                                                </td>
                                                <td className="px-6 py-4 border-r border-gray-200">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
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

                            {/* Mobile Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                                {users.map((user, index) => (
                                    <div
                                        key={user.id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                                {user.role}
                                            </span>
                                            <span className="text-sm text-gray-500">#{index + 1}</span>
                                        </div>
                                        <h3 className="font-medium text-gray-900 mb-1">{user.name}</h3>
                                        <p className="text-sm text-gray-500 mb-4">@{user.username}</p>
                                        <div className="flex items-center justify-end gap-4 pt-3 border-t border-gray-100">
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

                {/* Floating Action Button */}
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

export default UserNonaktif;
