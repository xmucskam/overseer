import React from 'react';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onLogin: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
}

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
  onForgotPassword,
  onRegister,
}: LoginFormProps) {
  return (
    <div className="space-y-6">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 focus:outline-none bg-transparent text-gray-500"
          placeholder="johndoe@gmail.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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
          onClick={onForgotPassword}
          className="text-sm text-blue-500 hover:underline"
        >
          forgot password?
        </button>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onRegister}
          className="text-sm text-blue-500 hover:underline"
        >
          register
        </button>
        <button
          onClick={onLogin}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-8 rounded transition-colors"
        >
          ENTER
        </button>
      </div>
    </div>
  );
}
