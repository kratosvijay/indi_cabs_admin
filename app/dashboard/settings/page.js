"use client";
import { useState } from "react";
import { useAuth } from "../../../lib/AuthContext";
import { 
  User, 
  Shield, 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  Database,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", name: "Profile Settings", icon: User },
    { id: "app", name: "App Config", icon: SettingsIcon },
    { id: "security", name: "Security", icon: Lock },
    { id: "status", name: "System Status", icon: Database },
  ];

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Sidebar Tabs */}
        <aside className="settings-sidebar glass">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.name}</span>
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="settings-content card glass">
          {activeTab === "profile" && (
            <div className="settings-section animate-fade-in">
              <h3>Admin Profile</h3>
              <p className="section-desc">Manage your personal information and how others see you.</p>
              
              <div className="profile-grid">
                <div className="avatar-upload">
                  <div className="large-avatar">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <button className="change-btn">Change Photo</button>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={user?.email || ""} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <input type="text" value="Super Admin" readOnly />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "app" && (
            <div className="settings-section animate-fade-in">
              <h3>App Configuration</h3>
              <p className="section-desc">Global settings for the Indi Cabs platform.</p>
              
              <div className="config-grid">
                <div className="config-card">
                  <div className="config-info">
                    <h4>Fare Calculation</h4>
                    <p>Base fare and per-km rates for different vehicle types.</p>
                  </div>
                  <button className="action-btn">Configure</button>
                </div>
                
                <div className="config-card">
                  <div className="config-info">
                    <h4>Platform Commission</h4>
                    <p>Current commission rate: 15%</p>
                  </div>
                  <button className="action-btn">Update</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "status" && (
            <div className="settings-section animate-fade-in">
              <h3>System Status</h3>
              <p className="section-desc">Real-time health of your infrastructure.</p>
              
              <div className="status-list">
                <div className="status-item">
                  <div className="status-indicator online"></div>
                  <div className="status-details">
                    <p className="status-label">Firebase Firestore</p>
                    <p className="status-value">Operational</p>
                  </div>
                  <CheckCircle size={20} className="text-success" />
                </div>
                
                <div className="status-item">
                  <div className="status-indicator online"></div>
                  <div className="status-details">
                    <p className="status-label">Authentication Service</p>
                    <p className="status-value">Operational</p>
                  </div>
                  <CheckCircle size={20} className="text-success" />
                </div>

                <div className="status-item">
                  <div className="status-indicator warning"></div>
                  <div className="status-details">
                    <p className="status-label">Cloud Functions</p>
                    <p className="status-value">Latency Detected</p>
                  </div>
                  <AlertTriangle size={20} className="text-warning" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          height: calc(100vh - 160px);
        }
        .settings-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          height: 100%;
        }
        
        .settings-sidebar {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          border-radius: 12px;
          border: none;
          background: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .tab-btn:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
        .tab-btn.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .settings-content {
          padding: 40px;
          overflow-y: auto;
        }
        .settings-section h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .section-desc {
          color: var(--text-muted);
          margin-bottom: 32px;
        }

        .profile-grid {
          display: flex;
          gap: 48px;
          align-items: flex-start;
        }
        .large-avatar {
          width: 120px;
          height: 120px;
          background: var(--primary);
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          border: 4px solid var(--border);
        }
        .change-btn {
          background: none;
          border: 1px solid var(--border);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          width: 100%;
        }

        .form-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .form-group input {
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--border);
          padding: 12px 16px;
          border-radius: 12px;
          color: white;
          outline: none;
        }

        .config-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .config-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 16px;
        }
        .config-info h4 { margin-bottom: 4px; }
        .config-info p { font-size: 14px; color: var(--text-muted); }
        .action-btn {
          background: var(--surface-hover);
          border: 1px solid var(--border);
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .status-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .status-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 24px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 16px;
        }
        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .status-indicator.online { background: var(--success); box-shadow: 0 0 10px var(--success); }
        .status-indicator.warning { background: var(--warning); box-shadow: 0 0 10px var(--warning); }
        .status-label { font-size: 13px; color: var(--text-muted); }
        .status-value { font-weight: 600; }
        .status-details { flex: 1; }
        
        .text-success { color: var(--success); }
        .text-warning { color: var(--warning); }
      `}</style>
    </div>
  );
}
