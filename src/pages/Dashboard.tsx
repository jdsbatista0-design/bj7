import { motion } from "framer-motion";
import { dashboardStats, revenueByMonth, billboards, contracts, leads } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, MapPin, FileText, AlertTriangle, Users, DollarSign } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const pieData = [
  { name: "Ocupado", value: dashboardStats.occupied, color: "hsl(0, 72%, 55%)" },
  { name: "Disponível", value: dashboardStats.available, color: "hsl(210, 100%, 55%)" },
  { name: "Reservado", value: dashboardStats.reserved, color: "hsl(45, 95%, 55%)" },
];

const funnelData = [
  { stage: "Lead", count: leads.filter(l => l.stage === "lead").length },
  { stage: "Qualif.", count: leads.filter(l => l.stage === "qualified").length },
  { stage: "Proposta", count: leads.filter(l => l.stage === "proposal").length },
  { stage: "Negoc.", count: leads.filter(l => l.stage === "negotiation").length },
  { stage: "Fechado", count: leads.filter(l => l.stage === "closed").length },
];

export default function Dashboard() {
  const stats = [
    { label: "Ocupação", value: `${dashboardStats.occupancyRate}%`, icon: MapPin, variant: "" },
    { label: "Receita Mensal", value: `R$ ${(dashboardStats.mrr / 1000).toFixed(0)}k`, icon: DollarSign, variant: "stat-card-accent" },
    { label: "Margem", value: `R$ ${(dashboardStats.margin / 1000).toFixed(0)}k`, icon: TrendingUp, variant: "stat-card-accent" },
    { label: "Contratos Ativos", value: dashboardStats.activeContracts, icon: FileText, variant: "" },
    { label: "Leads Abertos", value: dashboardStats.openLeads, icon: Users, variant: "stat-card-warning" },
    { label: "OS Pendentes", value: dashboardStats.pendingOS, icon: AlertTriangle, variant: "stat-card-warning" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do seu negócio de mídia OOH</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className={`stat-card ${s.variant}`}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-xl font-display font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <motion.div className="stat-card lg:col-span-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="font-display font-semibold mb-4">Receita vs Custo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 12%, 50%)" fontSize={12} />
              <YAxis stroke="hsl(215, 12%, 50%)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip
                contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }}
                formatter={(v: number) => [`R$ ${v.toLocaleString()}`, ""]}
              />
              <Bar dataKey="revenue" fill="hsl(210, 100%, 55%)" radius={[4, 4, 0, 0]} name="Receita" />
              <Bar dataKey="cost" fill="hsl(220, 14%, 25%)" radius={[4, 4, 0, 0]} name="Custo" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Occupancy pie */}
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h3 className="font-display font-semibold mb-4">Status das Placas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-muted-foreground">{p.name} ({p.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h3 className="font-display font-semibold mb-4">Funil Comercial</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis type="number" stroke="hsl(215, 12%, 50%)" fontSize={12} />
              <YAxis dataKey="stage" type="category" stroke="hsl(215, 12%, 50%)" fontSize={12} width={65} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Bar dataKey="count" fill="hsl(160, 70%, 45%)" radius={[0, 4, 4, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Contracts expiring */}
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <h3 className="font-display font-semibold mb-4">Contratos Ativos</h3>
          <div className="space-y-3">
            {contracts.filter(c => c.status === "active").map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{c.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.billboards.length} placa(s) · até {new Date(c.endDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="text-sm font-display font-semibold text-accent">
                  R$ {c.monthlyValue.toLocaleString()}/mês
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
