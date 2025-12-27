import React, { useState } from 'react';

const ContactDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const runDebugTests = async () => {
    setLoading(true);
    const results = {};

    // Check localStorage token
    const token = localStorage.getItem('accessToken');
    results.hasToken = !!token;
    results.tokenPreview = token ? `${token.substring(0, 20)}...` : 'No token';

    // Decode JWT token to check user info (basic decode, not verification)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        results.tokenPayload = payload;
        results.userRole = payload.role || 'No role in token';
        results.userId = payload.userId || 'No userId in token';
      } catch (error) {
        results.tokenDecodeError = 'Failed to decode token';
      }
    }

    // Check API base URL
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    results.apiBaseUrl = API_BASE_URL;

    // Test debug endpoints (no auth required) - for checking backend data
    try {
      const statsResponse = await fetch('http://localhost:3001/api/contact/stats-debug');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        results.debugStats = statsData;
      }
    } catch (error) {
      // Debug endpoints removed, this is expected
    }

    // Test authenticated endpoints
    if (token) {
      try {
        const authStatsResponse = await fetch(`${API_BASE_URL}/contact/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        const authStatsData = await authStatsResponse.json();
        results.authStats = { status: authStatsResponse.status, data: authStatsData };
      } catch (error) {
        results.authStatsError = error.message;
      }

      try {
        const authMessagesResponse = await fetch(`${API_BASE_URL}/contact/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        const authMessagesData = await authMessagesResponse.json();
        results.authMessages = { status: authMessagesResponse.status, data: authMessagesData };
      } catch (error) {
        results.authMessagesError = error.message;
      }
    }

    setDebugInfo(results);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-4">Contact System Debug</h2>
      
      <button
        onClick={runDebugTests}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Running Tests...' : 'Run Debug Tests'}
      </button>

      {Object.keys(debugInfo).length > 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">User Authentication</h3>
            <p><strong>Has Token:</strong> {debugInfo.hasToken ? '✅ Yes' : '❌ No'}</p>
            <p><strong>User Role:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                debugInfo.userRole === 'admin' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {debugInfo.userRole || 'Not found'}
              </span>
            </p>
            <p><strong>User ID:</strong> {debugInfo.userId || 'Not found'}</p>
            {debugInfo.tokenDecodeError && (
              <p className="text-red-600"><strong>Token Error:</strong> {debugInfo.tokenDecodeError}</p>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Configuration</h3>
            <p><strong>API Base URL:</strong> {debugInfo.apiBaseUrl}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Backend Data (No Auth Required)</h3>
            {debugInfo.debugStats && (
              <div className="mb-2">
                <strong>📊 Messages in Database:</strong>
                <div className="bg-white p-2 rounded mt-1 text-sm">
                  <p>Total: {debugInfo.debugStats.data?.total || 0}</p>
                  <p>Unread: {debugInfo.debugStats.data?.unread || 0}</p>
                  <p>Read: {debugInfo.debugStats.data?.read || 0}</p>
                  <p>Replied: {debugInfo.debugStats.data?.replied || 0}</p>
                </div>
              </div>
            )}
            {debugInfo.debugStatsError && (
              <p className="text-red-600"><strong>Stats Error:</strong> {debugInfo.debugStatsError}</p>
            )}
            
            {debugInfo.debugMessages && (
              <div className="mb-2">
                <strong>📝 Messages Count:</strong> {debugInfo.debugMessages.data?.contacts?.length || 0}
              </div>
            )}
            {debugInfo.debugMessagesError && (
              <p className="text-red-600"><strong>Messages Error:</strong> {debugInfo.debugMessagesError}</p>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Admin API Access</h3>
            {debugInfo.authStats && (
              <div className="mb-2">
                <strong>✅ Auth Stats (Status {debugInfo.authStats.status}):</strong>
                <pre className="text-sm bg-white p-2 rounded mt-1">
                  {JSON.stringify(debugInfo.authStats.data, null, 2)}
                </pre>
              </div>
            )}
            {debugInfo.authStatsError && (
              <p className="text-red-600"><strong>❌ Auth Stats Error:</strong> {debugInfo.authStatsError}</p>
            )}
            
            {debugInfo.authMessages && (
              <div className="mb-2">
                <strong>✅ Auth Messages (Status {debugInfo.authMessages.status}):</strong>
                <p>Count: {debugInfo.authMessages.data?.data?.contacts?.length || 0}</p>
              </div>
            )}
            {debugInfo.authMessagesError && (
              <p className="text-red-600"><strong>❌ Auth Messages Error:</strong> {debugInfo.authMessagesError}</p>
            )}
          </div>

          {debugInfo.userRole !== 'admin' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold mb-2 text-yellow-800">🚨 Admin Access Required</h3>
              <p className="text-yellow-700 mb-2">
                Your user role is "{debugInfo.userRole}" but "admin" is required to access contact messages.
              </p>
              <div className="bg-yellow-100 p-3 rounded text-sm">
                <p className="font-semibold">To make your user an admin:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Open terminal in the backend directory</li>
                  <li>Run: <code className="bg-gray-200 px-1 rounded">node scripts/make-user-admin.js your-email@example.com</code></li>
                  <li>Replace "your-email@example.com" with your actual email</li>
                  <li>Refresh this page and try again</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactDebug;