import { useState, useEffect } from 'react';
import { mediaApi } from '../services/media.api';
import useAuthStore from '../store/useAuthStore';

const LikedMediaDebug = () => {
  const { user, isAuthenticated, accessToken } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState({});
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDebugInfo({
      isAuthenticated,
      hasUser: !!user,
      userId: user?._id,
      userEmail: user?.email,
      hasAccessToken: !!accessToken,
      localStorageToken: !!localStorage.getItem('accessToken'),
      apiBaseUrl: import.meta.env.VITE_API_URL
    });
  }, [user, isAuthenticated, accessToken]);

  const testAPI = async () => {
    setLoading(true);
    setApiResult(null);
    
    try {
      console.log('🧪 Testing liked media API...');
      console.log('Debug info:', debugInfo);
      
      const response = await mediaApi.getUserLikedMedia();
      console.log('✅ API Success:', response);
      
      setApiResult({
        success: true,
        data: response,
        count: response.data?.length || 0
      });
    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('Error response:', error.response?.data);
      
      setApiResult({
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h3 className="text-lg font-bold mb-4">Liked Media Debug Panel</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="font-semibold mb-2">Authentication Status</h4>
          <div className="text-sm space-y-1">
            <div>Authenticated: <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>{isAuthenticated ? 'Yes' : 'No'}</span></div>
            <div>Has User: <span className={debugInfo.hasUser ? 'text-green-600' : 'text-red-600'}>{debugInfo.hasUser ? 'Yes' : 'No'}</span></div>
            <div>User ID: <span className="font-mono text-xs">{debugInfo.userId || 'None'}</span></div>
            <div>Email: <span>{debugInfo.userEmail || 'None'}</span></div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Token Status</h4>
          <div className="text-sm space-y-1">
            <div>Store Token: <span className={debugInfo.hasAccessToken ? 'text-green-600' : 'text-red-600'}>{debugInfo.hasAccessToken ? 'Present' : 'Missing'}</span></div>
            <div>LocalStorage Token: <span className={debugInfo.localStorageToken ? 'text-green-600' : 'text-red-600'}>{debugInfo.localStorageToken ? 'Present' : 'Missing'}</span></div>
            <div>API Base URL: <span className="font-mono text-xs">{debugInfo.apiBaseUrl}</span></div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={testAPI}
        disabled={loading || !isAuthenticated}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Testing API...' : 'Test Liked Media API'}
      </button>
      
      {apiResult && (
        <div className={`mt-4 p-4 rounded ${apiResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
          <h4 className="font-semibold mb-2">
            {apiResult.success ? '✅ API Success' : '❌ API Error'}
          </h4>
          
          {apiResult.success ? (
            <div>
              <p>Found {apiResult.count} liked media items</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-blue-600">View Response Data</summary>
                <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-auto max-h-40">
                  {JSON.stringify(apiResult.data, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div>
              <p>Status: {apiResult.status}</p>
              <p>Error: {apiResult.error}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-blue-600">View Error Details</summary>
                <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-auto max-h-40">
                  {JSON.stringify(apiResult.data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LikedMediaDebug;