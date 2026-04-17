"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  onSnapshot
} from "firebase/firestore";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  DollarSign, 
  User, 
  Car, 
  Search,
  RefreshCw
} from "lucide-react";

export default function RidesPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Live listener for rides
    const q = query(collection(db, "ride_requests"), orderBy("createdAt", "desc"), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rideData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRides(rideData);
      setLoading(false);
    }, (error) => {
      console.error("Ride listener error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
        </div>
      </div>

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
                <span>{ride.createdAt ? new Date(ride.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Now"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

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
      `}</style>
    </div>
  );
}
