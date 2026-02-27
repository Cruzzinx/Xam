import React from "react";
import Modal from "./Modal";

const ConfirmModal = ({ show, onClose, onConfirm, title, message, confirmText = "YA, YAKIN", cancelText = "BATALKAN", type = "danger" }) => {
    return (
        <Modal show={show} onClose={onClose} title={title} maxWidth="max-w-md">
            <div className="text-center py-4">
                <div className={`text-6xl mb-6 ${type === 'danger' ? 'text-rose-500' : 'text-indigo-500'}`}>
                    {type === 'danger' ? '⚠️' : '❓'}
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium text-lg leading-relaxed mb-10 px-4">
                    {message}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${type === 'danger'
                            ? 'bg-rose-500 text-white shadow-rose-100 dark:shadow-none hover:bg-black'
                            : 'bg-indigo-600 text-white shadow-indigo-100 dark:shadow-none hover:bg-black'
                            }`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
