import { motion } from "framer-motion";
import { dashboardStats, revenueByMonth, billboards, contracts, leads, workOrders, occupancyByRegion } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { TrendingUp, MapPin, FileText, AlertTriangle, Users, DollarSign, Target, Percent, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

const pieData = [
  { name: "Ocupado", value: dashboardStats.occupied, color: "hsl(0, 72%, 50%)" },
  { name: "Disponível", value: dashboardStats.available, color: "hsl(210, 90%, 55%)" },
  { name: "Reservado", value: dashboardStats.reserved, color: "hsl(45, 95%, 55%)" },
];

const funnelData = [
  { stage: "Lead", count: leads.filter(l => l.stage === "lead").length, fill: "hsl(220, 14%, 35%)" },
  { stage: "Qualif.", count: leads.filter(l => l.stage === "qualified").length, fill: "hsl(210, 90%, 55%)" },
  { stage: "Proposta", count: leads.filter(l => l.stage === "proposal").length, fill: "hsl(45, 95%, 55%)" },
  { stage: "Negoc.", count: leads.filter(l => l.stage === "negotiation").length, fill: "hsl(30, 95%, 55%)" },
  { stage: "Fechado", count: leads.filter(l => l.stage === "closed").length, fill: "hsl(150, 70%, 42%)" },
];

const tooltipStyle = {
  contentStyle: { background: "hsl(220, 18%, 9%)", border: "1px solid hsl(220, 14%, 15%)", borderRadius: "8px", color: "hsl(40, 10%, 92%)" },
};

export default function Dashboard() {
  const stats = [
    { label: "Ocupação", value: `${dashboardStats.occupancyRate}%`, icon: MapPin, variant: "", delta: "+5%", up: true },
    { label: "Receita Mensal", value: `R$ ${(dashboardStats.mrr / 1000).toFixed(1)}k`, icon: DollarSign, variant: "stat-card-accent", delta: "+12%", up: true },
    { label: "Margem", value: `R$ ${(dashboardStats.margin / 1000).toFixed(1)}k`, icon: TrendingUp, variant: "stat-card-success", delta: "+8%", up: true },
    { label: "Ticket Médio", value: `R$ ${(dashboardStats.avgTicket / 1000).toFixed(1)}k`, icon: Target, variant: "", delta: "", up: true },
    { label: "Pipeline", value: `R$ ${(dashboardStats.pipelineValue / 1000).toFixed(0)}k`, icon: Users, variant: "stat-card-info", delta: `${dashboardStats.openLeads} leads`, up: true },
    { label: "Conversão", value: `${dashboardStats.conversionRate}%`, icon: Percent, variant: "stat-card-success", delta: "", up: true },
    { label: "Contratos Ativos", value: dashboardStats.activeVeiculacao, icon: FileText, variant: "", delta: "", up: true },
    { label: "OS Pendentes", value: dashboardStats.pendingOS, icon: Clock, variant: dashboardStats.overdueOS > 0 ? "stat-card-warning" : "", delta: dashboardStats.overdueOS > 0 ? `${dashboardStats.overdueOS} atrasada(s)` : "", up: false },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">BJ7 Mídia · Litoral do Paraná · {billboards.length} pontos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className={`stat-card ${s.variant}`}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <s.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              {s.delta && (
                <span className={`text-[10px] flex items-center gap-0.5 ${s.up ? "text-success" : "text-destructive"}`}>
                  {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {s.delta}
                </span>
              )}
            </div>
            <p className="text-xl font-display font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <motion.div className="stat-card lg:col-span-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="font-display font-semibold mb-4 text-sm">Receita vs Custo Mensal</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueByMonth}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(45, 95%, 55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(45, 95%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 15%)" />
              <XAxis dataKey="month" stroke="hsl(220, 10%, 48%)" fontSize={11} />
              <YAxis stroke="hsl(220, 10%, 48%)" fontSize={11} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`R$ ${v.toLocaleString()}`, ""]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(45, 95%, 55%)" fill="url(#fillRevenue)" strokeWidth={2} name="Receita" />
              <Area type="monotone" dataKey="cost" stroke="hsl(0, 72%, 50%)" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Custo" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Occupancy pie */}
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h3 className="font-display font-semibold mb-4 text-sm">Status dos Pontos</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {pieData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-muted-foreground">{p.name} ({p.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Region occupancy */}
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <h3 className="font-display font-semibold mb-4 text-sm">Ocupação por Região</h3>
          <div className="space-y-3">
            {occupancyByRegion.map(r => (
              <div key={r.region}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{r.region}</span>
                  <span className="font-semibold">{r.rate}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(r.rate, 4)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Funnel */}
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h3 className="font-display font-semibold mb-4 text-sm">Funil Comercial</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 15%)" />
              <XAxis type="number" stroke="hsl(220, 10%, 48%)" fontSize={11} />
              <YAxis dataKey="stage" type="category" stroke="hsl(220, 10%, 48%)" fontSize={11} width={60} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Leads">
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Contracts & OS */}
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          <h3 className="font-display font-semibold mb-4 text-sm">Contratos Ativos</h3>
          <div className="space-y-2.5">
            {contracts.filter(c => c.status === "active" && c.type === "veiculacao").map(c => (
              <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{c.clientName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {c.billboards.length} ponto(s) · até {new Date(c.endDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="text-sm font-display font-semibold text-primary">
                  R$ {c.monthlyValue.toLocaleString()}/mês
                </span>
              </div>
            ))}
          </div>

          {workOrders.filter(o => o.status === "overdue").length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-destructive font-semibold flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" /> OS Atrasadas
              </p>
              {workOrders.filter(o => o.status === "overdue").map(os => (
                <div key={os.id} className="text-xs text-muted-foreground">
                  #{os.billboardCode} · Prazo: {new Date(os.dueDate).toLocaleDateString("pt-BR")}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
