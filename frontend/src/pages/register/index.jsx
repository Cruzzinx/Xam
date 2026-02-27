import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [role, setRole] = useState("siswa");

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        const e = {};
        if (!name) e.name = "Nama lengkap wajib diisi";
        if (!email) e.email = "Email wajib diisi";
        else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Format email tidak valid";
        if (!username) e.username = "Username wajib diisi";
        if (!password) e.password = "Password wajib diisi";
        else if (password.length < 6) e.password = "Password minimal 6 karakter";
        if (password !== passwordConfirmation) e.password_confirmation = "Konfirmasi password tidak cocok";
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const v = validate();
        setErrors(v);
        if (Object.keys(v).length) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    username,
                    password,
                    password_confirmation: passwordConfirmation,
                    role
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                    throw new Error("Validasi gagal");
                }
                throw new Error(data.message || "Registrasi gagal");
            }

            toast.success("Registrasi berhasil! Mengalihkan ke login...");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            toast.error(err.message || "Gagal Register");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner message="Mendaftarkan akun baru..." />;

    return (
        <div className="container min-w-screen">
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-blue-300 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-10 transition-colors duration-300">
                <div className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 border border-white/20 dark:border-slate-700">
                    <header className="mb-6 text-center">
                        <h1 className="text-2xl font-bold text-indigo-950 dark:text-white mb-2">Buat Akun Baru</h1>
                        <p className="text-sm text-indigo-800/60 dark:text-slate-400 font-medium">Lengkapi data di bawah untuk mendaftar</p>
                    </header>


                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-semibold text-indigo-900/70 dark:text-slate-300">Nama Lengkap</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-xl border border-indigo-100 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 px-4 py-3 leading-tight text-indigo-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                    placeholder="Contoh: Budi Santoso"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </label>

                            <label className="block">
                                <span className="text-sm font-semibold text-indigo-900/70 dark:text-slate-300">Username</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="mt-1 block w-full rounded-xl border border-indigo-100 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 px-4 py-3 leading-tight text-indigo-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                    placeholder="username_kamu"
                                />
                                {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
                            </label>

                            <label className="block">
                                <span className="text-sm font-semibold text-indigo-900/70 dark:text-slate-300">Email</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-xl border border-indigo-100 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 px-4 py-3 leading-tight text-indigo-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                    placeholder="email@example.com"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-sm font-semibold text-indigo-900/70 dark:text-slate-300">Password</span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full rounded-xl border border-indigo-100 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 px-4 py-3 leading-tight text-indigo-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                        placeholder="******"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-semibold text-indigo-900/70 dark:text-slate-300">Konfirmasi</span>
                                    <input
                                        type="password"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        className="mt-1 block w-full rounded-xl border border-indigo-100 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 px-4 py-3 leading-tight text-indigo-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                        placeholder="******"
                                    />
                                </label>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}

                            <label className="block">
                                <span className="text-sm font-semibold text-indigo-900/70 dark:text-slate-300">Daftar Sebagai</span>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="mt-1 block w-full rounded-xl border border-indigo-100 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 px-4 py-3 leading-tight text-indigo-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <option value="siswa">Siswa</option>
                                    <option value="admin">Admin / Guru</option>
                                </select>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="mt-8 w-full rounded-2xl bg-indigo-600 dark:bg-indigo-500 px-4 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:bg-indigo-700 dark:hover:bg-indigo-400 hover:shadow-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95"
                            disabled={loading}
                        >
                            Daftar Sekarang
                        </button>
                    </form>

                    <footer className="mt-8 text-center text-sm text-indigo-900/60 dark:text-slate-400 font-medium">
                        Sudah punya akun? <Link to="/" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underlineTransition-colors">Log in</Link>
                    </footer>
                </div>
            </div>
        </div>
    );
}
