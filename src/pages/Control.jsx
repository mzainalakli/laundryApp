import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, set, onValue } from "firebase/database";
import { database } from "/src/firebase-config.js";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import { FaPowerOff } from "react-icons/fa";

const Control = () => {
  const [relayStatus, setRelayStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const relayRef = ref(database, "/sensor/status");
    const unsubscribe = onValue(relayRef, (snapshot) => {
      const status = snapshot.val();
      if (typeof status === "boolean") {
        setRelayStatus(status);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleRelay = () => {
    if (relayStatus !== null) {
      const newStatus = !relayStatus;
      set(ref(database, "/sensor/status"), newStatus);
    }
  };

  const isLoading = relayStatus === null;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 bg-gray-900 min-h-screen text-white">
        <div className="pt-20 sm:pt-20 md:pt-6 px-4 sm:px-6 min-h-screen flex flex-col items-center relative">
          <h2 className="text-3xl font-bold text-center mb-3">🔌 Kontrol Relay</h2>

          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:32px_32px] z-0" />

          {/* Konten utama */}
          <Card
            className={`relative z-10 p-6 sm:p-8 w-full max-w-md text-center rounded-2xl shadow-2xl transition-all ${
              relayStatus ? "bg-green-700/80" : "bg-gray-800/80"
            } backdrop-blur-md border border-white/10`}
          >
            <FaPowerOff
              className={`text-6xl mb-4 mx-auto transition-transform duration-300 ${
                relayStatus ? "text-white animate-pulse" : "text-gray-400"
              }`}
            />
            <h2 className="text-2xl font-bold tracking-wide mb-2">Kontrol Relay</h2>
            <p className="text-sm text-gray-300 mb-6">
              Nyalakan atau matikan perangkat melalui kontrol di bawah ini.
            </p>

            {isLoading ? (
              <p className="text-yellow-300 font-semibold mt-4">Memuat status relay...</p>
            ) : (
              <>
                <Switch
                  checked={relayStatus}
                  onCheckedChange={toggleRelay}
                  className="scale-150 mx-auto"
                />
                <p
                  className={`text-lg font-semibold mt-5 ${
                    relayStatus ? "text-green-200" : "text-red-400"
                  }`}
                >
                  Status: {relayStatus ? "AKTIF" : "NON-AKTIF"}
                </p>
              </>
            )}

            <p className="mt-6 text-sm text-gray-400 italic">
              Waktu saat ini: {currentTime.toLocaleTimeString()}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Control;
