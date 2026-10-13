import React from 'react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onOpenDocs?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDocs }) => {
  return (
    <footer className="mt-20 border-t border-[#E3EAE0] bg-white pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="col-span-2">
            <div className="mb-3">
              <BrandLogo size="md" />
            </div>
            <p className="text-xs text-[#52665B] max-w-sm leading-relaxed mb-4">
              Empowering developers and designers to manage their portfolio data effortlessly with a single API call.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EFF8E8] text-[#1D4A27] text-xs font-semibold border border-[#D5ECC8]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="#features" className="hover:text-[#0F241D] transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[#0F241D] transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-[#0F241D] transition-colors">Pricing</a></li>
              <li><button onClick={onOpenDocs} className="hover:text-[#0F241D] transition-colors text-left">API Reference</button></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><button onClick={onOpenDocs} className="hover:text-[#0F241D] transition-colors text-left">Documentation</button></li>
              <li><a href="#blog" className="hover:text-[#0F241D] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#0F241D] transition-colors">Templates</a></li>
              <li><a href="#" className="hover:text-[#0F241D] transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="#" className="hover:text-[#0F241D] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[#0F241D] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#0F241D] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#0F241D] transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} portfolioCMS Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">GitHub</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Twitter / X</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
