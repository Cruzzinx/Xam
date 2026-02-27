import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";
import { API_URL } from "../../config/api";

const ManageUsers = () => {
    const { getAuthHeaders, logout } = useAuth();
    const [kelas, setKelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ totalSiswa: "--", totalKelas: "--" });
    const [statsLoading, setStatsLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, title: "" });
    const [newKelas, setNewKelas] = useState("");

    // Student List Modal State
    const [studentModal, setStudentModal] = useState({ show: false, classId: null, className: "", students: [] });
    const [studentLoading, setStudentLoading] = useState(false);

    const fetchKelas = async () => {
        try {
            setStatsLoading(true);
            const [kelasRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/admin/kelas`, { headers: getAuthHeaders() }),
                fetch(`${API_URL}/dashboard/stats`, { headers: getAuthHeaders() })
            ]);

            if (kelasRes.status === 401 || statsRes.status === 401) {
                logout();
                window.location.href = '/';
                return;
            }

            if (!kelasRes.ok) throw new Error("Gagal mengambil data kelas");
            const kelasData = await kelasRes.json();
            setKelas(kelasData);

            let sCount = null;
            let kCount = null;

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                console.log("Full Stats Data:", statsData);

                if (statsData.stats && Array.isArray(statsData.stats)) {
                    sCount = statsData.stats.find(s => s.title.toLowerCase().includes('siswa'))?.count;
                    kCount = statsData.stats.find(s => s.title.toLowerCase().includes('kelas'))?.count;
                }
            }

            // Fallback: If stats API failed or returned nothing, calculate from kelas data
            if (sCount === null || sCount === undefined) {
                sCount = kelasData.reduce((acc, k) => acc + (k.users_count || 0), 0);
                console.log("Using Fallback Siswa Count:", sCount);
            }
            if (kCount === null || kCount === undefined) {
                kCount = kelasData.length;
                console.log("Using Fallback Kelas Count:", kCount);
            }

            setStats({ totalSiswa: sCount.toString(), totalKelas: kCount.toString() });
            setStatsLoading(false);

            // Artificial delay to let the user see the premium animation
            await new Promise(resolve => setTimeout(resolve, 800));
            setLoading(false);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKelas();
    }, []);

    const handleAddKelas = async (e) => {
        e.preventDefault();
        if (!newKelas.trim()) return;
        try {
            const response = await fetch(`${API_URL}/admin/kelas`, {
                method: "POST",
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_kelas: newKelas })
            });
            if (!response.ok) throw new Error("Gagal menambah kelas");
            setNewKelas("");
            fetchKelas();
            toast.success("Kelas berhasil ditambahkan!");
        } catch (err) { toast.error(err.message); }
    };

    const handleDeleteKelas = (id, name) => {
        setConfirmDelete({ show: true, id, title: name });
    };

    const confirmDeleteKelas = async () => {
        const { id } = confirmDelete;
        setConfirmDelete({ show: false, id: null, title: "" });
        try {
            const response = await fetch(`${API_URL}/admin/kelas/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal menghapus kelas");
            }

            toast.success("Kelas berhasil dihapus!");
            fetchKelas(); // REFRESH THE LIST
        } catch (err) {
            toast.error(err.message);
        }
    };

    const viewStudents = async (id, name) => {
        setStudentLoading(true);
        setStudentModal({ show: true, classId: id, className: name, students: [] });
        try {
            const response = await fetch(`${API_URL}/admin/kelas/${id}/users`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error("Gagal mengambil daftar siswa");
            const data = await response.json();
            setStudentModal(prev => ({ ...prev, students: data }));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setStudentLoading(false);
        }
    };

    const [showUserModal, setShowUserModal] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "siswa",
        kelas_id: ""
    });

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/admin/users`, {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Gagal membuat user");
            }

            toast.success("Siswa berhasil didaftarkan!");
            setShowUserModal(false);
            setNewUser({ name: "", username: "", email: "", password: "", role: "siswa", kelas_id: "" });
            fetchKelas(); // Refresh counts
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <LoadingSpinner message="Mengorganisir data kelas..." />;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-indigo-950 dark:text-white flex items-center gap-4">
                                <span>👥</span> Kelola User & Kelas
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium italic">Manajemen data kelas dan statistik siswa.</p>
                        </div>
                        <button
                            onClick={() => setShowUserModal(true)}
                            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <span>➕</span> Tambah Siswa
                        </button>
                    </div>

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 p-5 rounded-r-2xl mb-8 shadow-sm flex items-center justify-between font-medium animate-pulse">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">⚠️</span> {error}
                            </div>
                            <button
                                onClick={() => { logout(); window.location.href = '/'; }}
                                className="px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg"
                            >
                                RELOGIN
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Manajemen Kelas */}
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50/50 dark:border-slate-700 transition-colors">
                            <h2 className="text-2xl font-black mb-8 text-indigo-950 dark:text-white uppercase tracking-tight">Daftar Kelas</h2>

                            <form onSubmit={handleAddKelas} className="mb-10 flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Contoh: XII RPL 1"
                                    className="flex-1 bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-600 transition-all text-lg font-bold text-slate-900 dark:text-white"
                                    value={newKelas}
                                    onChange={(e) => setNewKelas(e.target.value)}
                                    required
                                />
                                <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-black transition-all active:scale-95">
                                    TAMBAH
                                </button>
                            </form>

                            <div className="space-y-4">
                                {kelas.length === 0 ? (
                                    <p className="text-center py-10 text-slate-400 dark:text-slate-500 font-medium italic">Belum ada data kelas.</p>
                                ) : (
                                    kelas.map((k) => (
                                        <div key={k.id} className="group flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-slate-600 rounded-[1.5rem] transition-all">
                                            <div onClick={() => viewStudents(k.id, k.nama_kelas)} className="cursor-pointer flex-1">
                                                <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{k.nama_kelas}</span>
                                            </div>
                                            <div className="flex gap-6 items-center">
                                                <button
                                                    onClick={() => viewStudents(k.id, k.nama_kelas)}
                                                    className="bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs font-black text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-slate-700 uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all"
                                                >
                                                    {k.users_count || 0} Siswa
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteKelas(k.id, k.nama_kelas)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:text-rose-500 transition-all font-black"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Statistik Cepat */}
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50/50 dark:border-slate-700 transition-colors">
                                <h2 className="text-2xl font-black mb-8 text-indigo-950 dark:text-white uppercase tracking-tight">Statistik Cepat</h2>
                                <div className="space-y-6">
                                    <div className="p-8 border-2 border-indigo-50/50 dark:border-slate-700 rounded-3xl bg-indigo-50/5 dark:bg-slate-700/10 relative overflow-hidden group">
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-2 relative z-10">Total Siswa Terdaftar</p>
                                        {statsLoading ? (
                                            <div className="flex items-baseline gap-2">
                                                <div className="h-10 w-24 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-lg"></div>
                                                <span className="text-xs text-slate-400 animate-pulse">MEMUAT...</span>
                                            </div>
                                        ) : (
                                            <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter relative z-10 animate-fade-in-up">{stats.totalSiswa}</p>
                                        )}
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <span className="text-6xl">👥</span>
                                        </div>
                                    </div>

                                    <div className="p-8 border-2 border-indigo-50/50 dark:border-slate-700 rounded-3xl bg-indigo-50/5 dark:bg-slate-700/10 relative overflow-hidden group">
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-2 relative z-10">Total Kelas Aktif</p>
                                        {statsLoading ? (
                                            <div className="flex items-baseline gap-2">
                                                <div className="h-10 w-24 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-lg"></div>
                                                <span className="text-xs text-slate-400 animate-pulse">MEMUAT...</span>
                                            </div>
                                        ) : (
                                            <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter relative z-10 animate-fade-in-up">{stats.totalKelas}</p>
                                        )}
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <span className="text-6xl">🏫</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: DAFTAR SISWA */}
            <Modal
                show={studentModal.show}
                onClose={() => setStudentModal({ ...studentModal, show: false })}
                title={`Siswa: ${studentModal.className}`}
            >
                {studentLoading ? (
                    <LoadingSpinner message="Mencari Data Siswa..." fullScreen={false} />
                ) : studentModal.students.length === 0 ? (
                    <div className="py-20 text-center">
                        <span className="text-5xl block mb-4">🏜️</span>
                        <p className="font-bold text-slate-400 dark:text-slate-500">Belum ada siswa di kelas ini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 pb-4">
                        {studentModal.students.map((student) => (
                            <div key={student.id} className="p-5 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between group hover:border-indigo-200 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        👤
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white text-lg leading-tight uppercase tracking-tight">{student.name}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold tracking-wider">@{student.username}</p>
                                    </div>
                                </div>
                                <div className="text-right text-xs font-black text-indigo-400 uppercase tracking-widest truncate max-w-[150px]">
                                    {student.email}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-700">
                    <button
                        onClick={() => setStudentModal({ ...studentModal, show: false })}
                        className="w-full bg-slate-900 dark:bg-slate-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
                    >
                        TUTUP JENDELA
                    </button>
                </div>
            </Modal>

            {/* MODAL: TAMBAH SISWA MANUAL */}
            <Modal
                show={showUserModal}
                onClose={() => setShowUserModal(false)}
                title="Registrasi Siswa Baru"
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleCreateUser} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-bold text-slate-900 dark:text-white transition-colors"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                required
                                placeholder="Nama Siswa"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Username</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-bold text-slate-900 dark:text-white transition-colors"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                required
                                placeholder="Username unik"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-bold text-slate-900 dark:text-white transition-colors"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                            placeholder="email@sekolah.com"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Password Default</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-bold text-slate-900 dark:text-white transition-colors"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                required
                                placeholder="Min. 6 karakter"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Kelas</label>
                            <select
                                className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-bold appearance-none cursor-pointer text-slate-900 dark:text-white transition-colors"
                                value={newUser.kelas_id}
                                onChange={(e) => setNewUser({ ...newUser, kelas_id: e.target.value })}
                                required
                            >
                                <option value="">Pilih Kelas</option>
                                {kelas.map(k => (
                                    <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => setShowUserModal(false)}
                            className="flex-1 py-4 font-black text-slate-400 dark:text-slate-500 hover:text-rose-500 rounded-2xl transition"
                        >
                            BATAL
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-black transition-all"
                        >
                            DAFTARKAN SISWA
                        </button>
                    </div>
                </form>
            </Modal >

            <ConfirmModal
                show={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false, id: null, title: "" })}
                onConfirm={confirmDeleteKelas}
                title="Hapus Kelas?"
                message={`Apakah Anda yakin ingin menghapus kelas "${confirmDelete.title}"? Semua data siswa akan kehilangan referensi kelas ini.`}
            />
        </div>
    );
};

export default ManageUsers;
