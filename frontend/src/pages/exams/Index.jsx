// src/pages/exams/Index.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.jsx';
import Sidebar from "../../components/Sidebar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { API_URL } from "../../config/api";

const ExamsIndex = () => {
    const { user, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const { subjectId } = useParams();

    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchExams = async () => {
        try {
            const response = await fetch(`${API_URL}/exams`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Gagal mengambil daftar ujian');
            const data = await response.json();
            setExams(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const displayName = user?.name || user?.username || "Siswa";

    if (loading) return <LoadingSpinner message="Menyiapkan data ujian..." />;
    if (error) return (
        <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="text-center">
                <p className="text-rose-500 font-bold mb-4">⚠️ {error}</p>
                <button onClick={fetchExams} className="text-indigo-600 dark:text-indigo-400 font-bold underline">Coba Lagi</button>
            </div>
        </div>
    );

    // Detail View Logic
    if (subjectId) {
        const currentExam = exams.find(e => e.id.toString() === subjectId);

        return (
            <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <Sidebar />
                <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        <button
                            onClick={() => navigate('/exams')}
                            className="mb-8 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                        >
                            ⬅️ Kembali ke Daftar Ujian
                        </button>

                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 dark:shadow-none border border-indigo-50 dark:border-slate-700 animate-in slide-in-from-bottom duration-300">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Detail Konfirmasi</span>
                                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-4 leading-tight">
                                        {currentExam?.title || "Detail Ujian"}
                                    </h2>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-600 text-center min-w-[100px]">
                                    <div className="text-2xl mb-1">⏱️</div>
                                    <div className="text-sm font-black text-slate-900 dark:text-white">{currentExam?.duration_minutes || '?'}m</div>
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="flex items-center gap-4 p-5 bg-indigo-50/50 dark:bg-slate-700/30 rounded-2xl border border-indigo-100/50 dark:border-slate-600">
                                    <span className="text-2xl">📝</span>
                                    <div>
                                        <p className="text-xs font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest">Total Pertanyaan</p>
                                        <p className="text-indigo-900 dark:text-indigo-100 font-bold">{currentExam?.question_count || 0} Soal Tersedia</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                                    <div className="flex gap-3 items-center mb-2">
                                        <span className="text-rose-500">⚠️</span>
                                        <h4 className="font-black text-rose-900 dark:text-rose-200 text-sm uppercase tracking-wider">Peraturan Ujian</h4>
                                    </div>
                                    <p className="text-sm text-rose-800/70 dark:text-rose-200/60 font-medium leading-relaxed">
                                        Sekali ujian dimulai, waktu akan terus berjalan dan tidak dapat dijeda. Pastikan koneksi internet stabil dan baterai perangkat mencukupi.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/exams/${subjectId}/start`)}
                                className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-black dark:hover:bg-indigo-400 transition-all active:scale-95"
                            >
                                MULAI UJIAN SEKARANG 🚀
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // List View Logic
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12">
                        <h1 className="text-4xl font-black text-indigo-950 dark:text-white flex items-center gap-4">
                            <span>👋</span> Halo, {displayName}!
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Siap untuk mengerjakan ujian hari ini? Pilih salah satu di bawah.</p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 p-5 rounded-r-2xl mb-8 shadow-sm font-medium">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {exams.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-indigo-100 dark:border-slate-700">
                                <span className="text-6xl block mb-6">🏜️</span>
                                <h3 className="text-xl font-bold text-indigo-950 dark:text-white">Belum ada ujian aktif</h3>
                                <p className="text-slate-400 dark:text-slate-500 font-medium">Belum ada jadwal ujian untuk kelas Anda saat ini.</p>
                            </div>
                        ) : (
                            exams.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
                                    onClick={() => navigate(`/exams/${exam.id}`)}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 bg-indigo-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:scale-110 transition-all">
                                            📚
                                        </div>
                                        <div className="bg-indigo-50 dark:bg-indigo-900/40 px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-500 dark:text-indigo-300 uppercase tracking-widest">
                                            {exam.duration_minutes} Menit
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {exam.title}
                                    </h3>
                                    <p className="text-slate-400 dark:text-slate-400 text-sm font-medium line-clamp-2 mb-6">
                                        {exam.description || "Ujian ini diselenggarakan untuk mengevaluasi pemahaman materi pelajaran."}
                                    </p>

                                    <div className="pt-6 border-t border-indigo-50 dark:border-slate-700 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest">Jumlah Soal</span>
                                            <span className="text-indigo-600 dark:text-indigo-400 font-black">{exam.question_count || 0} Pertanyaan</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all text-slate-300 dark:text-slate-400">
                                            ➜
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamsIndex;