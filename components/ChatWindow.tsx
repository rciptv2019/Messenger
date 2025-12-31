
import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from '../types';
import { cryptoService } from '../services/cryptoService';

interface ChatWindowProps {
  currentUser: User | null;
  targetUser: User;
  messages: Message[];
  onSendMessage: (encrypted: string, iv: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUser,
  targetUser,
  messages,
  onSendMessage
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [sharedKey, setSharedKey] = useState('');
  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, decryptedMessages]);

  useEffect(() => {
    const decryptAll = async () => {
      if (!sharedKey || !currentUser) {
        setDecryptedMessages({});
        return;
      }
      
      const newDecrypted: Record<string, string> = {};
      for (const msg of messages) {
        // Use both participant IDs for derivation
        const plain = await cryptoService.decrypt(
          msg.encryptedContent, 
          msg.iv, 
          sharedKey,
          currentUser.id,
          targetUser.id
        );
        newDecrypted[msg.id] = plain;
      }
      setDecryptedMessages(newDecrypted);
    };
    decryptAll();
  }, [messages, sharedKey, currentUser, targetUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !sharedKey || !currentUser) return;

    const { encrypted, iv } = await cryptoService.encrypt(
      inputMessage, 
      sharedKey,
      currentUser.id,
      targetUser.id
    );
    onSendMessage(encrypted, iv);
    setInputMessage('');
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Top Bar */}
      <div className="h-20 flex items-center justify-between px-8 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-mono text-zinc-400 border border-zinc-700">
            {targetUser.username.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-zinc-100">{targetUser.username}</h3>
            <span className="text-[9px] text-zinc-600 font-mono flex items-center gap-1.5">
              <i className="fas fa-fingerprint text-indigo-500"></i>
              {targetUser.id}
            </span>
          </div>
        </div>

        {/* Shared Secret Input */}
        <div className="flex items-center gap-3">
          <div className={`relative flex items-center transition-all duration-300 ${isKeyVisible ? 'w-72' : 'w-10'}`}>
            <input
              type={isKeyVisible ? "text" : "password"}
              placeholder="Enter PACTED Shared Key..."
              value={sharedKey}
              onChange={(e) => setSharedKey(e.target.value)}
              className={`h-10 bg-zinc-900 border border-zinc-800 rounded-lg px-4 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-700 ${
                isKeyVisible ? 'opacity-100' : 'opacity-0 cursor-default pointer-events-none'
              }`}
            />
            <button 
              onClick={() => setIsKeyVisible(!isKeyVisible)}
              className={`absolute right-0 h-10 w-10 flex items-center justify-center rounded-lg transition-colors bg-zinc-900 border border-zinc-800 ${
                sharedKey ? 'text-indigo-400' : 'text-zinc-600'
              }`}
            >
              <i className={`fas ${isKeyVisible ? 'fa-eye-slash' : 'fa-key'}`}></i>
            </button>
          </div>
          {sharedKey && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
               <i className="fas fa-shield text-[10px] text-emerald-500"></i>
               <span className="text-[9px] text-emerald-500 font-bold uppercase">Keys Matched</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
      >
        {!sharedKey && messages.length > 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-amber-500/5 border border-amber-500/10 rounded-3xl">
            <i className="fas fa-user-secret text-amber-500 text-3xl mb-4"></i>
            <h4 className="text-sm font-bold text-zinc-300">Identity-Bound Encryption Active</h4>
            <p className="text-xs text-zinc-500 max-w-xs mt-2 px-4">
              Decryption requires the password agreed upon with this specific peer. 
              The key is unique to your IDs combined.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          const decrypted = decryptedMessages[msg.id];
          const isFailed = decrypted === "[DECRYPTION_FAILED]";

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] group`}>
                <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase">
                    {isMe ? 'Local Node' : targetUser.username}
                  </span>
                </div>
                
                <div className={`
                  relative p-4 rounded-2xl text-sm leading-relaxed transition-all shadow-xl
                  ${isMe 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-zinc-800/80 text-zinc-200 rounded-tl-none border border-zinc-700/50'}
                  ${!decrypted ? 'font-mono text-[10px] opacity-30 break-all select-none bg-zinc-900/50' : ''}
                  ${isFailed ? 'bg-red-950/50 border-red-500/30 text-red-300' : ''}
                `}>
                  {!sharedKey ? (
                    <div className="flex flex-col gap-1">
                      <span className="opacity-50"># ENCRYPTED_FRAME_DATA:</span>
                      <span className="break-all">{msg.encryptedContent.substring(0, 100)}...</span>
                    </div>
                  ) : isFailed ? (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-triangle-exclamation text-red-500"></i>
                      <span>Key mismatch or corrupted entropy.</span>
                    </div>
                  ) : (
                    decrypted
                  )}
                </div>
                <div className={`mt-1 text-[8px] text-zinc-700 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                  SIG: {msg.id.split('-')[0]} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Input */}
      <div className="p-8 pt-4">
        <form 
          onSubmit={handleSend}
          className={`relative group flex items-center gap-4 p-2 pl-6 bg-zinc-900/80 border border-zinc-800 rounded-[1.5rem] transition-all ${
            !sharedKey ? 'opacity-30 pointer-events-none' : 'focus-within:border-indigo-500/50'
          }`}
        >
          <input
            type="text"
            disabled={!sharedKey}
            placeholder="Type your pact-secured message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 h-12 bg-transparent text-sm focus:outline-none text-zinc-100"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="w-12 h-12 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center shadow-lg shadow-indigo-600/20"
          >
            <i className="fas fa-bolt"></i>
          </button>
        </form>
        <div className="mt-4 px-4 flex justify-between">
           <div className="flex items-center gap-4 text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">
             <span className="flex items-center gap-1"><i className="fas fa-microchip"></i> AES-GCM-256</span>
             <span className="flex items-center gap-1 text-indigo-500"><i className="fas fa-link"></i> SHA-256 SALT BINDING</span>
           </div>
        </div>
      </div>
    </div>
  );
};
