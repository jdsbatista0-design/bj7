import { clients, billboards, contracts } from "@/data/mockData";
import { Users, Building2, Phone, Mail, MapPin, FileText, Search } from "lucide-react";
import { useState } from "react";

export default function Clients() {
  const [tab, setTab] = useState<"advertiser" | "landowner">("advertiser");
  const [search, setSearch] = useState("");

  const filtered = clients.filter(c => {
    const matchType = c.type === tab;
    const matchSearch = search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-display font-bold">Relacionamento</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestão de anunciantes e proprietários de terrenos</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setTab("advertiser")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${tab === "advertiser" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <Building2 className="w-4 h-4" /> Anunciantes
          </button>
          <button
            onClick={() => setTab("landowner")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${tab === "landowner" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <Users className="w-4 h-4" /> Proprietários
          </button>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} registros</span>
      </div>

      <div className="space-y-3">
        {filtered.map(c => {
          const clientContracts = contracts.filter(ct => ct.clientId === c.id);
          const clientBillboards = c.billboards.map(bid => billboards.find(b => b.id === bid)).filter(Boolean);

          return (
            <div key={c.id} className={`stat-card ${tab === "landowner" ? "stat-card-accent" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-semibold text-lg">{c.name}</p>
                  {c.company && <p className="text-sm text-muted-foreground">{c.company}</p>}
                  {c.document && <p className="text-xs text-muted-foreground font-mono mt-0.5">{c.document}</p>}
                </div>
                <div className="flex gap-2">
                  {clientContracts.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {clientContracts.length} contrato(s)
                    </span>
                  )}
                  {clientBillboards.length > 0 && (
                    <span className="text-xs bg-info/10 text-info px-2.5 py-1 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {clientBillboards.length} ponto(s)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                {c.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.address}</span>}
              </div>

              {clientBillboards.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {clientBillboards.map(b => b && (
                    <span key={b.id} className="text-xs bg-muted px-2 py-0.5 rounded font-mono">#{b.code} · {b.route}</span>
                  ))}
                </div>
              )}

              {c.history.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  {c.history.map((h, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{h}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
