import { router } from 'expo-router';
import React, { useState } from 'react';
import RegisterForm from '../../components/RegisterForm';

import { supabase } from '../../utils/supabase';

export default function OverseeRegister() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    console.log('Registering user:', { username, email, password });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Signup error:', error.message);
      alert('Signup failed: ' + error.message);
      return;
    }

    const user = data.user;

    // 👇 Now insert into your custom `users` table
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: user?.id,         // Use the auth user ID as primary key (recommended)
        username: username,
        email: email,
        role: 'user',         // or 'admin', etc.
      },
    ]);

    if (insertError) {
      console.error('Error inserting into users table:', insertError.message);
      // alert('Account created, but failed to save profile.');
    } else {
      console.log('User registered & profile created!');
      router.push('/home'); // or dashboard screen
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleBack = () => {
    console.log('Back clicked');
    router.push('./welcome');
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

        <RegisterForm
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onRegister={handleRegister}
          onForgotPassword={handleForgotPassword}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
