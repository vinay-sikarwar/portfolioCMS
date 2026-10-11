import React, { useState } from 'react';
import {
  Search,
  Bell,
  LayoutGrid,
  Folder,
  Code,
  Settings,
  User,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  ListOrdered,
  Plus,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const DashboardMockup: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'blog' | 'projects' | 'docs' | 'media'>('blog');

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishedSuccess(true);
      setTimeout(() => setPublishedSuccess(false), 3500);
    }, 800);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-12 bg-white rounded-2xl md:rounded-3xl border border-[#DCE4D9] shadow-[0_25px_60px_-15px_rgba(15,36,29,0.12)] overflow-hidden transition-all duration-300">
      
      {/* Toast Notification */}
      {publishedSuccess && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-[#0F241D] text-white px-4 py-2.5 rounded-xl shadow-lg border border-[#B8F256]/30 animate-in fade-in slide-in-from-top-2">
          <div className="w-5 h-5 rounded-full bg-[#B8F256] text-[#0F241D] flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <span className="text-xs font-medium">Changes published live to API in 42ms!</span>
        </div>
      )}

      {/* Top Bar / Header of Mockup */}
      <div className="h-14 border-b border-[#E8EDE6] px-4 md:px-6 flex items-center justify-between bg-white">
        {/* Brand */}
        <BrandLogo size="xs" textClassName="text-xs md:text-sm" />

        {/* Center Search Input */}
        <div className="flex-1 max-w-xs mx-4 hidden sm:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              placeholder="Search portfolio..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F7F2] border border-transparent rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#B8F256]"
            />
          </div>
        </div>

        {/* User & Notification Controls */}
        <div className="flex items-center gap-3">
          <button className="relative p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#B8F256] rounded-full ring-2 ring-white"></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E2E8DE] overflow-hidden border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
              <span className="text-[11px] font-bold">VS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Dashboard Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] text-xs">
        
        {/* Column 1: Left Navigation & File Tree (lg:col-span-3) */}
        <div className="lg:col-span-3 border-r border-[#E8EDE6] bg-[#FAFBF9] flex">
          {/* Narrow Icon Rail */}
          <div className="w-12 border-r border-[#EAEFE8] py-4 flex flex-col items-center justify-between bg-white shrink-0">
            <div className="flex flex-col items-center gap-4">
              <button className="p-2 rounded-lg bg-[#0F241D] text-white">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <Folder className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <Code className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div>
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-medium">
                <User className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Sub-column: Content & Assets */}
          <div className="flex-1 p-3.5 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="font-semibold text-slate-900 text-xs mb-3 px-1.5 flex items-center justify-between">
                <span>Content & Assets</span>
              </div>

              {/* Tree Menu */}
              <div className="space-y-1 mb-6">
                <div 
                  onClick={() => setActiveTab('projects')}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                    activeTab === 'projects' ? 'bg-[#EEF4EB] text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-slate-500" />
                    <span>Projects</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>

                <div 
                  onClick={() => setActiveTab('blog')}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                    activeTab === 'blog' ? 'bg-[#EEF4EB] text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#0F241D]" />
                    <span>Blog Posts</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('docs')}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                    activeTab === 'docs' ? 'bg-[#EEF4EB] text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Documents</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('media')}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                    activeTab === 'media' ? 'bg-[#EEF4EB] text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Media Library</span>
                  </div>
                </div>
              </div>

              {/* Status List */}
              <div className="pt-2 border-t border-[#EAEFE8]">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1 mb-2">
                  <span>Project</span>
                  <span>Status</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1 py-1 text-[11px]">
                    <span className="truncate max-w-[90px] text-slate-700 font-medium">Project Redesign</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#B8F256] text-[#0F241D]">
                      Live
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-1 py-1 text-[11px]">
                    <span className="truncate max-w-[90px] text-slate-700 font-medium">API Guide</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FDE68A] text-amber-900">
                      Draft
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-1 py-1 text-[11px]">
                    <span className="truncate max-w-[90px] text-slate-700 font-medium">API Documentation...</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#DCFCE7] text-emerald-800">
                      Updated
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-1 py-1 text-[11px]">
                    <span className="truncate max-w-[90px] text-slate-700 font-medium">Media Library</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#B8F256] text-[#0F241D]">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Content Editor (lg:col-span-5) */}
        <div className="lg:col-span-5 p-4 md:p-5 flex flex-col justify-between border-r border-[#E8EDE6] bg-white">
          <div>
            {/* Editor Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-900 text-sm">Content Editor</span>
              <button className="text-slate-400 hover:text-slate-700 p-1 rounded">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Rich Text Toolbar */}
            <div className="flex items-center gap-1 p-1 bg-[#F5F8F4] rounded-lg mb-3 border border-slate-100 text-slate-600">
              <button className="p-1.5 hover:bg-white rounded hover:text-slate-900 transition-colors font-bold text-xs">
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 hover:bg-white rounded hover:text-slate-900 transition-colors">
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 hover:bg-white rounded hover:text-slate-900 transition-colors">
                <Underline className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-3.5 bg-slate-300 mx-0.5" />
              <button className="p-1.5 hover:bg-white rounded hover:text-slate-900 transition-colors">
                <Link2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 hover:bg-white rounded hover:text-slate-900 transition-colors">
                <List className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 hover:bg-white rounded hover:text-slate-900 transition-colors">
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Prose Editor Content */}
            <div className="space-y-2.5 text-slate-600 text-xs leading-relaxed font-normal select-none">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident.
              </p>
            </div>

            {/* Add Media Button */}
            <div className="mt-4">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-[#0F241D] text-slate-600 hover:text-[#0F241D] transition-colors text-xs font-medium bg-[#FAFCF9]">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Media</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar: Content Preview & Actions */}
          <div className="mt-6 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-slate-400">Content Preview</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-3 py-1.5 bg-[#0F241D] hover:bg-[#1a382e] active:scale-95 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-sm"
              >
                {isPublishing ? (
                  <span>Publishing...</span>
                ) : (
                  <>
                    <span>Quick Publish</span>
                    <ArrowRight className="w-3 h-3 text-[#B8F256]" />
                  </>
                )}
              </button>
              <button className="text-[11px] text-slate-500 hover:text-slate-900 font-medium">
                Advanced Settings &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: API Integration & Status (lg:col-span-4) */}
        <div className="lg:col-span-4 p-4 md:p-5 bg-[#FAFBF9] flex flex-col justify-between">
          <div>
            {/* Header & Status */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-900 text-sm">API Integration & Status</span>
            </div>

            <div className="flex items-center justify-between mb-3 bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-medium">Live API Status</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>

            {/* API Endpoints Box */}
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">
                API Endpoints
              </span>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                  <span className="truncate">/api/v1/your-api-slug/projects</span>
                  <button
                    onClick={() => handleCopy('/api/v1/your-api-slug/projects', 1)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors ml-1 shrink-0"
                    title="Copy endpoint"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                  <span className="truncate">/api/v1/your-api-slug/posts</span>
                  <button
                    onClick={() => handleCopy('/api/v1/your-api-slug/posts', 2)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors ml-1 shrink-0"
                    title="Copy endpoint"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Architecture Diagram Box */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 mb-4 shadow-sm">
              <div className="flex items-center justify-between gap-1 text-[11px]">
                <div className="flex flex-col items-center p-2 rounded-lg bg-[#FAFBF9] border border-slate-200 w-24">
                  <div className="w-5 h-5 rounded bg-[#0F241D] text-[#B8F256] font-mono text-[10px] font-bold flex items-center justify-center mb-1">
                    P
                  </div>
                  <span className="font-semibold text-slate-800 text-[10px]">Dashboard</span>
                </div>

                <div className="flex-1 flex flex-col items-center px-1">
                  <div className="w-full flex items-center">
                    <div className="h-0.5 flex-1 bg-[#B8F256]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#B8F256] -ml-1"></div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#0F241D] -ml-1" />
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 font-mono">JSON 42ms</span>
                </div>

                <div className="flex flex-col items-center p-2 rounded-lg bg-[#FAFBF9] border border-slate-200 w-24">
                  <div className="w-5 h-5 rounded bg-slate-800 text-white text-[10px] flex items-center justify-center mb-1">
                    💻
                  </div>
                  <span className="font-semibold text-slate-800 text-[10px] truncate text-center">External Frontend</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights Stats */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2 uppercase tracking-wider">
              Key Insights
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Total Posts</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">45</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Active Projects</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">12</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
