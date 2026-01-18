import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';
import { Link } from 'react-router-dom';

export default function ProfileSetup() {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [activeSection, setActiveSection] = useState('basic');

    const [profileData, setProfileData] = useState({
        name: '',
        bio: '',
        location: '',
        phone: '',

        skills: [],
        expertiseLevel: 'beginner', 
        languages: [],

        availability: {
            monday: { available: false, times: [] },
            tuesday: { available: false, times: [] },
            wednesday: { available: false, times: [] },
            thursday: { available: false, times: [] },
            friday: { available: false, times: [] },
            saturday: { available: false, times: [] },
            sunday: { available: false, times: [] }
        },
        timezone: 'IST',
        preferredSessionDuration: '60',

        pricing: {
            rate: '',
            currency: 'INR',
            rateType: 'hourly',
            freeInitialConsultation: false,
            packageDeals: []
        },

        teachingStyle: '',
        learningGoals: [],
        preferredCommunication: ['chat', 'video'], 

        socialLinks: {
            website: '',
            linkedin: '',
            github: '',
            twitter: '',
            portfolio: ''
        },

        verified: false,
        rating: 0,
        totalSessions: 0
    });

    useEffect(() => {
        if (currentUser) {
            loadProfileData();
        }
    }, [currentUser]);

    const loadProfileData = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setProfileData(prev => ({
                    ...prev,
                    ...userData,
                    name: userData.name || currentUser.username || '',
                    bio: userData.bio || '',
                    location: userData.location || '',
                    skills: userData.skills || [],
                    languages: userData.languages || [],
                    availability: userData.availability || prev.availability,
                    pricing: userData.pricing || prev.pricing,
                    socialLinks: userData.socialLinks || prev.socialLinks
                }));
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (section, field, value) => {
        if (section) {
            setProfileData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setProfileData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleArrayUpdate = (field, value, operation = 'add') => {
        if (operation === 'add' && value.trim()) {
            setProfileData(prev => ({
                ...prev,
                [field]: [...prev[field], value.trim()]
            }));
        } else if (operation === 'remove') {
            setProfileData(prev => ({
                ...prev,
                [field]: prev[field].filter(item => item !== value)
            }));
        }
    };

    const handleAvailabilityChange = (day, field, value) => {
        setProfileData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day],
                    [field]: value
                }
            }
        }));
    };

    const addTimeSlot = (day, timeSlot) => {
        setProfileData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day],
                    times: [...prev.availability[day].times, timeSlot]
                }
            }
        }));
    };

    const removeTimeSlot = (day, timeSlot) => {
        setProfileData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day],
                    times: prev.availability[day].times.filter(slot => slot !== timeSlot)
                }
            }
        }));
    };

    const addPackageDeal = (sessions, price) => {
        const newPackage = {
            id: Date.now(),
            sessions: parseInt(sessions),
            price: parseFloat(price),
            discount: Math.round(((profileData.pricing.rate * sessions) - price) / (profileData.pricing.rate * sessions) * 100)
        };

        setProfileData(prev => ({
            ...prev,
            pricing: {
                ...prev.pricing,
                packageDeals: [...prev.pricing.packageDeals, newPackage]
            }
        }));
    };

    const removePackageDeal = (packageId) => {
        setProfileData(prev => ({
            ...prev,
            pricing: {
                ...prev.pricing,
                packageDeals: prev.pricing.packageDeals.filter(pkg => pkg.id !== packageId)
            }
        }));
    };

    const saveProfile = async () => {
        if (!currentUser) return;

        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                ...profileData,
                lastUpdated: new Date().toISOString()
            });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex overflow-x-auto border-b border-gray-200">
                    {[
                        { id: 'basic', name: 'Basic Info' },
                        { id: 'skills', name: 'Skills & Expertise' },
                        { id: 'availability', name: 'Availability' },
                        { id: 'pricing', name: 'Pricing' },
                        { id: 'preferences', name: 'Preferences' },
                        { id: 'social', name: 'Social Links' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium whitespace-nowrap ${activeSection === tab.id
                                ? 'border-blue-400 text-blue-600 bg-blue-50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {activeSection === 'basic' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => handleInputChange(null, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => handleInputChange(null, 'phone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                    placeholder="+91 1234567890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={profileData.location}
                                    onChange={(e) => handleInputChange(null, 'location', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none disabled:"
                                    placeholder="+91 1234567890"
                                />
                            </div>



                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bio *
                                </label>
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) => handleInputChange(null, 'bio', e.target.value)}
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none"
                                    placeholder="Tell people about yourself, your experience, and what you can offer..."
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {profileData.bio.length}/500 characters
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'skills' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Skills *
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder="Add a skill (e.g., React.js, Guitar, Cooking)"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                        onKeyPress={(e) => e.key === 'Enter' && handleArrayUpdate('skills', newSkill, 'add').then(() => setNewSkill(''))}
                                    />
                                    <button
                                        onClick={() => {
                                            handleArrayUpdate('skills', newSkill, 'add');
                                            setNewSkill('');
                                        }}
                                        className="bg-blue-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profileData.skills.map((skill, index) => (
                                        <div
                                            key={index}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {skill}
                                            <button
                                                onClick={() => handleArrayUpdate('skills', skill, 'remove')}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expertise Level
                                </label>
                                <select
                                    value={profileData.expertiseLevel}
                                    onChange={(e) => handleInputChange(null, 'expertiseLevel', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Languages
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newLanguage}
                                        onChange={(e) => setNewLanguage(e.target.value)}
                                        placeholder="Add a language you speak"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                        onKeyPress={(e) => e.key === 'Enter' && handleArrayUpdate('languages', newLanguage, 'add').then(() => setNewLanguage(''))}
                                    />
                                    <button
                                        onClick={() => {
                                            handleArrayUpdate('languages', newLanguage, 'add');
                                            setNewLanguage('');
                                        }}
                                        className="bg-blue-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profileData.languages.map((language, index) => (
                                        <div
                                            key={index}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {language}
                                            <button
                                                onClick={() => handleArrayUpdate('languages', language, 'remove')}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'availability' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Availability & Timing</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Timezone
                                </label>
                                <select
                                    value={profileData.timezone}
                                    onChange={(e) => handleInputChange(null, 'timezone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                >
                                    <option value="IST">Indian Standard Time (IST)</option>
                                    <option value="PST">Pacific Standard Time (PST)</option>
                                    <option value="EST">Eastern Standard Time (EST)</option>
                                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Session Duration
                                </label>
                                <select
                                    value={profileData.preferredSessionDuration}
                                    onChange={(e) => handleInputChange(null, 'preferredSessionDuration', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                >
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="90">1.5 hours</option>
                                    <option value="120">2 hours</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Weekly Availability</h3>
                            {Object.entries(profileData.availability).map(([day, data]) => (
                                <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3 w-32">
                                        <input
                                            type="checkbox"
                                            checked={data.available}
                                            onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                                            className="w-4 h-4 text-blue-400 rounded focus:ring-blue-400"
                                        />
                                        <label className="font-medium capitalize">{day}</label>
                                    </div>

                                    {data.available && (
                                        <div className="flex-1">
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="time"
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                                    onBlur={(e) => e.target.value && addTimeSlot(day, e.target.value)}
                                                    placeholder="Add time slot"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {data.times.map((time, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                                    >
                                                        {time}
                                                        <button
                                                            onClick={() => removeTimeSlot(day, time)}
                                                            className="text-green-600 hover:text-green-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'pricing' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Pricing & Charges</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rate Type
                                </label>
                                <select
                                    value={profileData.pricing.rateType}
                                    onChange={(e) => handleInputChange('pricing', 'rateType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                >
                                    <option value="hourly">Per Hour</option>
                                    <option value="per_session">Per Session</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Currency
                                </label>
                                <select
                                    value={profileData.pricing.currency}
                                    onChange={(e) => handleInputChange('pricing', 'currency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                >
                                    <option value="INR">Indian Rupee (₹)</option>
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="EUR">Euro (€)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rate ({profileData.pricing.currency})
                                </label>
                                <input
                                    type="number"
                                    value={profileData.pricing.rate}
                                    onChange={(e) => handleInputChange('pricing', 'rate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={profileData.pricing.freeInitialConsultation}
                                    onChange={(e) => handleInputChange('pricing', 'freeInitialConsultation', e.target.checked)}
                                    className="w-4 h-4 text-blue-400 rounded focus:ring-blue-400"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    Offer free initial consultation
                                </label>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Deals</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <input
                                    type="number"
                                    placeholder="Number of sessions"
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                    id="packageSessions"
                                />
                                <input
                                    type="number"
                                    placeholder="Total price"
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                    id="packagePrice"
                                />
                                <button
                                    onClick={() => {
                                        const sessions = document.getElementById('packageSessions').value;
                                        const price = document.getElementById('packagePrice').value;
                                        if (sessions && price) {
                                            addPackageDeal(sessions, price);
                                            document.getElementById('packageSessions').value = '';
                                            document.getElementById('packagePrice').value = '';
                                        }
                                    }}
                                    className="bg-blue-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
                                >
                                    Add Package
                                </button>
                            </div>

                            <div className="space-y-3">
                                {profileData.pricing.packageDeals.map((pkg) => (
                                    <div key={pkg.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <span className="font-semibold">{pkg.sessions} sessions</span>
                                            <span className="text-gray-600 ml-2">for {profileData.pricing.currency} {pkg.price}</span>
                                            {pkg.discount > 0 && (
                                                <span className="text-green-600 text-sm ml-2">
                                                    ({pkg.discount}% discount)
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removePackageDeal(pkg.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'preferences' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teaching/Learning Style
                                </label>
                                <select
                                    value={profileData.teachingStyle}
                                    onChange={(e) => handleInputChange(null, 'teachingStyle', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                >
                                    <option value="">Select your preferred style</option>
                                    <option value="visual">Visual (Diagrams, Videos)</option>
                                    <option value="hands-on">Hands-on (Practical Exercises)</option>
                                    <option value="theoretical">Theoretical (Concepts & Theory)</option>
                                    <option value="interactive">Interactive (Q&A, Discussions)</option>
                                    <option value="structured">Structured (Step-by-step)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Communication Methods
                                </label>
                                <div className="space-y-2">
                                    {['chat', 'video', 'phone', 'in_person'].map((method) => (
                                        <div key={method} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={profileData.preferredCommunication.includes(method)}
                                                onChange={(e) => {
                                                    const updated = e.target.checked
                                                        ? [...profileData.preferredCommunication, method]
                                                        : profileData.preferredCommunication.filter(m => m !== method);
                                                    handleInputChange(null, 'preferredCommunication', updated);
                                                }}
                                                className="w-4 h-4 text-blue-400 rounded focus:ring-blue-400"
                                            />
                                            <label className="ml-2 text-sm font-medium text-gray-700 capitalize">
                                                {method.replace('_', ' ')}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'social' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Social Links & Portfolio</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(profileData.socialLinks).map(([platform, url]) => (
                                <div key={platform}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                        {platform}
                                    </label>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => handleInputChange('socialLinks', platform, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                        placeholder={`Your ${platform} URL`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-4 pt-8">
                    <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="bg-blue-400 text-black px-8 py-3 rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            'Save Profile'
                        )}
                    </button>
                    <Link 
                    to={`/profile/${profileData.uid}`}
                    className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        Preview Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}