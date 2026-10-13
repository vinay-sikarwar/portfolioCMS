import React, { useEffect, useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Play,
  ArrowRight,
  ExternalLink,
  Terminal,
  ShieldCheck,
  Zap,
  Globe,
  RefreshCw,
  Sliders,
  Layers
} from 'lucide-react';
import { SectionDefinition, ItemData } from '../DashboardPage';
import { apiUrl, API_BASE_URL } from '../../lib/api';

interface ApiEndpointsViewProps {
  sections: SectionDefinition[];
  itemsBySection: Record<string, ItemData[]>;
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  onGoToKeys: () => void;
  onGoToGuide: () => void;
}

export const ApiEndpointsView: React.FC<ApiEndpointsViewProps> = ({
  sections,
  itemsBySection,
  activeSectionId,
  onSelectSection,
  onGoToKeys,
  onGoToGuide,
}) => {
  const [selectedEndpointSlug, setSelectedEndpointSlug] = useState<string>(
    sections.find((s) => s.id === activeSectionId)?.slug || 'projects'
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'Live' | 'Draft'>('all');
  const [limitParam, setLimitParam] = useState('10');
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [latencyMs, setLatencyMs] = useState(24);
  const apiBaseUrl = API_BASE_URL || window.location.origin;
  const [apiSlug, setApiSlug] = useState<string | null>(null);
  const [liveResponse, setLiveResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number>(200);

  useEffect(() => {
    const token = localStorage.getItem('portfoliohq_token');
    fetch(apiUrl('/api/auth/me'), { headers: { Authorization: `Bearer ${token || ''}` } })
      .then((response) => response.json())
      .then((payload) => setApiSlug(payload.user?.apiSlug || null))
      .catch(() => undefined);
  }, []);

  const activeSec = sections.find((s) => s.slug === selectedEndpointSlug) || sections[0];
  const allItems = itemsBySection[activeSec?.id || 'projects'] || itemsBySection[activeSec?.slug || ''] || [];

  const filtered = allItems.filter((item) => {
    if (selectedStatusFilter === 'all') return true;
    return item.status === selectedStatusFilter;
  }).slice(0, parseInt(limitParam) || 10);

  const queryParams = [];
  if (selectedStatusFilter !== 'all') queryParams.push(`status=${selectedStatusFilter}`);
  if (limitParam && limitParam !== '10') queryParams.push(`limit=${limitParam}`);
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

  const fullUrl = `${apiBaseUrl}/api/v1/${apiSlug || 'your-api-slug'}/${selectedEndpointSlug}${queryString}`;

  const displayedPayload = liveResponse !== null ? liveResponse : {
    status: 200,
    success: true,
    section: selectedEndpointSlug,
    meta: {
      total: allItems.length,
      returned: filtered.length,
      limit: parseInt(limitParam) || 10,
    },
    data: filtered,
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    const token = localStorage.getItem('portfoliohq_token');
    const startTime = performance.now();
    try {
      const testPath = `/api/v1/${apiSlug || 'your-api-slug'}/${selectedEndpointSlug}${queryString}`;
      const res = await fetch(apiUrl(testPath), {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      const endTime = performance.now();
      setLatencyMs(Math.max(14, Math.round(endTime - startTime)));
      setResponseStatus(res.status);
      const data = await res.json();
      setLiveResponse(data);
    } catch (err: any) {
      setResponseStatus(500);
      setLiveResponse({ status: 500, error: err.message || "Failed to execute request" });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col min-h-full bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F241D] text-[#B8F256] flex items-center justify-center font-bold">
              <Code className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#0F241D] tracking-tight">
              API Endpoints
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live & Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Query your headless portfolio content via sub-50ms edge endpoints with instantaneous cache invalidation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onGoToKeys}
            className="px-3.5 py-2 bg-[#F3F7F1] hover:bg-[#E7EFE4] text-slate-700 hover:text-[#0F241D] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#DCE4D8]"
          >
            <span>Manage API Keys</span>
          </button>
          <button
            onClick={onGoToGuide}
            className="px-3.5 py-2 bg-[#0F241D] hover:bg-[#1a382e] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>View API Guide</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B8F256]" />
          </button>
        </div>
      </div>

      {/* Endpoint Selector Tabs */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
          Available Collections & Routes
        </label>
        <div className="flex flex-wrap gap-2">
          {sections.map((sec) => {
            const count = (itemsBySection[sec.id] || []).length;
            const isSelected = selectedEndpointSlug === sec.slug;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setSelectedEndpointSlug(sec.slug);
                  onSelectSection(sec.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-[#0F241D] text-white border-[#0F241D] shadow-sm'
                    : 'bg-[#F8FAF6] hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#B8F256]">
                  GET
                </span>
                <span>/v1/{sec.slug}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Request Bar */}
      <div className="p-4 rounded-2xl bg-[#0F241D] text-white border border-[#1A3F33] mb-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1E4B3D]">
          <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto min-w-0 flex-1 max-w-full">
            <span className="px-2 py-1 rounded-md bg-[#B8F256] text-[#0F241D] font-bold text-[11px]">
              GET
            </span>
            <span className="text-slate-300 font-medium truncate">
              {fullUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#B8F256]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy URL'}</span>
            </button>
            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="px-4 py-1.5 rounded-lg bg-[#B8F256] hover:bg-[#a6df48] text-[#0F241D] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Sending...' : 'Send Request'}</span>
            </button>
          </div>
        </div>

        {/* Query Params Quick Config */}
        <div className="pt-3 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Sliders className="w-3 h-3 text-[#B8F256]" />
            <span>Parameters:</span>
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">status=</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="bg-[#17382B] text-white border border-[#2B5E4D] rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              <option value="all">all</option>
              <option value="Live">Live</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">limit=</span>
            <input
              type="number"
              value={limitParam}
              onChange={(e) => setLimitParam(e.target.value)}
              className="w-16 bg-[#17382B] text-white border border-[#2B5E4D] rounded-lg px-2 py-1 text-xs focus:outline-none"
            />
          </div>

          <div className="ml-auto text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8F256]"></span>
            <span>Edge latency: <strong className="text-white">{latencyMs}ms</strong></span>
          </div>
        </div>
      </div>

      {/* Response Panel */}
      <div className="flex-1 flex flex-col rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-[#FAFBF9] px-3 sm:px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-3">
            <span>Response Payload ({responseStatus} {responseStatus === 200 ? 'OK' : responseStatus === 201 ? 'Created' : 'Response'})</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
              application/json
            </span>
            {liveResponse && (
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                Live Edge Response
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            {Array.isArray(displayedPayload?.data) ? displayedPayload.data.length : filtered.length} records returned
          </span>
        </div>

        <pre className="p-4 bg-[#0F241D] text-[#B8F256] font-mono text-xs overflow-x-auto flex-1 max-h-[380px]">
          {JSON.stringify(displayedPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
};
