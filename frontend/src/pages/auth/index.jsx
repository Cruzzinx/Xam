import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { API_URL } from "../../config/api";
import { toast } from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const e = {};
    if (!username) e.username = "Username wajib diisi";
    if (!password) e.password = "Password wajib diisi";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Login Gagal");
      }
    } catch (err) {
      console.error("Error saat login:", err);
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-w-screen">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-300 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 transition-colors duration-300">
        <div className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 border border-white/20 dark:border-slate-700">
          <header className="mb-6 text-center">
            <h2 className="text-3xl font-semibold text-blue-950 dark:text-white mb-2">Selamat Datang</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">Masuk kembali ke akunmu</p>
          </header>


          <form onSubmit={handleSubmit}>
            <label className="block mb-4">
              <span className="text-sm text-gray-700 dark:text-slate-300">Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Masukkan Username"
              />
              {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
            </label>

            <label className="block mb-4">
              <span className="text-sm text-gray-700 dark:text-slate-300">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  placeholder="Masukkan Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </label>

            <button
              type="submit"
              className="w-full rounded-xl px-4 py-2 text-white bg-blue-950 dark:bg-blue-600 hover:bg-blue-900 dark:hover:bg-blue-500 disabled:opacity-60 transition-all font-bold"
              disabled={loading}
            >
              {loading ? "Sedang Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}