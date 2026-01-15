import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { authApi } from '../features/auth/auth.api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth, setError } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        setError('Authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      if (!accessToken || !refreshToken) {
        setError('Invalid authentication response');
        navigate('/login');
        return;
      }

      try {
        // Get user profile with the tokens
        const response = await authApi.getProfile(accessToken);
        
        if (response.success) {
          setAuth(response.data.user, accessToken, refreshToken);
          
          // Redirect based on role
          if (response.data.user?.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/profile', { replace: true });
          }
        } else {
          setError('Failed to fetch user profile');
          navigate('/login');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication failed');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth, setError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
