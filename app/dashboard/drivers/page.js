"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  where,
  deleteDoc
} from "firebase/firestore";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  MoreVertical,
  Eye,
  Check,
  X,
  UserX,
  FileText,
  AlertTriangle,
  History,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { logAdminAction } from "../../../lib/utils";
import { useAuth } from "../../../lib/AuthContext";

export default function DriversPage() {
  const { user: adminUser } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, [statusFilter]);

  async function fetchDrivers() {
    setLoading(true);
    try {
      let driversQuery = query(collection(db, "drivers"), orderBy("createdAt", "desc"));
      
      if (statusFilter !== "all") {
        driversQuery = query(collection(db, "drivers"), where("status", "==", statusFilter), orderBy("createdAt", "desc"));
      }

      const snap = await getDocs(driversQuery);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrivers(data);
    } catch (err) {
      console.error("Error fetching drivers", err);
    } finally {
      setLoading(false);
    }
  }

   const handleApprove = async (driverId) => {
    if (!confirm("Approve this driver? They will be allowed to take rides.")) return;
    try {
      await updateDoc(doc(db, "drivers", driverId), { status: "approved", approvedAt: new Date() });
      await logAdminAction(db, adminUser.email, "Approved driver", driverId);
      fetchDrivers();
    } catch (err) { alert("Error approving driver: " + err.message); }
  };

  const handleReject = async (driverId) => {
    if (!confirm("Reject this driver?")) return;
    try {
      await updateDoc(doc(db, "drivers", driverId), { status: "rejected" });
      await logAdminAction(db, adminUser.email, "Rejected driver", driverId);
      fetchDrivers();
    } catch (err) { alert("Error rejecting driver: " + err.message); }
  };

  const handleDeactivate = async (driverId) => {
    if (!confirm("Deactivate this driver? They will not be able to take rides.")) return;
    try {
      await updateDoc(doc(db, "drivers", driverId), { status: "deactivated" });
      await logAdminAction(db, adminUser.email, "Deactivated driver", driverId);
      fetchDrivers();
    } catch (err) { alert("Error deactivating driver: " + err.message); }
  };

  const handleActivate = async (driverId) => {
    try {
      await updateDoc(doc(db, "drivers", driverId), { status: "approved" });
      await logAdminAction(db, adminUser.email, "Activated driver", driverId);
      fetchDrivers();
    } catch (err) { alert("Error activating driver: " + err.message); }
  };

  const resolveName = (d) => {
    if (d.name) return d.name;
    if (d.displayName) return d.displayName;
    if (d.firstName || d.lastName) {
      return `${d.firstName || ""} ${d.lastName || ""}`.trim();
    }
    if (d.companyName) return d.companyName;
    return "Unnamed Driver";
  };

  const filteredDrivers = drivers.filter(d => 
    (resolveName(d).toLowerCase().includes(searchTerm.toLowerCase()) || 
     d.phoneNumber?.includes(searchTerm) || 
     d.id.includes(searchTerm))
  );

  return (
    <div className="drivers-page">
      <div className="card toolbar glass">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, phone, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <div className="filter-item">
            <Filter size={18} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card table-container glass">
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10">Loading drivers...</td></tr>
            ) : filteredDrivers.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-10">No drivers found.</td></tr>
            ) : (
              filteredDrivers.map(driver => (
                <tr key={driver.id} className="table-row">
                  <td>
                    <div className="driver-info-cell">
                      <div className="driver-avatar">
                        {driver.photoURL || driver.photoUrl ? (
                          <img src={driver.photoURL || driver.photoUrl} alt="" />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <p className="driver-name">{resolveName(driver)}</p>
                        <p className="driver-id">{driver.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <p><Phone size={14} /> {driver.phoneNumber}</p>
                      <p><Mail size={14} /> {driver.email || "N/A"}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${driver.status || 'pending'}`}>
                      {driver.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      {driver.createdAt ? new Date(driver.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
                    </div>
                  </td>
                  <td>
                     <div className="actions-cell">
                      <button className="action-btn view-btn" title="View Details" onClick={() => setSelectedDriver(driver)}>
                        <Eye size={18} />
                      </button>
                      {driver.status === "pending" && (
                        <>
                          <button className="action-btn approve-btn" title="Approve" onClick={() => handleApprove(driver.id)}>
                            <Check size={18} />
                          </button>
                          <button className="action-btn reject-btn" title="Reject" onClick={() => handleReject(driver.id)}>
                            <X size={18} />
                          </button>
                        </>
                      )}
                      {driver.status === "approved" && (
                        <button className="action-btn deactivate-btn" title="Deactivate" onClick={() => handleDeactivate(driver.id)}>
                          <UserX size={18} />
                        </button>
                      )}
                      {(driver.status === "rejected" || driver.status === "deactivated") && (
                        <button className="action-btn activate-btn" title="Activate" onClick={() => handleActivate(driver.id)}>
                          <Check size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Driver Profile Modal */}
      {selectedDriver && (
        <div className="modal-overlay" onClick={() => setSelectedDriver(null)}>
          <div className="modal-content glass animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Driver Profile</h2>
              <button className="close-btn" onClick={() => setSelectedDriver(null)}><X size={24}/></button>
            </div>

            <div className="profile-details">
              <div className="profile-main">
                <div className="large-avatar">
                  {selectedDriver.photoURL || selectedDriver.photoUrl ? (
                    <img src={selectedDriver.photoURL || selectedDriver.photoUrl} alt=""/>
                  ) : <User size={40}/>}
                </div>
                <div className="main-info">
                  <h3>{resolveName(selectedDriver)}</h3>
                  <p className="uid">ID: {selectedDriver.id}</p>
                  <span className={`status-badge ${selectedDriver.status || 'pending'}`}>
                    {selectedDriver.status || 'pending'}
                  </span>
                </div>
              </div>

              <div className="tabs-container">
                <div className="details-grid">
                  <div className="detail-item">
                    <label><Phone size={14}/> Phone</label>
                    <p>{selectedDriver.phoneNumber}</p>
                  </div>
                  <div className="detail-item">
                    <label><Mail size={14}/> Email</label>
                    <p>{selectedDriver.email || "N/A"}</p>
                  </div>
                  <div className="detail-item">
                    <label><TrendingUp size={14}/> Rating</label>
                    <p>{selectedDriver.rating || "N/A"} ⭐</p>
                  </div>
                  <div className="detail-item">
                    <label><CreditCard size={14}/> Total Earnings</label>
                    <p>₹{selectedDriver.earnings || 0}</p>
                  </div>
                </div>

                <div className="documents-section">
                  <h4><FileText size={16}/> Verification Documents</h4>
                  <div className="docs-grid">
                    <div className="doc-card">
                      <p className="doc-label">Aadhar Card</p>
                      {selectedDriver.aadharUrl ? <img src={selectedDriver.aadharUrl} alt="Aadhar"/> : <div className="no-doc">Not Uploaded</div>}
                    </div>
                    <div className="doc-card">
                      <p className="doc-label">Driving License</p>
                      {selectedDriver.licenseUrl ? <img src={selectedDriver.licenseUrl} alt="License"/> : <div className="no-doc">Not Uploaded</div>}
                    </div>
                    <div className="doc-card">
                      <p className="doc-label">Vehicle RC</p>
                      {selectedDriver.rcUrl ? <img src={selectedDriver.rcUrl} alt="RC"/> : <div className="no-doc">Not Uploaded</div>}
                    </div>
                  </div>
                </div>

                <div className="vehicle-info">
                  <h4><History size={16}/> Vehicle Details</h4>
                  <div className="info-row">
                    <span>Model:</span> <strong>{selectedDriver.carModel || "N/A"}</strong>
                  </div>
                  <div className="info-row">
                    <span>Number:</span> <strong>{selectedDriver.carNumber || "N/A"}</strong>
                  </div>
                  <div className="info-row">
                    <span>Type:</span> <strong>{selectedDriver.carType || "Standard"}</strong>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {selectedDriver.status === "pending" && (
                  <>
                    <button className="btn-approve" onClick={() => {handleApprove(selectedDriver.id); setSelectedDriver(null);}}>Approve Driver</button>
                    <button className="btn-reject" onClick={() => {handleReject(selectedDriver.id); setSelectedDriver(null);}}>Reject Driver</button>
                  </>
                )}
                {selectedDriver.status === "approved" && (
                   <button className="btn-reject" onClick={() => {handleDeactivate(selectedDriver.id); setSelectedDriver(null);}}>Deactivate Driver</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .drivers-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
        }
        .search-box {
          position: relative;
          width: 380px;
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
        .filters {
          display: flex;
          gap: 16px;
        }
        .filter-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          background: rgba(0,0,0,0.2);
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid var(--border);
        }
        .filter-item select {
          background: none;
          border: none;
          color: white;
          font-weight: 500;
          cursor: pointer;
          outline: none;
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
          letter-spacing: 0.05em;
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

        .driver-info-cell {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .driver-avatar {
          width: 44px;
          height: 44px;
          background: var(--surface-hover);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 2px solid var(--border);
        }
        .driver-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .driver-name { font-weight: 600; font-size: 15px; }
        .driver-id { font-size: 12px; color: var(--text-muted); }

        .contact-cell p, .date-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-badge.approved { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-badge.rejected, .status-badge.deactivated { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

        .actions-cell {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.05);
          color: var(--text-muted);
        }
        .view-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }
        .approve-btn:hover, .activate-btn:hover { background: var(--success); color: white; border-color: var(--success); }
        .reject-btn:hover, .deactivate-btn:hover { background: var(--danger); color: white; border-color: var(--danger); }

        /* Modal Styles */
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
          z-index: 1000; display: flex; align-items: center; justify-content: center;
        }
        .modal-content {
          width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto;
          padding: 32px; border-radius: 24px; position: relative;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px;
        }
        .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }

        .profile-main { display: flex; gap: 24px; align-items: center; margin-bottom: 32px; }
        .large-avatar {
          width: 80px; height: 80px; border-radius: 20px;
          background: var(--surface-hover); display: flex; align-items: center; justify-content: center;
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
        .detail-item p { font-weight: 500; font-size: 15px; }

        .documents-section h4, .vehicle-info h4 {
          display: flex; align-items: center; gap: 8px;
          font-size: 16px; margin-bottom: 16px;
        }
        .docs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        .doc-card {
          background: rgba(255,255,255,0.02); border: 1px solid var(--border);
          border-radius: 12px; padding: 12px; text-align: center;
        }
        .doc-label { font-size: 11px; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; }
        .doc-card img { width: 100%; height: 100px; object-fit: cover; border-radius: 8px; }
        .no-doc { height: 100px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--text-muted); font-style: italic; }

        .vehicle-info { background: rgba(255,255,255,0.02); padding: 20px; border-radius: 16px; margin-bottom: 32px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); }
        .info-row:last-child { border-bottom: none; }
        .info-row span { color: var(--text-muted); font-size: 14px; }

        .modal-actions { display: flex; gap: 16px; }
        .modal-actions button { flex: 1; padding: 14px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-approve { background: var(--success); border: none; color: white; }
        .btn-reject { background: var(--danger); border: none; color: white; }
        .btn-approve:hover { background: #059669; }
        .btn-reject:hover { background: #dc2626; }
      `}</style>
    </div>
  );
}
