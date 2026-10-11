import React from 'react';
import { Edit3, Sliders, Code2, Cable, RefreshCw, Repeat, Check } from 'lucide-react';

export const FeatureTrio: React.FC = () => {
  const features = [
    {
      icons: (
        <div className="flex items-center gap-1.5 p-2 bg-[#F2F6F0] rounded-xl text-[#0F241D]">
          <Edit3 className="w-4 h-4" />
          <Sliders className="w-4 h-4 text-slate-500" />
        </div>
      ),
      title: 'Effortless Content Management',
      description:
        'An intuitive interface to add and edit blog posts, projects, and bio details without writing code.',
    },
    {
      icons: (
        <div className="flex items-center gap-1.5 p-2 bg-[#F2F6F0] rounded-xl text-[#0F241D]">
          <Code2 className="w-4 h-4" />
          <Cable className="w-4 h-4 text-slate-500" />
        </div>
      ),
      title: 'Instant API Integration',
      description:
        'Connect your frontend in minutes with our simple API endpoint. Get structured JSON data instantly.',
    },
    {
      icons: (
        <div className="flex items-center gap-1.5 p-2 bg-[#F2F6F0] rounded-xl text-[#0F241D]">
          <RefreshCw className="w-4 h-4" />
          <Repeat className="w-4 h-4 text-slate-500" />
        </div>
      ),
      title: 'Automatic Content Updates',
      description:
        'Make changes in portfolioCMS and see them live on your site immediately. Perfect for dynamic portfolios.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Section Headline */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#0F241D] tracking-tight">
          Turn Your Static Frontend into <br className="hidden sm:inline" />
          a Dynamic Portfolio
        </h2>
      </div>

      {/* 3 Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="p-6 md:p-7 bg-white rounded-2xl md:rounded-3xl border border-[#E3EAE0] hover:border-[#CFDEC9] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Top Icons Row */}
              <div className="flex items-center justify-between mb-6">
                <div className="group-hover:scale-105 transition-transform">
                  {feature.icons}
                </div>
                
                {/* Lime Checkmark Badge */}
                <div className="w-6 h-6 rounded-full bg-[#B8F256] flex items-center justify-center text-[#0F241D] shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-[#0F241D] mb-2.5 tracking-tight">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#4E6258] leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
