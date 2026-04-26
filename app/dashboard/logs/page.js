"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { 
  ClipboardList, 
  Search, 
  User, 
  Clock, 
  Activity,
  Filter,
  RefreshCw,
  Calendar
} from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const q = query(collection(db, "admin_logs"), orderBy("timestamp", "desc"), limit(100));
      const snap = await getDocs(q);
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching logs", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter(l => 
    l.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.targetId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="logs-page">
      <div className="card toolbar glass animate-fade-in">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search logs by admin, action or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="refresh-btn" onClick={fetchLogs}>
          <RefreshCw size={18} className={loading ? "animate-spin" : ""}/>
          <span>Refresh</span>
        </button>
      </div>

      <div className="card table-container glass animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Target ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center py-10">Loading logs...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-10">No activity logs found.</td></tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id} className="table-row">
                  <td>
                    <div className="date-cell">
                      <Clock size={14} />
                      {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : "Just now"}
                    </div>
                  </td>
                  <td>
                    <div className="admin-cell">
                      <User size={14} />
                      <span>{log.adminEmail}</span>
                    </div>
                  </td>
                  <td>
                    <span className="action-tag">{log.action}</span>
                  </td>
                  <td>
                    <span className="target-id">{log.targetId || "N/A"}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .logs-page { display: flex; flex-direction: column; gap: 24px; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; }
        .search-box { position: relative; width: 450px; }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .search-box input { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px 12px 48px; color: white; }
        
        .refresh-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px; background: var(--surface-hover);
          border: 1px solid var(--border); color: white; cursor: pointer; font-weight: 600;
        }

        .table-container { padding: 0; overflow: hidden; }
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 20px 24px; font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); }
        .table-row { border-bottom: 1px solid var(--border); transition: background 0.2s; }
        .table-row:hover { background: rgba(255,255,255,0.02); }
        .data-table td { padding: 16px 24px; }

        .date-cell, .admin-cell { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); }
        .admin-cell span { color: var(--text); font-weight: 500; }
        .action-tag { 
          padding: 4px 10px; background: rgba(37, 99, 235, 0.1); 
          color: var(--primary); border-radius: 6px; font-size: 12px; font-weight: 600;
        }
        .target-id { font-family: monospace; font-size: 12px; color: var(--text-muted); }

        .text-center { text-align: center; }
        .py-10 { padding: 40px 0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
