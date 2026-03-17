import { contracts, billboards, dashboardStats, revenueByMonth } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Percent } from "lucide-react";

const marginByCity = billboards.reduce((acc, b) => {
  if (!acc[b.city]) acc[b.city] = { city: b.city, revenue: 0, cost: 0 };
  if (b.status === "occupied") {
    acc[b.city].revenue += b.price;
    acc[b.city].cost += b.cost;
  }
  return acc;
}, {} as Record<string, { city: string; revenue: number; cost: number }>);

const cityData = Object.values(marginByCity).map(c => ({ ...c, margin: c.revenue - c.cost }));

export default function Financial() {
  const totalRevenue = dashboardStats.totalRevenue;
  const totalCost = dashboardStats.totalCost;
  const margin = totalRevenue - totalCost;
  const marginPct = totalRevenue > 0 ? Math.round((margin / totalRevenue) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Financeiro</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão financeira do negócio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card stat-card-accent">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">MRR</span></div>
          <p className="text-xl font-display font-bold text-accent">R$ {(dashboardStats.mrr / 1000).toFixed(0)}k</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Receita</span></div>
          <p className="text-xl font-display font-bold">R$ {(totalRevenue / 1000).toFixed(0)}k</p>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Custos</span></div>
          <p className="text-xl font-display font-bold">R$ {(totalCost / 1000).toFixed(1)}k</p>
        </div>
        <div className="stat-card stat-card-accent">
          <div className="flex items-center gap-2 mb-2"><Percent className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Margem</span></div>
          <p className="text-xl font-display font-bold text-accent">{marginPct}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue trend */}
        <div className="stat-card">
          <h3 className="font-display font-semibold mb-4">Evolução Receita</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 12%, 50%)" fontSize={12} />
              <YAxis stroke="hsl(215, 12%, 50%)" fontSize={12} tickFormatter={v => `${v/1000}k`} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Bar dataKey="revenue" fill="hsl(160, 70%, 45%)" radius={[4, 4, 0, 0]} name="Receita" />
              <Bar dataKey="cost" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} name="Custo" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Margin by billboard */}
        <div className="stat-card">
          <h3 className="font-display font-semibold mb-4">Margem por Placa (Ocupadas)</h3>
          <div className="space-y-3">
            {billboards.filter(b => b.status === "occupied").map(b => {
              const m = b.price - b.cost;
              const pct = Math.round((m / b.price) * 100);
              return (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-10">#{b.code}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-20 text-right">R$ {m.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Accounts receivable */}
      <div className="stat-card">
        <h3 className="font-display font-semibold mb-4">Contas a Receber (Contratos Ativos)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left py-2">Cliente</th>
                <th className="text-left py-2">Placas</th>
                <th className="text-right py-2">Mensal</th>
                <th className="text-right py-2">Vencimento</th>
              </tr>
            </thead>
            <tbody>
              {contracts.filter(c => c.status === "active").map(c => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="py-3 font-medium">{c.clientName}</td>
                  <td className="py-3">
                    {c.billboards.map(bid => {
                      const b = billboards.find(x => x.id === bid);
                      return b ? <span key={bid} className="text-xs bg-muted px-1.5 py-0.5 rounded mr-1 font-mono">#{b.code}</span> : null;
                    })}
                  </td>
                  <td className="py-3 text-right font-display font-semibold text-accent">R$ {c.monthlyValue.toLocaleString()}</td>
                  <td className="py-3 text-right text-muted-foreground">{new Date(c.endDate).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
