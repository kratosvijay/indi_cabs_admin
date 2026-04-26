"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { 
  CreditCard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  DollarSign, 
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock
} from "lucide-react";
import { exportToCSV } from "../../../lib/utils";

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalPayouts: 0,
    pendingSettlements: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  useEffect(() => {
    async function fetchPayments() {
      try {
        const q = query(collection(db, "ride_requests"), orderBy("createdAt", "desc"), limit(1000));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setTransactions(data);
        
        // Calculate basic stats
        let earnings = 0;
        data.forEach(ride => {
          if (ride.status === 'completed' || ride.status === 'dropped') {
            earnings += Number(ride.fare || 0);
          }
        });
        
        setStats({
          totalEarnings: earnings,
          totalPayouts: Math.floor(earnings * 0.85), // Assuming 15% commission
          pendingSettlements: Math.floor(earnings * 0.05)
        });
      } catch (err) {
        console.error("Error fetching payments", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredTransactions = transactions.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.driverName || item.driverDisplayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.userName || item.userDisplayName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    // Handle nested dates/timestamps
    if (sortConfig.key === 'createdAt') {
      aVal = aVal?.seconds || new Date(aVal).getTime() || 0;
      bVal = bVal?.seconds || new Date(bVal).getTime() || 0;
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="payments-page">
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="card stat-card glass">
          <div className="stat-icon earnings">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Earnings</p>
            <h3>₹{stats.totalEarnings.toLocaleString()}</h3>
          </div>
        </div>
        
        <div className="card stat-card glass">
          <div className="stat-icon payouts">
            <ArrowUpCircle size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Payouts</p>
            <h3>₹{stats.totalPayouts.toLocaleString()}</h3>
          </div>
        </div>

        <div className="card stat-card glass">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Pending Settlements</p>
            <h3>₹{stats.pendingSettlements.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card toolbar glass">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Ride ID, Driver or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="actions">
          <button className="action-btn">
            <Filter size={18} />
            <span>Filter</span>
          </button>
           <button className="action-btn primary" onClick={() => exportToCSV(filteredTransactions, 'payments_report')}>
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card table-container glass">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                Ride ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                Date & Time {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Driver</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10">Loading transactions...</td></tr>
            ) : sortedTransactions.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10">No transactions found.</td></tr>
            ) : (
              sortedTransactions.map(item => (
                <tr key={item.id} className="table-row">
                  <td><span className="tx-id">#{item.id}</span></td>
                  <td>
                    <div className="date-cell">
                      {(() => {
                        const d = item.createdAt;
                        if (!d) return "N/A";
                        if (d.seconds) return new Date(d.seconds * 1000).toLocaleString();
                        const parsed = new Date(d);
                        return isNaN(parsed) ? "N/A" : parsed.toLocaleString();
                      })()}
                    </div>
                  </td>
                  <td>{item.driverName || item.driverDisplayName || "N/A"}</td>
                  <td>{item.userName || item.userDisplayName || "N/A"}</td>
                  <td><span className="amount">₹{item.fare || 0}</span></td>
                  <td>
                    <span className={`status-pill ${item.status}`}>
                      {item.status === 'completed' || item.status === 'dropped' ? (
                        <><CheckCircle size={14} /> Paid</>
                      ) : (
                        <><Clock size={14} /> {item.status}</>
                      )}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .payments-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
        }
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon.earnings { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .stat-icon.payouts { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
        .stat-icon.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        
        .stat-info h3 { font-size: 24px; font-weight: 700; margin-top: 4px; }
        .stat-label { font-size: 14px; color: var(--text-muted); }

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
        .actions {
          display: flex;
          gap: 12px;
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface-hover);
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .action-btn.primary {
          background: var(--primary);
          border-color: var(--primary);
        }

        .table-container { padding: 0; overflow: hidden; }
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th {
          padding: 20px 24px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }
        .table-row { border-bottom: 1px solid var(--border); transition: background 0.2s; }
        .table-row:hover { background: rgba(255,255,255,0.02); }
        .data-table td { padding: 16px 24px; font-size: 14px; }
        
        .tx-id { font-family: monospace; color: var(--text-muted); }
        .amount { font-weight: 700; color: white; }
        
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(255,255,255,0.05);
        }
        .status-pill.completed, .status-pill.dropped { color: var(--success); background: rgba(16, 185, 129, 0.1); }
      `}</style>
    </div>
  );
}
