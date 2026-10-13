import React, { useState } from "react";
import {
  BookOpen,
  ArrowLeft,
  Copy,
  Check,
  Code2,
  Sparkles,
  Layers,
  Zap,
  Globe,
  Database,
  Image as ImageIcon,
  Key,
  ShieldCheck,
  Cpu,
  Terminal,
  ExternalLink,
  ChevronRight,
  Search,
  LayoutDashboard,
  CheckCircle2,
  FileCode,
  FolderTree,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface DocsPageProps {
  onBack: () => void;
  onGoToDashboard?: () => void;
  currentUser?: { name: string; email: string; apiSlug?: string } | null;
  onLogin?: () => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({
  onBack,
  onGoToDashboard,
  currentUser,
  onLogin,
}) => {
  const [activeTab, setActiveTab] = useState<
    "intro" | "quickstart" | "collections" | "api" | "integration" | "faq"
  >("intro");
  const [codeLang, setCodeLang] = useState<"react" | "next" | "vanilla" | "curl">(
    "react"
  );
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const userApiSlug = currentUser?.apiSlug || "demo-user";

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const codeSnippets = {
    react: `// React Component: Fetching Portfolio Projects
import React, { useEffect, useState } from 'react';

interface Project {
  id: string;
  title: string;
  summary: string;
  image?: string;
  category?: string;
  link?: string;
  [key: string]: any;
}

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('http://localhost:3000/api/v1/${userApiSlug}/projects');
        const json = await res.json();
        if (json.status === 200) {
          setProjects(json.data);
        }
      } catch (err) {
        console.error('Failed to load portfolio projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  if (loading) return <div>Loading projects...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => (
        <article key={project.id} className="rounded-2xl border p-5 shadow-sm">
          {project.image && (
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-48 object-cover rounded-xl mb-4" 
            />
          )}
          <span className="text-xs font-bold text-emerald-700">{project.category}</span>
          <h3 className="text-xl font-bold mt-1">{project.title}</h3>
          <p className="text-sm text-slate-600 mt-2">{project.summary}</p>
          {project.link && (
            <a 
              href={project.link} 
              target="_blank" 
              rel="noreferrer"
              className="inline-block mt-4 text-xs font-bold text-emerald-800 underline"
            >
              View Live Demo →
            </a>
          )}
        </article>
      ))}
    </div>
  );
}`,
    next: `// Next.js (App Router): Server Component with Revalidation
// app/projects/page.tsx

interface Project {
  id: string;
  title: string;
  summary: string;
  image?: string;
  category?: string;
  link?: string;
}

async function getProjects(): Promise<Project[]> {
  const res = await fetch('http://localhost:3000/api/v1/${userApiSlug}/projects', {
    next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
  });

  if (!res.ok) throw new Error('Failed to fetch projects');
  const payload = await res.json();
  return payload.data;
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-extrabold mb-8">Selected Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border p-6 shadow-xs">
            {p.image && (
              <img src={p.image} alt={p.title} className="rounded-xl w-full h-52 object-cover mb-4" />
            )}
            <h2 className="text-xl font-bold">{p.title}</h2>
            <p className="text-slate-600 text-sm mt-2">{p.summary}</p>
          </div>
        ))}
      </div>
    </main>
  );
}`,
    vanilla: `<!-- Vanilla HTML & JavaScript -->
<div id="portfolio-container">Loading portfolio...</div>

<script>
  async function fetchPortfolio() {
    try {
      const response = await fetch('http://localhost:3000/api/v1/${userApiSlug}/projects');
      const result = await response.json();
      
      const container = document.getElementById('portfolio-container');
      container.innerHTML = '';
      
      result.data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = \`
          \${item.image ? \`<img src="\${item.image}" alt="\${item.title}" style="max-width:100%; border-radius:12px;"/>\` : ''}
          <h3>\${item.title}</h3>
          <p>\${item.summary || ''}</p>
        \`;
        container.appendChild(card);
      });
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
    }
  }

  fetchPortfolio();
</script>`,
    curl: `# Fetch all Live projects in JSON format
curl -X GET "http://localhost:3000/api/v1/${userApiSlug}/projects" \\
  -H "Accept: application/json"

# Fetch all skills
curl -X GET "http://localhost:3000/api/v1/${userApiSlug}/skills" \\
  -H "Accept: application/json"

# Fetch published blog posts / articles
curl -X GET "http://localhost:3000/api/v1/${userApiSlug}/blog" \\
  -H "Accept: application/json"`,
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-[#0F241D] flex flex-col selection:bg-[#B8F256] selection:text-[#0F241D]">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#DEE7DA] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-[#0F241D] hover:bg-[#EEF5EB] transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>
            <div className="h-5 w-px bg-slate-200"></div>
            <BrandLogo size="sm" />
            <span className="px-2 py-0.5 rounded-md bg-[#EEF5EB] text-[11px] font-bold text-[#0F241D] border border-[#D5E6D1]">
              Docs
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <button
                onClick={onGoToDashboard}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0F241D] hover:bg-[#1a3f32] active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#B8F256]" />
                <span>Open Dashboard</span>
              </button>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0F241D] hover:bg-[#1a3f32] active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <span>Sign In / Get Started</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO DOCS BANNER */}
      <div className="bg-gradient-to-b from-[#EEF6EC] to-[#F8FAF6] border-b border-[#DEE7DA] px-4 sm:px-8 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D5E3D1] text-xs font-bold text-[#0F241D] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Developer Documentation & Architecture Guide</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0F241D] tracking-tight">
            How to Build, Manage &amp; Connect Your Dynamic Portfolio
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            PortfolioHQ is a modern, headless portfolio CMS. Keep your frontend
            static and fast, while updating your projects, skills, photos, and
            articles in real time without redeploying.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              REST API Ready
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Auto WebP Optimization
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Dynamic Custom Schemas
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Nested Objects &amp; Multi-Photos
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN DOCS CONTAINER */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR NAVIGATION */}
        <aside className="lg:w-64 shrink-0 space-y-6">
          <div className="sticky top-20 bg-white rounded-2xl border border-[#DEE7DA] p-4 shadow-2xs space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2">
              Documentation Topics
            </div>

            {[
              { id: "intro", label: "1. Why PortfolioHQ?", icon: Sparkles },
              { id: "quickstart", label: "2. Quick Start Guide", icon: Zap },
              {
                id: "collections",
                label: "3. Collections & Fields",
                icon: Layers,
              },
              { id: "api", label: "4. REST API Endpoints", icon: Globe },
              {
                id: "integration",
                label: "5. Code Integration",
                icon: Code2,
              },
              { id: "faq", label: "6. FAQs & Best Practices", icon: BookOpen },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                    isActive
                      ? "bg-[#0F241D] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#0F241D] hover:bg-[#F3F7F1]"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-[#B8F256]" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 mt-2 border-t border-slate-100 px-1">
              <div className="p-3 rounded-xl bg-[#F6FAF3] border border-[#DEE8DB] space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Your API Endpoint
                </span>
                <code className="text-[11px] font-mono text-[#0F241D] font-bold block truncate">
                  /api/v1/{userApiSlug}/projects
                </code>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 space-y-10 min-w-0">
          {/* TAB 1: WHY PORTFOLIOHQ */}
          {activeTab === "intro" && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DEE7DA] shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Chapter 1
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F241D] mt-1">
                    Why PortfolioHQ? The Problem with Traditional Portfolios
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      ✕ The Old Way (Hardcoded Static Code)
                    </span>
                    <p className="text-xs text-rose-900/80 leading-relaxed">
                      Every time you finish a client project, earn a certificate,
                      or want to fix a typo, you must open your IDE, edit raw
                      JSON/TypeScript files, commit to Git, push to GitHub, wait
                      for CI/CD build scripts, and hope nothing broke.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      ✓ The PortfolioHQ Way
                    </span>
                    <p className="text-xs text-emerald-900/80 leading-relaxed">
                      Your website fetches clean JSON data via standard REST
                      APIs. When you add a new project, edit a skill, or upload
                      gallery photos from your phone or dashboard, your portfolio
                      updates instantly without redeploying.
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="text-lg font-bold text-[#0F241D]">
                    Core Principles &amp; Architecture
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#E0E9DD] space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-[#0F241D] text-[#B8F256] flex items-center justify-center font-bold">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-[#0F241D]">
                        Sub-50ms Response
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Lightweight Prisma database queries and gzip compression
                        deliver responses with near-zero latency.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#E0E9DD] space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-[#0F241D] text-[#B8F256] flex items-center justify-center font-bold">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-[#0F241D]">
                        Client WebP Compression
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Uploaded photos are automatically resized and converted
                        to WebP format directly in your browser before saving.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#E0E9DD] space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-[#0F241D] text-[#B8F256] flex items-center justify-center font-bold">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-[#0F241D]">
                        Zero Migration Overhead
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Add text, number, URL, multiple image fields, or nested
                        subfields visually in seconds without SQL migrations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUICK START */}
          {activeTab === "quickstart" && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DEE7DA] shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Chapter 2
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F241D] mt-1">
                    5-Minute Quick Start Guide
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Follow these simple steps to start powering your dynamic
                    portfolio in minutes.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#0F241D] text-[#B8F256] font-bold text-sm flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-sm font-bold text-[#0F241D]">
                        Claim Your Workspace &amp; API Slug
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Sign up for free. Your account automatically provisions a
                        unique, clean API slug (such as{" "}
                        <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-emerald-800">
                          {userApiSlug}
                        </code>
                        ).
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#0F241D] text-[#B8F256] font-bold text-sm flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-sm font-bold text-[#0F241D]">
                        Review Default Sections or Create Custom Collections
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        By default, your workspace comes loaded with presets for{" "}
                        <strong>Projects</strong>, <strong>Skills</strong>, and{" "}
                        <strong>Blog</strong>. Click "+ Add Section" to create
                        any custom collection (e.g. Testimonials, Speaking
                        Gigs, Awards).
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#0F241D] text-[#B8F256] font-bold text-sm flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-sm font-bold text-[#0F241D]">
                        Add Fields &amp; Upload Images
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Need multiple images for project mockups? Use{" "}
                        <strong>Edit Fields</strong> to add as many image fields
                        as you need (e.g., <code>banner_photo</code>,{" "}
                        <code>mobile_screenshot</code>). Each field gets its own
                        dedicated uploader with automatic compression.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#0F241D] text-[#B8F256] font-bold text-sm flex items-center justify-center shrink-0">
                      4
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-sm font-bold text-[#0F241D]">
                        Consume Your Public REST API
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Fetch your items in any frontend framework using a standard{" "}
                        <code>fetch()</code> request. Live items are publicly
                        readable without exposing write keys.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COLLECTIONS & FIELDS */}
          {activeTab === "collections" && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DEE7DA] shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Chapter 3
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F241D] mt-1">
                    Collections, Fields &amp; Schema Builder
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Learn how PortfolioHQ gives you complete flexibility over your
                    data structure.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#0F241D] uppercase tracking-wider">
                    Supported Field Types
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        name: "Text (Single line)",
                        desc: "Short strings like titles, client names, roles, or tags.",
                      },
                      {
                        name: "Textarea (Multi-line)",
                        desc: "Paragraphs, project summaries, and excerpts.",
                      },
                      {
                        name: "Rich Text / Markdown",
                        desc: "Full article body with headings, formatting, lists, and links.",
                      },
                      {
                        name: "Image / Photo",
                        desc: "Dedicated WebP uploader. Add multiple image fields to support photo galleries!",
                      },
                      {
                        name: "Number",
                        desc: "Numeric values like completion year, ratings, pricing, or counters.",
                      },
                      {
                        name: "URL / Link",
                        desc: "Valid web addresses for GitHub repos, live previews, or social links.",
                      },
                      {
                        name: "Nested Object",
                        desc: "Group related subfields together (e.g. client.company, client.website, seo.meta_title).",
                      },
                    ].map((f, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-[#F8FAF6] border border-[#DEE8DB]"
                      >
                        <span className="text-xs font-bold text-[#0F241D] block">
                          {f.name}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">
                          {f.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#EEF5EB] border border-[#D5E6D1] space-y-2">
                  <span className="text-xs font-bold text-[#0F241D] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-800" />
                    Adding Multiple Photos to an Item
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    There is no restriction on having only one photo. To add
                    multiple photos to your items, open <strong>Edit Fields</strong> in
                    any section and add multiple fields of type{" "}
                    <strong>Image / Photo</strong> (e.g., <code>hero_image</code>,{" "}
                    <code>screenshot_1</code>, <code>screenshot_2</code>). Each
                    field will display its own visual uploader with live preview.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REST API ENDPOINTS */}
          {activeTab === "api" && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DEE7DA] shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Chapter 4
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F241D] mt-1">
                    Public REST API Reference
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Zero authentication required for public read access to Live
                    items. Fast, cached, and CORS-enabled for all domains.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Endpoint 1 */}
                  <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#DEE8DB] space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-bold">
                        GET
                      </span>
                      <code className="text-xs font-mono font-bold text-[#0F241D]">
                        /api/v1/:apiSlug/:sectionSlug
                      </code>
                    </div>
                    <p className="text-xs text-slate-600">
                      Returns all published items in the specified section (e.g.{" "}
                      <code>/api/v1/{userApiSlug}/projects</code>).
                    </p>
                  </div>

                  {/* Endpoint 2 */}
                  <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#DEE8DB] space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-bold">
                        GET
                      </span>
                      <code className="text-xs font-mono font-bold text-[#0F241D]">
                        /api/v1/:apiSlug/:sectionSlug/:idOrSlug
                      </code>
                    </div>
                    <p className="text-xs text-slate-600">
                      Returns a single item by its database ID or article URL slug.
                    </p>
                  </div>

                  {/* Endpoint 3 */}
                  <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#DEE8DB] space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-bold">
                        GET
                      </span>
                      <code className="text-xs font-mono font-bold text-[#0F241D]">
                        /api/v1/:apiSlug/sections
                      </code>
                    </div>
                    <p className="text-xs text-slate-600">
                      Returns all configured sections and their schema metadata.
                    </p>
                  </div>
                </div>

                {/* Example Response JSON */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Example JSON Response (HTTP 200 OK)
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          JSON.stringify(
                            {
                              status: 200,
                              count: 2,
                              data: [
                                {
                                  id: "proj_123",
                                  title: "E-Commerce Mobile App",
                                  category: "Mobile",
                                  status: "Live",
                                  summary: "Full stack Flutter app with Stripe.",
                                  image: "data:image/webp;base64,...",
                                  gallery_image_2: "https://example.com/mock.png",
                                  client_details: {
                                    company: "Acme Corp",
                                    website: "https://acme.com",
                                  },
                                },
                              ],
                            },
                            null,
                            2
                          ),
                          "json_res"
                        )
                      }
                      className="text-xs text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
                    >
                      {copiedSnippet === "json_res" ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy JSON
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 rounded-2xl bg-[#0F241D] text-slate-200 text-xs font-mono overflow-x-auto">
{`{
  "status": 200,
  "count": 1,
  "data": [
    {
      "id": "proj_123",
      "title": "E-Commerce Redesign",
      "category": "Design & Code",
      "status": "Live",
      "summary": "Next.js storefront with dynamic content from PortfolioHQ.",
      "image": "https://images.unsplash.com/photo-...",
      "screenshot_2": "https://images.unsplash.com/photo-...",
      "client_details": {
        "company": "Starlight Studio",
        "website": "https://starlight.design"
      },
      "updatedAt": "2026-10-13"
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CODE INTEGRATION */}
          {activeTab === "integration" && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DEE7DA] shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Chapter 5
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F241D] mt-1">
                    Frontend Code Integration
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Copy and paste ready-to-run code for your favorite framework.
                  </p>
                </div>

                {/* Framework Selector Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-[#F4F7F2] rounded-xl border border-slate-200 w-fit">
                  {(
                    [
                      { id: "react", label: "React" },
                      { id: "next", label: "Next.js (App Router)" },
                      { id: "vanilla", label: "Vanilla JS" },
                      { id: "curl", label: "cURL / Terminal" },
                    ] as const
                  ).map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setCodeLang(lang.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        codeLang === lang.id
                          ? "bg-white text-[#0F241D] shadow-xs border border-slate-200/80"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                {/* Code Viewer */}
                <div className="relative group">
                  <div className="absolute right-3 top-3 z-10">
                    <button
                      onClick={() =>
                        handleCopy(codeSnippets[codeLang], `code_${codeLang}`)
                      }
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all border border-white/20"
                    >
                      {copiedSnippet === `code_${codeLang}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#B8F256]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-300" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-5 pt-12 rounded-2xl bg-[#0F241D] text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-[#1d3d33]">
                    {codeSnippets[codeLang]}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FAQ & BEST PRACTICES */}
          {activeTab === "faq" && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DEE7DA] shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Chapter 6
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F241D] mt-1">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      q: "Can I use multiple photos for a single project or item?",
                      a: "Yes! There is no limit. Click 'Edit Fields' on any collection and add multiple fields with type 'Image / Photo' (e.g. hero_image, screenshot_1, screenshot_2). Each field will have its own individual uploader with automatic WebP compression.",
                    },
                    {
                      q: "Do I need an API key to display my portfolio publicly?",
                      a: "No! Public read endpoints (GET /api/v1/:apiSlug/:section) are designed to be public and read-only for items with status 'Live'. This makes client-side fetching from React or Next.js safe without leaking private admin tokens.",
                    },
                    {
                      q: "How does image compression work?",
                      a: "When you choose a photo or drag-and-drop a file, PortfolioHQ optimizes and compresses the image to modern WebP format right in your browser. This reduces file sizes by up to 80% and ensures instant page load times.",
                    },
                    {
                      q: "Can I group related fields together?",
                      a: "Yes! You can choose the 'Nested Object' field type in 'Edit Fields'. This lets you group subfields together (for instance, client company, contact person, or custom SEO meta tags).",
                    },
                    {
                      q: "How do I handle Draft items?",
                      a: "Items with status 'Draft' are excluded from public API responses by default. Only items marked 'Live' are served to external visitors.",
                    },
                  ].map((faq, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#DEE8DB] space-y-1.5"
                    >
                      <h3 className="text-xs sm:text-sm font-bold text-[#0F241D]">
                        {faq.q}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 4. FOOTER */}
      <footer className="border-t border-[#DEE7DA] bg-white py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" />
          <p>© 2026 PortfolioHQ. Powering dynamic portfolios with modern headless APIs.</p>
          <button
            onClick={onBack}
            className="text-xs font-bold text-emerald-800 hover:underline"
          >
            Back to Home
          </button>
        </div>
      </footer>
    </div>
  );
};
