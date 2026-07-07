import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Title from '../components/Title';

const SignIn = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, setUser, navigate, backEndURL } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Input Change
  const onChangeHandler = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(backEndURL + '/api/user/register', formData);

        if (response.data.success) {
          setToken(response.data.token);
          setUser(response.data.user);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          toast.success("Account created successfully!");
          navigate('/');
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backEndURL + '/api/user/login', {
          email: formData.email,
          password: formData.password
        });

        if (response.data.success) {
          setToken(response.data.token);
          setUser(response.data.user);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          toast.success("Logged in successfully!");
          navigate('/');
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const response = await axios.post(backEndURL + '/api/user/google-login', {
        credential: credentialResponse.credential
      });

      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success("Logged in with Google successfully!");
        navigate('/');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.message || "Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  return (
    <div className='min-h-screen flex items-center justify-center py-20 px-4 pt-24'>
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-strong w-full max-w-md p-8 sm:p-10 border border-neutral-100 dark:border-neutral-700 relative overflow-hidden">

        {/* Decorative Background Blur */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-100 dark:bg-primary-900/30 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent-purple/10 dark:bg-accent-purple/5 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-200 mb-2">{currentState}</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {currentState === 'Login' ? 'Welcome back! Please login to continue.' : 'Create an account to get started.'}
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-4 relative z-10">

          {currentState === 'Sign Up' && (
            <div className="relative group">
              <User size={20} className="absolute left-3 top-3.5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                name='name'
                value={formData.name}
                onChange={onChangeHandler}
                type="text"
                placeholder="Full Name"
                className="input-field pl-10"
                required
              />
            </div>
          )}

          <div className="relative group">
            <Mail size={20} className="absolute left-3 top-3.5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              name='email'
              value={formData.email}
              onChange={onChangeHandler}
              type="email"
              placeholder="Email Address"
              className="input-field pl-10"
              required
            />
          </div>

          <div className="relative group">
            <Lock size={20} className="absolute left-3 top-3.5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              name='password'
              value={formData.password}
              onChange={onChangeHandler}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input-field pl-10 pr-10"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-neutral-400 hover:text-neutral-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type='submit' disabled={isLoading}
            className='w-full btn-primary flex items-center justify-center gap-2 mt-4'>
            {isLoading ? 'Processing...' : (
              <>
                {currentState === 'Login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative z-10 my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
          <span className="text-sm text-neutral-400 dark:text-neutral-500 font-medium">or</span>
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
        </div>

        {/* Google Sign In Button */}
        <div className="relative z-10 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width="100%"
            text={currentState === 'Login' ? 'signin_with' : 'signup_with'}
            shape="rectangular"
          />
        </div>

        <div className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400 relative z-10">
          {currentState === 'Login' ? (
            <p>Don't have an account? <span onClick={() => setCurrentState('Sign Up')} className="font-bold text-primary-600 cursor-pointer hover:underline">Sign Up</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => setCurrentState('Login')} className="font-bold text-primary-600 cursor-pointer hover:underline">Login</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
