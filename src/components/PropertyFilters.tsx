import { useState, useEffect, useRef } from 'react'
import type { FilterOptions } from '../types/database.types'
import { getFilterOptions } from '../lib/api'
import { useFilterStore } from '../store/useFilterStore'

// Helper to format numbers with thousand separators (dots)
const formatNumberWithDots = (value: number | undefined): string => {
  if (value === undefined || value === null) return '';
  //toLocaleString with 'pt-BR' uses dots for thousands and commas for decimals.
  return value.toLocaleString('pt-BR');
};

// Helper to parse a formatted string back to a number
const parseFormattedNumber = (value: string): number | undefined => {
  if (!value) return undefined;
  // Remove all non-digit characters to get the raw number
  const numericString = value.replace(/\D/g, '');
  if (numericString === '') return undefined;
  const number = parseInt(numericString, 10);
  return isNaN(number) ? undefined : number;
};

export function PropertyFilters() {
  const { filters, setFilters, resetFilters } = useFilterStore()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isBairroDropdownOpen, setIsBairroDropdownOpen] = useState(false)
  const bairroRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bairroRef.current && !bairroRef.current.contains(event.target as Node)) {
        setIsBairroDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [bairroRef])

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }

    if (key === 'cidade') {
      newFilters.bairro = [] // Reseta os bairros ao mudar a cidade
    }
    
    if ((key === 'piscina' || key === 'varanda' || key === 'elevador') && value === false) {
      newFilters[key] = undefined;
    }

    setFilters(newFilters)
  }
  
  const handleNumericFilterChange = (key: keyof FilterOptions, value: string) => {
    const numericValue = parseFormattedNumber(value);
    handleFilterChange(key, numericValue);
  };

  const handleBairroChange = (bairro: string) => {
    const currentBairros = filters.bairro || []
    const newBairros = currentBairros.includes(bairro)
      ? currentBairros.filter(b => b !== bairro)
      : [...currentBairros, bairro]
    
    setFilters({ ...filters, bairro: newBairros })
  }

  const availableBairros = filters.cidade
    ? filterOptions.bairrosPorCidade[filters.cidade] || []
    : filterOptions.bairros

  const activeFiltersCount = Object.entries(filters).filter(([key, v]) => {
    if (key === 'includeOldData') return v === false;
    if (Array.isArray(v)) return v.length > 0; // Lógica para contar filtros de array
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
              <div style={styles.filterGroup} ref={bairroRef}>
                <label style={styles.label}>Bairro</label>
                <div style={styles.multiSelectContainer}>
                  <button 
                    onClick={() => setIsBairroDropdownOpen(!isBairroDropdownOpen)} 
                    style={{...styles.select, ...styles.multiSelectButton}} 
                    disabled={!filters.cidade}
                  >
                    <span>
                      {filters.bairro && filters.bairro.length > 0 
                        ? `${filters.bairro.length} bairros selecionados` 
                        : 'Todos'}
                    </span>
                    <span style={{...styles.toggleIcon, transform: isBairroDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
                  </button>
                  {isBairroDropdownOpen && (
                    <div style={styles.dropdown}>
                      {availableBairros.length > 0 ? availableBairros.map(bairro => (
                        <label key={bairro} style={styles.dropdownItem}>
                          <input 
                            type="checkbox" 
                            checked={(filters.bairro || []).includes(bairro)}
                            onChange={() => handleBairroChange(bairro)}
                            style={styles.checkbox}
                          />
                          {bairro}
                        </label>
                      )) : <div style={styles.dropdownEmpty}>Selecione uma cidade</div>}
                    </div>
                  )}
                </div>
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
                <input type="text" inputMode="numeric" placeholder="Ex: 2" value={formatNumberWithDots(filters.quartosMin)} onChange={(e) => handleNumericFilterChange('quartosMin', e.target.value)} style={styles.input} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Banheiros Mín.</label>
                <input type="text" inputMode="numeric" placeholder="Ex: 1" value={formatNumberWithDots(filters.banheirosMin)} onChange={(e) => handleNumericFilterChange('banheirosMin', e.target.value)} style={styles.input} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Vagas Mín.</label>
                <input type="text" inputMode="numeric" placeholder="Ex: 1" value={formatNumberWithDots(filters.vagasMin)} onChange={(e) => handleNumericFilterChange('vagasMin', e.target.value)} style={styles.input} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Suítes Mín.</label>
                <input type="text" inputMode="numeric" placeholder="Ex: 1" value={formatNumberWithDots(filters.suitesMin)} onChange={(e) => handleNumericFilterChange('suitesMin', e.target.value)} style={styles.input} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Área Mín. (m²)</label>
                <input type="text" inputMode="numeric" placeholder="Ex: 70" value={formatNumberWithDots(filters.areaMin)} onChange={(e) => handleNumericFilterChange('areaMin', e.target.value)} style={styles.input} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Área Máx. (m²)</label>
                <input type="text" inputMode="numeric" placeholder="Ex: 200" value={formatNumberWithDots(filters.areaMax)} onChange={(e) => handleNumericFilterChange('areaMax', e.target.value)} style={styles.input} />
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Valor e Data</h3>
            <div style={styles.grid}>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Valor Mínimo (R$)</label>
                <input type="text" inputMode="numeric" placeholder="Ex: 300.000" value={formatNumberWithDots(filters.valorMin)} onChange={(e) => handleNumericFilterChange('valorMin', e.target.value)} style={styles.input} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Valor Máximo (R$)</label>
                <input type="text" inputMode="numeric" placeholder="Ex: 800.000" value={formatNumberWithDots(filters.valorMax)} onChange={(e) => handleNumericFilterChange('valorMax', e.target.value)} style={styles.input} />
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

const styles = {
  container: {
    backgroundColor: '#262626',
    borderRadius: '16px',
    marginBottom: '32px',
    border: '1px solid #2F2F2F',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
    position: 'relative',
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
    appearance: 'none' as const,
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
  multiSelectContainer: {
    position: 'relative',
  } as React.CSSProperties,
  multiSelectButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    textAlign: 'left',
  } as React.CSSProperties,
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    backgroundColor: '#262626',
    border: '1px solid #2F2F2F',
    borderRadius: '8px',
    maxHeight: '250px',
    overflowY: 'auto',
    zIndex: 20,
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  } as React.CSSProperties,
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    cursor: 'pointer',
    gap: '10px',
    fontSize: '14px',
    color: '#FFFFFF',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  dropdownEmpty: {
    padding: '12px 14px',
    color: '#A3A3A3',
    fontSize: '14px',
  } as React.CSSProperties,
}
