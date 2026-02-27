import React, { useState, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import { toast } from 'react-hot-toast';

function ProfilePage() {
    const { user, getAuthHeaders, updateUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi client-side
        if (!file.type.startsWith('image/')) {
            toast.error("File harus berupa gambar!");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 2MB!");
            return;
        }

        const formData = new FormData();
        formData.append('photo', file);

        setUploading(true);
        const loadingToast = toast.loading("Mengunggah foto profil...");

        try {
            const response = await fetch(`${API_URL}/user/profile-photo`, {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    // Jangan set Content-Type untuk FormData agar browser set otomatis dengan boundary
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Gagal mengunggah foto");

            updateUser(data.user);
            toast.success("Foto profil berhasil diperbarui!", { id: loadingToast });
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.message, { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    const initialData = {
        fullName: user?.name || user?.username || 'User',
        email: user?.email || 'N/A',
        role: user?.role?.toUpperCase() || 'STUDENT'
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />

            <div className="flex-1 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 sm:p-10 overflow-y-auto custom-scrollbar">
                <style>{`
                    @keyframes float {
                        0% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(10px, -15px) rotate(2deg); }
                        66% { transform: translate(-5px, 10px) rotate(-1deg); }
                        100% { transform: translate(0, 0) rotate(0deg); }
                    }
                    @keyframes slideIn {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-float { animation: float 10s ease-in-out infinite; }
                    .animate-slide-up { animation: slideIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
                    .delay-1 { animation-delay: 0.1s; }
                    .delay-2 { animation-delay: 0.2s; }
                    .delay-3 { animation-delay: 0.3s; }
                `}</style>

                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-black mb-10 text-indigo-950 dark:text-white tracking-tight flex items-center gap-4 animate-slide-up">
                        <span className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-indigo-50 dark:border-slate-700">👤</span>
                        Profil Pengguna
                    </h1>

                    <div className="relative group p-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50/50 dark:border-slate-700 mb-10 transition-all duration-500 overflow-hidden animate-slide-up delay-1 hover:shadow-indigo-200/50 dark:hover:shadow-indigo-500/10 hover:-translate-y-1">
                        {/* Background Decor with Floating Animation */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 animate-float"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10 animate-float" style={{ animationDelay: '-5s' }}></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            {/* Photo Upload Section */}
                            <div className="relative">
                                <div
                                    onClick={handlePhotoClick}
                                    className={`w-40 h-40 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white text-6xl font-black shadow-2xl shadow-indigo-200 dark:shadow-none cursor-pointer overflow-hidden group/photo relative ring-8 ring-white dark:ring-slate-700 transition-all duration-500 hover:scale-105 active:scale-95 ${uploading ? 'animate-pulse' : ''}`}
                                >
                                    {user?.profile_photo_url ? (
                                        <img src={user.profile_photo_url} alt="profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-110" />
                                    ) : (
                                        <span className="group-hover/photo:scale-125 transition-transform duration-500">{initialData.fullName.charAt(0)}</span>
                                    )}

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px] opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-[10px] font-black uppercase tracking-widest gap-2">
                                        <span className="text-2xl transform translate-y-4 group-hover/photo:translate-y-0 transition-transform duration-500">📸</span>
                                        GANTI FOTO
                                    </div>

                                    {uploading && (
                                        <div className="absolute inset-0 bg-indigo-600/80 backdrop-blur-sm flex items-center justify-center">
                                            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl shadow-xl flex items-center justify-center text-xl border-4 border-slate-50 dark:border-slate-900 group-hover:rotate-12 transition-transform duration-500">
                                    <span className="flex items-center justify-center animate-bounce">📸</span>
                                </div>
                            </div>

                            <div className="text-center md:text-left">
                                <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                                    <h2 className="text-4xl font-black text-indigo-950 dark:text-white tracking-tighter">{initialData.fullName}</h2>
                                    <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm animate-pulse">
                                        {initialData.role}
                                    </div>
                                </div>
                                <p className="text-xl text-slate-400 dark:text-slate-500 font-bold mb-6 italic opacity-80">@{user?.username}</p>

                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 px-5 py-2.5 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl border border-white dark:border-slate-700 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-700 hover:shadow-md cursor-default">
                                        <span className="text-slate-400">📧</span>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{initialData.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-5 py-2.5 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl border border-white dark:border-slate-700 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-700 hover:shadow-md cursor-default">
                                        <span className="text-slate-400">🆔</span>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">#{user?.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Account Details */}
                        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-white dark:border-slate-700 transition-all duration-500 animate-slide-up delay-2 hover:shadow-2xl hover:-translate-y-1">
                            <h3 className="text-xl font-black mb-8 text-indigo-950 dark:text-white flex items-center gap-3">
                                <span className="w-10 h-10 bg-indigo-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-lg shadow-sm">📋</span>
                                Informasi Akun
                            </h3>

                            <div className="space-y-6">
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-hover/field:text-indigo-400">Nama Lengkap</label>
                                    <div className="p-4 bg-white/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 transition-all group-hover/field:border-indigo-100 dark:group-hover/field:border-indigo-900/30 group-hover/field:shadow-sm">
                                        {initialData.fullName}
                                    </div>
                                </div>
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-hover/field:text-indigo-400">Username</label>
                                    <div className="p-4 bg-white/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 transition-all group-hover/field:border-indigo-100 dark:group-hover/field:border-indigo-900/30 group-hover/field:shadow-sm">
                                        {user?.username}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security & System */}
                        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-white dark:border-slate-700 transition-all duration-500 animate-slide-up delay-3 hover:shadow-2xl hover:-translate-y-1">
                            <h3 className="text-xl font-black mb-8 text-indigo-950 dark:text-white flex items-center gap-3">
                                <span className="w-10 h-10 bg-amber-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-lg shadow-sm">🔒</span>
                                Keamanan & Akses
                            </h3>

                            <div className="space-y-6">
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-hover/field:text-amber-400">Status Akun</label>
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 font-bold text-emerald-700 dark:text-emerald-300 transition-all group-hover/field:shadow-md group-hover/field:scale-[1.02]">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                        Aktif
                                    </div>
                                </div>
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-hover/field:text-indigo-400">Hak Akses</label>
                                    <div className="p-4 bg-white/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider transition-all group-hover/field:border-indigo-100 group-hover/field:shadow-sm">
                                        {initialData.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 text-center animate-slide-up delay-3 opacity-30 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] font-black tracking-[0.5em] text-slate-400 dark:text-slate-500">XAM CBT PROJECT • 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
