"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where
} from "firebase/firestore";
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  MoreVertical,
  Activity
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  }

  const resolveName = (u) => {
    if (u.name) return u.name;
    if (u.displayName) return u.displayName;
    if (u.firstName || u.lastName) {
      return `${u.firstName || ""} ${u.lastName || ""}`.trim();
    }
    return "Guest";
  };

  const filteredUsers = users.filter(u => 
    (resolveName(u).toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.phoneNumber?.includes(searchTerm))
  );

  return (
    <div className="users-page">
      <div className="card toolbar glass">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search users by name, email or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card table-container glass">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact Info</th>
              <th>Status</th>
              <th>Member Since</th>
              <th>Rides</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10">Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-10">No users found.</td></tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="table-row">
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar">
                        {user.photoURL || user.photoUrl ? (
                          <img src={user.photoURL || user.photoUrl} alt="" />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <p className="user-name">{resolveName(user)}</p>
                        <p className="user-id">#{user.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <p><Mail size={14} /> {user.email || "No email"}</p>
                      <p><Phone size={14} /> {user.phoneNumber || "No phone"}</p>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge active">Active</span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
                    </div>
                  </td>
                  <td>
                    <div className="activity-cell">
                      <Activity size={14} />
                      <span>{user.totalRides || 0} Rides</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .users-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .toolbar {
          padding: 16px 24px;
        }
        .search-box {
          position: relative;
          max-width: 500px;
        }
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .search-box input {
          width: 100%;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px 12px 48px;
          color: white;
        }

        .table-container {
          padding: 0;
          overflow: hidden;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .data-table th {
          padding: 20px 24px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }
        .table-row {
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
        }
        .table-row:hover {
          background: rgba(255,255,255,0.02);
        }
        .data-table td {
          padding: 16px 24px;
        }

        .user-info-cell {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          background: var(--surface-hover);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .user-name { font-weight: 600; }
        .user-id { font-size: 12px; color: var(--text-muted); }

        .contact-cell p, .date-cell, .activity-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .status-badge.active {
          padding: 4px 10px;
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
