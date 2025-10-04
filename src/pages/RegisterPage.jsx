import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirm) {
      setErrorMsg("Password dan konfirmasi tidak cocok!");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          password,
          role: "casual", // default role
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mendaftar");
      }

      // Redirect ke halaman login setelah berhasil
      navigate("/login");
    } catch (error) {
      setErrorMsg(error.message || "Gagal mendaftar");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#f6f9ff] to-[#eaf0ff] text-gray-900 px-4">
      <Card className="w-full max-w-md p-6 bg-white bg-opacity-80 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-500 mb-6">📝 Daftar Akun</h2>
        {errorMsg && <p className="text-red-500 text-sm text-center mb-4">{errorMsg}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Nama Lengkap</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Konfirmasi Password</label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            Daftar
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-blue-400 hover:underline"
            onClick={() => navigate("/login")}
          >
            Sudah punya akun? Login
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
