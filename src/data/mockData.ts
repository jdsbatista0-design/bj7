// Mock data for the entire OOH management system

export interface Billboard {
  id: string;
  code: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  address: string;
  type: "outdoor" | "frontlight" | "backlight" | "painel" | "empena";
  dimension: string;
  direction: string;
  estimatedFlow: number;
  landOwner: string;
  landOwnerId: string;
  cost: number;
  price: number;
  status: "available" | "occupied" | "reserved";
  photos: string[];
  description: string;
}

export interface Lead {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed" | "lost";
  value: number;
  billboards: string[];
  notes: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  type: "advertiser" | "landowner";
  contracts: string[];
  history: string[];
}

export interface Contract {
  id: string;
  clientId: string;
  clientName: string;
  billboards: string[];
  startDate: string;
  endDate: string;
  monthlyValue: number;
  status: "active" | "expired" | "cancelled";
}

export interface WorkOrder {
  id: string;
  type: "installation" | "swap" | "maintenance" | "inspection";
  billboardId: string;
  billboardCode: string;
  assignee: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  dueDate: string;
  slaHours: number;
  checklist: { item: string; done: boolean }[];
}

// ---- BILLBOARDS ----
export const billboards: Billboard[] = [
  {
    id: "b1", code: "1001", lat: -23.5505, lng: -46.6333,
    city: "São Paulo", region: "Centro", address: "Av. Paulista, 1000",
    type: "outdoor", dimension: "9x3m", direction: "Norte-Sul",
    estimatedFlow: 85000, landOwner: "Carlos Silva", landOwnerId: "lo1",
    cost: 3500, price: 12000, status: "available",
    photos: [], description: "Ponto premium na Av. Paulista com alta visibilidade"
  },
  {
    id: "b2", code: "1002", lat: -23.5630, lng: -46.6543,
    city: "São Paulo", region: "Zona Sul", address: "Av. Brigadeiro Faria Lima, 2000",
    type: "frontlight", dimension: "12x4m", direction: "Leste-Oeste",
    estimatedFlow: 72000, landOwner: "Maria Santos", landOwnerId: "lo2",
    cost: 4200, price: 15000, status: "occupied",
    photos: [], description: "Frontlight iluminado na Faria Lima"
  },
  {
    id: "b3", code: "1003", lat: -23.5317, lng: -46.6520,
    city: "São Paulo", region: "Centro", address: "Rua da Consolação, 500",
    type: "painel", dimension: "6x3m", direction: "Sul-Norte",
    estimatedFlow: 45000, landOwner: "José Oliveira", landOwnerId: "lo3",
    cost: 2000, price: 7500, status: "reserved",
    photos: [], description: "Painel estratégico na Consolação"
  },
  {
    id: "b4", code: "1004", lat: -22.9068, lng: -43.1729,
    city: "Rio de Janeiro", region: "Centro", address: "Av. Rio Branco, 100",
    type: "outdoor", dimension: "9x3m", direction: "Norte-Sul",
    estimatedFlow: 95000, landOwner: "Ana Ferreira", landOwnerId: "lo4",
    cost: 5000, price: 18000, status: "available",
    photos: [], description: "Outdoor de alta visibilidade no Centro do RJ"
  },
  {
    id: "b5", code: "1005", lat: -22.9110, lng: -43.2094,
    city: "Rio de Janeiro", region: "Zona Sul", address: "Av. Atlântica, 3000",
    type: "empena", dimension: "15x8m", direction: "Frente-Mar",
    estimatedFlow: 120000, landOwner: "Roberto Costa", landOwnerId: "lo5",
    cost: 8000, price: 35000, status: "occupied",
    photos: [], description: "Empena gigante em Copacabana"
  },
  {
    id: "b6", code: "1006", lat: -19.9167, lng: -43.9345,
    city: "Belo Horizonte", region: "Savassi", address: "Av. Afonso Pena, 1500",
    type: "backlight", dimension: "9x3m", direction: "Leste-Oeste",
    estimatedFlow: 55000, landOwner: "Carlos Silva", landOwnerId: "lo1",
    cost: 2800, price: 9500, status: "available",
    photos: [], description: "Backlight na Afonso Pena, região nobre de BH"
  },
  {
    id: "b7", code: "1007", lat: -23.5475, lng: -46.6361,
    city: "São Paulo", region: "Centro", address: "Av. 23 de Maio, 800",
    type: "outdoor", dimension: "12x4m", direction: "Sul-Norte",
    estimatedFlow: 130000, landOwner: "Maria Santos", landOwnerId: "lo2",
    cost: 6000, price: 22000, status: "available",
    photos: [], description: "Mega outdoor na 23 de Maio, fluxo altíssimo"
  },
  {
    id: "b8", code: "1008", lat: -22.9020, lng: -43.1780,
    city: "Rio de Janeiro", region: "Centro", address: "Av. Presidente Vargas, 500",
    type: "painel", dimension: "6x3m", direction: "Norte-Sul",
    estimatedFlow: 68000, landOwner: "José Oliveira", landOwnerId: "lo3",
    cost: 3200, price: 11000, status: "reserved",
    photos: [], description: "Painel na Presidente Vargas com grande fluxo"
  },
];

// ---- LEADS ----
export const leads: Lead[] = [
  { id: "l1", company: "Tech Solutions", contact: "Pedro Lima", phone: "(11) 99999-1111", email: "pedro@techsol.com", stage: "proposal", value: 36000, billboards: ["b1", "b7"], notes: "Interessado em pacote anual", createdAt: "2025-03-01" },
  { id: "l2", company: "Auto Center XYZ", contact: "Fernanda Reis", phone: "(21) 98888-2222", email: "fernanda@autocenter.com", stage: "lead", value: 18000, billboards: ["b4"], notes: "Primeiro contato via site", createdAt: "2025-03-10" },
  { id: "l3", company: "Banco Prime", contact: "Ricardo Souza", phone: "(11) 97777-3333", email: "ricardo@bancoprime.com", stage: "negotiation", value: 105000, billboards: ["b2", "b5"], notes: "Negociação avançada, 6 meses", createdAt: "2025-02-15" },
  { id: "l4", company: "Fast Food BR", contact: "Juliana Costa", phone: "(31) 96666-4444", email: "juliana@fastfood.com", stage: "qualified", value: 9500, billboards: ["b6"], notes: "Lançamento nova unidade BH", createdAt: "2025-03-12" },
  { id: "l5", company: "Imobiliária Lar", contact: "Marcelo Dias", phone: "(11) 95555-5555", email: "marcelo@lar.com", stage: "closed", value: 44000, billboards: ["b1", "b3"], notes: "Contrato assinado 12 meses", createdAt: "2025-01-20" },
  { id: "l6", company: "Telecom Plus", contact: "Aline Martins", phone: "(21) 94444-6666", email: "aline@telecom.com", stage: "lost", value: 35000, billboards: ["b4", "b8"], notes: "Orçamento acima do budget", createdAt: "2025-02-28" },
  { id: "l7", company: "Farmácia Vida", contact: "Bruno Alves", phone: "(11) 93333-7777", email: "bruno@farmacia.com", stage: "lead", value: 7500, billboards: [], notes: "Lead do Google Ads", createdAt: "2025-03-15" },
];

// ---- CLIENTS ----
export const clients: Client[] = [
  { id: "c1", name: "Pedro Lima", company: "Tech Solutions", phone: "(11) 99999-1111", email: "pedro@techsol.com", type: "advertiser", contracts: ["ct1"], history: ["Contrato iniciado em Jan/2025"] },
  { id: "c2", name: "Fernanda Reis", company: "Auto Center XYZ", phone: "(21) 98888-2222", email: "fernanda@autocenter.com", type: "advertiser", contracts: [], history: ["Lead recente"] },
  { id: "lo1", name: "Carlos Silva", company: "", phone: "(11) 91111-0001", email: "carlos@email.com", type: "landowner", contracts: ["ct-land1"], history: ["Proprietário desde 2020"] },
  { id: "lo2", name: "Maria Santos", company: "", phone: "(11) 91111-0002", email: "maria@email.com", type: "landowner", contracts: ["ct-land2"], history: ["Proprietária desde 2019"] },
];

// ---- CONTRACTS ----
export const contracts: Contract[] = [
  { id: "ct1", clientId: "c1", clientName: "Tech Solutions", billboards: ["b2"], startDate: "2025-01-01", endDate: "2025-12-31", monthlyValue: 15000, status: "active" },
  { id: "ct2", clientId: "c1", clientName: "Banco Prime", billboards: ["b5"], startDate: "2025-03-01", endDate: "2025-08-31", monthlyValue: 35000, status: "active" },
  { id: "ct3", clientId: "c2", clientName: "Imobiliária Lar", billboards: ["b3"], startDate: "2025-02-01", endDate: "2026-01-31", monthlyValue: 7500, status: "active" },
];

// ---- WORK ORDERS ----
export const workOrders: WorkOrder[] = [
  { id: "os1", type: "installation", billboardId: "b2", billboardCode: "1002", assignee: "Equipe Alpha", status: "completed", dueDate: "2025-01-05", slaHours: 48, checklist: [{ item: "Impressão da lona", done: true }, { item: "Instalação", done: true }, { item: "Foto final", done: true }] },
  { id: "os2", type: "swap", billboardId: "b5", billboardCode: "1005", assignee: "Equipe Beta", status: "in_progress", dueDate: "2025-03-20", slaHours: 24, checklist: [{ item: "Retirar lona antiga", done: true }, { item: "Instalar nova", done: false }, { item: "Foto antes/depois", done: false }] },
  { id: "os3", type: "maintenance", billboardId: "b1", billboardCode: "1001", assignee: "Equipe Alpha", status: "pending", dueDate: "2025-03-25", slaHours: 72, checklist: [{ item: "Verificar estrutura", done: false }, { item: "Limpeza", done: false }, { item: "Reparo elétrico", done: false }] },
  { id: "os4", type: "inspection", billboardId: "b4", billboardCode: "1004", assignee: "Equipe Gamma", status: "overdue", dueDate: "2025-03-10", slaHours: 24, checklist: [{ item: "Vistoria geral", done: false }, { item: "Relatório fotográfico", done: false }] },
];

// ---- DASHBOARD STATS ----
export const dashboardStats = {
  totalBillboards: billboards.length,
  occupied: billboards.filter(b => b.status === "occupied").length,
  available: billboards.filter(b => b.status === "available").length,
  reserved: billboards.filter(b => b.status === "reserved").length,
  occupancyRate: Math.round((billboards.filter(b => b.status === "occupied").length / billboards.length) * 100),
  totalRevenue: contracts.filter(c => c.status === "active").reduce((sum, c) => sum + c.monthlyValue, 0),
  totalCost: billboards.filter(b => b.status === "occupied").reduce((sum, b) => sum + b.cost, 0),
  margin: 0,
  mrr: contracts.filter(c => c.status === "active").reduce((sum, c) => sum + c.monthlyValue, 0),
  activeContracts: contracts.filter(c => c.status === "active").length,
  openLeads: leads.filter(l => !["closed", "lost"].includes(l.stage)).length,
  pendingOS: workOrders.filter(o => o.status !== "completed").length,
};
dashboardStats.margin = dashboardStats.totalRevenue - dashboardStats.totalCost;

export const revenueByMonth = [
  { month: "Out", revenue: 42000, cost: 14000 },
  { month: "Nov", revenue: 45000, cost: 14500 },
  { month: "Dez", revenue: 48000, cost: 15000 },
  { month: "Jan", revenue: 50000, cost: 15200 },
  { month: "Fev", revenue: 52000, cost: 15800 },
  { month: "Mar", revenue: 57500, cost: 16200 },
];
