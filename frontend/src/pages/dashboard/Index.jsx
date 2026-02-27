import React from "react";
import Card from "../../components/Card";
import Sidebar from "../../components/Sidebar";
import { useAuth } from '../../context/AuthContext.jsx';
import { API_URL } from "../../config/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const { user, getAuthHeaders } = useAuth();
    const [stats, setStats] = React.useState([]);
    const [recentActivities, setRecentActivities] = React.useState([]);
    // const [topStudents, setTopStudents] = React.useState([]); // REPLACED
    const [loading, setLoading] = React.useState(true);

    // Leaderboard State
    const [examsList, setExamsList] = React.useState([]);
    const [selectedExamId, setSelectedExamId] = React.useState(null);
    const [examLeaderboard, setExamLeaderboard] = React.useState([]);
    const [leaderboardLoading, setLeaderboardLoading] = React.useState(false);

    const username = user?.name || user?.username || "Pengguna";
    const role = user?.role || "Siswa";

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_URL}/dashboard/stats`, {
                    headers: getAuthHeaders()
                });
                const data = await response.json();
                setStats(data.stats || []);
                setRecentActivities(data.recent_activities || []);
                // setTopStudents(data.top_students || []);
                setLoading(false);
            } catch (err) {
                console.error("Gagal ambil stats:", err);
                setLoading(false);
            }
        };

        const fetchExamsList = async () => {
            if (role === 'siswa') return;
            try {
                const response = await fetch(`${API_URL}/dashboard/exams-list`, {
                    headers: getAuthHeaders()
                });
                const data = await response.json();
                setExamsList(data || []);
                if (data.length > 0) setSelectedExamId(data[0].id); // Default select first
            } catch (err) {
                console.error("Gagal ambil list ujian:", err);
            }
        };

        fetchStats();
        fetchExamsList();
    }, []);

    // Fetch leaderboard when exam changes
    React.useEffect(() => {
        if (!selectedExamId || role === 'siswa') return;

        const fetchLeaderboard = async () => {
            setLeaderboardLoading(true);
            try {
                const response = await fetch(`${API_URL}/dashboard/leaderboard/${selectedExamId}`, {
                    headers: getAuthHeaders()
                });
                const data = await response.json();
                setExamLeaderboard(data || []);
            } catch (err) {
                console.error("Gagal ambil leaderboard:", err);
            } finally {
                setLeaderboardLoading(false);
            }
        };

        fetchLeaderboard();
    }, [selectedExamId]);

    if (loading) return <LoadingSpinner message="Menghitung statistik..." />;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden transition-colors duration-300">
                <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 h-16 px-8 flex justify-between items-center transition-colors duration-300">
                    <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-tight">Dashboard {role}</h2>
                    <div className="flex items-center gap-4">
                        <Link to="/profile" className="flex items-center gap-3 group transition-all duration-300 opacity-90 hover:opacity-100">
                            <span className="text-gray-700 dark:text-gray-200 font-semibold hidden sm:inline-block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{username}</span>
                            <div className="relative">
                                {user.profile_photo_url ? (
                                    <img
                                        src={user.profile_photo_url}
                                        alt="profile"
                                        className="w-9 h-9 rounded-xl object-cover border-2 border-indigo-100 dark:border-indigo-500/50 shadow-sm group-hover:ring-4 group-hover:ring-indigo-500/10 transition-all"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold border-2 border-indigo-100 dark:border-indigo-500/50 shadow-sm group-hover:ring-4 group-hover:ring-indigo-500/10 transition-all">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 sm:p-10 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-10">
                            <h1 className="text-3xl font-bold text-indigo-950 dark:text-white tracking-tight">
                                Selamat Datang, {username}! 👋
                            </h1>
                            <p className="text-indigo-800/60 dark:text-indigo-200/60 mt-2 font-medium">Berikut adalah ringkasan aktivitas sistem hari ini.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {stats.map((stat, idx) => (
                                <Card
                                    key={idx}
                                    title={stat.title}
                                    count={stat.count.toString()}
                                    icon={stat.icon}
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-10">
                            {/* Student: Recent Activity Widget */}
                            {role === 'siswa' && (
                                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-700 transition-colors duration-300">
                                    <h3 className="text-xl font-black text-indigo-950 dark:text-white mb-6 flex items-center gap-3">
                                        <span>🕒</span> Aktivitas Terbaru
                                    </h3>
                                    <div className="space-y-4">
                                        {recentActivities.length === 0 ? (
                                            <p className="text-slate-400 italic text-center py-4">Belum ada aktivitas.</p>
                                        ) : (
                                            recentActivities.map((activity) => (
                                                <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                                            {activity.exam_title}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            Skor: {activity.score}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${activity.score >= 70 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                            {activity.score}
                                                        </span>
                                                        <p className="text-[10px] text-slate-400 mt-1">{activity.date}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Admin: Exam Leaderboard Widget (Full Width) */}
                            {role !== 'siswa' && (
                                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-700 min-h-[500px] transition-colors duration-300">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                        <h3 className="text-xl font-black text-indigo-950 dark:text-white flex items-center gap-3">
                                            <span>🏆</span> Peringkat Nilai
                                        </h3>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-bold outline-none cursor-pointer"
                                            onChange={(e) => setSelectedExamId(e.target.value)}
                                            value={selectedExamId || ""}
                                        >
                                            <option value="" disabled>Pilih Mapel / Ujian</option>
                                            {examsList.map((exam) => (
                                                <option key={exam.id} value={exam.id}>{exam.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {leaderboardLoading ? (
                                            <div className="text-center py-10">
                                                <div className="w-8 h-8 mx-auto border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                            </div>
                                        ) : examLeaderboard.length === 0 ? (
                                            <div className="text-center py-10 text-slate-400 italic bg-slate-50 dark:bg-slate-700/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700">
                                                {selectedExamId ? "Belum ada nilai masuk." : "Silakan pilih ujian."}
                                            </div>
                                        ) : (
                                            examLeaderboard.map((result, idx) => (
                                                <div key={result.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 transition-colors group">
                                                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg shadow-sm border ${idx === 0 ? 'bg-yellow-100 text-yellow-600 border-yellow-200' : idx === 1 ? 'bg-slate-200 text-slate-600 border-slate-300' : idx === 2 ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-white text-slate-400 border-slate-200 dark:bg-slate-600 dark:text-slate-300 dark:border-slate-500'}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{result.student_name}</p>
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">@{result.username} • {result.submitted_at}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-xl font-black ${result.score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>{result.score}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;