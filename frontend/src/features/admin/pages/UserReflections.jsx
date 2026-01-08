import React, { useState, useEffect } from 'react';
import {
  Heart,
  Search,
  ExternalLink,
  Calendar,
  User,
  ChevronRight,
  Filter,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { reflectionApi } from '../../../services/reflection.api';

const UserReflections = () => {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReflections();
  }, []);

  const fetchReflections = async () => {
    try {
      setLoading(true);
      const response = await reflectionApi.admin.getSubmissions();
      if (response.success) {
        setReflections(response.data);
      } else {
        setError('Failed to fetch reflections');
      }
    } catch (err) {
      console.error('Error fetching reflections:', err);
      setError('An error occurred while fetching reflections');
    } finally {
      setLoading(false);
    }
  };

  const filteredReflections = reflections.filter(ref =>
    ref.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Heart className="text-secondary" size={28} />
            User Reflections
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and analyze pre-session reflections from first-time clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all w-full md:w-64"
            />
          </div>
          <button
            onClick={fetchReflections}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
            title="Refresh"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Stats Cards (Optional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Reflections</p>
          <p className="text-3xl font-bold text-primary">{reflections.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">New To System</p>
          <p className="text-3xl font-bold text-secondary">
            {reflections.filter(r => {
              const date = new Date(r.createdAt);
              const now = new Date();
              return (now - date) < (7 * 24 * 60 * 60 * 1000);
            }).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
          <p className="text-lg font-bold text-green-600 flex items-center gap-2">
            AI Summary Active
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading reflections...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchReflections}
              className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredReflections.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No reflections found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">
              {searchTerm ? `No results for "${searchTerm}"` : "No users have completed their reflection yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted On</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">AI Summary Preview</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReflections.map((ref) => (
                  <tr key={ref._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lavender rounded-xl flex items-center justify-center text-primary font-bold">
                          {ref.name?.[0] || <User size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{ref.name}</p>
                          <p className="text-sm text-gray-500">{ref.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {ref.reflectionCompleted ? (
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100 uppercase tracking-wider">
                          Completed
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-50 text-gray-400 text-xs font-bold rounded-full border border-gray-100 uppercase tracking-wider">
                          Not Started
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        {ref.reflectionCompleted ? formatDate(ref.createdAt) : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-md italic">
                        {ref.reflectionCompleted
                          ? (ref.reflectionSummary || 'AI summary pending...')
                          : 'No data submitted yet.'}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/user/${ref.authId || ref._id}`}
                          className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-all"
                          title="View Reflection & Profile"
                        >
                          <ArrowRight size={20} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReflections;
