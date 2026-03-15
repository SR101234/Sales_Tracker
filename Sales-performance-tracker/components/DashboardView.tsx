import React, { useState, useEffect } from "react";
import {
  Trophy,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  MinusCircle,
  ArrowDownRight,
  Crown,
  LineChart as LineChartIcon,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DashboardView = () => {
  const [metrics, setMetrics] = useState({});
  const [rankedAgents, setRankedAgents] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
              
        const res = await fetch(import.meta.env.VITE_API_URL); // change to your API
        const data = await res.json();
        console.log("Dashboard data:", data);
      
        setMetrics(data || {});
        setRankedAgents(data.table || []);
        setMonthlySummary(
          (data.chart || []).map(item => ({
            monthShort: new Date(item.month).toLocaleString("default", { month: "short" }),
            new: Number(item.new_business),
            relogin: Number(item.relogin)
          }))
        );
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center font-bold text-gray-500">
        Loading Dashboard...
      </div>
    );
  }

  const stats = [
    {
      label: "New SIPs",
      value: metrics.cards.new_sips || 0,
      icon: ArrowUpRight,
      color: "bg-emerald-500",
      text: "text-emerald-600",
    },
    {
      label: "Lumpsum",
      value: metrics.cards.lumpsum || 0,
      icon: TrendingUp,
      color: "bg-emerald-600",
      text: "text-emerald-700",
    },
    {
      label: "Relogins",
      value: metrics.cards.relogins || 0,
      icon: RefreshCw,
      color: "bg-[#0077c8]",
      text: "text-[#0077c8]",
    },
    {
      label: "Closed",
      value: metrics.cards.closed || 0,
      icon: MinusCircle,
      color: "bg-orange-500",
      text: "text-orange-600",
    },
    {
      label: "Redemptions",
      value: metrics.cards.redemptions || 0,
      icon: ArrowDownRight,
      color: "bg-red-500",
      text: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Top Card */}
      <div className="bg-gradient-to-br from-[#1e2f5e] to-[#0077c8] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 hidden sm:block">
          <Trophy size={180} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
          <div>
            <h2 className="text-blue-200 font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-2">
              Net Business Growth
            </h2>

            <span className="text-4xl sm:text-6xl font-black text-white tracking-tighter">
              ₹{((Number(metrics.cards.new_sips) + Number(metrics.cards.lumpsum) + Number(metrics.cards.relogins) - Number(metrics.cards.closed) - Number(metrics.cards.redemptions)) || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xl px-5 sm:px-8 py-4 rounded-2xl border border-white/20">
            <p className="text-blue-100/80 text-[8px] font-black uppercase tracking-widest mb-1">
              Growth Multiplier
            </p>

            <p className="text-2xl sm:text-3xl font-black text-white">
              {Math.round(
                ((Number(metrics.cards.new_sips) + Number(metrics.cards.lumpsum) + Number(metrics.cards.relogins)) /
                  ((Number(metrics.cards.closed) + Number(metrics.cards.redemptions)) || 1)) *
                10
              ) / 10}
              x
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-2 rounded-xl text-white`}>
                <stat.icon size={18} />
              </div>

              <span
                className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${stat.text}`}
              >
                {stat.label}
              </span>
            </div>

            {console.log(stat)}

            <p className="text-xl sm:text-2xl font-black text-[#1e2f5e]">
              ₹{stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Top Performers */}
        <div className="lg:col-span-1 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-500" size={20} />
              <h3 className="font-black text-slate-800 uppercase text-base">
                Top Performers
              </h3>
            </div>

            <Crown size={16} className="text-yellow-400" />
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[400px]">
            {rankedAgents.map((agent, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-2xl border bg-white border-gray-50"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${idx === 0
                    ? "bg-yellow-400 text-yellow-900"
                    : "bg-slate-100 text-slate-400"
                    }`}
                >
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-900 uppercase text-xs truncate">
                    {agent.name}
                  </h4>


                </div>

                <span className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">

                  ₹{(
                    agent.net_growth
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <LineChartIcon className="text-[#0077c8]" size={20} />
            <h3 className="font-black text-slate-800 uppercase text-base">
              Growth Trends
            </h3>
          </div>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="monthShort" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="new"
                  name="New Business"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />

                <Bar
                  dataKey="relogin"
                  name="Relogin"
                  fill="#0077c8"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;