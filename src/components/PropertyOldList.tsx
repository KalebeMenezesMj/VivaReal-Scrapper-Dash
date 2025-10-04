import React, { useState, useEffect, useRef } from 'react';
import { Pagination } from './Pagination';
import { fetchOldProperties } from '../lib/api_old';
import type { PropertyOld } from '../types/database.types';
import { PropertyOldCard } from './PropertyOldCard'; // Assuming this component exists and handles old structure

const ITEMS_PER_PAGE = 20;

/**
 * Component retained for viewing legacy data from properties_old.
 * Hardened against undefined results and double rendering loops.
 */
export function PropertyOldList() {
  const [properties, setProperties] = useState<PropertyOld[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Ref to track if data has been successfully loaded at least once to prevent effect loops
  const hasLoadedRef = useRef(false);

  const loadProperties = async (page: number) => {
    // Prevent loading if we are already on the requested page and data is present, 
    // unless it's the initial load (hasLoadedRef is false)
    if (hasLoadedRef.current && page === currentPage && properties.length > 0) {
        return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const rawData = await fetchOldProperties();
      const allProperties = Array.isArray(rawData) ? rawData : [];
      
      const total = allProperties.length;
      const totalPagesCalc = total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : 1;
      
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      
      setProperties(allProperties.slice(startIndex, endIndex));
      setTotalPages(totalPagesCalc);
      setTotalCount(total);
      
      // Mark as loaded only upon successful data retrieval
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados históricos');
      setProperties([]);
      setTotalPages(1);
      setTotalCount(0);
      hasLoadedRef.current = false; // Reset flag on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load if the page changes OR if it's the very first mount and we haven't loaded yet.
    if (!hasLoadedRef.current || currentPage !== 1) {
        loadProperties(currentPage);
    } else if (currentPage === 1 && !hasLoadedRef.current) {
        // Initial load when currentPage is 1
        loadProperties(1);
    }
  }, [currentPage]); // Dependency on currentPage is necessary for pagination

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- Render States ---

  if (loading) {
    return (
      <div style={styles.sectionContainer}>
        <h2 style={styles.sectionTitle}>Imóveis Históricos (Dados Antigos)</h2>
        <div style={styles.container}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={styles.skeleton} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.sectionContainer}>
        <h2 style={styles.sectionTitle}>Imóveis Históricos (Dados Antigos)</h2>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>❌</div>
          <h3 style={styles.errorTitle}>Erro ao carregar Histórico</h3>
          <p style={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  if (properties.length === 0 && !hasLoadedRef.current) {
    // Show empty state only if we tried to load and found nothing (or if loading finished with 0 results)
    return (
      <div style={styles.sectionContainer}>
        <h2 style={styles.sectionTitle}>Imóveis Históricos (Dados Antigos)</h2>
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>📜</div>
          <h3 style={styles.emptyTitle}>Nenhum registro histórico encontrado</h3>
          <p style={styles.emptyMessage}>A tabela 'properties_old' está vazia ou a busca falhou.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.sectionContainer}>
      <h2 style={styles.sectionTitle}>Imóveis Históricos (Dados Antigos)</h2>
      <div style={styles.container}>
        {properties.map(property => (
          <PropertyOldCard key={property.id} property={property} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

const styles = {
  sectionContainer: {
    marginTop: '48px',
    paddingTop: '24px',
    borderTop: '1px solid #2f2f2f',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: '24px',
    borderLeft: '4px solid #f472b6', // Accent color border
    paddingLeft: '12px',
  } as React.CSSProperties,
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  } as React.CSSProperties,
  skeleton: {
    backgroundColor: '#2f2f2f',
    borderRadius: '12px',
    height: '350px',
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
};
