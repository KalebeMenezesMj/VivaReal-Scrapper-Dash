import type { Property } from '../types/database.types'
import { MapPin, BedDouble, Bath, Car, Ruler, Building, Calendar, ExternalLink, CheckCircle, Archive, Layers } from 'lucide-react'

interface PropertyCardProps {
  property: Property
  isSelected: boolean
  onSelect: (id: string, selected: boolean) => void
}

export function PropertyCard({ property, isSelected, onSelect }: PropertyCardProps) {
  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(property.id, e.target.checked)
  }

  const formatValue = (value: string | null | undefined, prefix = '', suffix = '') => {
    if (!value) return 'N/A'
    const num = parseFloat(value)
    if (isNaN(num)) return 'N/A'
    return `${prefix}${num.toLocaleString('pt-BR')}${suffix}`
  }

  const cardStyle = {
    ...styles.card,
    ...(isSelected && styles.selectedCard),
  }

  // Define which property types are considered vertical (apartments) vs. horizontal (houses)
  const apartmentLikeTypes = ['apartamento', 'flat', 'kitnet/studio', 'cobertura', 'sala comercial', 'loja'];
  const houseLikeTypes = ['casa', 'casa de condomínio', 'casa isolada', 'sobrado', 'terreno/lote', 'chácara/sítio'];
  const propertyTypeLower = property.tipo?.toLowerCase() || '';

  return (
    <div style={cardStyle}>
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <span style={styles.propertyType}>{property.tipo || 'Imóvel'}</span>
          {property.dataSource === 'old' && (
            <span style={styles.oldDataTag}>
              <Archive size={12} style={{ marginRight: '4px' }} />
              ARQUIVO
            </span>
          )}
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectChange}
          style={styles.checkbox}
          aria-label={`Selecionar imóvel ${property.id}`}
        />
      </div>

      <div style={styles.content}>
        <p style={styles.address}>
          <MapPin style={styles.icon} size={16} />
          {property.endereco_completo}
        </p>
        <h3 style={styles.price}>{formatValue(property.valor, 'R$ ')}</h3>

        <div style={styles.featuresGrid}>
          {property.dormitorio && <Feature icon={<BedDouble size={16} />} label="Dorm." value={property.dormitorio} />}
          {property.banheiro && <Feature icon={<Bath size={16} />} label="Ban." value={property.banheiro} />}
          {property.vaga && <Feature icon={<Car size={16} />} label="Vagas" value={property.vaga} />}
          {property.suite && <Feature icon={<BedDouble size={16} />} label="Suítes" value={property.suite} />}
          {property.area_privativa && <Feature icon={<Ruler size={16} />} label="Área" value={`${property.area_privativa} m²`} />}
          
          {/* Conditionally render Land Area for house-like properties */}
          {houseLikeTypes.includes(propertyTypeLower) && property.area_terreno && (
            <Feature icon={<Layers size={16} />} label="Terreno" value={`${property.area_terreno} m²`} />
          )}

          {/* Conditionally render Floor for apartment-like properties */}
          {apartmentLikeTypes.includes(propertyTypeLower) && property.andar && (
            <Feature icon={<Building size={16} />} label="Andar" value={property.andar} />
          )}
        </div>

        <div style={styles.amenities}>
          {property.piscina && <Amenity icon={<CheckCircle size={14} />} label="Piscina" />}
          {property.varanda && <Amenity icon={<CheckCircle size={14} />} label="Varanda" />}
          {property.elevador && <Amenity icon={<CheckCircle size={14} />} label="Elevador" />}
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.dateInfo}>
          <Calendar style={styles.icon} size={14} />
          <span>{property.data ? new Date(property.data).toLocaleDateString('pt-BR') : 'Data indisponível'}</span>
        </div>
        <a href={property.link} target="_blank" rel="noopener noreferrer" style={styles.link}>
          Ver Anúncio <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}

const Feature = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div style={styles.feature}>
    <div style={styles.featureIcon}>{icon}</div>
    <div>
      <span style={styles.featureValue}>{value}</span>
      <span style={styles.featureLabel}>{label}</span>
    </div>
  </div>
)

const Amenity = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div style={styles.amenity}>
    {icon}
    <span>{label}</span>
  </div>
)

const styles = {
  card: {
    backgroundColor: '#262626',
    borderRadius: '12px',
    border: '1px solid #2F2F2F',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  selectedCard: {
    borderColor: '#9E7FFF',
    boxShadow: '0 0 0 2px #9E7FFF, 0 4px 12px rgba(158, 127, 255, 0.3)',
    transform: 'scale(1.02)',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: '#2f2f2f',
  } as React.CSSProperties,
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  propertyType: {
    backgroundColor: '#9E7FFF',
    color: '#FFFFFF',
    padding: '3px 8px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: 600,
  } as React.CSSProperties,
  oldDataTag: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    color: '#171717',
    padding: '3px 8px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: 700,
  } as React.CSSProperties,
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#9E7FFF',
  } as React.CSSProperties,
  content: {
    padding: '12px',
    flex: 1,
  } as React.CSSProperties,
  address: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#A3A3A3',
    margin: '0 0 8px 0',
  } as React.CSSProperties,
  icon: {
    color: '#A3A3A3',
    flexShrink: 0,
  } as React.CSSProperties,
  price: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: '0 0 12px 0',
  } as React.CSSProperties,
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))',
    gap: '12px',
    padding: '12px 0',
    borderTop: '1px solid #2F2F2F',
    borderBottom: '1px solid #2F2F2F',
  } as React.CSSProperties,
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  featureIcon: {
    color: '#9E7FFF',
  } as React.CSSProperties,
  featureValue: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
  } as React.CSSProperties,
  featureLabel: {
    fontSize: '11px',
    color: '#A3A3A3',
  } as React.CSSProperties,
  amenities: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    marginTop: '12px',
  } as React.CSSProperties,
  amenity: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#FFFFFF',
    backgroundColor: '#38bdf820',
    padding: '4px 10px',
    borderRadius: '6px',
  } as React.CSSProperties,
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: '#171717',
    borderTop: '1px solid #2F2F2F',
  } as React.CSSProperties,
  dateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#A3A3A3',
  } as React.CSSProperties,
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#38bdf8',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: 500,
  } as React.CSSProperties,
}
