import React from 'react';

interface LoginFormProps {
  username: string;
  setUsername: (username: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onRegister: () => void;
  onForgotPassword: () => void;
  onBack: () => void;
}

export default function LoginForm({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  onRegister,
  onForgotPassword,
  onBack,
}: LoginFormProps) {
  return (
    <div className="space-y-6">
      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 focus:outline-none bg-transparent text-gray-500"
          placeholder="johndoe"
        />
      </div>

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

      {/* Password */}
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

      {/* Links and Submit */}
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
          onClick={onBack}
          className="text-sm text-blue-500 hover:underline"
        >
          log in
        </button>
        <button
          onClick={onRegister}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-8 rounded transition-colors"
        >
          REGISTER
        </button>
      </div>
    </div>
  );
}
