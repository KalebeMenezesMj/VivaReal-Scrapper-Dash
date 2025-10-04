# 🔍 Sistema de Filtros - Engenharia Reversa

## Visão Geral
O sistema de filtros do Dashboard Imobiliário utiliza uma arquitetura reativa baseada em React hooks e Supabase para permitir pesquisas dinâmicas e em tempo real nos dados imobiliários.

## 🏗️ Arquitetura do Sistema

### 1. Fluxo de Dados
```
[Interface de Filtros] → [Estado React] → [Debounce] → [Query Supabase] → [Resultados]
```

### 2. Componentes Principais

#### **App.tsx** - Orquestrador Principal
```typescript
// Estado central dos filtros
const [filters, setFilters] = useState<FilterOptions>({})

// Função debounced para evitar muitas consultas
const debouncedFetchProperties = useCallback(
  debounce((currentFilters: FilterOptions, page: number) => {
    fetchProperties(currentFilters, page)
  }, 300), // Aguarda 300ms após última mudança
  [fetchProperties]
)
```

**Como funciona:**
- Mantém o estado global dos filtros
- Implementa debounce de 300ms para otimizar performance
- Reseta para página 1 quando filtros mudam
- Coordena a busca de dados e estatísticas

#### **PropertyFilters.tsx** - Interface de Filtros
```typescript
// Filtros disponíveis carregados do banco
const [filterOptions, setFilterOptions] = useState<{
  tipos: string[]
  bairrosPorCidade: { [key: string]: string[] }
  cidades: string[]
  ufs: string[]
}>()

// Função para atualizar filtros
const handleFilterChange = (key: keyof FilterOptions, value: any) => {
  const newFilters = { ...filters, [key]: value || undefined }
  
  // Lógica de dependência: limpa bairro quando cidade muda
  if (key === 'cidade') {
    newFilters.bairro = undefined
  }
  
  onFiltersChange(newFilters)
}
```

**Recursos implementados:**
- **Filtros Dependentes**: Bairros filtrados por cidade selecionada
- **Busca Textual**: Pesquisa em endereço, bairro e cidade
- **Filtros de Intervalo**: Área e valor com min/max
- **Filtros Categóricos**: Tipo, localização, dormitórios
- **Interface Expansível**: Pode ser colapsada para economizar espaço

### 3. Tipos de Filtros Implementados

#### **Filtro de Busca Textual**
```typescript
if (filters.search) {
  query = query.or(`endereco.ilike.%${filters.search}%,bairro.ilike.%${filters.search}%,cidade.ilike.%${filters.search}%`)
}
```
- Busca simultânea em múltiplos campos
- Case-insensitive usando `ilike`
- Operador `OR` para buscar em qualquer campo

#### **Filtros de Localização Hierárquicos**
```typescript
// Estado → Cidade → Bairro (em cascata)
if (filters.uf) query = query.eq('uf', filters.uf)
if (filters.cidade) query = query.ilike('cidade', `%${filters.cidade}%`)
if (filters.bairro) query = query.ilike('bairro', `%${filters.bairro}%`)
```

#### **Filtros de Intervalo Numérico**
```typescript
if (filters.areaMin) query = query.gte('area_privativa', filters.areaMin)
if (filters.areaMax) query = query.lte('area_privativa', filters.areaMax)
if (filters.valorMin) query = query.gte('valor', filters.valorMin)
if (filters.valorMax) query = query.lte('valor', filters.valorMax)
```

#### **Filtros Categóricos**
```typescript
if (filters.tipo) query = query.ilike('tipo', `%${filters.tipo}%`)
if (filters.dormitorios) query = query.eq('dormitorio', filters.dormitorios)
```

## 🔄 Processo de Filtragem Passo a Passo

### 1. **Inicialização**
```typescript
useEffect(() => {
  getFilterOptions().then(setFilterOptions).catch(console.error)
}, [])
```
- Carrega opções disponíveis do banco (tipos, cidades, bairros, estados)
- Organiza bairros por cidade para filtros dependentes

### 2. **Mudança de Filtro**
```typescript
// Usuário altera um filtro
handleFilterChange('cidade', 'São Paulo')
↓
// Estado é atualizado
setFilters({ ...filters, cidade: 'São Paulo', bairro: undefined })
↓
// useEffect detecta mudança
useEffect(() => {
  setCurrentPage(1) // Reset página
  debouncedFetchProperties(filters, 1) // Busca com delay
}, [filters])
```

### 3. **Construção da Query**
```typescript
let query = supabase.from('properties_old').select('*', { count: 'exact' })

// Aplica cada filtro condicionalmente
Object.entries(filters).forEach(([key, value]) => {
  if (value) {
    query = applyFilter(query, key, value)
  }
})

// Adiciona paginação e ordenação
query = query.range(from, to).order('id', { ascending: false })
```

### 4. **Execução e Resultado**
```typescript
const { data, error, count } = await query
// data: registros da página atual
// count: total de registros que atendem aos filtros
```

## 🎯 Otimizações Implementadas

### 1. **Debounce**
```typescript
const debounce = useCallback((func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}, [])
```
**Benefício**: Evita consultas excessivas durante digitação rápida

### 2. **Paginação Inteligente**
```typescript
// Reset para página 1 quando filtros mudam
useEffect(() => {
  setCurrentPage(1)
  debouncedFetchProperties(filters, 1)
}, [filters])

// Busca nova página sem delay
useEffect(() => {
  if (currentPage !== 1) {
    fetchProperties(filters, currentPage)
  }
}, [currentPage])
```

### 3. **Filtros Dependentes**
```typescript
// Bairros disponíveis baseados na cidade selecionada
const availableBairros = filters.cidade ? 
  filterOptions.bairrosPorCidade[filters.cidade] || [] : []
```

### 4. **Índices de Banco Otimizados**
```sql
CREATE INDEX IF NOT EXISTS idx_tb_amostras_tipo ON properties_old(tipo);
CREATE INDEX IF NOT EXISTS idx_tb_amostras_bairro ON properties_old(bairro);
CREATE INDEX IF NOT EXISTS idx_tb_amostras_cidade ON properties_old(cidade);
CREATE INDEX IF NOT EXISTS idx_tb_amostras_uf ON properties_old(uf);
CREATE INDEX IF NOT EXISTS idx_tb_amostras_valor ON properties_old(valor);
CREATE INDEX IF NOT EXISTS idx_tb_amostras_area_privativa ON properties_old(area_privativa);
```

## 📊 Estatísticas em Tempo Real

### Cálculo Dinâmico
```typescript
export async function getStats() {
  const { data, error, count } = await supabase
    .from('properties_old')
    .select('valor, area_privativa', { count: 'exact' })
    .not('valor', 'is', null)
    .not('area_privativa', 'is', null)

  // Calcula médias, min, max em JavaScript
  const valores = data.map(item => item.valor).filter(Boolean)
  const areas = data.map(item => item.area_privativa).filter(Boolean)

  return {
    totalProperties: count || 0,
    avgValue: valores.reduce((a, b) => a + b, 0) / valores.length,
    minValue: Math.min(...valores),
    maxValue: Math.max(...valores),
    // ... mais estatísticas
  }
}
```

## 🔧 Estrutura de Dados

### FilterOptions Interface
```typescript
export type FilterOptions = {
  tipo?: string           // Filtro exato por tipo
  bairro?: string        // Filtro parcial por bairro
  cidade?: string        // Filtro parcial por cidade
  uf?: string           // Filtro exato por estado
  areaMin?: number      // Área mínima
  areaMax?: number      // Área máxima
  valorMin?: number     // Valor mínimo
  valorMax?: number     // Valor máximo
  dormitorios?: number  // Número exato de dormitórios
  search?: string       // Busca textual livre
}
```

### Mapeamento de Operadores Supabase
```typescript
const filterOperators = {
  eq: 'igual a',           // .eq()
  ilike: 'contém (case-insensitive)', // .ilike()
  gte: 'maior ou igual',   // .gte()
  lte: 'menor ou igual',   // .lte()
  or: 'ou lógico',        // .or()
  not: 'não é',           // .not()
}
```

## 🚀 Performance e Escalabilidade

### Métricas Atuais
- **6.000+ registros** processados
- **300ms debounce** para otimização
- **20 registros por página** para carregamento rápido
- **Índices otimizados** para consultas complexas

### Limitações e Melhorias Futuras
1. **Filtros Avançados**: Implementar filtros por múltiplos valores
2. **Cache**: Adicionar cache para consultas frequentes
3. **Filtros Salvos**: Permitir salvar combinações de filtros
4. **Busca Fuzzy**: Implementar busca com tolerância a erros
5. **Filtros Geográficos**: Adicionar filtros por proximidade/raio

## 🎨 Interface e UX

### Estados Visuais
- **Loading**: Skeleton loading durante consultas
- **Empty State**: Mensagem quando não há resultados
- **Error State**: Tratamento de erros de conexão
- **Active Filters**: Badge mostrando filtros ativos

### Responsividade
- **Mobile**: Filtros colapsáveis em telas pequenas
- **Desktop**: Layout em grid para múltiplos filtros
- **Tablet**: Adaptação automática do layout

Este sistema de filtros oferece uma experiência de pesquisa robusta e performática, permitindo aos usuários encontrar exatamente os imóveis que procuram entre milhares de registros.
