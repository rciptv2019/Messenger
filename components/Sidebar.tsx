
import React from 'react';
import { User } from '../types';
import { SecurityDashboard } from './SecurityDashboard';

interface SidebarProps {
  currentUser: User | null;
  contacts: User[];
  activeContact: User | null;
  onSelectContact: (contact: User) => void;
  onLogout: () => void;
  onAddContact: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentUser, 
  contacts, 
  activeContact, 
  onSelectContact, 
  onLogout,
  onAddContact 
}) => {
  const copyId = () => {
    if (currentUser?.id) {
      navigator.clipboard.writeText(currentUser.id);
      alert("Your ID has been copied to clipboard!");
    }
  };

  return (
    <div className="w-80 flex flex-col border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      {/* Header */}
      <div className="p-6 border-b border-zinc-900 bg-zinc-900/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-shield-cat text-lg"></i>
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-100">{currentUser?.username}</h2>
              <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE
              </span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-zinc-500 hover:text-red-400 transition-colors p-2"
          >
            <i className="fas fa-power-off"></i>
          </button>
        </div>

        {/* My ID Display */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 group relative cursor-pointer" onClick={copyId}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Your Private ID</span>
            <i className="fas fa-copy text-[9px] text-zinc-600 group-hover:text-indigo-400"></i>
          </div>
          <p className="text-[10px] font-mono text-indigo-400 truncate pr-4">
            {currentUser?.id}
          </p>
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex items-center justify-between px-2 mb-4">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Peer Nodes</span>
          <button 
            onClick={onAddContact}
            className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
          >
            <i className="fas fa-plus-circle mr-1"></i> Add Peer
          </button>
        </div>
        
        {contacts.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xs text-zinc-600 italic">No nodes detected.</p>
          </div>
        )}

        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group border ${
              activeContact?.id === contact.id 
                ? 'bg-zinc-800/80 border-zinc-700 shadow-xl' 
                : 'hover:bg-zinc-900/50 border-transparent'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono ${
              activeContact?.id === contact.id ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-500'
            }`}>
              {contact.username.substring(0, 1).toUpperCase()}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-zinc-200">{contact.username}</p>
              <p className="text-[9px] font-mono text-zinc-600 truncate">{contact.id}</p>
            </div>
          </button>
        ))}
      </div>

      <SecurityDashboard />
    </div>
  );
};
