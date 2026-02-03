import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { settingsApi } from '../services/api';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState({ siteName: 'NeuroVita' });
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Início' },
    { path: '/quem-somos', label: 'Quem Somos' },
    { path: '/faq', label: 'FAQ' },
    { path: '/comprar', label: 'Comprar' },
  ];

  const isActive = (path) => location.pathname === path;

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsApi.get();
        setSettings(data);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-md'
      } border-b border-slate-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteName} className="h-8 sm:h-10 object-contain" />
              ) : (
                <div 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg transition-shadow duration-300"
                  style={{ 
                    background: `linear-gradient(135deg, ${settings?.primaryColor || '#059669'}, ${settings?.secondaryColor || '#0d9488'})`,
                    boxShadow: `0 10px 15px -3px ${settings?.primaryColor || '#059669'}40`
                  }}
                >
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              )}
              <span className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                {settings?.siteName || 'NeuroVita'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA Button */}
            <div className="hidden md:block">
              <Link to="/comprar">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-300">
                  {settings?.hero?.ctaText || 'Experimente Grátis'}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              aria-label="Menu"
              data-testid="mobile-menu-btn"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-14 sm:top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3">
                <Link to="/comprar" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-base font-semibold">
                    {settings?.hero?.ctaText || 'Experimente Grátis'}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
