interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, totalCount, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div style={styles.container}>
      <div style={styles.info}>
        Mostrando página {currentPage} de {totalPages} ({totalCount} imóveis)
      </div>

      <div style={styles.buttons}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            ...styles.button,
            ...(currentPage === 1 ? styles.buttonDisabled : {}),
            ...(currentPage !== 1 ? styles.buttonInteractive : {})
          }}
          aria-label="Página anterior"
        >
          ← Anterior
        </button>

        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              disabled={page === currentPage}
              style={{
                ...styles.button,
                ...(page === currentPage ? styles.buttonActive : {}),
                ...(page !== currentPage ? styles.buttonInteractive : {})
              }}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ) : (
            <span key={index} style={styles.ellipsis}>{page}</span>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            ...styles.button,
            ...(currentPage === totalPages ? styles.buttonDisabled : {}),
            ...(currentPage !== totalPages ? styles.buttonInteractive : {})
          }}
          aria-label="Próxima página"
        >
          Próximo →
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    backgroundColor: '#262626', // Surface color for better contrast
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', // Deeper shadow for luxury feel
    border: '1px solid #2f2f2f',
  } as React.CSSProperties,
  info: {
    fontSize: '16px',
    color: '#a3a3a3',
    fontWeight: 500,
  } as React.CSSProperties,
  buttons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  } as React.CSSProperties,
  button: {
    padding: '10px 18px',
    backgroundColor: '#383838',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    minWidth: '80px',
  } as React.CSSProperties,
  buttonActive: {
    backgroundColor: '#9E7FFF', // Primary color
    color: '#171717',
    borderColor: '#9E7FFF',
    boxShadow: '0 0 10px rgba(158, 127, 255, 0.5)',
  } as React.CSSProperties,
  buttonInteractive: {
    '&:hover': {
        backgroundColor: '#4a4a4a',
        borderColor: '#525252',
    },
    '&:focus': {
        outline: '2px solid #38bdf8', // Secondary color focus ring
        outlineOffset: '2px',
    }
  } as React.CSSProperties,
  buttonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
    color: '#a3a3a3',
    backgroundColor: '#2f2f2f',
    boxShadow: 'none',
  } as React.CSSProperties,
  ellipsis: {
    padding: '10px 12px',
    color: '#525252',
    fontSize: '16px',
    fontWeight: 700,
  } as React.CSSProperties,
}
