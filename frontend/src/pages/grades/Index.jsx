// src/pages/grades/Index.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal";
import { API_URL } from "../../config/api";

function GradesPage() {
    const { getAuthHeaders } = useAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchResults = async () => {
        try {
            // Updated endpoint to match backend (ExamController.php@results)
            const response = await fetch(`${API_URL}/exams/results/history`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Gagal mengambil hasil ujian');
            const data = await response.json();
            setResults(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchResults();
    }, []);

    const handleViewDetail = async (result) => {
        // Optimistic UI update - show modal immediately with title
        setSelectedResult(result);
        setShowDetailModal(true);
        setDetailLoading(true);

        // Fetch full details including questions and answers
        try {
            const response = await fetch(`${API_URL}/exams/results/${result.id}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) throw new Error("Gagal mengambil detail jawaban");

            const detailData = await response.json();
            setSelectedResult(detailData);
        } catch (err) {
            toast.error("Gagal memuat detail jawaban");
        } finally {
            setDetailLoading(false);
        }
    };

    if (loading) return <LoadingSpinner message="Merekap hasil ujian..." />;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-indigo-950 dark:text-white flex items-center gap-4">
                            <span>📊</span> Hasil Ujian
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium italic">Rangkuman pencapaian dan nilai akademis Anda.</p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 p-5 rounded-r-2xl mb-8 shadow-sm font-medium">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Results Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none overflow-hidden border border-indigo-50/50 dark:border-slate-700 animate-in fade-in duration-500">
                        <table className="min-w-full divide-y divide-indigo-50 dark:divide-slate-700">
                            <thead className="bg-indigo-50/30 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-black text-indigo-900/40 dark:text-slate-500 uppercase tracking-[0.2em]">Ujian / Mata Pelajaran</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-indigo-900/40 dark:text-slate-500 uppercase tracking-[0.2em]">Tanggal</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-indigo-900/40 dark:text-slate-500 uppercase tracking-[0.2em]">Nilai</th>
                                    <th className="px-8 py-5 text-center text-xs font-black text-indigo-900/40 dark:text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-center text-xs font-black text-indigo-900/40 dark:text-slate-500 uppercase tracking-[0.2em]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                                {results.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-24 text-center text-slate-400 italic font-medium">
                                            Anda belum memiliki riwayat ujian.
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((result) => {
                                        const isPassing = result.score > 70; // Lulus jika di atas 70
                                        return (
                                            <tr key={result.id} className="hover:bg-indigo-50/20 dark:hover:bg-slate-700/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {result.exam?.title || 'Ujian Terhapus'}
                                                    </div>
                                                    <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Selesai</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-slate-600 dark:text-slate-400 font-semibold italic">
                                                        {new Date(result.submitted_at || result.updated_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`text-4xl font-black ${isPassing ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {result.score}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isPassing ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
                                                        }`}>
                                                        {isPassing ? 'Lulus' : 'Remedial'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <button
                                                        onClick={() => handleViewDetail(result)}
                                                        className="px-6 py-2 bg-indigo-50 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all text-sm shadow-sm"
                                                    >
                                                        Review Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-700 text-center transition-colors">
                            <span className="text-3xl block mb-2">🏆</span>
                            <div className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Rata-rata Nilai</div>
                            <div className="text-3xl font-black text-indigo-950 dark:text-white">
                                {results.length > 0 ? (results.reduce((a, b) => a + b.score, 0) / results.length).toFixed(1) : 0}
                            </div>
                        </div>
                        <div className="bg-indigo-600 dark:bg-indigo-500 p-8 rounded-[2rem] shadow-xl shadow-indigo-200 dark:shadow-none text-center text-white transition-colors">
                            <span className="text-3xl block mb-2">📝</span>
                            <div className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Total Ujian</div>
                            <div className="text-3xl font-black">{results.length}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-700 text-center transition-colors">
                            <span className="text-3xl block mb-2">⭐</span>
                            <div className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Nilai Tertinggi</div>
                            <div className="text-3xl font-black text-emerald-500">
                                {results.length > 0 ? Math.max(...results.map(r => r.score)) : 0}
                            </div>
                        </div>
                    </div>

                    {/* Detail Modal */}
                    <Modal
                        show={showDetailModal}
                        onClose={() => setShowDetailModal(false)}
                        title={selectedResult?.exam?.title || "Detail Ujian"}
                        maxWidth="max-w-4xl"
                    >
                        {detailLoading ? (
                            <LoadingSpinner message="Memuat detail jawaban..." />
                        ) : selectedResult?.exam?.questions ? (
                            <div className="space-y-6">
                                <div className="bg-indigo-50 dark:bg-slate-700/50 p-6 rounded-2xl flex justify-between items-center mb-6 border border-indigo-100 dark:border-slate-600">
                                    <div>
                                        <div className="text-xs font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest mb-1">Skor Akhir</div>
                                        <div className="text-4xl font-black text-indigo-900 dark:text-white">{selectedResult.score}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest mb-1">Waktu Submit</div>
                                        <div className="font-bold text-slate-700 dark:text-slate-300">
                                            {new Date(selectedResult.submitted_at || selectedResult.updated_at).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>

                                {selectedResult.exam.questions.map((q, idx) => {
                                    // Find user's answer
                                    const userAnswerObj = selectedResult.answers?.find(a => Number(a.question_id) === Number(q.id));
                                    const userAnswer = userAnswerObj ? userAnswerObj.answer : null;
                                    const isCorrect = String(userAnswer) === String(q.answer);

                                    return (
                                        <div key={q.id} className={`p-6 rounded-2xl border-2 transition-colors ${isCorrect ? 'border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-900/10' : 'border-rose-100 bg-rose-50/30 dark:border-rose-900/30 dark:bg-rose-900/10'}`}>
                                            <div className="flex gap-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black flex-shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-800 dark:text-white mb-4">{q.prompt}</p>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {q.options.map((opt, i) => {
                                                            const optLabel = String.fromCharCode(65 + i);
                                                            const isUserSelected = userAnswer === optLabel;
                                                            const isCorrectAnswer = q.answer === optLabel;

                                                            let className = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white";
                                                            let icon = null;

                                                            if (isCorrectAnswer) {
                                                                className = "border-emerald-500 dark:border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-200 dark:ring-emerald-900/50";
                                                                icon = "✅";
                                                            } else if (isUserSelected && !isCorrectAnswer) {
                                                                className = "border-rose-500 dark:border-rose-500 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300";
                                                                icon = "❌";
                                                            }

                                                            return (
                                                                <div key={i} className={`p-3 rounded-xl border-2 text-sm font-semibold flex items-center gap-3 transition-all ${className}`}>
                                                                    <span className="w-6 h-6 rounded flex items-center justify-center bg-white/50 dark:bg-slate-700/50 font-black text-xs">
                                                                        {optLabel}
                                                                    </span>
                                                                    <span>{opt}</span>
                                                                    <span className="ml-auto">{icon}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400">Gagal memuat detail.</div>
                        )}
                        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </Modal>
                </div>
            </div>
        </div>
    );
}

export default GradesPage;