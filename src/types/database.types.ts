export interface Property {
  id: string;
  job_id: string;
  tipo: string | null;
  valor: string | null;
  area_privativa: string | null;
  dormitorio: string | null;
  banheiro: string | null;
  vaga: string | null;
  suite: string | null;
  uf: string | null;
  data: string | null;
  nome_fonte: string | null;
  nome_telefone: string | null;
  area_terreno: string | null;
  valor_unitario: string | null;
  andar: string | null;
  piscina: boolean;
  varanda: boolean;
  elevador: boolean;
  rua: string | null;
  bairro: string | null;
  cidade: string | null;
  endereco_completo: string;
  link: string;
  idade_aparente: string | null;
  estado_conservacao: string | null;
  padrao_acabamento: string | null;
  dataSource?: 'new' | 'old';
}

export interface PropertyOld {
  id: number;
  tipo?: string;
  valor?: number;
  area_privativa?: number;
  dormitorio?: number;
  banheiro?: number;
  vaga?: number;
  suite?: number;
  uf?: string;
  data?: string;
  nome_fonte?: string;
  nome_telefone?: string;
  area_terreno?: number;
  valor_unitario?: number;
  piscina?: boolean;
  varanda?: boolean;
  elevador?: boolean;
  bairro?: string;
  cidade?: string;
  endereco?: string;
  link?: string;
  idade_aparente?: string;
  estado_conservacao?: string;
  padrao_acabamento?: string;
}


export interface ScrapingJob {
  id: string;
  created_at: string;
  status: 'running' | 'completed' | 'failed';
  total_properties_found: number | null;
  error_message: string | null;
}

export interface FilterOptions {
  search?: string;
  estado?: string;
  cidade?: string;
  bairro?: string[]; // Alterado para aceitar múltiplos bairros
  tipo?: string;
  quartosMin?: number;
  banheirosMin?: number;
  vagasMin?: number;
  suitesMin?: number;
  valorMin?: number;
  valorMax?: number;
  areaMin?: number;
  areaMax?: number;
  dataMin?: string;
  dataMax?: string;
  piscina?: boolean;
  varanda?: boolean;
  elevador?: boolean;
  includeOldData?: boolean;
}

export interface PropertyStats {
  totalProperties: number;
  totalCidades: number;
  totalBairros: number;
  avgQuartos: number;
  propertiesWithPiscina: number;
  propertiesWithElevador: number;
}
