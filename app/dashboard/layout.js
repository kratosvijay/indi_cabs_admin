"use client";
import { useAuth } from "../../lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  MapPin, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  CreditCard
} from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Drivers", icon: Users, path: "/dashboard/drivers" },
    { name: "Rides", icon: Car, path: "/dashboard/rides" },
    { name: "Users", icon: Users, path: "/dashboard/users" },
    { name: "Payments", icon: CreditCard, path: "/dashboard/payments" },
    { name: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"} glass`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-symbol">I</span>
            {sidebarOpen && <span className="logo-text">Indi Cabs <span>Admin</span></span>}
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`nav-item ${pathname === item.path ? "active" : ""}`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={logout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar glass">
          <div className="page-title">
            <h2>{menuItems.find(item => item.path === pathname)?.name || "Admin"}</h2>
          </div>
          <div className="user-profile">
            <div className="user-info">
              <p className="user-name">{user.email}</p>
              <p className="user-role">Super Admin</p>
            </div>
            <div className="user-avatar">
              {user.email[0].toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="content-inner animate-fade-in">
          {children}
        </div>
      </main>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 280px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 24px;
          transition: width 0.3s ease;
          z-index: 100;
          border-right: 1px solid var(--border);
        }
        .sidebar.closed {
          width: 90px;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 48px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
        }
        .logo-symbol {
          background: var(--primary);
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .logo-text span {
          color: var(--accent);
          font-weight: 400;
        }
        .toggle-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .toggle-btn:hover {
          background: var(--surface-hover);
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        :global(.nav-item) {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          border-radius: 12px;
          color: var(--text-muted);
          transition: all 0.2s;
          white-space: nowrap;
          overflow: hidden;
        }
        :global(.nav-item:hover) {
          background: var(--surface-hover);
          color: var(--text);
        }
        :global(.nav-item.active) {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .sidebar-footer {
          margin-top: auto;
          border-top: 1px solid var(--border);
          padding-top: 24px;
        }
        .logout-btn {
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
        }

        .main-content {
          flex: 1;
          background: var(--background);
          padding: 24px;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          border-radius: 20px;
          margin-bottom: 32px;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .user-info {
          text-align: right;
        }
        .user-name {
          font-size: 14px;
          font-weight: 600;
        }
        .user-role {
          font-size: 12px;
          color: var(--text-muted);
        }
        .user-avatar {
          width: 44px;
          height: 44px;
          background: var(--surface-hover);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          border: 2px solid var(--border);
        }

        .loading-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--background);
        }
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--surface);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
