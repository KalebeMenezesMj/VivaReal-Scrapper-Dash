export interface Property {
  id: string
  job_id: string
  tipo: string | null
  valor: string | null
  area_privativa: string | null
  dormitorio: string | null
  banheiro: string | null
  vaga: string | null
  suite: string | null
  uf: string | null
  data: string | null
  nome_fonte: string | null
  nome_telefone: string | null
  area_terreno: string | null
  valor_unitario: string | null
  andar: string | null
  piscina: boolean | null
  varanda: boolean | null
  elevador: boolean | null
  rua: string | null
  bairro: string | null
  cidade: string | null
  endereco_completo: string
  link: string
  // Campos adicionados para compatibilidade com dados antigos
  idade_aparente?: string | null
  estado_conservacao?: string | null
  padrao_acabamento?: string | null
  dataSource?: 'new' | 'old'
}

export interface PropertyOld {
  id: number
  tipo?: string | null
  valor?: number | null
  area_privativa?: number | null
  dormitorio?: number | null
  banheiro?: number | null
  vaga?: number | null
  suite?: number | null
  uf?: string | null
  data?: string | null
  nome_fonte?: string | null
  nome_telefone?: string | null
  area_terreno?: number | null
  valor_unitario?: number | null
  piscina?: boolean | null
  varanda?: boolean | null
  elevador?: boolean | null
  bairro?: string | null
  cidade?: string | null
  endereco?: string | null
  link?: string | null
  idade_aparente?: string | null
  estado_conservacao?: string | null
  padrao_acabamento?: string | null
}


export interface ScrapingJob {
  id: string
  created_at: string
  url: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  total_properties: number | null
  error_message: string | null
  finished_at: string | null
}

export interface FilterOptions {
  search?: string
  estado?: string
  cidade?: string
  bairro?: string
  tipo?: string
  quartosMin?: number
  quartosMax?: number
  banheirosMin?: number
  vagasMin?: number
  suitesMin?: number
  piscina?: boolean
  varanda?: boolean
  elevador?: boolean
  includeOldData?: boolean
}

export interface PropertyStats {
  totalProperties: number
  totalCidades: number
  totalBairros: number
  avgQuartos: number
  propertiesWithPiscina: number
  propertiesWithElevador: number
}
