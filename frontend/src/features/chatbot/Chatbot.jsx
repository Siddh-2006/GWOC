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
import { useChatStore } from '../../store/useChatStore';
import apiClient from '../../api/apiClient';

const Chatbot = () => {
  const { isOpen, setChatOpen } = useChatStore();
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

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
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

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare chat history for API (exclude IDs and timestamps)
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await apiClient.post('/chatbot/chat', {
        message: userMessage.content,
        chatHistory: chatHistory
      });

      const data = response.data;

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          role: 'bot',
          content: data.response,
          timestamp: data.timestamp,
          isEmergency: data.isEmergency
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to call us directly at +91 99746 31313.",
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
    setMessages([
      {
        id: 1,
        role: 'bot',
        content: "Hello! I'm your MindSettler assistant. I'm here to help you learn about our services and book sessions. How can I assist you today?",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Chat Window */}
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
            <div className="bg-primary text-white p-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">MindSettler Assistant</h3>
                    <p className="text-xs text-purple-200">AI-Powered Guide</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearChat}
                    className="text-purple-200 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => setChatOpen(false)} 
                    className="hover:bg-white/10 p-1 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-purple-50/30">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-primary text-white' 
                        : message.isEmergency 
                          ? 'bg-red-500 text-white'
                          : message.isError
                            ? 'bg-orange-500 text-white'
                            : 'bg-secondary text-white'
                    }`}>
                      {message.role === 'user' ? (
                        <User size={14} />
                      ) : message.isEmergency ? (
                        <AlertTriangle size={14} />
                      ) : (
                        <Bot size={14} />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-3 text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : message.isEmergency
                          ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                          : message.isError
                            ? 'bg-orange-50 text-orange-800 border border-orange-200 rounded-tl-none'
                            : 'bg-white text-primary shadow-sm border border-purple-100 rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      
                      {/* Emergency contact info */}
                      {message.isEmergency && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <a 
                            href="tel:+919974631313"
                            className="inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800"
                          >
                            <Phone size={12} />
                            Call +91 99746 31313
                          </a>
                        </div>
                      )}
                      
                      <p className="text-xs opacity-60 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-white rounded-2xl px-4 py-3 border border-purple-100 rounded-tl-none">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-primary ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-purple-100 rounded-b-3xl">
              <div className="flex items-center space-x-2 bg-purple-50 rounded-2xl px-3 py-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about MindSettler..."
                  disabled={isLoading}
                  className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-2 text-primary placeholder-primary/60 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="text-secondary p-1 hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
              <p className="text-xs text-primary/60 mt-2 text-center">
                AI-powered assistant • For emergencies, call 112
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setChatOpen(!isOpen)}
        className="w-14 h-14 bg-secondary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 ring-4 ring-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default Chatbot;
