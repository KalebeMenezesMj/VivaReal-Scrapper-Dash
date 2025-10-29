import { PropertyCard } from './PropertyCard'
import type { Property } from '../types/database.types'

interface PropertyListProps {
  properties: Property[]
  loading: boolean
  error: string | null
  selectedProperties: Set<string>
  onPropertySelect: (id: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
}

export function PropertyList({
  properties,
  loading,
  error,
  selectedProperties,
  onPropertySelect,
  onSelectAll,
}: PropertyListProps) {
  const allVisibleSelected = properties.length > 0 && properties.every(p => selectedProperties.has(p.id))

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked)
  }

  if (loading) {
    return (
      <div style={styles.sectionContainer}>
        <h2 style={styles.sectionTitle}>Imóveis Encontrados</h2>
        <div style={styles.container}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={styles.skeleton} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.sectionContainer}>
        <h2 style={styles.sectionTitle}>Imóveis Encontrados</h2>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>❌</div>
          <h3 style={styles.errorTitle}>Erro ao carregar Imóveis</h3>
          <p style={styles.errorMessage}>{error}</p>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div style={styles.sectionContainer}>
        <h2 style={styles.sectionTitle}>Imóveis Encontrados</h2>
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>🏠</div>
          <h3 style={styles.emptyTitle}>Nenhum imóvel encontrado</h3>
          <p style={styles.emptyMessage}>Tente ajustar os filtros para encontrar o que procura.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.sectionContainer}>
      <div style={styles.listHeader}>
        <h2 style={styles.sectionTitle}>Imóveis Encontrados</h2>
        <div style={styles.selectAllContainer}>
          <input
            type="checkbox"
            id="selectAll"
            style={styles.checkbox}
            checked={allVisibleSelected}
            onChange={handleSelectAllChange}
          />
          <label htmlFor="selectAll" style={styles.selectAllLabel}>
            Selecionar todos na página
          </label>
        </div>
      </div>
      <div style={styles.container}>
        {properties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            isSelected={selectedProperties.has(property.id)}
            onSelect={onPropertySelect}
          />
        ))}
      </div>
    </div>
  )
}

const styles = {
  sectionContainer: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #2f2f2f',
  } as React.CSSProperties,
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: 0,
    borderLeft: '4px solid #9E7FFF',
    paddingLeft: '12px',
  } as React.CSSProperties,
  selectAllContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#9E7FFF',
  } as React.CSSProperties,
  selectAllLabel: {
    fontSize: '14px',
    color: '#A3A3A3',
    cursor: 'pointer',
  } as React.CSSProperties,
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  } as React.CSSProperties,
  skeleton: {
    backgroundColor: '#2f2f2f',
    borderRadius: '12px',
    height: '400px',
    animation: 'pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties,
  errorContainer: {
    backgroundColor: '#331818',
    border: '1px solid #ef4444',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  } as React.CSSProperties,
  errorTitle: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#fca5a5',
  } as React.CSSProperties,
  errorMessage: {
    margin: 0,
    fontSize: '14px',
    color: '#f87171',
  } as React.CSSProperties,
  emptyContainer: {
    backgroundColor: '#2f2f2f',
    border: '2px dashed #525252',
    borderRadius: '12px',
    padding: '60px 40px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  } as React.CSSProperties,
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#ffffff',
  } as React.CSSProperties,
  emptyMessage: {
    margin: 0,
    fontSize: '14px',
    color: '#a3a3a3',
  } as React.CSSProperties,
}
