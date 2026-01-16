import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, X, Loader2, AlertCircle } from 'lucide-react';

// Use the Chatbot API URL (Render/Vercel)
const RAG_API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://127.0.0.1:5001';

const RAGUploadModal = ({ isOpen, onClose }) => {
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [mode, setMode] = useState('file'); // 'file' or 'text'
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && (selected.name.endsWith('.txt') || selected.name.endsWith('.md'))) {
            setFile(selected);
            setStatus(null);
        } else {
            setStatus({ type: 'error', message: 'Please upload a .txt or .md file only.' });
        }
    };

    const handleUpload = async () => {
        setLoading(true);
        setStatus(null);

        try {
            const formData = new FormData();

            if (mode === 'file') {
                if (!file) throw new Error("No file selected");
                formData.append('file', file);
            } else {
                if (!text.trim()) throw new Error("No text entered");
                formData.append('text', text);
                formData.append('filename', 'manual_paste.txt');
            }

            const response = await fetch(`${RAG_API_URL}/admin/ingest`, {
                method: 'POST',
                body: formData // No Content-Type header needed for FormData (browser sets it)
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({
                    type: 'success',
                    message: `Success! Added ${data.chunks} chunks to index '${data.index}'.`
                });
                setFile(null);
                setText('');
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-primary px-6 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Upload Knowledge
                        </h2>
                        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">

                        {/* Tabs */}
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setMode('file')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'file' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                File Upload (.txt / .md)
                            </button>
                            <button
                                onClick={() => setMode('text')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'text' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Manual Text
                            </button>
                        </div>

                        {/* Content File */}
                        {mode === 'file' && (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors bg-gray-50">
                                <input
                                    type="file"
                                    accept=".txt,.md"
                                    id="rag-file-upload"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="rag-file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <FileText className="w-10 h-10 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {file ? file.name : "Click to select a file"}
                                    </span>
                                    <span className="text-xs text-gray-500">.txt or .md files only</span>
                                </label>
                            </div>
                        )}

                        {/* Content Text */}
                        {mode === 'text' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Paste Content</label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Paste article, policy, or info here..."
                                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                />
                            </div>
                        )}

                        {/* Status Message */}
                        {status && (
                            <div className={`p-3 rounded-lg flex items-start gap-3 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {status.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                <p>{status.message}</p>
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={handleUpload}
                            disabled={loading || (mode === 'file' && !file) || (mode === 'text' && !text.trim())}
                            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing Embeddings...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Feed into Brain
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RAGUploadModal;
