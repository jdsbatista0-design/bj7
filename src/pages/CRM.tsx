import { useState } from "react";
import { useData, Lead } from "@/contexts/DataContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { PermissionGate, PermissionPageBlock } from "@/components/PermissionGate";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Phone, Mail, DollarSign, MapPin, Calendar, Globe, Megaphone, Users, Zap, Plus, X, Trash2, Edit, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const stages = [
  { key: "lead", label: "Lead", color: "bg-muted-foreground" },
  { key: "qualified", label: "Qualificado", color: "bg-info" },
  { key: "proposal", label: "Proposta", color: "bg-primary" },
  { key: "negotiation", label: "Negociação", color: "bg-warning" },
  { key: "closed", label: "Fechado", color: "bg-success" },
  { key: "lost", label: "Perdido", color: "bg-destructive" },
] as const;

const originIcons: Record<string, React.ElementType> = { site: Globe, site_anunciante: Globe, site_proprietario: Globe, indicacao: Users, trafego_pago: Megaphone, prospecção: Zap, evento: Calendar };
const originLabels: Record<string, string> = { site: "Site", site_anunciante: "Site · Anunciante", site_proprietario: "Site · Proprietário", indicacao: "Indicação", trafego_pago: "Tráfego Pago", prospecção: "Prospecção", evento: "Evento" };

const emptyLead: Partial<Lead> = {
  company: "", contact: "", phone: "", email: "", stage: "lead", value: 0,
  billboard_ids: [], notes: "", origin: "site", interactions: [],
};

function LeadForm({ initial, onSave, onCancel }: { initial: Partial<Lead> & { id?: string }; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="glass-panel max-w-md w-full animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-bold">{initial.id ? "Editar Lead" : "Novo Lead"}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Empresa</label><input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.company || ""} onChange={e => set("company", e.target.value)} /></div>
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Contato</label><input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.contact || ""} onChange={e => set("contact", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Telefone</label><input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.phone || ""} onChange={e => set("phone", e.target.value)} /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</label><input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.email || ""} onChange={e => set("email", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Valor estimado</label><input type="number" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.value || 0} onChange={e => set("value", parseFloat(e.target.value) || 0)} /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Origem</label><select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.origin || "site"} onChange={e => set("origin", e.target.value)}>
              {Object.entries(originLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
          </div>
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Notas</label><textarea className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary h-20 resize-none" value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={() => onSave(form)}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

export default function CRM() {
  const { can } = usePermissions();
  const { leads, billboards, addLead, updateLead, deleteLead, moveLeadStage, convertLeadToClient } = useData();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  const pipelineValue = leads.filter(l => !["closed", "lost"].includes(l.stage)).reduce((s, l) => s + l.value, 0);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const stage = result.destination.droppableId as Lead["stage"];
    moveLeadStage(result.draggableId, stage);
    toast.success(`Lead movido para ${stages.find(s => s.key === stage)?.label}`);
  };

  const handleSave = async (data: any) => {
    if (data.id) {
      await updateLead(data.id, data);
      toast.success("Lead atualizado");
    } else {
      await addLead(data);
      toast.success("Lead adicionado");
    }
    setFormOpen(false);
    setEditingLead(null);
  };

  const handleDeleteLead = async (id: string) => {
    if (!can("comercial", "can_delete")) { toast.error("Sem permissão para excluir leads"); return; }
    if (confirm("Excluir este lead?")) {
      await deleteLead(id);
      setSelectedLead(null);
      toast.success("Lead excluído");
    }
  };

  const block = <PermissionPageBlock module="comercial" label="o CRM" />;
  if (!can("comercial", "can_view")) return block;

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-screen flex flex-col">
      <div className="p-3 md:p-4 border-b border-border bg-card/60 backdrop-blur-sm flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="font-display font-bold text-base md:text-lg">CRM</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Pipeline: <span className="text-primary font-semibold">R$ {pipelineValue.toLocaleString()}</span></p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground hidden sm:block">{leads.length} leads</span>
          <PermissionGate module="comercial" action="can_create" hide>
            <Button size="sm" className="h-7 text-xs" onClick={() => { setEditingLead({ ...emptyLead }); setFormOpen(true); }}>
              <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Novo Lead</span>
            </Button>
          </PermissionGate>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto p-2 md:p-4">
          <div className="flex gap-2 md:gap-3 h-full min-w-max">
            {stages.map(stage => {
              const stageLeads = leads.filter(l => l.stage === stage.key);
              const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);
              return (
                <Droppable key={stage.key} droppableId={stage.key}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className={`kanban-column flex flex-col w-[290px] ${snapshot.isDraggingOver ? "ring-1 ring-primary/50" : ""}`}>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                        <span className="font-display font-semibold text-sm">{stage.label}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{stageLeads.length}</span>
                      </div>
                      {stageValue > 0 && <p className="text-[11px] text-muted-foreground px-1 mb-2">R$ {stageValue.toLocaleString()}</p>}
                      <div className="flex-1 space-y-2 overflow-y-auto">
                        {stageLeads.map((lead, i) => {
                          const OriginIcon = originIcons[lead.origin] || Globe;
                          const isProprietario = lead.origin === "site_proprietario" || lead.notes?.includes("[PROPRIETÁRIO]");
                          const isAnunciante = lead.origin === "site_anunciante" || lead.notes?.includes("[ANUNCIANTE]");
                          return (
                            <Draggable key={lead.id} draggableId={lead.id} index={i}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                  className={`kanban-card ${snapshot.isDragging ? "ring-2 ring-primary shadow-lg" : ""}`}
                                  onClick={() => setSelectedLead(lead)}>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm flex-1">{lead.company}</p>
                                    {isProprietario && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-accent text-accent-foreground shrink-0">Terreno</span>}
                                    {isAnunciante && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-primary/15 text-primary shrink-0">Anunciante</span>}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{lead.contact}</p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1 text-primary font-semibold"><DollarSign className="w-3 h-3" />R$ {lead.value.toLocaleString()}</span>
                                    {lead.billboard_ids.length > 0 && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.billboard_ids.length}</span>}
                                  </div>
                                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1"><OriginIcon className="w-3 h-3" />{originLabels[lead.origin] || lead.origin}</span>
                                    <span>{new Date(lead.created_at).toLocaleDateString("pt-BR")}</span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {selectedLead && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
          <div className="glass-panel max-w-md w-full animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">{selectedLead.company}</h3>
              <div className="flex items-center gap-1">
                {selectedLead.stage !== "closed" && selectedLead.stage !== "lost" && (
                  <button onClick={async () => { await convertLeadToClient(selectedLead); setSelectedLead(null); toast.success("Lead convertido em cliente!"); }}
                    className="text-success hover:bg-success/10 p-1.5 rounded-md flex items-center gap-1 text-xs font-semibold" title="Converter em Cliente">
                    <UserPlus className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => { setEditingLead({ ...selectedLead }); setFormOpen(true); setSelectedLead(null); }} className="text-muted-foreground hover:text-primary p-1"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteLead(selectedLead.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => setSelectedLead(null)} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <p className="text-muted-foreground">{selectedLead.contact}</p>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{selectedLead.phone}</span>
                <span className="flex items-center gap-1.5 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{selectedLead.email}</span>
              </div>
              <span className="font-display font-bold text-primary text-lg">R$ {selectedLead.value.toLocaleString()}</span>
              {selectedLead.billboard_ids.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedLead.billboard_ids.map(bid => { const b = billboards.find(x => x.id === bid); return b ? <span key={bid} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">#{b.code}</span> : null; })}
                </div>
              )}
              {selectedLead.interactions.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedLead.interactions.map((int, i) => (
                    <div key={i} className="flex gap-2 text-xs"><span className="text-muted-foreground whitespace-nowrap">{new Date(int.date).toLocaleDateString("pt-BR")}</span><span>{int.note}</span></div>
                  ))}
                </div>
              )}
              {selectedLead.notes && <p className="text-xs text-muted-foreground italic">{selectedLead.notes}</p>}
            </div>
          </div>
        </div>
      )}

      {formOpen && editingLead && (
        <LeadForm initial={editingLead} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditingLead(null); }} />
      )}
    </div>
  );
}
