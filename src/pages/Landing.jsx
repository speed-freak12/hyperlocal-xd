import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Search, Users, Target, Star, Zap, MapPin } from "lucide-react";
import { FileEdit, MessageCircle, Image, CalendarCheck } from "lucide-react";
import SearchComponent from '../components/SearchComponent';
import { handleLandingPageLoad, scrollToSection } from '../components/navigation';
import { useAuth } from '../hooks/useAuth';


const Landing = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [popularSkills, setPopularSkills] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();


    const defaultPopularSkills = [
        'Guitar', 'Cooking', 'Yoga', 'Programming', 'Photography',
        'Dance', 'Language', 'Fitness', 'Art', 'Music'
    ];

    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (!hash) return;

        setTimeout(() => {
            scrollToSection(hash);
        }, 300);
    }, []);

    useEffect(() => {
        setPopularSkills(defaultPopularSkills);
        handleLandingPageLoad();
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            handleLandingPageLoad();
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleQuickSearch = (skill) => {
        navigate(`/search?q=${encodeURIComponent(skill)}`);
    };

    return (
        <>
            <Header />
            <div className="min-h-screen text-black bg-white">
                <section className="relative py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-400/5 via-black to-black"></div>
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl"></div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="max-w-6xl mx-auto text-center">
                            <div className="min-h-[200px] flex items-center justify-center mb-8">
                                <div>
                                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                        <span className="block text-gray-900">
                                            Talent Nearby
                                        </span>
                                        <span className="block bg-linear-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                                            Right Beside You.
                                        </span>
                                    </h1>

                                    <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-gray-600">
                                        Discover local experts, learn new skills, and connect with your neighborhood's talent.
                                    </p>
                                </div>
                            </div>

                            <SearchComponent
                                variant="hero"
                                placeholder="Search for skills like 'guitar lessons', 'yoga classes', 'coding tutor'..."
                                className="mx-auto mb-12"
                            />

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                                <button
                                    onClick={() => navigate('/auth/signup')}
                                    className="bg-linear-to-r from-blue-400 to-blue-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
                                >
                                    Get Started
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => navigate('/auth/signup?role=teacher')}
                                    className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all backdrop-blur-sm flex items-center gap-2 cursor-pointer"
                                >
                                    Become a Teacher
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-gray-200">
                                {[
                                    { number: '50+', label: 'Skills' },
                                    { number: '1k+', label: 'Neighborhoods' },
                                    { number: '10k+', label: 'Members' }
                                ].map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                                        <div className="text-gray-600 text-sm">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20" id='how'>
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                How Hyperlocal Works
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                From discovery to mastery - your journey to learning and teaching starts here
                            </p>
                        </div>

                        <div className="max-w-6xl mx-auto">
                            <div className="relative">
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-blue-400 to-blue-500 transform -translate-y-1/2 hidden lg:block"></div>

                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-4">
                                    {[
                                        {
                                            step: "01",
                                            icon: Search,
                                            title: "Discover",
                                            description: "Browse skills available in your neighborhood",
                                            features: ["Local search", "Skill categories", "Distance filter"]
                                        },
                                        {
                                            step: "02",
                                            icon: Users,
                                            title: "Connect",
                                            description: "Find the perfect teacher or student match",
                                            features: ["Profile matching", "Direct messaging", "Schedule sessions"]
                                        },
                                        {
                                            step: "03",
                                            icon: Target,
                                            title: "Learn & Teach",
                                            description: "Engage in skill-sharing sessions with others",
                                            features: ["Flexible timing", "Progress tracking", "Community support"]
                                        },
                                        {
                                            step: "04",
                                            icon: Star,
                                            title: "Grow Together",
                                            description: "Build lasting community connections",
                                            features: ["Skill badges", "Community events", "Ongoing learning"]
                                        }
                                    ].map((step, index) => (
                                        <div key={index} className="relative">
                                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-black text-sm font-bold z-10">
                                                {step.step}
                                            </div>

                                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group hover:border-blue-300">
                                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                                    <step.icon className="w-7 h-7" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {step.title}
                                                </h3>
                                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                                    {step.description}
                                                </p>
                                                <ul className="space-y-2">
                                                    {step.features.map((feature, featureIndex) => (
                                                        <li key={featureIndex} className="flex items-center text-sm text-gray-500">
                                                            <svg className="w-4 h-4 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20" id='community'>
                    <div className="container mx-auto px-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                        Your Neighborhood's<br />
                                        <span className="bg-linear-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                                            Social Learning Hub
                                        </span>
                                    </h2>
                                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                        Share your learning journey, connect with local experts, and build meaningful relationships through our community feed.
                                    </p>

                                    <div className="space-y-6">
                                        {[
                                            {
                                                icon: FileEdit,
                                                title: "Share Your Progress",
                                                description: "Post updates, ask questions, and showcase your skill development journey"
                                            },
                                            {
                                                icon: MessageCircle,
                                                title: "Real-time Discussions",
                                                description: "Engage in meaningful conversations with learners and teachers in your area"
                                            },
                                            {
                                                icon: Image,
                                                title: "Media Sharing",
                                                description: "Share photos, videos, and documents to enhance learning experiences"
                                            },
                                            {
                                                icon: CalendarCheck,
                                                title: "Event Creation",
                                                description: "Organize local workshops, meetups, and learning sessions"
                                            }
                                        ].map((feature, index) => (
                                            <div key={index} className="flex items-start gap-4">
                                                <div className="text-2xl mt-1">
                                                    <feature.icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                                                    <p className="text-gray-600">{feature.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 transform transition-transform duration-300">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-linear-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                DP
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Darshan Pandey</h4>
                                                <p className="text-sm text-gray-500">Teaching Guitar • 0.5km away</p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-gray-700 mb-3">
                                                Just finished an amazing guitar session with SJR! 🎸 She's making great progress with chord transitions.
                                                So proud of our local talent!
                                            </p>
                                            <div className="flex gap-2 mb-3">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">#GuitarLessons</span>
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">#LocalTalent</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
                                            <div className="flex items-center gap-4">
                                                <button className="flex items-center gap-1 hover:text-blue-500">
                                                    ❤️ 12 likes
                                                </button>
                                                <button className="flex items-center gap-1 hover:text-blue-500">
                                                    💬 3 comments
                                                </button>
                                            </div>
                                            <span>2 hours ago</span>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 transform transition-transform duration-300 mt-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-linear-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                SJR
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Samarth Jung Rana</h4>
                                                <p className="text-sm text-gray-500">Learning Guitar</p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-gray-700 mb-3">
                                                Looking for guitar classes in the area! Any recommendations? 👩‍🍳
                                            </p>
                                            <div className="flex gap-2 mb-3">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">#GuitarLessons</span>
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">#LocalTalent</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
                                            <div className="flex items-center gap-4">
                                                <button className="flex items-center gap-1 hover:text-blue-500">
                                                    ❤️ 12 likes
                                                </button>
                                                <button className="flex items-center gap-1 hover:text-blue-500">
                                                    💬 3 comments
                                                </button>
                                            </div>
                                            <span>2 hours ago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20" id='pricing'>
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Transparent Pricing
                            </h2>
                            <p className="text-4xl font-bold md:text-5xl text-gray-600 max-w-2xl mx-auto">
                                <span className='bg-linear-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent'>
                                    that works best for you
                                </span>
                            </p>
                        </div>

                        <div className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    {
                                        name: "Learner",
                                        description: "For anyone looking to discover and learn new skills nearby",
                                        price: "Free",
                                        period: "forever",
                                        popular: false,
                                        features: [
                                            "Browse local skill listings",
                                            "Use basic search filters",
                                            "Message up to 3 people per month",
                                            "Join open community events",
                                            "Bookmark favorite mentors"
                                        ],
                                        cta: "Start Exploring",
                                        color: "gray"
                                    },
                                    {
                                        name: "Sharer",
                                        description: "For skilled individuals who want to share and connect locally",
                                        price: "₹199",
                                        period: "per month",
                                        popular: true,
                                        features: [
                                            "Unlimited learner connections",
                                            "Enhanced profile visibility",
                                            "Schedule and manage sessions",
                                            "Accept requests directly",
                                            "Access to verified learner profiles",
                                            "Priority listing in local results"
                                        ],
                                        cta: "Start Sharing",
                                        color: "blue"
                                    },
                                    {
                                        name: "Community Plus",
                                        description: "For local organizers or groups who want to host and grow skill communities",
                                        price: "₹499",
                                        period: "per month",
                                        popular: false,
                                        features: [
                                            "Everything in Sharer plan",
                                            "Host group sessions or meetups",
                                            "Manage multiple listings",
                                            "Access insights and analytics",
                                            "Custom event pages",
                                            "Community growth dashboard"
                                        ],
                                        cta: "Upgrade Now",
                                        color: "black"
                                    }
                                ].map((plan, index) => (
                                    <div key={index} className={`relative rounded-2xl border-2 transition-all duration-300 ${plan.popular
                                        ? 'border-blue-400 bg-white shadow-xl'
                                        : 'border-gray-200 bg-white shadow-sm'
                                        }`}>
                                        {plan.popular && (
                                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                                                Most Popular
                                            </div>
                                        )}

                                        <div className="p-8">
                                            <div className="text-center mb-6">
                                                <h3 className={`text-2xl font-bold ${plan.color === 'blue' ? 'text-blue-600' :
                                                    plan.color === 'black' ? 'text-gray-900' : 'text-gray-700'
                                                    }`}>
                                                    {plan.name}
                                                </h3>
                                                <p className="text-gray-600 mt-2 text-sm">
                                                    {plan.description}
                                                </p>
                                            </div>

                                            <div className="text-center mb-6">
                                                <div className="flex items-baseline justify-center gap-1">
                                                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                                    {plan.period !== "forever" && (
                                                        <span className="text-gray-600">/{plan.period}</span>
                                                    )}
                                                </div>
                                                {plan.period === "forever" && (
                                                    <span className="text-gray-600 text-sm">No credit card required</span>
                                                )}
                                            </div>

                                            <ul className="space-y-4 mb-8">
                                                {plan.features.map((feature, featureIndex) => (
                                                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                                                        <svg className="w-5 h-5 text-green-500 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>

                                            <button
  onClick={() => {
    if (plan.name === "Community Plus") {
      navigate('/coming-soon');
    } else {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/auth/login');
      }
    }
  }}
  className={`w-full py-3 px-6 rounded-lg cursor-pointer font-bold transition-all ${plan.popular
    ? 'bg-linear-to-r from-blue-400 to-blue-500 text-black hover:shadow-lg'
    : plan.color === 'black'
      ? 'bg-gray-900 text-white hover:bg-gray-800'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`}
>
  {plan.cta}
</button>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="my-20">
                    <div className="bg-linear-to-r from-blue-400/10 to-blue-500/10 rounded-2xl p-18 border border-blue-400/20 max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-6xl font-bold text-center">
                            Start Connecting, Start Learning<br />
                            <span className="bg-linear-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                                All Within Your Neighborhood.
                            </span>
                        </h2>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default Landing;