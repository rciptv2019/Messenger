
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

  // Load state
  useEffect(() => {
    const savedUser = localStorage.getItem('ciphernet_user_v2');
    if (savedUser) {
      setAuthState({ user: JSON.parse(savedUser), isAuthenticated: true });
    }
    const savedMessages = localStorage.getItem('ciphernet_messages_v2');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    const savedContacts = localStorage.getItem('ciphernet_contacts_v2');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  }, []);

  // Save state
  useEffect(() => {
    if (authState.user) {
      localStorage.setItem('ciphernet_user_v2', JSON.stringify(authState.user));
    }
    localStorage.setItem('ciphernet_messages_v2', JSON.stringify(messages));
    localStorage.setItem('ciphernet_contacts_v2', JSON.stringify(contacts));
  }, [authState.user, messages, contacts]);

  const handleLogin = (username: string, id?: string) => {
    // If no ID is provided, we try to restore from localStorage (simplified logic for demo)
    const existingId = localStorage.getItem('ciphernet_user_v2') ? JSON.parse(localStorage.getItem('ciphernet_user_v2')!).id : id;
    
    setAuthState({
      user: { username, id: existingId || 'temp_id_error' },
      isAuthenticated: true
    });
  };

  const handleLogout = () => {
    if (confirm("Logout will hide your identity locally. Wipe session data too?")) {
      localStorage.removeItem('ciphernet_user_v2');
      localStorage.removeItem('ciphernet_messages_v2');
      localStorage.removeItem('ciphernet_contacts_v2');
    }
    setAuthState({ user: null, isAuthenticated: false });
    setActiveContact(null);
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

  const addContact = () => {
    const name = prompt("Peer Pseudonym:");
    const peerId = prompt("Enter the Peer Identity ID (Hex):");
    
    if (name && peerId) {
      if (peerId.length < 8) {
        alert("Invalid ID length.");
        return;
      }
      setContacts(prev => [...prev, { username: name, id: peerId }]);
    }
  };

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
      <div className="flex w-full h-full">
        <Sidebar 
          currentUser={authState.user}
          contacts={contacts}
          activeContact={activeContact}
          onSelectContact={setActiveContact}
          onLogout={handleLogout}
          onAddContact={addContact}
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
              <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
                <i className="fas fa-network-wired text-3xl text-indigo-500"></i>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Zero-Knowledge Network</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Add a peer node using their unique Identity ID. Your shared key combined with your IDs creates a mathematically unique encryption tunnel.
              </p>
              <button 
                onClick={addContact}
                className="px-6 py-3 bg-indigo-600/10 border border-indigo-600/30 text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-600/20 transition-all"
              >
                Link Peer Node
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
