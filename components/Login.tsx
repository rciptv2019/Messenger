
import React, { useState } from 'react';
import { cryptoService } from '../services/cryptoService';

interface LoginProps {
  onLogin: (username: string, id: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [manualId, setManualId] = useState('');
  const [isRegistering, setIsRegistering] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      if (isRegistering) {
        const newId = cryptoService.generateIdentity();
        onLogin(username, newId);
      } else {
        // Restore from storage or manual entry
        let finalId = manualId;
        if (!finalId) {
          const cached = localStorage.getItem('ciphernet_user_v3');
          if (cached) finalId = JSON.parse(cached).id;
        }
        
        if (!finalId) {
          alert("Could not find a local identity. Please paste your Identity ID.");
          return;
        }
        onLogin(username, finalId);
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full p-6 relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>

      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-10 rounded-[2rem] shadow-2xl relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30">
          <i className="fas fa-user-shield text-3xl text-white"></i>
        </div>

        <div className="text-center mt-6 mb-8">
          <h1 className="text-3xl font-bold tracking-tighter text-zinc-100">CipherNet</h1>
          <p className="text-zinc-500 text-sm mt-2 font-mono uppercase tracking-widest">
            {isRegistering ? 'Create Secure Identity' : 'Restore Stealth Session'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 px-1">Pseudonym</label>
            <div className="relative">
              <i className="fas fa-ghost absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"></i>
              <input
                type="text"
                required
                placeholder="How should peers see you?"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 px-1">Passkey</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"></i>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-200"
              />
            </div>
          </div>

          {!isRegistering && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 px-1">Identity ID (Optional if cached)</label>
              <div className="relative">
                <i className="fas fa-fingerprint absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"></i>
                <input
                  type="text"
                  placeholder="Paste your hex ID here..."
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-indigo-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full h-14 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isRegistering ? 'CREATE NEW IDENTITY' : 'RESTORE SESSION'}
            <i className={`fas ${isRegistering ? 'fa-bolt' : 'fa-right-to-bracket'} text-xs opacity-50`}></i>
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <i className="fas fa-shuffle text-[10px]"></i>
            {isRegistering ? 'Have an Identity ID?' : 'Create new identity'}
          </button>
        </div>
      </div>
    </div>
  );
};
