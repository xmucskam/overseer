import { router } from 'expo-router';
import React, { useState } from 'react';
import RegisterForm from '../../components/RegisterForm';

export default function OverseeRegister() {
  const [username, setUsername] = useState('johndoe');
  const [email, setEmail] = useState('johndoe@gmail.com');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = () => {
    console.log('Login attempted');
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
          onLogin={handleLogin}
          onForgotPassword={handleForgotPassword}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
