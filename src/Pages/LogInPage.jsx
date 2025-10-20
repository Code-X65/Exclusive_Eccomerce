import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Image from '../assets/Images/authenticate.png';
import { authService, getAuthErrorMessage } from '../Components/firebase'; // Import your firebase auth services
import { toast } from 'react-toastify';

const LogInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user, error } = await authService.signInUser(email, password);
      
      if (error) {
        setError(getAuthErrorMessage(error.code));
      } else {
        // Successful login
        console.log('User logged in:', user);
        navigate('/'); // Redirect to home or dashboard
      }
    } catch (err) {
      setError('Failed to log in. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { user, error } = await authService.signInWithGoogle();
      
      if (error) {
        setError(getAuthErrorMessage(error.code));
      } else {
        // Successful login
        console.log('User logged in with Google:', user);
        navigate('/'); // Redirect to home or dashboard
      }
    } catch (err) {
      setError('Failed to log in with Google. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>   
    <div className='h-full items-center bg-[url(https://www.transparenttextures.com/patterns/cubes.png)]'>
      
      <div className='md:flex  items-center '> 
        <div className='flex-1 hidden md:block '>
          <img src={Image} alt="Login" />
        </div>
        <div className='flex-1 flex flex-col gap-4 md:pl-20 p-4  rounded-lg '>
          <h4 className='text-3xl text-gray-50 mt-4'>Login to Exclusive</h4>
          <p className='text-gray-300 text-sm font-semibold'>Enter your details below</p>
          
          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-sm'>
              {error}
            </div>
          )}
          
          <div>
            <form onSubmit={handleLogin} className='flex flex-col gap-8'>
              <input 
                type="email" 
                placeholder='Email Address' 
                className='border-b-2 border-gray-300 max-w-sm w-full py-3 px-1 outline-none focus:border-red-500 animation-1000 duration-800 ease-in-out text-gray-50'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              /> 
              
              <input 
                type="password" 
                placeholder='Password' 
                className='border-b-2 border-gray-300 max-w-sm w-full py-3 px-1 outline-none focus:border-red-500 animation-1000 duration-800 ease-in-out text-gray-50'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              
              <div className='flex items-center justify-between gap-4'>
                <button 
                  type="submit" 
                  className='text-white font-semibold rounded-md bg-red-500 hover:bg-red-400 cursor-pointer flex py-2 px-6'
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
                <p 
                  className='text-red-500 hover:underline cursor-pointer hover:underline pb-1 animation-600 duration-800 ease-in-out'
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </p>
              </div>
            </form>

            <div className='my-4 flex items-center max-w-sm'>
              <div className='flex-grow border-t border-gray-300'></div>
              <span className='mx-4 text-gray-500 text-sm'>OR</span>
              <div className='flex-grow border-t border-gray-300'></div>
            </div>

            <button 
              onClick={handleGoogleSignIn}
              className='flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 w-full max-w-sm hover:bg-gray-500 text-gray-50 '
              disabled={loading}
            >
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
              </svg>
              Continue with Google
            </button>

            <p className='text-gray-500 mt-4'>Don't have an account? <span className='text-red-500 cursor-pointer hover:underline pb-1 animation-400 duration-100 ease-in-out hover:font-semibold'><Link to="/signup">Sign up</Link></span></p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LogInPage;