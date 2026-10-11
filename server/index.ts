import express, { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import cors from 'cors';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { prisma, seedInitialDataIfEmpty } from "./db.js";
import { generateToken, verifyFirebaseIdToken, verifyToken } from "./auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

app.use(express.json());

app.use(cors());
app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      apiKeyRole?: string;
    }
  }
}

async function authenticateApiRequest(req: Request, res: Response, next: () => void) {
  let token = "";
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (req.headers["x-api-key"]) {
    token = String(req.headers["x-api-key"]).trim();
  } else if (req.query.apiKey) {
    token = String(req.query.apiKey).trim();
  }

  if (!token) {
    res.status(401).json({ error: "Authorization bearer token or API key is required" });
    return;
  }
  const apiSlug = req.params.apiSlug;

  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { token },
      select: { userId: true, role: true, status: true },
    });

    if (apiKey) {
      if (apiKey.status !== "Active" || !apiKey.userId) {
        res.status(401).json({ error: "API key is inactive or not assigned to a user" });
        return;
      }
      const owner = await prisma.user.findUnique({ where: { id: apiKey.userId }, select: { apiSlug: true } });
      if (!owner || owner.apiSlug !== apiSlug) {
        res.status(403).json({ error: "This API key does not belong to this API URL" });
        return;
      }
      req.userId = apiKey.userId;
      req.apiKeyRole = apiKey.role;
      next();
      return;
    }

    const session = verifyToken(token);
    if (!session) {
      res.status(401).json({ error: "Invalid or expired bearer token" });
      return;
    }

    const owner = await prisma.user.findUnique({ where: { id: session.userId }, select: { apiSlug: true } });
    if (!owner || owner.apiSlug !== apiSlug) {
      res.status(403).json({ error: "This session does not belong to this API URL" });
      return;
    }

    req.userId = session.userId;
    req.apiKeyRole = "Read & Write";
    next();
  } catch (err: any) {
    console.error("Database connection notice during authentication:", err.message || err);
    res.status(503).json({
      error: "Database is waking up or temporarily unavailable. Please retry in a few seconds.",
      code: "DB_CONNECTION_RETRY",
    });
  }
}

function requireWriteAccess(req: Request, res: Response): boolean {
  if (req.apiKeyRole === "Read-Only") {
    res.status(403).json({ error: "This API key is read-only" });
    return false;
  }
  return true;
}

// Seed initial database records
seedInitialDataIfEmpty();

// -------------------------------------------------------------
// AUTHENTICATION API ROUTES (BACKED BY PRISMA ORM)
// -------------------------------------------------------------

/**
 * GOOGLE AUTH (LOGIN / SIGNUP)
 * Handles Google credential token from Google Identity Services or Google One-Tap/Popup
 */
app.post(
  "/api/auth/google",
  async (req: Request, res: Response): Promise<void> => {
    res
      .status(410)
      .json({ error: "Use Firebase Authentication for login and signup" });
    return;

    try {
      const { email, name, avatar } = req.body;

      let userEmail = email;
      let userName = name;
      let userAvatar = avatar;
      if (!userEmail) {
        res
          .status(400)
          .json({ error: "Email is required for Google authentication" });
        return;
      }

      // Upsert user into PostgreSQL via Prisma ORM
      const user = await prisma.user.upsert({
        where: { email: userEmail.toLowerCase().trim() },
        update: {
          name: userName || undefined,
          avatar: userAvatar || undefined,
          firebaseUid: undefined,
        },
        create: {
          email: userEmail.toLowerCase().trim(),
          name: userName || userEmail.split("@")[0],
          avatar:
            userAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              userName || userEmail
            )}`,
          firebaseUid: undefined,
          role: "user",
          plan: req.body.plan || "Pro",
        },
      });

      const existingKey = await prisma.apiKey.findFirst({ where: { userId: user.id } });
      const apiKey = existingKey || await prisma.apiKey.create({
        data: {
          userId: user.id,
          name: "Primary API Key",
          token: `phq_live_${randomBytes(24).toString("hex")}`,
          role: "Read-Only",
          status: "Active",
        },
      });


      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        success: true,
        message: "Google authentication successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          plan: user.plan,
        },
      });
    } catch (error: any) {
      console.error("Error in Google Auth:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to authenticate with Google" });
    }
  }
);

/**
 * FIREBASE AUTH SYNC (Google & Email/Password via Firebase SDK)
 * Syncs authenticated Firebase user to Prisma ORM database
 */
app.post(
  "/api/auth/firebase-sync",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Firebase authentication is required" });
        return;
      }

      const firebaseUser = await verifyFirebaseIdToken(authHeader.slice(7));
      const { plan } = req.body;
      const uid = firebaseUser.uid;
      const email = firebaseUser.email;
      const name = firebaseUser.name;
      const avatar = firebaseUser.picture;

      if (!email) {
        res
          .status(400)
          .json({ error: "Email is required from Firebase authentication" });
        return;
      }

      const cleanEmail = email.toLowerCase().trim();
      const displayName = name || cleanEmail.split("@")[0];
      const userAvatar =
        avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          displayName
        )}`;

      // Upsert into Prisma database
      const user = await prisma.user.upsert({
        where: { email: cleanEmail },
        update: {
          name: displayName,
          avatar: userAvatar,
          firebaseUid: uid,
        },
        create: {
          email: cleanEmail,
          name: displayName,
          avatar: userAvatar,
          firebaseUid: uid,
          role: "user",
          plan: plan || "Pro",
        },
      });

      const existingKey = await prisma.apiKey.findFirst({ where: { userId: user.id } });
      const apiKey = existingKey || await prisma.apiKey.create({
        data: {
          userId: user.id,
          name: "Primary API Key",
          token: `phq_live_${randomBytes(24).toString("hex")}`,
          role: "Read-Only",
          status: "Active",
        },
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        success: true,
        message: "Firebase authentication synchronized with Prisma database",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          plan: user.plan,
          provider: "firebase",
          apiSlug: user.apiSlug,
          apiUrl: `/api/v1/${user.apiSlug}/projects`,
          apiKey: apiKey.token,
        },
      });
    } catch (error: any) {
      console.error("Error in Firebase sync:", error);
      res
        .status(
          error?.code === "auth/id-token-expired" ||
            error?.code === "auth/argument-error"
            ? 401
            : 500
        )
        .json({
          error: error.message || "Failed to sync Firebase user with Prisma",
        });
    }
  }
);

/**
 * EMAIL & PASSWORD SIGN UP
 */
app.post(
  "/api/auth/signup",
  async (req: Request, res: Response): Promise<void> => {
    res
      .status(410)
      .json({ error: "Use Firebase Authentication for login and signup" });
    return;

    try {
      const { name, email, password, plan } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existing) {
        res.status(400).json({
          error: "An account with this email already exists. Please log in.",
        });
        return;
      }

      const user = await prisma.user.create({
        data: {
          name: name?.trim() || cleanEmail.split("@")[0],
          email: cleanEmail,
          plan: plan || "Pro",
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            name || cleanEmail
          )}`,
        },
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        success: true,
        message: "Account created successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          plan: user.plan,
        },
      });
    } catch (error: any) {
      console.error("Error in signup:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to create account" });
    }
  }
);

/**
 * EMAIL & PASSWORD LOGIN
 */
app.post(
  "/api/auth/login",
  async (_req: Request, res: Response): Promise<void> => {
    res
      .status(410)
      .json({ error: "Use Firebase Authentication for login and signup" });
  }
);

/**
 * GET CURRENT SESSION (VERIFY TOKEN)
 */
app.get("/api/auth/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ error: "Session expired or invalid" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        plan: true,
        createdAt: true,
        apiSlug: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const existingKey = await prisma.apiKey.findFirst({ where: { userId: user.id } });
    const apiKey = existingKey || await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: "Primary API Key",
        token: `phq_live_${randomBytes(24).toString("hex")}`,
        role: "Read-Only",
        status: "Active",
      },
    });

    res.json({
      user: {
        ...user,
        apiUrl: `/api/v1/${user.apiSlug}/projects`,
        apiKey: apiKey.token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// PRISMA REST API ENDPOINTS FOR COLLECTIONS
// -------------------------------------------------------------

app.use("/api/v1/:apiSlug", authenticateApiRequest);

// 0. Sections (Content & Assets Collections in Neon DB)
app.get("/api/v1/:apiSlug/sections", async (req: Request, res: Response) => {
  try {
    let sections = await prisma.section.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "asc" },
    });

    // If user has no sections yet in Neon DB, initialize default collections for them
    if (sections.length === 0 && req.userId) {
      const defaultSecs = [
        {
          userId: req.userId,
          name: "Projects",
          singularName: "Project",
          slug: "projects",
          icon: "shopping-bag",
          description: "Portfolio client projects, web apps, and case studies",
          fields: [
            { id: "f_title", key: "title", label: "Project Title", type: "text", required: true, isSystem: true, placeholder: "e.g. Acme Redesign" },
            { id: "f_category", key: "category", label: "Category", type: "text", required: true, placeholder: "e.g. E-commerce, Mobile" },
            { id: "f_status", key: "status", label: "Status", type: "select", required: true, isSystem: true, options: ["Live", "Draft", "Updated"] },
            { id: "f_summary", key: "summary", label: "Summary / Description", type: "textarea", placeholder: "Short overview of the project..." },
            { id: "f_client", key: "client", label: "Client", type: "text", placeholder: "e.g. Google, Stripe" },
            { id: "f_link", key: "link", label: "Live URL", type: "url", placeholder: "https://example.com" },
          ],
        },
        {
          userId: req.userId,
          name: "Blog Posts",
          singularName: "Blog Post",
          slug: "posts",
          icon: "file-text",
          description: "Technical articles, guides, and engineering thoughts",
          fields: [
            { id: "f_post_title", key: "title", label: "Post Title", type: "text", required: true, isSystem: true, placeholder: "e.g. Building Scalable APIs" },
            { id: "f_post_slug", key: "slug", label: "URL Slug", type: "text", required: true, isSystem: true, placeholder: "building-scalable-apis" },
            { id: "f_post_status", key: "status", label: "Status", type: "select", required: true, isSystem: true, options: ["Live", "Draft", "Updated"] },
            { id: "f_post_author", key: "author", label: "Author", type: "text", placeholder: "Author name" },
            { id: "f_post_excerpt", key: "excerpt", label: "Summary / Excerpt", type: "textarea", placeholder: "Brief article summary..." },
            { id: "f_post_body", key: "body", label: "Content (Markdown)", type: "textarea", placeholder: "Write your article in Markdown..." },
          ],
        },
      ];

      for (const sec of defaultSecs) {
        await prisma.section.create({ data: sec as any });
      }

      sections = await prisma.section.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: "asc" },
      });
    }

    res.json({ status: 200, count: sections.length, data: sections });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/v1/:apiSlug/sections", async (req: Request, res: Response) => {
  try {
    if (!requireWriteAccess(req, res)) return;
    const { name, singularName, slug, icon, description, fields } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ error: "Section name is required" });
      return;
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-");

    const section = await prisma.section.upsert({
      where: {
        userId_slug: {
          userId: req.userId!,
          slug: cleanSlug,
        },
      },
      update: {
        name: name.trim(),
        singularName: singularName?.trim() || name.trim(),
        icon: icon || "layers",
        description: description?.trim() || "",
        fields: typeof fields === "object" ? fields : JSON.parse(fields || "[]"),
      },
      create: {
        userId: req.userId!,
        name: name.trim(),
        singularName: singularName?.trim() || name.trim(),
        slug: cleanSlug,
        icon: icon || "layers",
        description: description?.trim() || "",
        fields: typeof fields === "object" ? fields : JSON.parse(fields || "[]"),
      },
    });

    res.status(201).json({ status: 201, data: section });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update section with verified ownership (fixes IDOR vulnerability)
app.put("/api/v1/:apiSlug/sections/:id", async (req: Request, res: Response) => {
  try {
    if (!requireWriteAccess(req, res)) return;
    const { id } = req.params;
    const { name, singularName, icon, description, fields } = req.body;

    const existing = await prisma.section.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) {
      res.status(404).json({ error: "Section not found or not owned by you" });
      return;
    }

    const section = await prisma.section.update({
      where: { id },
      data: {
        name,
        singularName,
        icon,
        description,
        fields: typeof fields === "object" ? fields : JSON.parse(fields || "[]"),
      },
    });

    res.json({ status: 200, data: section });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete section (cascades all items in this section automatically)
app.delete("/api/v1/:apiSlug/sections/:id", async (req: Request, res: Response) => {
  try {
    if (!requireWriteAccess(req, res)) return;
    const { id } = req.params;
    const deleted = await prisma.section.deleteMany({
      where: { id, userId: req.userId },
    });
    if (!deleted.count) {
      res.status(404).json({ error: "Section not found" });
      return;
    }
    res.json({ status: 200, message: "Section and its contents deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 1. API Keys Management
app.get("/api/v1/:apiSlug/keys", async (req: Request, res: Response) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ status: 200, data: keys });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/v1/:apiSlug/keys", async (req: Request, res: Response) => {
  try {
    if (!requireWriteAccess(req, res)) return;
    const { name, role } = req.body;
    const existingKey = await prisma.apiKey.findFirst({ where: { userId: req.userId } });
    if (existingKey) {
      res.status(409).json({ error: "Each user can have only one API key" });
      return;
    }
    const randomSuffix = randomBytes(24).toString("hex");
    const token = `phq_live_${randomSuffix}`;

    const key = await prisma.apiKey.create({
      data: {
        userId: req.userId!,
        name: name || "API Key",
        token,
        role: role || "Read-Only",
        status: "Active",
      },
    });
    res.status(201).json({ status: 201, data: key });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/v1/:apiSlug/keys/:id", async (req: Request, res: Response) => {
  try {
    if (!requireWriteAccess(req, res)) return;
    const { id } = req.params;
    const deletedKey = await prisma.apiKey.deleteMany({ where: { id, userId: req.userId } });
    if (!deletedKey.count) {
      res.status(404).json({ error: "API key not found" });
      return;
    }
    res.json({ status: 200, message: "Key deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to resolve a section by slug or name
async function resolveSection(userId: string, sectionSlug: string) {
  return prisma.section.findFirst({
    where: {
      userId,
      OR: [
        { slug: sectionSlug },
        { slug: sectionSlug.toLowerCase() },
        { name: { equals: sectionSlug, mode: "insensitive" } },
        ...(sectionSlug.toLowerCase() === "blog" ? [{ slug: "posts" }] : []),
      ],
    },
  });
}

// 2. UNIVERSAL DYNAMIC CRUD ENDPOINTS FOR ANY COLLECTION
// (Projects, Posts, Skills, Testimonials, Experience, etc.)

// GET /api/v1/:apiSlug/:sectionSlug (List items in section)
app.get("/api/v1/:apiSlug/:sectionSlug", async (req: Request, res: Response) => {
  try {
    const { sectionSlug } = req.params;
    const { status, limit } = req.query;

    const section = await resolveSection(req.userId!, sectionSlug);

    if (!section) {
      res.status(404).json({
        status: 404,
        error: `Section '${sectionSlug}' not found. Add this section in Content & Assets first.`,
      });
      return;
    }

    const where: any = { sectionId: section.id, userId: req.userId };
    if (status && status !== "all") {
      where.status = status as string;
    }

    const items = await prisma.contentItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit as string) : undefined,
    });

    const formatted = items.map((item) => {
      let customData = {};
      try {
        customData = typeof item.data === "string" ? JSON.parse(item.data) : (item.data || {});
      } catch {}
      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        status: item.status,
        category: item.category,
        summary: item.summary,
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "Just now",
        ...customData,
      };
    });

    res.json({
      status: 200,
      section: section.slug,
      sectionName: section.name,
      count: formatted.length,
      data: formatted,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/:apiSlug/:sectionSlug/:id (Get single item)
app.get("/api/v1/:apiSlug/:sectionSlug/:id", async (req: Request, res: Response) => {
  try {
    const { sectionSlug, id } = req.params;
    const section = await resolveSection(req.userId!, sectionSlug);
    if (!section) {
      res.status(404).json({ error: `Section '${sectionSlug}' not found` });
      return;
    }

    const item = await prisma.contentItem.findFirst({
      where: {
        userId: req.userId,
        sectionId: section.id,
        OR: [{ id }, { slug: id }],
      },
    });

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    let customData = {};
    try {
      customData = typeof item.data === "string" ? JSON.parse(item.data) : (item.data || {});
    } catch {}

    res.json({
      status: 200,
      data: {
        id: item.id,
        title: item.title,
        slug: item.slug,
        status: item.status,
        category: item.category,
        summary: item.summary,
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "Just now",
        ...customData,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/:apiSlug/:sectionSlug (Create item in section)
app.post("/api/v1/:apiSlug/:sectionSlug", async (req: Request, res: Response) => {
  try {
    if (!requireWriteAccess(req, res)) return;
    const { sectionSlug } = req.params;
    const { title, slug, category, status, summary, ...restData } = req.body;

    let section = await resolveSection(req.userId!, sectionSlug);

    // If section does not exist yet, auto-create it
    if (!section) {
      section = await prisma.section.create({
        data: {
          userId: req.userId!,
          name: sectionSlug.charAt(0).toUpperCase() + sectionSlug.slice(1),
          singularName: sectionSlug.replace(/s$/, ""),
          slug: sectionSlug.toLowerCase().trim(),
          icon: "layers",
          fields: [],
        },
      });
    }

    const fullCustomData = restData.data || restData;

    const item = await prisma.contentItem.create({
      data: {
        sectionId: section.id,
        userId: req.userId!,
        title: title || `Untitled ${section.singularName}`,
        slug: slug || undefined,
        category: category || "General",
        status: status || "Live",
        summary: summary || "",
        data: fullCustomData || {},
      },
    });

    let customData = {};
    try {
      customData = typeof item.data === "string" ? JSON.parse(item.data) : (item.data || {});
    } catch {}

    res.status(201).json({
      status: 201,
      data: {
        id: item.id,
        title: item.title,
        slug: item.slug,
        status: item.status,
        category: item.category,
        summary: item.summary,
        updatedAt: "Just now",
        ...customData,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/v1/:apiSlug/:sectionSlug/:id (Update item)
app.put("/api/v1/:apiSlug/:sectionSlug/:id", async (req: Request, res: Response) => {
  try {
    if (!requireWriteAccess(req, res)) return;
    const { id } = req.params;
    const { title, slug, category, status, summary, ...restData } = req.body;

    const existing = await prisma.contentItem.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const fullCustomData = restData.data || restData;

    const item = await prisma.contentItem.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        slug: slug !== undefined ? slug : existing.slug,
        category: category !== undefined ? category : existing.category,
        status: status !== undefined ? status : existing.status,
        summary: summary !== undefined ? summary : existing.summary,
        data: fullCustomData || existing.data,
      },
    });

    let customData = {};
    try {
      customData = typeof item.data === "string" ? JSON.parse(item.data) : (item.data || {});
    } catch {}

    res.json({
      status: 200,
      data: {
        id: item.id,
        title: item.title,
        slug: item.slug,
        status: item.status,
        category: item.category,
        summary: item.summary,
        ...customData,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/v1/:apiSlug/:sectionSlug/:id (Delete item)
app.delete("/api/v1/:apiSlug/:sectionSlug/:id", async (req: Request, res: Response) => {
  try {
    if (!requireWriteAccess(req, res)) return;
    const { id } = req.params;
    const deleted = await prisma.contentItem.deleteMany({
      where: { id, userId: req.userId },
    });

    if (!deleted.count) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    res.json({ status: 200, message: "Item deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DIRECT CUSTOM SECTION ROUTING (e.g. GET /skills, GET /api/skills, GET /api/:sectionSlug)
 * Allows developers and browser clients to fetch or post to sections directly
 */
async function resolveDirectUser(req: Request): Promise<{ userId: string; role: string } | null> {
  const authHeader = req.headers.authorization;
  let token = "";
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (req.headers["x-api-key"]) {
    token = String(req.headers["x-api-key"]).trim();
  } else if (req.query.apiKey) {
    token = String(req.query.apiKey).trim();
  }

  if (token) {
    const apiKey = await prisma.apiKey.findUnique({ where: { token } });
    if (apiKey && apiKey.status === "Active" && apiKey.userId) {
      return { userId: apiKey.userId, role: apiKey.role };
    }
    const decoded = verifyToken(token);
    if (decoded?.userId) {
      return { userId: decoded.userId, role: "Read & Write" };
    }
  }

  // Support public read access if user explicitly provides apiSlug in query or header
  const apiSlug = req.query.apiSlug || req.headers["x-api-slug"];
  if (apiSlug) {
    const owner = await prisma.user.findUnique({ where: { apiSlug: String(apiSlug) } });
    if (owner) {
      return { userId: owner.id, role: "Read-Only" };
    }
  }

  // If a single user is in the database, allow direct dev preview
  const singleUserCount = await prisma.user.count();
  if (singleUserCount === 1) {
    const onlyUser = await prisma.user.findFirst();
    if (onlyUser) {
      return { userId: onlyUser.id, role: "Read & Write" };
    }
  }

  return null;
}

app.all(["/skills", "/api/skills", "/api/v1/skills"], async (req: Request, res: Response) => {
  try {
    const userAuth = await resolveDirectUser(req);
    if (!userAuth) {
      res.status(401).json({ status: 401, error: "Authentication, API key, or ?apiSlug= query parameter required" });
      return;
    }

    let section = await prisma.section.findFirst({
      where: {
        userId: userAuth.userId,
        OR: [
          { slug: "skills" },
          { name: { equals: "skills", mode: "insensitive" } },
        ],
      },
    });

    if (req.method === "POST") {
      if (userAuth.role === "Read-Only") {
        res.status(403).json({ error: "Write access required" });
        return;
      }
      if (!section) {
        section = await prisma.section.create({
          data: {
            userId: userAuth.userId,
            name: "Skills",
            singularName: "Skill",
            slug: "skills",
            icon: "star",
            fields: [],
          },
        });
      }
      const { title, category, status, summary, ...rest } = req.body;
      const fullCustomData = rest.data || rest;
      const item = await prisma.contentItem.create({
        data: {
          sectionId: section.id,
          userId: userAuth.userId,
          title: title || "Untitled Skill",
          category: category || "General",
          status: status || "Live",
          summary: summary || "",
          data: fullCustomData || {},
        },
      });
      let customData = {};
      try {
        customData = typeof item.data === "string" ? JSON.parse(item.data) : (item.data || {});
      } catch {}
      res.status(201).json({
        status: 201,
        data: {
          id: item.id,
          title: item.title,
          status: item.status,
          category: item.category,
          summary: item.summary,
          updatedAt: "Just now",
          ...customData,
        },
      });
      return;
    }

    // GET /skills
    if (!section) {
      res.status(404).json({
        status: 404,
        error: "Section 'skills' not found. Add this section in Content & Assets first.",
      });
      return;
    }

    const { status, limit } = req.query;
    const where: any = { sectionId: section.id, userId: userAuth.userId };
    if (status && status !== "all") {
      where.status = status as string;
    }

    const items = await prisma.contentItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit as string) : undefined,
    });

    const formatted = items.map((item) => {
      let customData = {};
      try {
        customData = typeof item.data === "string" ? JSON.parse(item.data) : (item.data || {});
      } catch {}
      return {
        id: item.id,
        title: item.title,
        status: item.status,
        category: item.category,
        summary: item.summary,
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "Just now",
        ...customData,
      };
    });

    res.json({
      status: 200,
      section: section.slug,
      sectionName: section.name,
      count: formatted.length,
      data: formatted,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generic direct API route for any section: GET /api/:sectionSlug
app.get("/api/:sectionSlug", async (req: Request, res: Response, next: () => void) => {
  const { sectionSlug } = req.params;
  const reserved = ["auth", "v1"];
  if (reserved.includes(sectionSlug)) return next();

  try {
    const userAuth = await resolveDirectUser(req);
    if (!userAuth) {
      res.status(401).json({ status: 401, error: "Authentication, API key, or ?apiSlug= query parameter required" });
      return;
    }

    const section = await prisma.section.findFirst({
      where: {
        userId: userAuth.userId,
        OR: [
          { slug: sectionSlug },
          { slug: sectionSlug.toLowerCase() },
          { name: { equals: sectionSlug, mode: "insensitive" } },
        ],
      },
    });

    if (!section) {
      res.status(404).json({
        status: 404,
        error: `Section '${sectionSlug}' not found in Neon DB.`,
      });
      return;
    }

    const items = await prisma.contentItem.findMany({
      where: { sectionId: section.id, userId: userAuth.userId },
      orderBy: { createdAt: "desc" },
    });

    const formatted = items.map((item) => {
      let customData = {};
      try {
        customData = typeof item.data === "string" ? JSON.parse(item.data) : (item.data || {});
      } catch {}
      return {
        id: item.id,
        title: item.title,
        status: item.status,
        category: item.category,
        summary: item.summary,
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "Just now",
        ...customData,
      };
    });

    res.json({
      status: 200,
      section: section.slug,
      sectionName: section.name,
      count: formatted.length,
      data: formatted,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Serve the built client only in production. During development, Vite runs separately.
if (isProd) {
  app.use(express.static(path.resolve(__dirname, "../client/dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(
    `API server running on http://localhost:${PORT} with Prisma ORM PostgreSQL backend`
  );
});
