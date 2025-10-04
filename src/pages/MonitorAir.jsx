import { useState, useEffect } from "react";
import { database } from "/src/firebase-config";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft } from "lucide-react";

const Dashboard = () => {
  const [perangkatList, setPerangkatList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const perangkatRef = ref(database, "/history_air");

    onValue(perangkatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const perangkatNames = Object.keys(data);
        setPerangkatList(perangkatNames);
      }
    });
  }, []);

  const handlePerangkatClick = (perangkat) => {
    navigate(`/perangkat_air/${perangkat}`);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f6f9ff] to-[#eaf0ff] text-black-900 ml-0 md:ml-64">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Header dengan tombol kembali */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-800 hover:text-blue-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 text-center flex-1">
            👋 Selamat Datang
          </h1>

          <div className="w-[50px]">{/* Spacer untuk rata kanan */}</div>
        </div>

        <p className="text-center text-gray-500 text-sm sm:text-base">
          Pilih perangkat untuk melihat detailnya
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-10 max-w-5xl mx-auto">
          {perangkatList.map((perangkat) => (
            <button
              key={perangkat}
              onClick={() => handlePerangkatClick(perangkat)}
              className="py-6 bg-white hover:bg-blue-100 text-gray-800 font-semibold rounded-xl w-full text-center border border-blue-200 shadow"
            >
              {perangkat}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
