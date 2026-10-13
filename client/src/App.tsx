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
import { DocsPage } from './components/DocsPage';
import { safeFetchJson } from './lib/api';

interface UserSession {
  name: string;
  email: string;
  apiSlug?: string;
}

type ViewType = 'landing' | 'auth' | 'dashboard' | 'docs';

function getViewFromPath(pathname: string): { view: ViewType; mode: 'login' | 'signup' } {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/login') return { view: 'auth', mode: 'login' };
  if (clean === '/signup') return { view: 'auth', mode: 'signup' };
  if (clean === '/dashboard') return { view: 'dashboard', mode: 'login' };
  if (clean === '/docs') return { view: 'docs', mode: 'login' };
  return { view: 'landing', mode: 'login' };
}

export default function App() {
  const initialRoute = typeof window !== 'undefined'
    ? getViewFromPath(window.location.pathname)
    : { view: 'landing' as ViewType, mode: 'login' as const };

  const [currentView, setCurrentView] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      const hasUser = !!(localStorage.getItem('portfoliohq_user') || localStorage.getItem('portfoliohq_token'));
      // If user directly opened /dashboard without session, send to login
      if (initialRoute.view === 'dashboard' && !hasUser) {
        return 'auth';
      }
      return initialRoute.view;
    }
    return 'landing';
  });

  const [authMode, setAuthMode] = useState<'login' | 'signup'>(() => initialRoute.mode);
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

  // Synchronize browser URL bar and localStorage whenever view or authMode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('portfoliohq_current_view', currentView);
      } catch {}

      let expectedPath = '/';
      if (currentView === 'dashboard') expectedPath = '/dashboard';
      else if (currentView === 'auth') expectedPath = authMode === 'signup' ? '/signup' : '/login';
      else if (currentView === 'docs') expectedPath = '/docs';

      if (window.location.pathname !== expectedPath) {
        window.history.pushState({ view: currentView, mode: authMode }, '', expectedPath);
      }
    }
  }, [currentView, authMode]);

  // Handle browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const route = getViewFromPath(window.location.pathname);
      const hasUser = !!(localStorage.getItem('portfoliohq_user') || localStorage.getItem('portfoliohq_token'));

      if (route.view === 'dashboard' && !hasUser) {
        setCurrentView('auth');
        setAuthMode('login');
      } else {
        setCurrentView(route.view);
        setAuthMode(route.mode);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  const navigateTo = (view: ViewType, options?: { mode?: 'login' | 'signup'; plan?: string }) => {
    if (options?.mode) setAuthMode(options.mode);
    if (options?.plan) setSelectedPlan(options.plan);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetStartedOrPlan = (plan: string = 'Pro') => {
    const hasSession = !!(currentUser || (typeof window !== 'undefined' && localStorage.getItem('portfoliohq_token')));
    if (hasSession) {
      navigateTo('dashboard');
    } else {
      navigateTo('auth', { mode: 'signup', plan });
    }
  };

  const handleAuthSuccess = (userData: UserSession) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('portfoliohq_user', JSON.stringify(userData));
    } catch {}
    navigateTo('dashboard');
    showToast(`Welcome back, ${userData.name}! Dashboard loaded.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('portfoliohq_user');
      localStorage.removeItem('portfoliohq_token');
    } catch {}
    navigateTo('landing');
    showToast('You have been signed out.');
  };

  // 1. DASHBOARD VIEW (Shown after login)
  if (currentView === 'dashboard') {
    if (!currentUser) {
      // If session lost or not logged in, prompt login
      return (
        <AuthPage
          initialMode="login"
          selectedPlan={selectedPlan}
          onBack={() => navigateTo('landing')}
          onModeChange={(m) => setAuthMode(m)}
          onSuccess={handleAuthSuccess}
        />
      );
    }
    return (
      <DashboardPage
        currentUser={currentUser}
        onLogout={handleLogout}
        onGoHome={() => navigateTo('landing')}
      />
    );
  }

  // 2. DOCS VIEW
  if (currentView === 'docs') {
    return (
      <DocsPage
        onBack={() => navigateTo('landing')}
        onGoToDashboard={() => navigateTo('dashboard')}
        currentUser={currentUser}
        onLogin={() => navigateTo('auth', { mode: 'login' })}
      />
    );
  }

  // 3. AUTH VIEW (Login / Sign Up page)
  if (currentView === 'auth') {
    return (
      <AuthPage
        initialMode={authMode}
        selectedPlan={selectedPlan}
        onBack={() => navigateTo('landing')}
        onModeChange={(m) => setAuthMode(m)}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  // 4. LANDING PAGE VIEW (Original landing page)
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
        onLogin={() => navigateTo('auth', { mode: 'login' })}
        onSignUp={() => navigateTo('auth', { mode: 'signup' })}
        onGoToDashboard={() => navigateTo('dashboard')}
        onOpenDocs={() => navigateTo('docs')}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 1. Hero Section with Interactive Dashboard Mockup */}
        <Hero
          onWatchDemo={() => setDemoOpen(true)}
          onGetStarted={() => handleGetStartedOrPlan('Pro')}
        />

        {/* 2. Feature Trio */}
        <FeatureTrio />

        {/* 3. Bento Grid */}
        <BentoGrid />

        {/* 4. Pricing Plans */}
        <PricingSection onSelectPlan={(plan) => handleGetStartedOrPlan(plan)} />

        {/* 5. Live Showcase: Floating Editor & Modern Laptop Mockup */}
        <ShowcaseLaptop />
      </main>

      {/* 6. Site Footer */}
      <Footer onOpenDocs={() => navigateTo('docs')} />

      {/* Interactive Demo Modal */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
