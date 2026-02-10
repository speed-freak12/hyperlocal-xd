import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { sendOtpEmail } from '../utils/emailService';
import { getUserArea } from "../utils/locationService";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'learner'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.role
    ) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Get user area
      let userArea = "Unknown area";
      try {
        userArea = await getUserArea();
      } catch (err) {
        console.warn("Location not granted:", err);
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Send OTP email
      await sendOtpEmail(formData.email, otp);

      // Store signup data temporarily
      localStorage.setItem(
        'pending_signup',
        JSON.stringify({
          ...formData,
          location: userArea, // store location
          otp
        })
      );

      // Redirect to OTP verification page
      navigate('/verify-otp');

    } catch (err) {
      console.error('OTP send error:', err);
      setError('Failed to send verification email. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-linear-to-br from-white via-white to-gray-100 pt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto bg-white p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Create your account
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 text-center ${
                      formData.role === 'learner'
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="learner"
                      checked={formData.role === 'learner'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Learner
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      I want to learn
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 text-center ${
                      formData.role === 'teacher'
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={formData.role === 'teacher'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Teacher
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      I want to teach
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-400 to-blue-500 text-black font-bold py-3 px-4 rounded-lg hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Sign Up'}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/auth/login"
                  className="text-blue-500 font-semibold hover:text-blue-600"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
