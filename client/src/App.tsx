/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeatureTrio } from './components/FeatureTrio';
import { BentoGrid } from './components/BentoGrid';
import { PricingSection } from './components/PricingSection';
import { ShowcaseLaptop } from './components/ShowcaseLaptop';
import { Footer } from './components/Footer';
import { DemoModal } from './components/DemoModal';
import { AuthPage } from './components/AuthPage';
import { DashboardPage } from './components/DashboardPage';
import { safeFetchJson } from './lib/api';

interface UserSession {
  name: string;
  email: string;
  apiSlug?: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'dashboard'>(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('portfoliohq_current_view') as 'landing' | 'auth' | 'dashboard' | null;
      const hasUser = !!(localStorage.getItem('portfoliohq_user') || localStorage.getItem('portfoliohq_token'));
      if (savedView === 'dashboard') {
        return hasUser ? 'dashboard' : 'landing';
      }
      if (savedView === 'auth') return 'auth';
      if (hasUser) return 'dashboard';
    }
    return 'landing';
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedPlan, setSelectedPlan] = useState('Pro');
  const [demoOpen, setDemoOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('portfoliohq_user');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync current view to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('portfoliohq_current_view', currentView);
    } catch {}
  }, [currentView]);

  // Restore user from localStorage and verify with Prisma backend if exists
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = localStorage.getItem('portfoliohq_token');
        if (token) {
          const { ok, data } = await safeFetchJson('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (ok && data?.user) {
            setCurrentUser(data.user);
            localStorage.setItem('portfoliohq_user', JSON.stringify(data.user));
            return;
          }
        }
        const stored = localStorage.getItem('portfoliohq_user');
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch {
        // Fallback to local stored session if offline
        const stored = localStorage.getItem('portfoliohq_user');
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      }
    }
    restoreSession();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenAuth = (mode: 'login' | 'signup', plan: string = 'Pro') => {
    setAuthMode(mode);
    setSelectedPlan(plan);
    setCurrentView('auth');
    try {
      localStorage.setItem('portfoliohq_current_view', 'auth');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (userData: UserSession) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('portfoliohq_user', JSON.stringify(userData));
      localStorage.setItem('portfoliohq_current_view', 'dashboard');
    } catch {
      // Ignore
    }
    // Immediately display the dashboard page requested by the user
    setCurrentView('dashboard');
    showToast(`Welcome back, ${userData.name}! Dashboard loaded.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('portfoliohq_user');
      localStorage.removeItem('portfoliohq_token');
      localStorage.setItem('portfoliohq_current_view', 'landing');
    } catch {
      // Ignore
    }
    setCurrentView('landing');
    showToast('You have been signed out.');
  };

  // 1. DASHBOARD VIEW (Shown after login, exactly matching user screenshot)
  if (currentView === 'dashboard' && currentUser) {
    return (
      <DashboardPage
        currentUser={currentUser}
        onLogout={handleLogout}
        onGoHome={() => setCurrentView('landing')}
      />
    );
  }

  // 2. AUTH VIEW (Login / Sign Up page)
  if (currentView === 'auth') {
    return (
      <AuthPage
        initialMode={authMode}
        selectedPlan={selectedPlan}
        onBack={() => setCurrentView('landing')}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  // 3. LANDING PAGE VIEW (Original pixel-perfect landing page)
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF6] text-[#0F241D] selection:bg-[#B8F256] selection:text-[#0F241D]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-[#0F241D] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-[#B8F256]/30 animate-in fade-in slide-in-from-top-3">
          <div className="w-5 h-5 rounded-full bg-[#B8F256] text-[#0F241D] flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sticky / Floating Top Bar */}
      <Navbar
        onLogin={() => handleOpenAuth('login')}
        onSignUp={() => handleOpenAuth('signup')}
        onGoToDashboard={() => setCurrentView('dashboard')}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 1. Hero Section with Interactive Dashboard Mockup */}
        <Hero
          onWatchDemo={() => setDemoOpen(true)}
          onGetStarted={() => handleOpenAuth('signup', 'Pro')}
        />

        {/* 2. Feature Trio: Turn Static Frontend into Dynamic Portfolio */}
        <FeatureTrio />

        {/* 3. Bento Grid: Analytics, Iridescent Element, Sales Chart, and Key Metric Strip */}
        <BentoGrid />

        {/* 4. Pricing Plans: Starter, Pro (Featured), Enterprise */}
        <PricingSection onSelectPlan={(plan) => handleOpenAuth('signup', plan)} />

        {/* 5. Live Showcase: Floating Editor & Modern Laptop Mockup */}
        <ShowcaseLaptop />
      </main>

      {/* 6. Site Footer */}
      <Footer />

      {/* Interactive Demo Modal */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
