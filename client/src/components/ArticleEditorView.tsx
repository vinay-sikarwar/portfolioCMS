import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Check,
  Globe,
  Upload,
  Link2,
  Trash2,
  Eye,
  Edit3,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Sparkles,
  Calendar,
  Tag,
  Clock,
  FileText,
} from "lucide-react";
import { SingleImageUploader } from "./SingleImageUploader";

export interface ArticleItemData {
  id: string;
  title: string;
  slug?: string;
  coverImage?: string;
  content?: string;
  summary?: string;
  category?: string;
  status: "Live" | "Draft" | "Updated";
  author?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface ArticleEditorViewProps {
  sectionName: string;
  singularName: string;
  sectionSlug: string;
  initialItem?: ArticleItemData | null;
  onSave: (data: ArticleItemData, status: "Draft" | "Live") => Promise<void> | void;
  onCancel: () => void;
  currentUser: { name: string; email: string };
}

export const ArticleEditorView: React.FC<ArticleEditorViewProps> = ({
  sectionName,
  singularName,
  sectionSlug,
  initialItem,
  onSave,
  onCancel,
  currentUser,
}) => {
  const [title, setTitle] = useState(initialItem?.title || "");
  const [slug, setSlug] = useState(initialItem?.slug || "");
  const [slugLocked, setSlugLocked] = useState(!!initialItem?.slug);
  const [status, setStatus] = useState<"Draft" | "Live">(
    initialItem?.status === "Live" ? "Live" : "Draft"
  );
  const [category, setCategory] = useState(initialItem?.category || "General");
  const [summary, setSummary] = useState(initialItem?.summary || "");
  const [coverImage, setCoverImage] = useState(
    initialItem?.coverImage || initialItem?.image || ""
  );
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [content, setContent] = useState(
    initialItem?.content || initialItem?.body || ""
  );
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate slug from title if not manually customized
  useEffect(() => {
    if (!slugLocked && title) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  }, [title, slugLocked]);

  // Handle local image file upload (converts to DataURL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCoverImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Insert formatting at cursor in textarea
  const insertFormatting = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const selectedText = currentVal.substring(start, end) || placeholder;
    const replacement = `${before}${selectedText}${after}`;

    const nextVal =
      currentVal.substring(0, start) + replacement + currentVal.substring(end);
    setContent(nextVal);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // Toolbar actions
  const applyHeading = (level: 1 | 2 | 3) => {
    const prefix = "#".repeat(level) + " ";
    insertFormatting(`\n${prefix}`, "\n", `Heading ${level}`);
  };

  const applyBold = () => insertFormatting("**", "**", "bold text");
  const applyItalic = () => insertFormatting("*", "*", "italic text");
  const applyUnderline = () => insertFormatting("<u>", "</u>", "underlined text");
  const applyStrikethrough = () => insertFormatting("~~", "~~", "strikethrough");
  const applyQuote = () => insertFormatting("\n> ", "\n", "Quote text here");
  const applyCodeBlock = () => insertFormatting("\n```javascript\n", "\n```\n", "// your code here");
  const applyBulletList = () => insertFormatting("\n- ", "\n- Item 2\n- Item 3\n", "Item 1");
  const applyNumberedList = () => insertFormatting("\n1. ", "\n2. Item 2\n3. Item 3\n", "Item 1");
  const applyDivider = () => insertFormatting("\n\n---\n\n", "");

  const applyLink = () => {
    const url = prompt("Enter URL (e.g. https://example.com):");
    if (!url) return;
    insertFormatting("[", `](${url})`, "link text");
  };

  // Metrics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Save handler
  const handleSaveAction = async (targetStatus: "Draft" | "Live") => {
    if (!title.trim()) {
      alert(`Please enter a title for this ${singularName.toLowerCase()}.`);
      return;
    }

    setIsSaving(true);
    const itemPayload: ArticleItemData = {
      id: initialItem?.id || `${sectionSlug}_${Date.now()}`,
      title: title.trim(),
      slug: slug.trim() || undefined,
      coverImage: coverImage || undefined,
      image: coverImage || undefined,
      content,
      body: content, // compatibility with body
      summary: summary.trim(),
      category: category.trim() || "General",
      status: targetStatus,
      author: initialItem?.author || currentUser.name,
      updatedAt: "Just now",
    };

    try {
      await onSave(itemPayload, targetStatus);
      setStatus(targetStatus);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } finally {
      setIsSaving(false);
    }
  };

  // Simple Markdown renderer for Preview mode
  const renderMarkdownPreview = (text: string) => {
    if (!text.trim()) {
      return (
        <p className="text-slate-400 italic text-sm">
          No content written yet. Switch to the <strong>Write</strong> tab and start authoring.
        </p>
      );
    }

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headings
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-lg font-bold text-[#0F241D] mt-6 mb-2">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-xl font-extrabold text-[#0F241D] mt-8 mb-3 border-b border-slate-100 pb-2">
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={idx} className="text-2xl font-black text-[#0F241D] mt-10 mb-4">
            {line.replace("# ", "")}
          </h1>
        );
      }
      // Blockquote
      if (line.startsWith("> ")) {
        return (
          <blockquote
            key={idx}
            className="border-l-4 border-[#B8F256] bg-[#F5F9F2] pl-4 py-2 italic text-slate-700 my-4 rounded-r-lg text-sm"
          >
            {line.replace("> ", "")}
          </blockquote>
        );
      }
      // Divider
      if (line.trim() === "---") {
        return <hr key={idx} className="my-6 border-slate-200" />;
      }
      // List item
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={idx} className="ml-6 list-disc text-slate-700 my-1 text-sm">
            {line.substring(2)}
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-4" />;
      }
      // Paragraph
      return (
        <p key={idx} className="text-slate-700 leading-relaxed my-2 text-sm">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBF9] overflow-hidden">
      {/* 1. TOP AUTHORING BAR */}
      <header className="min-h-16 py-2 sm:py-0 border-b border-[#E3EAE0] bg-white px-3 sm:px-6 md:px-8 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 shrink-0 z-10 shadow-2xs">
        {/* Left: Back & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F5EC] hover:bg-[#E3EFE0] text-[#0F241D] text-xs font-bold transition-all shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {sectionName}</span>
          </button>
          <span className="text-slate-300 font-light">/</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {singularName} Editor
            </span>
            {/* Status Indicator Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                status === "Live"
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status === "Live" ? "bg-emerald-600 animate-pulse" : "bg-amber-600"
                }`}
              />
              <span>{status}</span>
            </span>
          </div>
        </div>

        {/* Right: Status Actions & Publish Controls */}
        <div className="flex items-center gap-2.5">
          {lastSaved && (
            <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">
              Saved at {lastSaved}
            </span>
          )}

          {/* Save as Draft Button */}
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveAction("Draft")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
              status === "Draft"
                ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300"
                : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{isSaving && status === "Draft" ? "Saving..." : "Save as Draft"}</span>
          </button>

          {/* Publish (Live) Button */}
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveAction("Live")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#0F241D] bg-[#B8F256] hover:bg-[#a9eb42] active:scale-95 transition-all flex items-center gap-1.5 shadow-sm border border-[#a2e838]"
          >
            <Globe className="w-3.5 h-3.5 text-[#0F241D]" />
            <span>{isSaving && status === "Live" ? "Publishing..." : "Publish Live"}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN SCROLLABLE EDITOR WORKSPACE */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* A. COVER IMAGE CARD (Allows 1 image with live preview & replace) */}
          <div className="bg-white rounded-3xl p-5 border border-[#E3EAE0] shadow-sm">
            <SingleImageUploader
              value={coverImage}
              onChange={(val) => setCoverImage(val)}
              label={`Featured Cover Image for this ${singularName}`}
              helperText={`Upload at most one cover photo or paste an image URL. Auto-compressed to WebP for high performance.`}
            />
          </div>

          {/* B. ARTICLE TITLE & METADATA */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E3EAE0] shadow-sm space-y-5">
            {/* Title Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {singularName} Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={`Enter ${singularName.toLowerCase()} title...`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl md:text-3xl font-black text-[#0F241D] placeholder:text-slate-300 focus:outline-none tracking-tight pb-2 border-b border-slate-200 focus:border-[#0F241D] transition-colors"
              />
            </div>

            {/* URL Slug & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  API Slug Endpoint
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-[#F8FAF6] px-3 py-2 text-xs font-mono text-slate-600 focus-within:border-[#0F241D] focus-within:bg-white">
                  <span className="text-slate-400 mr-1 select-none">/{sectionSlug}/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugLocked(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="my-article-slug"
                    className="flex-1 bg-transparent border-none outline-none text-[#0F241D] font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category / Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineering, Product, Notes"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                />
              </div>
            </div>

            {/* Excerpt / Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Excerpt / Short Summary
              </label>
              <textarea
                rows={2}
                placeholder={`Brief summary of this ${singularName.toLowerCase()} for card views, previews, and meta description...`}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
              />
            </div>
          </div>

          {/* C. RICH TEXT CONTENT & STYLES EDITOR */}
          <div className="bg-white rounded-3xl border border-[#E3EAE0] shadow-sm overflow-hidden flex flex-col">
            {/* Tab switch (Write vs Preview) & Toolbar */}
            <div className="border-b border-[#E3EAE0] bg-[#FAFBF9] p-3 flex flex-wrap items-center justify-between gap-3">
              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-[#EEF5EB] p-1 rounded-xl border border-[#DCE8D8]">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === "write"
                      ? "bg-[#0F241D] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Write Content</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === "preview"
                      ? "bg-[#0F241D] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>

              {/* Formatting Toolbar (Only in Write tab) */}
              {activeTab === "write" && (
                <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 text-slate-700">
                  {/* Headings */}
                  <div className="flex items-center border-r border-slate-200 pr-1.5 mr-1 gap-0.5">
                    <button
                      type="button"
                      onClick={() => applyHeading(1)}
                      title="Heading 1"
                      className="p-1.5 hover:bg-slate-200 rounded text-xs font-bold transition-colors"
                    >
                      <Heading1 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHeading(2)}
                      title="Heading 2"
                      className="p-1.5 hover:bg-slate-200 rounded text-xs font-bold transition-colors"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHeading(3)}
                      title="Heading 3"
                      className="p-1.5 hover:bg-slate-200 rounded text-xs font-bold transition-colors"
                    >
                      <Heading3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Inline text styles */}
                  <div className="flex items-center border-r border-slate-200 pr-1.5 mr-1 gap-0.5">
                    <button
                      type="button"
                      onClick={applyBold}
                      title="Bold"
                      className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Bold className="w-3.5 h-3.5 font-bold" />
                    </button>
                    <button
                      type="button"
                      onClick={applyItalic}
                      title="Italic"
                      className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={applyUnderline}
                      title="Underline"
                      className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={applyStrikethrough}
                      title="Strikethrough"
                      className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Blocks & Lists */}
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={applyBulletList}
                      title="Bullet List"
                      className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={applyNumberedList}
                      title="Numbered List"
                      className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={applyQuote}
                      title="Blockquote"
                      className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={applyCodeBlock}
                      title="Code Block"
                      className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={applyLink}
                      title="Insert Link"
                      className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={applyDivider}
                      title="Horizontal Line"
                      className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Editor Canvas */}
            <div className="p-6 md:p-8 min-h-[380px]">
              {activeTab === "write" ? (
                <textarea
                  ref={textareaRef}
                  rows={16}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Write your ${singularName.toLowerCase()} content here...\n\nUse the toolbar above or Markdown shortcuts:\n# Heading 1\n## Heading 2\n**Bold Text**\n- Bullet points\n> Blockquotes\n\`\`\`code\`\`\``}
                  className="w-full h-full bg-transparent border-none outline-none text-[#0F241D] text-sm md:text-base leading-relaxed placeholder:text-slate-300 font-sans resize-y"
                />
              ) : (
                <div className="prose max-w-none">
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt={title || "Cover"}
                      className="w-full h-64 object-cover rounded-2xl mb-6 shadow-sm"
                    />
                  )}
                  <h1 className="text-3xl font-black text-[#0F241D] mb-2 tracking-tight">
                    {title || "Untitled Article"}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-6 pb-4 border-b border-slate-100">
                    <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {category}
                    </span>
                    <span>By {initialItem?.author || currentUser.name}</span>
                    <span>•</span>
                    <span>{readingTime} min read</span>
                  </div>
                  {renderMarkdownPreview(content)}
                </div>
              )}
            </div>

            {/* Bottom Meta Bar */}
            <div className="border-t border-slate-100 bg-[#FAFBF9] px-6 py-3 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span>
                  Words: <strong className="text-slate-700">{wordCount}</strong>
                </span>
                <span>
                  Characters: <strong className="text-slate-700">{charCount}</strong>
                </span>
                <span>
                  Est. Read: <strong className="text-slate-700">{readingTime} min</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Ready for API delivery</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* POPUP: Paste Image URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F241D]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-[#0F241D] mb-2">
              Paste Cover Image URL
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter any publicly accessible image link (Unsplash, Cloudinary, AWS S3, etc.).
            </p>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D] mb-4"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowUrlModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (imageUrlInput.trim()) {
                    setCoverImage(imageUrlInput.trim());
                    setImageUrlInput("");
                  }
                  setShowUrlModal(false);
                }}
                className="px-4 py-2 bg-[#0F241D] text-white rounded-xl text-xs font-bold hover:bg-[#1a3f32]"
              >
                Set Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleEditorView;
