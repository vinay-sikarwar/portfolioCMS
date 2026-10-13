import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  Folder,
  Code,
  Users,
  Settings,
  SlidersHorizontal,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  Link2,
  List as ListIcon,
  ListOrdered,
  Plus,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Search,
  Bell,
  Trash2,
  Edit3,
  ShoppingBag,
  Home,
  CheckCircle2,
  Sparkles,
  Layers,
  Filter,
  AlertCircle,
  X,
  FileJson,
  Download,
  Terminal,
  CornerDownRight,
  PlusCircle,
  Tag,
  Star,
  Award,
  Globe,
  HelpCircle,
  Package,
  Key,
  BookOpen,
  Menu,
} from "lucide-react";
import { ApiEndpointsView } from "./api/ApiEndpointsView";
import { ApiKeysView } from "./api/ApiKeysView";
import { ApiGuideView } from "./api/ApiGuideView";
import { BrandLogo } from "./BrandLogo";
import { ArticleEditorView, ArticleItemData } from "./ArticleEditorView";
import { SingleImageUploader } from "./SingleImageUploader";
import { apiUrl, API_BASE_URL } from "../lib/api";

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "select"
  | "number"
  | "url"
  | "nested"
  | "image";

export interface SubFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "url" | "select";
  placeholder?: string;
  required?: boolean;
}

export interface FieldDefinition {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  isSystem?: boolean;
  subFields?: SubFieldDefinition[];
}

export interface ItemData {
  id: string;
  title: string;
  status: "Live" | "Draft" | "Updated";
  updatedAt: string;
  [key: string]: any;
}

export interface SectionDefinition {
  id: string;
  name: string;
  singularName: string;
  slug: string;
  icon:
    | "folder"
    | "file-text"
    | "shopping-bag"
    | "layers"
    | "sparkles"
    | "star"
    | "award"
    | "globe"
    | "help";
  description?: string;
  type?: "normal" | "editor"; // "normal" (modal form) | "editor" (full page article/rich text editor)
}

interface DashboardPageProps {
  currentUser: { name: string; email: string; apiSlug?: string; apiKey?: string };
  onLogout: () => void;
  onGoHome: () => void;
}

const INITIAL_SECTIONS: SectionDefinition[] = [
  {
    id: "projects",
    name: "Projects",
    singularName: "Project",
    slug: "projects",
    icon: "shopping-bag",
    type: "normal",
  },
  {
    id: "blog",
    name: "Blog Posts",
    singularName: "Blog Post",
    slug: "posts",
    icon: "file-text",
    type: "editor",
  },
  {
    id: "skills",
    name: "Skills",
    singularName: "Skill",
    slug: "skills",
    icon: "sparkles",
    type: "normal",
  },
];

const INITIAL_FIELDS_BY_SECTION: Record<string, FieldDefinition[]> = {
  projects: [
    {
      id: "f_title",
      key: "title",
      label: "Project Title",
      type: "text",
      required: true,
      isSystem: true,
      placeholder: "e.g. Acme Redesign",
    },
    {
      id: "f_category",
      key: "category",
      label: "Category",
      type: "text",
      required: true,
      placeholder: "e.g. E-commerce, Mobile",
    },
    {
      id: "f_status",
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      isSystem: true,
      options: ["Live", "Draft", "Updated"],
    },
    {
      id: "f_summary",
      key: "summary",
      label: "Summary / Description",
      type: "textarea",
      placeholder: "Short overview of the project...",
    },
    {
      id: "f_image",
      key: "image",
      label: "Project Image / Thumbnail",
      type: "image",
      placeholder: "Upload or paste project photo",
    },
    {
      id: "f_client_nested",
      key: "client_details",
      label: "Client Details",
      type: "nested",
      subFields: [
        {
          id: "sf_c_name",
          key: "company",
          label: "Company Name",
          type: "text",
          placeholder: "e.g. Acme Corp",
        },
        {
          id: "sf_c_rep",
          key: "contact_person",
          label: "Contact Person",
          type: "text",
          placeholder: "e.g. Jane Smith",
        },
        {
          id: "sf_c_url",
          key: "website",
          label: "Website URL",
          type: "url",
          placeholder: "https://acmecorp.com",
        },
      ],
    },
    {
      id: "f_link",
      key: "link",
      label: "Project URL",
      type: "url",
      placeholder: "https://example.com",
    },
  ],
  skills: [
    {
      id: "f_s_title",
      key: "title",
      label: "Skill / Tech Name",
      type: "text",
      required: true,
      isSystem: true,
      placeholder: "e.g. React, Node.js, GraphQL",
    },
    {
      id: "f_s_category",
      key: "category",
      label: "Category",
      type: "text",
      required: true,
      placeholder: "e.g. Frontend, Backend, Tools",
    },
    {
      id: "f_s_status",
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      isSystem: true,
      options: ["Live", "Draft", "Updated"],
    },
    {
      id: "f_s_image",
      key: "image",
      label: "Skill Logo / Photo",
      type: "image",
      placeholder: "Upload skill logo or photo",
    },
    {
      id: "f_s_summary",
      key: "summary",
      label: "Description / Proficiency",
      type: "textarea",
      placeholder: "Years of experience, key achievements, or stack notes...",
    },
  ],
  blog: [
    {
      id: "f_b_title",
      key: "title",
      label: "Post Title",
      type: "text",
      required: true,
      isSystem: true,
      placeholder: "e.g. Next-Gen Portfolios",
    },
    {
      id: "f_b_slug",
      key: "slug",
      label: "URL Slug",
      type: "text",
      required: true,
      isSystem: true,
      placeholder: "next-gen-portfolios",
    },
    {
      id: "f_b_status",
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      isSystem: true,
      options: ["Live", "Draft", "Updated"],
    },
    {
      id: "f_b_author",
      key: "author",
      label: "Author Name",
      type: "text",
      required: true,
      placeholder: "Author",
    },
    {
      id: "f_b_tags",
      key: "tags",
      label: "Tags",
      type: "text",
      placeholder: "Frontend, Architecture, Speed",
    },
    {
      id: "f_b_excerpt",
      key: "excerpt",
      label: "Excerpt",
      type: "textarea",
      placeholder: "Brief summary for cards and search...",
    },
    {
      id: "f_b_seo_nested",
      key: "seo",
      label: "SEO Metadata",
      type: "nested",
      subFields: [
        {
          id: "sf_seo_title",
          key: "meta_title",
          label: "Meta Title",
          type: "text",
          placeholder: "Custom page title for Google",
        },
        {
          id: "sf_seo_desc",
          key: "meta_desc",
          label: "Meta Description",
          type: "textarea",
          placeholder: "Brief description for search snippets",
        },
      ],
    },
    {
      id: "f_b_body",
      key: "body",
      label: "Article Body",
      type: "richtext",
      required: true,
      placeholder: "Write your story...",
    },
  ],
  docs: [
    {
      id: "f_d_title",
      key: "title",
      label: "Doc Title",
      type: "text",
      required: true,
      isSystem: true,
      placeholder: "e.g. Authentication Guide",
    },
    {
      id: "f_d_category",
      key: "category",
      label: "Category",
      type: "text",
      required: true,
      placeholder: "Guides",
    },
    {
      id: "f_d_status",
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      isSystem: true,
      options: ["Live", "Draft", "Updated"],
    },
    {
      id: "f_d_content",
      key: "summary",
      label: "Documentation Content",
      type: "textarea",
      placeholder: "Markdown documentation...",
    },
  ],
  media: [
    {
      id: "f_m_title",
      key: "title",
      label: "Asset Name",
      type: "text",
      required: true,
      isSystem: true,
      placeholder: "e.g. Hero Banner 4K",
    },
    {
      id: "f_m_type",
      key: "category",
      label: "Asset Type",
      type: "text",
      required: true,
      placeholder: "Image / PNG",
    },
    {
      id: "f_m_status",
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      isSystem: true,
      options: ["Live", "Draft", "Updated"],
    },
    {
      id: "f_m_url",
      key: "link",
      label: "CDN URL",
      type: "url",
      placeholder: "https://images.portfoliohq.com/hero.png",
    },
  ],
};
INITIAL_FIELDS_BY_SECTION.posts = INITIAL_FIELDS_BY_SECTION.blog;

const INITIAL_ITEMS_BY_SECTION: Record<string, ItemData[]> = {};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  onLogout,
  onGoHome,
}) => {
  // Navigation & Sections (API Endpoints active by default as requested)
  const [activeNav, setActiveNav] = useState<
    "content" | "api" | "apikeys" | "apiguide" | "team" | "settings"
  >("api");

  const userStorageSuffix = currentUser?.email
    ? `_${encodeURIComponent(currentUser.email)}`
    : "";

  const [sections, setSections] = useState<SectionDefinition[]>(() => {
    try {
      const key = `portfoliohq_sections${userStorageSuffix}`;
      const saved = localStorage.getItem(key) || localStorage.getItem("portfoliohq_sections");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load sections from storage:", e);
    }
    return INITIAL_SECTIONS;
  });

  const [activeSectionId, setActiveSectionId] = useState<string>("projects");

  // Multi-section data and schema fields with persistent storage
  const [itemsBySection, setItemsBySection] = useState<
    Record<string, ItemData[]>
  >(() => {
    try {
      const key = `portfoliohq_items${userStorageSuffix}`;
      const saved = localStorage.getItem(key) || localStorage.getItem("portfoliohq_items");
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned: Record<string, ItemData[]> = {};
        for (const [secKey, items] of Object.entries(parsed)) {
          if (Array.isArray(items)) {
            cleaned[secKey] = items.filter(
              (i: any) =>
                !i.id?.startsWith("proj_") &&
                !i.id?.startsWith("blog_") &&
                !i.id?.startsWith("doc_") &&
                !i.id?.startsWith("med_")
            );
          }
        }
        return cleaned;
      }
    } catch (e) {
      console.error("Failed to load items from storage:", e);
    }
    return INITIAL_ITEMS_BY_SECTION;
  });

  const [fieldsBySection, setFieldsBySection] = useState<
    Record<string, FieldDefinition[]>
  >(() => {
    try {
      const key = `portfoliohq_fields${userStorageSuffix}`;
      const saved = localStorage.getItem(key) || localStorage.getItem("portfoliohq_fields");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load fields from storage:", e);
    }
    return INITIAL_FIELDS_BY_SECTION;
  });

  // Storage persistence helpers
  const persistItems = (newItems: Record<string, ItemData[]>) => {
    try {
      const key = `portfoliohq_items${userStorageSuffix}`;
      localStorage.setItem(key, JSON.stringify(newItems));
      localStorage.setItem("portfoliohq_items", JSON.stringify(newItems));
    } catch (e) {
      console.error("Failed to save items to storage:", e);
    }
  };

  const persistSections = (newSecs: SectionDefinition[]) => {
    try {
      const key = `portfoliohq_sections${userStorageSuffix}`;
      localStorage.setItem(key, JSON.stringify(newSecs));
      localStorage.setItem("portfoliohq_sections", JSON.stringify(newSecs));
    } catch (e) {
      console.error("Failed to save sections to storage:", e);
    }
  };

  const persistFields = (newFields: Record<string, FieldDefinition[]>) => {
    try {
      const key = `portfoliohq_fields${userStorageSuffix}`;
      localStorage.setItem(key, JSON.stringify(newFields));
      localStorage.setItem("portfoliohq_fields", JSON.stringify(newFields));
    } catch (e) {
      console.error("Failed to save fields to storage:", e);
    }
  };

  // Sync to localStorage whenever state changes
  useEffect(() => {
    persistItems(itemsBySection);
  }, [itemsBySection, userStorageSuffix]);

  useEffect(() => {
    persistSections(sections);
  }, [sections, userStorageSuffix]);

  useEffect(() => {
    persistFields(fieldsBySection);
  }, [fieldsBySection, userStorageSuffix]);

  // Synchronize with database via REST endpoints if user has apiSlug
  useEffect(() => {
    if (!currentUser?.apiSlug) return;
    const token = localStorage.getItem("portfoliohq_token");
    if (!token) return;

    const syncFromDatabase = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch user sections from Neon DB
        const secRes = await fetch(apiUrl(`/api/v1/${currentUser.apiSlug}/sections`), { headers });
        let activeSectionsList: SectionDefinition[] = sections;
        if (secRes.ok) {
          const secJson = await secRes.json();
          if (Array.isArray(secJson.data) && secJson.data.length > 0) {
            const dbSecs: SectionDefinition[] = secJson.data.map((s: any) => ({
              id: s.id,
              name: s.name,
              singularName: s.singularName,
              slug: s.slug,
              icon: s.icon || "layers",
              description: s.description || "",
            }));

            // Sync schema fields if present
            secJson.data.forEach((s: any) => {
              if (s.fields) {
                try {
                  const parsed = typeof s.fields === "string" ? JSON.parse(s.fields) : s.fields;
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    setFieldsBySection((prev) => {
                      const next = {
                        ...prev,
                        [s.id]: parsed,
                        [s.slug]: parsed,
                        ...(s.slug === "posts" ? { blog: parsed } : {}),
                      };
                      persistFields(next);
                      return next;
                    });
                  }
                } catch {}
              }
            });

            activeSectionsList = dbSecs;
            setSections(dbSecs);
            persistSections(dbSecs);
          }
        }

        const newItemsMap: Record<string, ItemData[]> = {};

        // 2. Load items dynamically for ALL sections from Neon DB
        for (const sec of activeSectionsList) {
          try {
            const customRes = await fetch(apiUrl(`/api/v1/${currentUser.apiSlug}/${sec.slug}`), { headers });
            if (customRes.ok) {
              const customData = await customRes.json();
              if (Array.isArray(customData.data)) {
                newItemsMap[sec.id] = customData.data;
                newItemsMap[sec.slug] = customData.data;
              }
            }
          } catch (e) {
            console.warn(`Failed to fetch items for ${sec.slug}:`, e);
          }
        }

        setItemsBySection(newItemsMap);
        persistItems(newItemsMap);
      } catch (err) {
        console.warn("Notice: Backend DB sync skipped:", err);
      }
    };

    syncFromDatabase();
  }, [currentUser?.apiSlug]);

  // Workspace view state: 'list' (default), 'editor' (legacy structured), or 'article-editor' (full-page rich text)
  const [workspaceMode, setWorkspaceMode] = useState<"list" | "editor" | "article-editor">("list");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [editingArticleItem, setEditingArticleItem] = useState<ArticleItemData | null>(null);

  // Filter state: 'all' | 'Live' | 'Draft' | 'Updated' | 'json'
  // (REQUEST: "add 'json' section near 'updated' button to see the data in json format")
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Live" | "Draft" | "Updated" | "json"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mobile drawer & tab state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"content" | "api-info">("content");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditFieldsModalOpen, setIsEditFieldsModalOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);

  // New Section form state (REQUEST: "+ icon in content and assets line to allow user to add section they want")
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionSingular, setNewSectionSingular] = useState("");
  const [newSectionType, setNewSectionType] = useState<"normal" | "editor">("normal");
  const [newSectionIcon, setNewSectionIcon] =
    useState<SectionDefinition["icon"]>("layers");
  const [newSectionDescription, setNewSectionDescription] = useState("");

  // Edit Fields state (REQUEST: "allow to add nested fields if user want in edit fields")
  const [editingFieldsList, setEditingFieldsList] = useState<FieldDefinition[]>(
    []
  );
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  // Sub-fields builder inside nested field creation
  const [nestedSubFields, setNestedSubFields] = useState<SubFieldDefinition[]>(
    []
  );
  const [tempSubFieldLabel, setTempSubFieldLabel] = useState("");
  const [tempSubFieldType, setTempSubFieldType] =
    useState<SubFieldDefinition["type"]>("text");

  // Form state for creating a new item (STRICTLY DATA INPUT - NO SCHEMA CONTROLS)
  const [newItemFormData, setNewItemFormData] = useState<Record<string, any>>(
    {}
  );

  // Editor formatting & toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeFormatting, setActiveFormatting] = useState<string[]>([]);
  const [editorActiveView, setEditorActiveView] = useState<"editor" | "json">(
    "editor"
  );
  const apiBaseUrl = API_BASE_URL || window.location.origin;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Active section helper
  const activeSection =
    sections.find((s) => s.id === activeSectionId || s.slug === activeSectionId) || sections[0];
  const currentItems =
    itemsBySection[activeSectionId] ||
    itemsBySection[activeSection?.slug] ||
    itemsBySection[activeSection?.id] ||
    [];
  const currentFields: FieldDefinition[] =
    (fieldsBySection[activeSectionId] && fieldsBySection[activeSectionId].length > 0
      ? fieldsBySection[activeSectionId]
      : undefined) ||
    (fieldsBySection[activeSection?.slug] && fieldsBySection[activeSection?.slug].length > 0
      ? fieldsBySection[activeSection?.slug]
      : undefined) ||
    (fieldsBySection[activeSection?.id] && fieldsBySection[activeSection?.id].length > 0
      ? fieldsBySection[activeSection?.id]
      : undefined) ||
    INITIAL_FIELDS_BY_SECTION[activeSection?.slug] ||
    INITIAL_FIELDS_BY_SECTION[activeSection?.id] ||
    INITIAL_FIELDS_BY_SECTION[activeSectionId] ||
    [];

  // Update item in active section state and persist reliably
  const updateActiveItem = (updatedItem: ItemData) => {
    setItemsBySection((prev) => {
      const currentList =
        prev[activeSectionId] ||
        prev[activeSection?.slug] ||
        prev[activeSection?.id] ||
        [];
      const updatedList = currentList.map((i) =>
        i.id === updatedItem.id ? updatedItem : i
      );
      const next = {
        ...prev,
        [activeSectionId]: updatedList,
        [activeSection.slug]: updatedList,
        ...(activeSection.id ? { [activeSection.id]: updatedList } : {}),
      };
      persistItems(next);
      return next;
    });
  };

  // Active item in editor
  const activeItem =
    currentItems.find((i) => i.id === selectedItemId) ||
    currentItems[0] ||
    null;

  // Filter items
  const filteredItems = currentItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category &&
        item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.summary &&
        item.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags &&
        item.tags.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.author &&
        item.author.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === "json") return matchesSearch; // JSON view shows whatever matches search
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Render section icon
  const renderSectionIcon = (
    iconName: SectionDefinition["icon"],
    className: string = "w-4 h-4"
  ) => {
    switch (iconName) {
      case "shopping-bag":
        return <ShoppingBag className={className} />;
      case "file-text":
        return <FileText className={className} />;
      case "folder":
        return <Folder className={className} />;
      case "layers":
        return <Layers className={className} />;
      case "sparkles":
        return <Sparkles className={className} />;
      case "star":
        return <Star className={className} />;
      case "award":
        return <Award className={className} />;
      case "globe":
        return <Globe className={className} />;
      case "help":
        return <HelpCircle className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  // -------------------------------------------------------------
  // ACTION: Add New Section (from "+ icon in content and assets line")
  // -------------------------------------------------------------
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) {
      showToast("Please enter a section name.");
      return;
    }

    const cleanSlug = newSectionName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-");
    let newId = `sec_${Date.now()}`;
    const singular =
      newSectionSingular.trim() || newSectionName.trim().replace(/s$/, "");
    const desc =
      newSectionDescription.trim() ||
      `Manage ${newSectionName.trim()} content`;

    // Create default schema fields for this new section based on type
    const defaultFields: FieldDefinition[] =
      newSectionType === "editor"
        ? [
            {
              id: `f_${cleanSlug}_title`,
              key: "title",
              label: `${singular} Title`,
              type: "text",
              required: true,
              isSystem: true,
              placeholder: `Enter ${singular.toLowerCase()} title...`,
            },
            {
              id: `f_${cleanSlug}_slug`,
              key: "slug",
              label: "URL Slug",
              type: "text",
              placeholder: "article-slug",
            },
            {
              id: `f_${cleanSlug}_cover`,
              key: "coverImage",
              label: "Cover Image",
              type: "url",
              placeholder: "https://example.com/cover.jpg",
            },
            {
              id: `f_${cleanSlug}_content`,
              key: "content",
              label: "Rich Text Content",
              type: "richtext",
              placeholder: "Write article content...",
            },
            {
              id: `f_${cleanSlug}_summary`,
              key: "summary",
              label: "Summary / Excerpt",
              type: "textarea",
              placeholder: "Brief summary...",
            },
            {
              id: `f_${cleanSlug}_cat`,
              key: "category",
              label: "Category / Tag",
              type: "text",
              placeholder: "e.g. General, Featured",
            },
            {
              id: `f_${cleanSlug}_status`,
              key: "status",
              label: "Status",
              type: "select",
              required: true,
              isSystem: true,
              options: ["Live", "Draft"],
            },
          ]
        : [
            {
              id: `f_${cleanSlug}_title`,
              key: "title",
              label: `${singular} Title`,
              type: "text",
              required: true,
              isSystem: true,
              placeholder: `Enter ${singular.toLowerCase()} title...`,
            },
            {
              id: `f_${cleanSlug}_cat`,
              key: "category",
              label: "Category / Tag",
              type: "text",
              required: true,
              placeholder: "e.g. General, Featured",
            },
            {
              id: `f_${cleanSlug}_status`,
              key: "status",
              label: "Status",
              type: "select",
              required: true,
              isSystem: true,
              options: ["Live", "Draft", "Updated"],
            },
            {
              id: `f_${cleanSlug}_summary`,
              key: "summary",
              label: "Description",
              type: "textarea",
              placeholder: "Write a description...",
            },
          ];

    // Persist new section to Neon DB
    const token = localStorage.getItem("portfoliohq_token");
    if (currentUser?.apiSlug && token) {
      try {
        const res = await fetch(apiUrl(`/api/v1/${currentUser.apiSlug}/sections`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newSectionName.trim(),
            singularName: singular,
            slug: cleanSlug,
            icon: newSectionIcon,
            description: desc,
            fields: defaultFields,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.id) {
            newId = json.data.id;
          }
        }
      } catch (err) {
        console.error("Failed to persist section to Neon DB:", err);
      }
    }

    const newSec: SectionDefinition = {
      id: newId,
      name: newSectionName.trim(),
      singularName: singular,
      slug: cleanSlug,
      icon: newSectionIcon,
      description: desc,
      type: newSectionType,
    };

    setSections((prev) => {
      const filtered = prev.filter((s) => s.slug !== cleanSlug && s.id !== newId);
      const next = [...filtered, newSec];
      persistSections(next);
      return next;
    });

    setFieldsBySection((prev) => {
      const next = {
        ...prev,
        [newId]: defaultFields,
        [cleanSlug]: defaultFields,
      };
      persistFields(next);
      return next;
    });

    // Zero dummy data: clean empty section ready for user data
    setItemsBySection((prev) => {
      const next = {
        ...prev,
        [newId]: [],
        [cleanSlug]: [],
      };
      persistItems(next);
      return next;
    });

    setActiveSectionId(newId);
    setWorkspaceMode("list");
    setIsAddSectionModalOpen(false);
    setNewSectionName("");
    setNewSectionSingular("");
    setNewSectionDescription("");
    setNewSectionType("normal");

    showToast(`Created new ${newSectionType === "editor" ? "Text Editor" : "Normal"} collection "${newSec.name}"!`);
  };

  // -------------------------------------------------------------
  // ACTION: Full-Page Article / Rich Text Editor Handlers
  // -------------------------------------------------------------
  const handleOpenArticleEditor = (item?: ItemData | null) => {
    setEditingArticleItem(item || null);
    setWorkspaceMode("article-editor");
  };

  const handleSaveArticle = async (
    itemData: ArticleItemData,
    targetStatus: "Draft" | "Live"
  ) => {
    const isNew = !currentItems.some((i) => i.id === itemData.id);
    const token = localStorage.getItem("portfoliohq_token");
    let savedId = itemData.id;

    if (currentUser?.apiSlug && token) {
      try {
        const method = isNew ? "POST" : "PUT";
        const url = apiUrl(isNew
          ? `/api/v1/${currentUser.apiSlug}/${activeSection.slug}`
          : `/api/v1/${currentUser.apiSlug}/${activeSection.slug}/${itemData.id}`);

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: itemData.title,
            slug: itemData.slug,
            category: itemData.category || "General",
            status: targetStatus,
            summary: itemData.summary || "",
            image: itemData.image || itemData.coverImage || undefined,
            coverImage: itemData.coverImage || itemData.image || undefined,
            data: {
              ...itemData,
              image: itemData.image || itemData.coverImage || undefined,
              coverImage: itemData.coverImage || itemData.image || undefined,
              status: targetStatus,
            },
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data?.id) {
            savedId = json.data.id;
          }
        }
      } catch (err) {
        console.error("Backend error saving article to Neon DB:", err);
      }
    }

    const finalItem: ItemData = {
      ...itemData,
      id: savedId,
      status: targetStatus,
      updatedAt: "Just now",
    };

    setItemsBySection((prev) => {
      const currentList = prev[activeSectionId] || prev[activeSection.slug] || [];
      const updatedList = [finalItem, ...currentList.filter((i) => i.id !== finalItem.id)];
      const next = {
        ...prev,
        [activeSectionId]: updatedList,
        [activeSection.slug]: updatedList,
      };
      persistItems(next);
      return next;
    });

    setWorkspaceMode("list");
    setEditingArticleItem(null);
    showToast(
      targetStatus === "Draft"
        ? `Saved "${finalItem.title}" as Draft!`
        : `Published "${finalItem.title}" Live to API!`
    );
  };

  // -------------------------------------------------------------
  // ACTION: Open Add Item Modal (Clean data entry without schema controls)
  // -------------------------------------------------------------
  const handleOpenAddModal = () => {
    const initialData: Record<string, any> = {};
    currentFields.forEach((field) => {
      if (field.type === "nested") {
        initialData[field.key] = {};
        field.subFields?.forEach((sf) => {
          initialData[field.key][sf.key] = "";
        });
      } else if (field.key === "status") {
        initialData[field.key] = "Live";
      } else if (field.key === "author") {
        initialData[field.key] = currentUser.name;
      } else {
        initialData[field.key] = "";
      }
    });
    initialData.image = "";
    initialData.coverImage = "";
    setNewItemFormData(initialData);
    setIsAddModalOpen(true);
  };

  // Save new item
  const handleSaveNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemFormData.title?.trim()) {
      showToast("Please provide a title for the new item.");
      return;
    }

    const token = localStorage.getItem("portfoliohq_token");
    let createdItem: ItemData | null = null;

    if (currentUser?.apiSlug && token) {
      try {
        const imageVal = newItemFormData.image || newItemFormData.coverImage || undefined;
        const res = await fetch(apiUrl(`/api/v1/${currentUser.apiSlug}/${activeSection.slug}`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newItemFormData.title?.trim() || `Untitled ${activeSection.singularName}`,
            slug: newItemFormData.slug || undefined,
            category: newItemFormData.category || "General",
            status: newItemFormData.status || "Live",
            summary: newItemFormData.summary || "",
            image: imageVal,
            coverImage: imageVal,
            data: {
              ...newItemFormData,
              image: imageVal,
              coverImage: imageVal,
            },
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            createdItem = {
              id: json.data.id,
              title: json.data.title,
              slug: json.data.slug,
              category: json.data.category,
              status: json.data.status,
              summary: json.data.summary,
              updatedAt: "Just now",
              ...newItemFormData,
            };
          }
        }
      } catch (err) {
        console.error("Backend error saving item to Neon DB:", err);
      }
    }

    const newItem: ItemData = createdItem || {
      id: `${activeSection.slug}_${Date.now()}`,
      title: newItemFormData.title.trim(),
      status: (newItemFormData.status as any) || "Live",
      updatedAt: "Just now",
      ...newItemFormData,
    };

    setItemsBySection((prev) => {
      const currentList = prev[activeSectionId] || prev[activeSection.slug] || [];
      const updatedList = [newItem, ...currentList.filter((i) => i.id !== newItem.id)];
      const next = {
        ...prev,
        [activeSectionId]: updatedList,
        [activeSection.slug]: updatedList,
      };
      persistItems(next);
      return next;
    });

    setIsAddModalOpen(false);
    showToast(`Added ${activeSection.singularName}: "${newItem.title}"!`);
  };

  // -------------------------------------------------------------
  // ACTION: Edit Fields & Nested Fields Schema Builder
  // (REQUEST: "allow to add nested fields if user want in edit fields")
  // -------------------------------------------------------------
  const handleOpenEditFieldsModal = () => {
    setEditingFieldsList(JSON.parse(JSON.stringify(currentFields)));
    setNewFieldLabel("");
    setNewFieldType("text");
    setNewFieldRequired(false);
    setNestedSubFields([]);
    setTempSubFieldLabel("");
    setTempSubFieldType("text");
    setIsEditFieldsModalOpen(true);
  };

  // Add temporary sub-field to nested builder
  const handleAddTempSubField = () => {
    if (!tempSubFieldLabel.trim()) return;
    const subKey = tempSubFieldLabel
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "_");

    if (nestedSubFields.some((sf) => sf.key === subKey)) {
      showToast("A sub-field with this key already exists in this group.");
      return;
    }

    const newSubField: SubFieldDefinition = {
      id: `sf_${Date.now()}`,
      key: subKey,
      label: tempSubFieldLabel.trim(),
      type: tempSubFieldType,
      placeholder: `Enter ${tempSubFieldLabel.trim()}...`,
    };

    setNestedSubFields((prev) => [...prev, newSubField]);
    setTempSubFieldLabel("");
    setTempSubFieldType("text");
  };

  const handleRemoveTempSubField = (id: string) => {
    setNestedSubFields((prev) => prev.filter((sf) => sf.id !== id));
  };

  // Add field to schema list (support single or nested!)
  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) return;
    const key = newFieldLabel
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "_");

    if (editingFieldsList.some((f) => f.key === key)) {
      showToast("A field with a similar key already exists in this schema.");
      return;
    }

    const newField: FieldDefinition = {
      id: `field_${Date.now()}`,
      key,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      isSystem: false,
      placeholder: `Enter ${newFieldLabel.trim()}...`,
      subFields: newFieldType === "nested" ? [...nestedSubFields] : undefined,
    };

    setEditingFieldsList((prev) => [...prev, newField]);
    setNewFieldLabel("");
    setNewFieldType("text");
    setNewFieldRequired(false);
    setNestedSubFields([]);
    setTempSubFieldLabel("");
    showToast(`Added field "${newField.label}" to list`);
  };

  // Toggle required state on existing field
  const handleToggleFieldRequired = (id: string) => {
    setEditingFieldsList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  };

  // Delete field from schema list
  const handleDeleteField = (id: string) => {
    setEditingFieldsList((prev) => prev.filter((f) => f.id !== id));
  };

  // Add sub-field to an existing nested field directly in the list
  const handleAddSubFieldToExisting = (parentFieldId: string) => {
    const label = prompt(
      "Enter Sub-Field Label (e.g. Website, Twitter, Postal Code):"
    );
    if (!label || !label.trim()) return;
    const subKey = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "_");

    setEditingFieldsList((prev) =>
      prev.map((f) => {
        if (f.id !== parentFieldId) return f;
        const currentSubs = f.subFields || [];
        if (currentSubs.some((s) => s.key === subKey)) {
          alert("Sub-field with this name already exists.");
          return f;
        }
        return {
          ...f,
          subFields: [
            ...currentSubs,
            {
              id: `sf_${Date.now()}`,
              key: subKey,
              label: label.trim(),
              type: "text",
              placeholder: `Enter ${label.trim()}...`,
            },
          ],
        };
      })
    );
  };

  // Remove subfield from existing field
  const handleRemoveSubFieldFromExisting = (
    parentFieldId: string,
    subFieldId: string
  ) => {
    setEditingFieldsList((prev) =>
      prev.map((f) => {
        if (f.id !== parentFieldId) return f;
        return {
          ...f,
          subFields: (f.subFields || []).filter((sf) => sf.id !== subFieldId),
        };
      })
    );
  };

  // Save schema changes
  const handleSaveFieldsSchema = async () => {
    let fieldsToSave = [...editingFieldsList];

    // If user filled out newFieldLabel but didn't click "Append Field to Schema",
    // automatically append it before saving so their entered field is never lost!
    if (newFieldLabel.trim()) {
      const key = newFieldLabel
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "_");

      if (!fieldsToSave.some((f) => f.key === key)) {
        fieldsToSave.push({
          id: `field_${Date.now()}`,
          key,
          label: newFieldLabel.trim(),
          type: newFieldType,
          required: newFieldRequired,
          isSystem: false,
          placeholder: `Enter ${newFieldLabel.trim()}...`,
          subFields: newFieldType === "nested" ? [...nestedSubFields] : undefined,
        });
      }
    }

    setFieldsBySection((prev) => {
      const next = {
        ...prev,
        [activeSectionId]: fieldsToSave,
        [activeSection.slug]: fieldsToSave,
        ...(activeSection.id ? { [activeSection.id]: fieldsToSave } : {}),
        ...(activeSection.slug === "posts" ? { blog: fieldsToSave } : {}),
      };
      persistFields(next);
      return next;
    });

    const token = localStorage.getItem("portfoliohq_token");
    const sectionIdentifier = activeSection.id || activeSection.slug || activeSectionId;
    if (currentUser?.apiSlug && token && sectionIdentifier) {
      try {
        await fetch(apiUrl(`/api/v1/${currentUser.apiSlug}/sections/${sectionIdentifier}`), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: activeSection.name,
            singularName: activeSection.singularName,
            slug: activeSection.slug,
            icon: activeSection.icon,
            description: activeSection.description,
            fields: fieldsToSave,
          }),
        });
      } catch (err) {
        console.warn("Failed to persist schema to Neon DB:", err);
      }
    }

    setNewFieldLabel("");
    setNestedSubFields([]);
    setIsEditFieldsModalOpen(false);
    showToast(`Schema updated for ${activeSection.name}!`);
  };

  // Delete item from list
  const handleDeleteItem = async (id: string, title: string) => {
    setItemsBySection((prev) => {
      const currentList = (prev[activeSectionId] || prev[activeSection.slug] || []).filter(
        (i) => i.id !== id
      );
      const next = {
        ...prev,
        [activeSectionId]: currentList,
        [activeSection.slug]: currentList,
      };
      persistItems(next);
      return next;
    });

    const token = localStorage.getItem("portfoliohq_token");
    if (currentUser?.apiSlug && token) {
      try {
        await fetch(apiUrl(`/api/v1/${currentUser.apiSlug}/${activeSection.slug}/${id}`), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Backend error deleting item from Neon DB:", err);
      }
    }

    showToast(`Deleted "${title}"`);
  };

  // Delete entire Section (works for ANY section: Projects, Blog Posts, Skills, etc.)
  const handleDeleteSection = async (secToDelete: SectionDefinition) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the "${secToDelete.name}" collection? All items inside it will be permanently removed.`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("portfoliohq_token");
    if (currentUser?.apiSlug && token && secToDelete.id) {
      try {
        await fetch(apiUrl(`/api/v1/${currentUser.apiSlug}/sections/${secToDelete.id}`), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Backend error deleting section from Neon DB:", err);
      }
    }

    const remaining = sections.filter(
      (s) => s.id !== secToDelete.id && s.slug !== secToDelete.slug
    );
    setSections(remaining);
    persistSections(remaining);

    setItemsBySection((prev) => {
      const next = { ...prev };
      delete next[secToDelete.id];
      delete next[secToDelete.slug];
      persistItems(next);
      return next;
    });

    if (activeSectionId === secToDelete.id || activeSection.slug === secToDelete.slug) {
      if (remaining.length > 0) {
        setActiveSectionId(remaining[0].id || remaining[0].slug);
      }
    }

    showToast(`Section "${secToDelete.name}" deleted successfully.`);
  };

  // Open editor for an item
  const handleOpenEditor = (item: ItemData) => {
    setSelectedItemId(item.id);
    setWorkspaceMode("editor");
  };

  // Quick publish
  const handlePublish = async () => {
    if (!activeItem) return;
    setIsPublishing(true);
    const token = localStorage.getItem("portfoliohq_token");
    if (currentUser?.apiSlug && token) {
      try {
        const imageVal = activeItem.image || activeItem.coverImage || activeItem.photo || undefined;
        await fetch(apiUrl(`/api/v1/${currentUser.apiSlug}/${activeSection.slug}/${activeItem.id}`), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: activeItem.title,
            slug: activeItem.slug,
            category: activeItem.category || "General",
            status: activeItem.status || "Live",
            summary: activeItem.summary || "",
            image: imageVal,
            coverImage: imageVal,
            data: {
              ...activeItem,
              image: imageVal,
              coverImage: imageVal,
            },
          }),
        });
      } catch (err) {
        console.error("Backend error updating item in Neon DB:", err);
      }
    }
    persistItems(itemsBySection);
    setIsPublishing(false);
    showToast(`Published "${activeItem.title}" to Live API!`);
  };

  const toggleFormat = (format: string) => {
    setActiveFormatting((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  };

  // JSON payload structure representing current section
  const jsonCollectionData = {
    status: 200,
    timestamp: new Date().toISOString(),
    section: activeSection.slug,
    totalRecords: filteredItems.length,
    schema: currentFields.map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
      required: !!f.required,
      nestedFields: f.subFields?.map((sf) => ({
        key: sf.key,
        label: sf.label,
        type: sf.type,
      })),
    })),
    data: filteredItems,
  };

  // Download JSON file helper
  const handleDownloadJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(jsonCollectionData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${activeSection.slug}-portfoliocms.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Downloaded ${activeSection.slug}-portfoliocms.json`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-[#0F241D] flex flex-col font-sans selection:bg-[#B8F256] selection:text-[#0F241D]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-[#0F241D] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-[#B8F256]/40 animate-in fade-in slide-in-from-top-3">
          <div className="w-5 h-5 rounded-full bg-[#B8F256] text-[#0F241D] flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex w-full h-screen overflow-hidden">
        {/* 1. FAR LEFT RAIL (Dark Spruce #0F241D) */}
        <aside className="hidden">
          {/* Top Logo */}
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={onGoHome}
              title="Return to public website"
              className="w-10 h-10 rounded-xl overflow-hidden shadow-xs hover:scale-105 transition-all border border-[#2B5E4D]"
            >
              <img src="/logo.png" alt="portfolioCMS" className="w-full h-full object-contain" />
            </button>

            {/* Navigation Icons */}
            <div className="flex flex-col items-center gap-3">
              {/* 1. API Endpoints (Active tab) */}
              <button
                onClick={() => setActiveNav("api")}
                title="API Endpoints"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activeNav === "api"
                    ? "bg-[#B8F256] text-[#0F241D] shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Code className="w-5 h-5" />
              </button>

              {/* 2. API Keys (replaces folder) */}
              <button
                onClick={() => setActiveNav("apikeys")}
                title="API Keys"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activeNav === "apikeys"
                    ? "bg-[#B8F256] text-[#0F241D] shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Key className="w-5 h-5" />
              </button>

              {/* 3. API Guide */}
              <button
                onClick={() => setActiveNav("apiguide")}
                title="API Guide & Docs"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activeNav === "apiguide"
                    ? "bg-[#B8F256] text-[#0F241D] shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </button>

              {/* 4. Content & Assets */}
              <button
                onClick={() => {
                  setActiveNav("content");
                  setWorkspaceMode("list");
                }}
                title="Content & Assets"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activeNav === "content"
                    ? "bg-[#B8F256] text-[#0F241D] shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>

              {/* 5. Team Members */}
              <button
                onClick={() => setActiveNav("team")}
                title="Team Members"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activeNav === "team"
                    ? "bg-[#B8F256] text-[#0F241D] shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Users className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Icons */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={onGoHome}
              title="View Public Landing Page"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Home className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveNav("settings")}
              title="Settings"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile Avatar */}
            <div className="relative group">
              <button
                onClick={onLogout}
                title="Log out"
                className="w-8 h-8 rounded-full bg-[#1A3F33] text-[#B8F256] border-2 border-[#B8F256]/60 flex items-center justify-center text-xs font-bold hover:ring-2 hover:ring-rose-400 transition-all"
              >
                {currentUser.name.slice(0, 2).toUpperCase()}
              </button>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0F241D]"></span>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer Overlay Backdrop */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#0F241D]/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
          />
        )}

        {/* 2. SIDEBAR: CONTENT & ASSETS (Docked on desktop, slide drawer on mobile) */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-[#FAFBF9] border-r border-[#E3EAE0] flex flex-col justify-between p-4 shadow-2xl transition-transform duration-200
            lg:static lg:w-64 lg:shadow-none lg:translate-x-0 lg:z-20 lg:flex
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div>
            {/* Header Lockup - Clickable brand returning home with mobile close button */}
            <div className="flex items-center justify-between mb-4 px-1">
              <BrandLogo
                onClick={() => {
                  onGoHome();
                  setIsMobileMenuOpen(false);
                }}
                size="sm"
                textClassName="text-base"
                className="group cursor-pointer"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5EFE2] text-[#0F241D]">
                  CMS v2
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden transition-colors"
                  title="Close Navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* API & DEVELOPER NAVIGATION (ACTIVE) */}
            <div className="mb-4 pb-3 border-b border-[#E3EAE0]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                Developer & API
              </div>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    setActiveNav("api");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors ${
                    activeNav === "api"
                      ? "bg-[#EEF5EB] text-[#0F241D] font-bold shadow-2xs border border-[#DCE8D8]"
                      : "text-slate-600 hover:bg-slate-100/70 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#0F241D]" />
                    <span>API Endpoints</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#B8F256] text-[#0F241D] font-bold">
                    Active
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveNav("apikeys");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors ${
                    activeNav === "apikeys"
                      ? "bg-[#EEF5EB] text-[#0F241D] font-bold shadow-2xs border border-[#DCE8D8]"
                      : "text-slate-600 hover:bg-slate-100/70 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-600" />
                    <span>API Keys</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white text-slate-600 border border-slate-200 font-bold">
                    Keys
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveNav("apiguide");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors ${
                    activeNav === "apiguide"
                      ? "bg-[#EEF5EB] text-[#0F241D] font-bold shadow-2xs border border-[#DCE8D8]"
                      : "text-slate-600 hover:bg-slate-100/70 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-600" />
                    <span>API Guide</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white text-slate-600 border border-slate-200 font-bold">
                    Docs
                  </span>
                </button>
              </div>
            </div>

            {/* CONTENT & ASSETS LINE WITH "+" ICON (USER REQUEST) */}
            <div className="text-xs font-semibold text-slate-900 mb-3 px-1 flex items-center justify-between group">
              <div className="flex items-center gap-1.5">
                <span>Content & Assets</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({sections.length})
                </span>
              </div>

              {/* "+" Icon in Content and Assets line to allow user to add section they want */}
              <button
                onClick={() => setIsAddSectionModalOpen(true)}
                title="Add New Section / Collection"
                className="p-1 rounded-lg bg-[#F0F5EC] hover:bg-[#0F241D] text-slate-700 hover:text-[#B8F256] transition-all flex items-center justify-center shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dynamic Folder Navigation for Sections */}
            <div className="space-y-1 mb-6 text-xs max-h-56 overflow-y-auto pr-1">
              {sections.map((sec) => {
                const count = (itemsBySection[sec.id] || []).length;
                const isSelected =
                  activeNav === "content" && activeSectionId === sec.id;

                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveNav("content");
                      setActiveSectionId(sec.id);
                      setWorkspaceMode("list");
                      setMobileTab("content");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors ${
                      isSelected
                        ? "bg-[#EEF5EB] text-slate-900 font-bold shadow-2xs border border-[#DCE8D8]"
                        : "text-slate-600 hover:bg-slate-100/70 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={
                          isSelected ? "text-[#0F241D]" : "text-slate-500"
                        }
                      >
                        {renderSectionIcon(sec.icon)}
                      </span>
                      <span className="truncate">{sec.name}</span>
                    </div>
                    <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-white text-slate-600 border border-slate-200 font-bold shrink-0 ml-1">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick List of Active Items in Sidebar */}
            <div className="pt-3 border-t border-[#E3EAE0]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1 mb-2">
                <span className="uppercase tracking-wider truncate">
                  {activeSection.singularName}
                </span>
                <span>Status</span>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveNav("content");
                      handleOpenEditor(item);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                      selectedItemId === item.id && workspaceMode === "editor"
                        ? "bg-white shadow-xs border border-slate-300"
                        : "hover:bg-white/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-[#F2F6F0] flex items-center justify-center shrink-0">
                        {renderSectionIcon(
                          activeSection.icon,
                          "w-3.5 h-3.5 text-slate-700"
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {item.category || item.slug || "Default"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0 ml-1.5 ${
                        item.status === "Live"
                          ? "bg-[#B8F256] text-[#0F241D]"
                          : item.status === "Draft"
                          ? "bg-[#FDE68A] text-amber-900"
                          : "bg-[#DCFCE7] text-emerald-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Return to Landing */}
          <div className="pt-3 border-t border-[#E3EAE0]">
            <button
              onClick={() => {
                onGoHome();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Back to Public Site</span>
            </button>
          </div>
        </aside>

        {/* 3. MAIN WORKSPACE VIEWPORT */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
          {/* Top Bar */}
          <header className="h-14 border-b border-[#E8EDE6] px-3 sm:px-4 md:px-6 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10 gap-2">
            {/* Mobile Hamburger Menu Toggle + Brand Indicator */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-[#EEF5EB] border border-[#DEE8DB] transition-colors shadow-2xs"
                title="Open Navigation Menu"
              >
                <Menu className="w-4 h-4 text-[#0F241D]" />
              </button>
              <div className="lg:hidden flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-[#0F241D] truncate max-w-[100px] sm:max-w-none">
                  {activeNav === "api"
                    ? "Endpoints"
                    : activeNav === "apikeys"
                    ? "API Keys"
                    : activeNav === "apiguide"
                    ? "Guide"
                    : activeSection.name}
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex-1 max-w-xs sm:max-w-sm">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeSection.name.toLowerCase()}...`}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F7F2] border border-transparent rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#B8F256]"
                />
              </div>
            </div>

            {/* Right Tools & User Info */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-1 p-0.5 bg-[#F1F5EE] rounded-lg border border-[#DCE4D9] text-xs">
                <button
                  onClick={() => setWorkspaceMode("list")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    workspaceMode === "list"
                      ? "bg-white text-[#0F241D] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => {
                    if (activeItem) {
                      setWorkspaceMode("editor");
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    workspaceMode === "editor"
                      ? "bg-white text-[#0F241D] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Editor
                </button>
              </div>

              <div className="flex items-center gap-2 pl-1 sm:pl-2 sm:border-l sm:border-slate-200">
                <div
                  title={`Logged in as ${currentUser.name}`}
                  className="w-7 h-7 rounded-full bg-[#0F241D] text-[#B8F256] text-xs font-bold flex items-center justify-center cursor-default shrink-0"
                >
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight truncate max-w-[120px]">
                    {currentUser.email}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Log out"
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </header>

          {/* Center Workspace & Right API Panel Grid */}
          {activeNav === "content" && workspaceMode === "article-editor" ? (
            <ArticleEditorView
              sectionName={activeSection.name}
              singularName={activeSection.singularName}
              sectionSlug={activeSection.slug}
              initialItem={editingArticleItem}
              currentUser={currentUser}
              onCancel={() => {
                setWorkspaceMode("list");
                setEditingArticleItem(null);
              }}
              onSave={handleSaveArticle}
            />
          ) : (
            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0 overflow-hidden">
              {/* Mobile Sub-tab switcher between Collection Items and API Status on <lg */}
              {activeNav === "content" && workspaceMode === "list" && (
                <div className="lg:hidden flex items-center border-b border-[#E8EDE6] bg-[#FAFBF9] px-3 sm:px-4 py-2 shrink-0">
                  <div className="flex items-center gap-1 p-1 bg-[#EEF5EB] rounded-xl text-xs w-full">
                    <button
                      onClick={() => setMobileTab("content")}
                      className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                        mobileTab === "content"
                          ? "bg-white text-[#0F241D] shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>{activeSection.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#B8F256] text-[#0F241D]">
                        {filteredItems.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setMobileTab("api-info")}
                      className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                        mobileTab === "api-info"
                          ? "bg-white text-[#0F241D] shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>API & Status</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CENTER COLUMN (8 cols or 12 cols when API view) */}
              <div
                className={`flex flex-col border-r border-[#E8EDE6] bg-white overflow-y-auto flex-1 ${
                  activeNav === "content" ? "lg:col-span-8" : "lg:col-span-12"
                } ${
                  mobileTab === "content" || activeNav !== "content" ? "flex" : "hidden lg:flex"
                }`}
              >
                {activeNav === "api" ? (
                  <ApiEndpointsView
                    sections={sections}
                    itemsBySection={itemsBySection}
                    activeSectionId={activeSectionId}
                    onSelectSection={(id) => setActiveSectionId(id)}
                    onGoToKeys={() => setActiveNav("apikeys")}
                    onGoToGuide={() => setActiveNav("apiguide")}
                  />
                ) : activeNav === "apikeys" ? (
                  <ApiKeysView />
                ) : activeNav === "apiguide" ? (
                  <ApiGuideView />
                ) : workspaceMode === "list" ? (
                  <div className="p-4 sm:p-6 md:p-8 flex flex-col min-h-full">
                    {/* Header with Title, Count, "Edit Fields", and "+ Add Item" */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h1 className="text-xl md:text-2xl font-extrabold text-[#0F241D] tracking-tight">
                            {activeSection.name}
                          </h1>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF5E5] text-[#0F241D] border border-[#CDE5C4]">
                            {filteredItems.length}{" "}
                            {filteredItems.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {activeSection.description ||
                            `Manage your ${activeSection.name.toLowerCase()} content for real-time API responses.`}
                        </p>
                      </div>

                      {/* Action Controls: "Edit Fields" (Schema Builder) + "Delete Section" + "+" Add Item */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                        {/* Option to Edit Fields in that item (includes Nested Fields!) */}
                        <button
                          onClick={handleOpenEditFieldsModal}
                          title="Configure schema & nested fields"
                          className="px-3.5 py-2 bg-[#F3F7F1] hover:bg-[#E7EFE4] text-slate-700 hover:text-[#0F241D] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#DCE4D8] shadow-2xs"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit Fields</span>
                        </button>

                        {/* Delete Section button */}
                        <button
                          onClick={() => handleDeleteSection(activeSection)}
                          title={`Delete ${activeSection.name} collection`}
                          className="px-3 py-2 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 hover:border-rose-200 shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Section</span>
                        </button>

                        {/* Plus Icon to Add New Item (Text Editor sections open full-page article editor, Normal sections open popup modal) */}
                        <button
                          onClick={() => {
                            const isEditor =
                              activeSection.type === "editor" ||
                              activeSection.slug === "posts";
                            if (isEditor) {
                              handleOpenArticleEditor(null);
                            } else {
                              handleOpenAddModal();
                            }
                          }}
                          title={`Add new ${activeSection.singularName}`}
                          className="px-4 py-2 bg-[#0F241D] hover:bg-[#1a3f32] active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Plus className="w-4 h-4 text-[#B8F256]" />
                          <span>Add {activeSection.singularName}</span>
                        </button>
                      </div>
                    </div>

                  {/* FILTER BAR WITH 'JSON' BUTTON NEAR 'UPDATED' BUTTON (USER REQUEST) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-1.5 p-1 bg-[#F4F7F2] rounded-xl border border-[#E3EBE0] text-xs overflow-x-auto max-w-full">
                      {/* Regular filter buttons */}
                      {(["all", "Live", "Draft", "Updated"] as const).map(
                        (filter) => (
                          <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                              statusFilter === filter
                                ? "bg-white text-[#0F241D] shadow-xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            {filter === "all" ? "All Items" : filter}
                          </button>
                        )
                      )}

                      {/* Divider */}
                      <span className="w-px h-4 bg-slate-300 mx-0.5" />

                      {/* 'JSON' BUTTON NEAR 'UPDATED' BUTTON (USER REQUEST) */}
                      <button
                        onClick={() =>
                          setStatusFilter(
                            statusFilter === "json" ? "all" : "json"
                          )
                        }
                        title="View data in raw formatted JSON payload format"
                        className={`px-3 py-1 rounded-lg font-mono font-bold flex items-center gap-1.5 transition-all ${
                          statusFilter === "json"
                            ? "bg-[#0F241D] text-[#B8F256] shadow-xs"
                            : "text-slate-600 hover:text-[#0F241D] hover:bg-white/60"
                        }`}
                      >
                        <FileJson className="w-3.5 h-3.5" />
                        <span>JSON</span>
                      </button>
                    </div>

                    {statusFilter === "json" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleCopy(
                              JSON.stringify(jsonCollectionData, null, 2),
                              999
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          {copiedIndex === 999 ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">
                                Copied!
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleDownloadJson}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>Download</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 hidden sm:block">
                        Click any card to edit content
                      </span>
                    )}
                  </div>

                  {/* CONDITIONAL: RENDER JSON FORMAT SECTION OR CARDS LIST */}
                  {statusFilter === "json" ? (
                    /* ============================================================== */
                    /* LIVE JSON FORMAT SECTION (REQUESTED NEAR UPDATED BUTTON)       */
                    /* ============================================================== */
                    <div className="flex-1 flex flex-col rounded-2xl bg-[#0F241D] border border-[#1A3F33] overflow-hidden shadow-xl animate-in fade-in">
                      {/* JSON Header Bar */}
                      <div className="px-4 py-3 bg-[#132E25] border-b border-[#1D4A3C] flex items-center justify-between text-xs text-slate-300">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#B8F256] animate-pulse"></span>
                          <span className="font-bold text-[#B8F256]">GET</span>
                          <span className="text-slate-300 font-medium">
                            /v1/{activeSection.slug}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#1E4D3E] text-emerald-300 font-semibold">
                            200 OK • 38ms
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>{filteredItems.length} records</span>
                          <span>application/json</span>
                        </div>
                      </div>

                      {/* Code Block with formatted JSON */}
                      <div className="p-4 md:p-6 overflow-auto flex-1 font-mono text-xs text-[#EAF8D9] leading-relaxed select-text">
                        <pre className="whitespace-pre">
                          {JSON.stringify(jsonCollectionData, null, 2)}
                        </pre>
                      </div>

                      {/* JSON Footer Bar */}
                      <div className="px-4 py-2.5 bg-[#132E25] border-t border-[#1D4A3C] flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          Includes nested object fields and edge payload headers
                        </span>
                        <button
                          onClick={() => setStatusFilter("all")}
                          className="text-[#B8F256] hover:underline font-bold"
                        >
                          Close JSON View &gt;
                        </button>
                      </div>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    /* EMPTY STATE */
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-[#FAFCF9]">
                      <div className="w-12 h-12 rounded-2xl bg-[#F0F5EC] flex items-center justify-center text-slate-400 mb-3">
                        {renderSectionIcon(activeSection.icon, "w-6 h-6")}
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mb-1">
                        No {activeSection.name.toLowerCase()} found
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mb-4">
                        {searchQuery
                          ? `No matches for "${searchQuery}". Try a different search.`
                          : `Get started by adding your first ${activeSection.singularName.toLowerCase()}.`}
                      </p>
                      <button
                        onClick={handleOpenAddModal}
                        className="px-4 py-2 bg-[#0F241D] hover:bg-[#1a3f32] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4 text-[#B8F256]" />
                        <span>Add New Item</span>
                      </button>
                    </div>
                  ) : (
                    /* CARDS LIST */
                    <div className="space-y-3 flex-1">
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          className="group p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-[#B8F256] hover:shadow-sm bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                          onClick={() => {
                            const isEditor =
                              activeSection.type === "editor" ||
                              activeSection.slug === "posts";
                            if (isEditor) {
                              handleOpenArticleEditor(item);
                            } else {
                              handleOpenEditor(item);
                            }
                          }}
                        >
                          {/* Item Left Info */}
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#F4F8F1] border border-[#DEE8DB] overflow-hidden flex items-center justify-center text-slate-800 shrink-0 group-hover:bg-[#EAF6E3] transition-colors shadow-2xs">
                              {item.image || item.coverImage || item.photo ? (
                                <img
                                  src={item.image || item.coverImage || item.photo}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                renderSectionIcon(
                                  activeSection.icon,
                                  "w-5 h-5 text-[#0F241D]"
                                )
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-extrabold text-[#0F241D] group-hover:text-emerald-900 transition-colors truncate">
                                  {item.title}
                                </h3>

                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    item.status === "Live"
                                      ? "bg-[#B8F256] text-[#0F241D]"
                                      : item.status === "Draft"
                                      ? "bg-[#FDE68A] text-amber-900"
                                      : "bg-[#DCFCE7] text-emerald-800"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                {item.summary ||
                                  item.excerpt ||
                                  "No description provided yet."}
                              </p>

                              {/* Render Nested Fields preview if present */}
                              {Object.entries(item).some(
                                ([k, v]) =>
                                  typeof v === "object" &&
                                  v !== null &&
                                  !Array.isArray(v) &&
                                  Object.keys(v).length > 0
                              ) && (
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  {Object.entries(item).map(([k, v]) => {
                                    if (
                                      typeof v === "object" &&
                                      v !== null &&
                                      !Array.isArray(v) &&
                                      Object.keys(v).length > 0
                                    ) {
                                      return (
                                        <span
                                          key={k}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F2F6F0] text-[10px] font-mono text-slate-700 border border-[#E0E9DD]"
                                        >
                                          <CornerDownRight className="w-2.5 h-2.5 text-[#0F241D]" />
                                          <strong className="text-slate-800">
                                            {k}:
                                          </strong>{" "}
                                          {Object.keys(v).length} subfields
                                        </span>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              )}

                              {/* Metadata pills */}
                              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                                {item.category && (
                                  <span className="flex items-center gap-1 font-medium text-slate-600 bg-[#F4F6F2] px-2 py-0.5 rounded-md">
                                    <Tag className="w-3 h-3 text-slate-400" />
                                    {item.category}
                                  </span>
                                )}
                                <span>Updated {item.updatedAt}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div
                            className="flex items-center gap-2 shrink-0 self-end sm:self-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                const isEditor =
                                  activeSection.type === "editor" ||
                                  activeSection.slug === "posts";
                                if (isEditor) {
                                  handleOpenArticleEditor(item);
                                } else {
                                  handleOpenEditor(item);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#FAFBF9] hover:bg-[#EEF5EB] text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteItem(item.id, item.title)
                              }
                              title="Delete Item"
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom Footer Info */}
                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Schema:{" "}
                      <strong className="text-slate-700">
                        {currentFields.length} configured fields
                      </strong>
                      {currentFields.some((f) => f.type === "nested") &&
                        " (including nested fields)"}
                    </span>
                    <button
                      onClick={handleOpenEditFieldsModal}
                      className="text-[#0F241D] hover:underline font-semibold flex items-center gap-1"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      Configure Collection Fields &gt;
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW B: CONTENT EDITOR */
                <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between min-h-full">
                  <div>
                    {/* Breadcrumb / Back Button */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setWorkspaceMode("list")}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F3F6F1] hover:bg-[#E8EFE5] text-[#0F241D] text-xs font-semibold transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back to {activeSection.name}</span>
                        </button>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF5EB] text-[#0F241D] font-bold">
                          {activeItem?.title || "Selected Item"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setEditorActiveView(
                              editorActiveView === "editor" ? "json" : "editor"
                            )
                          }
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100"
                        >
                          {editorActiveView === "editor"
                            ? "{ } JSON Payload"
                            : "Editor Form"}
                        </button>
                      </div>
                    </div>

                    {/* Rich Text Toolbar */}
                    <div className="flex items-center gap-1 p-1 bg-[#F5F8F4] rounded-xl mb-4 border border-[#E4ECE1] text-slate-600 overflow-x-auto max-w-full">
                      <button
                        onClick={() => toggleFormat("bold")}
                        className={`p-1.5 rounded transition-colors font-bold text-xs ${
                          activeFormatting.includes("bold")
                            ? "bg-[#0F241D] text-white"
                            : "hover:bg-white hover:text-slate-900"
                        }`}
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleFormat("italic")}
                        className={`p-1.5 rounded transition-colors ${
                          activeFormatting.includes("italic")
                            ? "bg-[#0F241D] text-white"
                            : "hover:bg-white hover:text-slate-900"
                        }`}
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleFormat("underline")}
                        className={`p-1.5 rounded transition-colors ${
                          activeFormatting.includes("underline")
                            ? "bg-[#0F241D] text-white"
                            : "hover:bg-white hover:text-slate-900"
                        }`}
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-px h-3.5 bg-slate-300 mx-0.5" />
                      <button className="p-1.5 hover:bg-white rounded hover:text-slate-900 transition-colors">
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 hover:bg-white rounded hover:text-slate-900 transition-colors">
                        <ListIcon className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 hover:bg-white rounded hover:text-slate-900 transition-colors">
                        <ListOrdered className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {editorActiveView === "editor" && activeItem ? (
                      <div className="space-y-4">
                        {/* Built-in Single Image / Photo Uploader (1 photo max) */}
                        <div className="p-4 rounded-2xl bg-white border border-[#DEE8DB] shadow-xs">
                          <SingleImageUploader
                            value={activeItem.image || activeItem.coverImage || activeItem.photo || ""}
                            onChange={(imgUrl) => {
                              const next = {
                                ...activeItem,
                                image: imgUrl,
                                coverImage: imgUrl,
                                photo: imgUrl,
                              };
                              updateActiveItem(next);
                            }}
                            label={`${activeSection.singularName} Image / Photo`}
                            helperText={`Upload at most one photo for this ${activeSection.singularName.toLowerCase()}. Auto-compressed to WebP.`}
                            compact
                          />
                        </div>

                        {/* Dynamic fields based on schema, including nested fields! */}
                        {currentFields.map((field) => {
                          const val = activeItem[field.key];

                          // Skip redundant field if key is 'image' or 'coverImage' since handled above
                          if (field.key === "image" || field.key === "coverImage") {
                            return null;
                          }

                          // 0. CUSTOM IMAGE FIELD RENDERER
                          if (field.type === "image") {
                            return (
                              <div key={field.id} className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#DEE8DB]">
                                <SingleImageUploader
                                  value={val || ""}
                                  onChange={(imgUrl) => {
                                    const next = {
                                      ...activeItem,
                                      [field.key]: imgUrl,
                                    };
                                    updateActiveItem(next);
                                  }}
                                  label={field.label}
                                  compact
                                />
                              </div>
                            );
                          }

                          // 1. NESTED FIELD RENDERER IN EDITOR
                          if (field.type === "nested") {
                            const nestedObj =
                              typeof val === "object" && val !== null
                                ? val
                                : {};
                            return (
                              <div
                                key={field.id}
                                className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#DEE8DB] space-y-3"
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-[#E3EDE0]">
                                  <div className="flex items-center gap-1.5">
                                    <CornerDownRight className="w-3.5 h-3.5 text-[#0F241D]" />
                                    <label className="text-xs font-bold text-[#0F241D]">
                                      {field.label}{" "}
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        ({field.key})
                                      </span>
                                    </label>
                                  </div>
                                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    Nested Object
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                  {field.subFields &&
                                  field.subFields.length > 0 ? (
                                    field.subFields.map((sf) => (
                                      <div
                                        key={sf.id}
                                        className={
                                          sf.type === "textarea"
                                            ? "sm:col-span-2"
                                            : ""
                                        }
                                      >
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                          {sf.label}
                                        </label>
                                        {sf.type === "textarea" ? (
                                          <textarea
                                            rows={2}
                                            value={nestedObj[sf.key] || ""}
                                            onChange={(e) => {
                                              const updatedNested = {
                                                ...nestedObj,
                                                [sf.key]: e.target.value,
                                              };
                                              const next = {
                                                ...activeItem,
                                                [field.key]: updatedNested,
                                              };
                                              updateActiveItem(next);
                                            }}
                                            placeholder={sf.placeholder}
                                            className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                                          />
                                        ) : (
                                          <input
                                            type="text"
                                            value={nestedObj[sf.key] || ""}
                                            onChange={(e) => {
                                              const updatedNested = {
                                                ...nestedObj,
                                                [sf.key]: e.target.value,
                                              };
                                              const next = {
                                                ...activeItem,
                                                [field.key]: updatedNested,
                                              };
                                              updateActiveItem(next);
                                            }}
                                            placeholder={sf.placeholder}
                                            className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                                          />
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="col-span-2 text-xs text-slate-400 py-1 italic">
                                      No sub-fields defined yet. Use "Edit
                                      Fields" to add sub-fields to this group.
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          // 2. TITLE FIELD
                          if (field.key === "title") {
                            return (
                              <div key={field.id}>
                                <label className="block text-xs font-bold text-slate-500 mb-1">
                                  {field.label}
                                </label>
                                <input
                                  type="text"
                                  value={val || ""}
                                  onChange={(e) => {
                                    const next = {
                                      ...activeItem,
                                      [field.key]: e.target.value,
                                    };
                                    updateActiveItem(next);
                                  }}
                                  className="w-full text-xl font-extrabold text-[#0F241D] focus:outline-none placeholder-slate-400 tracking-tight pb-1 border-b border-transparent focus:border-[#B8F256]"
                                />
                              </div>
                            );
                          }

                          // 3. TEXTAREA / RICHTEXT
                          if (
                            field.type === "textarea" ||
                            field.type === "richtext"
                          ) {
                            return (
                              <div key={field.id}>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  {field.label}
                                </label>
                                <textarea
                                  rows={5}
                                  value={val || ""}
                                  onChange={(e) => {
                                    const next = {
                                      ...activeItem,
                                      [field.key]: e.target.value,
                                    };
                                    updateActiveItem(next);
                                  }}
                                  className={`w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed focus:outline-none focus:border-[#0F241D] resize-none ${
                                    activeFormatting.includes("bold")
                                      ? "font-bold"
                                      : ""
                                  } ${
                                    activeFormatting.includes("italic")
                                      ? "italic"
                                      : ""
                                  }`}
                                />
                              </div>
                            );
                          }

                          // 4. SELECT
                          if (field.type === "select") {
                            return (
                              <div key={field.id} className="w-48">
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  {field.label}
                                </label>
                                <select
                                  value={val || "Live"}
                                  onChange={(e) => {
                                    const next = {
                                      ...activeItem,
                                      [field.key]: e.target.value,
                                    };
                                    updateActiveItem(next);
                                  }}
                                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#0F241D]"
                                >
                                  {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          }

                          // 5. REGULAR INPUT
                          return (
                            <div key={field.id}>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                {field.label}
                              </label>
                              <input
                                type={
                                  field.type === "number" ? "number" : "text"
                                }
                                value={val || ""}
                                placeholder={field.placeholder}
                                onChange={(e) => {
                                  const next = {
                                    ...activeItem,
                                    [field.key]: e.target.value,
                                  };
                                  updateActiveItem(next);
                                }}
                                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                              />
                            </div>
                          );
                        })}

                        {/* Add Media Button */}
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              showToast("Asset attached to item.");
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-slate-300 hover:border-[#0F241D] text-slate-700 hover:text-[#0F241D] transition-colors text-xs font-semibold bg-[#FAFCF9]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Media Asset</span>
                          </button>
                        </div>

                        {/* Content Preview Canvas */}
                        <div className="mt-6 pt-5 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Content Preview
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Live edge cache syncer
                            </span>
                          </div>

                          <div className="p-4 rounded-2xl bg-[#F6F9F4] border border-[#E0E9DD] shadow-2xs">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                              <span className="font-bold text-xs text-[#0F241D]">
                                {activeItem.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                portfoliocms.api
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                              {activeItem.summary ||
                                activeItem.body ||
                                activeItem.excerpt ||
                                "No description yet."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* JSON Payload View inside Editor */
                      <div className="space-y-2">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          Live Item JSON Payload
                        </span>
                        <pre className="p-4 bg-[#0F241D] text-[#B8F256] rounded-2xl font-mono text-xs overflow-x-auto">
                          {JSON.stringify(activeItem, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Bottom Fixed Action Bar: Control Bar */}
                  <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      Control Bar
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="px-5 py-2.5 bg-[#0F241D] hover:bg-[#1a382e] active:scale-95 text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                      >
                        {isPublishing ? (
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>Publishing...</span>
                          </div>
                        ) : (
                          <>
                            <span>Quick Publish</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#B8F256]" />
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setWorkspaceMode("list")}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        &lt; Back to List
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN (4 cols): API INTEGRATION & STATUS */}
            {activeNav === "content" && (
              <div
                className={`lg:col-span-4 p-4 sm:p-6 md:p-7 bg-[#FAFBF9] flex-col justify-between overflow-y-auto ${
                  mobileTab === "api-info" ? "flex flex-1" : "hidden lg:flex"
                }`}
              >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                  <span className="font-extrabold text-slate-900 text-sm">
                    API Integration & Status
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Edge 38ms
                  </span>
                </div>

                {/* Live Status Badge */}
                <div className="flex items-center justify-between mb-5 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-700">
                    Live API Status
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </span>
                </div>

                {/* API Endpoints */}
                <div className="mb-6">
                  <span className="text-[11px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">
                    Active Endpoint
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#B8F256] ring-1 ring-[#B8F256]/50 font-mono text-xs text-slate-700 shadow-2xs">
                      <span className="truncate">
                        {apiBaseUrl}/api/v1/{currentUser.apiSlug || "your-api-slug"}/{activeSection.slug}
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(
                            `${apiBaseUrl}/api/v1/${currentUser.apiSlug || "your-api-slug"}/${activeSection.slug}`,
                            1
                          )
                        }
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors ml-1 shrink-0"
                        title="Copy endpoint"
                      >
                        {copiedIndex === 1 ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Architecture Diagram */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 mb-6 shadow-xs">
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <div className="flex flex-col items-center p-2.5 rounded-xl bg-[#FAFBF9] border border-slate-200 w-24">
                      <div className="w-6 h-6 rounded-lg bg-[#0F241D] text-[#B8F256] font-mono text-xs font-bold flex items-center justify-center mb-1">
                        P
                      </div>
                      <span className="font-bold text-slate-800 text-[11px]">
                        Dashboard
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-1">
                      <div className="w-full flex items-center">
                        <div className="h-0.5 flex-1 bg-[#B8F256]"></div>
                        <div className="w-2 h-2 rounded-full bg-[#B8F256] -ml-1"></div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#0F241D] -ml-1" />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-mono">
                        Edge JSON
                      </span>
                    </div>

                    <div className="flex flex-col items-center p-2.5 rounded-xl bg-[#FAFBF9] border border-slate-200 w-24">
                      <div className="w-6 h-6 rounded-lg bg-slate-800 text-white text-xs flex items-center justify-center mb-1">
                        💻
                      </div>
                      <span className="font-bold text-slate-800 text-[11px] truncate text-center">
                        External Frontend
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Schema Summary Box */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 mb-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      {activeSection.name} Fields
                    </span>
                    <button
                      onClick={handleOpenEditFieldsModal}
                      className="text-[11px] font-bold text-[#0F241D] hover:underline"
                    >
                      Edit Fields
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentFields.map((f) => (
                      <span
                        key={f.id}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                          f.type === "nested"
                            ? "bg-[#EBF5E7] text-emerald-900 border border-[#CDE5C4] font-bold"
                            : "bg-[#F2F6F0] text-slate-700"
                        }`}
                      >
                        {f.key}
                        <span className="text-slate-400 ml-1 font-sans">
                          (
                          {f.type === "nested"
                            ? `${f.subFields?.length || 0} subfields`
                            : f.type}
                          )
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Insights Stats */}
              <div className="pt-4 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-2.5 uppercase tracking-wider">
                  Key Insights
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5 truncate">
                      {activeSection.name}
                    </span>
                    <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                      {currentItems.length}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Total Sections
                    </span>
                    <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                      {sections.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        )}
      </div>
    </div>

      {/* ==================================================================== */}
      {/* MODAL 1: ADD NEW ITEM                                                */}
      {/* STRICTLY CONTENT INPUT - NO FIELD SCHEMA CONTROLS                    */}
      {/* Handles both regular and nested object fields cleanly                */}
      {/* ==================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F241D]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0F241D] text-[#B8F256] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F241D]">
                    Add New {activeSection.singularName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fill in the values for this item.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form (ONLY DATA ENTRY - NO SCHEMA/FIELD CONTROLS) */}
            <form
              onSubmit={handleSaveNewItem}
              className="flex-1 overflow-y-auto py-4 space-y-4 pr-1"
            >
              {/* Single Image / Photo Uploader (1 photo max) */}
              <div className="p-3.5 rounded-2xl bg-[#F6FAF3] border border-[#DEE8DB]">
                <SingleImageUploader
                  value={newItemFormData.image || newItemFormData.coverImage || ""}
                  onChange={(imgUrl) => {
                    setNewItemFormData({
                      ...newItemFormData,
                      image: imgUrl,
                      coverImage: imgUrl,
                      photo: imgUrl,
                    });
                  }}
                  label={`${activeSection.singularName} Photo / Image`}
                  helperText={`Upload at most one photo for this ${activeSection.singularName.toLowerCase()}. Auto-compressed to WebP.`}
                  compact
                />
              </div>

              {currentFields.map((field) => {
                // Skip redundant field if key is 'image' or 'coverImage' since handled above
                if (field.key === "image" || field.key === "coverImage") {
                  return null;
                }

                // Custom image field type
                if (field.type === "image") {
                  return (
                    <div key={field.id} className="p-3.5 rounded-2xl bg-[#F6FAF3] border border-[#DEE8DB]">
                      <SingleImageUploader
                        value={newItemFormData[field.key] || newItemFormData.image || ""}
                        onChange={(imgUrl) => {
                          setNewItemFormData({
                            ...newItemFormData,
                            [field.key]: imgUrl,
                            image: imgUrl,
                          });
                        }}
                        label={field.label}
                        compact
                      />
                    </div>
                  );
                }

                // NESTED FIELDS IN ADD ITEM FORM
                if (field.type === "nested") {
                  return (
                    <div
                      key={field.id}
                      className="p-4 rounded-2xl bg-[#F6FAF3] border border-[#DEE8DB] space-y-3"
                    >
                      <div className="flex items-center gap-1.5 pb-2 border-b border-[#E3EDE0]">
                        <CornerDownRight className="w-3.5 h-3.5 text-[#0F241D]" />
                        <label className="text-xs font-bold text-[#0F241D]">
                          {field.label}{" "}
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({field.key})
                          </span>
                        </label>
                      </div>

                      <div className="space-y-2.5">
                        {field.subFields && field.subFields.length > 0 ? (
                          field.subFields.map((sf) => (
                            <div key={sf.id}>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                {sf.label}{" "}
                                {sf.required && (
                                  <span className="text-rose-500">*</span>
                                )}
                              </label>
                              {sf.type === "textarea" ? (
                                <textarea
                                  rows={2}
                                  placeholder={
                                    sf.placeholder ||
                                    `Enter ${sf.label.toLowerCase()}...`
                                  }
                                  value={
                                    newItemFormData[field.key]?.[sf.key] || ""
                                  }
                                  onChange={(e) => {
                                    const currentNested =
                                      newItemFormData[field.key] || {};
                                    setNewItemFormData({
                                      ...newItemFormData,
                                      [field.key]: {
                                        ...currentNested,
                                        [sf.key]: e.target.value,
                                      },
                                    });
                                  }}
                                  className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                                />
                              ) : (
                                <input
                                  type={
                                    sf.type === "number"
                                      ? "number"
                                      : sf.type === "url"
                                      ? "url"
                                      : "text"
                                  }
                                  placeholder={
                                    sf.placeholder ||
                                    `Enter ${sf.label.toLowerCase()}...`
                                  }
                                  value={
                                    newItemFormData[field.key]?.[sf.key] || ""
                                  }
                                  onChange={(e) => {
                                    const currentNested =
                                      newItemFormData[field.key] || {};
                                    setNewItemFormData({
                                      ...newItemFormData,
                                      [field.key]: {
                                        ...currentNested,
                                        [sf.key]: e.target.value,
                                      },
                                    });
                                  }}
                                  className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                                />
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No sub-fields configured for this nested group.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                if (field.type === "select") {
                  return (
                    <div key={field.id}>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-rose-500">*</span>
                        )}
                      </label>
                      <select
                        value={newItemFormData[field.key] || "Live"}
                        onChange={(e) =>
                          setNewItemFormData({
                            ...newItemFormData,
                            [field.key]: e.target.value,
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#0F241D]"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (field.type === "textarea" || field.type === "richtext") {
                  return (
                    <div key={field.id}>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-rose-500">*</span>
                        )}
                      </label>
                      <textarea
                        rows={3}
                        placeholder={
                          field.placeholder ||
                          `Enter ${field.label.toLowerCase()}...`
                        }
                        value={newItemFormData[field.key] || ""}
                        onChange={(e) =>
                          setNewItemFormData({
                            ...newItemFormData,
                            [field.key]: e.target.value,
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D] resize-none"
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.id}>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-rose-500">*</span>
                      )}
                    </label>
                    <input
                      type={
                        field.type === "number"
                          ? "number"
                          : field.type === "url"
                          ? "url"
                          : "text"
                      }
                      placeholder={
                        field.placeholder ||
                        `Enter ${field.label.toLowerCase()}...`
                      }
                      value={newItemFormData[field.key] || ""}
                      onChange={(e) =>
                        setNewItemFormData({
                          ...newItemFormData,
                          [field.key]: e.target.value,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                    />
                  </div>
                );
              })}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F241D] hover:bg-[#1a382e] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B8F256]" />
                  <span>Create {activeSection.singularName}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: EDIT FIELDS / MANAGE SCHEMA (WITH NESTED FIELDS SUPPORT)    */}
      {/* (REQUEST: "allow to add nested fields if user want in edit fields")   */}
      {/* ==================================================================== */}
      {isEditFieldsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F241D]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EAF5E5] text-[#0F241D] flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F241D]">
                    Edit Fields ({activeSection.name})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define schema, types, and nested object groups.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditFieldsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {/* Existing Fields List */}
              <div>
                <span className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wider">
                  Active Collection Fields ({editingFieldsList.length})
                </span>

                <div className="space-y-2.5">
                  {editingFieldsList.map((field) => (
                    <div
                      key={field.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-[#FAFCF9] text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              field.type === "nested"
                                ? "bg-emerald-600 ring-2 ring-emerald-200"
                                : "bg-[#B8F256]"
                            }`}
                          ></span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-800">
                                {field.label}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                ({field.key})
                              </span>
                              <label
                                className="inline-flex items-center gap-1 cursor-pointer select-none text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                                title="Toggle required"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!field.required}
                                  onChange={() => handleToggleFieldRequired(field.id)}
                                  className="w-3 h-3 text-[#0F241D] rounded accent-[#0F241D]"
                                />
                                <span className={field.required ? "text-rose-600 font-bold" : "text-slate-400 font-medium"}>
                                  {field.required ? "Required" : "Optional"}
                                </span>
                              </label>
                              {field.type === "nested" && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded">
                                  Nested Object
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 capitalize">
                              Type: {field.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {field.isSystem ? (
                            <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-100">
                              Core Field
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteField(field.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove Field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* If this is a nested field, show its subfields and button to add more */}
                      {field.type === "nested" && (
                        <div className="pl-4 pt-2 border-t border-slate-200/80 space-y-1.5 bg-white/70 p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Sub-Fields ({field.subFields?.length || 0})
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleAddSubFieldToExisting(field.id)
                              }
                              className="text-[10px] font-bold text-[#0F241D] hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              Add Sub-Field
                            </button>
                          </div>

                          {field.subFields && field.subFields.length > 0 ? (
                            <div className="space-y-1">
                              {field.subFields.map((sf) => (
                                <div
                                  key={sf.id}
                                  className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-slate-50 border border-slate-200"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <CornerDownRight className="w-3 h-3 text-slate-400" />
                                    <span className="font-semibold text-slate-700">
                                      {sf.label}
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-400">
                                      ({sf.key} : {sf.type})
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveSubFieldFromExisting(
                                        field.id,
                                        sf.id
                                      )
                                    }
                                    className="text-slate-400 hover:text-rose-600 p-0.5"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">
                              No subfields added yet.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Custom Field Form (including Nested Object type!) */}
              <div className="p-4 rounded-2xl bg-[#F4F8F1] border border-[#DEE8DB]">
                <span className="text-xs font-extrabold text-[#0F241D] block mb-2.5">
                  + Add Field to {activeSection.name}
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Field Label / Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SEO Metadata, Client Info, Social Links, Metrics"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomField();
                        }
                      }}
                      className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Field Type
                      </label>
                      <select
                        value={newFieldType}
                        onChange={(e) =>
                          setNewFieldType(e.target.value as FieldType)
                        }
                        className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-[#0F241D] focus:outline-none focus:border-[#0F241D]"
                      >
                        <option value="text">Text (Single line)</option>
                        <option value="textarea">Textarea (Multi-line)</option>
                        <option value="richtext">Rich Text / Markdown</option>
                        <option value="image">Image / Photo (1 file max)</option>
                        <option value="number">Number</option>
                        <option value="url">URL / Link</option>
                        <option value="nested">
                          Nested Object (Group of subfields)
                        </option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={newFieldRequired}
                          onChange={(e) =>
                            setNewFieldRequired(e.target.checked)
                          }
                          className="rounded text-[#0F241D] focus:ring-[#B8F256]"
                        />
                        <span>Required field</span>
                      </label>
                    </div>
                  </div>

                  {/* NESTED FIELDS BUILDER SECTION (when Field Type === 'nested') */}
                  {newFieldType === "nested" && (
                    <div className="p-3 bg-white rounded-xl border border-[#CDE5C4] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#0F241D] flex items-center gap-1">
                          <CornerDownRight className="w-3.5 h-3.5 text-emerald-700" />
                          Define Sub-Fields for this Nested Object
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {nestedSubFields.length} added
                        </span>
                      </div>

                      {/* Subfields list */}
                      {nestedSubFields.length > 0 && (
                        <div className="space-y-1 py-1">
                          {nestedSubFields.map((sf) => (
                            <div
                              key={sf.id}
                              className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-[#F8FAF6] border border-slate-200"
                            >
                              <span className="font-semibold text-slate-800">
                                {sf.label}{" "}
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ({sf.key} : {sf.type})
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTempSubField(sf.id)}
                                className="text-slate-400 hover:text-rose-600 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add subfield inputs */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Sub-field name (e.g. meta_title, company)"
                          value={tempSubFieldLabel}
                          onChange={(e) => setTempSubFieldLabel(e.target.value)}
                          className="flex-1 p-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F241D]"
                        />
                        <select
                          value={tempSubFieldType}
                          onChange={(e) =>
                            setTempSubFieldType(e.target.value as any)
                          }
                          className="p-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 bg-white"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="number">Number</option>
                          <option value="url">URL</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleAddTempSubField}
                          className="px-2.5 py-1.5 bg-[#EEF5EB] hover:bg-[#DEEBD8] text-[#0F241D] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    disabled={!newFieldLabel.trim()}
                    className="w-full py-2 bg-[#0F241D] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#B8F256]" />
                    <span>Append Field to Schema</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">
                Changes apply to {activeSection.name}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditFieldsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFieldsSchema}
                  className="px-5 py-2.5 bg-[#0F241D] hover:bg-[#1a382e] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Check className="w-3.5 h-3.5 text-[#B8F256]" />
                  <span>Save Schema</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: ADD NEW SECTION / COLLECTION                                */}
      {/* (REQUEST: "+ icon in content and assets line to allow user to add     */}
      {/*  section they want")                                                 */}
      {/* ==================================================================== */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F241D]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0F241D] text-[#B8F256] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F241D]">
                    Create New Section
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add a new content collection to portfolioCMS.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddSectionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSection} className="py-4 space-y-4">
              {/* Section Type Selector (Normal vs Text Editor) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Choose Section Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewSectionType("normal")}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      newSectionType === "normal"
                        ? "border-[#0F241D] bg-[#EEF5EB] ring-2 ring-[#0F241D]/20 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <LayoutGrid className="w-4 h-4 text-[#0F241D]" />
                        <span className="text-xs font-extrabold text-[#0F241D]">
                          Normal Section
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Structured fields (skills, projects, services) with modal popup entry.
                      </p>
                    </div>
                    <span className="mt-2.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 w-max">
                      Modal Form
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewSectionType("editor");
                      if (newSectionIcon === "layers") {
                        setNewSectionIcon("file-text");
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      newSectionType === "editor"
                        ? "border-[#0F241D] bg-[#EEF5EB] ring-2 ring-[#0F241D]/20 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText className="w-4 h-4 text-[#0F241D]" />
                        <span className="text-xs font-extrabold text-[#0F241D]">
                          Text Editor Section
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Rich text styles, cover image, and full-page drafting & publishing.
                      </p>
                    </div>
                    <span className="mt-2.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#B8F256] text-[#0F241D] w-max">
                      Full-Page Editor
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section Name (Plural) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Testimonials, Case Studies, Services, FAQs"
                  value={newSectionName}
                  onChange={(e) => {
                    setNewSectionName(e.target.value);
                    if (!newSectionSingular) {
                      setNewSectionSingular(e.target.value.replace(/s$/, ""));
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Singular Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Testimonial, Case Study, Service"
                  value={newSectionSingular}
                  onChange={(e) => setNewSectionSingular(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      "layers",
                      "folder",
                      "file-text",
                      "shopping-bag",
                      "sparkles",
                      "star",
                      "award",
                      "globe",
                    ] as const
                  ).map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewSectionIcon(ic)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        newSectionIcon === ic
                          ? "border-[#0F241D] bg-[#EEF5EB] text-[#0F241D] font-bold ring-1 ring-[#0F241D]"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      {renderSectionIcon(ic, "w-4 h-4")}
                      <span className="text-[10px] capitalize">{ic}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Client reviews and ratings for portfolio display"
                  value={newSectionDescription}
                  onChange={(e) => setNewSectionDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F241D] hover:bg-[#1a3f32] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B8F256]" />
                  <span>Create Section</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
