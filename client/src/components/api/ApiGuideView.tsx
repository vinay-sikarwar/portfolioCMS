import React, { useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  Terminal,
  Zap,
  Globe,
  ArrowRight,
  ExternalLink,
  Code2
} from 'lucide-react';

export const ApiGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'curl' | 'nextjs' | 'react' | 'astro' | 'python'>('nextjs');
  const [copied, setCopied] = useState(false);

  const snippets = {
    nextjs: `// app/projects/page.tsx (Next.js 14/15 Server Component)
const API_BASE_URL = process.env.PORTFOLIOCMS_API_URL;
const API_SLUG = process.env.PORTFOLIOCMS_API_SLUG;
export default async function ProjectsPage() {
  const res = await fetch(API_BASE_URL + '/api/v1/' + API_SLUG + '/projects?status=Live', {
    headers: {
      'Authorization': \`Bearer \${process.env.PORTFOLIOCMS_API_KEY}\`,
    },
    next: { revalidate: 3600 }, // On-demand edge ISR caching
  });

  const { data: projects } = await res.json();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => (
        <article key={project.id} className="p-6 rounded-2xl border border-slate-200">
          <h2 className="text-xl font-bold">{project.title}</h2>
          <p className="text-slate-600 mt-2">{project.summary}</p>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-lime-100 text-lime-900 mt-4 inline-block">
            {project.category}
          </span>
        </article>
      ))}
    </div>
  );
}`,
    react: `// hooks/usePortfolioProjects.ts (React Single Page App)
import { useState, useEffect } from 'react';

export function usePortfolioProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/v1/' + import.meta.env.VITE_API_SLUG + '/projects?status=Live', {
          headers: {
            'Authorization': 'Bearer phq_live_your_token_here',
          }
        });
        const json = await res.json();
        setProjects(json.data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return { projects, loading };
}`,
    astro: `---
// src/pages/portfolio.astro (Astro Component)
const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/v1/' + import.meta.env.VITE_API_SLUG + '/projects?status=Live', {
  headers: {
    'Authorization': \`Bearer \${import.meta.env.PORTFOLIOCMS_API_KEY}\`
  }
});
const { data: projects } = await response.json();
---

<section class="max-w-5xl mx-auto py-12">
  <h1 class="text-3xl font-extrabold mb-8">Selected Projects</h1>
  <div class="grid gap-6">
    {projects.map((proj) => (
      <div class="border rounded-2xl p-6 bg-white shadow-xs">
        <h3 class="font-bold text-lg">{proj.title}</h3>
        <p class="text-slate-600">{proj.summary}</p>
      </div>
    ))}
  </div>
</section>`,
    curl: `# cURL Terminal Request
curl -X GET "$PORTFOLIOCMS_API_URL/api/v1/$PORTFOLIOCMS_API_SLUG/projects?status=Live&limit=10" \\
  -H "Authorization: Bearer phq_live_your_token_here" \\
  -H "Accept: application/json"`,
    python: `# portfolio_client.py
import os
import requests

API_URL = os.environ["PORTFOLIOCMS_API_URL"] + "/api/v1/" + os.environ["PORTFOLIOCMS_API_SLUG"] + "/projects"
API_KEY = os.getenv("PORTFOLIOCMS_API_KEY", "phq_live_your_token_here")

response = requests.get(
    API_URL,
    params={"status": "Live", "limit": 10},
    headers={"Authorization": f"Bearer {API_KEY}"}
)

if response.status_code == 200:
    projects = response.json()["data"]
    for proj in projects:
        print(f"[{proj['status']}] {proj['title']} - {proj.get('category', '')}")
else:
    print(f"Error: {response.status_code}")`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 flex flex-col min-h-full bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F241D] text-[#B8F256] flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#0F241D] tracking-tight">
              API Integration Guide
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF5E5] text-[#0F241D] border border-[#CDE5C4]">
              Developer Docs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete quickstart instructions to connect your frontend portfolio site in Next.js, React, Astro, or Python.
          </p>
        </div>
      </div>

      {/* 3 Step Quickstart Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-slate-200">
          <span className="w-6 h-6 rounded-lg bg-[#0F241D] text-[#B8F256] font-bold text-xs flex items-center justify-center mb-2">
            1
          </span>
          <h3 className="font-bold text-xs text-slate-900 mb-1">Get Your API Key</h3>
          <p className="text-xs text-slate-500">
            Generate a Read-Only token from the API Keys tab for safe consumption in your frontend client.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-slate-200">
          <span className="w-6 h-6 rounded-lg bg-[#0F241D] text-[#B8F256] font-bold text-xs flex items-center justify-center mb-2">
            2
          </span>
          <h3 className="font-bold text-xs text-slate-900 mb-1">Query via Edge HTTP</h3>
          <p className="text-xs text-slate-500">
            Fetch standard JSON payloads with sub-50ms latency across global edge points with zero cold starts.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-slate-200">
          <span className="w-6 h-6 rounded-lg bg-[#0F241D] text-[#B8F256] font-bold text-xs flex items-center justify-center mb-2">
            3
          </span>
          <h3 className="font-bold text-xs text-slate-900 mb-1">Quick Publish Sync</h3>
          <p className="text-xs text-slate-500">
            Any edits made in your dashboard propagate live worldwide immediately via webhook revalidation.
          </p>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="flex-1 flex flex-col rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Framework Tabs */}
        <div className="bg-[#FAFBF9] px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['nextjs', 'react', 'astro', 'curl', 'python'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-[#0F241D] text-[#B8F256] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab === 'nextjs' ? 'Next.js' : tab === 'curl' ? 'cURL' : tab}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Block */}
        <pre className="p-5 bg-[#0F241D] text-[#B8F256] font-mono text-xs overflow-x-auto leading-relaxed flex-1">
          {snippets[activeTab]}
        </pre>
      </div>
    </div>
  );
};
