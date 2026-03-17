import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import {
  Billboard, Lead, Client, Contract, WorkOrder,
  billboards as initialBillboards,
  leads as initialLeads,
  clients as initialClients,
  contracts as initialContracts,
  workOrders as initialWorkOrders,
} from "@/data/mockData";

interface DataContextType {
  billboards: Billboard[];
  leads: Lead[];
  clients: Client[];
  contracts: Contract[];
  workOrders: WorkOrder[];
  // Billboards
  addBillboard: (b: Billboard) => void;
  updateBillboard: (id: string, b: Partial<Billboard>) => void;
  deleteBillboard: (id: string) => void;
  // Leads
  addLead: (l: Lead) => void;
  updateLead: (id: string, l: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLeadStage: (id: string, stage: Lead["stage"]) => void;
  // Clients
  addClient: (c: Client) => void;
  updateClient: (id: string, c: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  // Contracts
  addContract: (c: Contract) => void;
  updateContract: (id: string, c: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  // Work Orders
  addWorkOrder: (w: WorkOrder) => void;
  updateWorkOrder: (id: string, w: Partial<WorkOrder>) => void;
  deleteWorkOrder: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [billboards, setBillboards] = useState<Billboard[]>(initialBillboards);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);

  const addBillboard = useCallback((b: Billboard) => setBillboards(prev => [...prev, b]), []);
  const updateBillboard = useCallback((id: string, updates: Partial<Billboard>) =>
    setBillboards(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b)), []);
  const deleteBillboard = useCallback((id: string) => setBillboards(prev => prev.filter(b => b.id !== id)), []);

  const addLead = useCallback((l: Lead) => setLeads(prev => [...prev, l]), []);
  const updateLead = useCallback((id: string, updates: Partial<Lead>) =>
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l)), []);
  const deleteLead = useCallback((id: string) => setLeads(prev => prev.filter(l => l.id !== id)), []);
  const moveLeadStage = useCallback((id: string, stage: Lead["stage"]) =>
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l)), []);

  const addClient = useCallback((c: Client) => setClients(prev => [...prev, c]), []);
  const updateClient = useCallback((id: string, updates: Partial<Client>) =>
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)), []);
  const deleteClient = useCallback((id: string) => setClients(prev => prev.filter(c => c.id !== id)), []);

  const addContract = useCallback((c: Contract) => setContracts(prev => [...prev, c]), []);
  const updateContract = useCallback((id: string, updates: Partial<Contract>) =>
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)), []);
  const deleteContract = useCallback((id: string) => setContracts(prev => prev.filter(c => c.id !== id)), []);

  const addWorkOrder = useCallback((w: WorkOrder) => setWorkOrders(prev => [...prev, w]), []);
  const updateWorkOrder = useCallback((id: string, updates: Partial<WorkOrder>) =>
    setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w)), []);
  const deleteWorkOrder = useCallback((id: string) => setWorkOrders(prev => prev.filter(w => w.id !== id)), []);

  return (
    <DataContext.Provider value={{
      billboards, leads, clients, contracts, workOrders,
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
