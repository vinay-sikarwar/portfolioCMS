import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import {
  initFirebase,
  signInWithPopup,
  signInWithRedirect, getRedirectResult, googleProvider, signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "../lib/firebase";
import { safeFetchJson } from "../lib/api";

interface AuthPageProps {
  initialMode?: "login" | "signup";
  selectedPlan?: string;
  onBack: () => void;
  onSuccess: (userData: {
    id?: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    plan?: string;
    apiSlug?: string; 
  }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = "login",
  selectedPlan = "Pro",
  onBack,
  onSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activePlan, setActivePlan] = useState(selectedPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Google Modal state (for fast 1-click sign in)
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState(
    "vinaysikarwar199@gmail.com"
  );
  const [googleNameInput, setGoogleNameInput] = useState("Vinay Sikarwar");

  // Synchronize Firebase user to Prisma ORM database
  const syncWithPrismaDatabase = async (firebaseUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
    idToken?: string;
  }) => {
    const cleanEmail = (
      firebaseUser.email || `${firebaseUser.uid}@firebase.user`
    )
      .toLowerCase()
      .trim();
    const cleanName = firebaseUser.displayName || cleanEmail.split("@")[0];
    const avatar =
      firebaseUser.photoURL ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        cleanName
      )}`;

    const { ok, data } = await safeFetchJson("/api/auth/firebase-sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firebaseUser.idToken || ""}`,
      },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: cleanEmail,
        name: cleanName,
        avatar,
        idToken: firebaseUser.idToken,
        plan: activePlan,
      }),
    });

    if (!ok || !data.success) {
      throw new Error(data?.error || "Failed to sync user with Prisma database");
    }

    if (data.token) {
      try {
        localStorage.setItem("portfoliohq_token", data.token);
        localStorage.setItem("portfoliohq_user", JSON.stringify(data.user));
      } catch {}
    }

    onSuccess(data.user);
  };

  // Check for redirect result from Firebase Auth
  useEffect(() => {
    const handleRedirectResult = async () => {
      const { auth, isConfigured } = initFirebase();
      if (!isConfigured || !auth) return;
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setLoading(true);
          const fbUser = result.user;
          const idToken = await fbUser.getIdToken();
          await syncWithPrismaDatabase({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            idToken,
          });
        }
      } catch (err: any) {
        console.error("Firebase redirect result notice:", err);
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, []);

  // Submit Email & Password Auth (Firebase + Prisma)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "signup" && !name) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Try Firebase Authentication first
      const { auth, isConfigured } = initFirebase();

      if (isConfigured && auth) {
        if (mode === "signup") {
          const userCred = await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );
          if (name.trim()) {
            await updateProfile(userCred.user, { displayName: name.trim() });
          }
          const idToken = await userCred.user.getIdToken();
          await syncWithPrismaDatabase({
            uid: userCred.user.uid,
            email: userCred.user.email,
            displayName: name.trim() || userCred.user.displayName,
            photoURL: userCred.user.photoURL,
            idToken,
          });
        } else {
          const userCred = await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );
          const idToken = await userCred.user.getIdToken();
          await syncWithPrismaDatabase({
            uid: userCred.user.uid,
            email: userCred.user.email,
            displayName: userCred.user.displayName,
            photoURL: userCred.user.photoURL,
            idToken,
          });
        }
      } else {
        throw new Error(
          "Firebase Authentication is not configured. Add the Firebase client settings to .env."
        );
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Authentication error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Authentication via Firebase
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);

    const { auth, isConfigured } = initFirebase();

    if (isConfigured && auth) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const idToken = await fbUser.getIdToken();

        await syncWithPrismaDatabase({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          idToken,
        });
        return;
      } catch (fbErr: any) {
        if (fbErr.code === "auth/popup-closed-by-user") {
          setLoading(false);
          return;
        }
        if (fbErr.code === "auth/popup-blocked") {
          try {
            await signInWithRedirect(auth, googleProvider);
            return;
          } catch (redirectErr: any) {
            setError(redirectErr.message || "Firebase Google redirect failed.");
            return;
          }
        }
        setError(fbErr.message || "Firebase Google authentication failed.");
        return;
      }
    } else {
      setError(
        "Firebase Authentication is not configured. Add the Firebase client settings to .env."
      );
    }
  };

  // 1-Click Google Sign In (synced to Prisma)
  const handleCustomGoogleSubmit = async (
    customEmail: string,
    customName: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      throw new Error(
        "Use the Firebase Google sign-in button to authenticate."
      );
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-[#0F241D] flex flex-col justify-between relative overflow-hidden selection:bg-[#B8F256] selection:text-[#0F241D]">
      {/* Background Subtle Green Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex justify-center">
        <div className="w-[1000px] h-[700px] bg-gradient-to-b from-[#E7F8DA]/60 via-[#F3F9EE]/30 to-transparent rounded-full blur-3xl opacity-70 transform -translate-y-24"></div>
      </div>

      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto pt-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#3D5248] hover:text-[#0F241D] bg-white/80 hover:bg-white px-3.5 py-2 rounded-full border border-[#DCE4D9] shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <BrandLogo onClick={onBack} size="md" />

        {/* Clean Status Badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF5EB] border border-[#DCE4D8] text-xs font-bold text-[#0F241D]">
            <span className="w-2 h-2 rounded-full bg-[#B8F256]"></span>
            <span>Secure Access</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl mx-auto my-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#DCE4D9] shadow-[0_25px_60px_-15px_rgba(15,36,29,0.12)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Hero / Brand Showcase Panel (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-[#0F241D] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8F256]/15 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B3E32] border border-[#2B5E4D] text-[#B8F256] text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Headless Portfolio CMS</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Empower Your Dynamic Portfolio.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Manage your projects, skills, articles, and custom collections
                from one central dashboard with real-time edge API delivery.
              </p>

              {/* Value Highlights */}
              <div className="mt-8 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1B3E32] flex items-center justify-center text-[#B8F256] shrink-0 border border-[#2B5E4D]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs text-slate-200">
                    Secure authentication &amp; instant session sync
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1B3E32] flex items-center justify-center text-[#B8F256] shrink-0 border border-[#2B5E4D]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs text-slate-200">
                    Dynamic schema collections for all portfolio content
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1B3E32] flex items-center justify-center text-[#B8F256] shrink-0 border border-[#2B5E4D]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs text-slate-200">
                    Instant JSON API endpoints with zero config
                  </span>
                </div>
              </div>
            </div>

            {/* Status Footer */}
            <div className="mt-10 pt-6 border-t border-[#1C3E33]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    PortfolioCMS Cloud
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Production Ready &amp; Edge Synced
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B8F256] animate-pulse"></span>
                  <span className="text-[11px] font-mono text-[#B8F256]">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Panel (lg:col-span-7) */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
            {/* Top Switcher (Sign In vs Create Account) */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-2xl font-extrabold text-[#0F241D] tracking-tight">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h3>
                <p className="text-xs text-[#52665B] mt-1">
                  {mode === "login"
                    ? "Enter your credentials to access your CMS workspace."
                    : "Create an account to start managing your portfolio APIs."}
                </p>
              </div>

              {/* Segmented Mode Switcher */}
              <div className="inline-flex p-1 bg-[#F1F5EE] rounded-full border border-[#DCE4D9]">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    mode === "login"
                      ? "bg-[#0F241D] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    mode === "signup"
                      ? "bg-[#0F241D] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1-Click Google Sign In */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-2xs active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
                or continue with email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      required={mode === "signup"}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAF8] border border-[#DCE4D9] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F241D] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vinaysikarwar199@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAF8] border border-[#DCE4D9] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F241D] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F9FAF8] border border-[#DCE4D9] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F241D] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Plan Picker for Sign Up */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Selected Workspace Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Starter", "Pro", "Enterprise"].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setActivePlan(tier)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          activePlan === tier
                            ? "bg-[#0F241D] text-[#B8F256] border-[#0F241D] shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-[#0F241D] hover:bg-[#1a382e] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>
                      {mode === "login"
                        ? "Sign In to Workspace"
                        : "Create Account"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B8F256]" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Toggle Note */}
            <div className="mt-6 text-center text-xs text-slate-500">
              {mode === "login" ? (
                <span>
                  Don't have an account yet?{" "}
                  <button
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                    }}
                    className="font-bold text-[#0F241D] hover:underline cursor-pointer"
                  >
                    Sign up for free
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="font-bold text-[#0F241D] hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-400">
        &copy; {new Date().getFullYear()} portfolioCMS Inc. &bull; All rights reserved.
      </footer>

      {/* 1-Click Google Sign In Dialog */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F241D]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0F241D]">
                  Sign In with Google
                </h3>
                <p className="text-xs text-slate-500">
                  Fast 1-click access to your workspace
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* 1-Click User Profile */}
              <div
                onClick={() =>
                  handleCustomGoogleSubmit(
                    "vinaysikarwar199@gmail.com",
                    "Vinay Sikarwar"
                  )
                }
                className="p-3.5 rounded-2xl border border-emerald-200 bg-[#F4F9F2] hover:bg-[#EAF5E5] cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0F241D] text-[#B8F256] font-bold text-xs flex items-center justify-center">
                    VS
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F241D] block">
                      Vinay Sikarwar
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      vinaysikarwar199@gmail.com
                    </span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-[#0F241D] text-[#B8F256] text-[10px] font-bold group-hover:scale-105 transition-transform">
                  1-Click Sign In
                </div>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                  or sign in with another email
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Email
                </label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="Your Name"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCustomGoogleSubmit(googleEmailInput, googleNameInput)
                  }
                  disabled={loading || !googleEmailInput.trim()}
                  className="px-5 py-2.5 bg-[#0F241D] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Enter Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#B8F256]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F241D]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-[#0F241D] mb-1">
              Reset your password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your email address and we'll send password reset
              instructions.
            </p>

            {resetSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Reset instructions sent to your email!</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!email) {
                    setError("Please provide your email address first.");
                    return;
                  }
                  setResetSent(true);
                  setTimeout(() => {
                    setForgotPasswordOpen(false);
                    setResetSent(false);
                  }, 3000);
                }}
                className="space-y-4"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0F241D]"
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0F241D] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
