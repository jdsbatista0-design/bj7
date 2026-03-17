import { clients } from "@/data/mockData";
import { Users, Building2, Phone, Mail } from "lucide-react";

export default function Clients() {
  const advertisers = clients.filter(c => c.type === "advertiser");
  const landowners = clients.filter(c => c.type === "landowner");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Relacionamento</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestão de anunciantes e proprietários</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Advertisers */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold">Anunciantes</h2>
            <span className="text-xs text-muted-foreground ml-auto">{advertisers.length}</span>
          </div>
          <div className="space-y-3">
            {advertisers.map(c => (
              <div key={c.id} className="stat-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.company}</p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {c.contracts.length} contrato(s)
                  </span>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Landowners */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-accent" />
            <h2 className="font-display font-semibold">Proprietários de Terrenos</h2>
            <span className="text-xs text-muted-foreground ml-auto">{landowners.length}</span>
          </div>
          <div className="space-y-3">
            {landowners.map(c => (
              <div key={c.id} className="stat-card stat-card-accent">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    {c.company && <p className="text-sm text-muted-foreground">{c.company}</p>}
                  </div>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                    {c.contracts.length} contrato(s)
                  </span>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                </div>
                {c.history.map((h, i) => (
                  <p key={i} className="text-xs text-muted-foreground mt-2 italic">{h}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
