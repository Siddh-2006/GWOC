import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, AlertCircle, Heart, Sparkles, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reflectionApi } from '../../services/reflection.api';

/**
 * Admin Component for Managing Reflection Questions
 * Allows admin to view, edit, add, and delete reflection questions
 */
const ReflectionQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [saving, setSaving] = useState(false);

  // Default questions for fallback
  const defaultQuestions = [
    {
      questionNumber: 1,
      category: 'emotional-awareness',
      questionText: 'When something difficult happens, how clearly can you recognize what you\'re feeling?',
      options: [
        { value: 'very-clearly', label: 'Very clearly' },
        { value: 'somewhat-clearly', label: 'Somewhat clearly' },
        { value: 'not-very-clearly', label: 'Not very clearly' },
        { value: 'usually-confused', label: 'I usually feel confused' }
      ],
      isActive: true
    }
  ];

  // Load questions on component mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await reflectionApi.admin.getQuestions();
      if (response.success) {
        setQuestions(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError('Failed to load questions from server. Showing default questions.');
      setQuestions(defaultQuestions);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setCurrentQuestion(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (question) => {
    setCurrentQuestion(question);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (questionData) => {
    try {
      setSaving(true);
      setError('');

      let response;
      if (currentQuestion?._id) {
        response = await reflectionApi.admin.updateQuestion(currentQuestion._id, questionData);
      } else {
        response = await reflectionApi.admin.addQuestion(questionData);
      }

      if (response.success) {
        await loadQuestions(); // Refresh all to ensure correct ordering
        setIsModalOpen(false);
      } else {
        setError(response.message || 'Failed to save question');
      }
    } catch (err) {
      setError(err.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!questionId) {
      setError("Cannot delete fallback questions. Please refresh or check server connection.");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await reflectionApi.admin.deleteQuestion(questionId);
      if (response.success) {
        setQuestions(prev => prev.filter(q => q._id !== questionId));
      } else {
        setError(response.message || 'Failed to delete question');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Synchronizing quiz setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-black text-primary tracking-tight">Quiz Setup</h1>
            <div className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest">
              Admin
            </div>
          </div>
          <p className="text-primary/60 max-w-2xl font-medium">
            Configure the pre-session reflection quiz for first-time clients. These insights help our AI generate preliminary summaries.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Create Question
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl mb-8 flex items-center gap-4 shadow-sm"
        >
          <AlertCircle size={20} />
          <p className="flex-1 font-medium">{error}</p>
          <button onClick={() => setError('')} className="hover:bg-red-100 p-1.5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </motion.div>
      )}

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          icon={LayoutGrid}
          label="Total Base"
          value={questions.length}
          color="bg-purple-50 text-purple-600 border-purple-100"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active Quiz"
          value={questions.filter(q => q.isActive).length}
          color="bg-green-50 text-green-600 border-green-100"
        />
        <StatCard
          icon={Sparkles}
          label="Unique Categories"
          value={new Set(questions.map(q => q.category)).size}
          color="bg-pink-50 text-pink-600 border-pink-100"
        />
      </div>

      {/* QUESTIONS MAPPING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {questions.length > 0 ? (
          questions.map((question) => (
            <QuestionCard
              key={question._id || `fallback-${question.questionNumber}`}
              question={question}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteQuestion}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Heart size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Questions Defined</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">
              Get started by adding your first reflection question to the system.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Add First Question
            </button>
          </div>
        )}
      </div>

      {/* MODAL SYSTEM */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <QuestionForm
              question={currentQuestion}
              onSave={handleSaveQuestion}
              onCancel={() => setIsModalOpen(false)}
              saving={saving}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`p-6 rounded-3xl border ${color} flex items-center gap-6 shadow-sm overflow-hidden relative`}>
    <div className="absolute top-0 right-0 p-8 opacity-5">
      <Icon size={80} strokeWidth={3} />
    </div>
    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  </div>
);

const QuestionCard = ({ question, onEdit, onDelete }) => (
  <motion.div
    layout
    className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20">
          {question.questionNumber}
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
            {question.category?.replace(/-/g, ' ')}
          </span>
          <h3 className="font-bold text-lg text-primary leading-tight mt-1">
            {question.questionText}
          </h3>
        </div>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(question)}
          className="p-2.5 bg-purple-50 text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(question._id)}
          className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
      {question.options?.map((option, index) => (
        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/20 transition-colors">
          <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-primary border border-gray-200">
            {String.fromCharCode(65 + index)}
          </div>
          <span className="text-sm font-medium text-primary/70">{option.label}</span>
        </div>
      ))}
    </div>

    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${question.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${question.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
        {question.isActive ? 'Live in Quiz' : 'Draft Only'}
      </span>
      <span className="text-[10px] text-gray-400 font-medium italic">
        Last updated: {new Date(question.updatedAt || Date.now()).toLocaleDateString()}
      </span>
    </div>
  </motion.div>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-[#3F2965]/90 backdrop-blur-sm"
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10"
    >
      {children}
    </motion.div>
  </div>
);

const QuestionForm = ({ question, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    questionNumber: question?.questionNumber || '',
    category: question?.category || 'emotional-awareness',
    questionText: question?.questionText || '',
    options: question?.options || Array(4).fill({ value: '', label: '' }),
    isActive: question?.isActive ?? true
  });

  const categories = [
    { value: 'emotional-awareness', label: 'Emotional Awareness' },
    { value: 'emotional-expression', label: 'Emotional Expression' },
    { value: 'stress-response', label: 'Stress Response' },
    { value: 'self-reflection', label: 'Self Reflection' },
    { value: 'adaptability', label: 'Adaptability' },
    { value: 'relationship-orientation', label: 'Relationship Orientation' },
    { value: 'coping-style', label: 'Coping Style' },
    { value: 'sense-of-control', label: 'Sense of Control' },
    { value: 'openness-to-growth', label: 'Openness to Growth' },
    { value: 'self-description', label: 'Self Description' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-2xl font-black text-primary tracking-tight">
            {question ? 'Configure Question' : 'New Question'}
          </h2>
          <p className="text-xs font-bold text-secondary uppercase tracking-widest mt-1">Quiz Parameters</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 flex-1">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Position Number</label>
            <input
              type="number"
              value={formData.questionNumber}
              onChange={(e) => setFormData({ ...formData, questionNumber: parseInt(e.target.value) })}
              className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary transition-all font-bold text-primary outline-none"
              min="1" required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Domain Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary transition-all font-bold text-primary outline-none appearance-none"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Question Statement</label>
          <textarea
            value={formData.questionText}
            onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
            className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary transition-all font-medium text-primary outline-none h-28 resize-none"
            placeholder="How would you describe your current state..."
            required
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 block">Response Options (Exactly 4)</label>
          <div className="grid grid-cols-1 gap-4">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black flex-shrink-0 shadow-md">
                  {String.fromCharCode(65 + index)}
                </div>
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...formData.options];
                    newOptions[index] = { ...option, label: e.target.value, value: e.target.value.toLowerCase().replace(/ /g, '-') };
                    setFormData({ ...formData, options: newOptions });
                  }}
                  className="flex-1 px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary transition-all font-medium text-primary outline-none"
                  placeholder={`Expression for option ${String.fromCharCode(65 + index)}`}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-5 h-5 rounded border-purple-200 text-primary focus:ring-primary cursor-pointer"
            id="isActiveToggle"
          />
          <label htmlFor="isActiveToggle" className="text-sm font-bold text-primary cursor-pointer">
            Activate this question immediately
          </label>
        </div>
      </form>

      <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 bg-primary hover:bg-secondary text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/10 disabled:opacity-50 active:scale-[0.98]"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Save size={20} />
          )}
          {question ? 'Update Changes' : 'Publish Question'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 bg-white border-2 border-gray-200 text-gray-500 hover:bg-gray-100 rounded-2xl font-black transition-all"
        >
          Discard
        </button>
      </div>
    </div>
  );
};

export default ReflectionQuestions;
