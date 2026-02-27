import React from "react";

const LoadingSpinner = ({ message = "Memuat data...", fullScreen = true }) => {
    const content = (
        <div className="flex flex-col items-center justify-center p-12 text-center relative z-20">
            {/* Ultra Premium Component */}
            <div className="relative mb-12">
                {/* Multi-layered Glow */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full scale-150 animate-pulse"></div>

                {/* Main Outer Ring */}
                <div className="w-28 h-28 rounded-full border-[3px] border-indigo-100/20 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-500 animate-[spin_1.2s_cubic-bezier(0.76,0,0.24,1)_infinite] shadow-2xl"></div>

                {/* Secondary Offset Ring */}
                <div className="absolute inset-2 rounded-full border-[3px] border-transparent border-b-blue-400 dark:border-b-blue-500/60 animate-[spin_2s_linear_infinite_reverse]"></div>

                {/* Center Pulsing Spark */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl shadow-lg animate-bounce transition-transform flex items-center justify-center rotate-45">
                        <span className="text-white text-xl -rotate-45 font-black uppercase">T</span>
                    </div>
                </div>

                {/* Satellite Particles */}
                <div className="absolute -top-4 -right-4 w-4 h-4 rounded-full bg-amber-400 animate-ping opacity-50 shadow-[0_0_15px_rgba(251,191,36,0.8)]"></div>
                <div className="absolute -bottom-2 -left-6 w-3 h-3 rounded-full bg-indigo-400 animate-pulse delay-700 opacity-40"></div>
            </div>

            <div className="space-y-4">
                <h3 className="text-3xl font-black text-indigo-950 dark:text-white tracking-tight uppercase">
                    {message}
                </h3>
                <div className="flex justify-center items-center gap-2">
                    <span className="h-1.5 w-12 bg-indigo-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-600 to-transparent w-1/2 animate-shimmer"></span>
                    </span>
                    <p className="text-[10px] text-indigo-800/40 dark:text-indigo-200/40 font-black uppercase tracking-[0.3em]">Processing</p>
                    <span className="h-1.5 w-12 bg-indigo-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-600 to-transparent w-1/2 animate-shimmer"></span>
                    </span>
                </div>
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/80 dark:bg-[#0d1117]/90 backdrop-blur-3xl overflow-hidden transition-all duration-500">
                {/* Background Decor */}
                <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] bg-indigo-500/10 rounded-full blur-[120px] animate-blob"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-emerald-500/10 rounded-full blur-[120px] animate-blob delay-2000"></div>

                {content}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[400px] bg-slate-50/30 dark:bg-slate-800/20 rounded-[4rem] border-2 border-dashed border-indigo-100/50 dark:border-slate-700/50 my-8">
            {content}
        </div>
    );
};

export default LoadingSpinner;
