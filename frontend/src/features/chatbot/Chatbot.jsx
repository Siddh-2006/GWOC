import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  AlertTriangle,
  Phone,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import axios from 'axios'; // Import axios directly
import useAuthStore from '../../store/useAuthStore';

// Brand Colors
const BRAND_PINK = "#Dd1764";
const BRAND_PURPLE = "#3F2965";

const Chatbot = () => {
  const { isOpen, setChatOpen } = useChatStore();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      content: "Hello! I'm your MindSettler assistant. I'm here to help you learn about our services and book sessions. How can I assist you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const accessToken = useAuthStore.getState().accessToken;

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chatbot/chat`, {
        message: userMessage.content,
        chatHistory: messages.map(msg => ({
          role: msg.role === 'bot' ? 'assistant' : 'user',
          content: msg.content
        }))
      }, {
        headers: {
          'Authorization': accessToken ? `Bearer ${accessToken}` : ''
        }
      });

      const data = response.data;

      // The Node.js controller returns { success: true, response: "...", actions: [...] }
      const botMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: data.response || "I didn't receive a response.",
        timestamp: new Date().toISOString(),
        isEmergency: data.isEmergency || false,
        actions: data.actions || []
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      role: 'bot',
      content: "Hello! I'm your MindSettler assistant. I'm here to help you learn about our services and book sessions. How can I assist you today?",
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 sm:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-[#3F2965] text-white p-4 rounded-t-3xl shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#Dd1764] rounded-full flex items-center justify-center shadow-sm">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm tracking-wide">MindSettler Assistant</h3>
                    <p className="text-xs text-purple-200">AI-Powered Guide</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={clearChat} className="text-purple-200 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
                    Clear
                  </button>
                  <button onClick={() => setChatOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDF9FD]">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${message.role === 'user' ? 'bg-[#3F2965] text-white' :
                      message.isEmergency ? 'bg-red-500 text-white' :
                        message.isError ? 'bg-orange-500 text-white' :
                          'bg-[#Dd1764] text-white'
                      }`}>
                      {message.role === 'user' ? <User size={14} /> : message.isEmergency ? <AlertTriangle size={14} /> : <Bot size={14} />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${message.role === 'user' ? 'bg-[#3F2965] text-white rounded-tr-none' :
                      message.isEmergency ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none' :
                        message.isError ? 'bg-orange-50 text-orange-800 border border-orange-200 rounded-tl-none' :
                          'bg-white text-[#3F2965] border border-purple-100 rounded-tl-none'
                      }`}>
                      <div
                        className={`
                          whitespace-normal break-words
                          leading-relaxed 
                          [&>b]:font-bold 
                          [&>ul]:!list-disc [&>ul]:!list-inside [&>ul]:!pl-2 [&>ul]:!mt-1 
                          [&>ol]:!list-decimal [&>ol]:!list-inside [&>ol]:!pl-2 [&>ol]:!mt-1
                          [&>li]:!mb-0.5 [&>li]:marker:text-[#Dd1764] 
                          [&>p]:!mb-1.5 
                          [&_a]:!text-[#Dd1764] [&_a]:!underline [&_a]:!font-semibold [&_a]:hover:!text-[#b01250]
                        `}
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />

                      {/* Action Buttons */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {message.actions.map((action, idx) => {
                            const isExternal = action.path.startsWith('http');
                            if (isExternal) {
                              return (
                                <a
                                  key={idx}
                                  href={action.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${action.primary
                                    ? 'bg-primary text-white hover:bg-primary/90'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-purple-100'
                                    }`}
                                >
                                  {action.label}
                                </a>
                              );
                            }
                            return (
                              <Link
                                key={idx}
                                to={action.path}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${action.primary
                                  ? 'bg-primary text-white hover:bg-primary/90'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-purple-100'
                                  }`}
                              >
                                {action.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* Emergency contact info */}
                      {message.isEmergency && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <a href="tel:+919974631313" className="inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800">
                            <Phone size={12} /> Call +91 99746 31313
                          </a>
                        </div>
                      )}

                      <p className={`text-[10px] mt-1 text-right ${message.role === 'user' ? 'text-white/60' : 'text-purple-900/40'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-[#Dd1764] rounded-full flex items-center justify-center">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-white rounded-2xl px-4 py-3 border border-purple-100 rounded-tl-none">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-[#3F2965] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[#3F2965] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[#3F2965] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        <span className="text-xs text-[#3F2965] ml-2 font-medium">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-purple-100 rounded-b-3xl">
              <div className="flex items-center space-x-2 bg-[#F3E8FF] rounded-xl px-3 py-1 border border-transparent focus-within:border-[#3F2965]/20 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-grow bg-transparent border-none outline-none focus:ring-0 text-sm py-2 text-[#3F2965] placeholder-[#3F2965]/50 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="text-[#Dd1764] p-1.5 hover:bg-white/50 rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-[#3F2965]/40 mt-1.5 text-center font-medium">
                MindSettler AI Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-toggle-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 bg-[#Dd1764] text-white rounded-full shadow-lg shadow-pink-500/20 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 ring-4 ring-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle size={26} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
