import { router } from 'expo-router';
import React, { useState } from 'react';
import LoginForm from '../../components/LogInForm';

import { supabase } from '../../utils/supabase';

export default function OverseeLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login failed:', error.message);
      alert('Login failed: ' + error.message);
    } else {
      console.log('Login success:', data);
      router.push('/home');
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleRegister = () => {
    console.log('Register clicked');
    router.push('./register');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl font-light text-black mr-2">R</span>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white rounded-full"></div>
            </div>
            <span className="text-4xl font-light text-black ml-2">VERSEE</span>
          </div>
        </div>

        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onLogin={handleLogin}
          onForgotPassword={handleForgotPassword}
          onRegister={handleRegister}
        />
      </div>
    </div>
  );
}
