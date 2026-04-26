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
  AlertTriangle,
  RefreshCw,
  Save,
  Globe,
  Smartphone,
  Info
} from "lucide-react";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { logAdminAction } from "../../../lib/utils";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // App Config States
  const [config, setConfig] = useState({
    baseFare: 50,
    pricePerKm: 15,
    surgeMultiplier: 1.0,
    commission: 15,
    minFare: 70,
    cancellationCharge: 30,
    appVersion: "1.0.0",
    forceUpdate: false,
    supportPhone: "+91 9876543210",
    supportEmail: "support@indicabs.com"
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const docSnap = await getDoc(doc(db, "settings", "global"));
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }
    } catch (err) {
      console.error("Error fetching config", err);
    }
  }

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "settings", "global"), config);
      await logAdminAction(db, user.email, "Updated platform configuration");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Error saving settings: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
              <div className="section-header">
                <div>
                  <h3>Platform Configuration</h3>
                  <p className="section-desc">Global settings for the Indi Cabs platform.</p>
                </div>
                <button className="btn-primary" onClick={handleSaveConfig} disabled={loading}>
                  {loading ? <RefreshCw size={18} className="animate-spin"/> : <Save size={18}/>}
                  {saveSuccess ? "Saved!" : "Save Changes"}
                </button>
              </div>
              
              <div className="config-groups">
                <div className="config-group-card card">
                  <h4><DollarSign size={16}/> Fare & Commission</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Base Fare (₹)</label>
                      <input type="number" value={config.baseFare} onChange={e => setConfig({...config, baseFare: Number(e.target.value)})}/>
                    </div>
                    <div className="form-group">
                      <label>Price Per KM (₹)</label>
                      <input type="number" value={config.pricePerKm} onChange={e => setConfig({...config, pricePerKm: Number(e.target.value)})}/>
                    </div>
                    <div className="form-group">
                      <label>Platform Commission (%)</label>
                      <input type="number" value={config.commission} onChange={e => setConfig({...config, commission: Number(e.target.value)})}/>
                    </div>
                    <div className="form-group">
                      <label>Cancellation Charge (₹)</label>
                      <input type="number" value={config.cancellationCharge} onChange={e => setConfig({...config, cancellationCharge: Number(e.target.value)})}/>
                    </div>
                    <div className="form-group">
                      <label>Surge Multiplier</label>
                      <input type="number" step="0.1" value={config.surgeMultiplier} onChange={e => setConfig({...config, surgeMultiplier: Number(e.target.value)})}/>
                    </div>
                    <div className="form-group">
                      <label>Minimum Fare (₹)</label>
                      <input type="number" value={config.minFare} onChange={e => setConfig({...config, minFare: Number(e.target.value)})}/>
                    </div>
                  </div>
                </div>

                <div className="config-group-card card">
                  <h4><Smartphone size={16}/> App Version Control</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Current App Version</label>
                      <input type="text" value={config.appVersion} onChange={e => setConfig({...config, appVersion: e.target.value})}/>
                    </div>
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={config.forceUpdate} onChange={e => setConfig({...config, forceUpdate: e.target.checked})}/>
                        Force Update Required
                      </label>
                    </div>
                  </div>
                </div>

                <div className="config-group-card card">
                  <h4><Info size={16}/> Support & Legal</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Support Phone</label>
                      <input type="text" value={config.supportPhone} onChange={e => setConfig({...config, supportPhone: e.target.value})}/>
                    </div>
                    <div className="form-group">
                      <label>Support Email</label>
                      <input type="email" value={config.supportEmail} onChange={e => setConfig({...config, supportEmail: e.target.value})}/>
                    </div>
                  </div>
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

        .config-groups {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .config-group-card {
          padding: 24px;
          border-radius: 20px;
        }
        .config-group-card h4 {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 24px; font-size: 16px; color: var(--accent);
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }
        
        .section-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 32px;
        }

        .checkbox-group {
          justify-content: center;
        }
        .checkbox-label {
          display: flex; align-items: center; gap: 12px;
          cursor: pointer; font-size: 14px; font-weight: 600;
        }
        .checkbox-label input {
          width: 20px; height: 20px; accent-color: var(--primary);
        }

        .btn-primary {
          background: var(--primary); color: white; border: none;
          padding: 12px 24px; border-radius: 12px; font-weight: 600;
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        
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
