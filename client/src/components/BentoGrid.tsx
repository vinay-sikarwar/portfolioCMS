import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Users,
  Zap,
  Key
} from 'lucide-react';

export const BentoGrid: React.FC = () => {
  const [activeTimeframe, setActiveTimeframe] = useState<'1M' | '1Y' | '3Y' | 'All'>('1Y');

  // Chart bar heights depending on timeframe
  const chartBars = {
    '1M': [35, 45, 60, 50, 75, 95],
    '1Y': [40, 55, 65, 50, 80, 100],
    '3Y': [30, 48, 70, 65, 85, 92],
    'All': [25, 40, 55, 70, 85, 100],
  };

  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Card 1: Developer Ecosystem & Speed (Pale Lime Card) */}
        <div className="md:col-span-4 p-6 sm:p-7 bg-[#EFF8E8] rounded-2xl md:rounded-3xl border border-[#DCEBD2] relative overflow-hidden flex flex-col justify-between group">
          <div>
            <span className="text-xs font-semibold text-[#3F6B43] tracking-wide uppercase block mb-1.5">
              Developer Ecosystem
            </span>
            <h3 className="text-xl font-bold text-[#0F241D] leading-snug tracking-tight max-w-[220px]">
              Empowering Modern Portfolios with Instant APIs.
            </h3>

            {/* Avatars Stack */}
            <div className="mt-5 flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  AJ
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  ML
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  RK
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#0F241D] text-[#B8F256] text-[11px] font-bold flex items-center justify-center shadow-xs">
                  +8
                </div>
              </div>
            </div>

            <p className="mt-2 text-xs font-semibold text-slate-500">
              Active Creators Publishing
            </p>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[#0F241D] tabular-nums tracking-tight">
                  100%
                </span>
                <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-[#D4F5A6] px-2 py-0.5 rounded-full">
                  +90% Speed
                </span>
              </div>
            </div>

            {/* 3D Iridescent Holographic Crystal Vector */}
            <div className="w-20 h-20 relative flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <defs>
                  <linearGradient id="crystal1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="50%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                  <linearGradient id="crystal2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="50%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#B8F256" />
                  </linearGradient>
                  <linearGradient id="crystal3" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#E879F9" />
                  </linearGradient>
                </defs>
                <polygon points="50,5 88,28 75,78 25,78 12,28" fill="url(#crystal1)" opacity="0.9" />
                <polygon points="50,5 88,28 50,55" fill="url(#crystal2)" opacity="0.85" />
                <polygon points="12,28 50,5 50,55" fill="#4F46E5" opacity="0.75" />
                <polygon points="12,28 50,55 25,78" fill="url(#crystal3)" opacity="0.95" />
                <polygon points="88,28 50,55 75,78" fill="url(#crystal1)" opacity="0.9" />
                <polygon points="25,78 50,55 75,78 50,95" fill="url(#crystal2)" opacity="0.8" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: API Traffic & Throughput (Center Bar Chart Card) */}
        <div className="md:col-span-5 p-6 sm:p-7 bg-white rounded-2xl md:rounded-3xl border border-[#E2E8DE] flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Edge API Throughput</span>
              {/* Timeframe pill tabs */}
              <div className="flex items-center gap-1 bg-[#F3F6F1] p-1 rounded-lg">
                {(['1M', '1Y', '3Y', 'All'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all ${
                      activeTimeframe === tf
                        ? 'bg-white text-[#0F241D] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0F241D] tabular-nums tracking-tight">
                1.4M
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Global edge requests served</span>
          </div>

          {/* Vertical Bar Chart matching screenshot */}
          <div className="mt-8 flex items-end justify-between gap-2.5 h-32 pt-4 px-2 border-b border-slate-100">
            {chartBars[activeTimeframe].map((val, idx) => {
              const isHighlight = idx === 5; // The last bar has diagonal green stripes
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    style={{ height: `${val}%` }}
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 ${
                      isHighlight
                        ? 'bar-stripe-lime ring-2 ring-[#B8F256]/30'
                        : 'bg-[#EAEFE8] hover:bg-slate-300'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 font-medium">
                    {['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Oct'][idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Global Edge Latency & API Keys (Dark Spruce Card) */}
        <div className="md:col-span-3 p-6 sm:p-7 bg-[#0F241D] text-white rounded-2xl md:rounded-3xl border border-[#1A382E] flex flex-col justify-between relative overflow-hidden group shadow-md">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B8F256]/10 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <span className="text-4xl font-extrabold text-white tabular-nums tracking-tight block">
              &lt;35ms
            </span>
            <span className="text-xs text-slate-300 font-medium mt-1 block">
              Global Edge Latency
            </span>
          </div>

          {/* Mini Developer Access Card with Token */}
          <div className="my-6 p-4 rounded-xl bg-gradient-to-tr from-[#16352B] to-[#0A1A14] border border-[#234A3C] shadow-lg flex flex-col justify-between h-24 relative overflow-hidden group-hover:border-[#B8F256]/40 transition-colors">
            <div className="flex items-center justify-between">
              {/* Key Icon / Auth Badge */}
              <div className="w-6 h-4.5 rounded bg-gradient-to-r from-amber-200 to-amber-400 border border-amber-500/50 flex items-center justify-center shadow-xs">
                <Key className="w-3 h-3 text-amber-900" />
              </div>
              <span className="text-[10px] font-mono text-[#B8F256] font-bold">BEARER TOKEN</span>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>phq_live_•••• 4092</span>
              <span>v1 / edge</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>API Key Security</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B8F256]" />
          </div>
        </div>

        {/* Card 4: Real Personalized Financial Growth (Dark Card with Graph/Icons) */}
        <div className="md:col-span-4 p-6 bg-[#0F241D] text-white rounded-2xl md:rounded-3xl border border-[#1A382E] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#1B3F33] flex items-center justify-center text-[#B8F256] border border-[#2B5E4D]">
              <Layers className="w-5 h-5" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs font-mono">
              API
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white tracking-tight mb-1">
              Instant Multi-Framework Delivery
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Query structured JSON across React, Next.js, and Astro with zero server rebuilds and instant cache revalidation.
            </p>
          </div>
        </div>

        {/* Card 5: $100M Secured Assets / Volume */}
        <div className="md:col-span-3 p-6 bg-white rounded-2xl md:rounded-3xl border border-[#E2E8DE] flex flex-col justify-between shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFF8E8] flex items-center justify-center text-[#0F241D] mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#0F241D] tabular-nums tracking-tight">
                0ms
              </span>
            </div>
            <span className="text-xs text-slate-500 font-semibold block mt-1">
              Cold-Start Overhead
            </span>
          </div>
        </div>

        {/* Card 6: Never Hardcode Portfolio Data (Light Card with CTA) */}
        <div className="md:col-span-5 p-6 bg-white rounded-2xl md:rounded-3xl border border-[#E2E8DE] flex flex-col justify-between shadow-xs">
          <div>
            <h4 className="text-lg font-bold text-[#0F241D] tracking-tight mb-2">
              Never Hardcode Your Portfolio Data Again
            </h4>
            <p className="text-xs text-[#4E6258] leading-relaxed">
              Update projects, skills, and articles through a sleek dashboard. Edits reflect on your live website in real time.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <a href="#features" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F241D] hover:text-emerald-800 transition-colors">
              <span>Explore Architecture</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0F241D]" />
            </a>
          </div>
        </div>

      </div>

      {/* 4 Bottom Stats Row Bar */}
      <div className="mt-8 p-6 sm:p-7 bg-[#F4F7F2] rounded-2xl md:rounded-3xl border border-[#E0E7DC] grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-1 text-2xl sm:text-3xl font-extrabold text-[#0F241D] tabular-nums">
            <span className="text-emerald-700 font-bold">⚡</span>
            <span>&lt;35ms</span>
          </div>
          <span className="text-xs font-semibold text-[#4E6258] block">
            Global Edge Latency
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-1 text-2xl sm:text-3xl font-extrabold text-[#0F241D] tabular-nums">
            <span className="text-emerald-700 font-bold">🚀</span>
            <span>0s</span>
          </div>
          <span className="text-xs font-semibold text-[#4E6258] block">
            Build Time on Edits
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-1 text-2xl sm:text-3xl font-extrabold text-[#0F241D] tabular-nums">
            <span className="text-emerald-700 font-bold">🌐</span>
            <span>100%</span>
          </div>
          <span className="text-xs font-semibold text-[#4E6258] block">
            Framework Agnostic
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-1 text-2xl sm:text-3xl font-extrabold text-[#0F241D] tabular-nums">
            <span className="text-emerald-700 font-bold">🛡️</span>
            <span>99.9%</span>
          </div>
          <span className="text-xs font-semibold text-[#4E6258] block">
            Edge Cache Hit Ratio
          </span>
        </div>
      </div>

    </section>
  );
};
