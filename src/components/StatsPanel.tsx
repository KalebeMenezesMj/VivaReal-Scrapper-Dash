import { useState, useEffect } from 'react'
import type { PropertyStats } from '../types/database.types'
import { getStats } from '../lib/api'

export function StatsPanel() {
  const [stats, setStats] = useState<PropertyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await getStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={styles.skeleton} />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div style={styles.container}>
      <div style={styles.statCard}>
        <div style={styles.statIcon}>🏠</div>
        <div style={styles.statContent}>
          <div style={styles.statLabel}>Total de Imóveis</div>
          <div style={styles.statValue}>{stats.totalProperties.toLocaleString('pt-BR')}</div>
        </div>
      </div>

      <div style={styles.statCard}>
        <div style={styles.statIcon}>🏙️</div>
        <div style={styles.statContent}>
          <div style={styles.statLabel}>Cidades</div>
          <div style={styles.statValue}>{stats.totalCidades}</div>
        </div>
      </div>

      <div style={styles.statCard}>
        <div style={styles.statIcon}>📍</div>
        <div style={styles.statContent}>
          <div style={styles.statLabel}>Bairros</div>
          <div style={styles.statValue}>{stats.totalBairros}</div>
        </div>
      </div>

      <div style={styles.statCard}>
        <div style={styles.statIcon}>🛏️</div>
        <div style={styles.statContent}>
          <div style={styles.statLabel}>Média de Quartos</div>
          <div style={styles.statValue}>{stats.avgQuartos.toFixed(1)}</div>
        </div>
      </div>

      <div style={styles.statCard}>
        <div style={styles.statIcon}>🏊</div>
        <div style={styles.statContent}>
          <div style={styles.statLabel}>Com Piscina</div>
          <div style={styles.statValue}>{stats.propertiesWithPiscina}</div>
        </div>
      </div>

      <div style={styles.statCard}>
        <div style={styles.statIcon}>🛗</div>
        <div style={styles.statContent}>
          <div style={styles.statLabel}>Com Elevador</div>
          <div style={styles.statValue}>{stats.propertiesWithElevador}</div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  } as React.CSSProperties,
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  } as React.CSSProperties,
  statIcon: {
    fontSize: '36px',
  } as React.CSSProperties,
  statContent: {
    flex: 1,
  } as React.CSSProperties,
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    fontWeight: 500,
    marginBottom: '4px',
  } as React.CSSProperties,
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a1a1a',
  } as React.CSSProperties,
  skeleton: {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    height: '100px',
    animation: 'pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties,
}
