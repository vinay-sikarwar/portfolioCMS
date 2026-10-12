import React, { useEffect, useState } from 'react';
import {
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  AlertTriangle,
  RotateCw,
  X
} from 'lucide-react';
import { apiUrl } from '../../lib/api';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  tokenSecret: string;
  role: 'Read-Only' | 'Read & Write' | 'Full Admin';
  created: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
}

export const ApiKeysView: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);

  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRole, setNewKeyRole] = useState<'Read-Only' | 'Read & Write' | 'Full Admin'>('Read-Only');
  const [apiSlug, setApiSlug] = useState<string | null>(null);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('portfoliohq_token') || ''}`,
  });

  useEffect(() => {
    const loadKeys = async () => {
      const sessionResponse = await fetch(apiUrl('/api/auth/me'), { headers: getAuthHeaders() });
      const sessionPayload = await sessionResponse.json();
      if (!sessionResponse.ok || !sessionPayload.user?.apiSlug) return;
      setApiSlug(sessionPayload.user.apiSlug);

      const response = await fetch(apiUrl(`/api/v1/${sessionPayload.user.apiSlug}/keys`), { headers: getAuthHeaders() });
      const payload = await response.json();
      {
        if (!payload.data) return;
        setKeys(payload.data.map((key: any) => ({
          id: key.id,
          name: key.name,
          keyPrefix: key.keyPrefix,
          tokenSecret: key.token,
          role: key.role,
          created: new Date(key.createdAt).toLocaleDateString(),
          lastUsed: key.lastUsed,
          status: key.status,
        })));
      }
    };

    loadKeys().catch(() => undefined);
  }, []);

  const handleCopy = (id: string, token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    if (!apiSlug) return;
    const response = await fetch(apiUrl(`/api/v1/${apiSlug}/keys`), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName.trim(), role: newKeyRole }),
    });
    if (!response.ok) return;
    const payload = await response.json();
    const key = payload.data;
    setKeys((prev) => [{
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      tokenSecret: key.token,
      role: key.role,
      created: new Date(key.createdAt).toLocaleDateString(),
      lastUsed: key.lastUsed,
      status: key.status,
    }, ...prev]);
    setIsModalOpen(false);
    setNewKeyName('');
    setVisibleKeyId(key.id);
  };

  const handleRevokeKey = async (id: string) => {
    if (!apiSlug) return;
    const response = await fetch(apiUrl(`/api/v1/${apiSlug}/keys/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      setKeys((prev) => prev.filter((key) => key.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col min-h-full bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F241D] text-[#B8F256] flex items-center justify-center font-bold">
              <Key className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#0F241D] tracking-tight">
              API Keys & Authentication
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF5E5] text-[#0F241D] border border-[#CDE5C4]">
              Bearer Tokens
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authenticate requests to portfolioCMS edge endpoints. Keep your secret keys safe and never share client-secrets in public repos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#0F241D] hover:bg-[#1a3f32] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-[#B8F256]" />
          <span>Generate New API Key</span>
        </button>
      </div>

      {/* Security Tip */}
      <div className="p-4 rounded-2xl bg-[#F6FAF3] border border-[#DEE8DB] mb-6 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700">
          <strong className="font-bold text-slate-900 block mb-0.5">How to use your API keys:</strong>
          Include the key in your request headers as <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-[#0F241D]">Authorization: Bearer YOUR_API_KEY</code>. Use <em>Read-Only</em> tokens on public web apps.
        </div>
      </div>

      {/* Keys List */}
      <div className="space-y-3">
        {keys.map((key) => {
          const isVisible = visibleKeyId === key.id;
          const displayToken = isVisible
            ? key.tokenSecret
            : `${key.tokenSecret.slice(0, 10)}••••••••••••••••••••••`;

          return (
            <div
              key={key.id}
              className={`p-4 rounded-2xl border transition-all ${
                key.status === 'Revoked'
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#0F241D]">{key.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      key.role === 'Read-Only'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-purple-50 text-purple-800 border border-purple-200'
                    }`}
                  >
                    {key.role}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      key.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {key.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Created {key.created}</span>
                  <span>•</span>
                  <span>Last used {key.lastUsed}</span>
                </div>
              </div>

              {/* Token Bar */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 bg-[#FAFBF9] border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs text-slate-800 flex items-center justify-between">
                  <span className="truncate">{displayToken}</span>
                  <button
                    onClick={() => setVisibleKeyId(isVisible ? null : key.id)}
                    className="text-slate-400 hover:text-slate-700 ml-2"
                    title={isVisible ? 'Hide Key' : 'Reveal Key'}
                  >
                    {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  onClick={() => handleCopy(key.id, key.tokenSecret)}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                >
                  {copiedId === key.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {key.status === 'Active' && (
                  <button
                    onClick={() => handleRevokeKey(key.id)}
                    className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-colors"
                    title="Revoke Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Generate New Key */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F241D]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-[#0F241D]">
                Generate New API Key
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Name / Purpose
                </label>
                <input
                  type="text"
                  placeholder="e.g. Staging Server, Mobile App, CI/CD"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Access Permissions
                </label>
                <select
                  value={newKeyRole}
                  onChange={(e) => setNewKeyRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0F241D]"
                >
                  <option value="Read-Only">Read-Only (Recommended for web frontends)</option>
                  <option value="Read & Write">Read & Write (Content editing)</option>
                  <option value="Full Admin">Full Admin (Schema & Settings)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newKeyName.trim()}
                  className="px-5 py-2.5 bg-[#0F241D] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B8F256]" />
                  <span>Create Key</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
