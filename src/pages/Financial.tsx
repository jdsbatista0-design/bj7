import { contracts, billboards, dashboardStats, revenueByMonth } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Percent, MapPin } from "lucide-react";

const tooltipStyle = {
  contentStyle: { background: "hsl(220, 18%, 9%)", border: "1px solid hsl(220, 14%, 15%)", borderRadius: "8px", color: "hsl(40, 10%, 92%)" },
};

const marginByBillboard = billboards.map(b => ({
  code: `#${b.code}`,
  revenue: b.status === "occupied" ? b.price : 0,
  cost: b.cost,
  margin: (b.status === "occupied" ? b.price : 0) - b.cost,
  route: b.route,
}));

const revenueByRoute = billboards.reduce((acc, b) => {
  if (!acc[b.route]) acc[b.route] = { route: b.route, revenue: 0, cost: 0, count: 0 };
  if (b.status === "occupied") {
    acc[b.route].revenue += b.price;
  }
  acc[b.route].cost += b.cost;
  acc[b.route].count++;
  return acc;
}, {} as Record<string, { route: string; revenue: number; cost: number; count: number }>);

const routeData = Object.values(revenueByRoute).map(r => ({ ...r, margin: r.revenue - r.cost }));

export default function Financial() {
  const totalRevenue = dashboardStats.totalRevenue;
  const totalCost = dashboardStats.totalCost;
  const margin = totalRevenue - totalCost;
  const marginPct = totalRevenue > 0 ? Math.round((margin / totalRevenue) * 100) : 0;

  const totalLandCosts = contracts
    .filter(c => c.status === "active" && c.type === "locacao_terreno")
    .reduce((s, c) => s + c.monthlyValue, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-display font-bold">Financeiro</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão financeira do negócio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="stat-card stat-card-accent">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">MRR</span></div>
          <p className="text-xl font-display font-bold text-primary">R$ {dashboardStats.mrr.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Receita</span></div>
          <p className="text-xl font-display font-bold">R$ {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Custos Terreno</span></div>
          <p className="text-xl font-display font-bold">R$ {totalLandCosts.toLocaleString()}</p>
        </div>
        <div className="stat-card stat-card-success">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Margem</span></div>
          <p className="text-xl font-display font-bold text-success">R$ {margin.toLocaleString()}</p>
        </div>
        <div className="stat-card stat-card-success">
          <div className="flex items-center gap-2 mb-2"><Percent className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">% Margem</span></div>
          <p className="text-xl font-display font-bold text-success">{marginPct}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue trend */}
        <div className="stat-card">
          <h3 className="font-display font-semibold mb-4 text-sm">Evolução Receita vs Custo</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueByMonth}>
              <defs>
                <linearGradient id="fillRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(45, 95%, 55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(45, 95%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 15%)" />
              <XAxis dataKey="month" stroke="hsl(220, 10%, 48%)" fontSize={11} />
              <YAxis stroke="hsl(220, 10%, 48%)" fontSize={11} tickFormatter={v => `${v/1000}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`R$ ${v.toLocaleString()}`, ""]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(45, 95%, 55%)" fill="url(#fillRev)" strokeWidth={2} name="Receita" />
              <Area type="monotone" dataKey="cost" stroke="hsl(0, 72%, 50%)" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Custo" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Margin by route */}
        <div className="stat-card">
          <h3 className="font-display font-semibold mb-4 text-sm">Receita por Rodovia</h3>
          <div className="space-y-4">
            {routeData.map(r => (
              <div key={r.route}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-muted-foreground" />{r.route}</span>
                  <span className="font-display font-semibold text-primary">R$ {r.revenue.toLocaleString()}/mês</span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mb-1.5">
                  <span>{r.count} pontos</span>
                  <span>Custo: R$ {r.cost.toLocaleString()}</span>
                  <span className="text-success">Margem: R$ {r.margin.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${r.revenue > 0 ? Math.min((r.revenue / 10000) * 100, 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Margin by billboard */}
      <div className="stat-card">
        <h3 className="font-display font-semibold mb-4 text-sm">Margem por Ponto</h3>
        <div className="space-y-2.5">
          {billboards.map(b => {
            const revenue = b.status === "occupied" ? b.price : 0;
            const m = revenue - b.cost;
            const pct = revenue > 0 ? Math.round((m / revenue) * 100) : 0;
            return (
              <div key={b.id} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-12">#{b.code}</span>
                <span className="text-[10px] text-muted-foreground w-16">{b.route}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${b.status === "occupied" ? "bg-primary" : "bg-muted-foreground/30"}`} style={{ width: `${Math.max(pct, 3)}%` }} />
                </div>
                <span className="text-xs font-semibold w-20 text-right">
                  {b.status === "occupied" ? `R$ ${m.toLocaleString()}` : "—"}
                </span>
                <span className={`text-xs w-10 text-right ${b.status === "occupied" ? "text-success" : "text-muted-foreground"}`}>
                  {b.status === "occupied" ? `${pct}%` : "Vago"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accounts receivable */}
      <div className="stat-card">
        <h3 className="font-display font-semibold mb-4 text-sm">Contas a Receber (Veiculação)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left py-2">Cliente</th>
                <th className="text-left py-2">Pontos</th>
                <th className="text-right py-2">Mensal</th>
                <th className="text-right py-2">Total</th>
                <th className="text-right py-2">Vencimento</th>
              </tr>
            </thead>
            <tbody>
              {contracts.filter(c => c.status === "active" && c.type === "veiculacao").map(c => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="py-3 font-medium">{c.clientName}</td>
                  <td className="py-3">
                    {c.billboards.map(bid => {
                      const b = billboards.find(x => x.id === bid);
                      return b ? <span key={bid} className="text-xs bg-muted px-1.5 py-0.5 rounded mr-1 font-mono">#{b.code}</span> : null;
                    })}
                  </td>
                  <td className="py-3 text-right font-display font-semibold text-primary">R$ {c.monthlyValue.toLocaleString()}</td>
                  <td className="py-3 text-right">R$ {c.totalValue.toLocaleString()}</td>
                  <td className="py-3 text-right text-muted-foreground">{new Date(c.endDate).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Land costs */}
      <div className="stat-card stat-card-info">
        <h3 className="font-display font-semibold mb-4 text-sm">Custos de Locação de Terrenos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left py-2">Proprietário</th>
                <th className="text-left py-2">Pontos</th>
                <th className="text-right py-2">Mensal</th>
                <th className="text-right py-2">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {contracts.filter(c => c.status === "active" && c.type === "locacao_terreno").map(c => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="py-3 font-medium">{c.clientName}</td>
                  <td className="py-3">
                    {c.billboards.map(bid => {
                      const b = billboards.find(x => x.id === bid);
                      return b ? <span key={bid} className="text-xs bg-muted px-1.5 py-0.5 rounded mr-1 font-mono">#{b.code}</span> : null;
                    })}
                  </td>
                  <td className="py-3 text-right font-display font-semibold">R$ {c.monthlyValue.toLocaleString()}</td>
                  <td className="py-3 text-right text-muted-foreground text-xs">{c.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
