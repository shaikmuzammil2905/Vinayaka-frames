import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login action
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="container-custom py-16 flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 w-full max-w-md card-shadow">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-text-main mb-2">Welcome Back</h1>
          <p className="text-text-muted">Sign in to your Vinayak Frames account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 transition-all"
                placeholder="Enter your email"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main flex justify-between">
              <span>Password</span>
              <a href="#" className="text-primary hover:underline text-xs">Forgot password?</a>
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 transition-all"
                placeholder="Enter your password"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <LogIn className="h-5 w-5" />
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-muted">
          Don't have an account? <Link to="/contact" className="text-primary font-bold hover:underline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
};
