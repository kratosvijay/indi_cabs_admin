"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { 
  Users, 
  Car, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const data = [
  { name: "Mon", rides: 400, revenue: 2400 },
  { name: "Tue", rides: 300, revenue: 1398 },
  { name: "Wed", rides: 200, revenue: 9800 },
  { name: "Thu", rides: 278, revenue: 3908 },
  { name: "Fri", rides: 189, revenue: 4800 },
  { name: "Sat", rides: 239, revenue: 3800 },
  { name: "Sun", rides: 349, revenue: 4300 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    drivers: 0,
    users: 0,
    rides: 0,
    activeRides: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [driversSnap, usersSnap, ridesSnap] = await Promise.all([
          getDocs(collection(db, "drivers")),
          getDocs(collection(db, "users")),
          getDocs(collection(db, "ride_requests"))
        ]);

        const rides = ridesSnap.docs.map(doc => doc.data());
        
        // Process data for charts (Last 7 Days)
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          last7Days.push({
            date: d,
            name: days[d.getDay()],
            rides: 0,
            revenue: 0
          });
        }

        rides.forEach(ride => {
          if (!ride.createdAt) return;
          const rideDate = new Date(ride.createdAt.seconds * 1000);
          
          const chartDay = last7Days.find(d => 
            d.date.getDate() === rideDate.getDate() && 
            d.date.getMonth() === rideDate.getMonth() &&
            d.date.getFullYear() === rideDate.getFullYear()
          );

          if (chartDay) {
            chartDay.rides++;
            if (ride.status === 'completed' || ride.status === 'dropped') {
              chartDay.revenue += Number(ride.fare || 0);
            }
          }
        });

        setChartData(last7Days);
        setStats({
          drivers: driversSnap.size,
          users: usersSnap.size,
          rides: ridesSnap.size,
          activeRides: rides.filter(r => ['accepted', 'arrived', 'started'].includes(r.status)).length,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { name: "Total Drivers", value: stats.drivers, icon: Users, color: "#3b82f6", trend: "+12%" },
    { name: "Total Users", value: stats.users, icon: Users, color: "#10b981", trend: "+5%" },
    { name: "Total Rides", value: stats.rides, icon: Car, color: "#f59e0b", trend: "+18%" },
    { name: "Avg Rating", value: "4.8", icon: TrendingUp, color: "#ef4444", trend: "+0.2" },
  ];

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <div key={i} className="card stat-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">{stat.name}</p>
              <h3 className="stat-value">{loading ? "..." : stat.value}</h3>
            </div>
            <div className="stat-trend" style={{ color: stat.trend.startsWith("+") ? "var(--success)" : "var(--danger)" }}>
              {stat.trend.startsWith("+") ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card chart-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="chart-header">
            <h3>Weekly Ride Volume</h3>
            <p>Number of rides completed across all zones</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1a1d26", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ color: "white" }}
                />
                <Area type="monotone" dataKey="rides" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRides)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="chart-header">
            <h3>Revenue Overview</h3>
            <p>Daily earnings from platform fees and commissions</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: "#1a1d26", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                   itemStyle={{ color: "white" }}
                />
                <Bar dataKey="revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
        }
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-info h3 {
          font-size: 24px;
          font-weight: 700;
          margin-top: 4px;
        }
        .stat-label {
          font-size: 14px;
          color: var(--text-muted);
        }
        .stat-trend {
          position: absolute;
          top: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 24px;
        }
        .chart-header {
          margin-bottom: 24px;
        }
        .chart-header h3 {
          font-size: 18px;
          font-weight: 600;
        }
        .chart-header p {
          font-size: 14px;
          color: var(--text-muted);
        }
        .chart-container {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
