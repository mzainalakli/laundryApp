import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/loginbg.jpg";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Token": TENANT_TOKEN,
        },
        body: JSON.stringify({ username, password }),
      });

      const resJson = await response.json(); // Ambil isi body

      if (!response.ok) {
        // Cek apakah ada error spesifik dari backend (misal: password salah)
        const errorMessage =
          resJson?.errors?.password ||
          resJson?.errors?.username ||
          resJson?.message ||
          "Login gagal";

        throw new Error(errorMessage);
      }

      const user = resJson.creds;

      localStorage.setItem("token", resJson.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("role", user.role);

      navigate("/");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={logo}
          alt="Laundry Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center">
          <div className="max-w-lg text-white text-center p-12">
            <h1 className="text-4xl font-bold mb-6">Selamat Datang! 👋</h1>
            <p className="text-blue-100 text-lg">
              Sistem monitoring untuk memantau perangkat laundry Anda secara
              real-time
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Login</h2>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p className="text-sm">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black transition"
                    placeholder="Masukkan username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black transition"
                    placeholder="Masukkan password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition hover:-translate-y-0.5"
              >
                Masuk
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">Monitoring System v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
