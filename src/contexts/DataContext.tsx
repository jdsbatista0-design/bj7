import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Billboard {
  id: string;
  code: string;
  title: string;
  short_description: string;
  commercial_description: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  route: string;
  address: string;
  type: string;
  dimension: string;
  width: number;
  height: number;
  area: number;
  direction: string;
  estimated_flow: number;
  audience_profile: string;
  seasonality: string;
  traffic_type: string;
  land_owner: string;
  land_owner_id: string | null;
  cost: number;
  price: number;
  production_cost: number;
  status: "available" | "occupied" | "reserved";
  commercial_status: string;
  operational_status: string;
  photos: string[];
  main_photo: string;
  gallery: string[];
  description: string;
  formats: string[];
  maps_url: string;
  google_street_view_url: string;
  illumination: string;
  show_on_site: boolean;
  active: boolean;
}

export interface Lead {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed" | "lost";
  value: number;
  billboard_ids: string[];
  notes: string;
  origin: string;
  interactions: { date: string; note: string }[];
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  document: string;
  phone: string;
  email: string;
  type: "advertiser" | "landowner";
  address: string;
  history: string[];
  billboard_ids: string[];
  contract_ids: string[];
  segment: string;
  notes: string;
  contact_person: string;
  land_registry: string;
  property_area: string;
  bank_info: string;
}

export interface Contract {
  id: string;
  type: "veiculacao" | "locacao_terreno";
  client_id: string | null;
  client_name: string;
  billboard_ids: string[];
  start_date: string;
  end_date: string;
  monthly_value: number;
  total_value: number;
  status: "active" | "expired" | "cancelled" | "pending";
  renewal_type: string;
  payment_method: string;
  document_url: string;
  notes: string;
}

export interface WorkOrder {
  id: string;
  type: "installation" | "swap" | "maintenance" | "inspection";
  billboard_id: string | null;
  billboard_code: string;
  client_name: string;
  client_id: string | null;
  contract_id: string | null;
  assignee: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  due_date: string;
  completed_date?: string;
  sla_hours: number;
  checklist: { item: string; done: boolean }[];
  photos_before: string[];
  photos_after: string[];
}

export interface FinancialEntry {
  id: string;
  category: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  entry_date: string;
  client_id: string | null;
  contract_id: string | null;
  billboard_id: string | null;
  status: string;
  notes: string;
  created_at: string;
}

interface DataContextType {
  billboards: Billboard[];
  leads: Lead[];
  clients: Client[];
  contracts: Contract[];
  workOrders: WorkOrder[];
  financialEntries: FinancialEntry[];
  loading: boolean;
  refresh: () => void;
  addBillboard: (b: Partial<Billboard>) => Promise<void>;
  updateBillboard: (id: string, b: Partial<Billboard>) => Promise<void>;
  deleteBillboard: (id: string) => Promise<void>;
  addLead: (l: Partial<Lead>) => Promise<void>;
  updateLead: (id: string, l: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  moveLeadStage: (id: string, stage: Lead["stage"]) => Promise<void>;
  addClient: (c: Partial<Client>) => Promise<void>;
  updateClient: (id: string, c: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addContract: (c: Partial<Contract>) => Promise<void>;
  updateContract: (id: string, c: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  addWorkOrder: (w: Partial<WorkOrder>) => Promise<void>;
  updateWorkOrder: (id: string, w: Partial<WorkOrder>) => Promise<void>;
  deleteWorkOrder: (id: string) => Promise<void>;
  addFinancialEntry: (f: Partial<FinancialEntry>) => Promise<void>;
  updateFinancialEntry: (id: string, f: Partial<FinancialEntry>) => Promise<void>;
  deleteFinancialEntry: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

function mapBillboard(row: any): Billboard {
  return {
    id: row.id, code: row.code, title: row.title || "", short_description: row.short_description || "",
    commercial_description: row.commercial_description || "",
    lat: row.lat, lng: row.lng,
    city: row.city || "", region: row.region || "", route: row.route || "",
    address: row.address || "", type: row.type || "painel_rodoviario",
    dimension: row.dimension || "9x3m", width: Number(row.width) || 9, height: Number(row.height) || 3,
    area: Number(row.area) || 27,
    direction: row.direction || "", estimated_flow: row.estimated_flow || 0,
    audience_profile: row.audience_profile || "", seasonality: row.seasonality || "media",
    traffic_type: row.traffic_type || "", land_owner: row.land_owner || "",
    land_owner_id: row.land_owner_id, cost: Number(row.cost) || 0,
    price: Number(row.price) || 0, production_cost: Number(row.production_cost) || 0,
    status: row.status || "available",
    commercial_status: row.commercial_status || "available",
    operational_status: row.operational_status || "active",
    photos: row.photos || [], main_photo: row.main_photo || "",
    gallery: row.gallery || [],
    description: row.description || "", formats: row.formats || [],
    maps_url: row.maps_url || "", google_street_view_url: row.google_street_view_url || "",
    illumination: row.illumination || "nao",
    show_on_site: row.show_on_site !== false,
    active: row.active !== false,
  };
}

function mapLead(row: any): Lead {
  return {
    id: row.id, company: row.company, contact: row.contact || "",
    phone: row.phone || "", email: row.email || "", stage: row.stage || "lead",
    value: Number(row.value) || 0, billboard_ids: row.billboard_ids || [],
    notes: row.notes || "", origin: row.origin || "site",
    interactions: row.interactions || [], created_at: row.created_at,
  };
}

function mapClient(row: any): Client {
  return {
    id: row.id, name: row.name, company: row.company || "",
    document: row.document || "", phone: row.phone || "", email: row.email || "",
    type: row.type || "advertiser", address: row.address || "",
    history: row.history || [], billboard_ids: row.billboard_ids || [],
    contract_ids: row.contract_ids || [], segment: row.segment || "",
    notes: row.notes || "", contact_person: row.contact_person || "",
    land_registry: row.land_registry || "", property_area: row.property_area || "",
    bank_info: row.bank_info || "",
  };
}

function mapContract(row: any): Contract {
  return {
    id: row.id, type: row.type || "veiculacao", client_id: row.client_id,
    client_name: row.client_name || "", billboard_ids: row.billboard_ids || [],
    start_date: row.start_date, end_date: row.end_date,
    monthly_value: Number(row.monthly_value) || 0, total_value: Number(row.total_value) || 0,
    status: row.status || "pending", renewal_type: row.renewal_type || "manual",
    payment_method: row.payment_method || "", document_url: row.document_url || "",
    notes: row.notes || "",
  };
}

function mapWorkOrder(row: any): WorkOrder {
  return {
    id: row.id, type: row.type || "installation", billboard_id: row.billboard_id,
    billboard_code: row.billboard_code || "", client_name: row.client_name || "",
    client_id: row.client_id || null, contract_id: row.contract_id || null,
    assignee: row.assignee || "", status: row.status || "pending",
    due_date: row.due_date, completed_date: row.completed_date || undefined,
    sla_hours: row.sla_hours || 48, checklist: row.checklist || [],
    photos_before: row.photos_before || [], photos_after: row.photos_after || [],
  };
}

function mapFinancialEntry(row: any): FinancialEntry {
  return {
    id: row.id, category: row.category || "operacional",
    description: row.description || "", amount: Number(row.amount) || 0,
    type: row.type || "expense", entry_date: row.entry_date,
    client_id: row.client_id, contract_id: row.contract_id,
    billboard_id: row.billboard_id, status: row.status || "pending",
    notes: row.notes || "", created_at: row.created_at,
  };
}

async function fetchBillboards() {
  const { data } = await supabase.from("billboards").select("*").order("code");
  return data ? data.map(mapBillboard) : [];
}
async function fetchLeads() {
  const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  return data ? data.map(mapLead) : [];
}
async function fetchClients() {
  const { data } = await supabase.from("clients").select("*").order("name");
  return data ? data.map(mapClient) : [];
}
async function fetchContracts() {
  const { data } = await supabase.from("contracts").select("*").order("start_date", { ascending: false });
  return data ? data.map(mapContract) : [];
}
async function fetchWorkOrders() {
  const { data } = await supabase.from("work_orders").select("*").order("due_date");
  return data ? data.map(mapWorkOrder) : [];
}
async function fetchFinancialEntries() {
  const { data } = await supabase.from("financial_entries").select("*").order("entry_date", { ascending: false });
  return data ? data.map(mapFinancialEntry) : [];
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [b, l, c, ct, wo, fe] = await Promise.all([
      fetchBillboards(), fetchLeads(), fetchClients(), fetchContracts(), fetchWorkOrders(), fetchFinancialEntries(),
    ]);
    setBillboards(b); setLeads(l); setClients(c); setContracts(ct); setWorkOrders(wo); setFinancialEntries(fe);
    setLoading(false);
  }, []);

  const refreshTable = useCallback(async (table: string) => {
    switch (table) {
      case "billboards": setBillboards(await fetchBillboards()); break;
      case "leads": setLeads(await fetchLeads()); break;
      case "clients": setClients(await fetchClients()); break;
      case "contracts": setContracts(await fetchContracts()); break;
      case "work_orders": setWorkOrders(await fetchWorkOrders()); break;
      case "financial_entries": setFinancialEntries(await fetchFinancialEntries()); break;
    }
  }, []);

  useEffect(() => {
    if (session) fetchAll();
  }, [session, fetchAll]);

  // Billboard CRUD
  const addBillboard = async (b: Partial<Billboard>) => {
    const { error } = await supabase.from("billboards").insert({
      code: b.code, lat: b.lat, lng: b.lng, city: b.city, region: b.region, route: b.route,
      address: b.address, type: b.type, dimension: b.dimension, area: b.area, direction: b.direction,
      estimated_flow: b.estimated_flow, audience_profile: b.audience_profile, seasonality: b.seasonality,
      traffic_type: b.traffic_type, land_owner: b.land_owner, cost: b.cost, price: b.price,
      production_cost: b.production_cost, status: b.status, description: b.description, formats: b.formats,
      photos: b.photos || [], title: b.title, short_description: b.short_description,
      commercial_description: b.commercial_description, maps_url: b.maps_url,
      google_street_view_url: b.google_street_view_url, width: b.width, height: b.height,
      illumination: b.illumination, main_photo: b.main_photo, gallery: b.gallery || [],
      commercial_status: b.commercial_status, operational_status: b.operational_status,
      show_on_site: b.show_on_site, active: b.active,
    } as any);
    if (!error) refreshTable("billboards");
  };

  const updateBillboard = async (id: string, updates: Partial<Billboard>) => {
    const dbUpdates: any = { ...updates };
    delete dbUpdates.id;
    const { error } = await supabase.from("billboards").update(dbUpdates).eq("id", id);
    if (!error) refreshTable("billboards");
  };

  const deleteBillboard = async (id: string) => {
    const { error } = await supabase.from("billboards").delete().eq("id", id);
    if (!error) refreshTable("billboards");
  };

  // Lead CRUD
  const addLead = async (l: Partial<Lead>) => {
    const { error } = await supabase.from("leads").insert({
      company: l.company, contact: l.contact, phone: l.phone, email: l.email,
      stage: l.stage, value: l.value, billboard_ids: l.billboard_ids || [],
      notes: l.notes, origin: l.origin, interactions: l.interactions || [],
    } as any);
    if (!error) refreshTable("leads");
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const dbUpdates: any = { ...updates };
    delete dbUpdates.id; delete dbUpdates.created_at;
    const { error } = await supabase.from("leads").update(dbUpdates).eq("id", id);
    if (!error) refreshTable("leads");
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (!error) refreshTable("leads");
  };

  const moveLeadStage = async (id: string, stage: Lead["stage"]) => {
    await updateLead(id, { stage });
  };

  // Client CRUD
  const addClient = async (c: Partial<Client>) => {
    const { error } = await supabase.from("clients").insert({
      name: c.name, company: c.company, document: c.document, phone: c.phone,
      email: c.email, type: c.type, address: c.address, history: c.history || [],
      billboard_ids: c.billboard_ids || [], contract_ids: c.contract_ids || [],
      segment: c.segment, notes: c.notes, contact_person: c.contact_person,
      land_registry: c.land_registry, property_area: c.property_area, bank_info: c.bank_info,
    } as any);
    if (!error) refreshTable("clients");
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const dbUpdates: any = { ...updates };
    delete dbUpdates.id;
    const { error } = await supabase.from("clients").update(dbUpdates).eq("id", id);
    if (!error) refreshTable("clients");
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (!error) refreshTable("clients");
  };

  // Contract CRUD — auto-updates billboard status when contract becomes active
  const addContract = async (c: Partial<Contract>) => {
    const { error } = await supabase.from("contracts").insert({
      type: c.type, client_id: c.client_id, client_name: c.client_name,
      billboard_ids: c.billboard_ids || [], start_date: c.start_date, end_date: c.end_date,
      monthly_value: c.monthly_value, total_value: c.total_value, status: c.status,
      renewal_type: c.renewal_type, payment_method: c.payment_method,
      document_url: c.document_url || "", notes: c.notes || "",
    } as any);
    if (!error) {
      if (c.status === "active" && c.billboard_ids && c.billboard_ids.length > 0) {
        for (const bid of c.billboard_ids) {
          await supabase.from("billboards").update({ status: "occupied" }).eq("id", bid);
        }
        refreshTable("billboards");
      }
      refreshTable("contracts");
    }
  };

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    const dbUpdates: any = { ...updates };
    delete dbUpdates.id;
    const { error } = await supabase.from("contracts").update(dbUpdates).eq("id", id);
    if (!error) {
      if (updates.status === "active" && updates.billboard_ids && updates.billboard_ids.length > 0) {
        for (const bid of updates.billboard_ids) {
          await supabase.from("billboards").update({ status: "occupied" }).eq("id", bid);
        }
        refreshTable("billboards");
      }
      if ((updates.status === "cancelled" || updates.status === "expired") && updates.billboard_ids) {
        for (const bid of updates.billboard_ids) {
          await supabase.from("billboards").update({ status: "available" }).eq("id", bid);
        }
        refreshTable("billboards");
      }
      refreshTable("contracts");
    }
  };

  const deleteContract = async (id: string) => {
    const { error } = await supabase.from("contracts").delete().eq("id", id);
    if (!error) refreshTable("contracts");
  };

  // Work Order CRUD
  const addWorkOrder = async (w: Partial<WorkOrder>) => {
    const { error } = await supabase.from("work_orders").insert({
      type: w.type, billboard_id: w.billboard_id, billboard_code: w.billboard_code,
      client_name: w.client_name, client_id: w.client_id, contract_id: w.contract_id,
      assignee: w.assignee, status: w.status,
      due_date: w.due_date, sla_hours: w.sla_hours, checklist: w.checklist || [],
      photos_before: w.photos_before || [], photos_after: w.photos_after || [],
    } as any);
    if (!error) refreshTable("work_orders");
  };

  const updateWorkOrder = async (id: string, updates: Partial<WorkOrder>) => {
    const dbUpdates: any = { ...updates };
    delete dbUpdates.id;
    const { error } = await supabase.from("work_orders").update(dbUpdates).eq("id", id);
    if (!error) refreshTable("work_orders");
  };

  const deleteWorkOrder = async (id: string) => {
    const { error } = await supabase.from("work_orders").delete().eq("id", id);
    if (!error) refreshTable("work_orders");
  };

  // Financial Entry CRUD
  const addFinancialEntry = async (f: Partial<FinancialEntry>) => {
    const { error } = await supabase.from("financial_entries").insert({
      category: f.category, description: f.description, amount: f.amount,
      type: f.type, entry_date: f.entry_date, client_id: f.client_id,
      contract_id: f.contract_id, billboard_id: f.billboard_id,
      status: f.status, notes: f.notes,
    } as any);
    if (!error) refreshTable("financial_entries");
  };

  const updateFinancialEntry = async (id: string, updates: Partial<FinancialEntry>) => {
    const dbUpdates: any = { ...updates };
    delete dbUpdates.id; delete dbUpdates.created_at;
    const { error } = await supabase.from("financial_entries").update(dbUpdates).eq("id", id);
    if (!error) refreshTable("financial_entries");
  };

  const deleteFinancialEntry = async (id: string) => {
    const { error } = await supabase.from("financial_entries").delete().eq("id", id);
    if (!error) refreshTable("financial_entries");
  };

  return (
    <DataContext.Provider value={{
      billboards, leads, clients, contracts, workOrders, financialEntries, loading, refresh: fetchAll,
      addBillboard, updateBillboard, deleteBillboard,
      addLead, updateLead, deleteLead, moveLeadStage,
      addClient, updateClient, deleteClient,
      addContract, updateContract, deleteContract,
      addWorkOrder, updateWorkOrder, deleteWorkOrder,
      addFinancialEntry, updateFinancialEntry, deleteFinancialEntry,
    }}>
      {children}
    </DataContext.Provider>
  );
}
