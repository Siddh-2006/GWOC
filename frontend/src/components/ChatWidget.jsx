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

import apiClient from '../api/apiClient';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
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
            // 🚀 Call the Node.js Gemini Backend
            // Map messages to history format expected by backend: { role: 'user' | 'bot', content: string }
            const chatHistory = messages.slice(1).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'bot',
                content: msg.content
            }));

            const response = await apiClient.post('/chatbot/chat', {
                message: userMessage.content,
                chatHistory: chatHistory
            });

            const data = response.data;

            // Handle the Node.js Backend Response Format: { success: true, response: "...", isEmergency: boolean }
            const botMessage = {
                id: Date.now() + 1,
                role: 'bot',
                content: data.response || "I didn't receive a response.",
                timestamp: data.timestamp || new Date().toISOString(),
                isEmergency: data.isEmergency || false
            };

            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error('Chat error:', error);

            const errorMessage = {
                id: Date.now() + 1,
                role: 'bot',
                content: "I apologize, but I'm having trouble connecting right now. Please try again later.",
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
        <>
            {/* Floating Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 ${isOpen
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-primary hover:bg-primary/90'
                    }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
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
                            <X size={24} className="text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageCircle size={24} className="text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-40 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-primary text-white p-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Bot size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">MindSettler Assistant</h3>
                                        <p className="text-xs text-purple-100">AI Powered</p>
                                    </div>
                                </div>
                                <button
                                    onClick={clearChat}
                                    className="text-purple-200 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-start gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                            ? 'bg-primary text-white'
                                            : message.isEmergency
                                                ? 'bg-red-500 text-white'
                                                : message.isError
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {message.role === 'user' ? (
                                                <User size={16} />
                                            ) : message.isEmergency ? (
                                                <AlertTriangle size={16} />
                                            ) : (
                                                <Bot size={16} />
                                            )}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-primary text-white'
                                            : message.isEmergency
                                                ? 'bg-red-50 text-red-800 border border-red-200'
                                                : message.isError
                                                    ? 'bg-orange-50 text-orange-800 border border-orange-200'
                                                    : 'bg-white text-gray-800 border border-gray-200'
                                            }`}>
                                            <div
                                                className="text-sm leading-relaxed [&>b]:font-bold [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mt-2 [&>li]:mb-1 [&>p]:mb-2"
                                                dangerouslySetInnerHTML={{ __html: message.content }}
                                            ></div>

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
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <Bot size={16} className="text-gray-600" />
                                        </div>
                                        <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
                                            <div className="flex items-center gap-1">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                </div>
                                                <span className="text-xs text-gray-500 ml-2">Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Send size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
