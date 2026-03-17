// BJ7 Mídia — Sistema de Gestão OOH
// Dados baseados na apresentação real da BJ7 Mídia (Litoral do Paraná)

export interface Billboard {
  id: string;
  code: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  route: string;
  address: string;
  type: "painel_rodoviario" | "frontlight" | "backlight" | "painel_sight" | "painel_vip";
  dimension: string;
  area: number;
  direction: string;
  estimatedFlow: number;
  audienceProfile: string;
  seasonality: "alta" | "media" | "baixa";
  trafficType: string;
  landOwner: string;
  landOwnerId: string;
  cost: number;
  price: number;
  productionCost: number;
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
  billboards: string[];
  notes: string;
  origin: "site" | "indicacao" | "trafego_pago" | "prospecção" | "evento";
  createdAt: string;
  interactions: { date: string; note: string }[];
}

export interface Client {
  id: string;
  name: string;
  company: string;
  document: string;
  phone: string;
  email: string;
  type: "advertiser" | "landowner";
  contracts: string[];
  billboards: string[];
  history: string[];
  address: string;
}

export interface Contract {
  id: string;
  type: "veiculacao" | "locacao_terreno";
  clientId: string;
  clientName: string;
  billboards: string[];
  startDate: string;
  endDate: string;
  monthlyValue: number;
  totalValue: number;
  status: "active" | "expired" | "cancelled" | "pending";
  renewalType: "automatic" | "manual";
  paymentMethod: string;
}

export interface WorkOrder {
  id: string;
  type: "installation" | "swap" | "maintenance" | "inspection";
  billboardId: string;
  billboardCode: string;
  clientName: string;
  assignee: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  dueDate: string;
  completedDate?: string;
  slaHours: number;
  checklist: { item: string; done: boolean }[];
  photosBefore: string[];
  photosAfter: string[];
}

// ---- BILLBOARDS (Real BJ7 data) ----
export const billboards: Billboard[] = [
  {
    id: "b1", code: "1001", lat: -26.029892, lng: -48.796558,
    city: "Garuva", region: "Litoral Norte PR", route: "PR-412",
    address: "PR-412 - Trevo de Garuva",
    type: "painel_rodoviario", dimension: "9x3m", area: 27, direction: "Sentido chegada ao litoral",
    estimatedFlow: 45000, audienceProfile: "Turistas e moradores do litoral",
    seasonality: "alta", trafficType: "Turístico / Local",
    landOwner: "Neucir A. Pelizzari", landOwnerId: "lo1",
    cost: 400, price: 4500, productionCost: 1200,
    status: "available", photos: [],
    description: "Ponto estratégico no trevo de Garuva, principal acesso rodoviário ao litoral paranaense. Alta visibilidade para quem chega ao litoral.",
    formats: ["Lona impressa", "Adesivo"]
  },
  {
    id: "b2", code: "1002", lat: -26.029865, lng: -48.796475,
    city: "Garuva", region: "Litoral Norte PR", route: "PR-412",
    address: "PR-412 - Trevo de Garuva",
    type: "painel_rodoviario", dimension: "9x3m", area: 27, direction: "Sentido saída do litoral",
    estimatedFlow: 45000, audienceProfile: "Turistas retornando e logística",
    seasonality: "alta", trafficType: "Turístico / Logística",
    landOwner: "Neucir A. Pelizzari", landOwnerId: "lo1",
    cost: 400, price: 4500, productionCost: 1200,
    status: "occupied", photos: [],
    description: "Ponto conjugado no trevo de Garuva, sentido saída do litoral. Ideal para campanhas de retorno.",
    formats: ["Lona impressa"]
  },
  {
    id: "b3", code: "1003", lat: -25.975945, lng: -48.695601,
    city: "Guaratuba", region: "Litoral PR", route: "PR-412",
    address: "PR-412 - Trecho intermediário rural",
    type: "painel_rodoviario", dimension: "9x3m", area: 27, direction: "Sentido Curitiba",
    estimatedFlow: 38000, audienceProfile: "Fluxo misto rural/turístico",
    seasonality: "media", trafficType: "Local / Turístico",
    landOwner: "Carlos Mendes", landOwnerId: "lo2",
    cost: 350, price: 3800, productionCost: 1200,
    status: "reserved", photos: [],
    description: "Trecho intermediário da PR-412 com excelente visibilidade em zona rural. Baixa poluição visual.",
    formats: ["Lona impressa", "Adesivo"]
  },
  {
    id: "b4", code: "1004", lat: -25.975845, lng: -48.695131,
    city: "Guaratuba", region: "Litoral PR", route: "PR-412",
    address: "PR-412 - Trecho intermediário rural",
    type: "painel_rodoviario", dimension: "12x4m", area: 48, direction: "Sentido litoral",
    estimatedFlow: 38000, audienceProfile: "Turistas chegando ao litoral",
    seasonality: "alta", trafficType: "Turístico",
    landOwner: "Carlos Mendes", landOwnerId: "lo2",
    cost: 500, price: 5500, productionCost: 1800,
    status: "available", photos: [],
    description: "Painel ampliado de grande impacto no trecho intermediário. Formato 12x4m para máxima leitura a distância.",
    formats: ["Lona impressa"]
  },
  {
    id: "b5", code: "1005", lat: -25.948784, lng: -48.605610,
    city: "Guaratuba", region: "Litoral PR", route: "PR-412",
    address: "PR-412 - Chegada de Guaratuba",
    type: "painel_rodoviario", dimension: "9x3m", area: 27, direction: "Sentido litoral",
    estimatedFlow: 52000, audienceProfile: "Turistas / Veranistas",
    seasonality: "alta", trafficType: "Turístico",
    landOwner: "Maria da Silva", landOwnerId: "lo3",
    cost: 450, price: 4800, productionCost: 1200,
    status: "occupied", photos: [],
    description: "Ponto na chegada de Guaratuba, fluxo intenso de veranistas na alta temporada.",
    formats: ["Lona impressa", "Adesivo"]
  },
  {
    id: "b6", code: "1006", lat: -25.948780, lng: -48.605598,
    city: "Guaratuba", region: "Litoral PR", route: "PR-412",
    address: "PR-412 - Região Coroados",
    type: "painel_rodoviario", dimension: "9x3m", area: 27, direction: "Sentido Curitiba",
    estimatedFlow: 52000, audienceProfile: "Retorno do litoral",
    seasonality: "alta", trafficType: "Turístico / Local",
    landOwner: "Maria da Silva", landOwnerId: "lo3",
    cost: 450, price: 4800, productionCost: 1200,
    status: "available", photos: [],
    description: "Ponto conjugado na região Coroados, sentido Curitiba. Excelente para campanhas de retorno.",
    formats: ["Lona impressa"]
  },
  {
    id: "b7", code: "2001", lat: -25.631633, lng: -48.595463,
    city: "Matinhos", region: "Litoral PR", route: "PR-508",
    address: "PR-508 - Alexandra / Matinhos",
    type: "painel_rodoviario", dimension: "9x3m", area: 27, direction: "Sentido saída do litoral",
    estimatedFlow: 42000, audienceProfile: "Turistas e moradores da região",
    seasonality: "alta", trafficType: "Turístico / Residencial",
    landOwner: "José Oliveira", landOwnerId: "lo4",
    cost: 400, price: 4500, productionCost: 1200,
    status: "occupied", photos: [],
    description: "Corredor turístico de acesso às praias do litoral do Paraná. PR-508 Alexandra-Matinhos.",
    formats: ["Lona impressa", "Adesivo"]
  },
  {
    id: "b8", code: "2002", lat: -25.631785, lng: -48.595781,
    city: "Matinhos", region: "Litoral PR", route: "PR-508",
    address: "PR-508 - Curitiba → Matinhos",
    type: "painel_rodoviario", dimension: "12x4m", area: 48, direction: "Sentido saída do litoral",
    estimatedFlow: 42000, audienceProfile: "Curitibanos indo ao litoral",
    seasonality: "alta", trafficType: "Turístico",
    landOwner: "José Oliveira", landOwnerId: "lo4",
    cost: 500, price: 5800, productionCost: 1800,
    status: "available", photos: [],
    description: "Painel ampliado na PR-508, corredor turístico Alexandra-Matinhos. Formato 12x4m de alto impacto.",
    formats: ["Lona impressa"]
  },
  {
    id: "b9", code: "2003", lat: -25.562083, lng: -48.589515,
    city: "Paranaguá", region: "Litoral PR", route: "BR-277",
    address: "BR-277 - Chegada de Paranaguá",
    type: "painel_sight", dimension: "12x4m", area: 48, direction: "Fluxo entrada da cidade",
    estimatedFlow: 65000, audienceProfile: "Logística / Porto / Moradores",
    seasonality: "media", trafficType: "Logística / Comercial",
    landOwner: "Roberto Costa", landOwnerId: "lo5",
    cost: 600, price: 6500, productionCost: 2050,
    status: "available", photos: [],
    description: "Corredor estratégico entre o Porto de Paranaguá e Curitiba. Fluxo logístico intenso.",
    formats: ["Lona impressa", "Adesivo"]
  },
  {
    id: "b10", code: "2004", lat: -25.562050, lng: -48.589362,
    city: "Paranaguá", region: "Litoral PR", route: "BR-277",
    address: "BR-277 - Saída de Paranaguá / Acesso BR-277",
    type: "painel_sight", dimension: "25x4m", area: 100, direction: "Acesso BR-277",
    estimatedFlow: 65000, audienceProfile: "Logística / Porto / Turismo",
    seasonality: "media", trafficType: "Logística / Comercial",
    landOwner: "Roberto Costa", landOwnerId: "lo5",
    cost: 800, price: 9000, productionCost: 3500,
    status: "reserved", photos: [],
    description: "Painel gigante de alto impacto na saída de Paranaguá. 25x4m com máxima visibilidade em rodovia.",
    formats: ["Lona impressa"]
  },
];

// ---- LEADS ----
export const leads: Lead[] = [
  {
    id: "l1", company: "Nativa Empreendimentos", contact: "Gerente Comercial", phone: "(41) 3472-2929",
    email: "contabilidade@nativaempreendimentos.com.br", stage: "closed", value: 54000,
    billboards: ["b7"], notes: "Contrato 12 meses fechado - PR-508 Ponto 2001",
    origin: "prospecção", createdAt: "2026-01-15",
    interactions: [
      { date: "2026-01-15", note: "Primeiro contato" },
      { date: "2026-01-22", note: "Proposta enviada R$4.500/mês" },
      { date: "2026-02-01", note: "Contrato assinado via DocuSign" },
    ]
  },
  {
    id: "l2", company: "IZI Imóveis", contact: "Jonathas Batista", phone: "(41) 98424-2067",
    email: "contato@imoveisizi.com.br", stage: "negotiation", value: 78000,
    billboards: ["b1", "b4", "b9"], notes: "Interesse em 3 pontos - pacote litoral completo",
    origin: "indicacao", createdAt: "2026-02-10",
    interactions: [
      { date: "2026-02-10", note: "Indicação do parceiro Favretto" },
      { date: "2026-02-18", note: "Visita aos pontos realizada" },
      { date: "2026-03-01", note: "Proposta de pacote enviada" },
    ]
  },
  {
    id: "l3", company: "Cresol Cooperativa", contact: "Dept. Marketing", phone: "(41) 3322-5500",
    email: "marketing@cresol.com.br", stage: "proposal", value: 36000,
    billboards: ["b9"], notes: "Interesse no ponto BR-277 Paranaguá - campanha institucional",
    origin: "trafego_pago", createdAt: "2026-02-20",
    interactions: [
      { date: "2026-02-20", note: "Lead via Google Ads" },
      { date: "2026-02-25", note: "Proposta enviada" },
    ]
  },
  {
    id: "l4", company: "Construtora Litoral", contact: "Ana Paula Ferreira", phone: "(41) 99876-5432",
    email: "ana@construtoralitoral.com.br", stage: "qualified", value: 27000,
    billboards: ["b6", "b8"], notes: "Lançamento imobiliário em Guaratuba",
    origin: "site", createdAt: "2026-03-01",
    interactions: [
      { date: "2026-03-01", note: "Cadastro via site público" },
      { date: "2026-03-05", note: "Contato telefônico realizado" },
    ]
  },
  {
    id: "l5", company: "Supermercado Bom Preço", contact: "Roberto Nunes", phone: "(41) 3462-1100",
    email: "roberto@bompreco.com.br", stage: "lead", value: 9000,
    billboards: [], notes: "Lead novo - quer anunciar em Guaratuba",
    origin: "site", createdAt: "2026-03-10",
    interactions: [
      { date: "2026-03-10", note: "Formulário do site preenchido" },
    ]
  },
  {
    id: "l6", company: "Rede de Farmácias PR", contact: "Marcelo Costa", phone: "(41) 3355-7700",
    email: "marcelo@farmaciapr.com.br", stage: "lost", value: 45000,
    billboards: ["b1", "b5"], notes: "Orçamento acima do budget disponível",
    origin: "prospecção", createdAt: "2026-01-20",
    interactions: [
      { date: "2026-01-20", note: "Primeiro contato" },
      { date: "2026-02-05", note: "Proposta enviada" },
      { date: "2026-02-20", note: "Perdido - budget insuficiente" },
    ]
  },
  {
    id: "l7", company: "Auto Center Litoral", contact: "Fernando Lima", phone: "(41) 99555-3333",
    email: "fernando@autocenterlitoral.com.br", stage: "lead", value: 4500,
    billboards: [], notes: "Interesse em ponto único em Matinhos",
    origin: "trafego_pago", createdAt: "2026-03-15",
    interactions: [
      { date: "2026-03-15", note: "Lead Google Ads - primeiro contato" },
    ]
  },
];

// ---- CLIENTS ----
export const clients: Client[] = [
  {
    id: "c1", name: "Nativa Empreendimentos LTDA", company: "Nativa Empreendimentos",
    document: "51.633.820/0001-51", phone: "(41) 3472-2929",
    email: "contabilidade@nativaempreendimentos.com.br", type: "advertiser",
    contracts: ["ct1"], billboards: ["b7"],
    history: ["Contrato assinado 01/2026 - Ponto 2001 PR-508", "Pagamento em dia"],
    address: "Av. Curitiba, 930, Brejatuba, Guaratuba-PR"
  },
  {
    id: "c2", name: "Jonathas Batista", company: "IZI Imóveis LTDA",
    document: "59.964.192/0001-07", phone: "(41) 98424-2067",
    email: "contato@imoveisizi.com.br", type: "advertiser",
    contracts: [], billboards: [],
    history: ["Em negociação - pacote litoral"],
    address: "Rua Dr. João Candido, 600, Sala 03, Centro, Guaratuba-PR"
  },
  {
    id: "lo1", name: "Neucir Antonio Pelizzari", company: "",
    document: "575.097.519-34", phone: "(41) 99999-0001",
    email: "neucir@email.com", type: "landowner",
    contracts: ["ct-land1"], billboards: ["b1", "b2"],
    history: ["Proprietário dos pontos 1001 e 1002 - Trevo de Garuva", "Contrato de locação ativo desde 04/2026"],
    address: "Rua Nestor Victor, 593, 29 de Julho, Paranaguá-PR"
  },
  {
    id: "lo2", name: "Carlos Mendes", company: "",
    document: "123.456.789-00", phone: "(41) 99999-0002",
    email: "carlos.mendes@email.com", type: "landowner",
    contracts: ["ct-land2"], billboards: ["b3", "b4"],
    history: ["Proprietário pontos 1003 e 1004 - Trecho intermediário PR-412"],
    address: "Guaratuba-PR"
  },
  {
    id: "lo3", name: "Maria da Silva", company: "",
    document: "987.654.321-00", phone: "(41) 99999-0003",
    email: "maria.silva@email.com", type: "landowner",
    contracts: ["ct-land3"], billboards: ["b5", "b6"],
    history: ["Proprietária pontos 1005 e 1006 - Guaratuba"],
    address: "Guaratuba-PR"
  },
  {
    id: "lo4", name: "José Oliveira", company: "",
    document: "111.222.333-44", phone: "(41) 99999-0004",
    email: "jose.oliveira@email.com", type: "landowner",
    contracts: ["ct-land4"], billboards: ["b7", "b8"],
    history: ["Proprietário pontos 2001 e 2002 - PR-508 Alexandra/Matinhos"],
    address: "Matinhos-PR"
  },
  {
    id: "lo5", name: "Roberto Costa", company: "",
    document: "555.666.777-88", phone: "(41) 99999-0005",
    email: "roberto.costa@email.com", type: "landowner",
    contracts: ["ct-land5"], billboards: ["b9", "b10"],
    history: ["Proprietário pontos 2003 e 2004 - BR-277 Paranaguá"],
    address: "Paranaguá-PR"
  },
];

// ---- CONTRACTS ----
export const contracts: Contract[] = [
  {
    id: "ct1", type: "veiculacao", clientId: "c1", clientName: "Nativa Empreendimentos",
    billboards: ["b7"], startDate: "2026-04-01", endDate: "2027-03-31",
    monthlyValue: 4500, totalValue: 54000, status: "active",
    renewalType: "manual", paymentMethod: "Boleto bancário"
  },
  {
    id: "ct2", type: "veiculacao", clientId: "c2", clientName: "Cresol Cooperativa",
    billboards: ["b2", "b5"], startDate: "2026-01-01", endDate: "2026-12-31",
    monthlyValue: 9300, totalValue: 111600, status: "active",
    renewalType: "manual", paymentMethod: "Boleto bancário"
  },
  {
    id: "ct-land1", type: "locacao_terreno", clientId: "lo1", clientName: "Neucir A. Pelizzari",
    billboards: ["b1", "b2"], startDate: "2026-04-01", endDate: "2027-03-31",
    monthlyValue: 800, totalValue: 9600, status: "active",
    renewalType: "automatic", paymentMethod: "PIX - CPF 575.097.519-34"
  },
  {
    id: "ct-land2", type: "locacao_terreno", clientId: "lo2", clientName: "Carlos Mendes",
    billboards: ["b3", "b4"], startDate: "2026-04-01", endDate: "2027-03-31",
    monthlyValue: 850, totalValue: 10200, status: "active",
    renewalType: "automatic", paymentMethod: "PIX"
  },
  {
    id: "ct-land3", type: "locacao_terreno", clientId: "lo3", clientName: "Maria da Silva",
    billboards: ["b5", "b6"], startDate: "2026-03-01", endDate: "2027-02-28",
    monthlyValue: 900, totalValue: 10800, status: "active",
    renewalType: "automatic", paymentMethod: "PIX"
  },
];

// ---- WORK ORDERS ----
export const workOrders: WorkOrder[] = [
  {
    id: "os1", type: "installation", billboardId: "b7", billboardCode: "2001",
    clientName: "Nativa Empreendimentos", assignee: "Equipe Alpha",
    status: "completed", dueDate: "2026-04-05", completedDate: "2026-04-04", slaHours: 48,
    checklist: [
      { item: "Impressão da lona", done: true },
      { item: "Transporte ao local", done: true },
      { item: "Instalação no painel", done: true },
      { item: "Foto antes", done: true },
      { item: "Foto depois", done: true },
      { item: "Relatório ao cliente", done: true },
    ],
    photosBefore: [], photosAfter: []
  },
  {
    id: "os2", type: "swap", billboardId: "b2", billboardCode: "1002",
    clientName: "Cresol Cooperativa", assignee: "Equipe Beta",
    status: "in_progress", dueDate: "2026-03-20", slaHours: 24,
    checklist: [
      { item: "Retirar lona antiga", done: true },
      { item: "Instalar lona nova", done: false },
      { item: "Foto antes", done: true },
      { item: "Foto depois", done: false },
    ],
    photosBefore: [], photosAfter: []
  },
  {
    id: "os3", type: "maintenance", billboardId: "b5", billboardCode: "1005",
    clientName: "Cresol Cooperativa", assignee: "Equipe Alpha",
    status: "pending", dueDate: "2026-03-25", slaHours: 72,
    checklist: [
      { item: "Verificar estrutura metálica", done: false },
      { item: "Limpeza do painel", done: false },
      { item: "Verificar iluminação", done: false },
      { item: "Reparo elétrico se necessário", done: false },
    ],
    photosBefore: [], photosAfter: []
  },
  {
    id: "os4", type: "inspection", billboardId: "b9", billboardCode: "2003",
    clientName: "", assignee: "Equipe Gamma",
    status: "overdue", dueDate: "2026-03-10", slaHours: 24,
    checklist: [
      { item: "Vistoria geral da estrutura", done: false },
      { item: "Relatório fotográfico", done: false },
      { item: "Verificar condições da lona", done: false },
    ],
    photosBefore: [], photosAfter: []
  },
  {
    id: "os5", type: "installation", billboardId: "b4", billboardCode: "1004",
    clientName: "", assignee: "Equipe Alpha",
    status: "pending", dueDate: "2026-04-01", slaHours: 48,
    checklist: [
      { item: "Aguardar aprovação de arte", done: false },
      { item: "Impressão da lona 12x4m", done: false },
      { item: "Transporte ao local", done: false },
      { item: "Instalação", done: false },
      { item: "Foto final", done: false },
    ],
    photosBefore: [], photosAfter: []
  },
];

// ---- COMPUTED STATS ----
export const dashboardStats = {
  totalBillboards: billboards.length,
  occupied: billboards.filter(b => b.status === "occupied").length,
  available: billboards.filter(b => b.status === "available").length,
  reserved: billboards.filter(b => b.status === "reserved").length,
  occupancyRate: Math.round((billboards.filter(b => b.status === "occupied").length / billboards.length) * 100),
  totalRevenue: contracts.filter(c => c.status === "active" && c.type === "veiculacao").reduce((sum, c) => sum + c.monthlyValue, 0),
  totalCost: contracts.filter(c => c.status === "active" && c.type === "locacao_terreno").reduce((sum, c) => sum + c.monthlyValue, 0),
  margin: 0,
  mrr: contracts.filter(c => c.status === "active" && c.type === "veiculacao").reduce((sum, c) => sum + c.monthlyValue, 0),
  activeContracts: contracts.filter(c => c.status === "active").length,
  activeVeiculacao: contracts.filter(c => c.status === "active" && c.type === "veiculacao").length,
  activeLocacao: contracts.filter(c => c.status === "active" && c.type === "locacao_terreno").length,
  openLeads: leads.filter(l => !["closed", "lost"].includes(l.stage)).length,
  pendingOS: workOrders.filter(o => o.status !== "completed").length,
  overdueOS: workOrders.filter(o => o.status === "overdue").length,
  pipelineValue: leads.filter(l => !["closed", "lost"].includes(l.stage)).reduce((sum, l) => sum + l.value, 0),
  conversionRate: Math.round((leads.filter(l => l.stage === "closed").length / leads.length) * 100),
  avgTicket: 0,
};
dashboardStats.margin = dashboardStats.totalRevenue - dashboardStats.totalCost;
dashboardStats.avgTicket = dashboardStats.activeVeiculacao > 0
  ? Math.round(dashboardStats.totalRevenue / dashboardStats.activeVeiculacao)
  : 0;

export const revenueByMonth = [
  { month: "Out", revenue: 9300, cost: 2550 },
  { month: "Nov", revenue: 9300, cost: 2550 },
  { month: "Dez", revenue: 13800, cost: 2550 },
  { month: "Jan", revenue: 13800, cost: 2550 },
  { month: "Fev", revenue: 13800, cost: 2550 },
  { month: "Mar", revenue: 13800, cost: 2550 },
];

export const occupancyByRegion = [
  { region: "Garuva (PR-412)", total: 2, occupied: 1, rate: 50 },
  { region: "Guaratuba (PR-412)", total: 4, occupied: 1, rate: 25 },
  { region: "Matinhos (PR-508)", total: 2, occupied: 1, rate: 50 },
  { region: "Paranaguá (BR-277)", total: 2, occupied: 0, rate: 0 },
];
