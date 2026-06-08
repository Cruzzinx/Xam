import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import { API_URL } from "../../config/api";

const Leaderboard = () => {
    const { getAuthHeaders, logout } = useAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState({ exams: [], kelas: [] });
    const [filters, setFilters] = useState({ exam_id: "", kelas_id: "", search: "" });

    const fetchOptions = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/data-nilai/options`, {
                headers: getAuthHeaders()
            });
            if (response.status === 401) { logout(); return; }
            if (!response.ok) throw new Error("Gagal mengambil opsi filter");
            const data = await response.json();
            setOptions(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchResults = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            // Using existing DataNilai endpoint as it works for both roles if authorized
            const response = await fetch(`${API_URL}/admin/data-nilai?${queryParams}`, {
                headers: getAuthHeaders()
            });
            if (response.status === 401) { logout(); return; }
            if (!response.ok) throw new Error("Gagal mengambil data peringkat");
            const data = await response.json();
            setResults(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOptions();
        fetchResults();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = (e) => {
        e.preventDefault();
        fetchResults();
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-indigo-950 dark:text-white flex items-center gap-4">
                            <span>🏆</span> Peringkat Siswa
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium italic">Lihat peringkat terbaik dari seluruh ujian.</p>
                    </div>

                    {/* Filter Card */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-indigo-100/30 dark:shadow-none border border-slate-100 dark:border-slate-700 mb-10 transition-colors">
                        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div>
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Cari Nama</label>
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Nama siswa..."
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-bold text-slate-900 dark:text-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Ujian</label>
                                <select
                                    name="exam_id"
                                    value={filters.exam_id}
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-bold appearance-none cursor-pointer text-slate-900 dark:text-white transition-colors"
                                >
                                    <option value="">Semua Ujian</option>
                                    {options.exams.map(e => (
                                        <option key={e.id} value={e.id}>{e.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Kelas</label>
                                <select
                                    name="kelas_id"
                                    value={filters.kelas_id}
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-bold appearance-none cursor-pointer text-slate-900 dark:text-white transition-colors"
                                >
                                    <option value="">Semua Kelas</option>
                                    {options.kelas.map(k => (
                                        <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-black transition-all flex items-center justify-center gap-2"
                                >
                                    <span>⚡</span> TERAPKAN
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50/50 dark:border-slate-700 overflow-hidden transition-colors">
                        {loading ? (
                            <div className="py-20 flex justify-center">
                                <LoadingSpinner message="Menyusun peringkat..." fullScreen={false} />
                            </div>
                        ) : results.length === 0 ? (
                            <div className="py-20 text-center">
                                <span className="text-6xl block mb-4">🏜️</span>
                                <h3 className="text-xl font-black text-slate-400">Belum ada data nilai</h3>
                                <p className="text-slate-400 font-medium italic">Data peringkat akan muncul setelah ujian selesai.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-24">Rank</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Siswa</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kelas</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Skor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {results.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-indigo-50/30 dark:hover:bg-slate-700 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg ${index === 0 ? "bg-amber-100 text-amber-600 shadow-lg shadow-amber-100/30" :
                                                        index === 1 ? "bg-slate-100 text-slate-500" :
                                                            index === 2 ? "bg-orange-100 text-orange-600" :
                                                                "text-slate-400"
                                                        }`}>
                                                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{item.student_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.exam_title}</p>
                                                </td>
                                                <td className="px-8 py-6 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                    {item.kelas_name}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`text-2xl font-black tracking-tighter ${item.score >= 70 ? "text-emerald-500" : "text-rose-500"
                                                        }`}>
                                                        {item.score}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
