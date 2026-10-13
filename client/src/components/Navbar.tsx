import React, { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onLogin: () => void;
  onSignUp: () => void;
  onGoToDashboard?: () => void;
  onOpenDocs?: () => void;
  currentUser?: { name: string; email: string } | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLogin,
  onSignUp,
  onGoToDashboard,
  onOpenDocs,
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState('Features');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Docs', href: '#docs' },
    { name: 'Blog', href: '#blog' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full pt-4 pb-2 px-4 sm:px-6 lg:px-8 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Zone */}
        <BrandLogo href="#" size="md" />

        {/* Floating Center Nav Bar */}
        <nav className="hidden md:flex items-center bg-[#0F241D]/5 backdrop-blur-md border border-[#0F241D]/10 rounded-full p-1 shadow-sm">
          {navLinks.map((link) => {
            const isActive = activeTab === link.name;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(link.name);
                  if (link.name === 'Docs') {
                    onOpenDocs?.();
                    return;
                  }
                  const target = document.querySelector(link.href);
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0F241D] text-white shadow-sm'
                    : 'text-[#3D5248] hover:text-[#0F241D] hover:bg-black/5'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onGoToDashboard}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#0F241D] bg-[#B8F256] hover:bg-[#a5e63d] rounded-full shadow-2xs transition-all active:scale-95"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <div className="flex items-center gap-2 bg-white pl-2 pr-1.5 py-1 rounded-full border border-[#DCE4D9] shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-[#0F241D] text-[#B8F256] text-[10px] font-bold flex items-center justify-center">
                  {getInitials(currentUser.name)}
                </div>
                <span className="text-xs font-semibold text-[#0F241D] max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <button
                  onClick={onLogout}
                  title="Log out"
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-600 transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <button 
                onClick={onLogin}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#0F241D] hover:text-black transition-colors"
              >
                Login
              </button>
              <button
                onClick={onSignUp}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F241D] hover:bg-[#1a382e] active:scale-95 rounded-full transition-all shadow-sm border border-[#0F241D]"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#0F241D] hover:bg-black/5 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 bg-white/95 backdrop-blur-lg border border-[#E3EAE1] rounded-2xl shadow-xl max-w-sm mx-auto flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(link.name);
                setMobileMenuOpen(false);
                if (link.name === 'Docs') {
                  onOpenDocs?.();
                  return;
                }
                const target = document.querySelector(link.href);
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === link.name
                  ? 'bg-[#0F241D] text-white'
                  : 'text-[#3D5248] hover:bg-slate-100'
              }`}
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {currentUser ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGoToDashboard?.();
                  }}
                  className="w-full py-2 px-3 text-xs font-bold text-[#0F241D] bg-[#B8F256] rounded-xl flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Open Dashboard</span>
                </button>
                <div className="flex items-center justify-between py-2 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0F241D] text-[#B8F256] text-[10px] font-bold flex items-center justify-center">
                      {getInitials(currentUser.name)}
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{currentUser.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout?.();
                    }}
                    className="text-xs text-rose-600 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogin();
                  }}
                  className="w-full py-2 text-sm font-medium text-center text-[#0F241D] hover:bg-slate-100 rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignUp();
                  }}
                  className="w-full py-2 text-sm font-semibold text-center text-white bg-[#0F241D] hover:bg-[#1a382e] rounded-lg"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
