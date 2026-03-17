import { useState } from "react";
import { leads, Lead, billboards } from "@/data/mockData";
import { motion } from "framer-motion";
import { Phone, Mail, DollarSign, MapPin, Calendar, MessageSquare, Globe, Megaphone, Users, Zap } from "lucide-react";

const stages = [
  { key: "lead", label: "Lead", color: "bg-muted-foreground" },
  { key: "qualified", label: "Qualificado", color: "bg-info" },
  { key: "proposal", label: "Proposta", color: "bg-primary" },
  { key: "negotiation", label: "Negociação", color: "bg-warning" },
  { key: "closed", label: "Fechado", color: "bg-success" },
  { key: "lost", label: "Perdido", color: "bg-destructive" },
] as const;

const originIcons: Record<string, React.ElementType> = {
  site: Globe,
  indicacao: Users,
  trafego_pago: Megaphone,
  prospecção: Zap,
  evento: Calendar,
};

const originLabels: Record<string, string> = {
  site: "Site",
  indicacao: "Indicação",
  trafego_pago: "Tráfego Pago",
  prospecção: "Prospecção",
  evento: "Evento",
};

export default function CRM() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const pipelineValue = leads.filter(l => !["closed", "lost"].includes(l.stage)).reduce((s, l) => s + l.value, 0);

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b border-border bg-card/60 backdrop-blur-sm flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-lg">CRM Comercial</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Funil de vendas · Pipeline: <span className="text-primary font-semibold">R$ {pipelineValue.toLocaleString()}</span></p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="text-muted-foreground">{leads.length} leads total</span>
          <span className="text-success">{leads.filter(l => l.stage === "closed").length} fechados</span>
          <span className="text-destructive">{leads.filter(l => l.stage === "lost").length} perdidos</span>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-3 h-full min-w-max">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.key);
            const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);
            return (
              <div key={stage.key} className="kanban-column flex flex-col w-[290px]">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                  <span className="font-display font-semibold text-sm">{stage.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{stageLeads.length}</span>
                </div>
                {stageValue > 0 && (
                  <p className="text-[11px] text-muted-foreground px-1 mb-2">
                    R$ {stageValue.toLocaleString()}
                  </p>
                )}

                <div className="flex-1 space-y-2 overflow-y-auto">
                  {stageLeads.map((lead, i) => {
                    const OriginIcon = originIcons[lead.origin] || Globe;
                    return (
                      <motion.div
                        key={lead.id}
                        className="kanban-card"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <p className="font-semibold text-sm">{lead.company}</p>
                        <p className="text-xs text-muted-foreground">{lead.contact}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 text-primary font-semibold">
                            <DollarSign className="w-3 h-3" />
                            R$ {lead.value.toLocaleString()}
                          </span>
                          {lead.billboards.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lead.billboards.length} ponto(s)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><OriginIcon className="w-3 h-3" />{originLabels[lead.origin]}</span>
                          <span>{new Date(lead.createdAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead detail modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
          <div className="glass-panel max-w-md w-full animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-border">
              <h3 className="font-display font-bold text-lg">{selectedLead.company}</h3>
              <p className="text-sm text-muted-foreground">{selectedLead.contact}</p>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{selectedLead.phone}</span>
                <span className="flex items-center gap-1.5 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{selectedLead.email}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-display font-bold text-primary text-lg">R$ {selectedLead.value.toLocaleString()}</span>
                <span className="text-xs bg-muted px-2 py-1 rounded self-center">{originLabels[selectedLead.origin]}</span>
              </div>

              {selectedLead.billboards.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Pontos vinculados:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.billboards.map(bid => {
                      const b = billboards.find(x => x.id === bid);
                      return b ? <span key={bid} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">#{b.code}</span> : null;
                    })}
                  </div>
                </div>
              )}

              {selectedLead.interactions.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Histórico:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedLead.interactions.map((int, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="text-muted-foreground whitespace-nowrap">{new Date(int.date).toLocaleDateString("pt-BR")}</span>
                        <span>{int.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLead.notes && <p className="text-xs text-muted-foreground italic">{selectedLead.notes}</p>}
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button onClick={() => setSelectedLead(null)} className="text-sm text-muted-foreground hover:text-foreground">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
