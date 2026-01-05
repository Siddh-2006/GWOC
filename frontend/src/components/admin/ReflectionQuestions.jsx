import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, AlertCircle } from 'lucide-react';
import { reflectionApi } from '../../services/reflection.api';

/**
 * Admin Component for Managing Reflection Questions
 * Allows admin to view, edit, add, and delete reflection questions
 */
  const ReflectionQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
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
    },
    {
      questionNumber: 2,
      category: 'emotional-expression',
      questionText: 'How comfortable are you expressing your feelings to someone you trust?',
      options: [
        { value: 'very-comfortable', label: 'Very comfortable' },
        { value: 'somewhat-comfortable', label: 'Somewhat comfortable' },
        { value: 'rarely-comfortable', label: 'Rarely comfortable' },
        { value: 'usually-avoid', label: 'I usually avoid it' }
      ],
      isActive: true
    },
    {
      questionNumber: 3,
      category: 'stress-response',
      questionText: 'When under stress, what describes you best?',
      options: [
        { value: 'pause-and-think', label: 'I pause and think things through' },
        { value: 'overwhelmed-but-manage', label: 'I feel overwhelmed but try to manage' },
        { value: 'react-quickly', label: 'I react quickly without much thought' },
        { value: 'withdraw-shutdown', label: 'I tend to withdraw or shut down' }
      ],
      isActive: true
    }
  ];

  // Load questions on component mount
  useEffect(() => {
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
        console.error('Error loading questions:', err);
        setError('Failed to load questions from server. Showing default questions.');
        // Use default questions as fallback
        setQuestions(defaultQuestions);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const handleSaveQuestion = async (questionData) => {
    try {
      setSaving(true);
      
      let response;
      if (editingQuestion) {
        response = await reflectionApi.admin.updateQuestion(editingQuestion._id, questionData);
      } else {
        response = await reflectionApi.admin.addQuestion(questionData);
      }
      
      if (response.success) {
        if (editingQuestion) {
          // Update existing question
          setQuestions(prev => prev.map(q => 
            q._id === editingQuestion._id ? response.data : q
          ));
        } else {
          // Add new question
          setQuestions(prev => [...prev, response.data]);
        }
        
        setEditingQuestion(null);
        setShowAddForm(false);
      } else {
        setError(response.message || 'Failed to save question');
      }
    } catch (err) {
      setError('Failed to save question: ' + (err.message || 'Network error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const response = await reflectionApi.admin.deleteQuestion(questionId);
      
      if (response.success) {
        setQuestions(prev => prev.filter(q => q._id !== questionId));
      } else {
        setError(response.message || 'Failed to delete question');
      }
    } catch (err) {
      setError('Failed to delete question: ' + (err.message || 'Network error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reflection questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-primary">Reflection Questions</h2>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Manage the questions shown to first-time clients during pre-session reflection
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Active: {questions.filter(q => q.isActive).length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              Inactive: {questions.filter(q => !q.isActive).length}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Quick Stats */}
      {questions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Heart size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{questions.filter(q => q.isActive).length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-500">{questions.filter(q => !q.isActive).length}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(questions.map(q => q.category)).size}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900 mb-1">First-Session-Only System</h3>
            <p className="text-sm text-blue-800 mb-2">
              These questions are shown only to clients booking their first session. Returning clients skip the reflection entirely.
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Only active questions are shown to clients</p>
              <p>• AI generates a one-time summary for therapist preparation</p>
              <p>• Questions are presented in order by question number</p>
              <p>• Each question should have exactly 4 answer options</p>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question) => (
          <QuestionCard
            key={question._id || question.questionNumber}
            question={question}
            onEdit={setEditingQuestion}
            onDelete={handleDeleteQuestion}
            isEditing={editingQuestion?._id === question._id}
            onSave={handleSaveQuestion}
            onCancel={() => setEditingQuestion(null)}
            saving={saving}
          />
        ))}
      </div>

      {questions.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reflection Questions</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first reflection question to help understand clients before their first session.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus size={16} />
            Create First Question
          </button>
          <div className="mt-6 text-xs text-gray-400">
            <p>💡 Tip: Start with 5-10 questions covering emotional awareness, coping styles, and relationship patterns</p>
          </div>
        </div>
      )}

      {/* Add Question Form */}
      {showAddForm && (
        <QuestionForm
          onSave={handleSaveQuestion}
          onCancel={() => setShowAddForm(false)}
          saving={saving}
        />
      )}
    </div>
  );
};

// Question Card Component
const QuestionCard = ({ question, onEdit, onDelete, isEditing, onSave, onCancel, saving }) => {
  if (isEditing) {
    return (
      <QuestionForm
        question={question}
        onSave={onSave}
        onCancel={onCancel}
        saving={saving}
      />
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
            {question.questionNumber}
          </span>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {question.category?.replace('-', ' ')}
            </span>
            <h3 className="font-medium text-gray-800 mt-1">
              {question.questionText}
            </h3>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(question)}
            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(question._id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span className="text-gray-600">{option.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span className={`px-2 py-1 rounded-full ${
          question.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {question.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

// Question Form Component
const QuestionForm = ({ question, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    questionNumber: question?.questionNumber || '',
    category: question?.category || 'emotional-awareness',
    questionText: question?.questionText || '',
    options: question?.options || [
      { value: '', label: '' },
      { value: '', label: '' },
      { value: '', label: '' },
      { value: '', label: '' }
    ],
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
    
    // Validate form
    if (!formData.questionText.trim()) {
      alert('Please enter a question text');
      return;
    }
    
    if (formData.options.some(opt => !opt.label.trim())) {
      alert('Please fill in all option labels');
      return;
    }

    // Generate values from labels if not provided
    const processedOptions = formData.options.map(opt => ({
      value: opt.value || opt.label.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      label: opt.label.trim()
    }));

    onSave({
      ...formData,
      options: processedOptions
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Number
            </label>
            <input
              type="number"
              value={formData.questionNumber}
              onChange={(e) => setFormData({...formData, questionNumber: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              min="1"
              max="20"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text
          </label>
          <textarea
            value={formData.questionText}
            onChange={(e) => setFormData({...formData, questionText: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-20 resize-none"
            placeholder="Enter the question text..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Answer Options
          </label>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-3">
                <span className="flex items-center justify-center w-8 h-10 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...formData.options];
                    newOptions[index] = { ...option, label: e.target.value };
                    setFormData({...formData, options: newOptions});
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <Save size={16} />
            {question ? 'Update Question' : 'Add Question'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReflectionQuestions;