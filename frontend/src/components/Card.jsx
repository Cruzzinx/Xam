import React from "react";

const Card = ({ title, count, icon }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-700 p-6 flex items-center justify-between transition-all duration-300 hover:-translate-y-1">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-indigo-950 dark:text-white">{count}</h3>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-2xl shadow-inner text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>
    </div>
  );
};

export default Card;
