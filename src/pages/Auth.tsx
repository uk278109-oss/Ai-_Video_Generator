import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const resetPassword = async () => {
    setError("");
    if (!auth || !email.trim()) { setError("Enter your email first."); return; }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setError("Password reset email sent. Check your inbox.");
    } catch {
      setError("Could not send the reset email. Check the email address.");
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!auth || !db) {
      setError("Firebase is not configured. Add your VITE_FIREBASE_* values to .env.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(result.user, { displayName: name.trim() });
        await setDoc(doc(db, "users", result.user.uid), {
          displayName: name.trim(),
          email: email.trim(),
          createdAt: serverTimestamp(),
          memoryEnabled: true
        }, { merge: true });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      const code = (err as { code?: string }).code || "";
      const messages: Record<string, string> = {
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please try again later."
      };
      setError(messages[code] || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo"><Sparkles size={22} /> WORLD AI</div>
        <div className="auth-heading">
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p>{mode === "login" ? "Continue to your personal AI workspace." : "Your chats, preferences and memory stay with your account."}</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && (
            <label className="field">
              <span>Name</span>
              <div className="field-input"><UserRound size={18} /><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" /></div>
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <div className="field-input"><Mail size={18} /><input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" /></div>
          </label>
          <label className="field">
            <span>Password</span>
            <div className="field-input"><LockKeyhole size={18} /><input value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} /><button type="button" onClick={() => setShowPassword(v => !v)} aria-label="Show password">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
          {mode === "login" && <button type="button" className="forgot-button" onClick={() => void resetPassword()}>Forgot password?</button>}
        </form>
        <button className="switch-auth" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
          {mode === "login" ? "New to WORLD AI? Create an account" : "Already have an account? Log in"}
        </button>
      </section>
    </main>
  );
}
