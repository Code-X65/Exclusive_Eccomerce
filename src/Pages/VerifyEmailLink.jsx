import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, getAuthErrorMessage } from '../Components/firebase';
import { toast } from 'react-toastify';

const VerifyEmailLink = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        // Check if URL has sign-in link
        if (!authService.isSignInLink()) {
          setError('Invalid or expired sign-in link');
          setLoading(false);
          return;
        }

        // Get email from localStorage
        const email = authService.getEmailForSignIn();
        if (!email) {
          setError('Email not found. Please sign up again.');
          setLoading(false);
          return;
        }

        // Complete sign-in with email link
        const { user, error } = await authService.signInWithEmailLink(email, window.location.href);

        if (error) {
          setError(getAuthErrorMessage(error.code));
          setLoading(false);
        } else {
          // Successfully signed in
          toast.success('Account created and verified! Welcome!');
          console.log('User signed in with email link:', user);
          
          // Redirect to home after 2 seconds
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      } catch (err) {
        setError('Failed to verify email link. Please try again.');
        console.error(err);
        setLoading(false);
      }
    };

    completeSignIn();
  }, [navigate]);

  return (
    <div className='flex items-center justify-center min-h-screen bg-[url(https://www.transparenttextures.com/patterns/cubes.png)]'>
      <div className='flex flex-col gap-4 p-8 bg-gray-900 rounded-lg max-w-md'>
        {loading && (
          <>
            <h4 className='text-2xl text-gray-50 text-center'>Verifying Your Email</h4>
            <p className='text-gray-300 text-center'>Please wait while we verify your email...</p>
            <div className='flex justify-center mt-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-red-500'></div>
            </div>
          </>
        )}

        {error && !loading && (
          <>
            <h4 className='text-2xl text-gray-50 text-center'>Verification Failed</h4>
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
              {error}
            </div>
            <button 
              onClick={() => navigate('/signup')}
              className='text-white font-semibold rounded-md bg-red-500 hover:bg-red-400 cursor-pointer py-2 px-6'
            >
              Back to Sign Up
            </button>
          </>
        )}

        {!loading && !error && (
          <>
            <h4 className='text-2xl text-gray-50 text-center'>Success!</h4>
            <p className='text-gray-300 text-center'>Your account has been verified. Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailLink;