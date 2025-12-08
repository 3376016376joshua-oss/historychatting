import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, ConnectionStatus } from '../types';
import { Send, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (val: string) => void;
  onSendMessage: () => void;
  status: ConnectionStatus;
  personaName: string;
  avatarUrl?: string; // Add avatarUrl prop
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  inputValue,
  setInputValue,
  onSendMessage,
  status,
  personaName,
  avatarUrl
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Local state to handle if the main avatar url fails
  const [imgError, setImgError] = useState(false);

  // Reset error state if avatarUrl changes
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const displayAvatarUrl = (!imgError && avatarUrl) 
    ? avatarUrl 
    : `https://api.dicebear.com/9.x/notionists/svg?seed=${personaName}&backgroundColor=cfa558`;

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] text-gray-200 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[#333] p-8 text-center">
            <div className="w-20 h-20 rounded-full border-2 border-[#333] flex items-center justify-center mb-6 overflow-hidden">
                <img 
                    src={displayAvatarUrl} 
                    alt="History" 
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover opacity-50 grayscale" 
                />
            </div>
            <p className="text-xl font-serif tracking-widest text-[#444] animate-pulse">HISTORY AWAITS</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col max-w-[85%] md:max-w-[70%] gap-1`}>
              
              {/* Message Header (Avatar/Name) */}
              <div className={`flex items-center gap-3 mb-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                 <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border overflow-hidden ${
                     msg.role === 'user' ? 'bg-[#8a1c1c] border-[#a12323]' : 'bg-[#1a1a1a] border-[#333]'
                 }`}>
                     {msg.role === 'user' ? (
                         <span className="text-xs font-bold text-white">YOU</span>
                     ) : (
                         <img 
                           src={displayAvatarUrl} 
                           alt={personaName}
                           onError={() => setImgError(true)}
                           className="w-full h-full object-cover opacity-90"
                         />
                     )}
                 </div>
                 <span className={`text-xs font-bold uppercase tracking-widest ${
                     msg.role === 'user' ? 'text-[#8a1c1c]' : 'text-[#cfa558]'
                 }`}>
                     {msg.role === 'user' ? 'You' : personaName}
                 </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 md:p-5 text-sm md:text-base leading-relaxed whitespace-pre-wrap rounded-lg shadow-lg relative ${
                  msg.role === 'user'
                    ? 'bg-[#8a1c1c] text-white rounded-tr-none'
                    : 'bg-[#1a1a1a] text-[#d1d1d1] border border-[#333] rounded-tl-none'
                }`}
              >
                {msg.content}
                
                {/* Timestamp */}
                <div className={`text-[10px] mt-2 text-right opacity-50 font-mono tracking-wide`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {status === ConnectionStatus.LOADING && (
           <div className="flex w-full justify-start">
             <div className="flex flex-col max-w-[70%] gap-1">
               <div className="flex items-center gap-3 mb-1 flex-row">
                 <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#333] flex-shrink-0 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-[#cfa558]" />
                 </div>
                 <span className="text-xs font-bold uppercase tracking-widest text-[#cfa558]">{personaName}</span>
               </div>
               <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-lg rounded-tl-none">
                 <span className="text-[#666] text-sm italic animate-pulse">Formulating response...</span>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-[#0f0f0f]">
        <div className="relative flex items-center bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden focus-within:border-[#555] transition-colors">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about his ambitions, challenges, or view of the modern world..."
            className="w-full bg-transparent text-[#e0e0e0] placeholder-[#555] p-4 pr-14 outline-none font-sans"
            disabled={status === ConnectionStatus.LOADING}
          />
          <button
            onClick={onSendMessage}
            disabled={!inputValue.trim() || status === ConnectionStatus.LOADING}
            className={`absolute right-2 p-2 rounded transition-all ${
              !inputValue.trim() || status === ConnectionStatus.LOADING
                ? 'text-[#333] cursor-not-allowed'
                : 'bg-[#333] text-[#cfa558] hover:bg-[#444] hover:text-[#eebb55]'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-center mt-2">
            <span className="text-[#cfa558] text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                Simulating Conversation (Backend Pending)
            </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;