import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";
import { API_URL } from "../../config/api";

const ManageExams = () => {
    const { getAuthHeaders, logout } = useAuth();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [viewQuestions, setViewQuestions] = useState(null); // Exam object if viewing questions

    const [newExam, setNewExam] = useState({
        title: "",
        duration_minutes: 60,
    });

    const [importModal, setImportModal] = useState({ show: false, examId: null });
    const [importFile, setImportFile] = useState(null);

    // Manual Question State
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        prompt: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        answer: "A",
        type: "single",
        file: null,
    });

    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, title: "", type: 'exam' });

    const fetchExams = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/exams`, {
                headers: getAuthHeaders()
            });

            if (response.status === 401) {
                logout();
                window.location.href = '/';
                return;
            }

            if (!response.ok) throw new Error("Gagal mengambil data ujian");
            const data = await response.json();
            setExams(data);

            // If viewing questions, update the current view
            if (viewQuestions) {
                const current = data.find(e => e.id === viewQuestions.id);
                if (current) setViewQuestions(current);
            }

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/admin/exams`, {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newExam)
            });
            if (!response.ok) throw new Error("Gagal membuat ujian");
            setShowModal(false);
            setNewExam({ title: "", duration_minutes: 60 });
            fetchExams();
            toast.success("Ujian berhasil ditambahkan!");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = (id, title) => {
        setConfirmDelete({ show: true, id, title, type: 'exam' });
    };

    const confirmHandleDelete = async () => {
        const { id, type } = confirmDelete;
        setConfirmDelete({ show: false, id: null, title: "", type: 'exam' });

        if (type === 'exam') {
            try {
                const response = await fetch(`${API_URL}/admin/exams/${id}`, {
                    method: "DELETE",
                    headers: getAuthHeaders()
                });
                if (!response.ok) throw new Error("Gagal menghapus");
                fetchExams();
                toast.success("Ujian berhasil dihapus!");
            } catch (err) {
                toast.error(err.message);
            }
        } else if (type === 'question') {
            try {
                const response = await fetch(`${API_URL}/admin/questions/${id}`, {
                    method: "DELETE",
                    headers: getAuthHeaders()
                });
                if (!response.ok) throw new Error("Gagal menghapus soal");
                fetchExams();
                toast.success("Soal berhasil dihapus!");
            } catch (err) {
                toast.error(err.message);
            }
        }
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!importFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const response = await fetch(`${API_URL}/admin/exams/${importModal.examId}/import-questions`, {
                method: "POST",
                headers: {
                    'Authorization': getAuthHeaders().Authorization,
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal mengimport soal");
            }

            toast.success("Soal berhasil diimport!");
            setImportModal({ show: false, examId: null });
            setImportFile(null);
            fetchExams();
        } catch (err) {
            toast.error(err.message);
        }
        setLoading(false);
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!viewQuestions) return;

        const formData = new FormData();
        formData.append("prompt", newQuestion.prompt);
        formData.append("type", newQuestion.type);
        formData.append("answer", newQuestion.answer);

        const options = [newQuestion.option_a, newQuestion.option_b, newQuestion.option_c, newQuestion.option_d];
        options.forEach((opt, index) => {
            formData.append(`options[${index}]`, opt);
        });

        if (newQuestion.file) {
            formData.append("file", newQuestion.file);
        }

        try {
            const headers = getAuthHeaders();
            delete headers["Content-Type"]; // Allow browser to set boundary

            const response = await fetch(`${API_URL}/admin/exams/${viewQuestions.id}/questions`, {
                method: "POST",
                headers: headers,
                body: formData
            });
            if (!response.ok) throw new Error("Gagal menambah soal");

            toast.success("Soal berhasil ditambahkan!");
            setShowQuestionModal(false);
            setNewQuestion({
                prompt: "",
                option_a: "",
                option_b: "",
                option_c: "",
                option_d: "",
                answer: "A",
                type: "single",
                file: null,
            });
            fetchExams();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteQuestion = (id) => {
        setConfirmDelete({ show: true, id, title: "soal ini", type: 'question' });
    };

    if (loading) return <LoadingSpinner message="Menyiapkan data..." />;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-black text-indigo-950 flex items-center gap-3">
                                <span>📝</span> Kelola Ujian
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium italic">Atur daftar ujian dan pertanyaan di sini.</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <span className="text-xl">+</span> Tambah Ujian
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

                    {/* Content Section */}
                    {!viewQuestions ? (
                        /* Table Ujian */
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none overflow-hidden border border-indigo-50/50 dark:border-slate-700 transition-colors">
                            <table className="min-w-full divide-y divide-indigo-50 dark:divide-slate-700">
                                <thead className="bg-indigo-50/30 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-xs font-black text-indigo-900/40 dark:text-slate-500 uppercase tracking-[0.2em]">Nama Ujian</th>
                                        <th className="px-8 py-5 text-left text-xs font-black text-indigo-900/40 dark:text-slate-500 uppercase tracking-[0.2em]">Durasi</th>
                                        <th className="px-8 py-5 text-left text-xs font-black text-indigo-900/40 dark:text-slate-500 uppercase tracking-[0.2em]">Siswa / Soal</th>
                                        <th className="px-8 py-5 text-center text-xs font-black text-indigo-900/40 dark:text-slate-500 uppercase tracking-[0.2em]">Opsi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                                    {exams.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-24 text-center text-slate-400 italic font-medium">
                                                Belum ada data ujian. Silahkan buat baru.
                                            </td>
                                        </tr>
                                    ) : (
                                        exams.map((exam) => (
                                            <tr key={exam.id} className="hover:bg-indigo-50/20 dark:hover:bg-slate-700/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{exam.title}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold">
                                                        <span className="text-indigo-400 dark:text-indigo-300">⏱️</span> {exam.duration_minutes}m
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-indigo-600 font-black text-sm">{exam.questions?.length || 0} Pertanyaan</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center gap-3">
                                                        <button
                                                            onClick={() => setViewQuestions(exam)}
                                                            className="px-4 py-2 bg-indigo-50 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all text-sm"
                                                        >
                                                            👁️ Lihat Soal
                                                        </button>
                                                        <button
                                                            onClick={() => setImportModal({ show: true, examId: exam.id })}
                                                            className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all text-sm"
                                                        >
                                                            📊 Import
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(exam.id, exam.title)}
                                                            className="p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:text-rose-600 rounded-xl transition-all"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Detail Soal View */
                        <div className="animate-in slide-in-from-right duration-300">
                            <div className="flex items-center gap-4 mb-8">
                                <button
                                    onClick={() => setViewQuestions(null)}
                                    className="p-3 bg-white dark:bg-slate-800 shadow-md rounded-2xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    ⬅️
                                </button>
                                <div>
                                    <h2 className="text-2xl font-black text-indigo-950 dark:text-white uppercase tracking-tight">
                                        Soal: {viewQuestions.title}
                                    </h2>
                                    <p className="text-indigo-500 dark:text-indigo-400 font-bold">{viewQuestions.questions?.length || 0} Total Pertanyaan</p>
                                </div>
                                <button
                                    onClick={() => setShowQuestionModal(true)}
                                    className="ml-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2 hover:bg-black transition-all"
                                >
                                    ➕ Tambah Soal Manual
                                </button>
                            </div>

                            <div className="space-y-6">
                                {viewQuestions.questions?.length === 0 ? (
                                    <div className="bg-white dark:bg-slate-800 p-20 rounded-[2rem] text-center border-2 border-dashed border-indigo-100 dark:border-slate-700 transition-colors">
                                        <span className="text-6xl block mb-6">📭</span>
                                        <h3 className="text-xl font-bold text-indigo-950 dark:text-white mb-2">Belum ada soal</h3>
                                        <p className="text-slate-500 dark:text-slate-400">Silahkan tambah secara manual atau gunakan fitur Import Excel.</p>
                                    </div>
                                ) : (
                                    viewQuestions.questions.map((q, idx) => (
                                        <div key={q.id} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-700 group relative transition-colors">
                                            <div className="absolute -left-3 top-8 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg">
                                                {idx + 1}
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 leading-relaxed">
                                                    {q.prompt}
                                                </h4>
                                                {q.file_path && (
                                                    <div className="mb-6">
                                                        <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                                                            Lampiran: {q.file_type}
                                                        </span>
                                                    </div>
                                                )}
                                                {q.type === 'multiple' && !q.file_path && (
                                                    <div className="mb-6">
                                                        <span className="inline-block px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                                                            Pilihan Ganda Kompleks
                                                        </span>
                                                    </div>
                                                )}
                                                {q.type === 'multiple' && q.file_path && (
                                                    <div className="mb-6 mt-[-1rem]">
                                                        <span className="inline-block px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                                                            Pilihan Ganda Kompleks
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {Array.isArray(q.options) && q.options.map((opt, i) => (
                                                        <div
                                                            key={i}
                                                            className={`p-4 rounded-2xl border ${q.answer === String.fromCharCode(65 + i) ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-500/20' : 'border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50'} flex items-center gap-3 transition-all`}
                                                        >
                                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${q.answer === String.fromCharCode(65 + i) ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200 dark:bg-slate-600 dark:text-slate-300 dark:border-slate-500'}`}>
                                                                {String.fromCharCode(65 + i)}
                                                            </span>
                                                            <span className={`font-semibold ${q.answer === String.fromCharCode(65 + i) ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                {opt}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                                                    <span className="text-indigo-500 dark:text-indigo-400 font-black tracking-widest text-xs uppercase">Jawaban: {q.answer}</span>
                                                    <button
                                                        onClick={() => handleDeleteQuestion(q.id)}
                                                        className="text-rose-500 dark:text-rose-400 font-bold hover:underline"
                                                    >
                                                        Hapus Soal
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* MODAL: TAMBAH UJIAN */}
                    <Modal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        title="Ujian Baru"
                        maxWidth="max-w-lg"
                    >
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="group">
                                <label className="block text-sm font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-600 transition-all text-lg font-bold text-slate-900 dark:text-white"
                                    value={newExam.title}
                                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                                    placeholder="cth: UTS Bahasa Indonesia"
                                    required
                                />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest ml-1">Durasi (Menit)</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-600 transition-all text-lg font-bold text-slate-900 dark:text-white"
                                    value={newExam.duration_minutes}
                                    onChange={(e) => setNewExam({ ...newExam, duration_minutes: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 font-black text-slate-400 hover:text-rose-500 rounded-2xl transition"
                                >
                                    BATAL
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-black transition-all"
                                >
                                    SIMPAN UJIAN
                                </button>
                            </div>
                        </form>
                    </Modal>

                    {/* MODAL: IMPORT EXCEL */}
                    <Modal
                        show={importModal.show}
                        onClose={() => setImportModal({ ...importModal, show: false })}
                        title="Import Soal Excel"
                        maxWidth="max-w-md"
                    >
                        <form onSubmit={handleImport} className="space-y-8">
                            <div className="p-10 border-4 border-dashed border-indigo-50 dark:border-slate-700 rounded-[3rem] text-center bg-indigo-50/10 dark:bg-slate-700/10">
                                <span className="text-6xl block mb-6">📁</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    id="excel-file"
                                    accept=".csv,.xls,.xlsx"
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                />
                                <label
                                    htmlFor="excel-file"
                                    className="inline-block cursor-pointer bg-white dark:bg-slate-700 px-8 py-3 rounded-2xl font-black text-indigo-600 dark:text-indigo-300 shadow-sm border border-indigo-100 dark:border-slate-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all max-w-[90%] break-words leading-tight"
                                >
                                    {importFile ? importFile.name : "PILIH FILE EXCEL"}
                                </label>
                                <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                                    Support: CSV, XLS, XLSX<br />
                                    Format: prompt, option_a, option_b, option_c, option_d, answer
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setImportModal({ ...importModal, show: false })}
                                    className="flex-1 py-4 font-black text-slate-400 hover:text-rose-500 rounded-2xl transition"
                                >
                                    BATAL
                                </button>
                                <button
                                    type="submit"
                                    disabled={!importFile}
                                    className="flex-[2] bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-100 dark:shadow-none hover:bg-black transition-all disabled:opacity-20"
                                >
                                    MULAI IMPORT
                                </button>
                            </div>
                        </form>
                    </Modal>

                    {/* MODAL: TAMBAH SOAL MANUAL */}
                    <Modal
                        show={showQuestionModal}
                        onClose={() => setShowQuestionModal(false)}
                        title="Tambah Soal"
                        maxWidth="max-w-3xl"
                    >
                        <form onSubmit={handleAddQuestion} className="space-y-8">
                            <div>
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Tipe Soal</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-3 outline-none focus:border-indigo-500 font-bold appearance-none cursor-pointer text-slate-900 dark:text-white"
                                    value={newQuestion.type}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                                >
                                    <option value="single">Pilihan Ganda Biasa (1 Jawaban)</option>
                                    <option value="multiple">Pilihan Ganda Kompleks (Lebih dari 1 Jawaban)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Pertanyaan / Soal</label>
                                <textarea
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-bold min-h-[120px] text-slate-900 dark:text-white transition-colors"
                                    value={newQuestion.prompt}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, prompt: e.target.value })}
                                    required
                                    placeholder="Ketikkan isi soal di sini..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Lampiran Media (Opsional)</label>
                                <input
                                    type="file"
                                    accept="image/*,audio/*,video/*"
                                    onChange={(e) => setNewQuestion({ ...newQuestion, file: e.target.files[0] })}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl p-2 outline-none"
                                />
                                <p className="text-xs text-slate-400 mt-2 ml-1">Support: JPG, PNG, MP3, MP4 (Maks. 20MB)</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['a', 'b', 'c', 'd'].map(opt => (
                                    <div key={opt}>
                                        <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Pilihan {opt.toUpperCase()}</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-bold text-slate-900 dark:text-white transition-colors"
                                            value={newQuestion[`option_${opt}`]}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, [`option_${opt}`]: e.target.value })}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Jawaban Benar</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl px-6 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-bold appearance-none cursor-pointer text-slate-900 dark:text-white transition-colors"
                                    value={newQuestion.answer}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                                >
                                    <option value="A">Pilihan A</option>
                                    <option value="B">Pilihan B</option>
                                    <option value="C">Pilihan C</option>
                                    <option value="D">Pilihan D</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowQuestionModal(false)}
                                    className="flex-1 py-4 font-black text-slate-400 hover:text-rose-500 rounded-2xl transition"
                                >
                                    TUTUP
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all"
                                >
                                    SIMPAN SOAL
                                </button>
                            </div>
                        </form>
                    </Modal>

                    <ConfirmModal
                        show={confirmDelete.show}
                        onClose={() => setConfirmDelete({ ...confirmDelete, show: false })}
                        onConfirm={confirmHandleDelete}
                        title={confirmDelete.type === 'exam' ? "Hapus Ujian?" : "Hapus Soal?"}
                        message={
                            confirmDelete.type === 'exam'
                                ? `Apakah Anda yakin ingin menghapus ujian "${confirmDelete.title}"? Semua soal di dalamnya akan ikut terhapus permanen.`
                                : `Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan.`
                        }
                    />

                </div>
            </div>
        </div >
    );
};

export default ManageExams;
