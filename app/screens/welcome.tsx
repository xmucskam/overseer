import React, { useState } from 'react';

export default function OverseeLogin() {
  const [email, setEmail] = useState('johndoe@gmail.com');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = () => {
    console.log('Login attempted');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleRegister = () => {
    console.log('Register clicked');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-left mb-8">
          <span className="text-sm text-gray-500">Login</span>
        </div>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl font-light text-black mr-2">R</span>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white rounded-full"></div>
            </div>
            <span className="text-4xl font-light text-black ml-2">VERSEE</span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 focus:outline-none bg-transparent text-gray-500"
              placeholder="johndoe@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 focus:outline-none bg-transparent text-gray-500"
              placeholder="••••••••"
            />
          </div>

          <div className="text-left">
            <button
              onClick={handleForgotPassword}
              className="text-sm text-blue-500 hover:underline"
            >
              forgot password?
            </button>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={handleRegister}
              className="text-sm text-blue-500 hover:underline"
            >
              register
            </button>
            <button
              onClick={handleLogin}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-8 rounded transition-colors"
            >
              ENTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}