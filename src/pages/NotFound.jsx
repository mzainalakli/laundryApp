import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50 text-center px-4">
      <div className="max-w-md">
        <h1 className="text-6xl font-extrabold text-blue-600 animate-bounce">404</h1>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mt-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mt-2">
          Maaf, halaman yang Anda tuju tidak tersedia atau Anda tidak memiliki izin untuk mengaksesnya.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
        >
          ⬅️ Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
