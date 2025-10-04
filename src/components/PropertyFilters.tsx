import { useState, useEffect } from 'react'
import type { FilterOptions } from '../types/database.types'
import { getFilterOptions } from '../lib/api'
import { useFilterStore } from '../store/useFilterStore'

// O componente não precisa mais receber props de filtros, pois ele se conecta
// diretamente ao store Zustand, tornando-o mais independente e reutilizável.
export function PropertyFilters() {
  const { filters, setFilters, resetFilters } = useFilterStore()
  const [isExpanded, setIsExpanded] = useState(true)
  const [filterOptions, setFilterOptions] = useState<{
    cidades: string[]
    bairros: string[]
    estados: string[]
    tipos: string[]
    bairrosPorCidade: { [key: string]: string[] }
  }>({
    cidades: [],
    bairros: [],
    estados: [],
    tipos: [],
    bairrosPorCidade: {}
  })

  useEffect(() => {
    getFilterOptions()
      .then(setFilterOptions)
      .catch(console.error)
  }, [])

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }

    if (key === 'cidade') {
      newFilters.bairro = undefined
    }
    
    if ((key === 'piscina' || key === 'varanda' || key === 'elevador') && value === false) {
      newFilters[key] = undefined;
    }

    // A ação de `setFilters` do store é chamada para atualizar o estado global.
    setFilters(newFilters)
  }

  const availableBairros = filters.cidade
    ? filterOptions.bairrosPorCidade[filters.cidade] || []
    : filterOptions.bairros

  const activeFiltersCount = Object.entries(filters).filter(([key, v]) => {
    if (key === 'includeOldData') return v === false;
    return v !== undefined && v !== '' && (typeof v !== 'boolean' || v === true)
  }).length

  return (
    <div style={styles.container}>
      <div style={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <h2 style={styles.title}>
          Filtros de Pesquisa {activeFiltersCount > 0 && <span style={styles.badge}>{activeFiltersCount}</span>}
        </h2>
        <span style={{...styles.toggleIcon, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
      </div>

      <div style={{...styles.collapsible, maxHeight: isExpanded ? '1000px' : '0px'}}>
        <div style={styles.filtersContent}>
          <div style={styles.searchGroup}>
            <label style={styles.label}>Busca por Termo</label>
            <input
              type="text"
              placeholder="Endereço, bairro ou cidade..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
              style={styles.input}
            />
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Localização</h3>
            <div style={styles.grid}>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Estado (UF)</label>
                <select value={filters.estado || ''} onChange={(e) => handleFilterChange('estado', e.target.value || undefined)} style={styles.select}>
                  <option value="">Todos</option>
                  {filterOptions.estados.map(estado => <option key={estado} value={estado}>{estado}</option>)}
                </select>
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Cidade</label>
                <select value={filters.cidade || ''} onChange={(e) => handleFilterChange('cidade', e.target.value || undefined)} style={styles.select}>
                  <option value="">Todas</option>
                  {filterOptions.cidades.map(cidade => <option key={cidade} value={cidade}>{cidade}</option>)}
                </select>
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Bairro</label>
                <select value={filters.bairro || ''} onChange={(e) => handleFilterChange('bairro', e.target.value || undefined)} style={styles.select} disabled={!filters.cidade}>
                  <option value="">Todos</option>
                  {availableBairros.map(bairro => <option key={bairro} value={bairro}>{bairro}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Características do Imóvel</h3>
            <div style={styles.grid}>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Tipo de Imóvel</label>
                <select value={filters.tipo || ''} onChange={(e) => handleFilterChange('tipo', e.target.value || undefined)} style={styles.select}>
                  <option value="">Todos</option>
                  {filterOptions.tipos.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Dormitórios Mín.</label>
                <input type="number" min="0" placeholder="Ex: 2" value={filters.quartosMin || ''} onChange={(e) => handleFilterChange('quartosMin', e.target.value ? parseInt(e.target.value) : undefined)} style={styles.input} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Banheiros Mín.</label>
                <input type="number" min="0" placeholder="Ex: 1" value={filters.banheirosMin || ''} onChange={(e) => handleFilterChange('banheirosMin', e.target.value ? parseInt(e.target.value) : undefined)} style={styles.input} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Vagas Mín.</label>
                <input type="number" min="0" placeholder="Ex: 1" value={filters.vagasMin || ''} onChange={(e) => handleFilterChange('vagasMin', e.target.value ? parseInt(e.target.value) : undefined)} style={styles.input} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Suítes Mín.</label>
                <input type="number" min="0" placeholder="Ex: 1" value={filters.suitesMin || ''} onChange={(e) => handleFilterChange('suitesMin', e.target.value ? parseInt(e.target.value) : undefined)} style={styles.input} />
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Valor e Data</h3>
            <div style={styles.grid}>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Valor Mínimo (R$)</label>
                <input type="number" min="0" placeholder="Ex: 300000" value={filters.valorMin || ''} onChange={(e) => handleFilterChange('valorMin', e.target.value ? parseInt(e.target.value) : undefined)} style={styles.input} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Valor Máximo (R$)</label>
                <input type="number" min="0" placeholder="Ex: 800000" value={filters.valorMax || ''} onChange={(e) => handleFilterChange('valorMax', e.target.value ? parseInt(e.target.value) : undefined)} style={styles.input} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Data Mínima</label>
                <input type="date" value={filters.dataMin || ''} onChange={(e) => handleFilterChange('dataMin', e.target.value || undefined)} style={styles.input} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Data Máxima</label>
                <input type="date" value={filters.dataMax || ''} onChange={(e) => handleFilterChange('dataMax', e.target.value || undefined)} style={styles.input} />
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Comodidades e Opções</h3>
            <div style={styles.checkboxContainer}>
              <label style={styles.checkboxLabel}><input type="checkbox" checked={filters.piscina || false} onChange={(e) => handleFilterChange('piscina', e.target.checked)} style={styles.checkbox} /> Com Piscina</label>
              <label style={styles.checkboxLabel}><input type="checkbox" checked={filters.varanda || false} onChange={(e) => handleFilterChange('varanda', e.target.checked)} style={styles.checkbox} /> Com Varanda</label>
              <label style={styles.checkboxLabel}><input type="checkbox" checked={filters.elevador || false} onChange={(e) => handleFilterChange('elevador', e.target.checked)} style={styles.checkbox} /> Com Elevador</label>
              <label style={styles.checkboxLabel}><input type="checkbox" checked={filters.includeOldData ?? true} onChange={(e) => handleFilterChange('includeOldData', e.target.checked)} style={styles.checkbox} /> Incluir Arquivo Antigo</label>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div style={styles.footer}>
              <button onClick={resetFilters} style={styles.clearButton}>
                Limpar Filtros ({activeFiltersCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Estilos permanecem os mesmos
const styles = {
  container: {
    backgroundColor: '#262626',
    borderRadius: '16px',
    marginBottom: '32px',
    border: '1px solid #2F2F2F',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none' as const,
    padding: '20px 24px',
  } as React.CSSProperties,
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,
  badge: {
    backgroundColor: '#9E7FFF',
    color: '#FFFFFF',
    borderRadius: '99px',
    padding: '4px 10px',
    fontSize: '13px',
    fontWeight: 600,
  } as React.CSSProperties,
  toggleIcon: {
    fontSize: '16px',
    color: '#A3A3A3',
    transition: 'transform 0.3s ease-in-out',
  } as React.CSSProperties,
  collapsible: {
    overflow: 'hidden',
    transition: 'max-height 0.4s ease-in-out',
  } as React.CSSProperties,
  filtersContent: {
    padding: '0 24px 24px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '28px',
  } as React.CSSProperties,
  searchGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  } as React.CSSProperties,
  section: {
    borderTop: '1px solid #2F2F2F',
    paddingTop: '24px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#A3A3A3',
    margin: '0 0 16px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  } as React.CSSProperties,
  filterGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  } as React.CSSProperties,
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
  } as React.CSSProperties,
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #2F2F2F',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    backgroundColor: '#171717',
    color: '#FFFFFF',
  } as React.CSSProperties,
  select: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #2F2F2F',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#171717',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  } as React.CSSProperties,
  checkboxContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '16px',
    alignItems: 'center',
  } as React.CSSProperties,
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#FFFFFF',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#9E7FFF',
  } as React.CSSProperties,
  footer: {
    borderTop: '1px solid #2F2F2F',
    paddingTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
  } as React.CSSProperties,
  clearButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#f472b6',
    border: '1px solid #f472b6',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
  } as React.CSSProperties,
}
