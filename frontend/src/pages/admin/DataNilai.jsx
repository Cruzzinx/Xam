import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import { API_URL } from "../../config/api";

const DataNilai = () => {
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
            const response = await fetch(`${API_URL}/admin/data-nilai?${queryParams}`, {
                headers: getAuthHeaders()
            });
            if (response.status === 401) { logout(); return; }
            if (!response.ok) throw new Error("Gagal mengambil data nilai");
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
                    <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-indigo-950 dark:text-white flex items-center gap-4">
                                <span>🏆</span> Rekapitulasi Nilai
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium italic">Data nilai siswa dari peringat tertinggi.</p>
                        </div>
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
                                    placeholder="Nama atau Username..."
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-bold text-slate-900 dark:text-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Pilih Ujian</label>
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
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Pilih Kelas</label>
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
                                    <span>🔍</span> FILTER DATA
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50/50 dark:border-slate-700 overflow-hidden transition-colors">
                        {loading ? (
                            <div className="py-20 flex justify-center">
                                <LoadingSpinner message="Menghitung statistik..." fullScreen={false} />
                            </div>
                        ) : results.length === 0 ? (
                            <div className="py-20 text-center">
                                <span className="text-6xl block mb-4">🔍</span>
                                <h3 className="text-xl font-black text-slate-400">Tidak ada data ditemukan</h3>
                                <p className="text-slate-400 font-medium">Coba sesuaikan filter pencarianmu.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Peringkat</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Siswa</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kelas</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ujian</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center whitespace-nowrap">Skor</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap text-center">Keterangan</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {results.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-indigo-50/30 dark:hover:bg-slate-700 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg ${index === 0 ? "bg-amber-100 text-amber-600 shadow-lg shadow-amber-100/50" :
                                                        index === 1 ? "bg-slate-100 text-slate-500 shadow-lg shadow-slate-100/50" :
                                                            index === 2 ? "bg-orange-100 text-orange-600 shadow-lg shadow-orange-100/50" :
                                                                "text-slate-400"
                                                        }`}>
                                                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400">
                                                            {item.student_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{item.student_name}</p>
                                                            <p className="text-xs text-slate-400 font-bold">@{item.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="max-w-[180px]">
                                                        <span className="inline-block px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                                                            {item.kelas_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                                                        {item.exam_title}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`text-2xl font-black tracking-tighter ${item.score >= (item.kkm || 70) ? "text-emerald-500" : "text-rose-500"
                                                        }`}>
                                                        {item.score}
                                                    </span>
                                                    <p className="text-[10px] text-slate-400 font-bold">KKM: {item.kkm || 70}</p>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex flex-col items-center">
                                                        {item.status === 'sudah_remed' ? (
                                                            <span className="px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                                                                SUDAH REMED
                                                            </span>
                                                        ) : item.score >= (item.kkm || 70) ? (
                                                            <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                                                                LULUS
                                                            </span>
                                                        ) : (
                                                            <span className="px-4 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-200 dark:border-rose-800 whitespace-nowrap">
                                                                TIDAK LULUS
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                        {new Date(item.submitted_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="text-[10px] text-slate-300 font-bold">
                                                        {new Date(item.submitted_at).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
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

export default DataNilai;
