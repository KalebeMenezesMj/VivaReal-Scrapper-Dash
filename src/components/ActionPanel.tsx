import { ExportButton } from './ExportButton'

interface ActionPanelProps {
  selectedProperties: Set<string>
  clearSelection: () => void
}

export function ActionPanel({ selectedProperties, clearSelection }: ActionPanelProps) {
  const selectedCount = selectedProperties.size

  return (
    <div style={styles.container}>
      <div style={styles.selectionInfo}>
        {selectedCount > 0 && (
          <>
            <span style={styles.count}>{selectedCount}</span>
            <span style={styles.text}>imóveis selecionados</span>
            <button onClick={clearSelection} style={styles.clearButton}>
              Limpar Seleção
            </button>
          </>
        )}
      </div>
      <div style={styles.actions}>
        <ExportButton selectedProperties={selectedProperties} />
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#262626',
    borderRadius: '16px',
    marginBottom: '32px',
    border: '1px solid #2F2F2F',
  } as React.CSSProperties,
  selectionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,
  count: {
    backgroundColor: '#9E7FFF',
    color: '#FFFFFF',
    borderRadius: '99px',
    padding: '4px 12px',
    fontSize: '14px',
    fontWeight: 600,
  } as React.CSSProperties,
  text: {
    fontSize: '14px',
    color: '#A3A3A3',
  } as React.CSSProperties,
  clearButton: {
    background: 'none',
    border: 'none',
    color: '#f472b6',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
  } as React.CSSProperties,
  actions: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,
}
