"use client";
import { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, Loader2, ChevronRight } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // check if admin email matches or check the admins collection
      if (email === "admin@indicabs.net") {
        router.push("/dashboard");
      } else {
        // Fallback: Check 'admins' collection in Firestore
        const adminQuery = query(collection(db, "admins"), where("uid", "==", user.uid));
        const adminSnapshot = await getDocs(adminQuery);
        
        if (!adminSnapshot.empty) {
          router.push("/dashboard");
        } else {
          await auth.signOut();
          setError("Access Denied: You do not have administrator privileges.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in card glass">
        <div className="login-header">
          <div className="logo-icon">
            <Shield size={32} color="#fbbf24" fill="#fbbf2433" />
          </div>
          <h1>Indi Cabs <span>Admin</span></h1>
          <p>Sign in to manage your fleet operations</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="Email address"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Sign In <ChevronRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 Indiverse Tech Services</p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          background: radial-gradient(circle at top right, #1e293b, #0f1117);
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          text-align: center;
        }
        .login-header h1 {
          font-size: 28px;
          margin-top: 16px;
          font-weight: 700;
        }
        .login-header h1 span {
          color: var(--accent);
          font-weight: 400;
        }
        .login-header p {
          color: var(--text-muted);
          margin: 8px 0 32px;
          font-size: 14px;
        }
        .logo-icon {
          background: rgba(251, 191, 36, 0.1);
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .input-group {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .input-group :global(.input-field) {
          padding-left: 48px;
        }
        .error-message {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
        }
        .login-footer {
          margin-top: 32px;
          color: var(--text-muted);
          font-size: 12px;
        }
        .w-full { width: 100%; }
      `}</style>
    </div>
  );
}
