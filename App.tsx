
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

  // Load state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ciphernet_user_v2');
    if (savedUser) {
      try {
        setAuthState({ user: JSON.parse(savedUser), isAuthenticated: true });
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
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

  // Persist state changes
  useEffect(() => {
    if (authState.user) {
      localStorage.setItem('ciphernet_user_v2', JSON.stringify(authState.user));
    }
    localStorage.setItem('ciphernet_messages_v2', JSON.stringify(messages));
    localStorage.setItem('ciphernet_contacts_v2', JSON.stringify(contacts));
  }, [authState.user, messages, contacts]);

  const handleLogin = (username: string, id: string) => {
    let finalId = id;
    
    // If we're attempting a restore and no manual ID was provided, check local storage
    if (!finalId) {
      const saved = localStorage.getItem('ciphernet_user_v2');
      if (saved) {
        finalId = JSON.parse(saved).id;
      }
    }

    if (!finalId) {
      alert("No Identity ID detected. Please generate a new identity or provide your existing Hex ID.");
      return;
    }
    
    setAuthState({
      user: { username, id: finalId },
      isAuthenticated: true
    });
  };

  const handleLogout = () => {
    if (confirm("Logout will hide your identity locally. Wipe all session data (messages/contacts) too?")) {
      localStorage.removeItem('ciphernet_user_v2');
      localStorage.removeItem('ciphernet_messages_v2');
      localStorage.removeItem('ciphernet_contacts_v2');
      setMessages([]);
      setContacts([]);
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
    const name = prompt("Peer Pseudonym (Display Name):");
    const peerId = prompt("Enter Peer Identity ID (Hex):");
    
    if (name && peerId) {
      if (peerId.trim().length < 8) {
        alert("Invalid ID length. IDs must be secure Hex strings.");
        return;
      }
      const cleanedId = peerId.trim();
      if (!contacts.find(c => c.id === cleanedId)) {
        setContacts(prev => [...prev, { username: name, id: cleanedId }]);
      }
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
              <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto shadow-2xl">
                <i className="fas fa-network-wired text-3xl text-indigo-500"></i>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Zero-Knowledge Network</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Add a peer node using their unique Identity ID. Your shared key combined with your unique IDs creates a mathematically unique encryption tunnel.
              </p>
              <button 
                onClick={addContact}
                className="px-6 py-3 bg-indigo-600/10 border border-indigo-600/30 text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-600/20 transition-all flex items-center gap-2 mx-auto"
              >
                <i className="fas fa-plus-circle"></i>
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
