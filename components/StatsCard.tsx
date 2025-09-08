
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value }) => {
  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-xl p-6 shadow-md">
      <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h4>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  );
};

export default StatsCard;
