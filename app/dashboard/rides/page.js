"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  where
} from "firebase/firestore";
import { 
  RefreshCw,
  XCircle,
  Info,
  ChevronRight,
  AlertTriangle,
  X,
  Search,
  MapPin,
  Navigation,
  User,
  Car,
  DollarSign,
  Clock
} from "lucide-react";
import dynamic from "next/dynamic";
import { doc, updateDoc, onSnapshot as onSnapshotDrivers } from "firebase/firestore";
import { logAdminAction, exportToCSV } from "../../../lib/utils";
import { useAuth } from "../../../lib/AuthContext";

const LiveMap = dynamic(() => import("../../../lib/components/LiveMap"), { 
  ssr: false,
  loading: () => <div className="map-placeholder">Loading Map...</div>
});

export default function RidesPage() {
  const { user: adminUser } = useAuth();
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRideId, setExpandedRideId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(null);

  useEffect(() => {
    // Live listener for rides
    const q = query(collection(db, "ride_requests"), orderBy("createdAt", "desc"), limit(50));
    
    const unsubscribeRides = onSnapshot(q, (snapshot) => {
      const rideData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRides(rideData);
      setLoading(false);
    }, (err) => {
      console.error("Rides listener error", err);
      setLoading(false);
    });

    // Live listener for drivers (to show on map)
    const dq = query(collection(db, "drivers"), where("isOnline", "==", true));
    const unsubscribeDrivers = onSnapshot(dq, (snapshot) => {
      const driverData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDrivers(driverData);
    }, (err) => {
      console.error("Drivers listener error", err);
    });

    return () => {
      unsubscribeRides();
      unsubscribeDrivers();
    };
  }, []);

  const handleCancelRide = async (rideId) => {
    if (!cancelReason) return alert("Please provide a reason for cancellation");
    try {
      await updateDoc(doc(db, "ride_requests", rideId), {
        status: "cancelled",
        cancelReason: cancelReason,
        cancelledBy: "Admin",
        cancelledAt: new Date()
      });
      await logAdminAction(db, adminUser.email, `Cancelled ride: ${cancelReason}`, rideId);
      setShowCancelModal(null);
      setCancelReason("");
    } catch (err) {
      alert("Error cancelling ride: " + err.message);
    }
  };

  const filteredRides = rides.filter(r => 
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.driverName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rides-page">
      <div className="card toolbar glass">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Ride ID, User or Driver..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="live-indicator">
          <div className="pulse-dot"></div>
          <span>Live Tracking Active</span>
          <button className="export-btn" onClick={() => exportToCSV(rides, 'rides_report')}>
            Download Report
          </button>
        </div>
      </div>

      <LiveMap rides={rides} drivers={drivers} />

      <div className="rides-grid">
        {loading ? (
          <div className="text-center py-20 w-full col-span-full">
            <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
            <p>Loading live rides...</p>
          </div>
        ) : filteredRides.map((ride, i) => (
          <div key={ride.id} className="card ride-card animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="ride-header">
              <span className={`status-pill ${ride.status}`}>
                {ride.status}
              </span>
              <span className="ride-id">#{ride.id.substring(0, 8)}</span>
            </div>

            <div className="locations">
              <div className="location-item">
                <div className="loc-icon pickup"><MapPin size={14} /></div>
                <div className="loc-details">
                  <p className="loc-label">Pickup</p>
                  <p className="loc-addr">{ride.pickupAddress || "N/A"}</p>
                </div>
              </div>
              <div className="loc-divider"></div>
              <div className="location-item">
                <div className="loc-icon drop"><Navigation size={14} /></div>
                <div className="loc-details">
                  <p className="loc-label">Drop-off</p>
                  <p className="loc-addr">{ride.destinationAddress || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="ride-meta">
              <div className="meta-item">
                <User size={16} />
                <span>{ride.userName || ride.userDisplayName || "Customer"}</span>
              </div>
              <div className="meta-item">
                <Car size={16} />
                <span>{ride.driverName || ride.driverDisplayName || "Assigning..."}</span>
              </div>
              <div className="meta-item">
                <DollarSign size={16} />
                <span>₹{ride.fare || 0}</span>
              </div>
              <div className="meta-item">
                <Clock size={16} />
                <span>{ride.createdAt?.seconds ? new Date(ride.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Now"}</span>
              </div>
            </div>

            <div className="ride-actions">
              <button 
                className={`btn-icon ${expandedRideId === ride.id ? 'active' : ''}`} 
                onClick={() => setExpandedRideId(expandedRideId === ride.id ? null : ride.id)} 
                title="View Details"
              >
                {expandedRideId === ride.id ? <X size={18} /> : <Info size={18} />}
              </button>
              {['searching', 'accepted', 'arrived', 'started'].includes(ride.status) && (
                <button className="btn-icon danger" onClick={() => setShowCancelModal(ride.id)} title="Cancel Ride">
                  <XCircle size={18} />
                </button>
              )}
            </div>

            {expandedRideId === ride.id && (
              <div className="card-expansion animate-fade-in" style={{ 
                marginTop: '16px', 
                paddingTop: '16px', 
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>FARE BREAKDOWN</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Base + Distance</span>
                  <span>₹{ride.fare || 0}</span>
                </div>
                {ride.status === 'cancelled' && (
                  <div style={{ fontSize: '12px', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '8px', borderRadius: '8px' }}>
                    <strong>Cancelled:</strong> {ride.cancelReason || "System"}
                  </div>
                )}
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  User Phone: {ride.userPhoneNumber || ride.userPhone || "N/A"}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Driver Phone: {ride.driverPhoneNumber || ride.driverPhone || "N/A"}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Global Modals Removed for Inline Expansion */}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(null)}>
          <div className="confirm-modal glass animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3>Cancel Ride?</h3>
            <p className="mb-4">Are you sure you want to manually cancel this ride? This action cannot be undone.</p>
            
            <div className="input-group mb-4">
              <label>Reason for Cancellation</label>
              <textarea 
                className="input-field" 
                placeholder="e.g. Driver requested, Technical issue..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              ></textarea>
            </div>

            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => setShowCancelModal(null)}>Close</button>
              <button className="btn-danger" onClick={() => handleCancelRide(showCancelModal)}>Confirm Cancellation</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .rides-page {
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
          width: 450px;
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
        
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--success);
          font-size: 13px;
          font-weight: 600;
        }
        .pulse-dot {
          width: 10px;
          height: 10px;
          background: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulse 2s infinite;
        }
        
        .export-btn {
          margin-left: 12px;
          background: var(--surface-hover);
          border: 1px solid var(--border);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .export-btn:hover { background: var(--primary); border-color: var(--primary); }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .rides-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 20px;
        }
        .ride-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ride-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .status-pill {
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          background: var(--surface-hover);
        }
        .status-pill.searching { color: var(--accent); background: rgba(251, 191, 36, 0.1); }
        .status-pill.pickedup { color: var(--primary); background: rgba(37, 99, 235, 0.1); }
        .status-pill.dropped { color: var(--success); background: rgba(16, 185, 129, 0.1); }
        .status-pill.cancelled { color: var(--danger); background: rgba(239, 68, 68, 0.1); }

        .ride-id {
          font-size: 12px;
          color: var(--text-muted);
          font-family: monospace;
        }

        .locations {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }
        .location-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .loc-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .loc-icon.pickup { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
        .loc-icon.drop { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .loc-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .loc-addr { font-size: 14px; font-weight: 500; line-height: 1.4; color: var(--text); }
        .loc-divider {
          width: 2px;
          height: 16px;
          background: var(--border);
          margin-left: 11px;
        }

        .ride-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .meta-item span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ride-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .btn-icon {
          flex: 1;
          height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-icon:hover { background: var(--primary); color: white; border-color: var(--primary); }
        .btn-icon.danger:hover { background: var(--danger); color: white; border-color: var(--danger); }

        /* Modal & UI Polishing */
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
          z-index: 1000; display: flex; align-items: center; justify-content: center;
        }
        .modal-content {
          width: 100%; max-width: 600px; padding: 32px; border-radius: 24px;
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          position: relative;
          z-index: 1001;
        }
        .ride-detail-body { display: flex; flex-direction: column; gap: 20px; }
        .status-banner { text-align: center; margin-bottom: 8px; }
        .status-banner p { font-size: 13px; color: var(--text-muted); margin-top: 8px; font-family: monospace; }
        
        .locations-detailed { display: flex; flex-direction: column; gap: 12px; position: relative; padding: 20px; }
        .loc-item { display: flex; gap: 16px; align-items: flex-start; }
        .dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
        .dot.pickup { background: var(--primary); box-shadow: 0 0 8px var(--primary); }
        .dot.drop { background: var(--success); box-shadow: 0 0 8px var(--success); }
        .loc-item .label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
        .loc-item .addr { font-size: 15px; font-weight: 500; }
        .loc-line { width: 2px; height: 24px; background: var(--border); margin-left: 5px; }

        .participants-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .participant .header { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .participant .name { font-weight: 600; font-size: 16px; }
        .participant .sub { font-size: 13px; color: var(--text-muted); }

        .fare-breakdown .breakdown-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
        .breakdown-list .item { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); }
        .breakdown-list .item.total { border-top: 1px solid var(--border); padding-top: 12px; font-size: 18px; font-weight: 700; color: white; }
        .item.surge { color: var(--accent); }

        .cancel-info.danger { border-color: var(--danger); background: rgba(239, 68, 68, 0.05); }
        .cancel-info .header { color: var(--danger); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }

        .confirm-modal { width: 400px; padding: 32px; border-radius: 24px; text-align: center; }
        .confirm-actions { display: flex; gap: 12px; }
        .confirm-actions button { flex: 1; padding: 12px; border-radius: 12px; font-weight: 600; cursor: pointer; }
        .btn-secondary { background: var(--surface-hover); border: 1px solid var(--border); color: white; }
        .btn-danger { background: var(--danger); border: none; color: white; }
        .input-group { text-align: left; }
        .input-group label { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
        .input-field { background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 12px; padding: 12px; color: white; width: 100%; min-height: 80px; font-family: inherit; }
        .mb-4 { margin-bottom: 1.5rem; }
        .map-placeholder {
          height: 400px; background: var(--surface); border-radius: 20px;
          display: flex; align-items: center; justify-content: center; color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
