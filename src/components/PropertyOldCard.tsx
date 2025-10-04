import React from 'react';
import type { PropertyOld } from '../types/database.types';

interface PropertyOldCardProps {
  property: PropertyOld;
}

// Função auxiliar para formatar valores numéricos ou nulos
const formatValue = (value: number | null, unit: string = '') => {
  if (value === null || isNaN(value)) return 'N/A';
  return `${value.toLocaleString('pt-BR')}${unit ? ' ' + unit : ''}`;
};

// Função auxiliar para formatar booleanos
const formatBoolean = (value: boolean | null) => {
  if (value === null) return 'Não informado';
  return value ? 'Sim' : 'Não';
};

export function PropertyOldCard({ property }: PropertyOldCardProps) {
  const primaryInfo = property.endereco || property.cidade || 'Endereço Desconhecido';
  const secondaryInfo = property.bairro ? `${property.bairro}, ${property.uf || 'UF Desconhecida'}` : property.cidade || 'Localização Desconhecida';
  const price = property.valor ? `R$ ${formatValue(property.valor)}` : 'Preço Indisponível';

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.price}>{price}</span>
        <span style={styles.type}>{property.tipo || 'Imóvel'}</span>
      </div>
      
      <div style={styles.body}>
        <p style={styles.title}>{primaryInfo}</p>
        <p style={styles.location}>{secondaryInfo}</p>
        
        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Área Privativa:</span>
            <span style={styles.detailValue}>{formatValue(property.area_privativa, 'm²')}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Quartos:</span>
            <span style={styles.detailValue}>{formatValue(property.dormitorio)}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Banheiros:</span>
            <span style={styles.detailValue}>{formatValue(property.banheiro)}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Vagas:</span>
            <span style={styles.detailValue}>{formatValue(property.vaga)}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Piscina:</span>
            <span style={styles.detailValue}>{formatBoolean(property.piscina)}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Elevador:</span>
            <span style={styles.detailValue}>{formatBoolean(property.elevador)}</span>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <a href={property.link || '#'} target="_blank" rel="noopener noreferrer" style={styles.link} aria-label={`Ver detalhes do imóvel em ${property.nome_fonte || 'fonte externa'}`}>
          Ver Fonte
        </a>
        <span style={styles.source}>Fonte: {property.nome_fonte || 'Desconhecida'}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#262626',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    border: '1px solid #2f2f2f',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    overflow: 'hidden',
  } as React.CSSProperties,
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #3f3f46',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(145deg, #2e2e2e, #262626)',
  } as React.CSSProperties,
  price: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#38bdf8', // Secondary color for emphasis
  } as React.CSSProperties,
  type: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#a3a3a3',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: '#3f3f46',
  } as React.CSSProperties,
  body: {
    padding: '20px',
    flexGrow: 1,
  } as React.CSSProperties,
  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
    margin: '0 0 8px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,
  location: {
    fontSize: '14px',
    color: '#a3a3a3',
    margin: '0 0 16px 0',
  } as React.CSSProperties,
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  } as React.CSSProperties,
  detailItem: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,
  detailLabel: {
    fontSize: '12px',
    color: '#a3a3a3',
    marginBottom: '2px',
  } as React.CSSProperties,
  detailValue: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#ffffff',
  } as React.CSSProperties,
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #3f3f46',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(145deg, #262626, #2e2e2e)',
  } as React.CSSProperties,
  link: {
    color: '#9E7FFF', // Primary color for action
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '14px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #9E7FFF',
    transition: 'background-color 0.2s, color 0.2s',
  } as React.CSSProperties,
  source: {
    fontSize: '12px',
    color: '#6b7280',
  } as React.CSSProperties,
};
