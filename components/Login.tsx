import React, { useState } from 'react';
import { AppLogoIcon } from './Logo';
import { GoogleIcon } from './Icons';

interface LoginProps {
  onSignIn: () => Promise<void>;
  authError: string | null;
}

const Login: React.FC<LoginProps> = ({ onSignIn, authError }) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignInClick = () => {
    setIsSigningIn(true);
    onSignIn();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center p-8 bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <AppLogoIcon className="w-20 h-20" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400">
            Bitácora UTP
          </h1>
          <p className="text-slate-400 text-lg">
            Seguimiento y Gestión de Libros de Clases.
          </p>
        </div>
        
        {authError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg mb-6 text-left" role="alert">
                <p className="font-bold">Error de Autenticación</p>
                <p>{authError}</p>
            </div>
        )}
        
        <p className="text-slate-300 mb-8">
          Por favor, inicie sesión para continuar.
        </p>
        <button
          onClick={handleSignInClick}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-md disabled:bg-slate-300 disabled:scale-100 disabled:cursor-wait"
        >
          {isSigningIn ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirigiendo...
            </>
          ) : (
            <>
              <GoogleIcon className="w-6 h-6" />
              Iniciar sesión con Google
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;