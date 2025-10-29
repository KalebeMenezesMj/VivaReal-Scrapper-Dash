import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PropertyFilters } from './components/PropertyFilters'
import { PropertyList } from './components/PropertyList'
import { Pagination } from './components/Pagination'
import { StatsPanel } from './components/StatsPanel'
import { JobsMonitor } from './components/JobsMonitor'
import { ActionPanel } from './components/ActionPanel'
import { fetchProperties } from './lib/api'
import { useFilterStore } from './store/useFilterStore'
import type { Property } from './types/database.types'

function App() {
  const { filters, currentPage, setPage } = useFilterStore()
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['properties', filters, currentPage],
    queryFn: () => fetchProperties(filters, currentPage),
    keepPreviousData: true,
  })

  const properties = data?.properties ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  const handlePageChange = (page: number) => {
    setPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePropertySelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedProperties)
    if (selected) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedProperties(newSelected)
  }

  const handleSelectAll = (select: boolean) => {
    const newSelected = new Set(selectedProperties)
    properties.forEach((property: Property) => {
      if (select) {
        newSelected.add(property.id)
      } else {
        newSelected.delete(property.id)
      }
    })
    setSelectedProperties(newSelected)
  }

  const clearSelection = () => {
    setSelectedProperties(new Set())
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Dashboard Imobiliário</h1>
          <p style={styles.headerSubtitle}>
            Sistema de Coleta e Visualização de Dados - RealEstate Data Harvester
          </p>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.container}>
          <JobsMonitor />
          <StatsPanel />
          
          <ActionPanel 
            selectedProperties={selectedProperties}
            clearSelection={clearSelection}
          />

          <PropertyFilters />

          <PropertyList
            properties={properties}
            loading={isLoading}
            error={isError ? (error as Error).message : null}
            selectedProperties={selectedProperties}
            onPropertySelect={handlePropertySelect}
            onSelectAll={handleSelectAll}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        </div>
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          RealEstate Data Harvester © 2025 | Dados coletados do VivaReal
        </p>
      </footer>
    </div>
  )
}

// Estilos permanecem os mesmos
const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#171717',
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,
  header: {
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    padding: '32px 24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  } as React.CSSProperties,
  headerTitle: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: 700,
  } as React.CSSProperties,
  headerSubtitle: {
    margin: 0,
    fontSize: '16px',
    opacity: 0.9,
    fontWeight: 400,
  } as React.CSSProperties,
  main: {
    flex: 1,
    padding: '32px 24px',
  } as React.CSSProperties,
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  } as React.CSSProperties,
  footer: {
    backgroundColor: '#262626',
    padding: '24px',
    textAlign: 'center' as const,
    borderTop: '1px solid #2f2f2f',
  } as React.CSSProperties,
  footerText: {
    margin: 0,
    fontSize: '14px',
    color: '#a3a3a3',
  } as React.CSSProperties,
}

export default App
