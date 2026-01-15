import React from 'react';
import { motion } from 'framer-motion';

const GoogleSignInButton = ({ text = 'Continue with Google' }) => {
  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth endpoint
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <motion.button
      type="button"
      onClick={handleGoogleSignIn}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full py-4 px-6 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.8055 10.2292C19.8055 9.55056 19.7501 8.86667 19.6306 8.19861H10.2V12.0486H15.6014C15.3773 13.2911 14.6571 14.3898 13.6025 15.0875V17.5861H16.8251C18.7173 15.8444 19.8055 13.2722 19.8055 10.2292Z" fill="#4285F4"/>
        <path d="M10.2 20C12.9573 20 15.2722 19.1056 16.8293 17.5861L13.6067 15.0875C12.7031 15.6972 11.5509 16.0433 10.2042 16.0433C7.54068 16.0433 5.28435 14.2833 4.48435 11.9167H1.16602V14.4917C2.75935 17.6583 6.31102 20 10.2 20Z" fill="#34A853"/>
        <path d="M4.47998 11.9167C4.05998 10.6742 4.05998 9.33056 4.47998 8.08806V5.51306H1.16581C-0.388524 8.60556 -0.388524 12.3989 1.16581 15.4914L4.47998 11.9167Z" fill="#FBBC04"/>
        <path d="M10.2 3.95667C11.6254 3.93556 13.0042 4.47222 14.0375 5.45667L16.8931 2.60111C15.1848 0.990556 12.9323 0.0822222 10.2 0.104444C6.31102 0.104444 2.75935 2.44611 1.16602 5.61278L4.48018 8.18778C5.27602 5.81611 7.53652 3.95667 10.2 3.95667Z" fill="#EA4335"/>
      </svg>
      {text}
    </motion.button>
  );
};

export default GoogleSignInButton;
