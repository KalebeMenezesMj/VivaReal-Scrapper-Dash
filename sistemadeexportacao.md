# 📊 Sistema de Exportação Excel - Engenharia Reversa

## Visão Geral
O sistema de exportação do Dashboard Imobiliário permite gerar relatórios em Excel (.xlsx) com dados filtrados ou selecionados. A versão atual utiliza a biblioteca XLSX.js para criar planilhas visualmente ricas e bem formatadas, com cabeçalhos, metadados, formatação de dados inteligente e um esquema de cores profissional, tudo processado no lado do cliente.

## 🏗️ Arquitetura do Sistema

### 1. Fluxo de Exportação
```
[Botão Export] → [Coleta Dados] → [Formatação e Estilo] → [Geração XLSX] → [Download Arquivo]
```

### 2. Componente Principal

#### **ExportButton.tsx** - Orquestrador da Exportação
```typescript
// Estados de controle
const [isExporting, setIsExporting] = useState(false)

// Função principal de exportação
const handleExport = async () => {
  setIsExporting(true)
  try {
    // 1. Determina fonte dos dados (selecionados vs filtrados)
    // 2. Busca dados do Supabase
    // 3. Formata dados (números, datas, moeda)
    // 4. Adiciona cabeçalho e metadados
    // 5. APLICA ESTILOS (cores, fontes, alinhamento)
    // 6. Gera arquivo Excel com colunas autoajustadas
    // 7. Inicia download
  } catch (error) {
    // Tratamento de erros
  } finally {
    setIsExporting(false)
  }
}
```

## 🔄 Processo de Exportação Passo a Passo

### 1. **Estruturação e Formatação dos Dados**
A base continua a mesma: um "array de arrays" (`sheetData`) é criado para ter controle total sobre a estrutura, com tipos de dados corretos (Number, Date).

### 2. **Geração do Arquivo Excel com Estilo**

#### **Criação da Planilha**
Usamos `XLSX.utils.aoa_to_sheet(sheetData, { cellDates: true })` para criar a planilha base.

#### **Aplicação de Estilos (NOVO)**
Após a criação da planilha, iteramos sobre as células para aplicar estilos visuais. Os estilos são definidos como objetos de configuração.

```typescript
// Definição dos estilos
const titleStyle = {
  font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "9E7FFF" } }, // Roxo
  alignment: { horizontal: "center", vertical: "center" }
};
const headerStyle = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "2F2F2F" } }, // Cinza Escuro
  alignment: { horizontal: "center" }
};
const zebraStripeStyle = {
  fill: { fgColor: { rgb: "262626" } } // Cinza Claro
};

// Aplicação dos estilos às células correspondentes
worksheet['A1'].s = titleStyle; // Título

headers.forEach((_, colIndex) => {
  // ... aplica headerStyle na linha de cabeçalho
});

for (let R = firstDataRow; ...; ++R) {
  if (isEvenRow) {
    // ... aplica zebraStripeStyle na linha inteira
  }
}
```

#### **Formatação de Células**
A formatação de moeda, data e números continua sendo aplicada através da propriedade `z` da célula, que coexiste com a propriedade de estilo `s`.

#### **Ajuste de Colunas e Mesclagem**
A lógica de mesclagem do título e o ajuste dinâmico da largura das colunas foram mantidos para garantir a legibilidade.

## 📋 Estrutura Visual do Relatório

A estrutura agora é visualmente hierarquizada com cores e fontes.

| Linha | Conteúdo | Formatação |
|-------|----------|------------|
| 1 | **Relatório de Imóveis - [Contexto]** | Fundo Roxo, Texto Branco, Negrito, Centralizado, Mesclado |
| 2 | *(Linha Vazia)* | - |
| 3 | Gerado em: [Data/Hora], Total: [Nº] | - |
| 4 | *(Linha Vazia)* | - |
| 5 | **ID** | **Tipo** | **Endereço** | Fundo Cinza Escuro, Texto Branco, Negrito, Centralizado |
| 6 | Dados... | Dados... | Dados... | Fundo Padrão |
| 7 | Dados... | Dados... | Dados... | Fundo Cinza Claro (Zebra) |
| 8 | Dados... | Dados... | Dados... | Fundo Padrão |
| ... | ... | ... | ... | ... |

## 🚀 Otimizações e Melhorias
- **Hierarquia Visual**: O uso de cores cria uma distinção clara entre título, cabeçalhos e dados, melhorando a usabilidade do relatório.
- **Legibilidade Aprimorada**: O "zebra-striping" (linhas alternadas) reduz a fadiga visual e a chance de erros ao ler os dados.
- **Identidade de Marca**: As cores são consistentes com a UI da aplicação, criando uma experiência de marca coesa.
- **Manutenibilidade**: Os estilos são definidos em objetos separados, facilitando futuras alterações de design.

Este sistema de exportação agora produz relatórios que não são apenas funcionais, mas também esteticamente refinados e profissionais.
