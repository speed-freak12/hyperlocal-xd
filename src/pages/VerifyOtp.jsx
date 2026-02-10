import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function VerifyOtp() {
  const [otpInput, setOtpInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const pending = localStorage.getItem('pending_signup');
    if (!pending) {
      navigate('/auth/signup');
      return;
    }
    setUserData(JSON.parse(pending));
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!userData) {
      setError('Session expired. Please sign up again.');
      setLoading(false);
      return;
    }

    if (otpInput !== userData.otp) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
      return;
    }

    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: userData.username
      });

      // Store in Firestore (with location)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        location: userData.location || "Unknown area",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Clear pending signup
      localStorage.removeItem('pending_signup');

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-linear-to-br from-white via-white to-gray-100 pt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Verify your email
              </h1>
              <p className="text-gray-600 mt-2">
                Enter the OTP sent to your email.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest focus:ring-2 focus:ring-blue-400"
                  placeholder="------"
                  maxLength="6"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-400 to-blue-500 text-black font-bold py-3 px-4 rounded-lg hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Didn’t receive the code? Go back and sign up again.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
