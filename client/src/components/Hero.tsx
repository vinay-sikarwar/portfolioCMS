import React from 'react';
import { Play, ChevronRight, Check } from 'lucide-react';
import { DashboardMockup } from './DashboardMockup';

interface HeroProps {
  onWatchDemo: () => void;
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onWatchDemo, onGetStarted }) => {
  return (
    <section className="relative pt-8 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Subtle Green Grid Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex justify-center">
        <div className="w-[1000px] h-[750px] bg-gradient-to-b from-[#E7F8DA]/60 via-[#F3F9EE]/30 to-transparent rounded-full blur-3xl opacity-70 transform -translate-y-24"></div>
        <div className="absolute inset-0 bg-grid-green opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_25%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center flex flex-col items-center">
        
        {/* Faster Deployments Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8D9] border border-[#CEEEA5] text-[#22543D] text-xs font-semibold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="w-4 h-4 rounded-full bg-[#B8F256] flex items-center justify-center text-[#0F241D] text-[10px] font-bold">
            ✓
          </div>
          <span>Faster Faster Deployments</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0F241D] tracking-tight leading-[1.08] max-w-4xl text-balance">
          Empowering You to Manage <br className="hidden sm:inline" />
          Your Own Portfolio Data
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-[#4A5D54] max-w-xl mx-auto leading-relaxed">
          The easy way to manage content and add dynamic data to your frontend with a single API call.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onWatchDemo}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#0F241D] text-xs sm:text-sm font-semibold border border-[#D5DFD2] shadow-xs hover:shadow-sm active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-[#0F241D] text-[#0F241D]" />
            <span>Watch Demo</span>
          </button>
          
          <button
            onClick={onGetStarted}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#0F241D] hover:bg-[#1a382e] text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all group border border-[#0F241D]"
          >
            <span>Get Started</span>
            <ChevronRight className="w-4 h-4 text-[#B8F256] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Interactive Dashboard Mockup */}
        <DashboardMockup />

      </div>
    </section>
  );
};
