import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, MapPin, FileText, AlertTriangle, Users, DollarSign, Target, Percent, Clock, ArrowUpRight, ArrowDownRight, CalendarClock, Building2, LandPlot } from "lucide-react";
import { useMemo } from "react";

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

const tooltipStyle = {
  contentStyle: { background: "hsl(220, 18%, 9%)", border: "1px solid hsl(220, 14%, 15%)", borderRadius: "8px", color: "hsl(40, 10%, 92%)", fontSize: "13px", fontWeight: 500 },
  itemStyle: { color: "hsl(40, 10%, 92%)" },
  labelStyle: { color: "hsl(40, 10%, 92%)", fontWeight: 600 },
};

export default function Dashboard() {
  const { billboards, contracts, leads, workOrders } = useData();

  const computed = useMemo(() => {
    const occupied = billboards.filter(b => b.status === "occupied").length;
    const available = billboards.filter(b => b.status === "available").length;
    const reserved = billboards.filter(b => b.status === "reserved").length;
    const occupancyRate = billboards.length > 0 ? Math.round((occupied / billboards.length) * 100) : 0;
    const totalRevenue = contracts.filter(c => c.status === "active" && c.type === "veiculacao").reduce((s, c) => s + c.monthly_value, 0);
    const totalCost = contracts.filter(c => c.status === "active" && c.type === "locacao_terreno").reduce((s, c) => s + c.monthly_value, 0);
    const margin = totalRevenue - totalCost;
    const activeVeiculacao = contracts.filter(c => c.status === "active" && c.type === "veiculacao").length;
    const activeLocacao = contracts.filter(c => c.status === "active" && c.type === "locacao_terreno").length;
    const avgTicket = activeVeiculacao > 0 ? Math.round(totalRevenue / activeVeiculacao) : 0;
    const openLeads = leads.filter(l => !["closed", "lost"].includes(l.stage)).length;
    const pipelineValue = leads.filter(l => !["closed", "lost"].includes(l.stage)).reduce((s, l) => s + l.value, 0);
    const conversionRate = leads.length > 0 ? Math.round((leads.filter(l => l.stage === "closed").length / leads.length) * 100) : 0;
    const pendingOS = workOrders.filter(o => o.status !== "completed").length;
    const overdueOS = workOrders.filter(o => o.status === "overdue").length;
    return { occupied, available, reserved, occupancyRate, totalRevenue, totalCost, margin, activeVeiculacao, activeLocacao, avgTicket, openLeads, pipelineValue, conversionRate, pendingOS, overdueOS };
  }, [billboards, contracts, leads, workOrders]);

  const pieData = [
    { name: "Ocupado", value: computed.occupied, color: "hsl(0, 85%, 60%)" },
    { name: "Disponível", value: computed.available, color: "hsl(142, 70%, 50%)" },
    { name: "Reservado", value: computed.reserved, color: "hsl(45, 95%, 55%)" },
  ];

  const funnelData = [
    { stage: "Lead", count: leads.filter(l => l.stage === "lead").length, fill: "hsl(220, 14%, 35%)" },
    { stage: "Qualif.", count: leads.filter(l => l.stage === "qualified").length, fill: "hsl(210, 90%, 55%)" },
    { stage: "Proposta", count: leads.filter(l => l.stage === "proposal").length, fill: "hsl(45, 95%, 55%)" },
    { stage: "Negoc.", count: leads.filter(l => l.stage === "negotiation").length, fill: "hsl(30, 95%, 55%)" },
    { stage: "Fechado", count: leads.filter(l => l.stage === "closed").length, fill: "hsl(150, 70%, 42%)" },
  ];

  const occupancyByRegion = useMemo(() => {
    const regions: Record<string, { total: number; occupied: number }> = {};
    billboards.forEach(b => {
      const key = `${b.city} (${b.route})`;
      if (!regions[key]) regions[key] = { total: 0, occupied: 0 };
      regions[key].total++;
      if (b.status === "occupied") regions[key].occupied++;
    });
    return Object.entries(regions).map(([region, data]) => ({ region, ...data, rate: data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0 }));
  }, [billboards]);

  const allActive = contracts.filter(c => c.status === "active").length;

  const stats = [
    { label: "Ocupação", value: `${computed.occupancyRate}%`, icon: MapPin, variant: "", delta: `${computed.occupied}/${billboards.length}`, up: true },
    { label: "Receita Mensal", value: `R$ ${(computed.totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, variant: "stat-card-accent", delta: `${computed.activeVeiculacao} contrato(s)`, up: true },
    { label: "Custo Terrenos", value: `R$ ${(computed.totalCost / 1000).toFixed(1)}k`, icon: LandPlot, variant: "", delta: `${computed.activeLocacao} contrato(s)`, up: false },
    
    { label: "Ticket Médio", value: `R$ ${(computed.avgTicket / 1000).toFixed(1)}k`, icon: Target, variant: "", delta: "", up: true },
    { label: "Contratos Ativos", value: `${allActive}`, icon: FileText, variant: "", delta: `${computed.activeVeiculacao} veic. · ${computed.activeLocacao} loc.`, up: true },
    { label: "Pipeline", value: `R$ ${(computed.pipelineValue / 1000).toFixed(0)}k`, icon: Users, variant: "stat-card-info", delta: `${computed.openLeads} leads`, up: true },
    { label: "Conversão", value: `${computed.conversionRate}%`, icon: Percent, variant: "stat-card-success", delta: "", up: true },
    { label: "OS Pendentes", value: `${computed.pendingOS}`, icon: Clock, variant: computed.overdueOS > 0 ? "stat-card-warning" : "", delta: computed.overdueOS > 0 ? `${computed.overdueOS} atrasada(s)` : "", up: false },
  ];

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-[1400px]">
      <div><h1 className="text-xl md:text-2xl font-display font-bold">Dashboard</h1><p className="text-muted-foreground text-xs md:text-sm mt-1">BJ7 Mídia · {billboards.length} pontos</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} className={`stat-card ${s.variant}`} variants={fadeIn} initial="hidden" animate="visible" custom={i}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><s.icon className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">{s.label}</span></div>
              {s.delta && <span className={`text-[10px] flex items-center gap-0.5 ${s.up ? "text-success" : "text-destructive"}`}>{s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{s.delta}</span>}
            </div>
            <p className="text-xl font-display font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h3 className="font-display font-semibold mb-4 text-sm">Status dos Pontos</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>{pieData.map(e => <Cell key={e.name} fill={e.color} />)}</Pie><Tooltip {...tooltipStyle} /></PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">{pieData.map(p => <div key={p.name} className="flex items-center gap-1.5 text-xs"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} /><span className="text-muted-foreground">{p.name} ({p.value})</span></div>)}</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <h3 className="font-display font-semibold mb-4 text-sm">Ocupação por Região</h3>
          <div className="space-y-3">
            {occupancyByRegion.map(r => (
              <div key={r.region}><div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{r.region}</span><span className="font-semibold">{r.rate}%</span></div><div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(r.rate, 4)}%` }} /></div></div>
            ))}
          </div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h3 className="font-display font-semibold mb-4 text-sm">Funil Comercial</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 15%)" />
              <XAxis type="number" stroke="hsl(220, 10%, 48%)" fontSize={11} />
              <YAxis dataKey="stage" type="category" stroke="hsl(220, 10%, 48%)" fontSize={11} width={60} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Leads">{funnelData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      {/* Contracts split + expiration report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          <h3 className="font-display font-semibold mb-4 text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />Contratos Anunciantes</h3>
          <div className="space-y-2.5">
            {contracts.filter(c => c.status === "active" && c.type === "veiculacao").length === 0 && <p className="text-xs text-muted-foreground">Nenhum contrato ativo.</p>}
            {contracts.filter(c => c.status === "active" && c.type === "veiculacao").map(c => (
              <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <div><p className="font-medium text-sm">{c.client_name}</p><p className="text-[11px] text-muted-foreground">{(c.billboard_ids || []).length} ponto(s) · até {new Date(c.end_date + "T00:00:00").toLocaleDateString("pt-BR")}</p></div>
                <span className="text-sm font-display font-semibold text-primary">R$ {c.monthly_value.toLocaleString()}/mês</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <h3 className="font-display font-semibold mb-4 text-sm flex items-center gap-2"><LandPlot className="w-4 h-4 text-primary" />Contratos Terrenos</h3>
          <div className="space-y-2.5">
            {contracts.filter(c => c.status === "active" && c.type === "locacao_terreno").length === 0 && <p className="text-xs text-muted-foreground">Nenhum contrato ativo.</p>}
            {contracts.filter(c => c.status === "active" && c.type === "locacao_terreno").map(c => (
              <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <div><p className="font-medium text-sm">{c.client_name}</p><p className="text-[11px] text-muted-foreground">{(c.billboard_ids || []).length} ponto(s) · até {new Date(c.end_date).toLocaleDateString("pt-BR")}</p></div>
                <span className="text-sm font-display font-semibold text-destructive">R$ {c.monthly_value.toLocaleString()}/mês</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Contract expiration report */}
      <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
        <h3 className="font-display font-semibold mb-4 text-sm flex items-center gap-2"><CalendarClock className="w-4 h-4 text-primary" />Vencimento de Contratos</h3>
        {(() => {
          const today = new Date();
          const sorted = [...contracts]
            .filter(c => c.status === "active")
            .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
          if (sorted.length === 0) return <p className="text-xs text-muted-foreground">Nenhum contrato ativo.</p>;
          return (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Cliente</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Tipo</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Vencimento</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Dias</th>
                    <th className="text-right py-2 text-muted-foreground font-medium text-xs">Valor/mês</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(c => {
                    const end = new Date(c.end_date);
                    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const isUrgent = diffDays <= 30;
                    const isWarning = diffDays <= 60 && diffDays > 30;
                    return (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2.5 font-medium">{c.client_name}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${c.type === "veiculacao" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}`}>
                            {c.type === "veiculacao" ? "Anunciante" : "Terreno"}
                          </span>
                        </td>
                        <td className="py-2.5 text-muted-foreground">{end.toLocaleDateString("pt-BR")}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isUrgent ? "bg-destructive/15 text-destructive" : isWarning ? "bg-yellow-500/15 text-yellow-500" : "text-muted-foreground"}`}>
                            {diffDays < 0 ? `${Math.abs(diffDays)}d vencido` : `${diffDays}d`}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-display font-semibold">R$ {c.monthly_value.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </motion.div>

      {/* Overdue work orders */}
      {workOrders.filter(o => o.status === "overdue").length > 0 && (
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <p className="text-xs text-destructive font-semibold flex items-center gap-1.5 mb-2"><AlertTriangle className="w-3.5 h-3.5" /> OS Atrasadas</p>
          {workOrders.filter(o => o.status === "overdue").map(os => <div key={os.id} className="text-xs text-muted-foreground">#{os.billboard_code} · Prazo: {new Date(os.due_date).toLocaleDateString("pt-BR")}</div>)}
        </motion.div>
      )}
    </div>
  );
}
