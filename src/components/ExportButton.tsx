import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Download, Loader2 } from 'lucide-react'
import { useFilterStore } from '../store/useFilterStore'
import { fetchProperties, fetchPropertiesByIds } from '../lib/api'
import type { Property } from '../types/database.types'

interface ExportButtonProps {
  selectedProperties: Set<string>
}

export function ExportButton({ selectedProperties }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { filters } = useFilterStore.getState()
  const selectedCount = selectedProperties.size

  const handleExport = async () => {
    setIsExporting(true)
    try {
      let propertiesToExport: Property[]
      const isExportingSelected = selectedCount > 0

      if (isExportingSelected) {
        propertiesToExport = await fetchPropertiesByIds(selectedProperties)
      } else {
        const result = await fetchProperties(filters, 1, 10000)
        propertiesToExport = result.properties
      }

      if (!propertiesToExport || propertiesToExport.length === 0) {
        alert(isExportingSelected
          ? 'Nenhum imóvel selecionado para exportar.'
          : 'Não há dados para exportar com os filtros atuais.'
        )
        return
      }

      const headers = [
        'ID', 'Tipo', 'Endereço', 'Bairro', 'Cidade', 'UF',
        'Área Privativa (m²)', 'Área Terreno (m²)', 'Valor (R$)', 'Valor por m² (R$)',
        'Dormitórios', 'Suítes', 'Banheiros', 'Vagas',
        'Piscina', 'Varanda', 'Elevador',
        'Idade Aparente', 'Estado Conservação', 'Padrão Acabamento',
        'Link', 'Data'
      ]

      const dataRows = propertiesToExport.map(p => [
        p.id, p.tipo || '', p.endereco_completo || '', p.bairro || '', p.cidade || '', p.uf || '',
        p.area_privativa ? parseFloat(p.area_privativa) : null,
        p.area_terreno ? parseFloat(p.area_terreno) : null,
        p.valor ? parseFloat(p.valor) : null,
        p.valor && p.area_privativa && parseFloat(p.area_privativa) > 0
          ? parseFloat(p.valor) / parseFloat(p.area_privativa)
          : null,
        p.dormitorio ? parseInt(p.dormitorio, 10) : 0,
        p.suite ? parseInt(p.suite, 10) : 0,
        p.banheiro ? parseInt(p.banheiro, 10) : 0,
        p.vaga ? parseInt(p.vaga, 10) : 0,
        p.piscina ? 1 : 0, p.varanda ? 1 : 0, p.elevador ? 1 : 0,
        p.idade_aparente || '', p.estado_conservacao || '', p.padrao_acabamento || '',
        p.link || '', p.data ? new Date(p.data) : null
      ])

      const now = new Date()
      const titleRow = [`Relatório de Imóveis - ${isExportingSelected ? 'Seleção' : 'Filtros Atuais'}`]
      const metadataRow = [`Gerado em: ${now.toLocaleString('pt-BR')}`, `Total de Imóveis: ${propertiesToExport.length}`]

      const sheetData = [titleRow, [], metadataRow, [], headers, ...dataRows]
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData, { cellDates: true })

      // --- STYLING ---
      const titleStyle = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "9E7FFF" } },
        alignment: { horizontal: "center", vertical: "center" }
      }
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2F2F2F" } },
        alignment: { horizontal: "center" }
      }
      const zebraStripeStyle = {
        fill: { fgColor: { rgb: "262626" } }
      }

      // Apply Title Style
      const titleCellRef = XLSX.utils.encode_cell({ r: 0, c: 0 })
      if (worksheet[titleCellRef]) worksheet[titleCellRef].s = titleStyle

      const headerRowIndex = 4
      // Apply Header Styles
      headers.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex })
        if (worksheet[cellRef]) worksheet[cellRef].s = headerStyle
      })

      // Apply Zebra Striping to data rows
      for (let R = headerRowIndex + 1; R < sheetData.length; ++R) {
        if ((R - headerRowIndex) % 2 === 0) { // Apply to even data rows
          for (let C = 0; C < headers.length; ++C) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
            if (worksheet[cellRef]) {
              worksheet[cellRef].s = { ...worksheet[cellRef].s, ...zebraStripeStyle }
            } else {
              worksheet[cellRef] = { s: zebraStripeStyle }
            }
          }
        }
      }
      // --- END STYLING ---

      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }]

      const currencyFormat = 'R$ #,##0.00'
      const numberFormat = '#,##0.00'
      const dateFormat = 'dd/mm/yyyy'
      const valorColIndex = headers.indexOf('Valor (R$)')
      const valorM2ColIndex = headers.indexOf('Valor por m² (R$)')
      const dataColIndex = headers.indexOf('Data')
      const areaPrivativaColIndex = headers.indexOf('Área Privativa (m²)')
      const areaTerrenoColIndex = headers.indexOf('Área Terreno (m²)')

      for (let R = headerRowIndex + 1; R < sheetData.length; ++R) {
        const formatCell = (colIndex: number, format: string) => {
          if (colIndex > -1) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: colIndex })
            if (worksheet[cellRef]) worksheet[cellRef].z = format
          }
        }
        formatCell(valorColIndex, currencyFormat)
        formatCell(valorM2ColIndex, currencyFormat)
        formatCell(dataColIndex, dateFormat)
        formatCell(areaPrivativaColIndex, numberFormat)
        formatCell(areaTerrenoColIndex, numberFormat)
      }

      const colWidths = headers.map((_, colIndex) => {
        const maxLength = sheetData.reduce((max, row) => {
          const cellValue = row[colIndex]
          const cellLength = cellValue ? String(cellValue).length : 0
          return Math.max(max, cellLength)
        }, 0)
        return { wch: Math.min(Math.max(maxLength, 10), 50) + 2 }
      })
      worksheet['!cols'] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Imóveis')

      const dateStr = now.toISOString().split('T')[0]
      const filename = isExportingSelected
        ? `relatorio-imoveis-selecionados-${dateStr}.xlsx`
        : `relatorio-imoveis-${dateStr}.xlsx`

      XLSX.writeFile(workbook, filename)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Ocorreu um erro ao exportar os dados. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button onClick={handleExport} disabled={isExporting} style={styles.button}>
      {isExporting ? (
        <>
          <Loader2 style={{ ...styles.icon, animation: 'spin 1s linear infinite' }} />
          <span>Exportando...</span>
        </>
      ) : (
        <>
          <Download style={styles.icon} />
          <span>
            {selectedCount > 0 ? `Exportar Selecionados (${selectedCount})` : 'Exportar para Excel'}
          </span>
        </>
      )}
    </button>
  )
}

const styles = {
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#9E7FFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  icon: {
    width: '18px',
    height: '18px',
  } as React.CSSProperties,
}
