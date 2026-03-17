import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types matching the database schema
export interface Billboard {
  id: string;
  code: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  route: string;
  address: string;
  type: string;
  dimension: string;
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
  photos: string[];
  description: string;
  formats: string[];
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
}

export interface WorkOrder {
  id: string;
  type: "installation" | "swap" | "maintenance" | "inspection";
  billboard_id: string | null;
  billboard_code: string;
  client_name: string;
  assignee: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  due_date: string;
  completed_date?: string;
  sla_hours: number;
  checklist: { item: string; done: boolean }[];
  photos_before: string[];
  photos_after: string[];
}

interface DataContextType {
  billboards: Billboard[];
  leads: Lead[];
  clients: Client[];
  contracts: Contract[];
  workOrders: WorkOrder[];
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
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

function mapBillboard(row: any): Billboard {
  return {
    id: row.id,
    code: row.code,
    lat: row.lat,
    lng: row.lng,
    city: row.city || "",
    region: row.region || "",
    route: row.route || "",
    address: row.address || "",
    type: row.type || "painel_rodoviario",
    dimension: row.dimension || "9x3m",
    area: Number(row.area) || 27,
    direction: row.direction || "",
    estimated_flow: row.estimated_flow || 0,
    audience_profile: row.audience_profile || "",
    seasonality: row.seasonality || "media",
    traffic_type: row.traffic_type || "",
    land_owner: row.land_owner || "",
    land_owner_id: row.land_owner_id,
    cost: Number(row.cost) || 0,
    price: Number(row.price) || 0,
    production_cost: Number(row.production_cost) || 0,
    status: row.status || "available",
    photos: row.photos || [],
    description: row.description || "",
    formats: row.formats || [],
  };
}

function mapLead(row: any): Lead {
  return {
    id: row.id,
    company: row.company,
    contact: row.contact || "",
    phone: row.phone || "",
    email: row.email || "",
    stage: row.stage || "lead",
    value: Number(row.value) || 0,
    billboard_ids: row.billboard_ids || [],
    notes: row.notes || "",
    origin: row.origin || "site",
    interactions: row.interactions || [],
    created_at: row.created_at,
  };
}

function mapClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    company: row.company || "",
    document: row.document || "",
    phone: row.phone || "",
    email: row.email || "",
    type: row.type || "advertiser",
    address: row.address || "",
    history: row.history || [],
    billboard_ids: row.billboard_ids || [],
    contract_ids: row.contract_ids || [],
  };
}

function mapContract(row: any): Contract {
  return {
    id: row.id,
    type: row.type || "veiculacao",
    client_id: row.client_id,
    client_name: row.client_name || "",
    billboard_ids: row.billboard_ids || [],
    start_date: row.start_date,
    end_date: row.end_date,
    monthly_value: Number(row.monthly_value) || 0,
    total_value: Number(row.total_value) || 0,
    status: row.status || "pending",
    renewal_type: row.renewal_type || "manual",
    payment_method: row.payment_method || "",
    document_url: row.document_url || "",
  };
}

function mapWorkOrder(row: any): WorkOrder {
  return {
    id: row.id,
    type: row.type || "installation",
    billboard_id: row.billboard_id,
    billboard_code: row.billboard_code || "",
    client_name: row.client_name || "",
    assignee: row.assignee || "",
    status: row.status || "pending",
    due_date: row.due_date,
    completed_date: row.completed_date || undefined,
    sla_hours: row.sla_hours || 48,
    checklist: row.checklist || [],
    photos_before: row.photos_before || [],
    photos_after: row.photos_after || [],
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [bRes, lRes, cRes, ctRes, woRes] = await Promise.all([
      supabase.from("billboards").select("*").order("code"),
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("*").order("name"),
      supabase.from("contracts").select("*").order("start_date", { ascending: false }),
      supabase.from("work_orders").select("*").order("due_date"),
    ]);
    if (bRes.data) setBillboards(bRes.data.map(mapBillboard));
    if (lRes.data) setLeads(lRes.data.map(mapLead));
    if (cRes.data) setClients(cRes.data.map(mapClient));
    if (ctRes.data) setContracts(ctRes.data.map(mapContract));
    if (woRes.data) setWorkOrders(woRes.data.map(mapWorkOrder));
    setLoading(false);
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
      production_cost: b.production_cost, status: b.status, description: b.description, formats: b.formats, photos: b.photos || [],
    } as any);
    if (!error) fetchAll();
  };

  const updateBillboard = async (id: string, updates: Partial<Billboard>) => {
    const dbUpdates: any = { ...updates };
    delete dbUpdates.id;
    const { error } = await supabase.from("billboards").update(dbUpdates).eq("id", id);
    if (!error) fetchAll();
  };

  const deleteBillboard = async (id: string) => {
    const { error } = await supabase.from("billboards").delete().eq("id", id);
    if (!error) fetchAll();
  };

  // Lead CRUD
  const addLead = async (l: Partial<Lead>) => {
    const { error } = await supabase.from("leads").insert({
      company: l.company, contact: l.contact, phone: l.phone, email: l.email,
      stage: l.stage, value: l.value, billboard_ids: l.billboard_ids || [],
      notes: l.notes, origin: l.origin, interactions: l.interactions || [],
    } as any);
    if (!error) fetchAll();
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const dbUpdates: any = { ...updates };
    delete dbUpdates.id;
    delete dbUpdates.created_at;
    const { error } = await supabase.from("leads").update(dbUpdates).eq("id", id);
    if (!error) fetchAll();
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (!error) fetchAll();
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
    } as any);
    if (!error) fetchAll();
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const dbUpdates: any = { ...updates };
    delete dbUpdates.id;
    const { error } = await supabase.from("clients").update(dbUpdates).eq("id", id);
    if (!error) fetchAll();
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (!error) fetchAll();
  };

  // Contract CRUD
  const addContract = async (c: Partial<Contract>) => {
    const { error } = await supabase.from("contracts").insert({
      type: c.type, client_id: c.client_id, client_name: c.client_name,
      billboard_ids: c.billboard_ids || [], start_date: c.start_date, end_date: c.end_date,
      monthly_value: c.monthly_value, total_value: c.total_value, status: c.status,
      renewal_type: c.renewal_type, payment_method: c.payment_method, document_url: c.document_url || "",
    } as any);
    if (!error) fetchAll();
  };

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    const dbUpdates: any = { ...updates };
    delete dbUpdates.id;
    const { error } = await supabase.from("contracts").update(dbUpdates).eq("id", id);
    if (!error) fetchAll();
  };

  const deleteContract = async (id: string) => {
    const { error } = await supabase.from("contracts").delete().eq("id", id);
    if (!error) fetchAll();
  };

  // Work Order CRUD
  const addWorkOrder = async (w: Partial<WorkOrder>) => {
    const { error } = await supabase.from("work_orders").insert({
      type: w.type, billboard_id: w.billboard_id, billboard_code: w.billboard_code,
      client_name: w.client_name, assignee: w.assignee, status: w.status,
      due_date: w.due_date, sla_hours: w.sla_hours, checklist: w.checklist || [],
      photos_before: w.photos_before || [], photos_after: w.photos_after || [],
    } as any);
    if (!error) fetchAll();
  };

  const updateWorkOrder = async (id: string, updates: Partial<WorkOrder>) => {
    const dbUpdates: any = { ...updates };
    delete dbUpdates.id;
    const { error } = await supabase.from("work_orders").update(dbUpdates).eq("id", id);
    if (!error) fetchAll();
  };

  const deleteWorkOrder = async (id: string) => {
    const { error } = await supabase.from("work_orders").delete().eq("id", id);
    if (!error) fetchAll();
  };

  return (
    <DataContext.Provider value={{
      billboards, leads, clients, contracts, workOrders, loading, refresh: fetchAll,
      addBillboard, updateBillboard, deleteBillboard,
      addLead, updateLead, deleteLead, moveLeadStage,
      addClient, updateClient, deleteClient,
      addContract, updateContract, deleteContract,
      addWorkOrder, updateWorkOrder, deleteWorkOrder,
    }}>
      {children}
    </DataContext.Provider>
  );
}
