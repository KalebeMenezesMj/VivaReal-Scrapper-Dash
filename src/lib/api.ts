import { supabase } from './supabase'
import type { Property, ScrapingJob, FilterOptions, PropertyStats, PropertyOld } from '../types/database.types'

const ITEMS_PER_PAGE = 40

// Helper to map old property structure to the new one
function mapOldToNew(old: PropertyOld): Property {
  return {
    id: `old-${old.id}`, // Create a unique string ID
    job_id: '', // Not applicable for old data
    tipo: old.tipo || null,
    valor: old.valor?.toString() ?? null,
    area_privativa: old.area_privativa?.toString() ?? null,
    dormitorio: old.dormitorio?.toString() ?? null,
    banheiro: old.banheiro?.toString() ?? null,
    vaga: old.vaga?.toString() ?? null,
    suite: old.suite?.toString() ?? null,
    uf: old.uf || null,
    data: old.data || '1970-01-01T00:00:00.000Z', // Use a default old date for sorting if null
    nome_fonte: old.nome_fonte || null,
    nome_telefone: old.nome_telefone || null,
    area_terreno: old.area_terreno?.toString() ?? null,
    valor_unitario: old.valor_unitario?.toString() ?? null,
    andar: null, // Not available in old data
    piscina: old.piscina ?? false,
    varanda: old.varanda ?? false,
    elevador: old.elevador ?? false,
    rua: null, // Not available in old data
    bairro: old.bairro || null,
    cidade: old.cidade || null,
    endereco_completo: old.endereco || 'Endereço não disponível',
    link: old.link || '',
    idade_aparente: old.idade_aparente || null,
    estado_conservacao: old.estado_conservacao || null,
    padrao_acabamento: old.padrao_acabamento || null,
  };
}

// Helper for safe parsing of string or number values to numbers
const safeParseFloat = (val: string | number | null | undefined): number | null => {
  if (val === null || val === undefined) {
    return null;
  }
  // If it's already a number, just return it (checking for NaN).
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  // If it's a string, clean and parse it.
  if (typeof val === 'string') {
    const cleanedVal = val.replace(/[^0-9.-]+/g, "");
    if (cleanedVal === '') return null;
    const num = parseFloat(cleanedVal);
    return isNaN(num) ? null : num;
  }
  // Return null for any other type
  return null;
};

export async function fetchProperties(filters: FilterOptions, page: number = 1) {
  // Base query builder for both tables (without pagination)
  const buildQuery = (table: 'properties' | 'properties_old') => {
    let query = supabase.from(table).select('*')

    // String, boolean, and date filters that work correctly at the DB level
    if (filters.search) {
      const searchColumn = table === 'properties' ? 'endereco_completo' : 'endereco'
      query = query.or(`${searchColumn}.ilike.%${filters.search}%,bairro.ilike.%${filters.search}%,cidade.ilike.%${filters.search}%`)
    }
    if (filters.estado) query = query.eq('uf', filters.estado)
    if (filters.cidade) query = query.ilike('cidade', `%${filters.cidade}%`)
    
    if (filters.bairro && filters.bairro.length > 0) {
      query = query.in('bairro', filters.bairro)
    }

    if (filters.tipo) query = query.eq('tipo', filters.tipo)
    if (filters.piscina) query = query.eq('piscina', true)
    if (filters.varanda) query = query.eq('varanda', true)
    if (filters.elevador) query = query.eq('elevador', true)
    if (filters.dataMin) query = query.gte('data', filters.dataMin)
    if (filters.dataMax) query = query.lte('data', filters.dataMax)

    // Numeric filters (like valor, area, quartos) are removed from here
    // and will be applied on the client-side after fetching.

    return query
  }

  // Conditionally build the list of queries to execute
  const queriesToRun = [buildQuery('properties')];
  if (filters.includeOldData !== false) { // Default to true if undefined
    queriesToRun.push(buildQuery('properties_old'));
  }

  // Fetch ALL matching data from the tables based on non-numeric filters
  const results = await Promise.all(queriesToRun.map(q => q.order('data', { ascending: false })));

  // Process results from 'properties' table
  const { data: newProperties, error: newError } = results[0];
  if (newError) throw newError;

  // Process results from 'properties_old' table if it was queried
  let oldProperties: PropertyOld[] = [];
  if (results.length > 1) {
    const { data, error: oldError } = results[1];
    if (oldError) throw oldError;
    oldProperties = data as PropertyOld[] || [];
  }

  // Map and add data source identifier
  const mappedNew: Property[] = (newProperties || []).map(p => ({ ...p, dataSource: 'new' }))
  const mappedOld: Property[] = (oldProperties || []).map(p => ({ ...mapOldToNew(p), dataSource: 'old' }))

  // Combine all data
  const combinedData = [...mappedNew, ...mappedOld]

  // Apply numeric filters on the client-side for correct comparison
  const filteredData = combinedData.filter(p => {
    if (filters.valorMin !== undefined) {
        const valor = safeParseFloat(p.valor);
        if (valor === null || valor < filters.valorMin) return false;
    }
    if (filters.valorMax !== undefined) {
        const valor = safeParseFloat(p.valor);
        if (valor === null || valor > filters.valorMax) return false;
    }
    if (filters.areaMin !== undefined) {
        const area = safeParseFloat(p.area_privativa);
        if (area === null || area < filters.areaMin) return false;
    }
    if (filters.areaMax !== undefined) {
        const area = safeParseFloat(p.area_privativa);
        if (area === null || area > filters.areaMax) return false;
    }
    if (filters.quartosMin !== undefined) {
        const quartos = safeParseFloat(p.dormitorio);
        if (quartos === null || quartos < filters.quartosMin) return false;
    }
    if (filters.banheirosMin !== undefined) {
        const banheiros = safeParseFloat(p.banheiro);
        if (banheiros === null || banheiros < filters.banheirosMin) return false;
    }
    if (filters.vagasMin !== undefined) {
        const vagas = safeParseFloat(p.vaga);
        if (vagas === null || vagas < filters.vagasMin) return false;
    }
    if (filters.suitesMin !== undefined) {
        const suites = safeParseFloat(p.suite);
        if (suites === null || suites < filters.suitesMin) return false;
    }
    return true;
  });
  
  // Sort the entire filtered dataset by date
  filteredData.sort((a, b) => new Date(b.data!).getTime() - new Date(a.data!).getTime())

  // Now, perform pagination on the client
  const totalCount = filteredData.length
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE
  
  const paginatedProperties = filteredData.slice(from, to)

  return {
    properties: paginatedProperties,
    totalCount,
    totalPages,
  }
}

export async function fetchPropertiesByIds(ids: Set<string>): Promise<Property[]> {
  const oldIds: number[] = [];
  const newIds: string[] = [];

  ids.forEach(id => {
    if (id.startsWith('old-')) {
      oldIds.push(parseInt(id.replace('old-', ''), 10));
    } else {
      newIds.push(id);
    }
  });

  const queries = [];
  if (newIds.length > 0) {
    queries.push(supabase.from('properties').select('*').in('id', newIds));
  }
  if (oldIds.length > 0) {
    queries.push(supabase.from('properties_old').select('*').in('id', oldIds));
  }

  const results = await Promise.all(queries);

  let combined: Property[] = [];

  results.forEach(res => {
    if (res.error) throw res.error;
    if (res.data) {
      // Check if the first item has a string 'id' to differentiate
      const isNewProperty = res.data.length > 0 && typeof res.data[0].id === 'string';
      if (isNewProperty) {
        combined = [...combined, ...res.data];
      } else {
        combined = [...combined, ...(res.data as PropertyOld[]).map(mapOldToNew)];
      }
    }
  });

  return combined;
}


export async function fetchScrapingJobs() {
  const { data, error } = await supabase
    .from('scraping_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error

  return data as ScrapingJob[]
}

export async function getFilterOptions() {
  const [
    { data: propertiesData, error: propertiesError },
    { data: oldPropertiesData, error: oldPropertiesError }
  ] = await Promise.all([
    supabase.from('properties').select('cidade, bairro, uf, tipo'),
    supabase.from('properties_old').select('cidade, bairro, uf, tipo')
  ])

  if (propertiesError) throw propertiesError
  if (oldPropertiesError) throw oldPropertiesError

  const combinedData = [...(propertiesData || []), ...(oldPropertiesData || [])]

  const cidades = [...new Set(combinedData.map(p => p.cidade).filter(Boolean))]
  const bairros = [...new Set(combinedData.map(p => p.bairro).filter(Boolean))]
  const estados = [...new Set(combinedData.map(p => p.uf).filter(Boolean))]
  const tipos = [...new Set(combinedData.map(p => p.tipo).filter(Boolean))]

  const bairrosPorCidade: { [key: string]: string[] } = {}
  combinedData.forEach(p => {
    if (p.cidade && p.bairro) {
      if (!bairrosPorCidade[p.cidade]) bairrosPorCidade[p.cidade] = []
      if (!bairrosPorCidade[p.cidade].includes(p.bairro)) {
        bairrosPorCidade[p.cidade].push(p.bairro)
      }
    }
  })

  return {
    cidades: cidades.sort(),
    bairros: bairros.sort(),
    estados: estados.sort(),
    tipos: tipos.sort(),
    bairrosPorCidade
  }
}

export async function getStats(): Promise<PropertyStats> {
  const { data, error, count } = await supabase
    .from('properties')
    .select('dormitorio, cidade, bairro, piscina, elevador', { count: 'exact' })

  if (error) throw error

  const quartos = data.map(p => parseInt(p.dormitorio || '0') || 0).filter(q => q > 0)
  const avgQuartos = quartos.length > 0
    ? quartos.reduce((a, b) => a + b, 0) / quartos.length
    : 0

  const cidades = new Set(data.map(p => p.cidade).filter(Boolean))
  const bairros = new Set(data.map(p => p.bairro).filter(Boolean))
  
  const propertiesWithPiscina = data.filter(p => p.piscina === true).length
  const propertiesWithElevador = data.filter(p => p.elevador === true).length

  return {
    totalProperties: count || 0,
    totalCidades: cidades.size,
    totalBairros: bairros.size,
    avgQuartos: Math.round(avgQuartos * 10) / 10,
    propertiesWithPiscina,
    propertiesWithElevador
  }
}
