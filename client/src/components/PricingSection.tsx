import React, { useState } from 'react';
import { Zap, Rocket, Gem, Check, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan?: (planName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Starter',
      icon: <Zap className="w-5 h-5 text-[#0F241D]" />,
      monthlyPrice: '$9.99',
      yearlyPrice: '$7.99',
      period: '/ per month',
      description: 'Ideal for indie developers managing a single personal portfolio.',
      features: [
        'Dynamic Tracking',
        'Portfolio Deployment',
        'Instant Portfolio Analytics',
        'Response Time < 50ms',
      ],
      isPopular: false,
    },
    {
      name: 'Pro',
      icon: <Rocket className="w-5 h-5 text-[#B8F256]" />,
      monthlyPrice: '$18.99',
      yearlyPrice: '$14.99',
      period: '/ per month',
      description: 'Unlock unlimited capabilities with real-time updates and fast sync.',
      features: [
        'Everything in Starter Plan',
        'Unlimited API Requests',
        'Advanced Portfolio Analytics',
        'Fast Collaboration & Support',
      ],
      isPopular: true,
    },
    {
      name: 'Enterprise',
      icon: <Gem className="w-5 h-5 text-[#0F241D]" />,
      monthlyPrice: '$29.99',
      yearlyPrice: '$23.99',
      period: '/ per month',
      description: 'High-performance headless infrastructure for studios and agencies.',
      features: [
        'Everything in Standard Plan',
        'Custom Schemas & Models',
        'Priority SLA Support 99.9%',
        'Custom Domain & White Label',
      ],
      isPopular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F241D] tracking-tight">
          Explore our pricing plans
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-[#4E6258] leading-relaxed">
          Flexible plans to build and manage your dynamic portfolios. Choose the plan that fits best to make your portfolio shine.
        </p>

        {/* Billing Switcher */}
        <div className="mt-6 inline-flex items-center p-1 bg-[#EAEFE7] rounded-full border border-[#D5DFD1]">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
              billingCycle === 'monthly'
                ? 'bg-[#0F241D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
              billingCycle === 'yearly'
                ? 'bg-[#0F241D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Yearly</span>
            <span className="px-1.5 py-0.2 bg-[#B8F256] text-[#0F241D] text-[10px] font-bold rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* 3 Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan, idx) => {
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          
          if (plan.isPopular) {
            // Featured Pro Card (Dark Forest Green)
            return (
              <div
                key={idx}
                className="relative bg-[#0F241D] text-white rounded-3xl p-7 md:p-8 border border-[#1E4336] shadow-xl flex flex-col justify-between transform md:-translate-y-2 group"
              >
                {/* Popular Pill Badge */}
                <div className="absolute top-6 right-6">
                  <span className="px-3 py-1 bg-[#B8F256] text-[#0F241D] text-[11px] font-extrabold rounded-full tracking-wide">
                    Popular Plan
                  </span>
                </div>

                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#1B3E32] flex items-center justify-center mb-6 border border-[#2B5C4B]">
                    {plan.icon}
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-extrabold text-white tabular-nums tracking-tight">
                      {price}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                  </div>

                  <button
                    onClick={() => onSelectPlan?.(plan.name)}
                    className="w-full mt-4 py-2.5 px-4 bg-[#B8F256] hover:bg-[#a6e63e] active:scale-[0.98] text-[#0F241D] rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Get Started
                  </button>

                  <p className="mt-4 text-xs text-slate-300 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mt-6 pt-5 border-t border-[#1C3E33]">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                      Services Included
                    </span>
                    <ul className="space-y-2.5 text-xs text-slate-200">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#1B3E32] flex items-center justify-center text-[#B8F256] shrink-0 border border-[#2B5C4B]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          }

          // Light Standard Cards (Starter & Enterprise)
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 md:p-8 border border-[#E1E8DC] hover:border-[#D1DDCB] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F2F6F0] flex items-center justify-center mb-6">
                  {plan.icon}
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-[#0F241D] tabular-nums tracking-tight">
                    {price}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{plan.period}</span>
                </div>

                <button
                  onClick={() => onSelectPlan?.(plan.name)}
                  className="w-full mt-4 py-2.5 px-4 bg-[#FAFBF9] hover:bg-[#EEF3EC] active:scale-[0.98] text-[#0F241D] border border-[#D5DFD1] rounded-xl text-xs font-bold transition-all"
                >
                  Get Started
                </button>

                <p className="mt-4 text-xs text-[#55695E] leading-relaxed">
                  {plan.description}
                </p>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                    Services Included
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-[#EFF6EC] flex items-center justify-center text-[#0F241D] shrink-0 border border-[#D7E3D3]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
