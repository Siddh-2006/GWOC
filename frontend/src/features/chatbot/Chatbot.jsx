import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ArrowRight } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const { messages, isOpen, setChatOpen, addMessage } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleSend = () => {
    if (!inputValue.trim()) return;

    addMessage({ text: inputValue, sender: 'user' });

    // Simple logic to redirect or give info
    const input = inputValue.toLowerCase();

    setTimeout(() => {
      if (input.includes('book') || input.includes('session') || input.includes('appointment')) {
        addMessage({
          text: "I can help you with that! Preparing to take your first session is a great step. You can view available slots here.",
          sender: 'bot',
          action: { label: 'Go to Booking', path: '/booking' }
        });
      } else if (input.includes('price') || input.includes('cost')) {
        addMessage({
          text: "Our sessions are 60 minutes long. For pricing and payment details (UPI/Cash), please visit our FAQ page.",
          sender: 'bot',
          action: { label: 'View FAQ', path: '/faqs' }
        });
      } else {
        addMessage({
          text: "I'm here to guide you through MindSettler's services. For specific concerns, I recommend booking a session with Parnika.",
          sender: 'bot'
        });
      }
    }, 800);

    setInputValue('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col border border-purple-100 overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">MindSettler Guide</h4>
                  <p className="text-xs text-purple-200">Online</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="hover:bg-white/10 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-purple-50/30">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-white text-primary shadow-sm border border-purple-100 rounded-tl-none'
                    }`}>
                    {msg.text}
                    {msg.action && (
                      <button
                        onClick={() => {
                          navigate(msg.action.path);
                          setChatOpen(false);
                        }}
                        className="mt-3 w-full py-2 bg-secondary text-white rounded-xl flex items-center justify-center space-x-2 text-xs font-semibold"
                      >
                        <span>{msg.action.label}</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-purple-100">
              <div className="flex items-center space-x-2 bg-purple-50 rounded-2xl px-3 py-1">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-2 text-primary"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} className="text-secondary p-1 hover:scale-110 transition-transform">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setChatOpen(!isOpen)}
        className="w-14 h-14 bg-secondary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 ring-4 ring-white"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default Chatbot;
