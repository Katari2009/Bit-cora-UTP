import React, { useState } from 'react';

interface AddTeacherModalProps {
  onClose: () => void;
  onAdd: (name: string) => void;
}

const AddTeacherModal: React.FC<AddTeacherModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(name);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900/60 backdrop-blur-2xl border border-white/20 rounded-xl shadow-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 className="text-2xl font-bold text-white mb-4">Añadir Nuevo Docente</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="teacher-name" className="block text-slate-400 text-sm font-bold mb-2">
              Nombre Completo
            </label>
            <input
              id="teacher-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/20 border border-white/20 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500"
              placeholder="Ej: Juan Pérez"
              autoFocus
            />
          </div>
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-indigo-500/30 border border-indigo-500/40 hover:bg-indigo-500/40 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Añadir Docente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacherModal;