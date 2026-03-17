import { useState } from "react";
import { leads, Lead } from "@/data/mockData";
import { motion } from "framer-motion";
import { Phone, Mail, DollarSign, MapPin } from "lucide-react";

const stages = [
  { key: "lead", label: "Lead", color: "bg-muted-foreground" },
  { key: "qualified", label: "Qualificado", color: "bg-primary" },
  { key: "proposal", label: "Proposta", color: "bg-primary" },
  { key: "negotiation", label: "Negociação", color: "bg-warning" },
  { key: "closed", label: "Fechado", color: "bg-accent" },
  { key: "lost", label: "Perdido", color: "bg-destructive" },
] as const;

export default function CRM() {
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b border-border bg-card/50">
        <h1 className="font-display font-bold text-lg">CRM Comercial</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Funil de vendas Kanban</p>
      </div>

      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-w-max">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.key);
            return (
              <div key={stage.key} className="kanban-column flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span className="font-display font-semibold text-sm">{stage.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{stageLeads.length}</span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto">
                  {stageLeads.map((lead, i) => (
                    <motion.div
                      key={lead.id}
                      className="kanban-card"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <p className="font-semibold text-sm">{lead.company}</p>
                      <p className="text-xs text-muted-foreground">{lead.contact}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          R$ {lead.value.toLocaleString()}
                        </span>
                        {lead.billboards.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {lead.billboards.length} placa(s)
                          </span>
                        )}
                      </div>
                      {lead.notes && (
                        <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
                          {lead.notes}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
