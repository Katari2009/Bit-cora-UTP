import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="text-slate-300 mt-4 text-lg">Cargando...</p>
    </div>
  );
};

export default LoadingSpinner;
