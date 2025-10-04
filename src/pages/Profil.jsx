import { useNavigate } from "react-router-dom"; 
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Profil = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Ambil info user saat ini
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login"); // redirect jika tidak login
      }
    });

    return () => unsubscribe();
  }, []);

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 bg-gray-900 text-white min-h-screen">
        <div className="pt-20 sm:pt-20 md:pt-6 px-4 sm:px-6 max-w-xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h1 className="text-2xl font-bold mb-4 text-center ">👤 Profil Pengguna</h1>

            {user ? (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold">Email:</label>
                  <p className="text-blue-300">{user.email}</p>
                </div>
                <div>
                  <label className="font-semibold">UID:</label>
                  <p className="text-sm text-gray-400 break-words">{user.uid}</p>
                </div>
                <div className="text-center mt-6">
                  <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                    🚪 Logout
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-yellow-300 text-center">Memuat data pengguna...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;
