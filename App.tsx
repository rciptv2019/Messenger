
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { Login } from './components/Login';
import { AuthState, Message, User } from './types';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [activeContact, setActiveContact] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPeerName, setNewPeerName] = useState('');
  const [newPeerId, setNewPeerId] = useState('');

  // Load state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ciphernet_user_v3');
    if (savedUser) {
      try {
        setAuthState({ user: JSON.parse(savedUser), isAuthenticated: true });
      } catch (e) {
        console.error("Restore failed", e);
      }
    }
    const savedMessages = localStorage.getItem('ciphernet_messages_v3');
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    
    const savedContacts = localStorage.getItem('ciphernet_contacts_v3');
    if (savedContacts) setContacts(JSON.parse(savedContacts));
  }, []);

  // Persist state
  useEffect(() => {
    if (authState.user) {
      localStorage.setItem('ciphernet_user_v3', JSON.stringify(authState.user));
    }
    localStorage.setItem('ciphernet_messages_v3', JSON.stringify(messages));
    localStorage.setItem('ciphernet_contacts_v3', JSON.stringify(contacts));
  }, [authState.user, messages, contacts]);

  const handleLogin = (username: string, id: string) => {
    setAuthState({
      user: { username, id },
      isAuthenticated: true
    });
  };

  const handleLogout = () => {
    if (confirm("Logout will hide your identity locally. Wipe session data too?")) {
      localStorage.clear();
      setMessages([]);
      setContacts([]);
    }
    setAuthState({ user: null, isAuthenticated: false });
    setActiveContact(null);
  };

  const handleAddPeer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPeerName && newPeerId) {
      const cleanedId = newPeerId.trim();
      if (!contacts.find(c => c.id === cleanedId)) {
        setContacts(prev => [...prev, { username: newPeerName, id: cleanedId }]);
      }
      setNewPeerName('');
      setNewPeerId('');
      setIsModalOpen(false);
    }
  };

  const handleSendMessage = useCallback((encrypted: string, iv: string) => {
    if (!authState.user || !activeContact) return;
    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderId: authState.user.id,
      receiverId: activeContact.id,
      encryptedContent: encrypted,
      iv: iv,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  }, [authState.user, activeContact]);

  if (!authState.isAuthenticated) {
    return (
      <Layout>
        <Login onLogin={handleLogin} />
      </Layout>
    );
  }

  const filteredMessages = messages.filter(m => 
    (m.senderId === authState.user?.id && m.receiverId === activeContact?.id) ||
    (m.senderId === activeContact?.id && m.receiverId === authState.user?.id)
  );

  return (
    <Layout>
      <div className="flex w-full h-full relative">
        <Sidebar 
          currentUser={authState.user}
          contacts={contacts}
          activeContact={activeContact}
          onSelectContact={setActiveContact}
          onLogout={handleLogout}
          onAddContact={() => setIsModalOpen(true)}
        />
        
        {activeContact ? (
          <ChatWindow 
            currentUser={authState.user}
            targetUser={activeContact}
            messages={filteredMessages}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden bg-zinc-950">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at center, #4f46e5 0%, transparent 70%)'}}></div>
            <div className="relative z-10 space-y-6 max-w-sm">
              <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto shadow-2xl">
                <i className="fas fa-network-wired text-3xl text-indigo-500"></i>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Zero-Knowledge Network</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Add a peer node using their unique Identity ID. Your shared key combined with your unique IDs creates a mathematically unique encryption tunnel.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-indigo-600/10 border border-indigo-600/30 text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-600/20 transition-all flex items-center gap-2 mx-auto"
              >
                <i className="fas fa-plus-circle"></i>
                Link Peer Node
              </button>
            </div>
          </div>
        )}

        {/* Custom Modal for Adding Peer */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-zinc-100">Establish New Link</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleAddPeer} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Peer Display Name</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    value={newPeerName}
                    onChange={(e) => setNewPeerName(e.target.value)}
                    placeholder="e.g. Agent Smith"
                    className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-sm text-zinc-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Peer Identity ID (Hex)</label>
                  <input
                    required
                    type="text"
                    value={newPeerId}
                    onChange={(e) => setNewPeerId(e.target.value)}
                    placeholder="Paste the unique ID here..."
                    className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-xs font-mono text-indigo-400 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-14 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                  ADD PEER NODE
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
