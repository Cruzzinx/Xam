// src/components/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);

    const isExamsActiveParent = location.pathname.startsWith('/exams');

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    if (!user) return null;

    const getMenuItems = (role) => {
        const baseItems = [
            { name: "Dashboard", path: "/dashboard", icon: "📊" },
        ];

        if (role === 'siswa') {
            return [
                ...baseItems,
                { name: "Exams", path: "/exams", icon: "📝" },
                { name: "Grades", path: "/grades", icon: "🏆" },
                { name: "Profile", path: "/profile", icon: "👤" },
            ];
        }

        return [
            ...baseItems,
            { name: "Exams", path: "/manage-questions", icon: "📚" },
            { name: "Class", path: "/manage-users", icon: "👥" },
            { name: "Profile", path: "/profile", icon: "👤" },
        ];
    };

    const menuItems = getMenuItems(user.role);
    const displayName = user.name || user.username || "User";

    // Dynamic Width Classes
    const sidebarWidthClass = isHovered ? "w-72" : "w-20";
    const sidebarRoundedClass = isHovered ? "rounded-br-[80px] rounded-tr-none" : "rounded-r-none";

    return (
        <div
            className={`${sidebarWidthClass} ${sidebarRoundedClass} bg-white dark:bg-slate-900 min-h-screen flex flex-col justify-between shadow-[25px_0_50px_-15px_rgba(0,0,0,0.1)] dark:shadow-none transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-50 relative border-r border-slate-100 dark:border-slate-800 overflow-hidden`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div>
                {/* Brand Logo */}
                <div className="h-16 flex items-center border-b border-slate-100 dark:border-slate-800 overflow-hidden relative">
                    <div className="absolute left-[-4px] w-20 h-full flex items-center justify-center z-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-tl-xl rounded-bl-xl rounded-tr-lg rounded-br-[24px] shadow-lg flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                            <span className="text-white text-xl font-black">X</span>
                        </div>
                    </div>
                    <span className={`absolute left-[76px] text-3xl font-black text-slate-900 dark:text-white tracking-tighter transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden whitespace-nowrap ${isHovered ? 'opacity-100 translate-x-0 w-auto scale-100' : 'opacity-0 translate-x-10 w-0 scale-50 pointer-events-none'}`}>
                        Xam
                    </span>
                </div>

                <div className="mt-8"></div>

                {/* Profile Section */}
                <Link
                    to="/profile"
                    className="mx-0 mb-8 h-14 flex items-center group transition-all duration-500 relative"
                >
                    <div className="absolute left-[-4px] w-20 h-full flex items-center justify-center z-10">
                        <div className="relative w-10 h-10 transition-transform group-hover:scale-110 duration-500">
                            {user.profile_photo_url ? (
                                <img
                                    src={user.profile_photo_url}
                                    alt="profile"
                                    className="rounded-tl-2xl rounded-bl-2xl rounded-tr-xl rounded-br-[32px] w-full h-full object-cover border border-slate-200 dark:border-slate-600 shadow-sm"
                                />
                            ) : (
                                <div className="w-full h-full rounded-tl-2xl rounded-bl-2xl rounded-tr-xl rounded-br-[32px] bg-indigo-600 flex items-center justify-center text-white text-sm font-bold border border-slate-200 dark:border-slate-600 shadow-sm">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                        </div>
                    </div>

                    <div className={`absolute left-[76px] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col ${isHovered ? 'opacity-100 translate-x-0 max-w-[160px] scale-100' : 'opacity-0 translate-x-10 max-w-0 scale-50 pointer-events-none'}`}>
                        <h2 className="text-slate-900 dark:text-slate-100 font-bold text-[14px] leading-tight truncate">
                            {displayName}
                        </h2>
                        <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em]">{user.role}</p>
                    </div>
                </Link>

                {/* Navigation Menu */}
                <div className="px-3">
                    <p className={`text-[10px] font-black text-slate-400/50 mb-3 px-3 transition-all duration-700 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>NAVIGASI</p>
                    <ul className="space-y-2">
                        {menuItems.map((item, index) => {
                            const isActive = item.path === '/exams' ? isExamsActiveParent : location.pathname === item.path;
                            return (
                                <li key={item.name} className="relative h-12">
                                    <Link
                                        to={item.path}
                                        className="w-full h-full flex items-center group"
                                    >
                                        {/* Background Layer (Locked to Row Width) */}
                                        <div className={`absolute inset-0 rounded-tl-2xl rounded-bl-2xl rounded-tr-xl rounded-br-[40px] transition-all duration-300
                                            ${isActive
                                                ? "bg-indigo-600 shadow-xl shadow-indigo-200 dark:shadow-none"
                                                : "hover:bg-indigo-50 dark:hover:bg-slate-800"
                                            }
                                        `}></div>

                                        {/* Icon Layer (Mathematical Center of 80px Sidebar) */}
                                        {/* We use -mx-3 to compensate for li px-3 padding so it stays exactly centered at 40px */}
                                        <div className="absolute left-[-16px] w-20 h-full flex items-center justify-center z-10 pointer-events-none">
                                            <span className={`text-xl transition-transform group-hover:scale-110 duration-500 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                                                {item.icon}
                                            </span>
                                        </div>

                                        {/* Label Layer */}
                                        <span className={`absolute left-[64px] font-black text-sm whitespace-nowrap transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'} ${isHovered ? 'opacity-100 translate-x-0 w-auto scale-100' : 'opacity-0 translate-x-10 w-0 scale-50 pointer-events-none'}`}
                                            style={{ transitionDelay: isHovered ? `${(index + 1) * 80}ms` : '0ms' }}>
                                            {item.name}
                                        </span>

                                        {/* Tooltip for collapsed state */}
                                        {!isHovered && (
                                            <div className="absolute left-full ml-6 px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50 shadow-2xl border border-slate-700 uppercase tracking-widest">
                                                {item.name}
                                            </div>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {/* Theme Toggle */}
                <div className="relative h-12">
                    <button
                        onClick={toggleTheme}
                        className="w-full h-full flex items-center group"
                    >
                        <div className={`absolute inset-0 rounded-tl-2xl rounded-bl-2xl rounded-tr-xl rounded-br-[40px] transition-all duration-300
                            ${theme === 'light'
                                ? 'bg-amber-50 hover:bg-amber-100'
                                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                            }
                        `}></div>

                        <div className="absolute left-[-16px] w-20 h-full flex items-center justify-center z-10 pointer-events-none">
                            <span className="text-xl transition-transform group-hover:scale-110 duration-500">
                                {theme === 'light' ? '☀️' : '🌙'}
                            </span>
                        </div>

                        <span className={`absolute left-[64px] font-black text-sm whitespace-nowrap transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'} ${isHovered ? 'opacity-100 translate-x-0 w-auto scale-100' : 'opacity-0 translate-x-10 w-0 scale-50 pointer-events-none'}`}>
                            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                        </span>

                        {!isHovered && (
                            <div className="absolute left-full ml-6 px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50 shadow-2xl border border-slate-700 uppercase tracking-widest">
                                {theme === 'light' ? 'Light' : 'Dark'}
                            </div>
                        )}
                    </button>
                </div>

                {/* Logout */}
                <div className="relative h-12">
                    <button
                        onClick={handleLogout}
                        className="w-full h-full flex items-center group"
                    >
                        <div className="absolute inset-0 rounded-tl-2xl rounded-bl-2xl rounded-tr-xl rounded-br-[40px] transition-all duration-300 bg-rose-50/50 hover:bg-rose-500 dark:bg-rose-500/10 dark:hover:bg-rose-500"></div>

                        <div className="absolute left-[-16px] w-20 h-full flex items-center justify-center z-10 pointer-events-none">
                            <span className="text-xl transition-transform group-hover:scale-110 duration-500 group-hover:text-white">🚪</span>
                        </div>

                        <span className={`absolute left-[64px] font-black text-sm whitespace-nowrap transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden text-rose-500 group-hover:text-white ${isHovered ? 'opacity-100 translate-x-0 w-auto scale-100' : 'opacity-0 translate-x-10 w-0 scale-50 pointer-events-none'}`}>
                            Keluar
                        </span>

                        {!isHovered && (
                            <div className="absolute left-full ml-6 px-4 py-2 bg-rose-600 text-white text-xs font-black rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50 shadow-2xl uppercase tracking-widest">
                                Keluar
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
