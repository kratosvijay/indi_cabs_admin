"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  Send, 
  Users, 
  Smartphone, 
  History, 
  Bell, 
  Info,
  CheckCircle,
  RefreshCw,
  Search
} from "lucide-react";

export default function NotificationsPage() {
  const [target, setTarget] = useState("all_users");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setFetchingHistory(true);
    try {
      const q = query(collection(db, "notifications"), orderBy("sentAt", "desc"));
      const snap = await getDocs(q);
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching notification history", err);
    } finally {
      setFetchingHistory(false);
    }
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !message) return alert("Please fill in all fields");

    setLoading(true);
    try {
      await addDoc(collection(db, "notifications"), {
        title,
        message,
        target,
        sentAt: serverTimestamp(),
        status: "sent"
      });
      
      // Reset form
      setTitle("");
      setMessage("");
      alert("Notification sent successfully!");
      fetchHistory();
    } catch (err) {
      alert("Error sending notification: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-grid">
        {/* Composer */}
        <div className="card composer glass animate-fade-in">
          <div className="card-header">
            <h3><Send size={20}/> Send Push Notification</h3>
            <p>Broadcast alerts to users and drivers instantly.</p>
          </div>

          <form onSubmit={handleSend}>
            <div className="form-group">
              <label>Target Audience</label>
              <select className="input-field" value={target} onChange={e => setTarget(e.target.value)}>
                <option value="all_users">All Users</option>
                <option value="all_drivers">All Drivers</option>
                <option value="specific_users">Specific Users (by ID)</option>
                <option value="specific_drivers">Specific Drivers (by ID)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Notification Title</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Special Offer!" 
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Message Content</label>
              <textarea 
                className="input-field" 
                placeholder="Type your message here..."
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <RefreshCw size={18} className="animate-spin"/> : <Send size={18}/>}
              Send Notification
            </button>
          </form>
        </div>

        {/* History */}
        <div className="card history glass animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="card-header">
            <h3><History size={20}/> Notification History</h3>
            <p>Recent broadcasts sent via admin panel.</p>
          </div>

          <div className="history-list">
            {fetchingHistory ? (
              <div className="text-center py-10"><RefreshCw className="animate-spin mx-auto"/></div>
            ) : history.length === 0 ? (
              <div className="text-center py-10 color-muted">No history found.</div>
            ) : history.map(item => (
              <div key={item.id} className="history-item">
                <div className="history-icon">
                  <Bell size={18}/>
                </div>
                <div className="history-info">
                  <div className="history-top">
                    <h4>{item.title}</h4>
                    <span className="sent-at">{item.sentAt?.seconds ? new Date(item.sentAt.seconds * 1000).toLocaleString() : "Just now"}</span>
                  </div>
                  <p className="msg">{item.message}</p>
                  <div className="history-meta">
                    <span className="target-badge">{item.target.replace('_', ' ')}</span>
                    <span className="status-badge"><CheckCircle size={10}/> Sent</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .notifications-page {
          height: 100%;
        }
        .notifications-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 24px;
          align-items: flex-start;
        }
        .card {
          padding: 32px;
          border-radius: 24px;
        }
        .card-header {
          margin-bottom: 32px;
        }
        .card-header h3 {
          display: flex; align-items: center; gap: 12px;
          font-size: 20px; margin-bottom: 8px;
        }
        .card-header p {
          font-size: 14px; color: var(--text-muted);
        }

        form {
          display: flex; flex-direction: column; gap: 24px;
        }
        .form-group {
          display: flex; flex-direction: column; gap: 8px;
        }
        .form-group label {
          font-size: 13px; font-weight: 600; color: var(--text-muted);
        }
        .input-field {
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px;
          color: white;
          width: 100%;
          outline: none;
          font-family: inherit;
        }
        .input-field:focus { border-color: var(--primary); }

        .btn-primary {
          background: var(--primary); color: white; border: none;
          padding: 16px; border-radius: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }

        .history-list {
          display: flex; flex-direction: column; gap: 16px;
          max-height: 600px; overflow-y: auto;
        }
        .history-item {
          display: flex; gap: 16px; padding: 20px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 16px;
        }
        .history-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(37, 99, 235, 0.1); color: var(--primary);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .history-info { flex: 1; min-width: 0; }
        .history-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
        .history-top h4 { font-size: 16px; font-weight: 600; }
        .sent-at { font-size: 12px; color: var(--text-muted); }
        .msg { font-size: 14px; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px; }
        .history-meta { display: flex; gap: 12px; align-items: center; }
        .target-badge {
          font-size: 10px; text-transform: uppercase; font-weight: 700;
          padding: 4px 8px; background: rgba(255,255,255,0.05);
          border-radius: 4px; color: var(--accent);
        }
        .status-badge {
          font-size: 10px; display: flex; align-items: center; gap: 4px;
          color: var(--success); font-weight: 700;
        }

        .text-center { text-align: center; }
        .py-10 { padding: 40px 0; }
        .color-muted { color: var(--text-muted); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
