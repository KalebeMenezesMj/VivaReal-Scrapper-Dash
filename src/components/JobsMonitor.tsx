import { useState, useEffect } from 'react'
import type { ScrapingJob } from '../types/database.types'
import { fetchScrapingJobs } from '../lib/api'

export function JobsMonitor() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    loadJobs()
    const interval = setInterval(loadJobs, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadJobs = async () => {
    try {
      const data = await fetchScrapingJobs()
      setJobs(data)
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981'
      case 'running': return '#3b82f6'
      case 'failed': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'running': return 'Em Execução'
      case 'failed': return 'Falhou'
      case 'pending': return 'Pendente'
      default: return status
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDuration = (job: ScrapingJob) => {
    if (!job.started_at || !job.completed_at) return '-'
    const start = new Date(job.started_at).getTime()
    const end = new Date(job.completed_at).getTime()
    const diff = Math.floor((end - start) / 1000)
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60
    return `${minutes}m ${seconds}s`
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Jobs de Scraping</h2>
        </div>
        <div style={styles.skeleton} />
      </div>
    )
  }

  const latestJob = jobs[0]
  const displayedJobs = isExpanded ? jobs : jobs.slice(0, 3)

  return (
    <div style={styles.container}>
      <div style={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <h2 style={styles.title}>
          Jobs de Scraping
          {latestJob?.status === 'running' && (
            <span style={styles.runningIndicator}>● Em execução</span>
          )}
        </h2>
        <button style={styles.toggleButton}>
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {jobs.length === 0 ? (
        <div style={styles.emptyState}>
          <p>Nenhum job encontrado. Execute o script Python para iniciar a coleta.</p>
        </div>
      ) : (
        <>
          <div style={styles.jobsList}>
            {displayedJobs.map(job => (
              <div key={job.id} style={styles.jobCard}>
                <div style={styles.jobHeader}>
                  <div style={styles.jobInfo}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(job.status) + '20',
                        color: getStatusColor(job.status)
                      }}
                    >
                      {getStatusLabel(job.status)}
                    </span>
                    <span style={styles.jobId}>ID: {job.id.slice(0, 8)}</span>
                  </div>
                  <span style={styles.jobDate}>{formatDate(job.created_at)}</span>
                </div>

                <div style={styles.jobStats}>
                  <div style={styles.jobStat}>
                    <span style={styles.statLabel}>Links Encontrados</span>
                    <span style={styles.statValue}>{job.links_found}</span>
                  </div>
                  <div style={styles.jobStat}>
                    <span style={styles.statLabel}>Imóveis Coletados</span>
                    <span style={styles.statValue}>{job.properties_scraped}</span>
                  </div>
                  <div style={styles.jobStat}>
                    <span style={styles.statLabel}>Scrolls</span>
                    <span style={styles.statValue}>{job.max_scrolls}</span>
                  </div>
                  <div style={styles.jobStat}>
                    <span style={styles.statLabel}>Duração</span>
                    <span style={styles.statValue}>{calculateDuration(job)}</span>
                  </div>
                </div>

                {job.error_message && (
                  <div style={styles.errorMessage}>
                    <strong>Erro:</strong> {job.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>

          {jobs.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={styles.showMoreButton}
            >
              {isExpanded ? 'Ver Menos' : `Ver Todos (${jobs.length})`}
            </button>
          )}
        </>
      )}
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    cursor: 'pointer',
    userSelect: 'none' as const,
  } as React.CSSProperties,
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,
  runningIndicator: {
    fontSize: '14px',
    color: '#3b82f6',
    fontWeight: 500,
    animation: 'pulse 2s ease-in-out infinite',
  } as React.CSSProperties,
  toggleButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#666',
    padding: '4px 8px',
  } as React.CSSProperties,
  skeleton: {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    height: '150px',
    animation: 'pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#6b7280',
  } as React.CSSProperties,
  jobsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  } as React.CSSProperties,
  jobCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '16px',
    transition: 'box-shadow 0.2s',
  } as React.CSSProperties,
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  } as React.CSSProperties,
  jobInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
  } as React.CSSProperties,
  jobId: {
    fontSize: '12px',
    color: '#9ca3af',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  jobDate: {
    fontSize: '12px',
    color: '#6b7280',
  } as React.CSSProperties,
  jobStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  } as React.CSSProperties,
  jobStat: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  } as React.CSSProperties,
  statLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
  statValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a1a1a',
  } as React.CSSProperties,
  errorMessage: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#991b1b',
  } as React.CSSProperties,
  showMoreButton: {
    width: '100%',
    marginTop: '16px',
    padding: '10px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
}
