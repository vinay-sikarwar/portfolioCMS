import React, { useState } from 'react';
import { X, Play, Pause, Check, ArrowRight, Code } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F241D] text-white rounded-3xl border border-[#234A3C] shadow-2xl overflow-hidden p-6 md:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-[#B8F256] text-[#0F241D] font-mono text-xs font-bold flex items-center justify-center">
            P
          </div>
          <span className="text-xs font-bold text-[#B8F256] tracking-wider uppercase">
            Interactive Product Demo
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          How portfolioCMS Works in 3 Steps
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mb-6">
          See how easy it is to manage portfolio content and sync it live with a single API call.
        </p>

        {/* Step Selector */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { num: 1, label: '1. Create Content' },
            { num: 2, label: '2. Query API' },
            { num: 3, label: '3. Live Render' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                step === s.num
                  ? 'bg-[#B8F256] text-[#0F241D] border-[#B8F256] shadow-sm'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Interactive Screen Display */}
        <div className="p-5 bg-[#091712] rounded-2xl border border-white/10 font-mono text-xs text-slate-200 min-h-[180px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-2">
              <div className="text-[#B8F256] text-xs font-sans font-bold">
                Step 1: Edit in Visual Studio
              </div>
              <div className="text-slate-400 text-[11px]">
                Create new case studies, edit bio, or upload project thumbnails. Everything is autosaved and validated against your schema.
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-emerald-400 mt-2">
                ✓ Post: "Designing with Next.js 15" ready to publish
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <div className="text-[#B8F256] text-xs font-sans font-bold">
                Step 2: Fetch via Single API Call
              </div>
              <div className="p-2.5 bg-black/40 rounded-lg text-[11px] text-slate-300">
                <span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> fetch(<span className="text-emerald-300">'/api/v1/your-api-slug/projects'</span>);
                <br />
                <span className="text-purple-400">const</span> {`{ data }`} = <span className="text-purple-400">await</span> res.json();
              </div>
              <div className="text-slate-400 text-[10px]">
                Response time: <strong>38ms</strong> (served directly from global edge caches).
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <div className="text-[#B8F256] text-xs font-sans font-bold">
                Step 3: Instantly Live on Your Custom Frontend
              </div>
              <div className="text-slate-400 text-[11px]">
                No rebuilds, no waiting for git commits. Your React, Vue, or Astro frontend updates immediately with clean typed data.
              </div>
              <div className="flex items-center gap-2 mt-2 p-2 bg-[#B8F256]/10 rounded-lg text-xs text-[#B8F256]">
                <Check className="w-4 h-4 text-[#B8F256]" />
                <span>Live sync verified on https://my-portfolio.dev</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => (s % 3) + 1)}
            className="text-xs font-semibold text-slate-300 hover:text-white"
          >
            Next Step →
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#B8F256] hover:bg-[#a5e43c] text-[#0F241D] text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Close Demo
          </button>
        </div>

      </div>
    </div>
  );
};
