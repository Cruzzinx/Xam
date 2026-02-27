// src/pages/exams/examScene.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

// Use relative path for proxy
const API_URL = "/api";

const ExamScene = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const { getAuthHeaders } = useAuth();

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentNumber, setCurrentNumber] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                // First start/get status of the exam
                await fetch(`${API_URL}/exams/${subjectId}/start`, {
                    method: "POST",
                    headers: getAuthHeaders()
                });

                // Fetch full details (questions)
                const response = await fetch(`${API_URL}/exams/${subjectId}`, {
                    headers: getAuthHeaders()
                });
                if (!response.ok) throw new Error('Gagal mengambil data ujian');

                const data = await response.json();
                setExam(data.exam);
                setQuestions(data.questions || []);

                if (data.exam?.duration_minutes) {
                    setTimeLeft(data.exam.duration_minutes * 60);
                }

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchExamData();
    }, [subjectId]);

    // Timer Logic
    useEffect(() => {
        if (loading || isSubmitting) return;
        if (timeLeft <= 0) {
            handleFinish(true);
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, loading, isSubmitting]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleAnswer = (questionId, optionKey) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionKey }));
    };

    const handleFinish = async (isAuto = false) => {
        if (isSubmitting) return;
        if (!isAuto) {
            setShowConfirmModal(true);
            return;
        }
        submitExam();
    };

    const submitExam = async () => {
        setIsSubmitting(true);
        setShowConfirmModal(false);
        const payload = {
            answers: questions.map(q => ({
                question_id: q.id,
                answer: selectedAnswers[q.id] || ""
            }))
        };

        try {
            const response = await fetch(`${API_URL}/exams/${subjectId}/submit`, {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Gagal mengirim jawaban');

            const result = await response.json();
            toast.success(`Ujian selesai! Skor Anda: ${result.score}`, { duration: 5000 });

            // Exit fullscreen if active
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }

            navigate('/grades', { replace: true });
        } catch (err) {
            toast.error("Gagal mengirim jawaban: " + err.message);
            setIsSubmitting(false);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                toast.error(`Error: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    if (loading) return <LoadingSpinner message="Menyiapkan lembar ujian..." />;
    if (error) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 p-10 text-center font-bold text-rose-500">Error: {error}</div>;
    if (questions.length === 0) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 p-10 text-center font-bold text-slate-400">Tidak ada soal tersedia.</div>;
    if (isSubmitting) return <LoadingSpinner message="Mengirim jawaban..." />;

    const currentQuestion = questions[currentNumber];
    const progress = ((currentNumber + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none overflow-x-hidden">
            {/* Header */}
            <header className="bg-indigo-950 px-6 py-4 text-white sticky top-0 z-50 shadow-2xl flex justify-between items-center backdrop-blur-lg bg-opacity-95">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-2.5 rounded-2xl text-xl shadow-lg shadow-indigo-500/20">🎓</div>
                    <div>
                        <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-indigo-400">Computer Based Test</h2>
                        <h1 className="font-black text-xl truncate max-w-[150px] sm:max-w-md uppercase tracking-tight">{exam?.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-8">
                    <button
                        onClick={toggleFullscreen}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-xl"
                        title="Toggle Fullscreen"
                    >
                        {isFullscreen ? '📺' : '🖥️'}
                    </button>
                    <div className={`px-6 py-2.5 rounded-2xl font-mono font-black text-2xl shadow-inner transition-all flex items-center gap-3 ${timeLeft < 300 ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-800 text-indigo-100'}`}>
                        <span className="text-sm opacity-50 hidden sm:inline">⏳</span>
                        {formatTime(timeLeft)}
                    </div>
                    <button
                        onClick={() => handleFinish()}
                        className="hidden sm:block bg-emerald-500 hover:bg-black text-white px-8 py-2.5 rounded-2xl font-black shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        SUBMIT
                    </button>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-indigo-900/10 sticky top-[72px] sm:top-[80px] z-40">
                <div
                    className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-10 flex flex-col lg:flex-row gap-10">
                {/* Left Area: Questions */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="bg-white rounded-[3rem] p-8 sm:p-14 shadow-2xl shadow-indigo-200/50 border border-slate-100 relative flex-1 animate-in zoom-in-95 duration-500">
                        {/* Question Meta */}
                        <div className="flex items-center justify-between mb-12">
                            <span className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
                                Pertanyaan {currentNumber + 1} / {questions.length}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Poin: {currentQuestion.score}</span>
                            </div>
                        </div>

                        {/* Question Prompt */}
                        <div className="mb-14 text-2xl sm:text-3xl font-black text-slate-900 leading-[1.4] tracking-tight">
                            {currentQuestion.prompt}
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-5">
                            {Array.isArray(currentQuestion.options) && currentQuestion.options.map((opt, idx) => {
                                const optionKey = String.fromCharCode(65 + idx);
                                const isSelected = selectedAnswers[currentQuestion.id] === optionKey;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(currentQuestion.id, optionKey)}
                                        className={`group w-full text-left p-6 sm:p-7 rounded-[2rem] border-4 flex items-center gap-8 transition-all duration-300 ${isSelected
                                            ? 'border-indigo-600 bg-indigo-50/50 shadow-2xl shadow-indigo-100'
                                            : 'border-slate-50 hover:border-indigo-100 bg-slate-50/30'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all shadow-sm ${isSelected
                                            ? 'bg-indigo-600 text-white scale-110 shadow-indigo-200'
                                            : 'bg-white text-slate-300 border border-slate-200 group-hover:text-indigo-400'
                                            }`}>
                                            {optionKey}
                                        </div>
                                        <span className={`text-xl sm:text-2xl transition-all ${isSelected ? 'text-indigo-950 font-black' : 'text-slate-600 font-bold'}`}>
                                            {opt}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-10 flex justify-between items-center px-4">
                        <button
                            disabled={currentNumber === 0}
                            onClick={() => setCurrentNumber(n => n - 1)}
                            className="bg-white px-10 py-4 rounded-[2rem] text-indigo-600 font-black shadow-xl border border-indigo-50 disabled:opacity-20 hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                        >
                            ← PREV
                        </button>

                        <div className="hidden sm:flex gap-3">
                            {questions.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${i === currentNumber ? 'bg-indigo-600 w-12 shadow-lg shadow-indigo-200' : 'bg-slate-200 w-2.5 hover:bg-indigo-200'}`}
                                ></div>
                            ))}
                        </div>

                        {currentNumber === questions.length - 1 ? (
                            <button
                                onClick={() => handleFinish()}
                                className="bg-emerald-500 text-white px-12 py-4 rounded-[2rem] font-black shadow-2xl shadow-emerald-200 hover:bg-black transition-all active:scale-95"
                            >
                                FINISH 🏁
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentNumber(n => n + 1)}
                                className="bg-indigo-600 text-white px-12 py-4 rounded-[2rem] font-black shadow-2xl shadow-indigo-200 hover:bg-black transition-all active:scale-95 flex items-center gap-2"
                            >
                                NEXT →
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Area: Navigation Grid */}
                <aside className="w-full lg:w-96">
                    <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-indigo-100 border border-indigo-50 sticky top-36">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Navigasi Soal</h4>
                            <span className="text-[10px] font-black text-indigo-400 italic">Klik untuk lompat</span>
                        </div>

                        <div className="grid grid-cols-5 gap-4">
                            {questions.map((q, idx) => {
                                const isSelected = selectedAnswers[q.id];
                                const isActive = currentNumber === idx;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentNumber(idx)}
                                        className={`h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all border-4 ${isActive
                                            ? 'bg-indigo-600 text-white border-indigo-600 scale-125 z-10 shadow-xl shadow-indigo-200'
                                            : isSelected
                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-100 active:scale-90'
                                                : 'bg-white text-slate-300 border-slate-50 hover:border-indigo-100 active:scale-90'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-12 pt-10 border-t border-slate-50 space-y-4">
                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="w-4 h-4 rounded-lg bg-indigo-600 shadow-sm"></div> Current
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="w-4 h-4 rounded-lg bg-indigo-50 border border-indigo-100"></div> Answered
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="w-4 h-4 rounded-lg bg-white border border-slate-50"></div> Unanswered
                            </div>
                        </div>

                        <button
                            onClick={() => handleFinish()}
                            className="w-full mt-12 bg-rose-500 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl shadow-rose-200 lg:hidden"
                        >
                            Kumpul Jawaban
                        </button>
                    </div>
                </aside>
            </main>

            <ConfirmModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={submitExam}
                title="Akhiri Ujian?"
                message="Pastikan semua jawaban sudah terisi dengan benar. Anda tidak dapat kembali setelah mengakhiri ujian ini."
                confirmText="YA, SELESAI"
                cancelText="TIDAK, LANJUTKAN"
                type="primary"
            />
        </div>
    );
};

export default ExamScene;