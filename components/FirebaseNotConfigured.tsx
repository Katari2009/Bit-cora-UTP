import React from 'react';

const FirebaseNotConfigured: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 text-white">
      <div className="max-w-2xl w-full bg-slate-800/60 backdrop-blur-md border border-red-500/50 rounded-lg shadow-lg p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h1 className="text-3xl font-bold text-red-300 mb-3">Configuración de Firebase Requerida</h1>
        <p className="text-slate-300 mb-6">
          La aplicación no puede iniciarse porque las credenciales de Firebase no se han proporcionado.
          Para continuar, debe configurar su proyecto de Firebase.
        </p>
        <div className="text-left bg-slate-900 p-4 rounded-md border border-slate-700">
          <p className="text-slate-400 mb-2">1. Abra el archivo <code className="bg-slate-700 text-amber-300 px-2 py-1 rounded">firebaseConfig.ts</code> en su editor de código.</p>
          <p className="text-slate-400">2. Reemplace los valores de ejemplo con las credenciales de su propio proyecto de Firebase.</p>
          <pre className="mt-4 p-3 bg-black/30 rounded-md overflow-x-auto text-sm">
            <code>
{`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "...",
  appId: "1:..."
};`}
            </code>
          </pre>
        </div>
        <p className="text-slate-500 mt-6 text-sm">
          Puede encontrar estas credenciales en la configuración de su proyecto de Firebase en la sección "Your apps".
        </p>
      </div>
    </div>
  );
};

export default FirebaseNotConfigured;
