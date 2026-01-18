import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { scrollToSection } from './navigation';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 🔑 Handle hash scroll AFTER route change
    useEffect(() => {
        if (location.pathname === '/' && location.hash) {
            const id = location.hash.replace('#', '');
            setTimeout(() => scrollToSection(id), 100);
        }
    }, [location]);

    const handleNavClick = (sectionId) => {
        setIsMobileMenuOpen(false);

        if (location.pathname === '/') {
            scrollToSection(sectionId);
        } else {
            navigate(`/#${sectionId}`);
        }
    };

    const navItems = [
        { label: 'How it works?', id: 'how' },
        { label: 'Community', id: 'community' },
        { label: 'Pricing', id: 'pricing' }
    ];

    return (
        <>
            <header className={`fixed w-full z-50 transition-all duration-300 text-black ${isScrolled ? 'bg-white/90 backdrop-blur-sm py-2' : 'bg-transparent py-6'}`}>
                <nav className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-extrabold">
                        Hyperlocal
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className="text-black/80 hover:text-black transition-colors font-medium"
                            >
                                {item.label}
                            </button>
                        ))}

                        {loading ? (
                            <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
                        ) : user ? (
                            <Link to="/dashboard" className="font-medium">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/auth/login" className="font-medium">
                                    Login
                                </Link>
                                <Link
                                    to="/auth/signup"
                                    className="bg-linear-to-r from-blue-400 to-blue-500 px-6 py-2 rounded-full font-medium"
                                >
                                    Signup
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t">
                        <div className="px-6 py-4 space-y-4">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className="block w-full text-left font-medium"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
}
