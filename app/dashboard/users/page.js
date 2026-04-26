"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  MoreVertical,
  Activity,
  UserX,
  Trash2,
  MapPin,
  History,
  X,
  AlertTriangle
} from "lucide-react";
import { logAdminAction } from "../../../lib/utils";
import { useAuth } from "../../../lib/AuthContext";

export default function UsersPage() {
  const { user: adminUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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

  const handleToggleBlock = async (user) => {
    const newStatus = user.status === "blocked" ? "active" : "blocked";
    if (!confirm(`Are you sure you want to ${newStatus === 'blocked' ? 'block' : 'unblock'} this user?`)) return;
    
    try {
      await updateDoc(doc(db, "users", user.id), { status: newStatus });
      await logAdminAction(db, adminUser.email, `${newStatus === 'blocked' ? 'Blocked' : 'Unblocked'} user`, user.id);
      fetchUsers();
    } catch (err) {
      alert("Error updating user status: " + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      await logAdminAction(db, adminUser.email, `Deleted user account`, userId);
      setUsers(users.filter(u => u.id !== userId));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10">Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10">No users found.</td></tr>
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
                    <span className={`status-badge ${user.status || 'active'}`}>{user.status || 'Active'}</span>
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
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn view" onClick={() => setSelectedUser(user)} title="View Profile">
                        <MoreVertical size={18} />
                      </button>
                      <button 
                        className={`action-btn ${user.status === 'blocked' ? 'unblock' : 'block'}`} 
                        onClick={() => handleToggleBlock(user)}
                        title={user.status === 'blocked' ? 'Unblock' : 'Block'}
                      >
                        <UserX size={18} />
                      </button>
                      <button className="action-btn delete" onClick={() => setShowDeleteConfirm(user.id)} title="Delete Account">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Profile Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content glass animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Profile</h2>
              <button className="close-btn" onClick={() => setSelectedUser(null)}><X size={24}/></button>
            </div>
            
            <div className="profile-details">
              <div className="profile-main">
                <div className="large-avatar">
                  {selectedUser.photoURL ? <img src={selectedUser.photoURL} alt=""/> : <User size={48}/>}
                </div>
                <div className="main-info">
                  <h3>{resolveName(selectedUser)}</h3>
                  <p className="uid">ID: {selectedUser.id}</p>
                  <span className={`status-badge ${selectedUser.status || 'active'}`}>{selectedUser.status || 'Active'}</span>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <label><Mail size={14}/> Email</label>
                  <p>{selectedUser.email || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label><Phone size={14}/> Phone</label>
                  <p>{selectedUser.phoneNumber || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label><Calendar size={14}/> Joined</label>
                  <p>{selectedUser.createdAt ? new Date(selectedUser.createdAt.seconds * 1000).toLocaleString() : "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label><Activity size={14}/> Total Rides</label>
                  <p>{selectedUser.totalRides || 0}</p>
                </div>
              </div>

              <div className="saved-locations">
                <h4><MapPin size={16}/> Saved Locations</h4>
                <div className="locations-list">
                  {selectedUser.savedLocations && Object.entries(selectedUser.savedLocations).length > 0 ? (
                    Object.entries(selectedUser.savedLocations).map(([key, loc]) => (
                      <div key={key} className="location-tag">
                        <strong>{key}:</strong> {loc.address || loc}
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No saved locations</p>
                  )}
                </div>
              </div>

              <div className="ride-history-preview">
                <h4><History size={16}/> Recent Activity</h4>
                <p className="no-data">View full history in Rides section</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="confirm-modal glass animate-fade-in" onClick={e => e.stopPropagation()}>
            <AlertTriangle size={48} className="text-danger mb-4"/>
            <h3>Delete Account?</h3>
            <p>This action is permanent and cannot be undone. All user data will be lost.</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDeleteUser(showDeleteConfirm)}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}

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
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }
        .status-badge.blocked {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
        }

        .actions-cell { display: flex; gap: 8px; }
        .action-btn {
          width: 34px; height: 34px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.05);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn.view:hover { background: var(--primary); color: white; border-color: var(--primary); }
        .action-btn.block:hover { background: #f59e0b; color: white; border-color: #f59e0b; }
        .action-btn.unblock:hover { background: var(--success); color: white; border-color: var(--success); }
        .action-btn.delete:hover { background: var(--danger); color: white; border-color: var(--danger); }

        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-content {
          width: 100%; max-width: 600px;
          padding: 32px; border-radius: 24px;
          position: relative;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px;
        }
        .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }

        .profile-main { display: flex; gap: 24px; align-items: center; margin-bottom: 32px; }
        .large-avatar {
          width: 80px; height: 80px;
          border-radius: 20px; background: var(--surface-hover);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; border: 2px solid var(--border);
        }
        .large-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .main-info h3 { font-size: 24px; margin-bottom: 4px; }
        .uid { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }

        .details-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
          margin-bottom: 32px; padding: 24px;
          background: rgba(255,255,255,0.03); border-radius: 16px;
        }
        .detail-item label {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--text-muted); text-transform: uppercase;
          margin-bottom: 6px;
        }
        .detail-item p { font-weight: 500; }

        .saved-locations h4, .ride-history-preview h4 {
          display: flex; align-items: center; gap: 8px;
          font-size: 16px; margin-bottom: 12px;
        }
        .locations-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .location-tag {
          padding: 8px 14px; background: rgba(255,255,255,0.05);
          border: 1px solid var(--border); border-radius: 10px; font-size: 13px;
        }
        .no-data { font-size: 13px; color: var(--text-muted); font-style: italic; }

        .confirm-modal {
          width: 400px; padding: 32px; text-align: center; border-radius: 24px;
        }
        .confirm-actions { display: flex; gap: 12px; margin-top: 24px; }
        .confirm-actions button { flex: 1; padding: 12px; border-radius: 12px; cursor: pointer; font-weight: 600; }
        .btn-secondary { background: var(--surface-hover); border: 1px solid var(--border); color: white; }
        .btn-danger { background: var(--danger); border: none; color: white; }
        .text-danger { color: var(--danger); }
        .mb-4 { margin-bottom: 1rem; }
      `}</style>
    </div>
  );
}
