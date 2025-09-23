import React from 'react';
import { AppLogoIcon } from './Logo';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-700/50">
      <div className="flex items-center gap-4 mb-4 sm:mb-0">
        <AppLogoIcon className="w-12 h-12" />
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400">
            Bitácora UTP
            </h1>
            <p className="text-slate-400">Seguimiento y Gestión de Libros de Clases.</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <img
          src={user.photoURL || 'https://picsum.photos/100'}
          alt={user.displayName || 'User Avatar'}
          className="w-10 h-10 rounded-full border-2 border-slate-600"
          referrerPolicy="no-referrer"
        />
        <div className="text-right">
            <p className="font-semibold text-slate-200">{user.displayName}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
        </div>
        <button
          onClick={onSignOut}
          className="bg-slate-700 hover:bg-red-600/50 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 ml-4"
        >
          Salir
        </button>
      </div>
    </header>
  );
};

export default Header;
