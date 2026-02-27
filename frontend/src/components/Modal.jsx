import React from "react";

const Modal = ({ show, onClose, title, children, maxWidth = "max-w-2xl" }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
            <div
                className={`bg-white dark:bg-slate-800 rounded-[3rem] p-10 w-full ${maxWidth} shadow-2xl border border-indigo-100 dark:border-slate-700 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:text-rose-500 transition-all font-black text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
