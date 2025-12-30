import { useState } from 'react';
import { mediaApi } from '../services/media.api';
import useAuthStore from '../store/useAuthStore';

const LikedMediaTest = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLikedMediaAPI = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('Testing liked media API...');
      console.log('User:', user);
      console.log('Is authenticated:', isAuthenticated);
      console.log('Access token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
      
      const response = await mediaApi.getUserLikedMedia();
      console.log('API Response:', response);
      
      setTestResult({
        success: true,
        data: response,
        message: `Found ${response.data?.length || 0} liked media items`
      });
    } catch (error) {
      console.error('API Error:', error);
      setTestResult({
        success: false,
        error: error.response?.data || error.message,
        message: 'API call failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-4">Liked Media API Test</h3>
      
      <div className="mb-4 text-sm">
        <p><strong>User ID:</strong> {user?._id || 'Not available'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>Token:</strong> {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}</p>
      </div>
      
      <button 
        onClick={testLikedMediaAPI}
        disabled={loading || !isAuthenticated}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test API Call'}
      </button>
      
      {testResult && (
        <div className={`mt-4 p-3 rounded ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className="font-semibold">{testResult.message}</p>
          <pre className="text-xs mt-2 overflow-auto">
            {JSON.stringify(testResult.success ? testResult.data : testResult.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default LikedMediaTest;