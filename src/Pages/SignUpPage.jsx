import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Image from '../assets/Images/login.png'; 
import { authService, getAuthErrorMessage } from '../Components/firebase';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle email/password signup
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create new user
      const { user, error } = await authService.createUser(email, password);
      
      if (error) {
        setError(getAuthErrorMessage(error.code));
      } else {
        // Update profile with user's name
        await authService.updateUserProfile(user, {
          displayName: name
        });
        
        // Send verification email (optional)
        await authService.sendVerificationEmail(user);
        
        console.log('User registered:', user);
        navigate('/'); // Redirect to home or dashboard
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
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
        console.log('User signed up with Google:', user);
        navigate('/'); // Redirect to home or dashboard
      }
    } catch (err) {
      setError('Failed to signup with Google. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>   
      <div className='md:flex items-center gap-8'> 
        <div className='flex-1 hidden md:block'>
          <img src={Image} alt="Sign Up" />
        </div>
        <div className={`flex-1 flex flex-col gap-4 md:pl-20 p-4 bg-[url(https://www.transparenttextures.com/patterns/cubes.png)] rounded-lg`}>
          <h4 className='text-3xl text-gray-50 mt-4'>Create an Account</h4>
          <p className='text-gray-300 text-sm font-semibold'>Enter your details below</p>
          
          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-sm'>
              {error}
            </div>
          )}
          
          <div>
            <form onSubmit={handleSignUp} className='flex flex-col gap-8 bg-'>
              <input 
                type="text" 
                placeholder='Name' 
                className='border-b-2 border-gray-300 max-w-sm w-full py-3 px-1 outline-none focus:border-red-500 animation-1000 duration-800 ease-in-out text-gray-300'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
              
              <input 
                type="email" 
                placeholder='Email Address' 
                className='border-b-2 border-gray-300 max-w-sm w-full py-3 px-1 outline-none focus:border-red-500 animation-1000 duration-800 ease-in-out text-gray-300'
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
              
              <input 
                type="password" 
                placeholder='Confirm Password' 
                className='border-b-2 border-gray-300 max-w-sm w-full py-3 px-1 outline-none focus:border-red-500 animation-1000 duration-800 ease-in-out text-gray-50'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
              
              <div>
                <button 
                  type="submit" 
                  className='text-white font-semibold rounded-md bg-red-500 hover:bg-red-400 cursor-pointer flex py-2 px-6'
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>

            <div className='my-4 flex items-center max-w-sm'>
              <div className='flex-grow border-t border-gray-300'></div>
              <span className='mx-4 text-gray-500 text-sm'>OR</span>
              <div className='flex-grow border-t border-gray-300'></div>
            </div>

            <button 
              onClick={handleGoogleSignIn}
              className='flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 w-full max-w-sm hover:bg-gray-900 text-gray-50'
              disabled={loading}
            >
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
              </svg>
              Continue with Google
            </button>

            <p className='text-gray-500 mt-4'>Already have an account? <span className='text-red-500 cursor-pointer hover:underline pb-1 animation-400 duration-100 ease-in-out hover:font-semibold'><Link to="/login">Log in</Link></span></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;