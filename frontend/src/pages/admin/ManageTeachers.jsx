import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";
import { API_URL } from "../../config/api";

const ManageTeachers = () => {
    const { getAuthHeaders, logout } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, name: "" });
    const [newTeacher, setNewTeacher] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "guru"
    });

    const fetchTeachers = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/users?role=guru`, {
                headers: getAuthHeaders()
            });

            if (response.status === 401) {
                logout();
                window.location.href = '/';
                return;
            }

            if (!response.ok) throw new Error("Gagal mengambil data pengajar");
            const data = await response.json();
            setTeachers(data);
            setLoading(false);
        } catch (err) {
            toast.error(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/admin/users`, {
                method: "POST",
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify(newTeacher)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Gagal mendaftarkan pengajar");
            }

            toast.success("Pengajar berhasil didaftarkan!");
            setShowModal(false);
            setNewTeacher({ name: "", username: "", email: "", password: "", role: "guru" });
            fetchTeachers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/users/${confirmDelete.id}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });

            if (!response.ok) throw new Error("Gagal menghapus pengajar");

            toast.success("Pengajar berhasil dihapus!");
            setConfirmDelete({ show: false, id: null, name: "" });
            fetchTeachers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <LoadingSpinner message="Memuat data pengajar..." />;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-indigo-950 dark:text-white flex items-center gap-4">
                                <span>👨‍🏫</span> Kelola Pengajar
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium italic">Manajemen akun Guru dan Staf Pengajar.</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-black transition-all active:scale-95 flex items-center gap-2"
                        >
                            <span>➕</span> TAMBAH GURU
                        </button>
                    </div>

                    {/* Stats Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50/50 dark:border-slate-700">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2 text-center">Total Pengajar</p>
                            <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 text-center">{teachers.length}</p>
                        </div>
                    </div>

                    {/* Teacher List */}
                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50/50 dark:border-slate-700">
                        <h2 className="text-2xl font-black mb-8 text-indigo-950 dark:text-white uppercase tracking-tight">Daftar Guru</h2>

                        <div className="grid grid-cols-1 gap-4">
                            {teachers.length === 0 ? (
                                <p className="text-center py-10 text-slate-400 italic">Belum ada data pengajar.</p>
                            ) : (
                                teachers.map((teacher) => (
                                    <div key={teacher.id} className="group flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg">
                                                {teacher.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight uppercase">{teacher.name}</h3>
                                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">@{teacher.username} • {teacher.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setConfirmDelete({ show: true, id: teacher.id, name: teacher.name })}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all font-black"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: TAMBAH GURU */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title="Daftarkan Pengajar Baru"
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleCreateTeacher} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-3 outline-none focus:border-indigo-500 font-bold text-slate-900 dark:text-white"
                                value={newTeacher.name}
                                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-3 outline-none focus:border-indigo-500 font-bold text-slate-900 dark:text-white"
                                value={newTeacher.username}
                                onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-3 outline-none focus:border-indigo-500 font-bold text-slate-900 dark:text-white"
                            value={newTeacher.email}
                            onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-3 outline-none focus:border-indigo-500 font-bold text-slate-900 dark:text-white"
                            value={newTeacher.password}
                            onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                            required
                            placeholder="Min. 6 karakter"
                        />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-4 font-black text-slate-400 hover:text-rose-500"
                        >
                            BATAL
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all"
                        >
                            DAFTARKAN GURU
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                show={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false, id: null, name: "" })}
                onConfirm={handleDelete}
                title="Hapus Pengajar?"
                message={`Apakah Anda yakin ingin menghapus "${confirmDelete.name}" dari sistem? Tindakan ini tidak dapat dibatalkan.`}
            />
        </div>
    );
};

export default ManageTeachers;
