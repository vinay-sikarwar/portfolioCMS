import React from 'react';
import { Check, Laptop, Sparkles, ExternalLink, Code } from 'lucide-react';

export const ShowcaseLaptop: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
      
      {/* Section Title */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F241D] tracking-tight">
          Seamless Sync to Live Frontends
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-[#4E6258] leading-relaxed">
          Publish changes in the visual editor and watch them reflect instantaneously on your custom portfolio site.
        </p>
      </div>

      {/* Composition: Floating Editor Window + Modern Laptop + Floating Verified Check */}
      <div className="relative max-w-4xl mx-auto pt-6 pb-12 flex items-center justify-center">
        
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#E6F7D8]/50 via-transparent to-[#F1F9ED]/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Floating Green Verified Checkmark Pill / Badge */}
        <div className="absolute top-0 right-8 sm:right-24 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#B8F256] text-[#0F241D] flex items-center justify-center shadow-xl border-2 border-white animate-bounce duration-1000">
          <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
        </div>

        {/* Container with Tilted Layered UI */}
        <div className="relative w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left: Floating CMS Editor Pane */}
          <div className="md:col-span-5 bg-white rounded-2xl border border-[#DCE4D9] shadow-xl p-4 sm:p-5 text-xs z-10 md:transform md:-rotate-2 md:-translate-y-4 hover:rotate-0 transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-[#0F241D] text-[#B8F256] font-mono text-[9px] font-bold flex items-center justify-center">
                  P
                </div>
                <span className="font-bold text-[11px] text-slate-800">Blog Editor</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[#DCFCE7] text-emerald-800">
                Synced
              </span>
            </div>

            {/* Simulated CMS Form Fields */}
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                  Title & Slug
                </label>
                <div className="p-2 bg-[#F6F9F4] rounded-lg border border-slate-100 text-slate-800 font-medium text-[11px]">
                  Designing the Future of Modular Web
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                  Featured Case Studies
                </label>
                <div className="space-y-1.5 text-[10px] text-slate-600">
                  <div className="flex items-center justify-between p-1.5 bg-[#FAFBF9] rounded border border-slate-100">
                    <span>⚡ Next-Gen FinTech Mobile App</span>
                    <span className="text-[#0F241D] font-bold">Live</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-[#FAFBF9] rounded border border-slate-100">
                    <span>🌐 Global Brand Design System</span>
                    <span className="text-[#0F241D] font-bold">Live</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                  Output Format
                </label>
                <div className="p-2 bg-[#0F241D] text-[#B8F256] rounded-lg font-mono text-[10px] flex items-center justify-between">
                  <span>GET /v1/portfolio</span>
                  <span className="text-white/60">200 OK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Realistic Laptop Mockup (MacBook style) */}
          <div className="md:col-span-7 relative z-10 flex flex-col items-center">
            
            {/* Screen Lid / Bezel */}
            <div className="w-full max-w-lg bg-[#111827] p-2.5 sm:p-3 rounded-t-2xl shadow-2xl border border-slate-700/80">
              {/* Web Camera Dot */}
              <div className="w-1.5 h-1.5 bg-slate-600 rounded-full mx-auto mb-1.5"></div>
              
              {/* Internal Screen Content (The Rendered Portfolio Website) */}
              <div className="w-full aspect-16/10 bg-[#FAFBF9] rounded-lg overflow-hidden border border-slate-200 flex flex-col text-[10px]">
                {/* Browser Tab Bar */}
                <div className="h-5 bg-white border-b border-slate-200 px-3 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="text-[9px] bg-slate-100 px-3 py-0.5 rounded text-slate-500 font-mono">
                    my-portfolio.dev
                  </div>
                  <div className="w-3"></div>
                </div>

                {/* Portfolio Site Content */}
                <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-white to-[#F5F8F2]">
                  {/* Site Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 tracking-tight">Elena Vance</span>
                    <div className="flex gap-2 text-slate-500 text-[9px]">
                      <span>Work</span>
                      <span>About</span>
                      <span className="font-bold text-[#0F241D]">Contact</span>
                    </div>
                  </div>

                  {/* Site Hero */}
                  <div className="my-auto text-center py-2">
                    <div className="w-8 h-8 rounded-full bg-[#0F241D] text-[#B8F256] font-bold text-xs flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                      EV
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight">
                      Designing Digital Products with Impact
                    </h5>
                    <p className="text-[9px] text-slate-500 mt-1 max-w-xs mx-auto line-clamp-2">
                      Full-stack designer & engineer. Building high-growth tools backed by dynamic API endpoints.
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-[#0F241D] text-white text-[9px] font-bold rounded-full">
                      <span>Explore Case Studies</span>
                      <ExternalLink className="w-2.5 h-2.5 text-[#B8F256]" />
                    </div>
                  </div>

                  {/* Portfolio Cards Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="p-1.5 bg-white rounded border border-slate-200 shadow-2xs">
                      <span className="font-bold text-slate-800 block text-[9px]">FinTech Platform</span>
                      <span className="text-[8px] text-slate-400">React • TypeScript</span>
                    </div>
                    <div className="p-1.5 bg-white rounded border border-slate-200 shadow-2xs">
                      <span className="font-bold text-slate-800 block text-[9px]">Design Systems</span>
                      <span className="text-[8px] text-slate-400">Tailwind • Headless</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Laptop Base / Bottom Chasis */}
            <div className="w-[108%] max-w-[540px] h-3 bg-gradient-to-b from-[#94A3B8] to-[#64748B] rounded-b-xl shadow-2xl relative flex items-center justify-center">
              {/* Notch */}
              <div className="w-16 h-1 bg-[#475569] rounded-b-sm"></div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
